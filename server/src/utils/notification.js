const prisma = require('../config/prisma');
const { asyncLocalStorage } = require('./als');
const { sendEmail } = require('./mailer');

/**
 * Creates a school-scoped notification in the database and optionally sends an email
 * @param {Object} notificationData
 * @param {string} notificationData.title
 * @param {string} notificationData.message
 * @param {string} [notificationData.type="info"] - 'info' | 'success' | 'warning' | 'error' | 'admission' | 'fee' | 'leave'
 * @param {string} [notificationData.userId] - Optional: targets a specific user. If null, broadcasts (unless targetEmail is only intended recipient).
 * @param {string} [notificationData.targetEmail] - Optional: email address to send the notification to.
 * @param {boolean} [notificationData.skipInApp=false] - Optional: If true, only sends an email, skipping DB creation.
 * @param {string} [notificationData.emailHtml] - Optional: Custom HTML template for the email.
 */
const createNotification = async ({ title, message, type = 'info', userId = null, targetEmail = null, skipInApp = false, emailHtml = null, attachments = null }) => {
    try {
        let notification = null;
        
        if (!skipInApp) {
            // The Prisma ALS extension will automatically scope this to the current school
            notification = await prisma.notification.create({
                data: {
                    title,
                    message,
                    type,
                    userId
                }
            });
        }

        if (targetEmail) {
            // Send email asynchronously in the background so it does not block the HTTP response
            sendEmail({
                to: targetEmail,
                subject: title,
                html: emailHtml || `<div style="font-family: sans-serif; padding: 20px;">
                    <h2>${title}</h2>
                    <p>${message}</p>
                    <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
                    <p style="color: #666; font-size: 12px;">This is an automated message from the School Management System.</p>
                </div>`,
                attachments
            }).catch(err => {
                console.error(`❌ Background email sending failed to ${targetEmail}:`, err);
            });
        }

        return notification;
    } catch (error) {
        console.error("Failed to process notification:", error);
        return null;
    }
};

module.exports = { createNotification };
