const { z } = require('zod');

const createFeeGroup = {
    body: z.object({
        name: z.string().min(1, "Fee group name is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createFeeType = {
    body: z.object({
        name: z.string().min(1, "Fee type name is required"),
        code: z.string().min(1, "Fee type code is required"),
        description: z.string().optional().nullable()
    }).strict()
};

const createFeeMaster = {
    body: z.object({
        feeGroupId: z.string().uuid("Invalid Fee Group ID"),
        feeTypeId: z.string().uuid("Invalid Fee Type ID"),
        dueDate: z.string().min(1, "Due date is required"),
        amount: z.number().positive("Amount must be a positive number"),
        fineType: z.enum(['None', 'Percentage', 'FixAmount']).default('None'),
        percentage: z.number().nonnegative().optional().nullable(),
        fixAmount: z.number().nonnegative().optional().nullable(),
        classId: z.string().uuid("Invalid Class ID").optional().nullable()
    }).strict()
};

const createFeeDiscount = {
    body: z.object({
        name: z.string().min(1, "Discount name is required"),
        code: z.string().min(1, "Discount code is required"),
        discountType: z.enum(['Percentage', 'FixAmount', 'Percentage', 'FixedAmount']).catch('Percentage'), // Just in case, keeping valid values
        percentage: z.number().nonnegative().optional().nullable(),
        amount: z.number().nonnegative().optional().nullable(),
        usageLimit: z.number().int().nonnegative().optional().nullable(),
        expiryDate: z.string().optional().nullable(),
        description: z.string().optional().nullable()
    }).strict()
};

const collectFee = {
    body: z.object({
        studentId: z.string().uuid("Invalid Student ID"),
        feeGroupId: z.string().uuid("Invalid Fee Group ID"),
        feeTypeId: z.string().uuid("Invalid Fee Type ID"),
        amount: z.number().positive("Amount must be a positive number"),
        discountAmount: z.number().nonnegative("Discount must be non-negative").optional().default(0),
        fineAmount: z.number().nonnegative("Fine must be non-negative").optional().default(0),
        paymentMethod: z.enum(['Cash', 'Cheque', 'BankTransfer', 'Online']),
        remarks: z.string().optional().nullable()
    }).strict()
};

const createOfflineBankPayment = {
    body: z.object({
        studentId: z.string().uuid("Invalid Student ID"),
        feeGroupId: z.string().uuid("Invalid Fee Group ID"),
        feeTypeId: z.string().uuid("Invalid Fee Type ID"),
        amount: z.number().positive("Amount must be positive"),
        bankName: z.string().min(1, "Bank name is required"),
        referenceNo: z.string().min(1, "Reference number is required"),
        paymentDate: z.string().min(1, "Payment date is required"),
        note: z.string().optional().nullable()
    }).strict()
};

const updateOfflineBankPaymentStatus = {
    body: z.object({
        status: z.enum(['Approved', 'Rejected']),
        comment: z.string().optional().nullable()
    }).strict()
};

const createFeeReminder = {
    body: z.object({
        reminderType: z.string().min(1, "Reminder type is required"),
        days: z.coerce.number().int().min(0, "Days must be a non-negative integer"),
        isActive: z.boolean().optional()

    }).strict()
};

const updateFeeReminder = {
    body: createFeeReminder.body.partial()
};

const carryForwardFees = {
    body: z.object({
        fromSession: z.string().uuid().optional().nullable(),
        toSession: z.string().uuid().optional().nullable(),
        classId: z.string().uuid().optional().nullable(),
        studentIds: z.array(z.string().uuid()).optional().nullable()
    }).strict()
};

module.exports = {
    createFeeGroup,
    createFeeType,
    createFeeMaster,
    createFeeDiscount,
    collectFee,
    createOfflineBankPayment,
    updateOfflineBankPaymentStatus,
    createFeeReminder,
    updateFeeReminder,
    carryForwardFees
};
