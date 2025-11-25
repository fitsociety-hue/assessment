/**
 * Google Sheets 초기화 스크립트
 * 
 * 사용 방법:
 * 1. 이 코드를 복사합니다.
 * 2. Google Sheets의 확장 프로그램 > Apps Script 메뉴로 이동합니다.
 * 3. 코드 에디터에 붙여넣습니다.
 * 4. setup() 함수를 실행합니다.
 */

function setup() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. 시트 생성 및 헤더 설정
    createSheet(ss, '직원정보', [
        'employee_id', 'name', 'department', 'position', 'role', 'hire_date', 'email', 'password_hash'
    ]);

    createSheet(ss, '자기평가', [
        'evaluation_id', 'employee_id', 'period',
        'goal_1', 'goal_1_target', 'goal_1_result', 'goal_1_achievement', 'goal_1_score',
        'goal_2', 'goal_2_target', 'goal_2_result', 'goal_2_achievement', 'goal_2_score',
        'goal_3', 'goal_3_target', 'goal_3_result', 'goal_3_achievement', 'goal_3_score',
        'future_goals', 'development_area', 'created_at', 'updated_at'
    ]);

    createSheet(ss, '성과평가', [
        'evaluation_id', 'employee_id', 'evaluator_id', 'period',
        'quantitative_workload', 'quantitative_achievement', 'quantitative_timeliness',
        'qualitative_accuracy', 'qualitative_creativity', 'qualitative_expertise', 'qualitative_satisfaction',
        'contribution_program', 'contribution_resources', 'contribution_organization', 'contribution_knowledge',
        'deduction_tardiness', 'deduction_absence',
        'total_score', 'comments', 'created_at', 'updated_at'
    ]);

    createSheet(ss, '역량평가', [
        'evaluation_id', 'employee_id', 'evaluator_id', 'period',
        'case_mgmt', 'program_planning', 'user_support', 'admin_doc',
        'communication', 'teamwork', 'problem_solving', 'self_development', 'responsibility',
        'leadership_vision', 'leadership_coaching', 'leadership_decision', 'leadership_change', 'leadership_management',
        'total_score', 'comments', 'created_at', 'updated_at'
    ]);

    createSheet(ss, '다면평가', [
        'evaluation_id', 'employee_id', 'evaluator_id', 'period', 'evaluator_type',
        'supervisor_attitude', 'supervisor_execution', 'supervisor_communication', 'supervisor_development',
        'peer_collaboration', 'peer_support', 'peer_kindness', 'peer_conflict',
        'subordinate_leadership', 'subordinate_fairness', 'subordinate_support', 'subordinate_communication',
        'self_goal_achievement', 'self_strengths', 'self_improvements',
        'total_score', 'created_at', 'updated_at'
    ]);

    createSheet(ss, '종합평가', [
        'evaluation_id', 'employee_id', 'period',
        'performance_score', 'competency_score', 'multifacet_score', 'total_score',
        'grade', 'grade_label', 'bonus_coefficient',
        'approved_by', 'approved_at', 'created_at', 'updated_at'
    ]);

    createSheet(ss, '설정', ['key', 'value', 'description']);

    // 2. 기본 데이터 추가
    addInitialData(ss);

    Logger.log('모든 시트가 성공적으로 생성되었습니다.');
}

function createSheet(ss, sheetName, headers) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
        sheet = ss.insertSheet(sheetName);
    } else {
        sheet.clear(); // 기존 데이터 삭제 (주의!)
    }

    // 헤더 설정
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // 헤더 스타일링
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4a90e2');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
}

function addInitialData(ss) {
    // 직원정보 샘플 데이터
    const employeeSheet = ss.getSheetByName('직원정보');
    if (employeeSheet.getLastRow() === 1) {
        employeeSheet.getRange(2, 1, 3, 8).setValues([
            ['EMP001', '홍길동', '사회복지팀', '4급', 'staff', '2020-03-15', 'hong@example.com', 'aG9uZzEyMzRhc3Nlc3NtZW50X3NhbHRfMjAyNA=='], // hong1234
            ['EMP002', '김관리', '행정관리팀', '3급', 'manager', '2018-01-10', 'kim@example.com', 'a2ltMTIzNGFzc2Vzc21lbnRfc2FsdF8yMDI0'], // kim1234
            ['ADMIN', '관리자', '운영지원팀', '관장', 'admin', '2015-05-01', 'admin@example.com', 'YWRtaW4xMjM0YXNzZXNzbWVudF9zYWx0XzIwMjQ='] // admin1234
        ]);
    }

    // 설정 기본 데이터
    const settingsSheet = ss.getSheetByName('설정');
    if (settingsSheet.getLastRow() === 1) {
        settingsSheet.getRange(2, 1, 2, 3).setValues([
            ['current_period', '2024-하반기', '현재 평가 기간'],
            ['evaluation_status', 'open', '평가 상태 (open/closed)']
        ]);
    }
}
