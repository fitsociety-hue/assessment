/**
 * Google Apps Script Backend Code
 * Latest Update: Enhanced Login & Password Reset
 */

function doGet(e) {
    return handleRequest(e);
}

function doPost(e) {
    return handleRequest(e);
}

function handleRequest(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var action = null;
        var data = null;

        if (e.parameter.action) action = e.parameter.action;
        if (e.parameter.data) {
            try {
                data = JSON.parse(e.parameter.data);
            } catch (err) {
                data = e.parameter.data;
            }
        }

        if (!action && e.postData && e.postData.contents) {
            try {
                var postBody = JSON.parse(e.postData.contents);
                if (postBody.action) action = postBody.action;
                if (postBody.data) data = postBody.data;
            } catch (err) {
            }
        }

        var result = {};

        if (action === 'getEmployees') {
            result = getEmployees();
        } else if (action === 'register') {
            result = registerUser(data);
        } else if (action === 'login') {
            result = loginUser(data);
        } else if (action === 'syncEmployees') {
            result = syncEmployees(data);
        } else if (action === 'saveEvaluation') {
            result = saveEvaluation(data);
        } else if (action === 'resetPassword') {
            result = resetPassword(data);
        } else if (action === 'getConfig') {
            result = { success: true, data: {} };
        } else {
            result = { success: false, message: 'Invalid Action: ' + action };
        }

        var output = ContentService.createTextOutput(JSON.stringify(result));
        output.setMimeType(ContentService.MimeType.JSON);
        return output;

    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// --- Data Functions ---

function getEmployees() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: true, data: [] };

    var rows = sheet.getDataRange().getValues();
    var data = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var emp = {
            name: row[0],
            team: row[1],
            position: row[2],
            jobGroup: row[3]
        };
        data.push(emp);
    }
    return { success: true, data: data };
}

function registerUser(userData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Employees");
        sheet.appendRow(["Name", "Team", "Position", "JobGroup", "Password"]);
    }

    if (!userData) return { success: false, message: 'No data provided' };

    var name = userData.name;
    var team = userData.team;
    var position = userData.position;
    var jobGroup = userData.jobGroup;
    var password = userData.password;

    var rows = sheet.getDataRange().getValues();
    var foundIndex = -1;

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == name && rows[i][1] == team) {
            foundIndex = i + 1;
            break;
        }
    }

    if (foundIndex > 0) {
        sheet.getRange(foundIndex, 3).setValue(position);
        sheet.getRange(foundIndex, 4).setValue(jobGroup);
        sheet.getRange(foundIndex, 5).setValue(password);
        return { success: true, message: 'Updated existing user profile' };
    } else {
        sheet.appendRow([name, team, position, jobGroup, password]);
        return { success: true, message: 'Created new user profile' };
    }
}

function loginUser(creds) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: false, message: 'Employee DB not found' };

    var rows = sheet.getDataRange().getValues();
    var name = String(creds.name).trim(); // 공백 제거
    var password = creds.password;

    for (var i = 1; i < rows.length; i++) {
        var sheetName = String(rows[i][0]).trim(); // 시트 데이터 공백 제거

        if (sheetName == name) {
            var storedPw = rows[i][4];

            // 비밀번호 일치 여부 확인
            if (storedPw == password) {
                var user = {
                    name: rows[i][0],
                    team: rows[i][1],
                    position: rows[i][2],
                    jobGroup: rows[i][3]
                };
                return { success: true, user: user };
            }
            // 비밀번호가 비어있을 경우 (최초 로그인) -> 자동 설정
            else if (!storedPw || storedPw === "") {
                sheet.getRange(i + 1, 5).setValue(password);
                var user = {
                    name: rows[i][0],
                    team: rows[i][1],
                    position: rows[i][2],
                    jobGroup: rows[i][3]
                };
                return { success: true, user: user, message: 'Password set successfully' };
            }
            else {
                return { success: false, message: '비밀번호가 일치하지 않습니다.' };
            }
        }
    }
    return { success: false, message: '사용자를 찾을 수 없습니다.' };
}

function resetPassword(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: false, message: 'Employee DB not found' };

    var rows = sheet.getDataRange().getValues();
    var name = data.name;
    var newPassword = data.newPassword;

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == name) {
            sheet.getRange(i + 1, 5).setValue(newPassword);
            return { success: true };
        }
    }
    return { success: false, message: 'User not found: ' + name };
}

function syncEmployees(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Employees");
    }
    sheet.clear();
    sheet.appendRow(["Name", "Team", "Position", "JobGroup", "Password"]);

    var rows = [];
    for (var i = 0; i < data.length; i++) {
        rows.push([data[i].name, data[i].team, data[i].position, data[i].jobGroup || '', data[i].password || '']);
    }
    if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 5).setValues(rows);
    }
    return { success: true };
}

function saveEvaluation(evalData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Evaluations");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Evaluations");
        sheet.appendRow(["Timestamp", "Type", "Evaluator", "Target", "Data_JSON"]);
    }

    var row = [
        new Date(),
        evalData.type,
        evalData.evaluator,
        evalData.target,
        JSON.stringify(evalData.data)
    ];
    sheet.appendRow(row);
    return { success: true };
}