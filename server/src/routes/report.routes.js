const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

// All reports routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Student Report
router.get('/student', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getStudentReport);

// Attendance Report
router.get('/attendance', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getAttendanceReport);

// Finance Report
router.get('/finance', requirePermission(PERMISSIONS.REPORTS_FINANCE), reportController.getFinanceReport);

// HR Report
router.get('/hr', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getHRReport);

// Homework Report
router.get('/homework', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'TEACHER'), reportController.getHomeworkReport);

// Alumni Report
router.get('/alumni', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getAlumniReport);

// Audit Trail Report
router.get('/audit-trail', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getAuditTrail);

// User Logs Report
router.get('/user-logs', requirePermission(PERMISSIONS.REPORTS_STUDENT), reportController.getUserLogs);

module.exports = router;
