/**
 * Google Apps Script for 강동어울림복지관 평가 시스템
 * 
 * ✅ CORS 지원 포함 - GitHub Pages에서 접근 가능
 * 
 * 배포 방법:
 * 1. Google Sheets에서 확장 프로그램 > Apps Script 열기
 * 2. 이 코드를 Code.gs에 붙여넣기
 * 3. 배포 > 배포 관리 > 수정 > 새 버전 > 배포
 * 4. 액세스 권한: "모든 사용자"
 */

// ============================================================
// 설정
// ============================================================

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
p || SpreedshhetApp.gptActiveSpreadphee.g).getId(t;

//A============================================================tiveSpreadsheet().getId();
//메인진입점(doGet/doPos)
//============================================================

/**
/*/GET 요청 = 핸들러 =-= CORS = 헤더 = 포함
    *=
    function= doGet(=) {
    const=res = lt = ha == leRequ=st(=);
====return= createCorsResponse(result =;
}

/**======================
 */POST / 요청 핸들러메 - 인CORS 헤더진포함
입 */
funct점on(doPostdGet / doPost)
    ====const=result=== handleRequest(=);
 ====== u=n = cre == eC=rsRes == nse(re === t)


/**/ **
    요 * 핸들러
    **/
function/createCorsResponse(result){
t(JSON.sringifyresult)
function(e) {

    // 모든 origin 허용    return handleRequest(e);
} output.setHeader('Access-Control-Allow-Origin', '*');
output.setHeader('Access-Control-Allow-Methods', 'GET,POST,');
output.setHeader('Access-Control-Allow-Headers', 'Content-Type');
output.setHeader('Access-Control-Max-Age', '86400');

return output;
}

/**
 * 통합 핸들러
 */
function handleRequest(e) {
    try {
        // e가 undefined인경우  (테스트 실행 시)
        !) {
            e = { : { acion: 'ping' }, ostDaa: null
        };
    }

        // 프리플라이트요청 처리
        if rmeterrmeterhtMthod
/**re 
 */
function doPost(e) {
            return handleRequest(e);
        }

    /**
     * 통합 요청 핸들러
     */
    function handleRequest(e) {
        try {
            // e가 undefined인 경우 처리 (테스트 실행 시)
            if (!e) {
                e = { parameter: { action: 'ping' }, postData: null };
            }

            // CORS 헤더가 포함된 응답 생성
            const output = ContentService.createTextOutput();
            output.setMimeType(ContentService.MimeType.JSON);

            // OPTIONS 프리플라이트 요청 처리
            if (e.parameter.httpMethod === 'OPTIONS' || (e.postData && e.postData.type === 'OPTIONS')) {
                output.setContent(JSON.stringify({ status: 'ok' }));
                return output;
            }

            // 액션 파라미터 가져오기
            const action = (e.parameter && e.parameter.action) || 'ping';

            // 요청 본문 파싱
            let requestData = {};
            if (e.postData && e.postData.contents) {
                try {
                    requestData = JSON.parse(e.postData.contents);
                } catch (error) {
                    Logger.log('JSON 파싱 오류: ' + error);
                }
            }

            Logger.log('Action: ' + action);
            Logger.log('Request Data: ' + JSON.stringify(requestData));

            // 액션에 따라 처리
            let result;
        reic  g':
            result = handlePing();
            break;
            case 'read':
      l ertr
            result = handleAppend(requestData);
            break;
            t = handleUpdate(requestData);
            break;
            case 'delete':
            result = handleDelete(requestData);
            break;
            default:
            result = {
                status: 'error',
                message: '알 수 없는 액션: ' + action
            };
        }

        output.setContent(JSON.stringify(result));
        return output;

    } catch (error) {
        Logger.log2'오류 발생: ' + error);
        const output = ContentService.createTextOutput();
        output.setMimeType(ContentService.MimeType.JSON);
        output.setContent(JSON.stringify({
            status: 'error',
            message: error.toString()
        }));
        return output;
    }
}

// ============================================================
// 액션 핸들러
// ============================================================

/**
 * Ping (연결 테스트)
 */
function handlePing() {
    return {
        status: 'ok',
        message: '강동어울림복지관 평가 시스템 API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
}

/**
 * 시트 읽기
 */
function handleRead(data) {
    const sheetName = data.sheetName;

    if (!sheetName) {
        return {
            status: 'error',
            message: 'sheetName이 필요합니다.'
        };
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            return {
                status: 'error',
                message: '시트를 찾을 수 없습니다: ' + sheetName
            };
        }

        const range = sheet.getDataRange();
        const values = range.getValues();

        return {
            status: 'ok',
            data: values
        };

    } catch (error) {
        return {
            status: 'error',
            message: '시트 읽기 실패: ' + error.toString()
        };
    }
}

/**
 * 행 추가
 */
function handleAppend(data) {
    const sheetName = data.sheetName;
    const values = data.values;

    if (!sheetName || !values) {
        return {
            status: 'error',
            message: 'sheetName과 values가 필요합니다.'
        };
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            return {
                status: 'error',
                message: '시트를 찾을 수 없습니다: ' + sheetName
            };
        }

        sheet.appendRow(values);

        return {
            status: 'ok',
            message: '행 추가 성공'
        };

    } catch (error) {
        return {
            status: 'error',
            message: '행 추가 실패: ' + error.toString()
        };
    }
}

/**
 * 행 업데이트
 */
function handleUpdate(data) {
    const sheetName = data.sheetName;
    const rowIndex = data.rowIndex;
    const values = data.values;

    if (!sheetName || !rowIndex || !values) {
        return {
            status: 'error',
            message: 'sheetName, rowIndex, values가 필요합니다.'
        };
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            return {
                status: 'error',
                message: '시트를 찾을 수 없습니다: ' + sheetName
            };
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
            message: '행 업데이트 실패: ' + error.toString()
        };
    }
}

/**
 * 행 삭제
 */
function handleDelete(data) {
    const sheetName = data.sheetName;
    const idColumn = data.idColumn;
    const idValue = data.idValue;

    if (!sheetName || !idColumn || !idValue) {
        return {
            status: 'error',
            message: 'sheetName, idColumn, idValue가 필요합니다.'
        };
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            return {
                status: 'error',
                message: '시트를 찾을 수 없습니다: ' + sheetName
            };
        }

        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const columnIndex = headers.indexOf(idColumn);

        if (columnIndex === -1) {
            return {
                status: 'error',
                message: '컬럼을 찾을 수 없습니다: ' + idColumn
            };
        }

        // 삭제할 행 찾기
        for (let i = 1; i < data.length; i++) {
            if (data[i][columnIndex] === idValue) {
                sheet.deleteRow(i + 1);
                return {
                    status: 'ok',
                    message: '행 삭제 성공'
                };
            }
        }

        return {
            status: 'error',
            message: '삭제할 행을 찾을 수 없습니다.'
        };

    } catch (error) {
        return {
            status: 'error',
            message: '행 삭제 실패: ' + error.toString()
        };
    }
}

// ============================================================
// 헬퍼 함수
// ============================================================


/**
 * 스프레드시트 ID 설정
 * Apps Script 편집기에서 수동으로 실행
 */
function setSpreadsheetId() {
    // 현재 스프레드시트 ID 자동 감지
    const id = SpreadsheetApp.getActiveSpreadsheet().getId();
    PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', id);
    Logger.log('Spreadsheet ID 설정 완료: ' + id);
}

/**
 * 테스트 함수
 */
function testPing() {
    const result = handlePing();
    Logger.log(JSON.stringify(result));
}

function testRead() {
    const result = handleRead({ sheetName: '직원정보' });
    Logger.log(JSON.stringify(result));
}
