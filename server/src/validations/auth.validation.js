const { z } = require('zod');

const createUser = {
    body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(10, "Password must be at least 10 characters long"),
        role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST']),
        schoolId: z.string().uuid("Invalid school ID").optional().nullable()
    }).strict() // Reject any unknown fields injected by the client
};

const login = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    }).strict()
};

module.exports = {
    createUser,
    login
};
