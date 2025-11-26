# Dashboard UI and Organization Config Update Walkthrough

## Overview
This update addresses the user's request to:
1.  **Hide Department for Director/Operations Support**: The "운영지원팀" department is now hidden on the dashboard for the Director ('관장') and any user belonging to '운영지원팀'.
2.  **Update Organization Structure**: The organization configuration has been updated with new departments, positions, and job types.
3.  **Dynamic Signup Form**: The signup form now dynamically populates the "Job Type" dropdown from the configuration, ensuring consistency.

## Changes Made

### 1. `js/config.js`
- Updated `ORGANIZATION.DEPARTMENTS` with the new list: '지역연계팀', '맞춤지원팀', '건강문화팀', '성장지원팀', '전략기획팀', '미래경영팀'.
- Verified `ORGANIZATION.POSITIONS`.
- Added `ORGANIZATION.JOB_TYPES` with: '사회복지사', '수중운동사', '심리운동사', '특수교사', '회계', '서무', '영양사'.

### 2. `dashboard.html`
- **Logic Update**: Added a condition to check if the user is '관장' or in '운영지원팀'.
- **UI Update**: Conditionally renders the department div in the sidebar and top bar.
- **Fix**: Repaired syntax errors in the script section.

### 3. `signup.html`
- **Dynamic Dropdown**: Replaced hardcoded "Job Type" options with dynamic population from `CONFIG.ORGANIZATION.JOB_TYPES`.
- **Fix**: Repaired syntax errors to ensure the form functions correctly.

## Verification Steps

### Step 1: Verify Dashboard UI
1.  **Login as Director ('관장')**:
    - Check the sidebar and top bar. The department name should **NOT** be visible.
2.  **Login as '운영지원팀' Staff**:
    - Check the sidebar and top bar. The department name should **NOT** be visible.
3.  **Login as Other Staff**:
    - Check the sidebar and top bar. The department name **SHOULD** be visible.

### Step 2: Verify Signup Form
1.  Go to `signup.html`.
2.  Click on the **"소속 (Team)"** dropdown. It should list the new departments (e.g., '지역연계팀', '맞춤지원팀'...).
3.  Click on the **"직군 (Job Type)"** dropdown. It should list the new job types (e.g., '사회복지사', '수중운동사'...).

### Step 3: Redeploy Apps Script (Optional but Recommended)
- While no changes were made to the server logic that require a redeploy for *functionality*, it is good practice to ensure the latest `AppsScript.js` content matches what you have if you made any local changes to it previously.
- **Note**: The `handleRegister` function in `AppsScript.js` is already compatible with the new data structure.

## Next Steps
- If you need to update the **Google Sheet** columns to match the new data (e.g., if you added new columns that didn't exist), please do so manually in the spreadsheet.
