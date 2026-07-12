const prisma = require('../config/prisma');

/**
 * Calculate total expected fees vs paid fees for a student in a given session.
 * @param {string} studentId
 * @param {string} session - academic session identifier (e.g. "2024-25")
 * @returns {{ totalExpected: number, totalPaid: number, dueAmount: number }}
 */
const calculateStudentDues = async (studentId, session) => {
    // Sum all expected fees from FeeMaster for the student's class/session
    const feeMasters = await prisma.feeMaster.findMany({
        where: {
            ...(session && { session }),
            Student: { some: { id: studentId } }
        },
        select: { amount: true }
    });

    const totalExpected = feeMasters.reduce((sum, f) => sum + Number(f.amount || 0), 0);

    // Sum all confirmed/paid payments for the student in this session
    const payments = await prisma.feePayment.findMany({
        where: {
            studentId,
            ...(session && { session }),
            status: 'PAID'
        },
        select: { amount: true }
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const dueAmount = totalExpected - totalPaid;

    return { totalExpected, totalPaid, dueAmount };
};

/**
 * Generate a unique receipt number.
 * Format: RCP-{schoolCode}-{YYYYMMDD}-{random4digits}
 * @param {string} schoolCode
 * @returns {string}
 */
const generateReceiptNumber = (schoolCode) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `RCP-${schoolCode}-${date}-${random}`;
};

/**
 * Apply a discount to a given amount.
 * @param {number} amount - original amount
 * @param {'percent'|'flat'} discountType
 * @param {number} discountValue
 * @returns {number} discounted amount (never below 0)
 */
const applyDiscount = (amount, discountType, discountValue) => {
    let discounted = amount;

    if (discountType === 'percent') {
        discounted = amount - (amount * discountValue) / 100;
    } else if (discountType === 'flat') {
        discounted = amount - discountValue;
    }

    return Math.max(0, discounted);
};

/**
 * Build a full fee statement for a student — all payments with their details.
 * @param {string} studentId
 * @returns {Promise<Array>}
 */
const buildFeeStatement = async (studentId) => {
    const payments = await prisma.feePayment.findMany({
        where: { studentId },
        include: {
            Student: {
                select: { firstName: true, lastName: true, admissionNo: true }
            },
            FeeMaster: {
                select: { name: true, amount: true, dueDate: true, session: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return payments;
};

module.exports = {
    calculateStudentDues,
    generateReceiptNumber,
    applyDiscount,
    buildFeeStatement
};
