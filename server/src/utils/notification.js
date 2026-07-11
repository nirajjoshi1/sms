const prisma = require('../config/prisma');
const { asyncLocalStorage } = require('./als');

/**
 * Creates a school-scoped notification in the database
 * @param {Object} notificationData
 * @param {string} notificationData.title
 * @param {string} notificationData.message
 * @param {string} [notificationData.type="info"] - 'info' | 'success' | 'warning' | 'error' | 'admission' | 'fee' | 'leave'
 * @param {string} [notificationData.userId] - Optional: targets a specific user. If null, it is broadcast to all school users.
 */
const createNotification = async ({ title, message, type = 'info', userId = null }) => {
    try {
        // The Prisma ALS extension will automatically scope this to the current school
        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type,
                userId
            }
        });
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
        return null;
    }
};

module.exports = { createNotification };
