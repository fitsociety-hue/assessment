/**
 * Google Apps Script for 강동어울림복지관 평가 시스템
 * 
 * ✅ 웹 앱 배포 시 "모든 사용자" 액세스로 설정하면 CORS 자동 지원
 * 
 * 배포 방법:
 * 1. Google Sheets에서 확장 프로그램 > Apps Script 열기
 * 2. 이 코드를 Code.gs에 붙여넣기
 * 3. 배포 > 배포 관리 > 수정 > 새 버전 > 배포
 * 4. 액세스 권한: "모든 사용자" ⚠️ 필수!
 */

// ============================================================
// 설정
// ============================================================

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')
    || SpreadsheetApp.getActiveSpreadsheet().getId();

// ============================================================
// 메인 진입점 (doGet/doPost)
// ============================================================

/**
 * GET 요청 핸들러
 */
/**
 * GET 요청 핸들러
 */
function doGet(e) {
    return createResponse(handleRequest(e));
}

/**
 * POST 요청 핸들러
 */
function doPost(e) {
    return createResponse(handleRequest(e));
}

/**
 * 응답 생성 헬퍼 (CORS 헤더 처리)
 */
function createResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
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

        // 1. 파라미터 우선순위 설정
        // GET 파라미터(e.parameter)와 POST 데이터(e.postData)를 모두 확인
        let requestData = {};

        // (1) GET 파라미터 병합
        if (e.parameter) {
            Object.assign(requestData, e.parameter);
        }

        // (2) POST 데이터 병합 (JSON 파싱)
        if (e.postData && e.postData.contents) {
            try {
                const postJson = JSON.parse(e.postData.contents);
                Object.assign(requestData, postJson);
            } catch (error) {
                Logger.log('JSON 파싱 오류 (무시됨): ' + error);
                // POST 데이터가 JSON이 아니더라도(text/plain 등) GET 파라미터가 있으면 진행
            }
        }

        // 액션 확인
        const action = requestData.action || 'ping';

        Logger.log('Action: ' + action);
        Logger.log('Request Data: ' + JSON.stringify(requestData));

        // 액션에 따라 처리
        let result;
        switch (action) {
            case 'ping':
                result = handlePing();
                break;
            case 'read':
                result = handleRead(requestData);
                break;
            case 'append':
                result = handleAppend(requestData);
                break;
            case 'update':
                result = handleUpdate(requestData);
                break;
            case 'delete':
                result = handleDelete(requestData);
                break;
            case 'register':
                result = handleRegister(requestData);
                break;
            default:
                result = {
                    status: 'error',
                    message: '알 수 없는 액션: ' + action
                };
        }

        return result;

    } catch (error) {
        Logger.log('오류 발생: ' + error);
        return {
            status: 'error',
            message: error.toString()
        };
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
        version: '2.0.1'
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

/**
 * 회원가입 처리
 */
function handleRegister(data) {
    const sheetName = '직원정보'; // CONFIG.SHEET_NAMES.EMPLOYEES
    const userData = data.userData;

    if (!userData || !userData.employeeId || !userData.password) {
        return {
            status: 'error',
            message: '필수 정보가 누락되었습니다.'
        };
    }

    try {
        const ss = SpreadsheetApp.openById(SHEET_ID);
        const sheet = ss.getSheetByName(sheetName);

        if (!sheet) {
            return {
                status: 'error',
                message: '직원정보 시트를 찾을 수 없습니다.'
            };
        }

        const range = sheet.getDataRange();
        const values = range.getValues();

        // 헤더 확인 (employee_id 컬럼 인덱스 찾기)
        const headers = values[0];
        const idIndex = headers.indexOf('employee_id');

        if (idIndex === -1) {
            return {
                status: 'error',
                message: 'employee_id 컬럼을 찾을 수 없습니다.'
            };
        }

        // 중복 가입 확인 (이름 + 부서 + 입사일)
        const nameIndex = headers.indexOf('name');
        const deptIndex = headers.indexOf('department');
        const joinDateIndex = headers.indexOf('join_date');

        if (nameIndex === -1 || deptIndex === -1 || joinDateIndex === -1) {
            // 컬럼이 없으면 ID 중복만 체크 (하위 호환성)
            for (let i = 1; i < values.length; i++) {
                if (values[i][idIndex] === userData.employeeId) {
                    return {
                        status: 'error',
                        message: '이미 존재하는 아이디입니다.'
                    };
                }
            }
        } else {
            for (let i = 1; i < values.length; i++) {
                const row = values[i];
                // 이름, 부서, 입사일이 모두 일치하면 중복으로 간주
                if (row[nameIndex] === userData.name &&
                    row[deptIndex] === userData.department &&
                    row[joinDateIndex] === userData.joinDate) {
                    return {
                        status: 'error',
                        message: '이미 가입된 사용자입니다. (이름, 부서, 입사일 중복)'
                    };
                }

                // ID 중복도 체크 (혹시 모를 충돌 방지)
                if (row[idIndex] === userData.employeeId) {
                    return {
                        status: 'error',
                        message: '이미 존재하는 아이디입니다.'
                    };
                }
            }
        }

        // 새 직원 데이터 행 생성
        // 헤더 순서에 맞게 데이터 정렬
        const newRow = headers.map(header => {
            switch (header) {
                case 'employee_id': return userData.employeeId;
                case 'password_hash': return userData.password; // 클라이언트에서 해시된 값
                case 'name': return userData.name;
                case 'department': return userData.department;
                case 'position': return userData.position;
                case 'role': return 'staff'; // 기본값
                case 'email': return ''; // 이메일은 선택사항
                case 'join_date': return userData.joinDate;
                case 'job_type': return userData.jobType;
                default: return '';
            }
        });

        sheet.appendRow(newRow);

        return {
            status: 'ok',
            message: '회원가입이 완료되었습니다.'
        };

    } catch (error) {
        return {
            status: 'error',
            message: '회원가입 처리 실패: ' + error.toString()
        };
    }
}
