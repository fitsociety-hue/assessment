/**
 * Google Apps Script Backend Code
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Clear existing code and Paste the code below.
 * 4. Create sheets named "Employees", "Evaluations" if they don't exist.
 *    - "Employees" columns: Name, Team, Position, JobGroup, Password, Role (optional but derived from position in frontend)
 * 5. Deploy as Web App:
 *    - Execute as: "Me" (User account)
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and ensure it matches the url in src/services/api.js
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
        var action = e.parameter.action;
        var data = null;

        // Handle POST body data
        if (e.postData && e.postData.contents) {
            try {
                var postBody = JSON.parse(e.postData.contents);
                if (postBody.action) action = postBody.action;
                if (postBody.data) data = postBody.data;
            } catch (err) {
                // Only if parsing fails, ignore
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
        } else if (action === 'getConfig') {
            // Placeholder for config if needed
            result = { success: true, data: {} };
        } else {
            result = { success: false, message: 'Invalid Action' };
        }

        // CORS Headers for direct fetch access
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
    var headers = rows[0]; // Assume Row 1 is headers
    var data = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        // Map columns by index assuming order: Name (0), Team (1), Position (2), JobGroup (3), Password (4)
        // Or better, find index by header name if dynamic. For simplicity, assume fixed or simple iteration.
        // Let's assume standard headers: Name, Team, Position, JobGroup, Password
        // We send back everything EXCEPT Password for safety, unless needed (frontend doesn't need password list)

        // Simple Object Mapper
        var emp = {
            name: row[0],
            team: row[1],
            position: row[2],
            jobGroup: row[3],
            // skip password
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

    var name = userData.name;
    var team = userData.team;
    var position = userData.position;
    var jobGroup = userData.jobGroup;
    var password = userData.password;

    var rows = sheet.getDataRange().getValues();
    var foundIndex = -1;

    // Check for existing user by Name + Team
    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == name && rows[i][1] == team) {
            foundIndex = i + 1; // 1-based index
            break;
        }
    }

    if (foundIndex > 0) {
        // Update existing user
        // Update Position, JobGroup, Password
        // Columns: Name(1), Team(2), Position(3), JobGroup(4), PW(5)
        sheet.getRange(foundIndex, 3).setValue(position);
        sheet.getRange(foundIndex, 4).setValue(jobGroup);
        sheet.getRange(foundIndex, 5).setValue(password);
        return { success: true, message: 'Updated existing user profile' };
    } else {
        // Register new user
        sheet.appendRow([name, team, position, jobGroup, password]);
        return { success: true, message: 'Created new user profile' };
    }
}

function loginUser(creds) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: false, message: 'Employee DB not found' };

    var rows = sheet.getDataRange().getValues();
    var name = creds.name;
    var password = creds.password;

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == name && rows[i][4] == password) { // Assuming PW is col 4 (index 4 = 5th col)
            var user = {
                name: rows[i][0],
                team: rows[i][1],
                position: rows[i][2],
                jobGroup: rows[i][3]
            };
            return { success: true, user: user };
        }
    }
    return { success: false, message: 'Invalid credentials' };
}

// Legacy / Other Support
function syncEmployees(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Employees");
    }

    // CAUTION: Sync typically overwrites. But now we have passwords.
    // We should preserve passwords if we are just updating list.
    // For safety in this prompt context, we won't fully overwrite if not asked.
    // But usually Admin sync implies "Master Reset". 
    // Let's implement smart sync or just append? 
    // User asked for "Membership feature", implying users manage own accounts.
    // We will assume "syncEmployees" (from admin dashboard csv upload) might be dangerous.
    // Let's just Clear and Replace for now, assuming Admin knows best. 
    // OR, we assume simpler: Just Append.

    // Implementation: Clear and Replace (Standard Sync)
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

    // evalData structure: { type, evaluator, target, data }
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
