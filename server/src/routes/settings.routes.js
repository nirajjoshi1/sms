const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authorizeRoles } = require('../middleware/auth.middleware');

// General settings routes
router.route('/general')
    .get(settingsController.getGeneralSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updateGeneralSettings);

// Session routes
router.route('/sessions')
    .get(settingsController.getSessions)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.createSession);

router.route('/sessions/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updateSession)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.deleteSession);

router.put('/sessions/:id/set-current',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    settingsController.setCurrentSession
);

// Notification settings routes
router.route('/notifications')
    .get(settingsController.getNotificationSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updateNotificationSettings);

// SMS settings routes
router.route('/sms')
    .get(settingsController.getSmsSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updateSmsSettings);

router.post('/sms/test', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.testSms);

// Email settings routes
router.route('/email')
    .get(settingsController.getEmailSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updateEmailSettings);

router.post('/email/test', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.testEmail);

// Payment settings routes
router.route('/payment')
    .get(settingsController.getPaymentSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updatePaymentSettings);

// Print settings routes
router.route('/print')
    .get(settingsController.getPrintSettings)
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.updatePrintSettings);

// Backup routes
router.route('/backups')
    .get(authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.getBackups)
    .post(authorizeRoles('SUPER_ADMIN'), settingsController.createBackup);

router.post('/backups/create', authorizeRoles('SUPER_ADMIN'), settingsController.createBackup);

router.route('/backups/:id')
    .delete(authorizeRoles('SUPER_ADMIN'), settingsController.deleteBackup);

router.get('/backups/:id/download', authorizeRoles('SUPER_ADMIN', 'ADMIN'), settingsController.downloadBackup);
router.post('/backups/:id/restore', authorizeRoles('SUPER_ADMIN'), settingsController.restoreBackup);

// Legacy routes (keep for backwards compatibility)
router.route('/')
    .get(settingsController.getSettings)
    .post(settingsController.updateSetting);

module.exports = router;
