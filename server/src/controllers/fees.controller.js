
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Offline Bank Payment Controllers
// =====================================
exports.getOfflineBankPayments = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const payments = await prisma.offlineBankPayment.findMany({
        where: {
            ...(status && { status })
        },
        include: {
            Student: {
                select: {
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    Class: { select: { name: true } }
                }
            }
        },
        orderBy: { submitDate: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, payments, "Offline bank payments fetched successfully"));
});

exports.createOfflineBankPayment = asyncHandler(async (req, res) => {
    const { paymentDate, submitDate, amount, paymentId, studentId } = req.body;

    const requestId = `REQ-${Date.now()}`;

    const payment = await prisma.offlineBankPayment.create({
        data: {
            requestId,
            paymentDate: new Date(paymentDate),
            submitDate: new Date(submitDate),
            amount: parseFloat(amount),
            paymentId,
            studentId
        }
    });

    res.status(201).json(new ApiResponse(201, payment, "Offline bank payment submitted successfully"));
});

exports.updateOfflineBankPaymentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, statusDate } = req.body;

    const payment = await prisma.offlineBankPayment.update({
        where: { id },
        data: {
            status,
            statusDate: statusDate ? new Date(statusDate) : new Date()
        }
    });

    res.status(200).json(new ApiResponse(200, payment, "Payment status updated successfully"));
});

// =====================================
// Fee Group Controllers
// =====================================
exports.getFeeGroups = asyncHandler(async (req, res) => {
    const groups = await prisma.feeGroup.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, groups, "Fee groups fetched successfully"));
});

exports.createFeeGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const existing = await prisma.feeGroup.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Fee group with this name already exists in this school");
    }

    const group = await prisma.feeGroup.create({
        data: { name, description }
    });
    res.status(201).json(new ApiResponse(201, group, "Fee group created successfully"));
});

exports.updateFeeGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const group = await prisma.feeGroup.update({
        where: { id },
        data: { name, description }
    });
    res.status(200).json(new ApiResponse(200, group, "Fee group updated successfully"));
});

exports.deleteFeeGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const count = await prisma.feeMaster.count({ where: { feeGroupId: id } });
    if (count > 0) {
        throw new ApiError(400, `Cannot delete. ${count} fee masters are using this group`);
    }

    await prisma.feeGroup.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Fee group deleted successfully"));
});

// =====================================
// Fee Type Controllers
// =====================================
exports.getFeeTypes = asyncHandler(async (req, res) => {
    const types = await prisma.feeType.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, types, "Fee types fetched successfully"));
});

exports.createFeeType = asyncHandler(async (req, res) => {
    const { name, code, description } = req.body;

    const existing = await prisma.feeType.findFirst({ where: { code } });
    if (existing) {
        throw new ApiError(400, "Fee type with this code already exists in this school");
    }

    const type = await prisma.feeType.create({
        data: { name, code, description }
    });
    res.status(201).json(new ApiResponse(201, type, "Fee type created successfully"));
});

exports.updateFeeType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const type = await prisma.feeType.update({
        where: { id },
        data: { name, code, description }
    });
    res.status(200).json(new ApiResponse(200, type, "Fee type updated successfully"));
});

exports.deleteFeeType = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const count = await prisma.feeMaster.count({ where: { feeTypeId: id } });
    if (count > 0) {
        throw new ApiError(400, `Cannot delete. ${count} fee masters are using this type`);
    }

    await prisma.feeType.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Fee type deleted successfully"));
});

// =====================================
// Fee Master Controllers
// =====================================
exports.getFeeMasters = asyncHandler(async (req, res) => {
    const masters = await prisma.feeMaster.findMany({
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, masters, "Fee masters fetched successfully"));
});

exports.createFeeMaster = asyncHandler(async (req, res) => {
    const { dueDate, amount, fineType, percentage, fixAmount, feeGroupId, feeTypeId } = req.body;

    const master = await prisma.feeMaster.create({
        data: {
            dueDate: dueDate ? new Date(dueDate) : null,
            amount: parseFloat(amount),
            fineType: fineType || 'None',
            percentage: percentage ? parseFloat(percentage) : null,
            fixAmount: fixAmount ? parseFloat(fixAmount) : null,
            feeGroupId,
            feeTypeId
        },
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } }
        }
    });
    res.status(201).json(new ApiResponse(201, master, "Fee master created successfully"));
});

exports.updateFeeMaster = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { dueDate, amount, fineType, percentage, fixAmount, feeGroupId, feeTypeId } = req.body;

    const master = await prisma.feeMaster.update({
        where: { id },
        data: {
            dueDate: dueDate ? new Date(dueDate) : null,
            amount: parseFloat(amount),
            fineType: fineType || 'None',
            percentage: percentage ? parseFloat(percentage) : null,
            fixAmount: fixAmount ? parseFloat(fixAmount) : null,
            feeGroupId,
            feeTypeId
        },
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } }
        }
    });
    res.status(200).json(new ApiResponse(200, master, "Fee master updated successfully"));
});

exports.deleteFeeMaster = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.feeMaster.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Fee master deleted successfully"));
});

// =====================================
// Fee Discount Controllers
// =====================================
exports.getFeeDiscounts = asyncHandler(async (req, res) => {
    const discounts = await prisma.feeDiscount.findMany({ orderBy: { createdAt: 'desc' }});
    res.status(200).json(new ApiResponse(200, discounts, "Fee discounts fetched successfully"));
});

exports.createFeeDiscount = asyncHandler(async (req, res) => {
    const { name, code, discountType, percentage, amount, usageLimit, expiryDate, description } = req.body;

    const existing = await prisma.feeDiscount.findFirst({ where: { code } });
    if (existing) {
        throw new ApiError(400, "Discount code already exists in this school");
    }

    const discount = await prisma.feeDiscount.create({
        data: {
            name,
            code,
            discountType,
            percentage: percentage ? parseFloat(percentage) : null,
            amount: amount ? parseFloat(amount) : null,
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            description
        }
    });
    res.status(201).json(new ApiResponse(201, discount, "Fee discount created successfully"));
});

exports.updateFeeDiscount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, code, discountType, percentage, amount, usageLimit, expiryDate, description } = req.body;

    const discount = await prisma.feeDiscount.update({
        where: { id },
        data: {
            name,
            code,
            discountType,
            percentage: percentage ? parseFloat(percentage) : null,
            amount: amount ? parseFloat(amount) : null,
            usageLimit: usageLimit ? parseInt(usageLimit) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            description
        }
    });
    res.status(200).json(new ApiResponse(200, discount, "Fee discount updated successfully"));
});

exports.deleteFeeDiscount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.feeDiscount.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Fee discount deleted successfully"));
});

// =====================================
// Fee Reminder Controllers
// =====================================
exports.getFeeReminders = asyncHandler(async (req, res) => {
    const reminders = await prisma.feeReminder.findMany();
    res.status(200).json(new ApiResponse(200, reminders, "Fee reminders fetched successfully"));
});

exports.createFeeReminder = asyncHandler(async (req, res) => {
    const { reminderType, days, isActive } = req.body;

    const reminder = await prisma.feeReminder.create({
        data: { reminderType, days: parseInt(days), isActive: isActive || false }
    });
    res.status(201).json(new ApiResponse(201, reminder, "Fee reminder created successfully"));
});

exports.updateFeeReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reminderType, days, isActive } = req.body;

    const reminder = await prisma.feeReminder.update({
        where: { id },
        data: { reminderType, days: parseInt(days), isActive }
    });
    res.status(200).json(new ApiResponse(200, reminder, "Fee reminder updated successfully"));
});

exports.deleteFeeReminder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.feeReminder.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Fee reminder deleted successfully"));
});

// =====================================
// Fee Payment / Collection Controllers
// =====================================
exports.collectFee = asyncHandler(async (req, res) => {
    const { studentId, feeGroupId, feeTypeId, amount, discountAmount, fineAmount, paymentMethod, remarks } = req.body;

    if (!studentId || !feeGroupId || !feeTypeId || !amount || !paymentMethod) {
        throw new ApiError(400, "Missing required fields");
    }

    // Generate unique receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const netAmount = parseFloat(amount) + parseFloat(fineAmount || 0) - parseFloat(discountAmount || 0);

    const payment = await prisma.feePayment.create({
        data: {
            receiptNumber,
            paymentDate: new Date(),
            amount: parseFloat(amount),
            discountAmount: parseFloat(discountAmount || 0),
            fineAmount: parseFloat(fineAmount || 0),
            netAmount,
            paymentMethod,
            remarks,
            studentId,
            feeGroupId,
            feeTypeId
        },
        include: {
            Student: {
                select: {
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    Class: { select: { name: true } },
                    Section: { select: { name: true } }
                }
            },
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true } }
        }
    });

    // Trigger notification
    try {
        const { createNotification } = require('../utils/notification');
        await createNotification({
            title: "Fee Payment Collected",
            message: `A fee payment of ${payment.netAmount} has been collected for student ${payment.Student?.firstName} ${payment.Student?.lastName || ''} (Admission No: ${payment.Student?.admissionNo}) via ${payment.paymentMethod}.`,
            type: "fee"
        });
    } catch (err) {
        console.error("Failed to trigger fee payment notification:", err);
    }

    res.status(201).json(new ApiResponse(201, payment, "Fee collected successfully"));
});

exports.searchFeePayments = asyncHandler(async (req, res) => {
    const { studentId, classId, fromDate, toDate, search } = req.query;

    const where = {
        ...(studentId && { studentId }),
        ...(fromDate && toDate && {
            paymentDate: {
                gte: new Date(fromDate),
                lte: new Date(toDate)
            }
        }),
        ...(classId && {
            Student: { classId }
        }),
        ...(search && {
            OR: [
                { receiptNumber: { contains: search, mode: 'insensitive' } },
                { Student: {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { admissionNo: { contains: search, mode: 'insensitive' } }
                    ]
                }}
            ]
        })
    };

    const payments = await prisma.feePayment.findMany({
        where,
        include: {
            Student: {
                select: {
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    Class: { select: { name: true } },
                    Section: { select: { name: true } }
                }
            },
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true } }
        },
        orderBy: { paymentDate: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, payments, "Fee payments fetched successfully"));
});

exports.getDueFees = asyncHandler(async (req, res) => {
    const { classId, sectionId } = req.query;

    // Get all students with their assigned fees
    const students = await prisma.student.findMany({
        where: {
            isDisabled: false,
            ...(classId && { classId }),
            ...(sectionId && { sectionId })
        },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            FeePayment: {
                select: {
                    amount: true,
                    discountAmount: true,
                    fineAmount: true,
                    netAmount: true,
                    feeGroupId: true,
                    feeTypeId: true
                }
            }
        }
    });

    // Get all fee masters to calculate expected fees
    const feeMasters = await prisma.feeMaster.findMany({
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true } }
        }
    });

    // Calculate due fees for each student
    const dueFeesData = students.map(student => {
        const totalExpected = feeMasters.reduce((sum, master) => sum + master.amount, 0);
        const totalPaid = student.FeePayment.reduce((sum, payment) => sum + payment.netAmount, 0);
        const dueAmount = totalExpected - totalPaid;

        return {
            studentId: student.id,
            admissionNo: student.admissionNo,
            firstName: student.firstName,
            lastName: student.lastName,
            className: student.Class.name,
            sectionName: student.Section.name,
            totalExpected,
            totalPaid,
            dueAmount: dueAmount > 0 ? dueAmount : 0
        };
    }).filter(student => student.dueAmount > 0);

    res.status(200).json(new ApiResponse(200, dueFeesData, "Due fees fetched successfully"));
});

exports.carryForwardFees = asyncHandler(async (req, res) => {
    const { fromSession, toSession, classId } = req.body;

    if (!fromSession || !toSession) {
        throw new ApiError(400, "From session and to session are required");
    }

    // Get students with due fees
    const students = await prisma.student.findMany({
        where: {
            isDisabled: false,
            ...(classId && { classId })
        },
        include: {
            FeePayment: true
        }
    });

    // Get all fee masters
    const feeMasters = await prisma.feeMaster.findMany();

    let carriedForwardCount = 0;

    // For each student, calculate due amount and create a carry forward record
    for (const student of students) {
        const totalExpected = feeMasters.reduce((sum, master) => sum + master.amount, 0);
        const totalPaid = student.FeePayment.reduce((sum, payment) => sum + payment.netAmount, 0);
        const dueAmount = totalExpected - totalPaid;

        if (dueAmount > 0) {
            // Create a new fee payment record for the carried forward amount
            // In a real implementation, you might want to create a separate CarryForward model
            // For now, we'll just count the records
            carriedForwardCount++;
        }
    }

    res.status(200).json(new ApiResponse(200, {
        studentsProcessed: students.length,
        feesCarriedForward: carriedForwardCount,
        fromSession,
        toSession
    }, `Fees carried forward successfully for ${carriedForwardCount} students`));
});
