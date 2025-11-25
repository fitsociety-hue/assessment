# 강동어울림복지관 직원 평가 앱

> 통합 근무평정 체계 웹 애플리케이션

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Google Sheets](https://img.shields.io/badge/database-Google%20Sheets-green.svg)](https://sheets.google.com)
[![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-orange.svg)](https://pages.github.com)

## 📱 프로젝트 소개

강동어울림복지관의 직원 평가를 위한 웹 기반 애플리케이션입니다. Google Sheets를 데이터베이스로 활용하여 별도의 서버 없이 간편하게 운영할 수 있습니다.

### 주요 기능

- ✍️ **자기평가**: 개인 목표 설정 및 자기진단
- 📈 **성과평가**: 양적/질적 목표 달성도 평가
- 🎯 **역량평가**: 직무역량 및 핵심역량 평가
- 👥 **다면평가**: 상사, 동료, 부하 평가
- 📋 **종합평가**: 최종 등급 산정 및 성과급 계산
- 📊 **대시보드**: 실시간 평가 현황 조회
- 👤 **직원 관리**: 관리자 전용 직원 정보 관리
- 📑 **리포트**: 다양한 통계 및 분석 자료

## 🚀 빠른 시작

### 1. 파일 다운로드

```bash
git clone https://github.com/YOUR_USERNAME/assessment-app.git
cd assessment-app
```

### 2. Google Sheets 설정

자세한 설정 방법은 **📘 [초보자용 설정 가이드](docs/SETUP_GUIDE.md)** 를 참조하세요.

#### 간단 요약:

1. Google Sheets에 새 스프레드시트 생성
2. 7개 시트 생성 (직원정보, 자기평가, 성과평가, 역량평가, 다면평가, 종합평가, 설정)
3. 각 시트에 헤더 입력 (가이드 참조)
4. Apps Script 코드 복사 및 배포 ([docs/AppsScript.js](docs/AppsScript.js))
5. `js/config.js` 파일에 Spreadsheet ID와 Apps Script URL 입력

### 3. 로컬 테스트

`index.html` 파일을 브라우저로 열어 테스트하세요.

**테스트 계정:**
- 관리자: ID `ADMIN` / PW `admin1234`
- 팀장: ID `EMP002` / PW `kim1234`
- 일반 직원: ID `EMP001` / PW `hong1234`

### 4. GitHub Pages 배포

1. GitHub 저장소 생성
2. 코드 푸시:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
3. Repository Settings → Pages → Source: `main` branch 선택
4. 배포 완료! (URL: `https://YOUR_USERNAME.github.io/assessment-app/`)

## 📁 프로젝트 구조

```
assessment-app/
├── index.html                 # 로그인 페이지
├── dashboard.html             # 대시보드
├── evaluation/                # 평가 페이지
│   ├── self.html             # 자기평가
│   ├── performance.html      # 성과평가
│   ├── competency.html       # 역량평가
│   ├── multifacet.html       # 다면평가
│   └── comprehensive.html    # 종합평가
├── admin/                     # 관리자 페이지
│   ├── employees.html        # 직원 관리
│   └── reports.html          # 리포트
├── css/
│   └── main.css              # 메인 스타일시트
├── js/
│   ├── config.js             # 설정 파일 ⚙️
│   ├── api.js                # Google Sheets API
│   ├── auth.js               # 인증 관리
│   ├── utils.js              # 유틸리티
│   └── modules/              # 평가 모듈
├── docs/
│   ├── SETUP_GUIDE.md        # 📘 설정 가이드
│   ├── USER_MANUAL.md        # 사용자 매뉴얼
│   └── AppsScript.js         # Apps Script 코드
└── README.md                  # 이 파일
```

## ⚙️설정

### config.js 파일 수정

`js/config.js` 파일을 열어 다음 항목을 수정하세요:

```javascript
const CONFIG = {
  // Google Spreadsheet ID (필수)
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  
  // Apps Script 웹앱 URL (권장)
  USE_APPS_SCRIPT: true,
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE',
  
  // 또는 Google API Key (대안)
  // USE_APPS_SCRIPT: false,
  // GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',
  
  // ...
};
```

## 💻 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Database**: Google Sheets API v4
- **Deployment**: GitHub Pages
- **Authentication**: Client-side (localStorage)
- **Styling**: Custom CSS (반응형)

## 🔒 보안 고려사항

1. **비밀번호**: 해시 처리하여 Google Sheets에 저장 (평문 저장 금지)
2. **API 키**: Apps Script 방식 사용 시 키 노출 없음
3. **권한**: 역할 기반 접근 제어 (admin/manager/staff)
4. **세션**: localStorage 기반, 24시간 만료

⚠️ **중요**: 실제 운영 환경에서는 HTTPS 필수

## 📖 문서

- **[초보자용 설정 가이드](docs/SETUP_GUIDE.md)**: Google Sheets 연동을 위한 단계별 가이드
- **[사용자 매뉴얼](docs/USER_MANUAL.md)**: 앱 사용법 및 평가 프로세스
- **[구현 계획서](C:\\Users\\user\\.gemini\\antigravity\\brain\\6f0fbc01-4983-4ede-a862-b7c14d77dd44\\implementation_plan.md)**: 기술적 설계 문서

## 🐛 문제 해결

### "Google Sheets 연결에 실패했습니다"

1. `config.js`의 `SPREADSHEET_ID`가 올바른지 확인
2. Apps Script URL 또는 API 키가 올바른지 확인
3. Google Sheets가 공유 설정되어 있는지 확인

### "로그인 실패"

1. "직원정보" 시트에 테스트 데이터가 있는지 확인
2. 비밀번호 해시가 올바른지 확인
3. 브라우저 콘솔(F12)에서 에러 확인

더 많은 문제 해결 방법은 **[설정 가이드](docs/SETUP_GUIDE.md#6-테스트-및-문제-해결)** 참조

## 🤝 기여

이 프로젝트는 강동어울림복지관 내부 사용을 위해 개발되었습니다.

## 📄 라이선스

MIT License

## 👥 개발자

개발 문의: 시스템 관리자

---

**© 2024 강동어울림복지관. All rights reserved.**
