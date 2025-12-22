function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        var action = e.parameter.action;
        var data = e.parameter.data ? JSON.parse(e.parameter.data) : null;

        // POST Body Parsing
        if (!action && e.postData && e.postData.contents) {
            try {
                var body = JSON.parse(e.postData.contents);
                if (body.action) action = body.action;
                if (body.data) data = body.data;
            } catch (z) { }
        }

        var result = {};
        if (action === 'login') result = loginUser(data);
        else if (action === 'getEmployees') result = getEmployees();
        else if (action === 'resetPassword') result = resetPassword(data);
        else if (action === 'register') result = registerUser(data); // 가입용
        else if (action === 'saveEvaluation') result = saveEvaluation(data);
        else result = { success: false, message: 'Invalid Action: ' + action };

        return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
    } finally { lock.releaseLock(); }
}

function loginUser(creds) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: false, message: '직원 명부를 찾을 수 없습니다.' };
    var rows = sheet.getDataRange().getValues();
    var name = String(creds.name).trim();
    var password = creds.password;

    for (var i = 1; i < rows.length; i++) {
        var sheetName = String(rows[i][0]).trim();
        if (sheetName == name) {
            var storedPw = rows[i][4];
            // 1. 비밀번호 일치 시 성공
            if (storedPw == password) {
                return { success: true, user: { name: rows[i][0], team: rows[i][1], position: rows[i][2], jobGroup: rows[i][3] } };
            }
            // 2. DB 비밀번호가 비어있으면 -> 현재 입력한 비밀번호로 자동 설정 및 로그인 성공
            else if (!storedPw || storedPw === "") {
                sheet.getRange(i + 1, 5).setValue(password);
                return { success: true, user: { name: rows[i][0], team: rows[i][1], position: rows[i][2], jobGroup: rows[i][3] }, message: '비밀번호가 등록되었습니다.' };
            }
            return { success: false, message: '비밀번호가 일치하지 않습니다.' }; // 한글 메시지 리턴
        }
    }
    return { success: false, message: '사용자를 찾을 수 없습니다.' }; // 한글 메시지 리턴
}
// ... 나머지 함수들 (기존과 동일하며 필요시 위 코드만 우선 적용해도 로그인 해결됨)