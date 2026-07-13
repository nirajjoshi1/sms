const crypto = require('crypto');
const prisma = require('../config/prisma');

const PERSON_TYPES = Object.freeze({
    STUDENT: 'STUDENT',
    STAFF: 'STAFF'
});

const createToken = () => crypto.randomBytes(32).toString('base64url');

const getClientBaseUrl = () => {
    const configured = process.env.CLIENT_URL?.split(',')[0]?.trim();
    return (configured || 'http://localhost:5173').replace(/\/$/, '');
};

const buildVerificationUrl = (token) => `${getClientBaseUrl()}/verify/person/${token}`;

const ensureQrIdentity = async ({ schoolId, personType, personId }) => {
    let identity = await prisma.qrIdentity.findUnique({
        where: { schoolId_personType_personId: { schoolId, personType, personId } }
    });

    if (!identity) {
        identity = await prisma.qrIdentity.create({
            data: { token: createToken(), schoolId, personType, personId }
        });
    } else if (!identity.isActive) {
        identity = await prisma.qrIdentity.update({
            where: { id: identity.id },
            data: { isActive: true }
        });
    }

    return { ...identity, verificationUrl: buildVerificationUrl(identity.token) };
};

const rotateQrIdentity = async ({ schoolId, personType, personId }) => {
    const identity = await prisma.qrIdentity.upsert({
        where: { schoolId_personType_personId: { schoolId, personType, personId } },
        create: { token: createToken(), schoolId, personType, personId },
        update: { token: createToken(), isActive: true }
    });
    return { ...identity, verificationUrl: buildVerificationUrl(identity.token) };
};

module.exports = {
    PERSON_TYPES,
    buildVerificationUrl,
    ensureQrIdentity,
    rotateQrIdentity
};
