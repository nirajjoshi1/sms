const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./src/middleware/errorHandler");
const { verifyJWT, requireTenantUser } = require("./src/middleware/auth.middleware");

// Import routes
const authRoutes = require("./src/routes/auth.routes");
const studentRoutes = require("./src/routes/student.routes");
const staffRoutes = require("./src/routes/staff.routes");
const academicsRoutes = require("./src/routes/academics.routes");
const studentSetupRoutes = require("./src/routes/studentSetup.routes");
const hrRoutes = require("./src/routes/hr.routes");
const settingsRoutes = require("./src/routes/settings.routes");
const financeRoutes = require("./src/routes/finance.routes");
const certificateRoutes = require("./src/routes/certificate.routes");
const feesRoutes = require("./src/routes/fees.routes");
const incomeRoutes = require("./src/routes/income.routes");
const expenseRoutes = require("./src/routes/expense.routes");
const cmsRoutes = require("./src/routes/cms.routes");
const schoolRoutes = require("./src/routes/school.routes");
const uploadRoutes = require("./src/routes/upload.routes");
const dashboardRoutes = require("./src/routes/dashboard.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const teacherRoutes = require("./src/routes/teacher.routes");
const schoolRequestRoutes = require("./src/routes/schoolRequest.routes");
const reportRoutes = require("./src/routes/report.routes");

const app = express();

// Trust proxy for rate limiting and HTTPS detection
app.set("trust proxy", 1);

// Security: CORS configuration with production whitelist
const allowedOrigins = [
    ...(process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(",").map(origin => origin.trim())
        : ["http://localhost:5173"]),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [])
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Security: Enhanced Helmet configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Logging: Use different formats for dev vs production
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Body parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Rate limiting for auth routes (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many login attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: "Too many requests from this IP, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check endpoint (for monitoring)
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Debug endpoint completely removed as per security audit requirements

// API status endpoint
app.get("/api/v1", (req, res) => {
    res.json({
        success: true,
        message: "School Management System API v1",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// CSRF Protection for API (Enforce JSON or AJAX for mutations)
const csrfProtection = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const contentType = req.headers['content-type'] || '';
        const requestedWith = req.headers['x-requested-with'] || '';
        
        // Strictly require x-requested-with header for CSRF
        if (requestedWith !== 'XMLHttpRequest') {
             return res.status(403).json({ success: false, message: 'CSRF token missing or incorrect headers.' });
        }
        
        // For endpoints with a body (POST, PUT, PATCH), enforce application/json or multipart/form-data
        if (req.method !== 'DELETE' && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
            return res.status(403).json({ success: false, message: 'Invalid Content-Type. CSRF protection requires application/json or multipart/form-data.' });
        }
    }
    next();
};

app.use(csrfProtection);

// Conditional rate limiting middleware wrapper
const conditionalAuthLimiter = process.env.NODE_ENV === 'production' ? authLimiter : (req, res, next) => next();
const conditionalApiLimiter = process.env.NODE_ENV === 'production' ? apiLimiter : (req, res, next) => next();

// Reset password rate limiter
const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
    message: "Too many password reset attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
});
const conditionalResetLimiter = process.env.NODE_ENV === 'production' ? resetLimiter : (req, res, next) => next();

// Public Routes (no auth required) - with rate limiting
app.use("/api/v1/auth/forgot-password", conditionalResetLimiter);
app.use("/api/v1/auth/reset-password", conditionalResetLimiter);
app.use("/api/v1/auth", conditionalAuthLimiter, authRoutes);
app.use("/api/v1/school-requests", schoolRequestRoutes);
app.use("/api/v1/public/certificates", require("./src/routes/publicCertificate.routes"));
app.use("/api/v1/public/identities", conditionalApiLimiter, require("./src/routes/publicIdentity.routes"));

// 🔐 All routes below this line require authentication
app.use(verifyJWT);

// Apply general rate limiting to all protected routes
app.use("/api/v1", conditionalApiLimiter);

// Protected API Routes
app.use("/api/v1/students", requireTenantUser, studentRoutes);
app.use("/api/v1/staff", requireTenantUser, staffRoutes);
app.use("/api/v1/academics", requireTenantUser, academicsRoutes);
app.use("/api/v1/student-setup", requireTenantUser, studentSetupRoutes);
app.use("/api/v1/hr", requireTenantUser, hrRoutes);
app.use("/api/v1/settings", requireTenantUser, settingsRoutes);
// app.use("/api/v1/finance", requireTenantUser, financeRoutes); // DEPRECATED: Unused and insecure (use /income and /expenses directly)
app.use("/api/v1/certificates", requireTenantUser, certificateRoutes);
app.use("/api/v1/fees", requireTenantUser, feesRoutes);
app.use("/api/v1/income", requireTenantUser, incomeRoutes);
app.use("/api/v1/expenses", requireTenantUser, expenseRoutes);
app.use("/api/v1/cms", requireTenantUser, cmsRoutes);
app.use("/api/v1/schools", schoolRoutes);
app.use("/api/v1/upload", requireTenantUser, uploadRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/teacher", requireTenantUser, teacherRoutes);
app.use("/api/v1/reports", requireTenantUser, reportRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

// Global Error Handler
app.use(errorHandler);

// For Vercel serverless
if (process.env.VERCEL) {
    module.exports = app;
} else {
    module.exports = app;
}

module.exports = app;
