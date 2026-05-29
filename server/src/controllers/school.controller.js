const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Create a new school and its admin user
// @route   POST /api/v1/schools
// @access  Private (Super Admin only)
exports.createSchoolWithAdmin = asyncHandler(async (req, res) => {
    const { 
        schoolName, 
        schoolEmail, 
        schoolAddress, 
        schoolPhone,
        adminName,
        adminEmail,
        adminPassword 
    } = req.body;

    if (!schoolName || !adminName || !adminEmail || !adminPassword) {
        throw new ApiError(400, "School name, Admin name, Email and Password are required");
    }

    // Check if school already exists
    const existingSchool = await prisma.school.findFirst({
        where: { 
            OR: [
                { name: schoolName },
                { email: schoolEmail }
            ]
        }
    });

    if (existingSchool) {
        throw new ApiError(409, "A school with this name or email already exists");
    }

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingUser) {
        throw new ApiError(409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create school and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
        const school = await tx.school.create({
            data: {
                name: schoolName,
                email: schoolEmail,
                address: schoolAddress,
                phone: schoolPhone
            }
        });

        const admin = await tx.user.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'ADMIN',
                schoolId: school.id
            }
        });

        return { school, admin };
    });

    return res.status(201).json(
        new ApiResponse(201, result, "School and Admin account created successfully")
    );
});

// @desc    Get all schools
// @route   GET /api/v1/schools
// @access  Private (Super Admin only)
exports.getAllSchools = asyncHandler(async (req, res) => {
    const schools = await prisma.school.findMany({
        include: {
            admins: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isActive: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(
        new ApiResponse(200, schools, "Schools fetched successfully")
    );
});

// @desc    Toggle school active status
// @route   PATCH /api/v1/schools/:id/toggle-status
// @access  Private (Super Admin only)
exports.toggleSchoolStatus = asyncHandler(async (req, res) => {
    const school = await prisma.school.findUnique({ where: { id: req.params.id } });
    if (!school) throw new ApiError(404, "School not found");

    const updated = await prisma.school.update({
        where: { id: req.params.id },
        data: { isActive: !school.isActive }
    });

    return res.status(200).json(
        new ApiResponse(200, updated, `School ${updated.isActive ? 'enabled' : 'disabled'} successfully`)
    );
});
