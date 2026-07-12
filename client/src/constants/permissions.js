export const PERMISSIONS = {
    // Platform Level (Super Admin only)
    PLATFORM_SCHOOLS_MANAGE: 'platform:schools:manage',
    PLATFORM_USERS_MANAGE: 'platform:users:manage',
    
    // School Level (Admin)
    SCHOOL_USERS_MANAGE: 'school:users:manage',
    
    // Student Management
    STUDENTS_READ: 'students:read',
    STUDENTS_CREATE: 'students:create',
    STUDENTS_UPDATE: 'students:update',
    STUDENTS_DISABLE: 'students:disable',
    STUDENTS_PROMOTE: 'students:promote',

    // Staff Management
    STAFF_READ: 'staff:read',
    STAFF_MANAGE: 'staff:manage',

    // Attendance
    ATTENDANCE_TAKE: 'attendance:take',
    ATTENDANCE_MANAGE: 'attendance:manage',

    // Academics
    ACADEMICS_READ: 'academics:read',
    ACADEMICS_MANAGE: 'academics:manage',
    MARKS_ENTER: 'marks:enter',
    MARKS_MANAGE: 'marks:manage',
    RESULTS_VERIFY: 'results:verify',
    RESULTS_PUBLISH: 'results:publish',

    // Fees & Finance
    FEES_READ: 'fees:read',
    FEES_COLLECT: 'fees:collect',
    FEES_CONFIGURE: 'fees:configure',
    OFFLINE_PAYMENT_APPROVE: 'offline_payment:approve',
    INCOME_MANAGE: 'income:manage',
    EXPENSE_MANAGE: 'expense:manage',

    // Payroll & HR
    PAYROLL_READ: 'payroll:read',
    PAYROLL_GENERATE: 'payroll:generate',
    PAYROLL_APPROVE: 'payroll:approve',
    LEAVE_CREATE: 'leave:create',
    LEAVE_APPROVE: 'leave:approve',

    // Communication & CMS
    CMS_READ_ADMIN: 'cms:read_admin',
    CMS_MANAGE: 'cms:manage',
    CERTIFICATES_GENERATE: 'certificates:generate',
    NOTIFICATIONS_BROADCAST: 'notifications:broadcast',

    // Settings & Backups
    SETTINGS_READ: 'settings:read',
    SETTINGS_MANAGE: 'settings:manage',
    SECRETS_MANAGE: 'secrets:manage',
    BACKUPS_MANAGE: 'backups:manage',

    // Reports
    REPORTS_STUDENT: 'reports:student',
    REPORTS_FINANCE: 'reports:finance',
    REPORTS_HR: 'reports:hr',
    REPORTS_AUDIT: 'reports:audit'
};

export const ROLE_PERMISSIONS = {
    SUPER_ADMIN: [
        PERMISSIONS.PLATFORM_SCHOOLS_MANAGE,
        PERMISSIONS.PLATFORM_USERS_MANAGE,
        PERMISSIONS.SECRETS_MANAGE
    ],
    
    ADMIN: [
        PERMISSIONS.SCHOOL_USERS_MANAGE,
        PERMISSIONS.STUDENTS_READ,
        PERMISSIONS.STUDENTS_CREATE,
        PERMISSIONS.STUDENTS_UPDATE,
        PERMISSIONS.STUDENTS_DISABLE,
        PERMISSIONS.STUDENTS_PROMOTE,
        PERMISSIONS.STAFF_READ,
        PERMISSIONS.STAFF_MANAGE,
        PERMISSIONS.ATTENDANCE_TAKE,
        PERMISSIONS.ATTENDANCE_MANAGE,
        PERMISSIONS.ACADEMICS_READ,
        PERMISSIONS.ACADEMICS_MANAGE,
        PERMISSIONS.MARKS_ENTER,
        PERMISSIONS.MARKS_MANAGE,
        PERMISSIONS.RESULTS_VERIFY,
        PERMISSIONS.RESULTS_PUBLISH,
        PERMISSIONS.FEES_READ,
        PERMISSIONS.FEES_COLLECT,
        PERMISSIONS.FEES_CONFIGURE,
        PERMISSIONS.OFFLINE_PAYMENT_APPROVE,
        PERMISSIONS.INCOME_MANAGE,
        PERMISSIONS.EXPENSE_MANAGE,
        PERMISSIONS.PAYROLL_READ,
        PERMISSIONS.PAYROLL_GENERATE,
        PERMISSIONS.PAYROLL_APPROVE,
        PERMISSIONS.LEAVE_CREATE,
        PERMISSIONS.LEAVE_APPROVE,
        PERMISSIONS.CMS_READ_ADMIN,
        PERMISSIONS.CMS_MANAGE,
        PERMISSIONS.CERTIFICATES_GENERATE,
        PERMISSIONS.SETTINGS_READ,
        PERMISSIONS.SETTINGS_MANAGE,
        PERMISSIONS.BACKUPS_MANAGE,
        PERMISSIONS.NOTIFICATIONS_BROADCAST,
        PERMISSIONS.REPORTS_STUDENT,
        PERMISSIONS.REPORTS_FINANCE,
        PERMISSIONS.REPORTS_HR,
        PERMISSIONS.REPORTS_AUDIT
    ],
    
    TEACHER: [
        PERMISSIONS.STUDENTS_READ,
        PERMISSIONS.ATTENDANCE_TAKE,
        PERMISSIONS.ACADEMICS_READ,
        PERMISSIONS.MARKS_ENTER,
        PERMISSIONS.LEAVE_CREATE
    ],
    
    ACCOUNTANT: [
        PERMISSIONS.FEES_READ,
        PERMISSIONS.FEES_COLLECT,
        PERMISSIONS.INCOME_MANAGE,
        PERMISSIONS.EXPENSE_MANAGE,
        PERMISSIONS.PAYROLL_READ,
        PERMISSIONS.PAYROLL_GENERATE,
        PERMISSIONS.REPORTS_FINANCE,
        PERMISSIONS.LEAVE_CREATE
    ],
    
    LIBRARIAN: [
        PERMISSIONS.STUDENTS_READ,
        PERMISSIONS.LEAVE_CREATE
    ],
    
    RECEPTIONIST: [
        PERMISSIONS.STUDENTS_READ,
        PERMISSIONS.FEES_READ,
        PERMISSIONS.FEES_COLLECT,
        PERMISSIONS.CMS_READ_ADMIN,
        PERMISSIONS.CMS_MANAGE,
        PERMISSIONS.LEAVE_CREATE
    ]
};

export const hasPermission = (userRole, permission) => {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
    return ROLE_PERMISSIONS[userRole].includes(permission);
};
