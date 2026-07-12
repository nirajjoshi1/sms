const { z } = require('zod');

const addStaff = {
    body: z.object({
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional().nullable(),
        lastName: z.string().optional().nullable(),
        gender: z.enum(['Male', 'Female', 'Other'], { required_error: "Gender is required" }),
        dob: z.string().min(1, "Date of birth is required"),
        phone: z.string().optional().nullable(),
        email: z.string().email("Invalid email address").optional().nullable().or(z.literal('')),
        dateOfJoining: z.string().optional().nullable(),
        qualification: z.string().optional().nullable(),
        experience: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        emergencyContact: z.string().optional().nullable(),
        bloodGroup: z.string().optional().nullable(),
        maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional().nullable(),
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST'], { required_error: "Role is required" }),
        departmentId: z.string().uuid("Invalid Department ID").optional().nullable(),
        designationId: z.string().uuid("Invalid Designation ID").optional().nullable()
    }).strict()
};

const updateStaff = {
    body: addStaff.body.partial()
};

const markAttendance = {
    body: z.object({
        date: z.string().min(1, "Date is required"),
        attendance: z.array(
            z.object({
                staffId: z.string().uuid("Invalid Staff ID"),
                status: z.enum(['Present', 'Absent', 'Late', 'HalfDay'])
            })
        ).min(1, "Attendance records cannot be empty")
    }).strict()
};

const generatePayroll = {
    body: z.object({
        staffId: z.string().uuid("Invalid Staff ID"),
        month: z.string().min(1, "Month is required"),
        year: z.number().int().min(2000).max(2100),
        netSalary: z.number().nonnegative("Net salary must be non-negative"),
        status: z.enum(['Generated', 'Paid']).optional().default('Generated')
    }).strict()
};

const createLeaveType = {
    body: z.object({
        name: z.string().min(1, "Leave type name is required")
    }).strict()
};

const createLeaveRequest = {
    body: z.object({
        leaveTypeId: z.string().uuid("Invalid Leave Type ID"),
        fromDate: z.string().min(1, "From date is required"),
        toDate: z.string().min(1, "To date is required"),
        reason: z.string().min(1, "Reason is required"),
        isHalfDay: z.boolean().optional().default(false),
        halfDayType: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
        documentUrl: z.string().optional().nullable()
    }).strict()
};

const updateLeaveStatus = {
    body: z.object({
        status: z.enum(['Approved', 'Rejected']),
        comment: z.string().optional().nullable()
    }).strict()
};

const createDepartment = {
    body: z.object({
        name: z.string().min(1, "Department name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createDesignation = {
    body: z.object({
        name: z.string().min(1, "Designation name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

module.exports = {
    addStaff,
    updateStaff,
    markAttendance,
    generatePayroll,
    createLeaveType,
    createLeaveRequest,
    updateLeaveStatus,
    createDepartment,
    createDesignation
};
