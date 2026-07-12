/**
 * Centralized Email Service
 * Wraps nodemailer with reusable transporter and template-based helpers.
 * Replaces inline nodemailer usage scattered across controllers.
 */

const nodemailer = require('nodemailer');

// Lazily create transporter so missing env vars only error on actual send
let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email configuration missing. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
    }

    _transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    return _transporter;
};

/**
 * Core send helper — all other functions route through here.
 * @param {Object} opts - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'School Management'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
    });
    return info;
};

/**
 * Send password reset email.
 * @param {string} to - Recipient email
 * @param {string} resetUrl - Full reset URL with token
 * @param {string} name - Recipient name
 */
const sendPasswordResetEmail = async (to, resetUrl, name = 'User') => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 10px;">Password Reset Request</h2>
            <p style="color: #555;">Hello <strong>${name}</strong>,</p>
            <p style="color: #555;">You requested a password reset. Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color: #888; font-size: 12px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 11px;">School Management System &bull; Do not reply to this email.</p>
        </div>
    `;
    return sendEmail({ to, subject: 'Password Reset Request', html });
};

/**
 * Send fee payment receipt.
 * @param {string} to - Parent/student email
 * @param {Object} payment - Payment details { studentName, amount, receiptNo, date, schoolName }
 */
const sendFeeReceiptEmail = async (to, payment) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #059669; margin-bottom: 10px;">Fee Payment Receipt</h2>
            <p style="color: #555;">Dear Parent/Guardian,</p>
            <p style="color: #555;">This is to confirm that a fee payment has been received for <strong>${payment.studentName}</strong>.</p>
            <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #e5e7eb;"><th style="padding: 8px; text-align: left; border: 1px solid #d1d5db;">Details</th><th style="padding: 8px; border: 1px solid #d1d5db;"></th></tr>
                <tr><td style="padding: 8px; border: 1px solid #d1d5db;">Receipt No</td><td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold;">${payment.receiptNo}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #d1d5db;">Student</td><td style="padding: 8px; border: 1px solid #d1d5db;">${payment.studentName}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #d1d5db;">Amount Paid</td><td style="padding: 8px; border: 1px solid #d1d5db; font-weight: bold; color: #059669;">₹${Number(payment.amount).toLocaleString()}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #d1d5db;">Date</td><td style="padding: 8px; border: 1px solid #d1d5db;">${payment.date}</td></tr>
                <tr><td style="padding: 8px; border: 1px solid #d1d5db;">School</td><td style="padding: 8px; border: 1px solid #d1d5db;">${payment.schoolName}</td></tr>
            </table>
            <p style="color: #888; font-size: 11px;">School Management System &bull; Do not reply to this email.</p>
        </div>
    `;
    return sendEmail({ to, subject: `Fee Receipt #${payment.receiptNo} — ${payment.schoolName}`, html });
};

/**
 * Send fee due reminder.
 * @param {string} to - Parent/student email
 * @param {Object} reminder - { studentName, dueAmount, dueDate, schoolName }
 */
const sendFeeDueReminderEmail = async (to, reminder) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff8f1; border-radius: 8px; border: 1px solid #fed7aa;">
            <h2 style="color: #d97706; margin-bottom: 10px;">⚠ Fee Due Reminder</h2>
            <p style="color: #555;">Dear Parent/Guardian,</p>
            <p style="color: #555;">This is a reminder that the following fee is due for <strong>${reminder.studentName}</strong>:</p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #fde68a;">
                <p style="margin: 4px 0;"><strong>Due Amount:</strong> <span style="color: #d97706; font-size: 20px; font-weight: bold;">₹${Number(reminder.dueAmount).toLocaleString()}</span></p>
                ${reminder.dueDate ? `<p style="margin: 4px 0;"><strong>Due Date:</strong> ${reminder.dueDate}</p>` : ''}
                <p style="margin: 4px 0;"><strong>School:</strong> ${reminder.schoolName}</p>
            </div>
            <p style="color: #555;">Please clear the dues at the earliest to avoid any late fees.</p>
            <p style="color: #888; font-size: 11px;">School Management System &bull; Do not reply to this email.</p>
        </div>
    `;
    return sendEmail({ to, subject: `Fee Due Reminder — ${reminder.studentName}`, html });
};

/**
 * Send a generic notification email (for admin broadcasts).
 * @param {string|string[]} to - Recipient(s)
 * @param {string} subject
 * @param {string} message - Plain text body
 * @param {string} schoolName
 */
const sendNotificationEmail = async (to, subject, message, schoolName = 'School') => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 10px;">${subject}</h2>
            <p style="color: #555; white-space: pre-line;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #888; font-size: 11px;">${schoolName} &bull; School Management System</p>
        </div>
    `;
    return sendEmail({ to: Array.isArray(to) ? to.join(',') : to, subject, html });
};

/**
 * Verify SMTP connection — used by the settings page test email feature.
 */
const verifyConnection = async () => {
    const transporter = getTransporter();
    return transporter.verify();
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendFeeReceiptEmail,
    sendFeeDueReminderEmail,
    sendNotificationEmail,
    verifyConnection
};
