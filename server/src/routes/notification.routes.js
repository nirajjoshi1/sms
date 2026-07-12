const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');

router.use(requireSchoolContext);

router.route('/')
    .get(notificationController.getNotifications)
    .delete(notificationController.clearAllNotifications);

router.put('/read-all', notificationController.markAllAsRead);

router.route('/:id')
    .delete(notificationController.deleteNotification);

router.put('/:id/read', notificationController.markAsRead);

router.post('/broadcast', verifyJWT, authorizeRoles('ADMIN', 'SUPER_ADMIN'), notificationController.createBroadcastNotification);

module.exports = router;
