
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { cloudinary } = require('../config/cloudinary');

// Get all students with pagination and search
exports.getStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '', classId, sectionId, categoryId, houseId, gender } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        isDisabled: false,
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNo: { contains: search, mode: 'insensitive' } },
                { rollNumber: { contains: search, mode: 'insensitive' } },
                { enrollNumber: { contains: search, mode: 'insensitive' } }
            ]
        }),
        ...(classId && { classId }),
        ...(sectionId && { sectionId }),
        ...(categoryId && { categoryId }),
        ...(houseId && { houseId }),
        ...(gender && { gender })
    };

    const students = await prisma.student.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
            Class: { select: { id: true, name: true } },
            Section: { select: { id: true, name: true } },
            Category: { select: { id: true, name: true } },
            House: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.student.count({ where });

    res.status(200).json(new ApiResponse(200, students, "Students fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

// Get disabled students
exports.getDisabledStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '' } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        isDisabled: true,
        ...(search && {
            OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { admissionNo: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const students = await prisma.student.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            DisableReason: { select: { reason: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    const total = await prisma.student.count({ where });

    res.status(200).json(new ApiResponse(200, students, "Disabled students fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

// Admit a new student
exports.admitStudent = asyncHandler(async (req, res) => {
    const {
        enrollNumber,
        firstName, middleName, lastName, gender, dob, mobileNumber, email, admissionDate,
        classId, sectionId, categoryId, houseId,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianIs, guardianName, guardianRelation, guardianPhone, guardianAddress
    } = req.body;

    // Validate required fields
    if (!firstName || !gender || !dob || !classId || !sectionId || !guardianName || !guardianPhone) {
        throw new ApiError(400, "Missing required fields");
    }

    // Auto-generate admission number
    const lastStudent = await prisma.student.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { admissionNo: true }
    });

    let admissionNo;
    if (lastStudent && lastStudent.admissionNo) {
        const lastNum = parseInt(lastStudent.admissionNo);
        admissionNo = (lastNum + 1).toString();
    } else {
        admissionNo = '1';
    }

    // Handle file uploads from multer
    let photoUrl = null;
    let birthCertificateUrl = null;

    if (req.files) {
        if (req.files.photo) {
            photoUrl = req.files.photo[0].path;
        }
        if (req.files.birthCertificate) {
            birthCertificateUrl = req.files.birthCertificate[0].path;
        }
    }

    const student = await prisma.student.create({
        data: {
            admissionNo,
            enrollNumber: enrollNumber || null,
            firstName,
            middleName: middleName || null,
            lastName: lastName || null,
            gender,
            dob: new Date(dob),
            mobileNumber: mobileNumber || null,
            email: email || null,
            admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
            photo: photoUrl,
            birthCertificate: birthCertificateUrl,
            classId,
            sectionId,
            categoryId: categoryId || null,
            houseId: houseId || null,
            fatherName: fatherName || null,
            fatherPhone: fatherPhone || null,
            motherName: motherName || null,
            motherPhone: motherPhone || null,
            guardianIs: guardianIs || 'Father',
            guardianName,
            guardianRelation: guardianRelation || null,
            guardianPhone,
            guardianAddress: guardianAddress || null
        },
        include: {
            Class: true,
            Section: true,
            Category: true,
            House: true
        }
    });

    // Trigger notification
    try {
        const { createNotification } = require('../utils/notification');
        await createNotification({
            title: "New Student Admission",
            message: `Student ${firstName} ${lastName || ''} has been admitted to Class ${student.Class?.name} - Section ${student.Section?.name} (Admission No: ${admissionNo})`,
            type: "admission"
        });
    } catch (err) {
        console.error("Failed to trigger admission notification:", err);
    }

    res.status(201).json(new ApiResponse(201, student, `Student admitted successfully with Admission No: ${admissionNo}`));
});

// Get student details by ID
exports.getStudentDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
        where: { id },
        include: {
            Class: true,
            Section: true,
            Category: true,
            House: true,
            DisableReason: true
        }
    });

    if (!student) throw new ApiError(404, "Student not found");

    res.status(200).json(new ApiResponse(200, student, "Student details fetched"));
});

// Update student
exports.updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
        admissionNo, rollNumber, enrollNumber,
        firstName, middleName, lastName, gender, dob, mobileNumber, email, admissionDate,
        classId, sectionId, categoryId, houseId,
        fatherName, fatherPhone, motherName, motherPhone,
        guardianIs, guardianName, guardianRelation, guardianPhone, guardianAddress
    } = req.body;

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent) throw new ApiError(404, "Student not found");

    // Check if admission number is being changed and if it conflicts
    if (admissionNo && admissionNo !== existingStudent.admissionNo) {
        const duplicate = await prisma.student.findFirst({ where: { admissionNo } });
        if (duplicate) {
            throw new ApiError(400, "Admission number already exists in this school");
        }
    }

    // Handle file uploads
    let photoUrl = existingStudent.photo;
    let birthCertificateUrl = existingStudent.birthCertificate;

    if (req.files) {
        if (req.files.photo) {
            // Delete old photo from Cloudinary if exists
            if (existingStudent.photo) {
                const publicId = existingStudent.photo.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`gradex-sms/${publicId}`);
            }
            photoUrl = req.files.photo[0].path;
        }
        if (req.files.birthCertificate) {
            // Delete old birth certificate from Cloudinary if exists
            if (existingStudent.birthCertificate) {
                const publicId = existingStudent.birthCertificate.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`gradex-sms/${publicId}`);
            }
            birthCertificateUrl = req.files.birthCertificate[0].path;
        }
    }

    const student = await prisma.student.update({
        where: { id },
        data: {
            admissionNo: admissionNo || existingStudent.admissionNo,
            rollNumber: rollNumber !== undefined ? rollNumber : existingStudent.rollNumber,
            enrollNumber: enrollNumber !== undefined ? enrollNumber : existingStudent.enrollNumber,
            firstName: firstName || existingStudent.firstName,
            middleName: middleName !== undefined ? middleName : existingStudent.middleName,
            lastName: lastName !== undefined ? lastName : existingStudent.lastName,
            gender: gender || existingStudent.gender,
            dob: dob ? new Date(dob) : existingStudent.dob,
            mobileNumber: mobileNumber !== undefined ? mobileNumber : existingStudent.mobileNumber,
            email: email !== undefined ? email : existingStudent.email,
            admissionDate: admissionDate ? new Date(admissionDate) : existingStudent.admissionDate,
            photo: photoUrl,
            birthCertificate: birthCertificateUrl,
            classId: classId || existingStudent.classId,
            sectionId: sectionId || existingStudent.sectionId,
            categoryId: categoryId !== undefined ? categoryId : existingStudent.categoryId,
            houseId: houseId !== undefined ? houseId : existingStudent.houseId,
            fatherName: fatherName !== undefined ? fatherName : existingStudent.fatherName,
            fatherPhone: fatherPhone !== undefined ? fatherPhone : existingStudent.fatherPhone,
            motherName: motherName !== undefined ? motherName : existingStudent.motherName,
            motherPhone: motherPhone !== undefined ? motherPhone : existingStudent.motherPhone,
            guardianIs: guardianIs || existingStudent.guardianIs,
            guardianName: guardianName || existingStudent.guardianName,
            guardianRelation: guardianRelation !== undefined ? guardianRelation : existingStudent.guardianRelation,
            guardianPhone: guardianPhone || existingStudent.guardianPhone,
            guardianAddress: guardianAddress !== undefined ? guardianAddress : existingStudent.guardianAddress
        },
        include: {
            Class: true,
            Section: true,
            Category: true,
            House: true
        }
    });

    res.status(200).json(new ApiResponse(200, student, "Student updated successfully"));
});

// Delete student (soft delete)
exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) throw new ApiError(404, "Student not found");

    await prisma.student.update({
        where: { id },
        data: { isDisabled: true }
    });

    res.status(200).json(new ApiResponse(200, null, "Student deleted successfully"));
});

// Disable/Enable student
exports.toggleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isDisabled, disableReasonId } = req.body;

    const student = await prisma.student.update({
        where: { id },
        data: {
            isDisabled,
            disableReasonId: isDisabled ? disableReasonId : null
        },
        include: {
            Class: true,
            Section: true,
            DisableReason: true
        }
    });

    res.status(200).json(new ApiResponse(200, student, `Student status updated to ${isDisabled ? 'disabled' : 'enabled'}`));
});

// Bulk delete students
exports.bulkDeleteStudents = asyncHandler(async (req, res) => {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        throw new ApiError(400, "Student IDs array is required");
    }

    const result = await prisma.student.updateMany({
        where: { id: { in: studentIds } },
        data: { isDisabled: true }
    });

    res.status(200).json(new ApiResponse(200, { count: result.count }, `${result.count} students deleted successfully`));
});
