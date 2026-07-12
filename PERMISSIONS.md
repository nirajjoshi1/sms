# Role-Based Access Control (RBAC) & Permissions

This document outlines the granular permission matrix and Role-Based Access Control (RBAC) implemented in the School Management System, as defined in `server/src/config/permissions.js`.

## Permission Model

The system utilizes a granular permission model. Instead of hardcoding role checks throughout the application logic (e.g., `if (user.role === 'ADMIN')`), the application checks for specific permissions (e.g., `if (user.hasPermission('STUDENTS_CREATE'))`).

Roles are simply collections of these granular permissions.

## Defined Permissions

Permissions are grouped by domain to maintain organization:

### Platform Level
- `PLATFORM_SCHOOLS_MANAGE`: Manage different tenant schools (Super Admin only).
- `PLATFORM_USERS_MANAGE`: Manage users across the platform.

### School Level
- `SCHOOL_USERS_MANAGE`: Manage users within a specific school.

### Students
- `STUDENTS_READ`, `STUDENTS_CREATE`, `STUDENTS_UPDATE`, `STUDENTS_DISABLE`, `STUDENTS_PROMOTE`

### Staff
- `STAFF_READ`, `STAFF_MANAGE`

### Attendance
- `ATTENDANCE_TAKE`, `ATTENDANCE_MANAGE`

### Academics
- `ACADEMICS_READ`, `ACADEMICS_MANAGE`
- `MARKS_ENTER`, `MARKS_MANAGE`
- `RESULTS_VERIFY`, `RESULTS_PUBLISH`

### Fees & Finance
- `FEES_READ`, `FEES_COLLECT`, `FEES_CONFIGURE`
- `OFFLINE_PAYMENT_APPROVE`
- `INCOME_MANAGE`, `EXPENSE_MANAGE`

### HR & Payroll
- `PAYROLL_READ`, `PAYROLL_GENERATE`, `PAYROLL_APPROVE`
- `LEAVE_CREATE`, `LEAVE_APPROVE`

### CMS & Documents
- `CMS_READ_ADMIN`, `CMS_MANAGE`
- `CERTIFICATES_GENERATE`

### Settings & System
- `SETTINGS_READ`, `SETTINGS_MANAGE`
- `SECRETS_MANAGE`, `BACKUPS_MANAGE`
- `NOTIFICATIONS_BROADCAST`

### Reports
- `REPORTS_STUDENT`, `REPORTS_FINANCE`, `REPORTS_HR`, `REPORTS_AUDIT`

## Role Definitions

Users are assigned roles which grant them specific sets of permissions.

### SUPER_ADMIN
Has platform-wide administrative privileges.
- Permissions include: `PLATFORM_SCHOOLS_MANAGE`, `PLATFORM_USERS_MANAGE`, `SECRETS_MANAGE`.

### ADMIN
Has comprehensive access to all modules within their specific school.
- Granted nearly all school-level permissions including user management, academics, HR, finance, CMS, settings, and reports.

### ACCOUNTANT
Focuses on the financial aspects of the school.
- Permissions include: `FEES_READ`, `FEES_COLLECT`, `INCOME_MANAGE`, `EXPENSE_MANAGE`, `PAYROLL_READ`, `PAYROLL_GENERATE`, `PAYROLL_APPROVE`, `REPORTS_FINANCE`.
- Also has `STUDENTS_READ` and `STAFF_READ` for context during financial operations.

### RECEPTIONIST
Handles front-desk operations, inquiries, and basic administration.
- Permissions include: `STUDENTS_READ`, `STUDENTS_CREATE`, `STUDENTS_UPDATE` (limited), `FEES_READ`, `FEES_COLLECT`.

### TEACHER
Focuses on academic responsibilities and personal administration.
- Permissions include: `STUDENTS_READ`, `STAFF_READ` (own profile), `ACADEMICS_READ`, `ATTENDANCE_TAKE`, `MARKS_ENTER`, `LEAVE_CREATE`.

### LIBRARIAN
Has access to library management (currently limited to their own profile in the MVP).
- Permissions include: `STAFF_READ`.
