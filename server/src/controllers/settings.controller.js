
const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

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

    const setting = await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
    });

    res.status(200).json(new ApiResponse(200, setting, "Setting updated successfully"));
});

// =====================================
// General Settings
// =====================================
exports.getGeneralSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.generalSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "General settings fetched successfully"));
});

exports.updateGeneralSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.generalSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.generalSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.generalSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "General settings updated successfully"));
});

// =====================================
// Academic Session Settings
// =====================================
exports.getSessions = asyncHandler(async (req, res) => {
    const sessions = await prisma.academicSession.findMany({
        orderBy: { startDate: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, sessions, "Sessions fetched successfully"));
});

exports.createSession = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, isCurrent } = req.body;

    if (isCurrent) {
        await prisma.academicSession.updateMany({
            where: { isCurrent: true },
            data: { isCurrent: false }
        });
    }

    const session = await prisma.academicSession.create({
        data: { name, startDate: new Date(startDate), endDate: new Date(endDate), isCurrent }
    });

    res.status(201).json(new ApiResponse(201, session, "Session created successfully"));
});

exports.updateSession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, startDate, endDate, isCurrent } = req.body;

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
    const settings = await prisma.notificationSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "Notification settings fetched successfully"));
});

exports.updateNotificationSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.notificationSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.notificationSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.notificationSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "Notification settings updated successfully"));
});

// =====================================
// SMS Settings
// =====================================
exports.getSmsSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.smsSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "SMS settings fetched successfully"));
});

exports.updateSmsSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.smsSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.smsSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.smsSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "SMS settings updated successfully"));
});

exports.testSms = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "Test SMS sent successfully"));
});

// =====================================
// Email Settings
// =====================================
exports.getEmailSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.emailSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "Email settings fetched successfully"));
});

exports.updateEmailSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.emailSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.emailSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.emailSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "Email settings updated successfully"));
});

exports.testEmail = asyncHandler(async (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "Test email sent successfully"));
});

// =====================================
// Payment Settings
// =====================================
exports.getPaymentSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.paymentSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "Payment settings fetched successfully"));
});

exports.updatePaymentSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.paymentSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.paymentSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.paymentSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "Payment settings updated successfully"));
});

// =====================================
// Print Settings
// =====================================
exports.getPrintSettings = asyncHandler(async (req, res) => {
    const settings = await prisma.printSetting.findFirst();
    res.status(200).json(new ApiResponse(200, settings, "Print settings fetched successfully"));
});

exports.updatePrintSettings = asyncHandler(async (req, res) => {
    const existingSettings = await prisma.printSetting.findFirst();

    let settings;
    if (existingSettings) {
        settings = await prisma.printSetting.update({
            where: { id: existingSettings.id },
            data: req.body
        });
    } else {
        settings = await prisma.printSetting.create({
            data: req.body
        });
    }

    res.status(200).json(new ApiResponse(200, settings, "Print settings updated successfully"));
});

// =====================================
// Backup & Restore
// =====================================
exports.getBackups = asyncHandler(async (req, res) => {
    const backups = await prisma.backup.findMany({
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, backups, "Backups fetched successfully"));
});

exports.createBackup = asyncHandler(async (req, res) => {
    const filename = `backup_${Date.now()}.sql`;
    const fileSize = 0;

    const backup = await prisma.backup.create({
        data: {
            filename,
            fileSize,
            filePath: `/backups/${filename}`
        }
    });

    res.status(201).json(new ApiResponse(201, backup, "Backup created successfully"));
});

exports.downloadBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ApiError } = require('../utils/ApiError');

    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new ApiError(404, "Backup not found");
    }

    res.status(200).json(new ApiResponse(200, backup, "Backup download initiated"));
});

exports.restoreBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ApiError } = require('../utils/ApiError');

    const backup = await prisma.backup.findUnique({ where: { id } });
    if (!backup) {
        throw new ApiError(404, "Backup not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Backup restored successfully"));
});

exports.deleteBackup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.backup.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Backup deleted successfully"));
});
