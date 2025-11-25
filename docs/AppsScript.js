/**
 * Google Apps Script 웹앱 코드
 * 
 * 이 코드를 Google Sheets의 Apps Script 에디터에 복사하세요.
 * 설정 방법: docs/SETUP_GUIDE.md 참조
 */

// ============================================================
// 웹앱 진입점
// ============================================================

/**
 * GET 요청 처리
 */
function doGet(e) {
    return ContentService.createTextOutput(JSON.stringify({
        status: 'ok',
        message: '강동어울림복지관 평가 시스템 API'
    })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST 요청 처리
 */
function doPost(e) {
    try {
        const params = JSON.parse(e.postData.contents);
        const action = e.parameter.action || params.action;

        let result;

        switch (action) {
            case 'ping':
                result = { status: 'ok', message: '연결 성공' };
                break;

            case 'read':
                result = readSheet(params.sheetName);
                break;

            case 'append':
                result = appendRow(params.sheetName, params.values);
                break;

            case 'update':
                result = updateRow(params.sheetName, params.rowIndex, params.values);
                break;

            case 'delete':
                result = deleteRow(params.sheetName, params.idColumn, params.idValue);
                break;

            default:
                result = { status: 'error', message: '알 수 없는 액션: ' + action };
        }

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: 'error',
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================================
// 시트 작업 함수
// ============================================================

/**
 * 시트 읽기
 */
function readSheet(sheetName) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
        }

        const data = sheet.getDataRange().getValues();

        return {
            status: 'ok',
            data: data
        };

    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

/**
 * 행 추가
 */
function appendRow(sheetName, values) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
        }

        sheet.appendRow(values);

        return {
            status: 'ok',
            message: '행 추가 성공'
        };

    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

/**
 * 행 업데이트
 */
function updateRow(sheetName, rowIndex, values) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
        }

        const range = sheet.getRange(rowIndex, 1, 1, values.length);
        range.setValues([values]);

        return {
            status: 'ok',
            message: '행 업데이트 성공'
        };

    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

/**
 * 행 삭제
 */
function deleteRow(sheetName, idColumn, idValue) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
        if (!sheet) {
            throw new Error('시트를 찾을 수 없습니다: ' + sheetName);
        }

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const columnIndex = headers.indexOf(idColumn);

        if (columnIndex === -1) {
            throw new Error('컬럼을 찾을 수 없습니다: ' + idColumn);
        }

        // 해당 행 찾기
        for (let i = 1; i < data.length; i++) {
            if (data[i][columnIndex] === idValue) {
                sheet.deleteRow(i + 1); // 1-based index
                return {
                    status: 'ok',
                    message: '행 삭제 성공'
                };
            }
        }

        throw new Error('행을 찾을 수 없습니다');

    } catch (error) {
        return {
            status: 'error',
            message: error.toString()
        };
    }
}

// ============================================================
// 헬퍼 함수
// ============================================================

/**
 * 현재 타임스탬프
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * 고유 ID 생성
 */
function generateId(prefix) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return prefix + timestamp + random;
}
