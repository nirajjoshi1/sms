const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { cloudinary } = require('../config/cloudinary');

// Get all staff with pagination and filters
exports.getStaff = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '', role, departmentId, designationId, gender } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        isDisabled: false,
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { staffId: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(role && { role }),
        ...(departmentId && { departmentId }),
        ...(designationId && { designationId }),
        ...(gender && { gender })
    };

    const staff = await prisma.staff.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
            Department: { select: { id: true, name: true } },
            Designation: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.staff.count({ where });

    res.status(200).json(new ApiResponse(200, staff, "Staff fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

// Get disabled staff
exports.getDisabledStaff = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '' } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        isDisabled: true,
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { staffId: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const staff = await prisma.staff.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
            Department: { select: { name: true } },
            Designation: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    const total = await prisma.staff.count({ where });

    res.status(200).json(new ApiResponse(200, staff, "Disabled staff fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

// Add new staff
exports.addStaff = asyncHandler(async (req, res) => {
    const {
        firstName, middleName, lastName, gender, dob, phone, email, dateOfJoining,
        qualification, experience, address, emergencyContact, bloodGroup, maritalStatus,
        role, departmentId, designationId
    } = req.body;

    // Validate required fields
    if (!firstName || !gender || !dob || !role) {
        throw new ApiError(400, "Missing required fields");
    }

    // Auto-generate staff ID
    const lastStaff = await prisma.staff.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { staffId: true }
    });

    let staffId;
    if (lastStaff && lastStaff.staffId) {
        const lastNum = parseInt(lastStaff.staffId.replace(/\D/g, ''));
        staffId = `STF${(lastNum + 1).toString().padStart(4, '0')}`;
    } else {
        staffId = 'STF0001';
    }

    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
        photoUrl = req.file.path;
    }

    const staff = await prisma.staff.create({
        data: {
            staffId,
            firstName,
            middleName: middleName || null,
            lastName: lastName || null,
            gender,
            dob: new Date(dob),
            phone: phone || null,
            email: email || null,
            photo: photoUrl,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
            qualification: qualification || null,
            experience: experience || null,
            address: address || null,
            emergencyContact: emergencyContact || null,
            bloodGroup: bloodGroup || null,
            maritalStatus: maritalStatus || null,
            role,
            departmentId: departmentId || null,
            designationId: designationId || null
        },
        include: {
            Department: true,
            Designation: true
        }
    });

    res.status(201).json(new ApiResponse(201, staff, `Staff added successfully with ID: ${staffId}`));
});

// Get staff details by ID
exports.getStaffDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({
        where: { id },
        include: {
            Department: true,
            Designation: true
        }
    });

    if (!staff) throw new ApiError(404, "Staff not found");

    res.status(200).json(new ApiResponse(200, staff, "Staff details fetched"));
});

// Update staff
exports.updateStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        staffId, firstName, middleName, lastName, gender, dob, phone, email, dateOfJoining,
        qualification, experience, address, emergencyContact, bloodGroup, maritalStatus,
        role, departmentId, designationId
    } = req.body;

    const existingStaff = await prisma.staff.findUnique({ where: { id } });
    if (!existingStaff) throw new ApiError(404, "Staff not found");

    // Check if staffId is being changed and if it conflicts
    if (staffId && staffId !== existingStaff.staffId) {
        const duplicate = await prisma.staff.findFirst({ where: { staffId } });
        if (duplicate) {
            throw new ApiError(400, "Staff ID already exists in this school");
        }
    }

    // Handle photo upload
    let photoUrl = existingStaff.photo;
    if (req.file) {
        if (existingStaff.photo) {
            const publicId = existingStaff.photo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`gradex-sms/${publicId}`);
        }
        photoUrl = req.file.path;
    }

    const staff = await prisma.staff.update({
        where: { id },
        data: {
            staffId: staffId || existingStaff.staffId,
            firstName: firstName || existingStaff.firstName,
            middleName: middleName !== undefined ? middleName : existingStaff.middleName,
            lastName: lastName !== undefined ? lastName : existingStaff.lastName,
            gender: gender || existingStaff.gender,
            dob: dob ? new Date(dob) : existingStaff.dob,
            phone: phone !== undefined ? phone : existingStaff.phone,
            email: email !== undefined ? email : existingStaff.email,
            photo: photoUrl,
            dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : existingStaff.dateOfJoining,
            qualification: qualification !== undefined ? qualification : existingStaff.qualification,
            experience: experience !== undefined ? experience : existingStaff.experience,
            address: address !== undefined ? address : existingStaff.address,
            emergencyContact: emergencyContact !== undefined ? emergencyContact : existingStaff.emergencyContact,
            bloodGroup: bloodGroup !== undefined ? bloodGroup : existingStaff.bloodGroup,
            maritalStatus: maritalStatus !== undefined ? maritalStatus : existingStaff.maritalStatus,
            role: role || existingStaff.role,
            departmentId: departmentId !== undefined ? departmentId : existingStaff.departmentId,
            designationId: designationId !== undefined ? designationId : existingStaff.designationId
        },
        include: {
            Department: true,
            Designation: true
        }
    });

    res.status(200).json(new ApiResponse(200, staff, "Staff updated successfully"));
});

// Delete staff (soft delete)
exports.deleteStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new ApiError(404, "Staff not found");

    await prisma.staff.delete({ where: { id } });

    res.status(200).json(new ApiResponse(200, null, "Staff deleted successfully"));
});

// Toggle staff status (enable/disable)
exports.toggleStaffStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isDisabled, disableReason } = req.body;

    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) throw new ApiError(404, "Staff not found");

    const updatedStaff = await prisma.staff.update({
        where: { id },
        data: {
            isDisabled,
            disableReason: isDisabled ? disableReason : null
        }
    });

    res.status(200).json(new ApiResponse(200, updatedStaff, `Staff ${isDisabled ? 'disabled' : 'enabled'} successfully`));
});

// Bulk delete staff
exports.bulkDeleteStaff = asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, "Please provide valid staff IDs");
    }

    await prisma.staff.deleteMany({
        where: { id: { in: ids } }
    });

    res.status(200).json(new ApiResponse(200, null, `${ids.length} staff members deleted successfully`));
});

module.exports = exports;
