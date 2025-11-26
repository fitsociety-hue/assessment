# Organization Config & Signup Form Update Walkthrough

## Overview
This update addresses the user's request to:
1.  **Update Organization Structure**: Updated `js/config.js` with the specific list of Positions ('관장', '사무국장', '팀장', '팀원') and confirmed Departments and Job Types.
2.  **Signup Form Labels**: Updated `signup.html` labels to "팀명 (Team)", "직종 (Job Type)", and "직위 (Position)" as requested.
3.  **Logout Functionality**: Verified that the logout button correctly redirects to the login page (`index.html`).

## Changes Made

### 1. `js/config.js`
- **Positions**: Updated to `['관장', '사무국장', '팀장', '팀원']`.
- **Departments**: Verified as '지역연계팀', '맞춤지원팀', '건강문화팀', '성장지원팀', '전략기획팀', '미래경영팀'.
- **Job Types**: Verified as '사회복지사', '수중운동사', '심리운동사', '특수교사', '회계', '서무', '영양사'.

### 2. `signup.html`
- **Labels**:
    - Changed "소속 (Team)" to **"팀명 (Team)"**.
    - Changed "직군 (Job Type)" to **"직종 (Job Type)"**.
    - Changed "직급 (Position)" to **"직위 (Position)"**.
- **Fields**: Confirmed all requested fields are present (Name, Team, Job Type, Position, Join Date, Password).

### 3. Logout Verification
- Checked `dashboard.html`: The logout button calls `auth.logout()`.
- Checked `js/auth.js`: The `logout()` function clears the session and redirects to `index.html`.
    ```javascript
    window.location.href = 'index.html';
    ```

## Verification Steps

### Step 1: Verify Signup Form
1.  Go to `signup.html`.
2.  Check the labels: "팀명", "직종", "직위".
3.  Check the "직위 (Position)" dropdown options. They should be: '관장', '사무국장', '팀장', '팀원'.

### Step 2: Verify Logout
1.  Log in to the dashboard.
2.  Click the **"로그아웃"** button in the sidebar.
3.  Verify that you are redirected to the **Login Page** (`index.html`).
    - *Note*: If it doesn't work immediately, please try clearing your browser cache or hard refreshing (Ctrl+F5).

## Next Steps
- Please redeploy the changes to GitHub Pages to see them live.
