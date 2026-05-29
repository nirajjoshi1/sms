const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// ==========================================
// JWT Verification Middleware
// ==========================================
exports.verifyJWT = asyncHandler(async (req, res, next) => {
    // Support both cookie and Authorization header (Bearer token)
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
        throw new ApiError(401, "Unauthorized - No token provided");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new ApiError(401, "Unauthorized - Invalid or expired token");
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized - User no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been disabled. Contact Super Admin.");
    }

    req.user = user;
    next();
});

// ==========================================
// Role-Based Access Control (RBAC) Middleware
// ==========================================
// Usage: authorizeRoles('SUPER_ADMIN', 'ADMIN')
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied - Required role: ${roles.join(' or ')}`);
        }
        next();
    };
};
