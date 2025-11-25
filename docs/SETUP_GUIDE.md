# Google Sheets 연동 설정 가이드

이 가이드는 **초보자도 쉽게** 따라할 수 있도록 작성되었습니다. 스크린샷과 함께 단계별로 설명합니다.

---

## 📋 목차

1. [준비물](#1-준비물)
2. [Google Sheets 생성 및 설정](#2-google-sheets-생성-및-설정)
3. [방법 1: Google Apps Script 연동 (권장)](#3-방법-1-google-apps-script-연동-권장)
4. [방법 2: Google Sheets API 직접 연동](#4-방법-2-google-sheets-api-직접-연동)
5. [앱 설정 파일 수정](#5-앱-설정-파일-수정)
6. [테스트 및 문제 해결](#6-테스트-및-문제-해결)

---

## 1. 준비물

- Google 계정
- 웹 브라우저 (Chrome 권장)
- 텍스트 에디터 (메모장, VS Code 등)
- 이 앱의 파일들

---

## 2. Google Sheets 생성 및 설정

### 2.1 새 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. **+ 새로 만들기** 클릭
3. 스프레드시트 이름을 **"강동어울림복지관_평가시스템"** 으로 변경

### 2.2 시트 구조 만들기

총 **7개의 시트(탭)**를 만들어야 합니다. 아래 순서대로 따라하세요.

#### ① 직원정보 시트

1. 첫 번째 시트 이름을 **"직원정보"** 로 변경
2. 첫 번째 행에 아래 항목을 입력 (헤더):

```
employee_id | name | department | position | role | hire_date | email | password_hash
```

**예시 데이터** (테스트용):
```
EMP001 | 홍길동 | 사회복지팀 | 4급 | staff | 2020-03-15 | hong@example.com | aG9uZzEyMzRhc3Nlc3NtZW50X3NhbHRfMjAyNA==
EMP002 | 김관리 | 행정관리팀 | 3급 | manager | 2018-01-10 | kim@example.com | a2ltMTIzNGFzc2Vzc21lbnRfc2FsdF8yMDI0
ADMIN | 관리자 | 운영지원팀 | 관장 | admin | 2015-05-01 | admin@example.com | YWRtaW4xMjM0YXNzZXNzbWVudF9zYWx0XzIwMjQ=
```

> **비밀번호 안내**:
> - EMP001 비밀번호: `hong1234`
> - EMP002 비밀번호: `kim1234`
> - ADMIN 비밀번호: `admin1234`
> - (테스트 후 반드시 변경하세요!)

#### ② 자기평가 시트

1. 하단의 **+** 버튼 클릭하여 새 시트 추가
2. 시트 이름을 **"자기평가"** 로 변경
3. 첫 번째 행에 헤더 입력:

```
evaluation_id | employee_id | period | goal_1 | goal_1_target | goal_1_result | goal_1_achievement | goal_1_score | goal_2 | goal_2_target | goal_2_result | goal_2_achievement | goal_2_score | goal_3 | goal_3_target | goal_3_result | goal_3_achievement | goal_3_score | future_goals | development_area | created_at | updated_at
```

#### ③ 성과평가 시트

1. 새 시트 추가
2. 시트 이름을 **"성과평가"** 로 변경
3. 헤더 입력:

```
evaluation_id | employee_id | evaluator_id | period | quantitative_workload | quantitative_achievement | quantitative_timeliness | qualitative_accuracy | qualitative_creativity | qualitative_expertise | qualitative_satisfaction | contribution_program | contribution_resources | contribution_organization | contribution_knowledge | deduction_tardiness | deduction_absence | total_score | comments | created_at | updated_at
```

#### ④ 역량평가 시트

1. 새 시트 추가
2. 시트 이름을 **"역량평가"** 로 변경
3. 헤더 입력:

```
evaluation_id | employee_id | evaluator_id | period | case_mgmt | program_planning | user_support | admin_doc | communication | teamwork | problem_solving | self_development | responsibility | leadership_vision | leadership_coaching | leadership_decision | leadership_change | leadership_management | total_score | comments | created_at | updated_at
```

#### ⑤ 다면평가 시트

1. 새 시트 추가
2. 시트 이름을 **"다면평가"** 로 변경
3. 헤더 입력:

```
evaluation_id | employee_id | evaluator_id | period | evaluator_type | supervisor_attitude | supervisor_execution | supervisor_communication | supervisor_development | peer_collaboration | peer_support | peer_kindness | peer_conflict | subordinate_leadership | subordinate_fairness | subordinate_support | subordinate_communication | self_goal_achievement | self_strengths | self_improvements | total_score | created_at | updated_at
```

#### ⑥ 종합평가 시트

1. 새 시트 추가
2. 시트 이름을 **"종합평가"** 로 변경
3. 헤더 입력:

```
evaluation_id | employee_id | period | performance_score | competency_score | multifacet_score | total_score | grade | grade_label | bonus_coefficient | approved_by | approved_at | created_at | updated_at
```

#### ⑦ 설정 시트

1. 새 시트 추가
2. 시트 이름을 **"설정"** 로 변경
3. 헤더 입력:

```
key | value | description
```

**기본 설정 데이터**:
```
current_period | 2024-하반기 | 현재 평가 기간
evaluation_status | open | 평가 상태 (open/closed)
```

### 2.3 Spreadsheet ID 복사

1. 스프레드시트 URL을 확인하세요:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

2. **SPREADSHEET_ID** 부분을 복사하세요
   - 예: `1abc123xyz456def789ghi012jkl345mno678pqr901stu234`
   - 이 ID는 나중에 사용됩니다!

---

## 3. 방법 1: Google Apps Script 연동 (권장)

### 3.1 Apps Script 에디터 열기

1. Google Sheets에서 **확장 프로그램** → **Apps Script** 클릭
2. 새 탭에서 Apps Script 에디터가 열립니다

### 3.2 코드 복사

1. 기존의 `function myFunction() {}` 코드를 모두 삭제
2. `docs/AppsScript.js` 파일의 내용을 **전체 복사**
3. Apps Script 에디터에 **붙여넣기**
4. **Ctrl + S** (저장) 누르기
5. 프로젝트 이름을 **"평가시스템 API"** 로 입력

### 3.3 웹앱으로 배포

1. 상단의 **배포** 버튼 클릭 → **새 배포** 선택
2. 배포 설정:
   - **유형 선택**: ⚙️ 버튼 클릭 → **웹 앱** 선택
   - **설명**: "평가 시스템 API v1" 입력
   - **다음 권한으로 실행**: **나** 선택
   - **액세스 권한**: **모든 사용자** 선택
3. **배포** 버튼 클릭
4. **액세스 승인** 클릭
5. Google 계정 선택
6. **고급** → **평가시스템 API(안전하지 않음)로 이동** 클릭
7. **허용** 클릭

### 3.4 웹앱 URL 복사

배포가 완료되면 **웹 앱 URL**이 표시됩니다:

```
https://script.google.com/macros/s/AKfycby.../exec
```

이URL을 **반드시 복사**하세요! (나중에 config.js에 입력)

### 3.5 연결 테스트

1. 복사한 URL을 웹 브라우저 주소창에 붙여넣기
2. 아래와 같은 메시지가 표시되면 성공:
   ```json
   {"status":"ok","message":"강동어울림복지관 평가 시스템 API"}
   ```

---

## 4. 방법 2: Google Sheets API 직접 연동

> **⚠️ 주의**: 이 방법은 API 키가 소스코드에 노출됩니다.  
> 가능하면 **방법 1 (Apps Script)**을 사용하세요.

### 4.1 Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. **새 프로젝트 만들기** 클릭
   - 프로젝트 이름: "강동어울림복지관-평가시스템"
   - **만들기** 클릭
3. 프로젝트가 생성되면 자동으로 선택됩니다

### 4.2 Google Sheets API 활성화

1. 왼쪽 메뉴에서 **API 및 서비스** → **라이브러리** 클릭
2. 검색창에 **"Google Sheets API"** 입력
3. **Google Sheets API** 클릭
4. **사용 설정** 버튼 클릭

### 4.3 API 키 생성

1. 왼쪽 메뉴에서 **사용자 인증 정보** 클릭
2. 상단의 **+ 사용자 인증 정보 만들기** → **API 키** 선택
3. API 키가 생성됩니다 (복사하세요!)
4. **키 제한** 버튼 클릭 (보안 강화)
5. **API 제한사항**:
   - **API 제한** 선택
   - **Google Sheets API** 체크
6. **저장** 클릭

### 4.4 스프레드시트 공유 설정

1. Google Sheets로 돌아가기
2. 우측 상단의 **공유** 버튼 클릭
3. **일반 액세스**:
   - **제한됨** → **링크가 있는 모든 사용자** 변경
   - 권한: **보기 권한** 선택 (중요!)
4. **완료** 클릭

---

## 5. 앱 설정 파일 수정

### 5.1 config.js 파일 열기

텍스트 에디터로 `js/config.js` 파일을 엽니다.

### 5.2 설정 수정

#### 방법 1 (Apps Script) 사용 시:

```javascript
const CONFIG = {
  // Spreadsheet ID 입력
  SPREADSHEET_ID: '1abc123xyz456def789ghi012jkl345mno678pqr901stu234', // 여기에 복사한 ID 붙여넣기
  
  // Apps Script 사용
  USE_APPS_SCRIPT: true,
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby.../exec', // 여기에 웹앱 URL 붙여넣기
  
  // API 키는 사용하지 않음
  GOOGLE_API_KEY: '',
  
  // 나머지는 그대로 유지...
};
```

#### 방법 2 (직접 API) 사용 시:

```javascript
const CONFIG = {
  // Spreadsheet ID 입력
  SPREADSHEET_ID: '1abc123xyz456def789ghi012jkl345mno678pqr901stu234', // 여기에 복사한 ID 붙여넣기
  
  // Apps Script 사용 안 함
  USE_APPS_SCRIPT: false,
  APPS_SCRIPT_URL: '',
  
  // API 키 입력
  GOOGLE_API_KEY: 'AIzaSyABC123XYZ456...', // 여기에 API 키 붙여넣기
  
  // 나머지는 그대로 유지...
};
```

### 5.3 파일 저장

- **Ctrl + S** 또는 **파일 → 저장** 클릭

---

## 6. 테스트 및 문제 해결

### 6.1 로컬 테스트

1. `index.html` 파일을 웹 브라우저로 열기
   - 파일을 더블클릭하거나
   - 브라우저로 드래그&드롭

2. 테스트 계정으로 로그인:
   - **직원 ID**: `ADMIN`
   - **비밀번호**: `admin1234`

3. 로그인이 성공하면 설정 완료!

### 6.2 흔한 문제 해결

#### ❌ "Google Sheets 연결에 실패했습니다"

**원인**: config.js 설정이 잘못되었습니다.

**해결**:
1. Spreadsheet ID가 정확한지 확인
2. Apps Script URL 또는 API 키가 올바른지 확인
3. `USE_APPS_SCRIPT` 설정이 맞는지 확인

#### ❌ "CORS 에러"

**원인**: 직접 API 방식에서 발생할 수 있습니다.

**해결**:
1. Apps Script 방식으로 변경 (권장)
2. 또는 로컬 웹 서버 사용:
   ```bash
   # Python이 설치되어 있다면:
   python -m http.server 8000
   # 그리고 http://localhost:8000 접속
   ```

#### ❌ "시트를 찾을 수 없습니다"

**원인**: 시트 이름이 config.js와 다릅니다.

**해결**:
1. Google Sheets에서 시트 이름 확인
2. config.js의 `SHEET_NAMES`와 일치하는지 확인
3. 띄어쓰기, 대소문자도 정확히 일치해야 합니다

#### ❌ "로그인 실패"

**원인**: 비밀번호가 맞지 않거나 직원 데이터가 없습니다.

**해결**:
1. "직원정보" 시트에 테스트 데이터가 있는지 확인
2. 비밀번호 해시가 올바른지 확인
3. 브라우저 콘솔(F12)에서 에러 메시지 확인

### 6.3 디버그 모드

문제가 계속되면 디버그 모드를 켜세요:

```javascript
// config.js
DEBUG: true  // 이미 true로 되어 있음
```

그리고 브라우저 개발자 도구를 엽니다:
- Windows: **F12** 또는 **Ctrl + Shift + I**
- Mac: **Cmd + Option + I**

**Console** 탭에서 상세한 로그를 확인할 수 있습니다.

### 6.4 도움 받기

문제가 해결되지 않으면:

1. 브라우저 콘솔의 에러 메시지 캡처
2. config.js 설정 확인 (비밀번호/API 키 제외)
3. 개발자에게 문의

---

## 📚 추가 자료

### Google Sheets 템플릿 복사

직접 시트를 만들기 어렵다면:

1. [템플릿 스프레드시트](링크) 열기 (관리자가 제공)
2. **파일** → **사본 만들기** 클릭
3. 내 Google Drive에 복사됨
4. 위의 **2.3 Spreadsheet ID 복사**부터 진행

### 비밀번호 해시 생성기

새 직원을 추가할 때 비밀번호 해시가 필요합니다.

1. 브라우저에서 `index.html` 열기
2. 개발자 도구(F12) 열기
3. Console 탭에서 다음 명령 실행:

```javascript
btoa('원하는비밀번호' + 'assessment_salt_2024')
```

4. 출력된 해시 값을 복사하여 Google Sheets에 붙여넣기

---

## ✅ 설정 완료 체크리스트

- [ ] Google Sheets 생성
- [ ] 7개 시트 만들기 (직원정보, 자기평가, 성과평가, 역량평가, 다면평가, 종합평가, 설정)
- [ ] 각 시트에 헤더 입력
- [ ] 테스트 직원 데이터 입력
- [ ] Spreadsheet ID 복사
- [ ] Apps Script 코드 복사 및 배포 (방법 1) 또는 API 키 생성 (방법 2)
- [ ] config.js 수정
- [ ] 로컬 테스트 성공

모든 항목이 체크되면 설정 완료입니다! 🎉

---

## 다음 단계

설정이 완료되면:

1. [사용자 매뉴얼](USER_MANUAL.md) 참조
2. 평가 프로세스 시작
3. 필요시 관리자 계정으로 직원 추가

문의사항이 있으면 시스템 관리자에게 연락하세요.
