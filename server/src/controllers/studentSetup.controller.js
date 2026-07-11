
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Category Controllers
// =====================================
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { Student: true }
            }
        }
    });
    res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

exports.createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Category name is required");
    }

    // Check if category already exists
    const existing = await prisma.category.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Category with this name already exists in this school");
    }

    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Category name is required");
    }

    const categoryExists = await prisma.category.findUnique({ where: { id } });
    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    // Check if new name conflicts
    const duplicate = await prisma.category.findFirst({
        where: { name, NOT: { id } }
    });
    if (duplicate) {
        throw new ApiError(400, "Category with this name already exists");
    }

    const category = await prisma.category.update({
        where: { id },
        data: { name }
    });

    res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if category has students
    const studentsCount = await prisma.student.count({ where: { categoryId: id } });
    if (studentsCount > 0) {
        throw new ApiError(400, `Cannot delete category. ${studentsCount} students are assigned to this category`);
    }

    const categoryExists = await prisma.category.findUnique({ where: { id } });
    if (!categoryExists) {
        throw new ApiError(404, "Category not found");
    }

    await prisma.category.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});

// =====================================
// House Controllers
// =====================================
exports.getHouses = asyncHandler(async (req, res) => {
    const houses = await prisma.house.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { Student: true }
            }
        }
    });
    res.status(200).json(new ApiResponse(200, houses, "Houses fetched successfully"));
});

exports.createHouse = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "House name is required");
    }

    // Check if house already exists
    const existing = await prisma.house.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "House with this name already exists in this school");
    }

    const house = await prisma.house.create({
        data: { name, description: description || null }
    });
    res.status(201).json(new ApiResponse(201, house, "House created successfully"));
});

exports.updateHouse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "House name is required");
    }

    const houseExists = await prisma.house.findUnique({ where: { id } });
    if (!houseExists) {
        throw new ApiError(404, "House not found");
    }

    // Check if new name conflicts
    const duplicate = await prisma.house.findFirst({
        where: { name, NOT: { id } }
    });
    if (duplicate) {
        throw new ApiError(400, "House with this name already exists");
    }

    const house = await prisma.house.update({
        where: { id },
        data: { name, description: description || null }
    });

    res.status(200).json(new ApiResponse(200, house, "House updated successfully"));
});

exports.deleteHouse = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if house has students
    const studentsCount = await prisma.student.count({ where: { houseId: id } });
    if (studentsCount > 0) {
        throw new ApiError(400, `Cannot delete house. ${studentsCount} students are assigned to this house`);
    }

    const houseExists = await prisma.house.findUnique({ where: { id } });
    if (!houseExists) {
        throw new ApiError(404, "House not found");
    }

    await prisma.house.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "House deleted successfully"));
});

// =====================================
// Disable Reason Controllers
// =====================================
exports.getDisableReasons = asyncHandler(async (req, res) => {
    const reasons = await prisma.disableReason.findMany({
        orderBy: { reason: 'asc' },
        include: {
            _count: {
                select: { Student: true }
            }
        }
    });
    res.status(200).json(new ApiResponse(200, reasons, "Disable reasons fetched successfully"));
});

exports.createDisableReason = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
        throw new ApiError(400, "Disable reason is required");
    }

    // Check if reason already exists
    const existing = await prisma.disableReason.findFirst({ where: { reason } });
    if (existing) {
        throw new ApiError(400, "This disable reason already exists in this school");
    }

    const disableReason = await prisma.disableReason.create({ data: { reason } });
    res.status(201).json(new ApiResponse(201, disableReason, "Disable reason created successfully"));
});

exports.updateDisableReason = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === '') {
        throw new ApiError(400, "Disable reason is required");
    }

    const reasonExists = await prisma.disableReason.findUnique({ where: { id } });
    if (!reasonExists) {
        throw new ApiError(404, "Disable reason not found");
    }

    // Check if new reason conflicts
    const duplicate = await prisma.disableReason.findFirst({
        where: { reason, NOT: { id } }
    });
    if (duplicate) {
        throw new ApiError(400, "This disable reason already exists");
    }

    const disableReason = await prisma.disableReason.update({
        where: { id },
        data: { reason }
    });

    res.status(200).json(new ApiResponse(200, disableReason, "Disable reason updated successfully"));
});

exports.deleteDisableReason = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if reason is being used
    const studentsCount = await prisma.student.count({ where: { disableReasonId: id } });
    if (studentsCount > 0) {
        throw new ApiError(400, `Cannot delete disable reason. ${studentsCount} students are using this reason`);
    }

    const reasonExists = await prisma.disableReason.findUnique({ where: { id } });
    if (!reasonExists) {
        throw new ApiError(404, "Disable reason not found");
    }

    await prisma.disableReason.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Disable reason deleted successfully"));
});
