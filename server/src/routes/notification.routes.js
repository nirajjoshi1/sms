const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.route('/')
    .get(notificationController.getNotifications)
    .delete(notificationController.clearAllNotifications);

router.put('/read-all', notificationController.markAllAsRead);

router.route('/:id')
    .delete(notificationController.deleteNotification);

router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
