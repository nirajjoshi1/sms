
const { ApiResponse } = require('../utils/ApiResponse');
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
