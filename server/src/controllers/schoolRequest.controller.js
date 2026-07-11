const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Create a new school registration request
// @route   POST /api/v1/school-requests
// @access  Public
exports.createSchoolRequest = asyncHandler(async (req, res) => {
    const { 
        schoolName, 
        schoolCode, 
        contactName, 
        contactEmail, 
        contactPhone,
        address,
        message 
    } = req.body;

    if (!schoolName || !schoolCode || !contactName || !contactEmail || !contactPhone) {
        throw new ApiError(400, "School Name, Proposed Code, Contact Name, Email, and Phone are required");
    }

    // Check if there is an active request with the same school name or email
    const existingRequest = await prisma.schoolRequest.findFirst({
        where: {
            OR: [
                { schoolName },
                { contactEmail }
            ],
            status: "Pending"
        }
    });

    if (existingRequest) {
        throw new ApiError(409, "A pending registration request already exists for this school name or email");
    }

    const schoolRequest = await prisma.schoolRequest.create({
        data: {
            schoolName,
            schoolCode,
            contactName,
            contactEmail,
            contactPhone,
            address,
            message,
            status: "Pending"
        }
    });

    return res.status(201).json(
        new ApiResponse(201, schoolRequest, "Your school registration request has been submitted successfully! We will contact you soon.")
    );
});

// @desc    Get all school requests
// @route   GET /api/v1/school-requests
// @access  Private (Super Admin only)
exports.getAllSchoolRequests = asyncHandler(async (req, res) => {
    const requests = await prisma.schoolRequest.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(
        new ApiResponse(200, requests, "School registration requests fetched successfully")
    );
});

// @desc    Update school request status (Approve / Reject)
// @route   PATCH /api/v1/school-requests/:id/status
// @access  Private (Super Admin only)
exports.updateSchoolRequestStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status type");
    }

    const existingRequest = await prisma.schoolRequest.findUnique({
        where: { id }
    });

    if (!existingRequest) {
        throw new ApiError(404, "School registration request not found");
    }

    const updated = await prisma.schoolRequest.update({
        where: { id },
        data: { status }
    });

    return res.status(200).json(
        new ApiResponse(200, updated, `School registration request updated to ${status} successfully`)
    );
});
