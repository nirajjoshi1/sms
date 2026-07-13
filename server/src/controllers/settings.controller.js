
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const prisma = require('../config/prisma');
const nodemailer = require('nodemailer');
const { Prisma } = require('@prisma/client');
const fs = require('fs/promises');
const path = require('path');

const pick = (source, keys) => keys.reduce((data, key) => {
    if (source[key] !== undefined) data[key] = source[key];
    return data;
}, {});

const maskSecret = (secret) => secret ? '********' : '';

const upsertSingle = async (model, data) => {
    const existing = await model.findFirst();
    return existing
        ? model.update({ where: { id: existing.id }, data })
        : model.create({ data });
};

const getSingleOrDefault = async (model, defaults) => {
    const settings = await model.findFirst();
    return settings || defaults;
};

const generalFields = [
    'schoolName', 'schoolCode', 'address', 'city', 'state', 'country', 'pincode',
    'phone', 'email', 'website', 'logo', 'favicon', 'currency', 'currencySymbol',
    'dateFormat', 'timeFormat', 'timezone', 'language'
];

const notificationFields = [
    'emailNotifications', 'smsNotifications', 'pushNotifications', 'admissionNotification',
    'feePaymentNotification', 'attendanceNotification', 'examResultNotification',
    'homeworkNotification', 'leaveNotification', 'birthdayNotification',
    'eventNotification', 'newsNotification'
];

const smsFields = [
    'provider', 'twilioAccountSid', 'twilioAuthToken', 'twilioPhoneNumber',
    'nexmoApiKey', 'nexmoApiSecret', 'nexmoPhoneNumber', 'msg91AuthKey',
    'msg91SenderId', 'isEnabled'
];

const emailFields = [
    'mailDriver', 'smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword',
    'smtpEncryption', 'fromEmail', 'fromName', 'isEnabled'
];

const paymentFields = [
    'cashEnabled', 'stripeEnabled', 'stripePublishableKey', 'stripeSecretKey',
    'paypalEnabled', 'paypalClientId', 'paypalSecret', 'paypalMode',
    'razorpayEnabled', 'razorpayKeyId', 'razorpayKeySecret', 'bankTransferEnabled',
    'bankName', 'accountNumber', 'accountName', 'ifscCode', 'branchName',
    'chequeEnabled', 'chequePayableTo'
];

const printFields = [
    'headerText', 'headerLeftLogo', 'headerRightLogo', 'footerText',
    'showHeader', 'showFooter', 'showSchoolName', 'showSchoolAddress',
    'showSchoolPhone', 'showSchoolEmail', 'showSchoolWebsite',
    'showPageNumber', 'showDate'
];

const defaults = {
    general: {
        schoolName: '', schoolCode: '', address: '', city: '', state: '', country: 'Nepal',
        pincode: '', phone: '', email: '', website: '', logo: '', favicon: '',
        currency: 'NPR', currencySymbol: 'Rs.', dateFormat: 'YYYY/MM/DD',
        timeFormat: '12', timezone: 'Asia/Kathmandu', language: 'en'
    },
    notifications: {
        emailNotifications: true, smsNotifications: false, pushNotifications: true,
        admissionNotification: true, feePaymentNotification: true, attendanceNotification: true,
        examResultNotification: true, homeworkNotification: true, leaveNotification: true,
        birthdayNotification: false, eventNotification: true, newsNotification: false
    },
    sms: {
        provider: 'twilio', twilioAccountSid: '', twilioAuthToken: '', twilioPhoneNumber: '',
        nexmoApiKey: '', nexmoApiSecret: '', nexmoPhoneNumber: '', msg91AuthKey: '',
        msg91SenderId: '', isEnabled: false
    },
    email: {
        mailDriver: 'smtp', smtpHost: '', smtpPort: '587', smtpUsername: '',
        smtpPassword: '', smtpEncryption: 'tls', fromEmail: '', fromName: '',
        isEnabled: false
    },
    payment: {
        cashEnabled: true, stripeEnabled: false, stripePublishableKey: '', stripeSecretKey: '',
        paypalEnabled: false, paypalClientId: '', paypalSecret: '', paypalMode: 'sandbox',
        razorpayEnabled: false, razorpayKeyId: '', razorpayKeySecret: '',
        bankTransferEnabled: true, bankName: '', accountNumber: '', accountName: '',
        ifscCode: '', branchName: '', chequeEnabled: true, chequePayableTo: ''
    },
    print: {
        headerText: '', headerLeftLogo: '', headerRightLogo: '', footerText: '',
        showHeader: true, showFooter: true, showSchoolName: true, showSchoolAddress: true,
        showSchoolPhone: true, showSchoolEmail: true, showSchoolWebsite: true,
        showPageNumber: true, showDate: true
    }
};

const backupDir = path.join(__dirname, '..', '..', 'backups');
const getDelegateName = (modelName) => `${modelName.charAt(0).toLowerCase()}${modelName.slice(1)}`;

// =====================================
// System Settings Controllers
// =====================================
exports.getSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.systemSetting.findMany();
    
    // Convert array to object for easier consumption
    const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
    
    res.status(200).json(new ApiResponse(200, settingsMap, "Settings fetched successfully"));
});

exports.updateSetting = asyncHandler(async (req, res) => {
    const { key, value } = req.body;

    const existing = await prisma.systemSetting.findFirst({ where: { key } });
    let setting;
    if (existing) {
        setting = await prisma.systemSetting.update({
            where: { id: existing.id },
            data: { value: String(value) }
        });
    } else {
        setting = await prisma.systemSetting.create({
            data: { schoolId: req.user.schoolId, key, value: String(value) }
        });
    }

    res.status(200).json(new ApiResponse(200, setting, "Setting updated successfully"));
});

// =====================================
// General Settings
// =====================================
exports.getGeneralSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.generalSetting, defaults.general);
    res.status(200).json(new ApiResponse(200, settings, "General settings fetched successfully"));
});

exports.updateGeneralSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, generalFields);
    if (!data.schoolName?.trim()) {
        throw new ApiError(400, "School name is required");
    }

    const settings = await upsertSingle(prisma.generalSetting, data);
    res.status(200).json(new ApiResponse(200, settings, "General settings updated successfully"));
});

// =====================================
// Academic Session Settings
// =====================================
exports.getSessions = asyncHandler(async (req, res) => {
    const sessions = await prisma.academicSession.findMany({
        where: { schoolId: req.user.schoolId },

        orderBy: { startDate: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

exports.createSession = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name?.trim() || !startDate || !endDate) {
        throw new ApiError(400, "Session name, start date and end date are required");
    }
    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError(400, "End date must be after start date");
    }

    if (isCurrent) {
        await prisma.academicSession.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false }
        });
    }

    const session = await prisma.academicSession.create({
        data: { schoolId: req.user.schoolId, name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent }
    });

    res.status(201).json(new ApiResponse(201, session, "Session created successfully"));
});

exports.updateSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent } = req.body;
    if (!name?.trim() || !startDate || !endDate) {
        throw new ApiError(400, "Session name, start date and end date are required");
    }
    if (new Date(startDate) >= new Date(endDate)) {
        throw new ApiError(400, "End date must be after start date");
    }

    if (isCurrent) {
        await prisma.academicSession.updateMany({
            where: { isCurrent: true, id: { not: id } },
            data: { isCurrent: false }
        });
    }

    const session = await prisma.academicSession.update({
        where: { id },
        data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent }
    });

    res.status(200).json(new ApiResponse(200, session, "Session updated successfully"));
});

exports.deleteSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ApiError } = require('../utils/ApiError');

    const session = await prisma.academicSession.findUnique({ where: { id } });
    if (session?.isCurrent) {
        throw new ApiError(400, "Cannot delete current session");
    }

    await prisma.academicSession.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Session deleted successfully"));
});

exports.setCurrentSession = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.academicSession.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
    });

    const session = await prisma.academicSession.update({
        where: { id },
        data: { isCurrent: true }
    });

    res.status(200).json(new ApiResponse(200, session, "Current session updated successfully"));
});

// =====================================
// Notification Settings
// =====================================
exports.getNotificationSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.notificationSetting, defaults.notifications);
    res.status(200).json(new ApiResponse(200, settings, "Notification settings fetched successfully"));
});

exports.updateNotificationSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, notificationFields);
    const settings = await upsertSingle(prisma.notificationSetting, data);

    res.status(200).json(new ApiResponse(200, settings, "Notification settings updated successfully"));
});

// =====================================
// SMS Settings
// =====================================
exports.getSmsSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.smsSetting, defaults.sms);
    if (settings) {
        settings.twilioAuthToken = maskSecret(settings.twilioAuthToken);
        settings.nexmoApiSecret = maskSecret(settings.nexmoApiSecret);
        settings.msg91AuthKey = maskSecret(settings.msg91AuthKey);
    }
    res.status(200).json(new ApiResponse(200, settings, "SMS settings fetched successfully"));
});

exports.updateSmsSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, smsFields);
    
    // Prevent overwriting with masked values
    ['twilioAuthToken', 'nexmoApiSecret', 'msg91AuthKey'].forEach(field => {
        if (data[field] === '********') delete data[field];
    });

    const settings = await upsertSingle(prisma.smsSetting, data);

    res.status(200).json(new ApiResponse(200, settings, "SMS settings updated successfully"));
});

exports.testSms = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber?.trim()) {
        throw new ApiError(400, "Phone number is required");
    }

    const settings = await prisma.smsSetting.findFirst();
    if (!settings?.isEnabled) {
        throw new ApiError(400, "SMS gateway is disabled");
    }

    if (settings.provider === 'twilio') {
        if (!settings.twilioAccountSid || !settings.twilioAuthToken || !settings.twilioPhoneNumber) {
            throw new ApiError(400, "Twilio Account SID, auth token and phone number are required");
        }

        const auth = Buffer.from(`${settings.twilioAccountSid}:${settings.twilioAuthToken}`).toString('base64');
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${settings.twilioAccountSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    To: phoneNumber,
                    From: settings.twilioPhoneNumber,
                    Body: 'Test SMS from School Management System.'
                })
            }
        );

        if (!response.ok) {
            const error = await response.text();
            throw new ApiError(400, `Twilio test failed: ${error.slice(0, 300)}`);
        }
    } else {
        throw new ApiError(400, `${settings.provider} SMS test is not implemented yet`);
    }

    res.status(200).json(new ApiResponse(200, null, "Test SMS sent successfully"));
});

// =====================================
// Email Settings
// =====================================
exports.getEmailSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.emailSetting, defaults.email);
    if (settings) {
        settings.smtpPassword = maskSecret(settings.smtpPassword);
    }
    res.status(200).json(new ApiResponse(200, settings, "Email settings fetched successfully"));
});

exports.updateEmailSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, emailFields);
    
    if (data.smtpPassword === '********') {
        delete data.smtpPassword;
    }

    const settings = await upsertSingle(prisma.emailSetting, data);

    res.status(200).json(new ApiResponse(200, settings, "Email settings updated successfully"));
});

exports.testEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email?.trim()) {
        throw new ApiError(400, "Recipient email is required");
    }

    const settings = await prisma.emailSetting.findFirst();
    if (!settings?.isEnabled) {
        throw new ApiError(400, "Email service is disabled");
    }
    if (settings.mailDriver !== 'smtp') {
        throw new ApiError(400, "Only SMTP test email is currently supported");
    }
    if (!settings.smtpHost || !settings.smtpPort || !settings.smtpUsername || !settings.smtpPassword || !settings.fromEmail) {
        throw new ApiError(400, "SMTP host, port, username, password and from email are required");
    }

    const transporter = nodemailer.createTransport({
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

    await transporter.verify();
    await transporter.sendMail({
        from: `"${settings.fromName || 'School Management System'}" <${settings.fromEmail}>`,
        to: email,
        subject: 'School Management System test email',
        text: 'Your email settings are working.',
        html: '<p>Your email settings are working.</p>'
    });

    res.status(200).json(new ApiResponse(200, null, "Test email sent successfully"));
});

// =====================================
// Payment Settings
// =====================================
exports.getPaymentSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.paymentSetting, defaults.payment);
    if (settings) {
        settings.stripeSecretKey = maskSecret(settings.stripeSecretKey);
        settings.paypalSecret = maskSecret(settings.paypalSecret);
        settings.razorpayKeySecret = maskSecret(settings.razorpayKeySecret);
    }
    res.status(200).json(new ApiResponse(200, settings, "Payment settings fetched successfully"));
});

exports.updatePaymentSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, paymentFields);
    
    ['stripeSecretKey', 'paypalSecret', 'razorpayKeySecret'].forEach(field => {
        if (data[field] === '********') delete data[field];
    });

    const settings = await upsertSingle(prisma.paymentSetting, data);

    res.status(200).json(new ApiResponse(200, settings, "Payment settings updated successfully"));
});

// =====================================
// Print Settings
// =====================================
exports.getPrintSettings = asyncHandler(async (req, res) => {
    const settings = await getSingleOrDefault(prisma.printSetting, defaults.print);
    res.status(200).json(new ApiResponse(200, settings, "Print settings fetched successfully"));
});

exports.updatePrintSettings = asyncHandler(async (req, res) => {
    const data = pick(req.body, printFields);
    const settings = await upsertSingle(prisma.printSetting, data);

    res.status(200).json(new ApiResponse(200, settings, "Print settings updated successfully"));
});

// =====================================
// Backup & Restore
// =====================================
exports.getBackups = asyncHandler(async (req, res) => {
    const backups = await prisma.backup.findMany({
        where: { schoolId: req.user.schoolId },

        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, backups, "Backups fetched successfully"));
});

exports.createBackup = asyncHandler(async (req, res) => {
    const schoolDir = req.user.schoolId ? path.join(backupDir, req.user.schoolId) : path.join(backupDir, 'global');
    await fs.mkdir(schoolDir, { recursive: true });

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(schoolDir, filename);
    const data = {};

    for (const model of Prisma.dmmf.datamodel.models) {
        // Skip System/Platform models that are sensitive or not tenant-owned for standard admins
        const systemModels = ['School', 'User', 'Backup', 'AuditLog'];
        if (req.user.role !== 'SUPER_ADMIN' && systemModels.includes(model.name)) {
            continue;
        }

        const delegate = prisma[getDelegateName(model.name)];
        if (delegate?.findMany) {
            data[model.name] = await delegate.findMany();
        }
    }

    const payload = {
        version: 1,
        createdAt: new Date().toISOString(),
        models: data
    };

    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
    const stats = await fs.stat(filePath);

    const backup = await prisma.backup.create({
        data: { schoolId: req.user.schoolId,
            filename,
            fileSize: stats.size,
            filePath
        }
    });

    res.status(201).json(new ApiResponse(201, backup, "Backup created successfully"));
});

exports.downloadBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new ApiError(404, "Backup not found");
    }

    // Path traversal safety check
    const schoolDir = req.user.schoolId ? path.join(backupDir, req.user.schoolId) : path.join(backupDir, 'global');
    const normalizedTarget = path.normalize(backup.filePath);
    const normalizedPrefix = path.normalize(schoolDir);
    if (!normalizedTarget.startsWith(normalizedPrefix)) {
        throw new ApiError(403, "Access Denied: Path traversal or cross-tenant backup access detected.");
    }

    try {
        await fs.access(backup.filePath);
    } catch (error) {
        throw new ApiError(404, "Backup file no longer exists on this server");
    }

    res.download(backup.filePath, backup.filename);
});

exports.restoreBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new ApiError(404, "Backup not found");
    }

    throw new ApiError(501, "Automatic restore is disabled. Download the backup and restore it manually after verification.");
});

exports.deleteBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new ApiError(404, "Backup not found");
    }

    // Path traversal safety check
    const schoolDir = req.user.schoolId ? path.join(backupDir, req.user.schoolId) : path.join(backupDir, 'global');
    const normalizedTarget = path.normalize(backup.filePath);
    const normalizedPrefix = path.normalize(schoolDir);
    if (!normalizedTarget.startsWith(normalizedPrefix)) {
        throw new ApiError(403, "Access Denied: Path traversal or cross-tenant backup access detected.");
    }

    await prisma.backup.delete({ where: { id } });
    if (backup.filePath) {
        await fs.unlink(backup.filePath).catch(() => {});
    }
    res.status(200).json(new ApiResponse(200, null, "Backup deleted successfully"));
});
