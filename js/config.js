/**
 * Google Sheets 연동 설정 파일
 * 
 * 이 파일을 수정하여 Google Sheets와 연동하세요.
 * 자세한 설정 방법은 docs/SETUP_GUIDE.md를 참조하세요.
 */

const CONFIG = {
  // ============================================================
  // 1. Google Sheets 기본 정보
  // ============================================================

  VERSION: '20241125-04',

  /**
   * Google Spreadsheet ID
   * 스프레드시트 URL에서 추출: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
   * 예: '1abc123xyz456' 형식
   */
  SPREADSHEET_ID: '1I8_Ny4L49lI6E0o-n5QZzNKksvoUM0fJuBX-IzO2NJA',


  // ============================================================
  // 2. 연동 방식 선택 (둘 중 하나만 사용)
  // ============================================================

  /**
   * 방식 1: Google Apps Script 웹앱 사용 (권장)
   * - 장점: API 키 노출 없음, 서버 로직 처리 가능, 보안 우수
   * - 단점: 초기 설정이 약간 복잡
   * - 설정 방법: docs/SETUP_GUIDE.md 참조
   */
  USE_APPS_SCRIPT: true,
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzvot1PUrJsuBgqcrheCx-Vnk-AxqOH4SuKGi-xIB7iuPzotZagx0y_ppJvppO6gYxu/exec',

  /**
   * 방식 2: 클라이언트에서 직접 Google Sheets API 호출
   * - 장점: 설정 간단
   * - 단점: API 키가 소스코드에 노출됨 (읽기 전용 권한 필수)
   * - 설정 방법: docs/SETUP_GUIDE.md 참조
   */
  GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',

  // ============================================================
  // 3. Google Sheets 시트 이름 (스프레드시트 내 탭 이름)
  // ============================================================
  SHEET_NAMES: {
    EMPLOYEES: '직원정보',
    SELF_EVALUATION: '자기평가',
    PERFORMANCE: '성과평가',
    COMPETENCY: '역량평가',
    MULTIFACET: '다면평가',
    COMPREHENSIVE: '종합평가',
    SETTINGS: '설정'
  },


  // ============================================================
  // 4. 앱 설정
  // ============================================================

  /**
   * 평가 기간 설정
   */
  EVALUATION_PERIODS: [
    '2024-상반기',
    '2024-하반기',
    '2025-상반기',
    '2025-하반기'
  ],

  /**
   * 현재 평가 연도 (기본값)
   */
  CURRENT_YEAR: '2025',

  /**
   * 평가 등급 기준
   */
  GRADE_CRITERIA: {
    S: { min: 95, max: 100, label: '탁월', coefficient: 1.3 },
    A: { min: 85, max: 94, label: '우수', coefficient: 1.15 },
    B: { min: 70, max: 84, label: '양호', coefficient: 1.0 },
    C: { min: 60, max: 69, label: '보통', coefficient: 0.85 },
    D: { min: 0, max: 59, label: '미흡', coefficient: 0.7 }
  },

  /**
   * 점수 배점 (일반 직원)
   */
  SCORING: {
    PERFORMANCE: {
      QUANTITATIVE: 15,    // 양적 목표
      QUALITATIVE: 15,     // 질적 목표
      CONTRIBUTION: 10,    // 조직 기여도
      TOTAL: 40
    },
    COMPETENCY: {
      JOB: 20,            // 직무역량
      CORE: 20,           // 핵심역량
      TOTAL: 40
    },
    MULTIFACET: {
      SUPERVISOR: 10,     // 상사 평가
      PEER: 5,           // 동료 평가
      SELF: 5,           // 자기 평가
      TOTAL: 20
    },
    TOTAL: 100
  },

  /**
   * 관리자 점수 배점
   */
  SCORING_MANAGER: {
    PERFORMANCE: {
      TEAM_GOAL: 20,
      PERSONAL_GOAL: 20,
      CONTRIBUTION: 10,
      TOTAL: 50
    },
    COMPETENCY: {
      LEADERSHIP: 15,
      CORE: 15,
      TOTAL: 30
    },
    MULTIFACET: {
      SUPERVISOR: 8,
      PEER: 4,
      SUBORDINATE: 6,
      SELF: 2,
      TOTAL: 20
    },
    TOTAL: 100
  },


  // ============================================================
  // 5. 앱 동작 설정
  // ============================================================

  /**
   * 캐시 사용 여부 (성능 향상)
   */
  USE_CACHE: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5분 (밀리초)

  /**
   * 자동 저장 간격 (밀리초)
   */
  AUTO_SAVE_INTERVAL: 30 * 1000, // 30초

  /**
   * API 호출 재시도 설정
   */
  RETRY_CONFIG: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1초
    BACKOFF_MULTIPLIER: 2,
    TIMEOUT: 10000 // 10초
  },

  /**
   * 디버그 모드 (개발 시에만 true로 설정)
   */
  DEBUG: true,

  /**
   * 모의 데이터 사용 여부 (개발/테스트용)
   * Apps Script 연결이 없을 때도 로그인 테스트 가능
   */
  USE_MOCK_DATA: false,  // GitHub Pages 배포: 실제 Google Sheets 사용

  /**
   * API 타임아웃 (밀리초)
   */
  API_TIMEOUT: 10000, // 10초


  // ============================================================
  // 6. 조직 정보
  // ============================================================

  ORGANIZATION: {
    NAME: '강동어울림복지관',
    DEPARTMENTS: [
      '지역연계팀',
      '맞춤지원팀',
      '건강문화팀',
      '성장지원팀',
      '전략기획팀',
      '미래경영팀'
    ],
    POSITIONS: [
      '관장',
      '사무국장',
      '팀장',
      '팀원'
    ],
    JOB_TYPES: [
      '사회복지사',
      '수중운동사',
      '심리운동사',
      '특수교사',
      '회계',
      '서무',
      '영양사'
    ]
  },

  // ============================================================
  // 7. 모의 데이터 (개발/테스트용)
  // ============================================================

  /**
   * 테스트용 사용자 계정
   * USE_MOCK_DATA가 true일 때 사용됩니다.
   */
  MOCK_USERS: [
    {
      employee_id: 'ADMIN',
      password_hash: 'YWRtaW4xMjM0YXNzZXNzbWVudF9zYWx0XzIwMjQ=', // admin1234
      name: '시스템 관리자',
      department: '행정관리팀',
      position: '관장',
      role: 'admin',
      email: 'admin@dongul.or.kr'
    },
    {
      employee_id: 'EMP002',
      password_hash: 'a2ltMTIzNGFzc2Vzc21lbnRfc2FsdF8yMDI0', // kim1234
      name: '김팀장',
      department: '사회복지팀',
      position: '팀장(3급)',
      role: 'manager',
      email: 'kim@dongul.or.kr'
    },
    {
      employee_id: 'EMP001',
      password_hash: 'aG9uZzEyMzRhc3Nlc3NtZW50X3NhbHRfMjAyNA==', // hong1234
      name: '홍길동',
      department: '사회복지팀',
      position: '사원(5급)',
      role: 'staff',
      email: 'hong@dongul.or.kr'
    }
  ]
};

// CONFIG 객체를 다른 파일에서 사용할 수 있도록 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
