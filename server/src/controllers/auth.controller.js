const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { logAudit } = require('../utils/audit');

const generateToken = (userId, role, tokenVersion = 0) => {
    return jwt.sign(
        { id: userId, role, tokenVersion },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Cross-origin production deployments need SameSite=None for the browser to
// attach the HttpOnly session cookie to credentialed API requests.
const getAuthCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    };
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

    // Password strength validation
    if (password.length < 10) {
        throw new ApiError(400, "Password must be at least 10 characters long");
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

    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'CREATE_USER',
        resource: 'User',
        resourceId: user.id,
        details: { email: user.email, role: user.role },
        schoolId: user.schoolId
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

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
        throw new ApiError(400, `Account is temporarily locked. Please try again after ${remainingMinutes} minutes.`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        // Increment login attempts
        const attempts = user.loginAttempts + 1;
        let lockUntil = null;
        
        if (attempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: attempts,
                lockUntil
            }
        });

        await logAudit({
            userId: user.id,
            userEmail: user.email,
            action: 'LOGIN_FAILURE',
            resource: 'User',
            resourceId: user.id,
            details: { reason: 'Invalid password', attempts },
            schoolId: user.schoolId
        });

        if (attempts >= 5) {
            throw new ApiError(400, "Account has been locked for 15 minutes due to too many failed attempts.");
        } else {
            throw new ApiError(401, "Invalid email or password");
        }
    }

    // Reset login attempts on success
    await prisma.user.update({
        where: { id: user.id },
        data: {
            loginAttempts: 0,
            lockUntil: null
        }
    });

    const token = generateToken(user.id, user.role, user.tokenVersion);

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

    await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'LOGIN_SUCCESS',
        resource: 'User',
        resourceId: user.id,
        details: { role: user.role },
        schoolId: user.schoolId
    });

    return res.status(200)
        .cookie('token', token, getAuthCookieOptions())
        .json(new ApiResponse(200, {
            user: userWithSchool
        }, "Login successful"));
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
exports.logout = asyncHandler(async (req, res) => {
    const { maxAge, ...clearOptions } = getAuthCookieOptions();
    return res.status(200)
        .clearCookie('token', clearOptions)
        .json(new ApiResponse(200, {}, "Logged out successfully"));
});

// @desc    Logout user from all sessions
// @route   POST /api/v1/auth/logout-all
exports.logoutAll = asyncHandler(async (req, res) => {
    // Increment tokenVersion to invalidate all existing tokens globally
    await prisma.user.update({
        where: { id: req.user.id },
        data: { tokenVersion: { increment: 1 } }
    });
    
    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'LOGOUT_ALL',
        resource: 'User',
        resourceId: req.user.id,
        details: { message: "Revoked all active sessions" },
        schoolId: req.user.schoolId
    });

    const { maxAge, ...clearOptions } = getAuthCookieOptions();
    return res.status(200)
        .clearCookie('token', clearOptions)
        .json(new ApiResponse(200, {}, "Logged out from all sessions successfully"));
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

// @desc    Get all users (Admin & Super Admin)
// @route   GET /api/v1/auth/users
exports.getAllUsers = asyncHandler(async (req, res) => {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin ? {} : { schoolId: req.user.schoolId };

    const users = await prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, schoolId: true },
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// @desc    Toggle user active status (Admin & Super Admin)
// @route   PATCH /api/v1/auth/users/:id/toggle-status
exports.toggleUserStatus = asyncHandler(async (req, res) => {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    
    if (req.params.id === req.user.id) {
        throw new ApiError(400, "You cannot disable your own account");
    }

    const where = isSuperAdmin ? { id: req.params.id } : { id: req.params.id, schoolId: req.user.schoolId };
    const user = await prisma.user.findFirst({ where });
    
    // Return 404 if not found or belongs to another tenant to prevent info leakage
    if (!user) throw new ApiError(404, "User not found");

    const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: !user.isActive },
        select: { id: true, name: true, email: true, role: true, isActive: true, schoolId: true }
    });

    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'TOGGLE_USER_STATUS',
        resource: 'User',
        resourceId: updated.id,
        details: { targetEmail: updated.email, isActive: updated.isActive },
        schoolId: updated.schoolId
    });

    return res.status(200).json(new ApiResponse(200, updated, `User ${updated.isActive ? 'enabled' : 'disabled'} successfully`));
});

// @desc    Change password
// @route   PATCH /api/v1/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 10) {
        throw new ApiError(400, "New password must be at least 10 characters long");
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new ApiError(401, "Current password is incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and increment tokenVersion to revoke other sessions
    await prisma.user.update({ 
        where: { id: req.user.id }, 
        data: { 
            password: hashedPassword,
            tokenVersion: { increment: 1 }
        } 
    });

    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'PASSWORD_CHANGE',
        resource: 'User',
        resourceId: req.user.id,
        details: {},
        schoolId: req.user.schoolId
    });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Helper for sending reset email (fallback to log in development)
const sendResetEmail = async (email, token, schoolId) => {
    try {
        const nodemailer = require('nodemailer');
        
        let settings = null;
        if (schoolId) {
            settings = await prisma.emailSetting.findFirst({
                where: { schoolId }
            });
        }
        
        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        
        if (settings && settings.isEnabled && settings.smtpHost && settings.smtpPort && settings.smtpUsername && settings.smtpPassword && settings.fromEmail) {
            const transporter = nodemailer.createTransport({
                host: settings.smtpHost,
                port: Number(settings.smtpPort),
                secure: settings.smtpEncryption === 'ssl' || String(settings.smtpPort) === '465',
                auth: {
                    user: settings.smtpUsername,
                    pass: settings.smtpPassword
                }
            });
            await transporter.sendMail({
                from: `"${settings.fromName || 'School Management System'}" <${settings.fromEmail}>`,
                to: email,
                subject: 'Reset Password - School Management System',
                text: `You requested a password reset. Please click on the link below to reset your password:\n\n${resetLink}`,
                html: `<p>You requested a password reset. Please click on the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`
            });
            console.log(`[EMAIL] Sent reset password email to ${email}`);
        } else if (process.env.NODE_ENV !== 'production') {
            console.log(`\n========================================\n[DEV-EMAIL-LOG] Password reset request for ${email}\nToken: ${token}\nReset Link: ${resetLink}\n========================================\n`);
        }
    } catch (error) {
        console.error('Failed to send reset email:', error);
    }
};

// @desc    Request password reset token
// @route   POST /api/v1/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
    let { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }
    email = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return 200 to prevent user enumeration
    if (!user) {
        return res.status(200).json(new ApiResponse(200, null, "If a user with this email exists, a password reset link has been sent."));
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordResetToken: resetTokenHash,
            passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiration
        }
    });

    await sendResetEmail(email, resetToken, user.schoolId);

    await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'User',
        resourceId: user.id,
        details: { email },
        schoolId: user.schoolId
    });

    return res.status(200).json(new ApiResponse(200, null, "If a user with this email exists, a password reset link has been sent."));
});

// @desc    Reset password using token
// @route   POST /api/v1/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        throw new ApiError(400, "Token and password are required");
    }

    if (password.length < 10) {
        throw new ApiError(400, "Password must be at least 10 characters long");
    }

    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
        where: {
            passwordResetToken: tokenHash,
            passwordResetExpires: { gte: new Date() }
        }
    });

    if (!user) {
        throw new ApiError(400, "Password reset token is invalid or has expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            tokenVersion: { increment: 1 }, // Revoke all current active sessions!
            loginAttempts: 0,
            lockUntil: null
        }
    });

    await logAudit({
        userId: user.id,
        userEmail: user.email,
        action: 'PASSWORD_RESET_SUCCESS',
        resource: 'User',
        resourceId: user.id,
        details: { email: user.email },
        schoolId: user.schoolId
    });

    return res.status(200).json(new ApiResponse(200, null, "Password reset successful. Please log in with your new password."));
});
