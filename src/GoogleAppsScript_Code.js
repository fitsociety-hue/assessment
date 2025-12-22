/**
 * Google Apps Script Backend Code
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Clear existing code and Paste the code below.
 * 4. Create sheets named "Employees", "Evaluations" if they don't exist.
 *    - "Employees" columns: Name, Team, Position, JobGroup, Password
 * 5. Deploy as Web App:
 *    - Execute as: "Me" (User account)
 *    - Who has access: "Anyone" (Anonymous) -> CRITICAL for CORS to work without auth headers.
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
        var action = null;
        var data = null;

        // 1. Try to get data from URL parameters (GET or POST x-www-form-urlencoded)
        if (e.parameter.action) action = e.parameter.action;
        if (e.parameter.data) {
            try {
                data = JSON.parse(e.parameter.data);
            } catch (err) {
                data = e.parameter.data;
            }
        }

        // 2. If not found, try to parse JSON Body (POST text/plain or application/json)
        if (!action && e.postData && e.postData.contents) {
            try {
                var postBody = JSON.parse(e.postData.contents);
                if (postBody.action) action = postBody.action;
                if (postBody.data) data = postBody.data;
            } catch (err) {
                // Ignore parsing errors for body if parameters were present
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

        // Return JSON with CORS support
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
    // Assume headers in Row 1. Data starts Row 2.
    var data = [];

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        // Map columns: 0:Name, 1:Team, 2:Position, 3:JobGroup, 4:Password
        var emp = {
            name: row[0],
            team: row[1],
            position: row[2],
            jobGroup: row[3]
            // Password not returned
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

    // Ensure data exists
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
        // Update
        sheet.getRange(foundIndex, 3).setValue(position); // Col 3: Position
        sheet.getRange(foundIndex, 4).setValue(jobGroup); // Col 4: JobGroup
        sheet.getRange(foundIndex, 5).setValue(password); // Col 5: Password
        return { success: true, message: 'Updated existing user profile' };
    } else {
        // Create
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
        if (rows[i][0] == name) {
            // Check if password matches
            if (rows[i][4] == password) {
                var user = {
                    name: rows[i][0],
                    team: rows[i][1],
                    position: rows[i][2],
                    jobGroup: rows[i][3]
                };
                return { success: true, user: user };
            }
            // Check if password Is Empty (First Time Login / Auto-Sync)
            else if (rows[i][4] === "" || rows[i][4] === undefined) {
                // Set the password to the provided hash
                sheet.getRange(i + 1, 5).setValue(password);
                var user = {
                    name: rows[i][0],
                    team: rows[i][1],
                    position: rows[i][2],
                    jobGroup: rows[i][3]
                };
                return { success: true, user: user, message: 'Password set successfully' };
            }
        }
    }
    return { success: false, message: 'Invalid credentials' };
}

function resetPassword(data) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Employees");
    if (!sheet) return { success: false, message: 'Employee DB not found' };

    var rows = sheet.getDataRange().getValues();
    var name = data.name;
    var newPassword = data.newPassword;

    // Find user by name (assume unique name or enforce uniqueness in app)
    // Ideally we match Team too, but Admin might only know Name. 
    // We'll iterate.

    for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == name) {
            // Found
            sheet.getRange(i + 1, 5).setValue(newPassword); // Update Col 5: Password
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
