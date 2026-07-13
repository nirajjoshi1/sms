
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { cloudinary } = require('../config/cloudinary');
const { logAudit } = require('../utils/audit');

// Internal helper to automatically assign roll/enroll numbers
const autoAssignStudentNumbers = async (schoolId) => {
    const students = await prisma.student.findMany({
        where: { schoolId, isDisabled: false },
        orderBy: [
            { firstName: 'asc' },
            { middleName: 'asc' },
            { lastName: 'asc' }
        ]
    });

    if (!students || students.length === 0) return;

    const updates = [];
    const classSectionRollCounts = {};

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const enrollNumber = `ENR-${(i + 1).toString().padStart(4, '0')}`;
        
        const groupKey = `${student.classId}-${student.sectionId}`;
        if (!classSectionRollCounts[groupKey]) {
            classSectionRollCounts[groupKey] = 0;
        }
        classSectionRollCounts[groupKey]++;
        const rollNumber = classSectionRollCounts[groupKey].toString();

        updates.push(
            prisma.student.update({
                where: { id: student.id },
                data: { enrollNumber, rollNumber, updatedAt: new Date() }
            })
        );
    }

    await prisma.$transaction(updates);
};

// Get all students with pagination and search
exports.getStudents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search = '', classId, sectionId, categoryId, houseId, gender } = req.query;

    const skip = (page - 1) * limit;

    const where = {
        isDisabled: false,
        schoolId: req.user.schoolId,
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
        schoolId: req.user.schoolId,
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

    // Preserve prefixes and padding, e.g. MGS-010 -> MGS-011.
    const existingStudents = await prisma.student.findMany({
        select: { admissionNo: true }
    });

    let highestNumber = 0;
    let selectedPrefix = '';
    let selectedWidth = 1;
    for (const student of existingStudents) {
        const match = student.admissionNo?.trim().match(/^(.*?)(\d+)$/);
        if (!match) continue;
        const numericPart = Number(match[2]);
        if (Number.isSafeInteger(numericPart) && numericPart >= highestNumber) {
            highestNumber = numericPart;
            selectedPrefix = match[1];
            selectedWidth = match[2].length;
        }
    }
    const admissionNo = `${selectedPrefix}${String(highestNumber + 1).padStart(selectedWidth, '0')}`;

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
            guardianAddress: guardianAddress || null,
            schoolId: req.user.schoolId,
            updatedAt: new Date()
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
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Welcome to ${req.user.schoolName || 'Our School'}!</h2>
                </div>
                <div style="padding: 20px;">
                    <p style="font-size: 16px; color: #333;">Dear ${guardianName},</p>
                    <p style="font-size: 16px; color: #555;">We are thrilled to welcome <strong>${firstName} ${lastName || ''}</strong> to our institution!</p>
                    
                    <h3 style="color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 5px;">Student Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 8px 0; color: #555;"><strong>Admission No:</strong></td><td style="padding: 8px 0; color: #333;">${admissionNo}</td></tr>
                        <tr><td style="padding: 8px 0; color: #555;"><strong>Class:</strong></td><td style="padding: 8px 0; color: #333;">${student.Class?.name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #555;"><strong>Section:</strong></td><td style="padding: 8px 0; color: #333;">${student.Section?.name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #555;"><strong>Date of Birth:</strong></td><td style="padding: 8px 0; color: #333;">${new Date(dob).toLocaleDateString()}</td></tr>
                    </table>
                    
                    <h3 style="color: #007bff; border-bottom: 2px solid #eee; padding-bottom: 5px;">Important Information</h3>
                    <p style="color: #555; line-height: 1.5;">Please keep this email for your records. If you have any questions regarding fees, transportation, or schedules, please feel free to reach out to the administration office.</p>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #007bff;">
                        <p style="margin: 0; font-size: 14px; color: #555;"><strong>Note:</strong> Your assigned fee plan will be generated shortly. You will receive a separate notification when fees are due.</p>
                    </div>
                </div>
                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    &copy; ${new Date().getFullYear()} ${req.user.schoolName || 'School Management System'}. All rights reserved.
                </div>
            </div>
        `;

        await createNotification({
            title: "New Student Admission",
            message: `Student ${firstName} ${lastName || ''} has been admitted to Class ${student.Class?.name} - Section ${student.Section?.name} (Admission No: ${admissionNo})`,
            type: "admission",
            targetEmail: student.email || undefined, // Send an email if student has an email address
            emailHtml
        });
    } catch (err) {
        console.error("Failed to trigger admission notification:", err);
    }
    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'ADMIT_STUDENT',
        resource: 'Student',
        resourceId: student.id,
        details: { admissionNo, firstName, lastName, classId, sectionId },
        schoolId: req.user.schoolId
    });

    await autoAssignStudentNumbers(req.user.schoolId);

    res.status(201).json(new ApiResponse(201, student, `Student admitted successfully with Admission No: ${admissionNo}`));
});

// Bulk Admit Students
exports.bulkAdmitStudents = asyncHandler(async (req, res) => {
    const { classId, sectionId, students } = req.body;

    if (!classId || !sectionId || !students || !students.length) {
        throw new ApiError(400, "Missing required fields");
    }

    // Auto-generate admission numbers starting from the last known number
    let lastStudent = await prisma.student.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { admissionNo: true }
    });

    let currentNum = 0;
    if (lastStudent && lastStudent.admissionNo) {
        const lastNum = parseInt(lastStudent.admissionNo);
        if (!isNaN(lastNum)) {
            currentNum = lastNum;
        }
    }

    const studentsToCreate = students.map((student, index) => {
        let admissionNo = student.admissionNo;
        if (!admissionNo) {
            if (currentNum > 0) {
                admissionNo = (currentNum + index + 1).toString();
            } else {
                admissionNo = `ADM-${Date.now()}-${index}`;
            }
        }

        return {
            admissionNo,
            enrollNumber: student.enrollNumber || null,
            firstName: student.firstName,
            middleName: student.middleName || null,
            lastName: student.lastName || null,
            gender: student.gender || 'Other',
            dob: student.dob ? new Date(student.dob) : new Date(),
            mobileNumber: student.mobileNumber || null,
            email: student.email || null,
            admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
            classId,
            sectionId,
            categoryId: student.categoryId || null,
            houseId: student.houseId || null,
            fatherName: student.fatherName || null,
            fatherPhone: student.fatherPhone || null,
            motherName: student.motherName || null,
            motherPhone: student.motherPhone || null,
            guardianIs: student.guardianIs || 'Father',
            guardianName: student.guardianName || student.fatherName || student.motherName || 'Unknown',
            guardianRelation: student.guardianRelation || null,
            guardianPhone: student.guardianPhone || student.fatherPhone || student.motherPhone || '0000000000',
            guardianAddress: student.guardianAddress || null,
            isDisabled: false,
            schoolId: req.user.schoolId
        };
    });

    const result = await prisma.student.createMany({
        data: studentsToCreate,
        skipDuplicates: true
    });

    res.status(201).json(new ApiResponse(201, { count: result.count }, `${result.count} students imported successfully`));
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

    if (!student || student.schoolId !== req.user.schoolId) throw new ApiError(404, "Student not found");

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

    // Check if student exists and belongs to school
    const existingStudent = await prisma.student.findUnique({ where: { id } });
    if (!existingStudent || existingStudent.schoolId !== req.user.schoolId) throw new ApiError(404, "Student not found");

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
            guardianAddress: guardianAddress !== undefined ? guardianAddress : existingStudent.guardianAddress,
            updatedAt: new Date()
        },
        include: {
            Class: true,
            Section: true,
            Category: true,
            House: true
        }
    });

    await autoAssignStudentNumbers(req.user.schoolId);

    res.status(200).json(new ApiResponse(200, student, "Student updated successfully"));
});

// Delete student (soft delete)
exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student || student.schoolId !== req.user.schoolId) throw new ApiError(404, "Student not found");

    await prisma.student.update({
        where: { id },
        data: { isDisabled: true, updatedAt: new Date() }
    });

    await autoAssignStudentNumbers(req.user.schoolId);

    res.status(200).json(new ApiResponse(200, null, "Student deleted successfully"));
});

// Disable/Enable student
exports.toggleStudentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isDisabled, disableReasonId } = req.body;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student || student.schoolId !== req.user.schoolId) throw new ApiError(404, "Student not found");

    const updatedStudent = await prisma.student.update({
        where: { id },
        data: {
            isDisabled,
            disableReasonId: isDisabled ? disableReasonId : null,
            updatedAt: new Date()
        },
        include: {
            Class: true,
            Section: true,
            DisableReason: true
        }
    });

    res.status(200).json(new ApiResponse(200, updatedStudent, `Student status updated to ${isDisabled ? 'disabled' : 'enabled'}`));
});

// Bulk delete students
exports.bulkDeleteStudents = asyncHandler(async (req, res) => {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        throw new ApiError(400, "Student IDs array is required");
    }

    const result = await prisma.student.updateMany({
        where: { id: { in: studentIds }, schoolId: req.user.schoolId },
        data: { isDisabled: true, updatedAt: new Date() }
    });

    await autoAssignStudentNumbers(req.user.schoolId);

    res.status(200).json(new ApiResponse(200, { count: result.count }, `${result.count} students deleted successfully`));
});

