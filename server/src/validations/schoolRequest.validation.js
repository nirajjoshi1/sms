const { z } = require('zod');

const createSchoolRequest = {
    body: z.object({
        schoolName: z.string().min(1, "School Name is required"),
        schoolCode: z.string().min(1, "Proposed Code is required"),
        contactName: z.string().min(1, "Contact Name is required"),
        contactEmail: z.string().email("Invalid email address"),
        contactPhone: z.string().min(1, "Contact Phone is required"),
        address: z.string().optional().nullable(),
        message: z.string().optional().nullable()
    }).strict()
};

module.exports = {
    createSchoolRequest
};
