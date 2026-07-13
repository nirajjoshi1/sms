const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = async () => {
    if (transporter) return transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
        // Use provided SMTP credentials
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log("📨 Mailer initialized with production SMTP credentials.");
    } else {
        // Fallback to Ethereal Email for testing
        console.log("⚠️ No SMTP credentials found. Creating an Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log("📨 Mailer initialized with Ethereal Test Account:", testAccount.user);
    }
    
    return transporter;
};

/**
 * Sends an email using configured SMTP or fallback to Ethereal
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
    if (!to) {
        console.warn("⚠️ sendEmail aborted: No 'to' address provided.");
        return null;
    }

    try {
        const mailTransporter = await createTransporter();
        const info = await mailTransporter.sendMail({
            from: process.env.SMTP_FROM || '"School Management" <noreply@school.com>',
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        
        // If using Ethereal, log the preview URL so the user can see the test email
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log(`🌐 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return null;
    }
};

module.exports = { sendEmail };
