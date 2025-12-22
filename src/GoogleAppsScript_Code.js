function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);
    try {
        var action = e.parameter.action;
        var data = e.parameter.data ? JSON.parse(e.parameter.data) : null;

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
        else if (action === 'register') result = registerUser(data);
        else if (action === 'saveEvaluation') result = saveEvaluation(data);
        else if (action === 'getConfig') result = { success: true, data: {} };
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
            if (storedPw == password) {
                return { success: true, user: { name: rows[i][0], team: rows[i][1], position: rows[i][2], jobGroup: rows[i][3] } };
            }
            else if (!storedPw || storedPw === "") {
                sheet.getRange(i + 1, 5).setValue(password);
                return { success: true, user: { name: rows[i][0], team: rows[i][1], position: rows[i][2], jobGroup: rows[i][3] }, message: '비밀번호가 등록되었습니다.' };
            }
            return { success: false, message: '비밀번호가 일치하지 않습니다.' };
        }
    }
    return { success: false, message: '사용자를 찾을 수 없습니다.' };
}

function getEmployees() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: true, data: [] };
    var rows = sheet.getDataRange().getValues();
    var data = [];
    for (var i = 1; i < rows.length; i++) {
        data.push({ name: rows[i][0], team: rows[i][1], position: rows[i][2], jobGroup: rows[i][3] });
    }
    return { success: true, data: data };
}

function registerUser(userData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) { sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Employees"); sheet.appendRow(["Name", "Team", "Position", "JobGroup", "Password"]); }
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == userData.name && rows[i][1] == userData.team) {
            sheet.getRange(i + 1, 3).setValue(userData.position);
            sheet.getRange(i + 1, 4).setValue(userData.jobGroup);
            sheet.getRange(i + 1, 5).setValue(userData.password);
            return { success: true };
        }
    }
    sheet.appendRow([userData.name, userData.team, userData.position, userData.jobGroup, userData.password]);
    return { success: true };
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
    if (!sheet) { sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Employees"); }
    sheet.clear();
    sheet.appendRow(["Name", "Team", "Position", "JobGroup", "Password"]);
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        rows.push([data[i].name, data[i].team, data[i].position, data[i].jobGroup || '', data[i].password || '']);
    }
    if (rows.length > 0) { sheet.getRange(2, 1, rows.length, 5).setValues(rows); }
    return { success: true };
}

function saveEvaluation(evalData) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Evaluations");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Evaluations");
        sheet.appendRow(["Timestamp", "Type", "Evaluator", "Target", "Data_JSON"]);
        SpreadsheetApp.flush();
    }

    var data = sheet.getDataRange().getValues();
    var foundRowIndex = -1;

    // Normalize helper specifically for comparison
    var normalize = function (val) {
        var s = String(val || "").trim();
        return s.normalize ? s.normalize("NFC") : s;
    };

    var keyType = normalize(evalData.type);
    var keyEvaluator = normalize(evalData.evaluator);
    var keyTarget = normalize(evalData.target);

    // Check for existing evaluation (Skip header row 0)
    for (var i = 1; i < data.length; i++) {
        if (normalize(data[i][1]) === keyType &&
            normalize(data[i][2]) === keyEvaluator &&
            normalize(data[i][3]) === keyTarget) {
            foundRowIndex = i + 1; // 1-based index
            break;
        }
    }

    var timestamp = new Date();
    var jsonStr = JSON.stringify(evalData.data);

    if (foundRowIndex > 0) {
        // Update existing row
        sheet.getRange(foundRowIndex, 1).setValue(timestamp);
        sheet.getRange(foundRowIndex, 5).setValue(jsonStr);
        return { success: true, message: 'Evaluation updated' };
    } else {
        // Append new row
        sheet.appendRow([
            timestamp,
            evalData.type,
            evalData.evaluator,
            evalData.target,
            jsonStr
        ]);
        return { success: true, message: 'Evaluation saved' };
    }
}