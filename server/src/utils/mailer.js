const nodemailer = require('nodemailer');
const prisma = require('../config/prisma');
const { asyncLocalStorage } = require('./als');

// Cache the default (environment or Ethereal-based) transporter since its config does not change at runtime
let defaultTransporter = null;

const getTransporter = async (schoolId) => {
    // 1. Try to get school-specific SMTP settings from database
    if (schoolId) {
        try {
            const settings = await prisma.emailSetting.findFirst({
                where: { schoolId, isEnabled: true }
            });
            if (settings && settings.smtpHost && settings.smtpPort && settings.smtpUsername && settings.smtpPassword) {
                console.log(`📨 Creating SMTP transporter for school: ${schoolId}`);
                return nodemailer.createTransport({
                    host: settings.smtpHost,
                    port: Number(settings.smtpPort),
                    secure: settings.smtpEncryption === 'ssl' || String(settings.smtpPort) === '465',
                    auth: {
                        user: settings.smtpUsername,
                        pass: settings.smtpPassword
                    },
                    connectionTimeout: 10000, // 10 seconds timeout
                    greetingTimeout: 10000,
                    socketTimeout: 10000
                });
            }
        } catch (dbError) {
            console.error(`❌ Error fetching SMTP settings for school ${schoolId}:`, dbError);
        }
    }

    // 2. Fallback to default transporter (from environment variables or Ethereal)
    if (defaultTransporter) return defaultTransporter;

    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
        defaultTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: String(process.env.SMTP_PORT) === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            connectionTimeout: 10000, // 10 seconds timeout
            greetingTimeout: 10000,
            socketTimeout: 10000
        });
        console.log("📨 Mailer initialized with production environment SMTP credentials.");
    } else {
        // Fallback to Ethereal Email for testing (ONLY in development)
        if (process.env.NODE_ENV === 'production') {
            console.warn("⚠️ No SMTP credentials found in production. Emails will be simulated.");
            defaultTransporter = {
                sendMail: async (mailOptions) => {
                    console.log(`[SIMULATED EMAIL] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
                    return { messageId: 'simulated-id-' + Date.now() };
                }
            };
        } else {
            console.log("⚠️ No SMTP credentials found. Creating an Ethereal test account...");
            try {
                const testAccount = await nodemailer.createTestAccount();
                defaultTransporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass,
                    },
                    connectionTimeout: 10000,
                    greetingTimeout: 10000,
                    socketTimeout: 10000
                });
                console.log("📨 Mailer initialized with Ethereal Test Account:", testAccount.user);
            } catch (etherealError) {
                console.error("❌ Failed to create Ethereal test account, using dummy logger:", etherealError);
                defaultTransporter = {
                    sendMail: async (mailOptions) => {
                        console.log(`[DUMMY EMAIL] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
                        return { messageId: 'dummy-id-' + Date.now() };
                    }
                };
            }
        }
    }
    
    return defaultTransporter;
};

/**
 * Sends an email using configured SMTP or fallback to Ethereal
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 * @param {string} [options.schoolId] - Optional schoolId to look up settings
 */
const sendEmail = async ({ to, subject, html, attachments, schoolId }) => {
    if (!to) {
        console.warn("⚠️ sendEmail aborted: No 'to' address provided.");
        return null;
    }

    // Try to get schoolId from active request context if not explicitly passed
    let finalSchoolId = schoolId;
    if (!finalSchoolId) {
        const store = asyncLocalStorage.getStore();
        if (store && store.schoolId) {
            finalSchoolId = store.schoolId;
        }
    }

    try {
        const mailTransporter = await getTransporter(finalSchoolId);

        // Determine the appropriate from email/name
        let fromHeader = process.env.SMTP_FROM || '"School Management" <noreply@school.com>';
        if (finalSchoolId) {
            try {
                const settings = await prisma.emailSetting.findFirst({
                    where: { schoolId: finalSchoolId, isEnabled: true }
                });
                if (settings && settings.fromEmail) {
                    fromHeader = `"${settings.fromName || 'School Management'}" <${settings.fromEmail}>`;
                }
            } catch (err) {
                // Ignore and use default
            }
        }

        const info = await mailTransporter.sendMail({
            from: fromHeader,
            to,
            subject,
            html,
            ...(attachments && { attachments })
        });

        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        
        // If using Ethereal, log the preview URL so the user can see the test email
        if (info.messageId && mailTransporter.options && mailTransporter.options.host === "smtp.ethereal.email") {
            console.log(`🌐 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }

        return info;
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return null;
    }
};

module.exports = { sendEmail };
