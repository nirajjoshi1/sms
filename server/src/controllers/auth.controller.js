const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// @desc    Create a new user (Authenticated: SUPER_ADMIN or ADMIN)
// @route   POST /api/v1/auth/users
exports.createUser = asyncHandler(async (req, res) => {
    let { name, email, password, role, schoolId } = req.body;

    if (!name || !email || !password || !role) {
        throw new ApiError(400, "Name, email, password, and role are required");
    }

    // Normalize email
    email = email.trim().toLowerCase();

    // Password strength validation (basic)
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const creatorRole = req.user.role;
    const creatorSchoolId = req.user.schoolId;

    // Strict Role Allowlist
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST'];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, "Invalid role specified");
    }

    // Role hierarchies
    if (creatorRole === 'ADMIN') {
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
            throw new ApiError(403, "Admins cannot create other admins or super admins");
        }
        // Force the new user to belong to the Admin's school
        schoolId = creatorSchoolId;
    } else if (creatorRole === 'SUPER_ADMIN') {
        // SUPER_ADMIN can create ADMINs, but they must assign a schoolId for them
        if (role !== 'SUPER_ADMIN' && !schoolId) {
            throw new ApiError(400, "School ID is required when creating a non-Super Admin user");
        }
    } else {
        throw new ApiError(403, "You do not have permission to create users");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            schoolId: schoolId || null
        }
    });

    return res.status(201).json(new ApiResponse(201, {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, schoolId: user.schoolId }
    }, "User created successfully"));
});

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been disabled. Contact Super Admin.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const token = generateToken(user.id, user.role);

    // Fetch user with school
    const userWithSchool = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            School: {
                select: { id: true, name: true, logo: true }
            }
        }
    });

    return res.status(200)
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        .json(new ApiResponse(200, {
            user: userWithSchool
        }, "Login successful"));
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
    return res.status(200)
        .clearCookie('token')
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// @desc    Get logged-in user profile
// @route   GET /api/v1/auth/me
exports.getMe = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            School: {
                select: { id: true, name: true, logo: true }
            }
        }
    });

    return res.status(200).json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// @desc    Get all users (Super Admin only)
// @route   GET /api/v1/auth/users
exports.getAllUsers = asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// @desc    Toggle user active status (Super Admin only)
// @route   PATCH /api/v1/auth/users/:id/toggle-status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new ApiError(404, "User not found");

    const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    return res.status(200).json(new ApiResponse(200, updated, `User ${updated.isActive ? 'enabled' : 'disabled'} successfully`));
});

// @desc    Change password
// @route   PATCH /api/v1/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashedPassword } });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});
