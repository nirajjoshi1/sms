const { ApiResponse } = require('../utils/ApiResponse');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../utils/ApiError');
const prisma = require('../config/prisma');

// Get all notifications for current user (including general broadcasts)
exports.getNotifications = asyncHandler(async (req, res) => {
    const whereClause = { OR: [{ userId: req.user.id }] };
    
    if (req.user.role === 'SUPER_ADMIN') {
        whereClause.OR.push({ userId: null, type: 'info', schoolId: null });
    } else {
        whereClause.OR.push({ userId: null });
    }

    const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

// Mark a single notification as read
exports.markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
        where: { id }
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    // Verify ownership if targeted to a specific user
    if (notification.userId && notification.userId !== req.user.id) {
        throw new ApiError(403, "You do not have permission to modify this notification");
    }

    const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
    });

    res.status(200).json(new ApiResponse(200, updated, "Notification marked as read"));
});

// Mark all notifications as read
exports.markAllAsRead = asyncHandler(async (req, res) => {
    const whereClause = {
        isRead: false,
        OR: [{ userId: req.user.id }]
    };
    
    if (req.user.role === 'SUPER_ADMIN') {
        whereClause.OR.push({ userId: null, type: 'info', schoolId: null });
    } else {
        whereClause.OR.push({ userId: null });
    }

    await prisma.notification.updateMany({
        where: whereClause,
        data: {
            isRead: true
        }
    });

    res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});

// Delete a single notification
exports.deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
        where: { id }
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    // Verify ownership
    if (notification.userId && notification.userId !== req.user.id) {
        throw new ApiError(403, "You do not have permission to delete this notification");
    }

    await prisma.notification.delete({
        where: { id }
    });

    res.status(200).json(new ApiResponse(200, null, "Notification deleted successfully"));
});

// Clear all notifications
exports.clearAllNotifications = asyncHandler(async (req, res) => {
    const whereClause = {
        OR: [{ userId: req.user.id }]
    };
    
    if (req.user.role === 'SUPER_ADMIN') {
        whereClause.OR.push({ userId: null, type: 'info', schoolId: null });
    } else {
        whereClause.OR.push({ userId: null });
    }

    await prisma.notification.deleteMany({
        where: whereClause
    });

    res.status(200).json(new ApiResponse(200, null, "All notifications cleared"));
});

// Broadcast notification to all users in a school (Admin only)
exports.createBroadcastNotification = asyncHandler(async (req, res) => {
    const { title, message, type = 'info', targetRole } = req.body;

    if (!title || !message) {
        throw new ApiError(400, 'Title and message are required');
    }

    // Build the where clause for target users
    const userWhere = { isActive: true };
    if (targetRole) userWhere.role = targetRole;

    const users = await prisma.user.findMany({
        where: userWhere,
        select: { id: true }
    });

    // Create one notification per user
    const notifications = await prisma.$transaction(
        users.map(user =>
            prisma.notification.create({
                data: { title, message, type, userId: user.id, isRead: false }
            })
        )
    );

    res.status(201).json(new ApiResponse(201, {
        sent: notifications.length,
        targetRole: targetRole || 'all'
    }, `Notification broadcast to ${notifications.length} users successfully`));
});
