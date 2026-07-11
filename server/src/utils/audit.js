const prisma = require('../config/prisma');

const logAudit = async ({
    userId,
    userEmail,
    action,
    resource,
    resourceId,
    details = {},
    ipAddress = '',
    userAgent = '',
    status = 'SUCCESS',
    schoolId = null
}) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                userEmail,
                action,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent,
                status,
                schoolId
            }
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
    }
};

module.exports = { logAudit };
