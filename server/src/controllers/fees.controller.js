
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

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
        data: { schoolId: req.user.schoolId,
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
    const { status, statusDate, feeGroupId, feeTypeId, remarks } = req.body;

    const existingPayment = await prisma.offlineBankPayment.findUnique({ where: { id } });
    if (!existingPayment) {
        throw new ApiError(404, "Offline payment not found");
    }

    // Idempotency check
    if (existingPayment.status === status) {
        return res.status(200).json(new ApiResponse(200, existingPayment, "Payment status is already " + status));
    }
    
    if (existingPayment.status === 'Approved') {
        throw new ApiError(400, "Cannot change status of an already approved payment");
    }

    const updatedPayment = await prisma.$transaction(async (tx) => {
        const payment = await tx.offlineBankPayment.update({
            where: { id },
            data: {
                status,
                statusDate: statusDate ? new Date(statusDate) : new Date()
            }
        });

        if (status === 'Approved') {
            if (!feeGroupId || !feeTypeId) {
                throw new ApiError(400, "feeGroupId and feeTypeId are required to approve and generate a receipt");
            }
            
            // Create the official fee receipt
            const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            
            await tx.feePayment.create({
                data: { schoolId: req.user.schoolId,
                    receiptNumber,
                    paymentDate: payment.paymentDate,
                    amount: payment.amount,
                    discountAmount: 0,
                    fineAmount: 0,
                    netAmount: payment.amount,
                    paymentMethod: 'Bank Transfer',
                    remarks: remarks || `Approved offline payment ${payment.paymentId}`,
                    studentId: payment.studentId,
                    feeGroupId,
                    feeTypeId,
                    schoolId: req.user.schoolId
                }
            });
        }
        return payment;
    });

    res.status(200).json(new ApiResponse(200, updatedPayment, "Payment status updated successfully"));
});

// =====================================
// Fee Group Controllers
// =====================================
exports.getFeeGroups = asyncHandler(async (req, res) => {
    const groups = await prisma.feeGroup.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, groups, "Fee groups fetched successfully"));
});

exports.createFeeGroup = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const existing = await prisma.feeGroup.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Fee group with this name already exists in this school");
    }

    const group = await prisma.feeGroup.create({
        data: { schoolId: req.user.schoolId, name, description }
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
    const types = await prisma.feeType.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, types, "Fee types fetched successfully"));
});

exports.createFeeType = asyncHandler(async (req, res) => {
    const { name, code, description } = req.body;

    const existing = await prisma.feeType.findFirst({ where: { code } });
    if (existing) {
        throw new ApiError(400, "Fee type with this code already exists in this school");
    }

    const type = await prisma.feeType.create({
        data: { schoolId: req.user.schoolId, name, code, description }
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
        where: { schoolId: req.user.schoolId },

        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, masters, "Fee masters fetched successfully"));
});

exports.createFeeMaster = asyncHandler(async (req, res) => {
    const { dueDate, amount, fineType, percentage, fixAmount, feeGroupId, feeTypeId, classId, sectionId, studentId } = req.body;

    const master = await prisma.feeMaster.create({
        data: { schoolId: req.user.schoolId,
            dueDate: dueDate ? new Date(dueDate) : null,
            amount: parseFloat(amount),
            fineType: fineType || 'None',
            percentage: percentage ? parseFloat(percentage) : null,
            fixAmount: fixAmount ? parseFloat(fixAmount) : null,
            feeGroupId,
            feeTypeId,
            classId: classId || null,
            sectionId: sectionId || null,
            studentId: studentId || null
        },
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } },
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Student: { select: { firstName: true, lastName: true } }
        }
    });
    res.status(201).json(new ApiResponse(201, master, "Fee master created successfully"));
});

exports.updateFeeMaster = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { dueDate, amount, fineType, percentage, fixAmount, feeGroupId, feeTypeId, classId, sectionId, studentId } = req.body;

    const master = await prisma.feeMaster.update({
        where: { id },
        data: {
            dueDate: dueDate ? new Date(dueDate) : null,
            amount: parseFloat(amount),
            fineType: fineType || 'None',
            percentage: percentage ? parseFloat(percentage) : null,
            fixAmount: fixAmount ? parseFloat(fixAmount) : null,
            feeGroupId,
            feeTypeId,
            classId: classId || null,
            sectionId: sectionId || null,
            studentId: studentId || null
        },
        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true, code: true } },
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Student: { select: { firstName: true, lastName: true } }
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
    const discounts = await prisma.feeDiscount.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { createdAt: 'desc' }});
    res.status(200).json(new ApiResponse(200, discounts, "Fee discounts fetched successfully"));
});

exports.createFeeDiscount = asyncHandler(async (req, res) => {
    const { name, code, discountType, percentage, amount, usageLimit, expiryDate, description } = req.body;

    const existing = await prisma.feeDiscount.findFirst({ where: { code } });
    if (existing) {
        throw new ApiError(400, "Discount code already exists in this school");
    }

    const discount = await prisma.feeDiscount.create({
        data: { schoolId: req.user.schoolId,
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
        data: { schoolId: req.user.schoolId, reminderType, days: parseInt(days), isActive: isActive || false }
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

    // Fix floating point math with rounding to 2 decimal places
    const rawAmount = parseFloat(amount);
    const rawFine = parseFloat(fineAmount || 0);
    const rawDiscount = parseFloat(discountAmount || 0);
    const netAmount = Math.round((rawAmount + rawFine - rawDiscount) * 100) / 100;

    const payment = await prisma.$transaction(async (tx) => {
        const newPayment = await tx.feePayment.create({
            data: { schoolId: req.user.schoolId,
                receiptNumber,
                paymentDate: new Date(),
                amount: rawAmount,
                discountAmount: rawDiscount,
                fineAmount: rawFine,
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
                        firstName: true, lastName: true, admissionNo: true, email: true,
                        Class: { select: { name: true } }, Section: { select: { name: true } }
                    }
                },
                FeeGroup: { select: { name: true } },
                FeeType: { select: { name: true } }
            }
        });
        
        // Inline Audit log inside transaction to ensure atomic write
        await tx.auditLog.create({
            data: { schoolId: req.user.schoolId,
                userId: req.user.id,
                userEmail: req.user.email,
                action: 'COLLECT_FEE',
                resource: 'FeePayment',
                resourceId: newPayment.id,
                details: JSON.stringify({ receiptNumber, amount: newPayment.amount, netAmount: newPayment.netAmount, studentId }),
                schoolId: req.user.schoolId,
                ipAddress: req.ip || '127.0.0.1'
            }
        });
        
        return newPayment;
    });

    // Trigger notification (outside transaction so it doesn't block)
    try {
        const { createNotification } = require('../utils/notification');
        
        // Fetch school details for logo image and branding
        const school = await prisma.school.findUnique({
            where: { id: req.user.schoolId },
            select: { logo: true, name: true, phone: true, email: true }
        });

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; color: #ffffff;">
                        ${school?.logo ? `<img src="${school.logo}" alt="${school.name} Logo" style="max-height: 60px; margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />` : ''}
                        <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Receipt</div>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.025em;">Fee Payment Confirmed</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Thank you for your payment.</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 32px;">
                        <!-- Receipt Meta -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 24px;">
                            <div>
                                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.05em;">Receipt No</p>
                                <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 15px; font-weight: 600; color: #111827;">${payment.receiptNumber}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; letter-spacing: 0.05em;">Date Paid</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #111827;">${new Date(payment.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>

                        <!-- Student Info -->
                        <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #4f46e5; font-weight: 700; letter-spacing: 0.05em;">Student Details</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr>
                                    <td style="padding: 4px 0; color: #6b7280;">Student Name:</td>
                                    <td style="padding: 4px 0; font-weight: 600; color: #111827; text-align: right;">${payment.Student?.firstName} ${payment.Student?.lastName || ''}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #6b7280;">Admission No:</td>
                                    <td style="padding: 4px 0; font-weight: 600; color: #111827; text-align: right;">${payment.Student?.admissionNo}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; color: #6b7280;">Class / Section:</td>
                                    <td style="padding: 4px 0; font-weight: 600; color: #111827; text-align: right;">${payment.Student?.Class?.name || 'N/A'} - ${payment.Student?.Section?.name || 'N/A'}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Payment Breakdown -->
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #4f46e5; font-weight: 700; letter-spacing: 0.05em;">Payment Breakdown</h3>
                        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;">
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #374151;">Description</th>
                                    <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #374151;">Amount</th>
                                </tr>
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 12px 16px; color: #111827;">
                                        <div style="font-weight: 600;">${payment.FeeType?.name || 'School Fee'}</div>
                                        <div style="font-size: 12px; color: #6b7280;">Group: ${payment.FeeGroup?.name || 'General'}</div>
                                    </td>
                                    <td style="padding: 12px 16px; text-align: right; color: #111827; font-weight: 500;">₹${Number(payment.amount).toFixed(2)}</td>
                                </tr>
                                ${Number(payment.fineAmount) > 0 ? `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 12px 16px; color: #dc2626;">Fine / Late Fee</td>
                                    <td style="padding: 12px 16px; text-align: right; color: #dc2626; font-weight: 500;">+₹${Number(payment.fineAmount).toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                ${Number(payment.discountAmount) > 0 ? `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 12px 16px; color: #16a34a;">Discount Applied</td>
                                    <td style="padding: 12px 16px; text-align: right; color: #16a34a; font-weight: 500;">-₹${Number(payment.discountAmount).toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                <tr style="background-color: #f9fafb; font-size: 16px; font-weight: 700;">
                                    <td style="padding: 16px; color: #111827;">Total Paid (${payment.paymentMethod})</td>
                                    <td style="padding: 16px; text-align: right; color: #4f46e5;">₹${Number(payment.netAmount).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Remarks -->
                        ${payment.remarks ? `
                        <div style="margin-bottom: 24px; font-size: 14px; color: #4b5563; padding: 12px 16px; background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 0 8px 8px 0;">
                            <strong>Remarks:</strong> ${payment.remarks}
                        </div>
                        ` : ''}

                        <!-- Action Button to download/print -->
                        <div style="text-align: center; margin: 32px 0 24px 0;">
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.15); transition: background-color 0.2s;">
                                Download / Print Receipt
                            </a>
                        </div>

                        <!-- Admin Details -->
                        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; border: 1px solid #f3f4f6; margin-bottom: 24px; font-size: 13px; color: #4b5563;">
                            <p style="margin: 0; font-weight: 600; color: #111827; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Authorized Signatory / Admin</p>
                            <p style="margin: 0;">Processed by: <strong>${req.user.firstName} ${req.user.lastName || ''}</strong> (${req.user.email})</p>
                        </div>

                        <!-- Footer Note -->
                        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">${school?.name || req.user.schoolName || 'School Management'}</p>
                            ${school?.phone || school?.email ? `
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280;">
                                ${school?.phone ? `📞 Phone: ${school.phone}` : ''} 
                                ${school?.phone && school?.email ? ' | ' : ''} 
                                ${school?.email ? `✉️ Email: ${school.email}` : ''}
                            </p>
                            ` : ''}
                            <p style="margin: 0; font-size: 11px; color: #9ca3af;">&copy; ${new Date().getFullYear()} ${school?.name || req.user.schoolName || 'School Management System'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        let attachments = [];
        try {
            const { generateFeeReceiptPDF } = require('../utils/pdfGenerator');
            const pdfBuffer = await generateFeeReceiptPDF(payment, school, req.user);
            attachments.push({
                filename: `Receipt-${payment.receiptNumber || 'Payment'}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        } catch (pdfErr) {
            console.error("❌ Failed to generate PDF receipt attachment:", pdfErr);
        }

        await createNotification({
            title: "Fee Payment Receipt",
            message: `A fee payment of ${payment.netAmount} has been collected for student ${payment.Student?.firstName} ${payment.Student?.lastName || ''} (Admission No: ${payment.Student?.admissionNo}) via ${payment.paymentMethod}.`,
            type: "fee",
            targetEmail: payment.Student?.email || undefined,
            emailHtml,
            attachments: attachments.length > 0 ? attachments : undefined,
            skipInApp: true // Don't broadcast this to all staff members
        });
    } catch (err) {
        console.error("Failed to trigger fee payment notification:", err);
    }

    res.status(201).json(new ApiResponse(201, payment, "Fee collected successfully"));
});

// Send manual fee reminder
exports.sendFeeReminder = asyncHandler(async (req, res) => {
    const { studentId, type } = req.body;
    
    if (!studentId) {
        throw new ApiError(400, "Student ID is required");
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId }
    });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    try {
        const { createNotification } = require('../utils/notification');
        
        // Fetch school details for logo image and branding
        const school = await prisma.school.findUnique({
            where: { id: req.user.schoolId },
            select: { logo: true, name: true, phone: true, email: true }
        });

        // Fetch all fee masters applicable to this student
        const feeMasters = await prisma.feeMaster.findMany({
            where: { schoolId: req.user.schoolId },
            include: {
                FeeGroup: { select: { name: true } },
                FeeType: { select: { name: true } }
            }
        });

        // Fetch all payments made by this student
        const payments = await prisma.feePayment.findMany({
            where: { studentId: student.id }
        });

        // Determine applicable fee masters and check pending amounts
        const pendingFees = [];
        let totalDue = 0;

        for (const master of feeMasters) {
            let applies = false;
            if (master.studentId) {
                applies = master.studentId === student.id;
            } else if (master.sectionId) {
                applies = master.sectionId === student.sectionId;
            } else if (master.classId) {
                applies = master.classId === student.classId;
            } else {
                applies = true; // Global fee
            }

            if (applies) {
                let expectedAmount = Number(master.amount);
                
                // Calculate fine if past due date
                let calculatedFine = 0;
                if (master.dueDate && new Date(master.dueDate) < new Date()) {
                    if (master.fineType === 'Percentage') {
                        calculatedFine = (expectedAmount * Number(master.percentage || 0)) / 100;
                    } else if (master.fineType === 'FixAmount' || master.fineType === 'FixedAmount' || master.fineType === 'Fix') {
                        calculatedFine = Number(master.fixAmount || 0);
                    }
                }
                expectedAmount += calculatedFine;

                // Sum payments for this specific group & type
                const paidAmount = payments
                    .filter(p => p.feeGroupId === master.feeGroupId && p.feeTypeId === master.feeTypeId)
                    .reduce((sum, p) => sum + Number(p.netAmount), 0);

                const remainingDue = expectedAmount - paidAmount;

                if (remainingDue > 0) {
                    totalDue += remainingDue;
                    pendingFees.push({
                        groupName: master.FeeGroup?.name || 'General',
                        typeName: master.FeeType?.name || 'Fee',
                        dueDate: master.dueDate ? new Date(master.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
                        amount: expectedAmount,
                        paid: paidAmount,
                        due: remainingDue
                    });
                }
            }
        }

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fffaf0; padding: 40px 20px; color: #1f2937;">
                <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #ffedd5;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #d97706 0%, #ea580c 100%); padding: 32px; text-align: center; color: #ffffff;">
                        ${school?.logo ? `<img src="${school.logo}" alt="${school.name} Logo" style="max-height: 60px; margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />` : ''}
                        <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Reminder</div>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.025em;">Fee Payment Reminder</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Dues Notice & Statement</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #374151;">
                            Dear Parent/Guardian,
                        </p>
                        <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                            This is a friendly reminder regarding the pending fees for your ward, <strong>${student.firstName} ${student.lastName || ''}</strong>. Please find the detailed breakdown of the outstanding dues below:
                        </p>

                        <!-- Student Info -->
                        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr>
                                    <td style="color: #78350f; font-weight: 500;">Student Name:</td>
                                    <td style="font-weight: 600; color: #451a03; text-align: right;">${student.firstName} ${student.lastName || ''}</td>
                                </tr>
                                <tr>
                                    <td style="color: #78350f; font-weight: 500; padding-top: 6px;">Admission No:</td>
                                    <td style="font-weight: 600; color: #451a03; text-align: right;">${student.admissionNo}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Pending Fees Table -->
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #b45309; font-weight: 700; letter-spacing: 0.05em;">Outstanding Dues</h3>
                        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr style="background-color: #fffbeb; border-bottom: 1px solid #ffedd5;">
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #78350f;">Fee Type / Due Date</th>
                                    <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #78350f;">Expected</th>
                                    <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #78350f;">Paid</th>
                                    <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #78350f;">Balance Due</th>
                                </tr>
                                ${pendingFees.length > 0 ? pendingFees.map(fee => `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td style="padding: 12px 16px; color: #111827;">
                                        <div style="font-weight: 600;">${fee.typeName}</div>
                                        <div style="font-size: 11px; color: #b45309;">Due by: ${fee.dueDate}</div>
                                    </td>
                                    <td style="padding: 12px 16px; text-align: right; color: #4b5563; font-weight: 500;">₹${fee.amount.toFixed(2)}</td>
                                    <td style="padding: 12px 16px; text-align: right; color: #16a34a; font-weight: 500;">₹${fee.paid.toFixed(2)}</td>
                                    <td style="padding: 12px 16px; text-align: right; color: #dc2626; font-weight: 600;">₹${fee.due.toFixed(2)}</td>
                                </tr>
                                `).join('') : `
                                <tr style="border-bottom: 1px solid #f3f4f6;">
                                    <td colspan="4" style="padding: 16px; text-align: center; color: #6b7280;">No pending fee items found.</td>
                                </tr>
                                `}
                                <tr style="background-color: #fffbeb; font-size: 16px; font-weight: 700; border-top: 2px solid #ffedd5;">
                                    <td colspan="3" style="padding: 16px; color: #78350f;">Total Outstanding Amount</td>
                                    <td style="padding: 16px; text-align: right; color: #dc2626;">₹${totalDue.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <p style="font-size: 14px; line-height: 1.6; color: #b45309; background-color: #fffbeb; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #d97706; margin-bottom: 24px;">
                            <strong>Important Note:</strong> Please clear the dues at the earliest convenience. If you have already processed the payment, please disregard this automated reminder.
                        </p>

                        <!-- Admin Details -->
                        <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; border: 1px solid #fef3c7; margin-bottom: 24px; font-size: 13px; color: #78350f;">
                            <p style="margin: 0; font-weight: 600; color: #451a03; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Authorized Signatory / Admin</p>
                            <p style="margin: 0;">Sent by: <strong>${req.user.firstName} ${req.user.lastName || ''}</strong> (${req.user.email})</p>
                        </div>

                        <!-- Footer Note -->
                        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">${school?.name || req.user.schoolName || 'School Management'}</p>
                            ${school?.phone || school?.email ? `
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #6b7280;">
                                ${school?.phone ? `📞 Phone: ${school.phone}` : ''} 
                                ${school?.phone && school?.email ? ' | ' : ''} 
                                ${school?.email ? `✉️ Email: ${school.email}` : ''}
                            </p>
                            ` : ''}
                            <p style="margin: 0; font-size: 11px; color: #9ca3af;">&copy; ${new Date().getFullYear()} ${school?.name || req.user.schoolName || 'School Management System'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await createNotification({
            title: type || "Fee Reminder",
            message: `Dear Parent/Guardian, this is a reminder regarding the pending fee for ${student.firstName} ${student.lastName || ''}.`,
            type: "fee_reminder",
            targetEmail: student.email || undefined,
            emailHtml
        });
        
        // Log the reminder
        await logAudit({
            userId: req.user.id,
            userEmail: req.user.email,
            action: 'SEND_FEE_REMINDER',
            resource: 'Student',
            resourceId: student.id,
            details: { type, studentId },
            schoolId: req.user.schoolId
        });
        
        res.status(200).json(new ApiResponse(200, null, "Fee reminder sent successfully"));
    } catch (err) {
        console.error("Failed to send manual fee reminder:", err);
        throw new ApiError(500, "Failed to send fee reminder");
    }
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
        where: { schoolId: req.user.schoolId },

        include: {
            FeeGroup: { select: { name: true } },
            FeeType: { select: { name: true } },
            Class: { select: { name: true } }
        }
    });

    // Calculate due fees for each student
    const dueFeesData = students.map(student => {
        const totalExpected = feeMasters.reduce((sum, master) => {
            let appliesToStudent = false;

            if (master.studentId) {
                // Specific student
                appliesToStudent = master.studentId === student.id;
            } else if (master.sectionId) {
                // Specific section
                appliesToStudent = master.sectionId === student.sectionId;
            } else if (master.classId) {
                // Specific class
                appliesToStudent = master.classId === student.classId;
            } else {
                // Global fee
                appliesToStudent = true;
            }

            if (appliesToStudent) {
                let amount = Number(master.amount);
                // Calculate automatic fine if past due date
                if (master.dueDate && new Date(master.dueDate) < new Date()) {
                    if (master.fineType === 'Percentage') {
                        amount += (amount * Number(master.percentage || 0)) / 100;
                    } else if (master.fineType === 'FixAmount' || master.fineType === 'FixedAmount' || master.fineType === 'Fix') {
                        amount += Number(master.fixAmount || 0);
                    }
                }
                return sum + amount;
            }
            return sum;
        }, 0);
        const totalPaid = student.FeePayment.reduce((sum, payment) => sum + Number(payment.netAmount), 0);
        const dueAmount = totalExpected - totalPaid;

        return {
            studentId: student.id,
            admissionNo: student.admissionNo,
            firstName: student.firstName,
            lastName: student.lastName,
            classId: student.classId,
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
    // The current database schema does not have a "session" field on FeeMaster or FeePayment.
    // FeeMaster is global/class-wide, and FeePayments are just applied to the student's total expected.
    // To properly support carry-forward, a new 'StudentFee' or 'StudentSessionBalance' model is required.
    throw new ApiError(501, "Carry Forward Fees feature requires session-based fee tracking, which is not supported by the current database schema.");
});

