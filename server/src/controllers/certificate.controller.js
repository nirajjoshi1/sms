const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// ID Card Template Controllers
// =====================================
exports.getIdCardTemplates = asyncHandler(async (req, res) => {
    const { templateFor } = req.query;

    const templates = await prisma.idCardTemplate.findMany({
        where: {
            schoolId: req.user.schoolId,
            ...(templateFor && { templateFor })
        },
        orderBy: { title: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, templates, "ID card templates fetched successfully"));
});

exports.getIdCardTemplateById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const template = await prisma.idCardTemplate.findFirst({
        where: { id, schoolId: req.user.schoolId }
    });

    if (!template) {
        throw new ApiError(404, "ID card template not found");
    }

    res.status(200).json(new ApiResponse(200, template, "ID card template fetched successfully"));
});

exports.createIdCardTemplate = asyncHandler(async (req, res) => {
    const template = await prisma.idCardTemplate.create({
        data: { schoolId: req.user.schoolId, ...req.body }
    });
    res.status(201).json(new ApiResponse(201, template, "ID card template created successfully"));
});

exports.updateIdCardTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.idCardTemplate.findFirst({ where: { id, schoolId: req.user.schoolId } });
    if (!existing) throw new ApiError(404, "ID card template not found");

    const template = await prisma.idCardTemplate.update({
        where: { id },
        data: { ...req.body }
    });

    res.status(200).json(new ApiResponse(200, template, "ID card template updated successfully"));
});

exports.deleteIdCardTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const existing = await prisma.idCardTemplate.findFirst({ where: { id, schoolId: req.user.schoolId } });
    if (!existing) throw new ApiError(404, "ID card template not found");

    await prisma.idCardTemplate.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "ID card template deleted successfully"));
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
        prisma.idCardTemplate.findFirst({ where: { id: templateId, schoolId: req.user.schoolId } }),
        prisma.student.findMany({
            where: {
                id: { in: studentIds },
                schoolId: req.user.schoolId,
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
        prisma.idCardTemplate.findFirst({ where: { id: templateId, schoolId: req.user.schoolId } }),
        prisma.staff.findMany({
            where: {
                id: { in: staffIds },
                schoolId: req.user.schoolId,
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
// Transfer Certificate Controllers
// =====================================
exports.getTransferCertificates = asyncHandler(async (req, res) => {
    const certificates = await prisma.issuedCertificate.findMany({
        where: {
            schoolId: req.user.schoolId,
            Template: {
                name: "Transfer Certificate"
            }
        },
        include: {
            Student: {
                include: {
                    Class: { select: { name: true } },
                    Section: { select: { name: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, certificates, "Transfer certificates fetched successfully"));
});

exports.generateTransferCertificate = asyncHandler(async (req, res) => {
    const { studentId, leavingDate, emailToStudent } = req.body;

    if (!studentId || !leavingDate) {
        throw new ApiError(400, "Student ID and leaving date are required");
    }

    const student = await prisma.student.findFirst({
        where: { id: studentId, schoolId: req.user.schoolId },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Category: { select: { name: true } }
        }
    });

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    // Find or create a template for Transfer Certificate so that we satisfy the foreign key constraint
    let template = await prisma.certificateTemplate.findFirst({
        where: { name: "Transfer Certificate", schoolId: req.user.schoolId }
    });

    if (!template) {
        template = await prisma.certificateTemplate.create({
            data: {
                name: "Transfer Certificate",
                bodyText: "Transfer Certificate",
                schoolId: req.user.schoolId
            }
        });
    }

    // Generate unique TC certificate number
    const year = new Date().getFullYear();
    const count = await prisma.issuedCertificate.count({
        where: { schoolId: req.user.schoolId }
    });
    const certificateNumber = `TC-${year}-${(count + 1).toString().padStart(5, '0')}`;

    // Create the record in database to log the generation!
    const issuedCert = await prisma.issuedCertificate.create({
        data: {
            certificateNumber,
            studentId,
            templateId: template.id,
            status: 'Issued',
            nepaliDate: '',
            dynamicFields: {
                leavingDate: new Date(leavingDate).toLocaleDateString()
            },
            schoolId: req.user.schoolId
        }
    });

    const tcData = {
        id: issuedCert.id,
        certificateNumber,
        student,
        leavingDate: new Date(leavingDate),
        reason: '',
        remarks: 'Good',
        issueDate: new Date()
    };

    let emailSent = false;
    let emailError = null;
    let recipient = null;

    if (emailToStudent) {
        if (!student.email) {
            emailError = "Student does not have a registered email address.";
        } else {
            try {
                const school = await prisma.school.findFirst({ where: { id: req.user.schoolId } });
                const { sendEmail } = require('../utils/mailer');
                const { generateCertificatePDF } = require('../utils/pdfGenerator');

                // Construct issuedCert schema for PDF renderer
                const fullIssuedCert = {
                    ...issuedCert,
                    Template: {
                        name: "Transfer Certificate",
                        headerLeftText: "Affiliated to HSEB",
                        footerLeftText: "Class Teacher",
                        footerRightText: "Principal"
                    },
                    Student: student
                };

                const pdfBuffer = await generateCertificatePDF(fullIssuedCert, school);

                await sendEmail({
                    to: student.email,
                    subject: `Transfer Certificate — ${student.firstName} ${student.lastName || ''}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #334155;">
                            <h2 style="color: #dc2626; margin-top: 0;">Academic Transfer Certificate</h2>
                            <p>Dear ${student.firstName},</p>
                            <p>Please find attached your official Transfer Certificate issued by <strong>${school?.name || 'School Management'}</strong>.</p>
                            <br/>
                            <p>Best regards,</p>
                            <p><strong>Administration Department</strong><br/>${school?.name || ''}</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `Transfer_Certificate_${student.firstName}_${student.lastName || ''}.pdf`,
                            content: pdfBuffer
                        }
                    ],
                    schoolId: req.user.schoolId
                });

                emailSent = true;
                recipient = student.email;
            } catch (err) {
                console.error("Failed to email transfer certificate:", err);
                emailError = "Failed to transmit email notification.";
            }
        }
    }

    res.status(200).json(new ApiResponse(200, {
        ...tcData,
        emailSent,
        emailError,
        recipient
    }, "Transfer certificate prepared successfully"));
});

exports.verifyCertificate = asyncHandler(async (req, res) => {
    const { certificateNumber } = req.params;

    const cert = await prisma.issuedCertificate.findFirst({
        where: { certificateNumber },
        include: {
            Student: {
                select: {
                    firstName: true,
                    lastName: true,
                    admissionNo: true,
                    rollNumber: true,
                    dob: true,
                    gender: true,
                    Class: { select: { name: true } },
                    Section: { select: { name: true } }
                }
            },
            Template: {
                select: {
                    name: true,
                    bodyText: true
                }
            }
        }
    });

    if (!cert) {
        throw new ApiError(404, "Certificate not found or invalid certificate number");
    }

    res.status(200).json(new ApiResponse(200, cert, "Certificate verified successfully"));
});
