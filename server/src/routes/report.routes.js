const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

// All reports routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Student Report
router.get('/student', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getStudentReport);

// Attendance Report
router.get('/attendance', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getAttendanceReport);

// Finance Report
router.get('/finance', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'), reportController.getFinanceReport);

// HR Report
router.get('/hr', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getHRReport);

// Homework Report
router.get('/homework', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), reportController.getHomeworkReport);

// Alumni Report
router.get('/alumni', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getAlumniReport);

// Audit Trail Report
router.get('/audit-trail', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getAuditTrail);

// User Logs Report
router.get('/user-logs', authorizeRoles('SUPER_ADMIN', 'ADMIN'), reportController.getUserLogs);

module.exports = router;
