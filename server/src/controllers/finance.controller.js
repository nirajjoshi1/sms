
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Income Head Controllers
// =====================================
exports.getIncomeHeads = asyncHandler(async (req, res) => {
    const incomeHeads = await prisma.incomeHead.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, incomeHeads, "Income heads fetched successfully"));
});

exports.createIncomeHead = asyncHandler(async (req, res) => {
    const head = await prisma.incomeHead.create({ data: { name: req.body.name, description: req.body.description }});
    res.status(201).json(new ApiResponse(201, head, "Income head created successfully"));
});

exports.updateIncomeHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const head = await prisma.incomeHead.update({
        where: { id },
        data: { name: req.body.name, description: req.body.description }
    });
    res.status(200).json(new ApiResponse(200, head, "Income head updated successfully"));
});

exports.deleteIncomeHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const count = await prisma.income.count({ where: { incomeHeadId: id } });
    if (count > 0) throw new ApiError(400, `Cannot delete. ${count} income entries are linked to this head.`);
    await prisma.incomeHead.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Income head deleted successfully"));
});

// =====================================
// Income Controllers
// =====================================
exports.getIncomes = asyncHandler(async (req, res) => {
    const { search, startDate, endDate } = req.query;
    
    const where = {
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { invoiceNumber: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(startDate && endDate && {
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        })
    };
    
    const incomes = await prisma.income.findMany({
        where,
        include: { incomeHead: { select: { name: true } } },
        orderBy: { date: 'desc' }
    });
    
    res.status(200).json(new ApiResponse(200, incomes, "Incomes fetched successfully"));
});

exports.createIncome = asyncHandler(async (req, res) => {
    const income = await prisma.income.create({
        data: {
            ...req.body,
            date: new Date(req.body.date),
            amount: parseFloat(req.body.amount)
        }
    });
    res.status(201).json(new ApiResponse(201, income, "Income added successfully"));
});

exports.updateIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Income record not found");
    const income = await prisma.income.update({
        where: { id },
        data: {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : existing.date,
            amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : existing.amount
        }
    });
    res.status(200).json(new ApiResponse(200, income, "Income updated successfully"));
});

exports.deleteIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.income.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Income record not found");
    await prisma.income.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Income deleted successfully"));
});

// =====================================
// Expense Head Controllers
// =====================================
exports.getExpenseHeads = asyncHandler(async (req, res) => {
    const expenseHeads = await prisma.expenseHead.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, expenseHeads, "Expense heads fetched successfully"));
});

exports.createExpenseHead = asyncHandler(async (req, res) => {
    const head = await prisma.expenseHead.create({ data: { name: req.body.name, description: req.body.description }});
    res.status(201).json(new ApiResponse(201, head, "Expense head created successfully"));
});

exports.updateExpenseHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const head = await prisma.expenseHead.update({
        where: { id },
        data: { name: req.body.name, description: req.body.description }
    });
    res.status(200).json(new ApiResponse(200, head, "Expense head updated successfully"));
});

exports.deleteExpenseHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const count = await prisma.expense.count({ where: { expenseHeadId: id } });
    if (count > 0) throw new ApiError(400, `Cannot delete. ${count} expense entries are linked to this head.`);
    await prisma.expenseHead.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Expense head deleted successfully"));
});

// =====================================
// Expense Controllers
// =====================================
exports.getExpenses = asyncHandler(async (req, res) => {
    const { search, startDate, endDate } = req.query;
    
    const where = {
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { invoiceNumber: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(startDate && endDate && {
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        })
    };
    
    const expenses = await prisma.expense.findMany({
        where,
        include: { expenseHead: { select: { name: true } } },
        orderBy: { date: 'desc' }
    });
    
    res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

exports.createExpense = asyncHandler(async (req, res) => {
    const expense = await prisma.expense.create({
        data: {
            ...req.body,
            date: new Date(req.body.date),
            amount: parseFloat(req.body.amount)
        }
    });
    res.status(201).json(new ApiResponse(201, expense, "Expense added successfully"));
});

exports.updateExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Expense record not found");
    const expense = await prisma.expense.update({
        where: { id },
        data: {
            ...req.body,
            date: req.body.date ? new Date(req.body.date) : existing.date,
            amount: req.body.amount !== undefined ? parseFloat(req.body.amount) : existing.amount
        }
    });
    res.status(200).json(new ApiResponse(200, expense, "Expense updated successfully"));
});

exports.deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Expense record not found");
    await prisma.expense.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Expense deleted successfully"));
});
