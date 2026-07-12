const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { requirePermission, requireSchoolContext, authorizeRoles } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

// All routes require school context (except Super Admin)
router.use(requireSchoolContext);

// General settings routes
router.route('/general')
    .get(settingsController.getGeneralSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateGeneralSettings);

// Session routes
router.route('/sessions')
    .get(settingsController.getSessions)
    .post(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.createSession);

router.route('/sessions/:id')
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateSession)
    .delete(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.deleteSession);

router.put('/sessions/:id/set-current',
    requirePermission(PERMISSIONS.SETTINGS_MANAGE),
    settingsController.setCurrentSession
);

// Notification settings routes
router.route('/notifications')
    .get(settingsController.getNotificationSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateNotificationSettings);

// SMS settings routes
router.route('/sms')
    .get(settingsController.getSmsSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateSmsSettings);

router.post('/sms/test', requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.testSms);

// Email settings routes
router.route('/email')
    .get(settingsController.getEmailSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateEmailSettings);

router.post('/email/test', requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.testEmail);

// Payment settings routes
router.route('/payment')
    .get(settingsController.getPaymentSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updatePaymentSettings);

// Print settings routes
router.route('/print')
    .get(settingsController.getPrintSettings)
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updatePrintSettings);

// Backup routes
router.route('/backups')
    .get(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.getBackups)
    .post(authorizeRoles('SUPER_ADMIN'), settingsController.createBackup);

router.post('/backups/create', authorizeRoles('SUPER_ADMIN'), settingsController.createBackup);

router.route('/backups/:id')
    .delete(authorizeRoles('SUPER_ADMIN'), settingsController.deleteBackup);

router.get('/backups/:id/download', requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.downloadBackup);
router.post('/backups/:id/restore', authorizeRoles('SUPER_ADMIN'), settingsController.restoreBackup);

// Legacy routes (keep for backwards compatibility but secure them)
router.route('/')
    .get(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.getSettings)
    .post(requirePermission(PERMISSIONS.SETTINGS_MANAGE), settingsController.updateSetting);

module.exports = router;
