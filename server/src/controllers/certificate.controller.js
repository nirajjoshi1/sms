const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Certificate Template Controllers
// =====================================
exports.getCertificateTemplates = asyncHandler(async (req, res) => {
    const templates = await prisma.certificateTemplate.findMany({
        orderBy: { name: 'asc' }
    });
    
    // Map fields for frontend
    const mappedTemplates = templates.map(t => ({
        ...t,
        headerText: t.headerCenterText,
        footerText: t.footerCenterText
    }));
    
    res.status(200).json(new ApiResponse(200, mappedTemplates, "Certificate templates fetched successfully"));
});

exports.getCertificateTemplateById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const template = await prisma.certificateTemplate.findUnique({
        where: { id }
    });

    if (!template) {
        throw new ApiError(404, "Certificate template not found");
    }

    const mappedTemplate = {
        ...template,
        headerText: template.headerCenterText,
        footerText: template.footerCenterText
    };

    res.status(200).json(new ApiResponse(200, mappedTemplate, "Certificate template fetched successfully"));
});

exports.createCertificateTemplate = asyncHandler(async (req, res) => {
    const { name, bodyText, headerText, footerText, schoolId } = req.body;
    
    const template = await prisma.certificateTemplate.create({
        data: {
            name,
            bodyText,
            headerCenterText: headerText,
            footerCenterText: footerText,
            schoolId
        }
    });
    
    const mappedTemplate = {
        ...template,
        headerText: template.headerCenterText,
        footerText: template.footerCenterText
    };
    
    res.status(201).json(new ApiResponse(201, mappedTemplate, "Certificate template created successfully"));
});

exports.updateCertificateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, bodyText, headerText, footerText } = req.body;

    const template = await prisma.certificateTemplate.update({
        where: { id },
        data: {
            name,
            bodyText,
            headerCenterText: headerText,
            footerCenterText: footerText,
        }
    });

    const mappedTemplate = {
        ...template,
        headerText: template.headerCenterText,
        footerText: template.footerCenterText
    };

    res.status(200).json(new ApiResponse(200, mappedTemplate, "Certificate template updated successfully"));
});

exports.deleteCertificateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.certificateTemplate.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Certificate template deleted successfully"));
});

// =====================================
// ID Card Template Controllers
// =====================================
exports.getIdCardTemplates = asyncHandler(async (req, res) => {
    const { templateFor } = req.query;

    const templates = await prisma.idCardTemplate.findMany({
        where: {
            ...(templateFor && { templateFor })
        },
        orderBy: { title: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, templates, "ID card templates fetched successfully"));
});

exports.getIdCardTemplateById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const template = await prisma.idCardTemplate.findUnique({
        where: { id }
    });

    if (!template) {
        throw new ApiError(404, "ID card template not found");
    }

    res.status(200).json(new ApiResponse(200, template, "ID card template fetched successfully"));
});

exports.createIdCardTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.idCardTemplate.create({
        data: { ...req.body }
    });
    res.status(201).json(new ApiResponse(201, template, "ID card template created successfully"));
});

exports.updateIdCardTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const template = await prisma.idCardTemplate.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, template, "ID card template updated successfully"));
});

exports.deleteIdCardTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.idCardTemplate.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "ID card template deleted successfully"));
});

// =====================================
// Certificate Generation Controllers
// =====================================
exports.generateCertificate = asyncHandler(async (req, res) => {
    const { templateId, studentId } = req.body;

    if (!templateId || !studentId) {
        throw new ApiError(400, "Template ID and Student ID are required");
    }

    const [template, student] = await Promise.all([
        prisma.certificateTemplate.findUnique({ where: { id: templateId } }),
        prisma.student.findUnique({
            where: { id: studentId },
            include: {
                Class: { select: { name: true } },
                Section: { select: { name: true } }
            }
        })
    ]);

    if (!template) {
        throw new ApiError(404, "Certificate template not found");
    }

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Return template and student data for frontend PDF generation
    res.status(200).json(new ApiResponse(200, { template, student }, "Certificate data prepared successfully"));
});

exports.generateBulkCertificates = asyncHandler(async (req, res) => {
    const { templateId, studentIds } = req.body;

    if (!templateId || !studentIds || studentIds.length === 0) {
        throw new ApiError(400, "Template ID and Student IDs are required");
    }

    const [template, students] = await Promise.all([
        prisma.certificateTemplate.findUnique({ where: { id: templateId } }),
        prisma.student.findMany({
            where: { id: { in: studentIds } },
            include: {
                Class: { select: { name: true } },
                Section: { select: { name: true } }
            }
        })
    ]);

    if (!template) {
        throw new ApiError(404, "Certificate template not found");
    }

    res.status(200).json(new ApiResponse(200, { template, students }, "Bulk certificate data prepared successfully"));
});

// =====================================
// ID Card Generation Controllers
// =====================================
exports.generateStudentIdCard = asyncHandler(async (req, res) => {
    const { templateId, studentIds } = req.body;

    if (!templateId || !studentIds || studentIds.length === 0) {
        throw new ApiError(400, "Template ID and Student IDs are required");
    }

    const [template, students] = await Promise.all([
        prisma.idCardTemplate.findUnique({ where: { id: templateId } }),
        prisma.student.findMany({
            where: {
                id: { in: studentIds },
                isDisabled: false
            },
            include: {
                Class: { select: { name: true } },
                Section: { select: { name: true } },
                House: { select: { name: true } }
            }
        })
    ]);

    if (!template) {
        throw new ApiError(404, "ID card template not found");
    }

    res.status(200).json(new ApiResponse(200, { template, students }, "Student ID card data prepared successfully"));
});

exports.generateStaffIdCard = asyncHandler(async (req, res) => {
    const { templateId, staffIds } = req.body;

    if (!templateId || !staffIds || staffIds.length === 0) {
        throw new ApiError(400, "Template ID and Staff IDs are required");
    }

    const [template, staffMembers] = await Promise.all([
        prisma.idCardTemplate.findUnique({ where: { id: templateId } }),
        prisma.staff.findMany({
            where: {
                id: { in: staffIds },
                isDisabled: false
            },
            include: {
                Department: { select: { name: true } },
                Designation: { select: { name: true } }
            }
        })
    ]);

    if (!template) {
        throw new ApiError(404, "ID card template not found");
    }

    res.status(200).json(new ApiResponse(200, { template, staffMembers }, "Staff ID card data prepared successfully"));
});

// =====================================
// Transfer Certificate Controller
// =====================================
exports.generateTransferCertificate = asyncHandler(async (req, res) => {
    const { studentId, leavingDate, reason, remarks } = req.body;

    if (!studentId || !leavingDate) {
        throw new ApiError(400, "Student ID and leaving date are required");
    }

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Category: { select: { name: true } }
        }
    });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    const tcData = {
        student,
        leavingDate: new Date(leavingDate),
        reason: reason || '',
        remarks: remarks || '',
        issueDate: new Date()
    };

    res.status(200).json(new ApiResponse(200, tcData, "Transfer certificate data prepared successfully"));
});
