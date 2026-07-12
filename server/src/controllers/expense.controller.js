const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

// =====================================
// Expense Head Controllers
// =====================================
exports.getExpenseHeads = asyncHandler(async (req, res) => {
    const heads = await prisma.expenseHead.findMany({
        where: { schoolId: req.user.schoolId },

        orderBy: { name: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, heads, "Expense heads fetched successfully"));
});

exports.createExpenseHead = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Expense head name is required");
    }

    const existing = await prisma.expenseHead.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Expense head with this name already exists in this school");
    }

    const head = await prisma.expenseHead.create({
        data: { schoolId: req.user.schoolId, name, description }
    });
    res.status(201).json(new ApiResponse(201, head, "Expense head created successfully"));
});

exports.updateExpenseHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const head = await prisma.expenseHead.update({
        where: { id },
        data: { name, description }
    });
    res.status(200).json(new ApiResponse(200, head, "Expense head updated successfully"));
});

exports.deleteExpenseHead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expenseCount = await prisma.expense.count({ where: { expenseHeadId: id } });
    if (expenseCount > 0) {
        throw new ApiError(400, `Cannot delete. ${expenseCount} expense records are using this head`);
    }

    await prisma.expenseHead.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Expense head deleted successfully"));
});

// =====================================
// Expense Controllers
// =====================================
exports.getExpenses = asyncHandler(async (req, res) => {
    const { expenseHeadId, fromDate, toDate, search } = req.query;

    const where = {
        ...(expenseHeadId && { expenseHeadId }),
        ...(fromDate && toDate && {
            date: {
                gte: new Date(fromDate),
                lte: new Date(toDate)
            }
        }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { invoiceNumber: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const expenses = await prisma.expense.findMany({
        where,
        include: {
            ExpenseHead: { select: { name: true } }
        },
        orderBy: { date: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

exports.createExpense = asyncHandler(async (req, res) => {
    const { name, invoiceNumber, date, amount, expenseHeadId, description, documentUrl } = req.body;

    if (!name || !date || !amount || !expenseHeadId) {
        throw new ApiError(400, "Name, date, amount, and expense head are required");
    }

    const expense = await prisma.expense.create({
        data: { schoolId: req.user.schoolId,
            name,
            invoiceNumber,
            date: new Date(date),
            amount: parseFloat(amount),
            expenseHeadId,
            description,
            documentUrl
        },
        include: {
            ExpenseHead: { select: { name: true } }
        }
    });

    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'ADD_EXPENSE',
        resource: 'Expense',
        resourceId: expense.id,
        details: { name, amount: expense.amount, expenseHeadId },
        schoolId: req.user.schoolId
    });

    res.status(201).json(new ApiResponse(201, expense, "Expense added successfully"));
});

exports.updateExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, invoiceNumber, date, amount, expenseHeadId, description, documentUrl } = req.body;

    const expense = await prisma.expense.update({
        where: { id },
        data: {
            name,
            invoiceNumber,
            date: date ? new Date(date) : undefined,
            amount: amount ? parseFloat(amount) : undefined,
            expenseHeadId,
            description,
            documentUrl
        },
        include: {
            ExpenseHead: { select: { name: true } }
        }
    });

    res.status(200).json(new ApiResponse(200, expense, "Expense updated successfully"));
});

exports.deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.expense.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Expense deleted successfully"));
});

exports.getExpenseById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const expense = await prisma.expense.findUnique({
        where: { id },
        include: {
            ExpenseHead: true
        }
    });

    if (!expense) {
        throw new ApiError(404, "Expense not found");
    }

    res.status(200).json(new ApiResponse(200, expense, "Expense fetched successfully"));
});
