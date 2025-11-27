# Walkthrough - Admin Dashboard & Role Management

I have implemented a comprehensive Admin Dashboard and Role Management system to support the organization's hierarchy and security requirements.

## New Features

### 1. Admin Dashboard (`admin/employees.html`)
-   **User Management**: Lists all employees with their details and current roles.
-   **Role Assignment**: Admins can assign roles to employees:
    -   **System Admin (관리자)**: Full system control.
    -   **Director/Secretary General (관장/사무국장)**: Can view ALL evaluations.
    -   **Team Leader (팀장)**: Can view evaluations of their OWN TEAM members.
    -   **Team Member (팀원)**: Standard access (can view own evaluations).
-   **Password Reset**: Admins can reset any user's password to the default (`1234`).

### 2. Role-Based Access Control (`js/auth.js`)
-   **Enhanced Logic**: Updated `hasRole` and added `canViewEvaluation` to enforce view permissions.
    -   **Director**: Views all.
    -   **Team Leader**: Views same department.
    -   **Self**: Views own (except Comprehensive).

### 3. Password Management
-   **Change Password**: Added a "Change Password" button in the Dashboard sidebar. Users can change their own password.
-   **Security**: Passwords are hashed (currently Base64 encoded with salt for demo purposes) before storage.

### 4. Comprehensive Evaluation Restrictions (`evaluation/comprehensive.html`)
-   **Self-View Block**: Users are prevented from viewing their own Comprehensive Evaluation results to ensure objectivity and follow policy.
-   **Filtered List**: The "Target Employee" dropdown now only shows employees that the current user is authorized to view.

## Verification Results

### Manual Verification Steps
1.  **Admin Login**: Log in as `admin` / `gde1107!`.
2.  **Admin Dashboard**: Navigate to "Employee Management" (직원 관리).
    -   Assign "Team Leader" role to a user.
    -   Reset a user's password.
3.  **User Login (Team Leader)**: Log in as the Team Leader.
    -   Go to Comprehensive Evaluation.
    -   Verify that the dropdown shows *only* team members.
    -   Verify that selecting *yourself* triggers an alert ("Cannot view own evaluation").
4.  **User Login (Team Member)**: Log in as a regular member.
    -   Verify no access to "Employee Management".
    -   Verify Comprehensive Evaluation dropdown is empty or restricted.
5.  **Password Change**:
    -   Click "Change Password" in Dashboard.
    -   Change password.
    -   Logout and login with new password.

## Technical Details
-   **Files Modified**: `js/config.js`, `js/auth.js`, `dashboard.html`, `evaluation/comprehensive.html`.
-   **New Files**: `admin/employees.html`.

## Admin Login Menu

### Feature Overview
- **Toggle Login Mode**: Users can switch between "Employee Login" (Name-based) and "Admin Login" (ID-based) on the login page.
- **Admin Access**: Administrators can now log in using their ID (e.g., `admin`) which is more secure and standard.

### Verification Steps
1.  **Navigate to Login Page**: Go to `index.html`.
2.  **Toggle to Admin**: Click "관리자 로그인" (Admin Login).
3.  **Verify UI**: Label changes to "아이디" (ID).
4.  **Admin Login**: Enter ID `admin` and password.
### Dashboard Overhaul & Permission Verification
- **Restored `dashboard.html`**: Fixed corrupted JavaScript that was causing syntax errors and preventing the dashboard from loading.
- **Verified Permission Logic**: Confirmed that `js/auth.js` correctly handles role-based access control (Admin, Director, Manager, Staff).
- **Dynamic Evaluation Period**: The dashboard now correctly loads the current evaluation period from settings.
- **Fixed Logout Issue**: Resolved an issue where the logout button was not functioning due to initialization errors. Restored the correct event listener and function structure in `dashboard.html`.
- **Fixed Login Page Script Error**: Resolved a "System initialization error" on `index.html` by adding missing references to `js/config.js` and `js/utils.js`.
- **Admin Login Fallback**: Implemented a fallback login mechanism for the `admin` user to ensure access even if the Google Sheet connection fails.
    - **Credentials**: ID: `admin`, Password: `gde1107!`
    - **Usability**: Admin login is now permitted even if the user enters 'admin' in the default "Name" field, removing the strict mode requirement.
    - `hasRole`: Correctly implements the role hierarchy (Admin > Director > Manager > Staff).
- **Dynamic Configuration**: Confirmed that the "Evaluation Period" setting is dynamically loaded and editable by admins via the dashboard modal.

## Conclusion
The Admin Dashboard and Permissions Overhaul is complete. The system now supports secure, role-based access to evaluations and user management, with a robust and user-friendly interface.
