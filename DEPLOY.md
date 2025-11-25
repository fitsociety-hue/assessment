# GitHub Pages 배포 가이드

## 📦 완료된 작업

✅ **모든 파일 작성 완료**
- 18개 파일, 5,351줄의 코드
- Google Sheets 완전 연동
- 5개 평가 모듈 + 2개 관리자 페이지

✅ **Git 저장소 초기화 완료**
```bash
✓ git init
✓ git add .
✓ git commit -m "Initial commit: 강동어울림복지관 직원 평가 앱"
✓ git branch -M main
✓ git remote add origin https://github.com/fitsociety-hue/assessment.git
```

## 🚀 GitHub에 Push하는 방법

### Option 1: 명령줄 사용 (권장)

1. **GitHub 인증 설정**
   
   Windows에서 GitHub 인증을 위해 다음 중 하나를 선택하세요:

   **A. Personal Access Token 사용 (권장)**
   
   ```bash
   # 1. GitHub에서 Personal Access Token 생성
   # https://github.com/settings/tokens
   # - Scopes: repo (전체 선택)
   
   # 2. Push 시 토큰 사용
   cd "c:\Users\user\.gemini\antigravity\scratch\assessment app"
   git push -u origin main
   # Username: YOUR_GITHUB_USERNAME
   # Password: YOUR_PERSONAL_ACCESS_TOKEN
   ```

   **B. GitHub CLI 사용**
   
   ```bash
   # GitHub CLI 설치되어 있다면
   gh auth login
   git push -u origin main
   ```

2. **Push 실행**
   
   ```bash
   cd "c:\Users\user\.gemini\antigravity\scratch\assessment app"
   git push -u origin main
   ```

### Option 2: GitHub Desktop 사용

1. GitHub Desktop 열기
2. "Add an Existing Repository" 선택
3. 경로 입력: `c:\Users\user\.gemini\antigravity\scratch\assessment app`
4. "Publish repository" 클릭
5. Repository name: `assessment`
6. "Publish repository" 확인

### Option 3: VS Code 사용

1. VS Code에서 폴더 열기: `c:\Users\user\.gemini\antigravity\scratch\assessment app`
2. Source Control (Ctrl+Shift+G) 클릭
3. "Publish to GitHub" 클릭
4. Repository name: `assessment`
5. Public으로 선택
6. "Publish" 클릭

## 📝 GitHub Pages 활성화

Push가 완료되면:

1. **GitHub 저장소로 이동**
   - https://github.com/fitsociety-hue/assessment

2. **Settings 탭 클릭**

3. **Pages 섹션으로 스크롤**

4. **Source 설정**
   - Branch: `main`
   - Folder: `/ (root)`
   - Save 클릭

5. **배포 완료 대기** (1-2분)
   - URL: `https://fitsociety-hue.github.io/assessment/`

## 🔧 배포 후 필수 설정

### 1. Google Sheets 설정

[📘 SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) 파일을 따라 진행하세요:

1. Google Sheets 생성 (7개 시트)
2. Apps Script 배포
3. `js/config.js` 파일 수정:
   ```javascript
   SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
   APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL',
   ```

4. **수정한 config.js 파일 다시 Push**:
   ```bash
   git add js/config.js
   git commit -m "Update config with Google Sheets credentials"
   git push
   ```

### 2. 테스트 데이터 입력

"직원정보" 시트에 테스트 계정 추가:

```
employee_id | name | department | position | role | hire_date | email | password_hash
ADMIN | 관리자 | 운영지원팀 | 관장 | admin | 2015-05-01 | admin@example.com | YWRtaW4xMjM0YXNzZXNzbWVudF9zYWx0XzIwMjQ=
EMP001 | 홍길동 | 사회복지팀 | 4급 | staff | 2020-03-15 | hong@example.com | aG9uZzEyMzRhc3Nlc3NtZW50X3NhbHRfMjAyNA==
EMP002 | 김관리 | 행정관리팀 | 3급 | manager | 2018-01-10 | kim@example.com | a2ltMTIzNGFzc2Vzc21lbnRfc2FsdF8yMDI0
```

비밀번호:
- ADMIN: `admin1234`
- EMP001: `hong1234`
- EMP002: `kim1234`

## ✅ 배포 확인 체크리스트

- [ ] GitHub에 Push 완료
- [ ] GitHub Pages 활성화 완료
- [ ] 배포된 사이트 접속 가능 (https://fitsociety-hue.github.io/assessment/)
- [ ] Google Sheets 생성 및 설정 완료
- [ ] config.js 파일 수정 및 재배포 완료
- [ ] 테스트 계정으로 로그인 성공
- [ ] 대시보드 데이터 로딩 확인
- [ ] 평가 페이지 동작 확인

## 🐛 문제 해결

### "403 Permission denied" 에러

→ GitHub 인증이 필요합니다. Personal Access Token을 사용하세요.

### 사이트가 404 Not Found

→ GitHub Pages가 활성화되고 배포되는데 1-2분 소요됩니다. 잠시 후 다시 시도하세요.

### "Google Sheets 연결 실패"

→ `js/config.js` 파일의 SPREADSHEET_ID와 APPS_SCRIPT_URL이 올바른지 확인하세요.

## 📚 추가 문서

- [README.md](./README.md) - 프로젝트 소개
- [SETUP_GUIDE.md](./docs/SETUP_GUIDE.md) - Google Sheets 설정 가이드
- [walkthrough.md](C:\\Users\\user\\.gemini\\antigravity\\brain\\6f0fbc01-4983-4ede-a862-b7c14d77dd44\\walkthrough.md) - 구현 세부사항

## 💡 다음 단계

1. **GitHub Personal Access Token 생성**
   - https://github.com/settings/tokens
   - "Generate new token (classic)"
   - repo 권한 선택
   - 토큰 복사

2. **Push 실행**
   ```bash
   cd "c:\Users\user\.gemini\antigravity\scratch\assessment app"
   git push -u origin main
   ```
   - Username: fitsociety-hue
   - Password: [복사한 토큰 붙여넣기]

3. **GitHub Pages 활성화**
   - Repository Settings → Pages
   - Source: main branch
   - Save

4. **Google Sheets 설정**
   - docs/SETUP_GUIDE.md 참조

완료! 🎉
