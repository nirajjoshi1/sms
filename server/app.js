const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./src/middleware/errorHandler");
const { verifyJWT } = require("./src/middleware/auth.middleware");

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

const app = express();

// Trust proxy for rate limiting and HTTPS detection
app.set("trust proxy", 1);

// Security: CORS configuration with production whitelist
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(origin => origin.trim())
    : ["http://localhost:5173"];

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
    allowedHeaders: ["Content-Type", "Authorization"]
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
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

// API status endpoint
app.get("/api/v1", (req, res) => {
    res.json({
        success: true,
        message: "School Management System API v1",
        version: "1.0.0",
        environment: process.env.NODE_ENV || "development"
    });
});

// Public Routes (no auth required) - with rate limiting
app.use("/api/v1/auth", authLimiter, authRoutes);

// 🔐 All routes below this line require authentication
app.use(verifyJWT);

// Apply general rate limiting to all protected routes
app.use("/api/v1", apiLimiter);

// Protected API Routes
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/academics", academicsRoutes);
app.use("/api/v1/student-setup", studentSetupRoutes);
app.use("/api/v1/hr", hrRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/cms", cmsRoutes);
app.use("/api/v1/schools", schoolRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

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

module.exports = app;
