const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { ROLE_PERMISSIONS } = require('../config/permissions');

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
        select: { id: true, name: true, email: true, role: true, isActive: true, schoolId: true, tokenVersion: true }
    });

    if (!user) {
        throw new ApiError(401, "Unauthorized - User no longer exists");
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account has been disabled. Contact Super Admin.");
    }

    // Verify tokenVersion to support session revocation/sign-outs
    if (decoded.tokenVersion !== undefined && user.tokenVersion !== decoded.tokenVersion) {
        throw new ApiError(401, "Unauthorized - Session has been revoked. Please log in again.");
    }

    req.user = user;
    
    // Wrap the rest of the request in the AsyncLocalStorage context
    const { asyncLocalStorage } = require('../utils/als');
    asyncLocalStorage.run(user, () => {
        next();
    });
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

// ==========================================
// School Context / Tenant Isolation Middleware
// ==========================================
exports.requireSchoolContext = (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    
    if (req.user.role !== 'SUPER_ADMIN' && !req.user.schoolId) {
        throw new ApiError(403, "Access denied - No school context found for user");
    }
    
    // Note: schoolId is automatically injected into Prisma queries by the Prisma extension
    // We intentionally DO NOT inject it into req.body to avoid breaking Zod .strict() validation
    
    next();
};

// Tenant application routes must never be accessible to the platform-level
// Super Admin. Super Admins manage schools and platform users only.
exports.requireTenantUser = (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role === 'SUPER_ADMIN') {
        throw new ApiError(403, "Super Admin is a platform role and cannot access school tenant routes");
    }

    if (!req.user.schoolId) {
        throw new ApiError(403, "Access denied - No school context found for user");
    }

    next();
};

// Ensure the user is a platform-level user (Super Admin)
exports.requirePlatformUser = (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role !== 'SUPER_ADMIN') {
        throw new ApiError(403, "Access denied - Platform level access required");
    }

    next();
};

// ==========================================
// Ownership / Teacher Assignment Middleware (Base)
// ==========================================
// Note: Object-level validation is typically handled inside the controller or a service,
// but this base middleware ensures basic prerequisites.
exports.requireTeacherAssignment = (req, res, next) => {
    if (req.user.role !== 'TEACHER') {
        return next(); // Pass through if not a teacher (e.g. an ADMIN is making the request)
    }
    
    if (!req.user.staffId) {
        throw new ApiError(403, "Access denied - No staff record associated with this teacher account");
    }
    
    next();
};

// ==========================================
// Granular Permission Middleware
// ==========================================
exports.requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        const permissions = ROLE_PERMISSIONS[req.user.role] || [];
        if (!permissions.includes(permission)) {
            throw new ApiError(403, `Access denied - Required permission: ${permission}`);
        }

        next();
    };
};
