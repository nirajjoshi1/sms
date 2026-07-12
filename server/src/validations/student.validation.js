const { z } = require('zod');

const admitStudent = {
    body: z.object({
        enrollNumber: z.string().optional().nullable(),
        firstName: z.string().min(1, "First name is required"),
        middleName: z.string().optional().nullable(),
        lastName: z.string().optional().nullable(),
        gender: z.enum(['Male', 'Female', 'Other'], { required_error: "Gender is required" }),
        dob: z.string().min(1, "Date of birth is required"),
        mobileNumber: z.string().optional().nullable(),
        email: z.string().email("Invalid email address").optional().nullable().or(z.literal('')),
        admissionDate: z.string().optional().nullable(),
        classId: z.string().uuid("Invalid Class ID"),
        sectionId: z.string().uuid("Invalid Section ID"),
        categoryId: z.string().uuid("Invalid Category ID").optional().nullable(),
        houseId: z.string().uuid("Invalid House ID").optional().nullable(),
        fatherName: z.string().optional().nullable(),
        fatherPhone: z.string().optional().nullable(),
        motherName: z.string().optional().nullable(),
        motherPhone: z.string().optional().nullable(),
        guardianIs: z.enum(['Father', 'Mother', 'Other']).default('Father'),
        guardianName: z.string().min(1, "Guardian name is required"),
        guardianRelation: z.string().optional().nullable(),
        guardianPhone: z.string().min(1, "Guardian phone number is required"),
        guardianAddress: z.string().optional().nullable()
    }).strict()
};

const updateStudent = {
    body: admitStudent.body.partial()
};

const createCategory = {
    body: z.object({
        name: z.string().min(1, "Category name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createHouse = {
    body: z.object({
        name: z.string().min(1, "House name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createDisableReason = {
    body: z.object({
        reason: z.string().min(1, "Reason is required"),
        note: z.string().optional().nullable()
    }).strict()
};

const bulkDeleteStudents = {
    body: z.object({
        studentIds: z.array(z.string().uuid("Invalid Student ID")).min(1, "Student IDs are required")
    }).strict()
};

module.exports = {
    admitStudent,
    updateStudent,
    createCategory,
    createHouse,
    createDisableReason,
    bulkDeleteStudents
};
