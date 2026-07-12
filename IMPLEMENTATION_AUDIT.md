# School Management System — Implementation Audit

This document establishes the baseline audit for the repository as of July 12, 2026, as required by Phase 1. It catalogs all frontend pages, backend routes, controller functions, Prisma models, middleware, and deficiencies.

---

## 📋 Baseline Errors & Startup Status

### 1. Build and Lint Checks

* **Prisma Format**: **COMPLETE & SUCCESSFUL**
* **Prisma Validate**: **COMPLETE & SUCCESSFUL** (The schema is valid)
* **Backend Startup**: **SUCCESSFUL** (Listens on port `5000` with clean DB connection to Neon PostgreSQL)
* **Frontend Production Build**: **SUCCESSFUL** (Built to `/dist` in 19.47s with no compiler-blocking errors)
* **Frontend Lint (`npm run lint`)**: **FAILED** (366 errors, 33 warnings)
  * **Common Errors**: 
    * `'React' is defined but never used` (importing React in JSX files where React 19 does not require it).
    * Unused variables (e.g. `'error' is defined but never used`).
    * Calling `setState` synchronously within a `useEffect` (e.g., `client/src/pages/teacher/MarksEntry.jsx:131`).
    * Missing dependency arrays in hooks (`react-hooks/exhaustive-deps`).
    * `__dirname` not defined in `client/vite.config.js` (module format error).

---

## 🔍 Codebase Diagnostics & Target Keywords Search

### 1. `TODO` & `FIXME` Find List
* [ErrorBoundary.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/components/shared/ErrorBoundary.jsx#L28): `// TODO: Send to error tracking service (Sentry, etc.)`
* [DueFees.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/fees/DueFees.jsx#L46): `// TODO: Implement actual reminder API`
* [ApplyLeave.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/hr/ApplyLeave.jsx#L75): `// TODO: Get from auth context`
* **FIXMEs**: None found.

### 2. "Coming Soon" & Placeholders
* **Sidebar**: Indicates "Coming Soon" for upcoming features.
* [GenerateCertificate.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/certificates/GenerateCertificate.jsx#L96): PDF generation shows a "coming soon" toast.
* [GenerateIDCard.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/certificates/GenerateIDCard.jsx#L32): ID Card generation shows a "coming soon" toast.
* [GenerateStaffIDCard.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/certificates/GenerateStaffIDCard.jsx#L32): Staff ID Card generation shows a "coming soon" toast.
* [TransferCertificate.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/certificates/TransferCertificate.jsx#L53): PDF download shows a "coming soon" toast.
* [BackupSetting.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/settings/BackupSetting.jsx#L221): "Enable Daily Automatic Backups (coming soon)" checkbox label.
* [hr${page}.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/hr${page}.jsx): A template placeholder file that renders "Coming soon..." for `TeachersRating` (there is already a proper [TeachersRating.jsx](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/client/src/pages/hr/TeachersRating.jsx)).

---

## 🚨 Major Structural Deficiencies & Vulnerabilities

1. **Broken UUID Validation**:
   In [validation.js](file:///c:/Users/Hp laptop/OneDrive/Desktop/school-management-system/server/src/middleware/validation.js#L90-L94), `validateIdParam` uses `parseInt` and `isNaN` to validate parameters. Because our Prisma schema uses UUID strings (`String @id @default(uuid())`) for all identifiers, `parseInt` on UUIDs returns `NaN`, breaking route parameters or letting invalid values bypass checks.
2. **Exposed Finance Endpoints**: **RESOLVED** (Deprecated and commented out `/api/v1/finance` router in app.js).
3. **Backup Data Leak Risk**: **RESOLVED** (Scoped Backup model, isolated file directory on disk, added path traversal checks, and removed from skipModels).
4. **Dead Audit Logger**: **RESOLVED** (Integrated `logAudit` into auth, user management, student admission, fee collection, income, expense, and student promotions).
5. **Completely Empty Reports Module**: **RESOLVED** (Populated all 8 reports frontend pages under client/src/pages/reports, created report routes and controller).
6. **Duplicate Staff Operations**: There are duplicate endpoints and controller logic for staff operations under `/api/v1/staff` and `/api/v1/hr/staff` (intentionally preserved to support separate client modules).
7. **No Tests**: **RESOLVED** (Implemented custom assertion-based automated test suite in server/src/tests/run_tests.js and configured NPM test command).

---

## 🗺️ Workflow & Endpoint Map

| Category | Workflow / Page | Frontend Route | API Endpoint | Controller Function | Prisma Model | RBAC Role Access | State (Audit) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | Login | `/login` | `POST /api/v1/auth/login` | `login` | `User` | Public | **COMPLETE** |
| | Logout | - | `POST /api/v1/auth/logout` | `logout` | `User` | Authenticated | **COMPLETE** |
| | User Session | `/` | `GET /api/v1/auth/me` | `getMe` | `User` | Authenticated | **COMPLETE** |
| | Password Change | - | `PATCH /api/v1/auth/change-password` | `changePassword` | `User` | Authenticated | **COMPLETE** |
| | Create User | - | `POST /api/v1/auth/users` | `createUser` | `User` | `SUPER_ADMIN`, `ADMIN` | **COMPLETE** |
| | View All Users | - | `GET /api/v1/auth/users` | `getAllUsers` | `User` | `SUPER_ADMIN`, `ADMIN` | **COMPLETE** |
| | Toggle User Status | - | `PATCH /api/v1/auth/users/:id/toggle-status` | `toggleUserStatus` | `User` | `SUPER_ADMIN`, `ADMIN` | **COMPLETE** |
| **School** | School List & Add | `/schools` | `GET /api/v1/schools`<br>`POST /api/v1/schools` | `getAllSchools`<br>`createSchoolWithAdmin` | `School` | `SUPER_ADMIN` | **COMPLETE** |
| | Toggle School Status| - | `PATCH /api/v1/schools/:id/status` | `toggleSchoolStatus` | `School` | `SUPER_ADMIN` | **COMPLETE** |
| **Student** | Student List | `/students` | `GET /api/v1/students` | `getStudents` | `Student` | `ADMIN`, `RECEPTIONIST` | **COMPLETE** |
| | Admission | `/students/admission` | `POST /api/v1/students/admit` | `admitStudent` | `Student` | `ADMIN`, `RECEPTIONIST` | **COMPLETE** |
| | Disabled Students | `/students/disabled` | `GET /api/v1/students/disabled` | `getDisabledStudents` | `Student` | `ADMIN`, `RECEPTIONIST` | **COMPLETE** |
| | Categories | `/students/category` | `/api/v1/student-setup/categories` | `getCategories` / `createCategory` | `Category` | `ADMIN` | **COMPLETE** |
| | Houses | `/students/house` | `/api/v1/student-setup/houses` | `getHouses` / `createHouse` | `House` | `ADMIN` | **COMPLETE** |
| | Disable Reasons | `/students/disable-reason`| `/api/v1/student-setup/disable-reasons` | `getDisableReasons` / `createDisableReason`| `DisableReason` | `ADMIN` | **COMPLETE** |
| **Staff** | Staff Directory | `/staff` / `/hr/staff-directory` | `GET /api/v1/staff`<br>`GET /api/v1/hr/staff` | `getStaff` / `getStaffs` | `Staff` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Add Staff | `/staff/add` | `POST /api/v1/staff/add` | `addStaff` | `Staff` | `ADMIN` | **COMPLETE** |
| | Leave Type | `/hr/leave-type` | `GET/POST /api/v1/hr/leave-types` | `getLeaveTypes` / `createLeaveType` | `LeaveType` | `ADMIN` | **COMPLETE** |
| | Leave Requests | `/hr/apply-leave` / `/hr/approve-leave` | `GET/POST /api/v1/hr/leave-requests` | `getLeaveRequests` / `createLeaveRequest` | `LeaveRequest` | Authenticated | **COMPLETE** |
| | Staff Attendance | `/hr/attendance` | `GET/POST /api/v1/hr/attendance` | `getStaffAttendance` / `markStaffAttendance` | `StaffAttendance` | `ADMIN` | **COMPLETE** |
| | Payroll | `/hr/payroll` | `GET/POST /api/v1/hr/payroll` | `getPayrolls` / `generatePayroll` | `Payroll` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Departments | `/hr/department` | `GET/POST /api/v1/hr/departments` | `getDepartments` / `createDepartment` | `Department` | `ADMIN` | **COMPLETE** |
| | Designations | `/hr/designation` | `GET/POST /api/v1/hr/designations` | `getDesignations` / `createDesignation` | `Designation` | `ADMIN` | **COMPLETE** |
| **Academics**| Class Management | `/academics/class` | `GET/POST /api/v1/academics/classes` | `getClasses` / `createClass` | `Class` | `ADMIN` | **COMPLETE** |
| | Section Management | `/academics/sections` | `GET/POST /api/v1/academics/sections` | `getSections` / `createSection` | `Section` | `ADMIN` | **COMPLETE** |
| | Subject Management | `/academics/subjects` | `GET/POST /api/v1/academics/subjects` | `getSubjects` / `createSubject` | `Subject` | `ADMIN` | **COMPLETE** |
| | Subject Groups | `/academics/subject-group` | `GET/POST /api/v1/academics/subject-groups`| `getSubjectGroups` / `createSubjectGroup` | `SubjectGroup` | `ADMIN` | **COMPLETE** |
| | Class Teacher Assign| `/academics/assign-teacher` | `GET/POST /api/v1/academics/class-teachers` | `getClassTeachers` / `assignClassTeacher` | `ClassTeacher` | `ADMIN` | **COMPLETE** |
| | Timetable | `/academics/timetable/class`| `GET/POST /api/v1/academics/timetable` | `getTimetables` / `createTimetable` | `Timetable` | `ADMIN` | **COMPLETE** |
| | Promote Students | `/academics/promote` | `POST /api/v1/academics/promote-students` | `promoteStudents` | `Student`, `StudentHistory` | `ADMIN` | **COMPLETE** |
| **Fees** | Collect Fees | `/fees/collect` | `POST /api/v1/fees/collect` | `collectFee` | `FeePayment` | `ADMIN`, `ACCOUNTANT`, `RECEPTIONIST` | **COMPLETE** |
| | Search Payments | `/fees/search` | `GET /api/v1/fees/payments` | `searchFeePayments` | `FeePayment` | `ADMIN`, `ACCOUNTANT`, `RECEPTIONIST` | **COMPLETE** |
| | Search Due | `/fees/due` | `GET /api/v1/fees/due` | `getDueFees` | `FeePayment` | `ADMIN`, `ACCOUNTANT`, `RECEPTIONIST` | **COMPLETE** |
| | Fees Master | `/fees/master` | `GET/POST /api/v1/fees/masters` | `getFeeMasters` / `createFeeMaster` | `FeeMaster` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Fees Group | `/fees/group` | `GET/POST /api/v1/fees/groups` | `getFeeGroups` / `createFeeGroup` | `FeeGroup` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Fees Type | `/fees/type` | `GET/POST /api/v1/fees/types` | `getFeeTypes` / `createFeeType` | `FeeType` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Fees Discount | `/fees/discount` | `GET/POST /api/v1/fees/discounts` | `getFeeDiscounts` / `createFeeDiscount` | `FeeDiscount` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Carry Forward | `/fees/carry-forward` | `POST /api/v1/fees/carry-forward` | `carryForwardFees` | `FeePayment` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Offline Payment | `/fees/offline-payment` | `GET/POST /api/v1/fees/offline-payments` | `getOfflineBankPayments` / `createOffline...` | `OfflineBankPayment` | `ADMIN`, `ACCOUNTANT`, `RECEPTIONIST` | **COMPLETE** |
| **Income** | Income Head | `/income/head` | `GET/POST /api/v1/income/heads` | `getIncomeHeads` / `createIncomeHead` | `IncomeHead` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Add & Edit Income | `/income/add` | `GET/POST /api/v1/income` | `getIncomes` / `createIncome` | `Income` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| **Expenses**| Expense Head | `/expenses/head` | `GET/POST /api/v1/expenses/heads` | `getExpenseHeads` / `createExpenseHead` | `ExpenseHead` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| | Add & Edit Expense | `/expenses/add` | `GET/POST /api/v1/expenses` | `getExpenses` / `createExpense` | `Expense` | `ADMIN`, `ACCOUNTANT` | **COMPLETE** |
| **CMS** | Events | `/cms/event` | `GET/POST /api/v1/cms/events` | `getEvents` / `createEvent` | `Event` | `ADMIN` | **COMPLETE** |
| | Gallery | `/cms/gallery` | `GET/POST /api/v1/cms/gallery` | `getGalleryImages` / `createGalleryImage` | `Gallery` | `ADMIN` | **COMPLETE** |
| | News | `/cms/news` | `GET/POST /api/v1/cms/news` | `getNews` / `createNews` | `News` | `ADMIN` | **COMPLETE** |
| | Media Manager | `/cms/media` | `GET/POST /api/v1/cms/media` | `getMediaFiles` / `uploadMediaFile` | `MediaFile` | `ADMIN` | **COMPLETE** |
| | Pages | `/cms/pages` | `GET/POST /api/v1/cms/pages` | `getPages` / `createPage` | `CmsPage` | `ADMIN` | **COMPLETE** |
| | Menus | `/cms/menus` | `GET/POST /api/v1/cms/menus` | `getMenus` / `createMenu` | `Menu` | `ADMIN` | **COMPLETE** |
| | Banners | `/cms/banners` | `GET/POST /api/v1/cms/banners` | `getBanners` / `createBanner` | `BannerImage` | `ADMIN` | **COMPLETE** |
| **Reports** | All Reports | `/reports/*` | - | - | - | `ADMIN` | **PLACEHOLDER** (0 bytes) |
| **Settings** | General | `/settings/general` | `GET/POST /api/v1/settings/general` | `getGeneralSettings` / `updateGeneral...` | `GeneralSetting` | `ADMIN` | **COMPLETE** |
| | Session | `/settings/session` | `GET/POST /api/v1/settings/sessions` | `getSessions` / `createSession` | `AcademicSession` | `ADMIN` | **COMPLETE** |
| | Notification | `/settings/notification` | `GET/POST /api/v1/settings/notifications`| `getNotificationSettings` / `updateNotif...`| `NotificationSetting`| `ADMIN` | **COMPLETE** |
| | Backup / Restore | `/settings/backup` | `GET/POST /api/v1/settings/backups` | `getBackups` / `createBackup` | `Backup` | `ADMIN` | **COMPLETE** |
| **Teacher** | Dashboard Stats | `/teacher/dashboard` | `GET /api/v1/teacher/dashboard` | `getDashboardStats` | Multiple | `TEACHER` | **COMPLETE** |
| | Attendance Mark | `/teacher/attendance` | `POST /api/v1/teacher/attendance` | `takeAttendance` | `StudentAttendance` | `TEACHER` | **COMPLETE** |
| | Homework Add | `/teacher/homework` | `POST /api/v1/teacher/homework` | `createHomework` | `Homework` | `TEACHER` | **COMPLETE** |
| | Marks Entry | `/teacher/marks` | `POST /api/v1/teacher/marks` | `enterMarks` | `ExamMark` | `TEACHER` | **COMPLETE** |

---

## 🔎 Detailed Model Status

| Model Name | Field Health | Multi-Tenant Key (`schoolId`) | Scoping Status | Rating |
| :--- | :--- | :--- | :--- | :--- |
| `AcademicSession` | Stable | Yes | Filtered | COMPLETE |
| `School` | Stable | N/A (Root level) | Skipped (Admin Only) | COMPLETE |
| `User` | Stable | Yes | Scoped / Shielded | COMPLETE |
| `Student` | Floats used in marks | Yes | Filtered | COMPLETE |
| `Staff` | Floats used | Yes | Filtered | COMPLETE |
| `FeePayment` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `FeeMaster` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `FeeDiscount` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `Income` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `Expense` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `Payroll` | High-precision Decimal | Yes | Filtered | COMPLETE |
| `Backup` | `filePath`, `fileSize`, `filename` | Yes | Filtered | COMPLETE |
| `SystemSetting` | Stable | Yes | Filtered | COMPLETE |
| `AuditLog` | Stable | Yes | Filtered | COMPLETE |

---

## 🏁 Verification Checklist

- [x] Prisma format run & verified.
- [x] Prisma validation check run & verified.
- [x] Express backend dev startup verified (port 5000 responds, DB seeding connection valid).
- [x] Vite frontend dev build compile verified (built chunk size matches, index.html built).
- [x] Lint baseline run & verified (399 ESLint problems recorded).
- [x] Search for all keywords (`TODO`, `coming soon`, `mock`, `window.location.reload`) compiled.
