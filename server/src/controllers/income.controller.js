const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Income Head Controllers
// =====================================
exports.getIncomeHeads = asyncHandler(async (req, res) => {
    const heads = await prisma.incomeHead.findMany({
        orderBy: { name: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, heads, "Income heads fetched successfully"));
});

exports.createIncomeHead = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Income head name is required");
    }

    const existing = await prisma.incomeHead.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Income head with this name already exists in this school");
    }

    const head = await prisma.incomeHead.create({
        data: { name, description }
    });
    res.status(201).json(new ApiResponse(201, head, "Income head created successfully"));
});

exports.updateIncomeHead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const head = await prisma.incomeHead.update({
        where: { id },
        data: { name, description }
    });
    res.status(200).json(new ApiResponse(200, head, "Income head updated successfully"));
});

exports.deleteIncomeHead = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const incomeCount = await prisma.income.count({ where: { incomeHeadId: id } });
    if (incomeCount > 0) {
        throw new ApiError(400, `Cannot delete. ${incomeCount} income records are using this head`);
    }

    await prisma.incomeHead.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Income head deleted successfully"));
});

// =====================================
// Income Controllers
// =====================================
exports.getIncomes = asyncHandler(async (req, res) => {
    const { incomeHeadId, fromDate, toDate, search } = req.query;

    const where = {
        ...(incomeHeadId && { incomeHeadId }),
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

    const incomes = await prisma.income.findMany({
        where,
        include: {
            IncomeHead: { select: { name: true } }
        },
        orderBy: { date: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, incomes, "Incomes fetched successfully"));
});

exports.createIncome = asyncHandler(async (req, res) => {
    const { name, invoiceNumber, date, amount, incomeHeadId, description, documentUrl } = req.body;

    if (!name || !date || !amount || !incomeHeadId) {
        throw new ApiError(400, "Name, date, amount, and income head are required");
    }

    const income = await prisma.income.create({
        data: {
            name,
            invoiceNumber,
            date: new Date(date),
            amount: parseFloat(amount),
            incomeHeadId,
            description,
            documentUrl
        },
        include: {
            IncomeHead: { select: { name: true } }
        }
    });

    res.status(201).json(new ApiResponse(201, income, "Income added successfully"));
});

exports.updateIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, invoiceNumber, date, amount, incomeHeadId, description, documentUrl } = req.body;

    const income = await prisma.income.update({
        where: { id },
        data: {
            name,
            invoiceNumber,
            date: date ? new Date(date) : undefined,
            amount: amount ? parseFloat(amount) : undefined,
            incomeHeadId,
            description,
            documentUrl
        },
        include: {
            IncomeHead: { select: { name: true } }
        }
    });

    res.status(200).json(new ApiResponse(200, income, "Income updated successfully"));
});

exports.deleteIncome = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.income.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Income deleted successfully"));
});

exports.getIncomeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const income = await prisma.income.findUnique({
        where: { id },
        include: {
            IncomeHead: true
        }
    });

    if (!income) {
        throw new ApiError(404, "Income not found");
    }

    res.status(200).json(new ApiResponse(200, income, "Income fetched successfully"));
});
