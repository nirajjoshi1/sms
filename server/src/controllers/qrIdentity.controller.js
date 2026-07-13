const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const { PERSON_TYPES, rotateQrIdentity } = require('../services/qrIdentity.service');

const money = (value) => Number(value || 0);

const getStudentFees = async (student) => {
    const feeScope = {
        schoolId: student.schoolId,
        OR: [
            { studentId: student.id },
            {
                studentId: null,
                classId: student.classId,
                OR: [{ sectionId: null }, { sectionId: student.sectionId }]
            },
            { studentId: null, classId: null, sectionId: null }
        ]
    };

    const [masters, payments] = await Promise.all([
        prisma.feeMaster.findMany({
            where: feeScope,
            select: {
                id: true, amount: true, dueDate: true,
                FeeGroup: { select: { name: true } },
                FeeType: { select: { name: true, code: true } }
            },
            orderBy: { dueDate: 'asc' }
        }),
        prisma.feePayment.findMany({
            where: { studentId: student.id, schoolId: student.schoolId },
            select: {
                id: true, receiptNumber: true, paymentDate: true, amount: true,
                discountAmount: true, fineAmount: true, netAmount: true,
                paymentMethod: true, remarks: true,
                FeeGroup: { select: { name: true } },
                FeeType: { select: { name: true, code: true } }
            },
            orderBy: { paymentDate: 'desc' }
        })
    ]);

    const totalExpected = masters.reduce((sum, item) => sum + money(item.amount), 0);
    const totalPaid = payments.reduce((sum, item) => sum + money(item.amount), 0);
    const totalDiscount = payments.reduce((sum, item) => sum + money(item.discountAmount), 0);
    const totalFine = payments.reduce((sum, item) => sum + money(item.fineAmount), 0);
    const dueAmount = Math.max(0, totalExpected + totalFine - totalPaid - totalDiscount);

    return {
        summary: { totalExpected, totalPaid, totalDiscount, totalFine, dueAmount },
        assignedFees: masters.map(item => ({ ...item, amount: money(item.amount) })),
        payments: payments.map(item => ({
            ...item,
            amount: money(item.amount),
            discountAmount: money(item.discountAmount),
            fineAmount: money(item.fineAmount),
            netAmount: money(item.netAmount)
        }))
    };
};

const getSchool = (schoolId) => prisma.school.findUnique({
    where: { id: schoolId },
    select: {
        id: true, name: true, logo: true, address: true,
        phone: true, email: true, isActive: true
    }
});

exports.getPublicIdentity = asyncHandler(async (req, res) => {
    const identity = await prisma.qrIdentity.findUnique({ where: { token: req.params.token } });
    if (!identity || !identity.isActive) throw new ApiError(404, 'This QR identity is invalid or has been revoked');

    const school = await getSchool(identity.schoolId);
    if (!school?.isActive) throw new ApiError(404, 'This school profile is not currently active');

    let person;
    let fees = null;

    if (identity.personType === PERSON_TYPES.STUDENT) {
        person = await prisma.student.findFirst({
            where: { id: identity.personId, schoolId: identity.schoolId },
            include: {
                Class: { select: { id: true, name: true } },
                Section: { select: { id: true, name: true } },
                Category: { select: { id: true, name: true } },
                House: { select: { id: true, name: true } }
            }
        });
        if (person) fees = await getStudentFees(person);
    } else if (identity.personType === PERSON_TYPES.STAFF) {
        person = await prisma.staff.findFirst({
            where: { id: identity.personId, schoolId: identity.schoolId },
            include: {
                Department: { select: { id: true, name: true } },
                Designation: { select: { id: true, name: true } },
                ClassTeacher: {
                    select: {
                        Class: { select: { id: true, name: true } },
                        Section: { select: { id: true, name: true } }
                    }
                },
                Timetable: {
                    select: {
                        dayOfWeek: true, startTime: true, endTime: true, roomNo: true,
                        Class: { select: { name: true } },
                        Section: { select: { name: true } },
                        Subject: { select: { name: true } }
                    },
                    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
                }
            }
        });
    } else {
        throw new ApiError(404, 'Unsupported QR identity type');
    }

    if (!person) throw new ApiError(404, 'The person linked to this QR code no longer exists');

    await prisma.qrIdentity.update({
        where: { id: identity.id },
        data: { scanCount: { increment: 1 }, lastScannedAt: new Date() }
    });

    const services = {
        library: { available: false, status: 'COMING_SOON', message: 'Library access will appear here when the module is enabled.' }
    };

    res.status(200).json(new ApiResponse(200, {
        verified: true,
        personType: identity.personType,
        school,
        person,
        fees,
        services,
        verifiedAt: new Date().toISOString()
    }, 'Identity verified successfully'));
});

exports.rotateIdentity = asyncHandler(async (req, res) => {
    const personType = String(req.body.personType || '').toUpperCase();
    const personId = req.body.personId;
    if (!Object.values(PERSON_TYPES).includes(personType) || !personId) {
        throw new ApiError(400, 'A valid personType and personId are required');
    }

    const model = personType === PERSON_TYPES.STUDENT ? prisma.student : prisma.staff;
    const exists = await model.findFirst({ where: { id: personId, schoolId: req.user.schoolId }, select: { id: true } });
    if (!exists) throw new ApiError(404, 'Person not found in your school');

    const identity = await rotateQrIdentity({ schoolId: req.user.schoolId, personType, personId });
    res.status(200).json(new ApiResponse(200, identity, 'QR identity rotated successfully'));
});

exports.revokeIdentity = asyncHandler(async (req, res) => {
    const identity = await prisma.qrIdentity.findFirst({
        where: { id: req.params.id, schoolId: req.user.schoolId }
    });
    if (!identity) throw new ApiError(404, 'QR identity not found');

    await prisma.qrIdentity.update({ where: { id: identity.id }, data: { isActive: false } });
    res.status(200).json(new ApiResponse(200, null, 'QR identity revoked successfully'));
});
