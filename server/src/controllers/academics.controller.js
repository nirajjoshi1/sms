
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const { logAudit } = require('../utils/audit');

// =====================================
// Class Controllers
// =====================================
exports.getClasses = asyncHandler(async (req, res) => {
    const classes = await prisma.class.findMany({
        where: { schoolId: req.user.schoolId },
        include: { Section: true },
        orderBy: { name: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, classes, "Classes fetched successfully"));
});

exports.createClass = asyncHandler(async (req, res) => {
    const { name, sectionIds } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Class name is required");
    }

    // Check if class already exists
    const existing = await prisma.class.findFirst({ where: { name, schoolId: req.user.schoolId } });
    if (existing) {
        throw new ApiError(400, "Class with this name already exists in this school");
    }

    const connectSections = sectionIds ? sectionIds.map(id => ({ id })) : [];
    const newClass = await prisma.class.create({
        data: { schoolId: req.user.schoolId, name, schoolId: req.user.schoolId, Section: { connect: connectSections } },
        include: { Section: true }
    });
    res.status(201).json(new ApiResponse(201, newClass, "Class created successfully"));
});

exports.deleteClass = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if class has students
    const studentsCount = await prisma.student.count({ where: { classId: id, schoolId: req.user.schoolId } });
    if (studentsCount > 0) {
        throw new ApiError(400, `Cannot delete class. ${studentsCount} students are enrolled in this class`);
    }

    const classExists = await prisma.class.findUnique({ where: { id } });
    if (!classExists || classExists.schoolId !== req.user.schoolId) {
        throw new ApiError(404, "Class not found");
    }

    await prisma.class.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Class deleted successfully"));
});

exports.updateClass = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, sectionIds } = req.body;
    
    const classExists = await prisma.class.findUnique({ where: { id } });
    if (!classExists || classExists.schoolId !== req.user.schoolId) {
        throw new ApiError(404, "Class not found");
    }
    
    const updatedClass = await prisma.class.update({
        where: { id },
        data: {
            name,
            Section: {
                set: sectionIds ? sectionIds.map(sid => ({ id: sid })) : []
            }
        },
        include: { Section: true }
    });
    res.status(200).json(new ApiResponse(200, updatedClass, "Class updated successfully"));
});

// =====================================
// Section Controllers
// =====================================
exports.getSections = asyncHandler(async (req, res) => {
    const sections = await prisma.section.findMany({ where: { schoolId: req.user.schoolId }, orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, sections, "Sections fetched successfully"));
});

exports.createSection = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === '') {
        throw new ApiError(400, "Section name is required");
    }

    // Check if section already exists
    const existing = await prisma.section.findFirst({ where: { name, schoolId: req.user.schoolId } });
    if (existing) {
        throw new ApiError(400, "Section with this name already exists in this school");
    }

    const newSection = await prisma.section.create({ data: { schoolId: req.user.schoolId, name, schoolId: req.user.schoolId } });
    res.status(201).json(new ApiResponse(201, newSection, "Section created successfully"));
});

exports.deleteSection = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if section has students
    const studentsCount = await prisma.student.count({ where: { sectionId: id, schoolId: req.user.schoolId } });
    if (studentsCount > 0) {
        throw new ApiError(400, `Cannot delete section. ${studentsCount} students are enrolled in this section`);
    }

    const sectionExists = await prisma.section.findUnique({ where: { id } });
    if (!sectionExists || sectionExists.schoolId !== req.user.schoolId) {
        throw new ApiError(404, "Section not found");
    }

    await prisma.section.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Section deleted successfully"));
});

exports.updateSection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    const sectionExists = await prisma.section.findUnique({ where: { id } });
    if (!sectionExists || sectionExists.schoolId !== req.user.schoolId) {
        throw new ApiError(404, "Section not found");
    }
    const updatedSection = await prisma.section.update({
        where: { id },
        data: { name }
    });
    res.status(200).json(new ApiResponse(200, updatedSection, "Section updated successfully"));
});

// =====================================
// Subject Controllers
// =====================================
exports.getSubjects = asyncHandler(async (req, res) => {
    const subjects = await prisma.subject.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, subjects, "Subjects fetched successfully"));
});

exports.createSubject = asyncHandler(async (req, res) => {
    const { name, type, code } = req.body;

    const existingSubject = await prisma.subject.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existingSubject) {
        throw new ApiError(409, "A subject with this name already exists");
    }
    const subject = await prisma.subject.create({
        data: { schoolId: req.user.schoolId, name, type, code }
    });
    res.status(201).json(new ApiResponse(201, subject, "Subject created successfully"));
});

exports.updateSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, type, code } = req.body;

    const existingSubject = await prisma.subject.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } }
    });
    if (existingSubject && existingSubject.id !== id) {
        throw new ApiError(409, "A subject with this name already exists");
    }

    const subject = await prisma.subject.update({
        where: { id },
        data: { name, type, code }
    });

    res.status(200).json(new ApiResponse(200, subject, "Subject updated successfully"));
});

exports.deleteSubject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if subject is used in timetables
    const timetableCount = await prisma.timetable.count({ where: { subjectId: id } });
    if (timetableCount > 0) {
        throw new ApiError(400, `Cannot delete subject. It is used in ${timetableCount} timetable entries`);
    }

    await prisma.subject.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Subject deleted successfully"));
});

// =====================================
// Subject Group Controllers
// =====================================
exports.getSubjectGroups = asyncHandler(async (req, res) => {
    const groups = await prisma.subjectGroup.findMany({
        where: { schoolId: req.user.schoolId },

        include: {
            Class: { select: { name: true }},
            Section: { select: { name: true }},
            Subject: { select: { name: true }}
        },
        orderBy: { name: 'asc' }
    });
    res.status(200).json(new ApiResponse(200, groups, "Subject groups fetched successfully"));
});

exports.createSubjectGroup = asyncHandler(async (req, res) => {
    const { name, description, classId, sectionId, subjectIds } = req.body;
    const connectSubjects = subjectIds ? subjectIds.map(id => ({ id })) : [];

    const group = await prisma.subjectGroup.create({
        data: { schoolId: req.user.schoolId,
            name, description, classId, sectionId,
            Subject: { connect: connectSubjects }
        },
        include: { Subject: true, Class: true, Section: true }
    });
    res.status(201).json(new ApiResponse(201, group, "Subject group created successfully"));
});

exports.updateSubjectGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, classId, sectionId, subjectIds } = req.body;

    const group = await prisma.subjectGroup.update({
        where: { id },
        data: {
            name, description, classId, sectionId,
            Subject: {
                set: subjectIds ? subjectIds.map(sid => ({ id: sid })) : []
            }
        },
        include: { Subject: true, Class: true, Section: true }
    });

    res.status(200).json(new ApiResponse(200, group, "Subject group updated successfully"));
});

exports.deleteSubjectGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.subjectGroup.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Subject group deleted successfully"));
});

// =====================================
// Class Teacher Controllers
// =====================================
exports.getClassTeachers = asyncHandler(async (req, res) => {
    const classTeachers = await prisma.classTeacher.findMany({
        where: { schoolId: req.user.schoolId },

        include: {
            Class: { select: { name: true }},
            Section: { select: { name: true }},
            Staff: { select: { firstName: true, lastName: true, staffId: true }}
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, classTeachers, "Class teachers fetched successfully"));
});

exports.assignClassTeacher = asyncHandler(async (req, res) => {
    const { classId, sectionId, staffIds } = req.body;

    // Check if any of the staff members are already assigned as class teachers elsewhere
    const existingAssignments = await prisma.classTeacher.findMany({
        where: {
            staffId: { in: staffIds }
        },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Staff: { select: { firstName: true, lastName: true } }
        }
    });

    if (existingAssignments.length > 0) {
        const conflicts = existingAssignments.map(a =>
            `${a.Staff.firstName} ${a.Staff.lastName} is already class teacher of ${a.Class.name} - ${a.Section.name}`
        ).join(', ');
        throw new ApiError(400, `Cannot assign: ${conflicts}`);
    }

    const assignmentsData = staffIds.map(staffId => ({ classId, sectionId, staffId }));
    await prisma.classTeacher.createMany({
        data: assignmentsData,
        skipDuplicates: true
    });
    res.status(201).json(new ApiResponse(201, null, "Class teachers assigned successfully"));
});

exports.removeClassTeacher = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.classTeacher.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Class teacher removed successfully"));
});

// =====================================
// Timetable Controllers
// =====================================
exports.getTimetables = asyncHandler(async (req, res) => {
    const { classId, sectionId, staffId } = req.query;
    
    const timetables = await prisma.timetable.findMany({
        where: {
            ...(classId && { classId }),
            ...(sectionId && { sectionId }),
            ...(staffId && { staffId })
        },
        include: {
            Class: { select: { name: true }},
            Section: { select: { name: true }},
            Subject: { select: { name: true }},
            Staff: { select: { firstName: true, lastName: true }}
        },
        orderBy: { startTime: 'asc' }
    });
    
    res.status(200).json(new ApiResponse(200, timetables, "Timetable fetched successfully"));
});

exports.createTimetable = asyncHandler(async (req, res) => {
    const { dayOfWeek, startTime, endTime, roomNo, classId, sectionId, subjectId, staffId } = req.body;

    // 1. Check if subject is already assigned for this class/section on this day
    const subjectConflict = await prisma.timetable.findFirst({
        where: {
            classId,
            sectionId,
            dayOfWeek,
            subjectId
        }
    });

    if (subjectConflict) {
        throw new ApiError(400, "This subject is already assigned for this class/section on this day");
    }

    // 2. Check teacher's total assignments for the day (max 7 periods)
    const teacherDayAssignments = await prisma.timetable.count({
        where: {
            staffId,
            dayOfWeek
        }
    });

    if (teacherDayAssignments >= 7) {
        throw new ApiError(400, "Teacher has reached maximum 7 periods for this day");
    }

    // 3. Check for teacher time slot conflict
    const conflict = await prisma.timetable.findFirst({
        where: {
            staffId,
            dayOfWeek,
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                }
            ]
        }
    });

    if (conflict) {
        throw new ApiError(400, "Teacher is already assigned to another class at this time");
    }

    const timetable = await prisma.timetable.create({
        data: { schoolId: req.user.schoolId, dayOfWeek, startTime, endTime, roomNo, classId, sectionId, subjectId, staffId },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Subject: { select: { name: true } },
            Staff: { select: { firstName: true, lastName: true } }
        }
    });

    res.status(201).json(new ApiResponse(201, timetable, "Timetable entry created successfully"));
});

exports.updateTimetable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { dayOfWeek, startTime, endTime, roomNo, classId, sectionId, subjectId, staffId } = req.body;

    // 1. Check if subject is already assigned (excluding current entry)
    const subjectConflict = await prisma.timetable.findFirst({
        where: {
            id: { not: id },
            classId,
            sectionId,
            dayOfWeek,
            subjectId
        }
    });

    if (subjectConflict) {
        throw new ApiError(400, "This subject is already assigned for this class/section on this day");
    }

    // 2. Check teacher's total assignments for the day (excluding current entry, max 7)
    const teacherDayAssignments = await prisma.timetable.count({
        where: {
            id: { not: id },
            staffId,
            dayOfWeek
        }
    });

    if (teacherDayAssignments >= 7) {
        throw new ApiError(400, "Teacher has reached maximum 7 periods for this day");
    }

    // 3. Check for teacher time slot conflict (excluding current entry)
    const conflict = await prisma.timetable.findFirst({
        where: {
            id: { not: id },
            staffId,
            dayOfWeek,
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } }
                    ]
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } }
                    ]
                }
            ]
        }
    });

    if (conflict) {
        throw new ApiError(400, "Teacher is already assigned to another class at this time");
    }

    const timetable = await prisma.timetable.update({
        where: { id },
        data: { dayOfWeek, startTime, endTime, roomNo, classId, sectionId, subjectId, staffId },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Subject: { select: { name: true } },
            Staff: { select: { firstName: true, lastName: true } }
        }
    });

    res.status(200).json(new ApiResponse(200, timetable, "Timetable entry updated successfully"));
});

exports.deleteTimetable = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.timetable.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Timetable entry deleted successfully"));
});

// =====================================
// Student Promotion Controller
// =====================================
exports.promoteStudents = asyncHandler(async (req, res) => {
    const { fromClassId, fromSectionId, toClassId, toSectionId, studentIds } = req.body;

    if (!toClassId || !toSectionId || !studentIds || studentIds.length === 0) {
        throw new ApiError(400, "Missing required fields");
    }

    // Retrieve active session
    const currentSession = await prisma.academicSession.findFirst({
        where: { isCurrent: true }
    });
    if (!currentSession) {
        throw new ApiError(400, "No active academic session found. Please set a current session first.");
    }

    // Validate destination class and section exist
    const [toClass, toSection] = await Promise.all([
        prisma.class.findUnique({ where: { id: toClassId } }),
        prisma.section.findUnique({ where: { id: toSectionId } })
    ]);

    if (!toClass || !toSection) {
        throw new ApiError(404, "Destination class or section not found");
    }

    // Perform promotion in a secure transaction
    const result = await prisma.$transaction(async (tx) => {
        // Fetch target students to verify and log their previous states
        const students = await tx.student.findMany({
            where: { id: { in: studentIds } }
        });

        if (students.length === 0) {
            throw new ApiError(404, "No students found to promote");
        }

        // Create history log and update current class/section for each student
        for (const student of students) {
            // Log history for the session they are leaving/completing
            await tx.studentHistory.create({
                data: { schoolId: req.user.schoolId,
                    studentId: student.id,
                    classId: student.classId,
                    sectionId: student.sectionId,
                    academicSessionId: currentSession.id,
                    status: 'Promoted',
                    schoolId: req.user.schoolId
                }
            });

            // Transition student to the new class and section
            await tx.student.update({
                where: { id: student.id },
                data: {
                    classId: toClassId,
                    sectionId: toSectionId,
                    rollNumber: null // Reset roll number for the new class
                }
            });
        }

        return students.length;
    });

    await logAudit({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'PROMOTE_STUDENTS',
        resource: 'Student',
        details: { count: result, studentIds, toClassId, toSectionId, academicSessionId: currentSession.id },
        schoolId: req.user.schoolId
    });

    res.status(200).json(new ApiResponse(200, { promotedCount: result }, `${result} students promoted successfully`));
});

// @desc Get all marks for admin overview
// @route GET /api/v1/academics/marks
// @access ADMIN
exports.getAllMarks = asyncHandler(async (req, res) => {
    const { classId, sectionId, subjectId, examType } = req.query;

    const marks = await prisma.mark.findMany({
        where: {
            ...(classId && { classId }),
            ...(sectionId && { sectionId }),
            ...(subjectId && { subjectId }),
            ...(examType && { examType })
        },
        include: {
            Student: { select: { firstName: true, lastName: true, admissionNo: true } },
            Subject: { select: { name: true } },
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Staff: { select: { firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Aggregate stats
    const total = marks.length;
    const passing = marks.filter(m => m.grade !== 'F' && m.grade !== 'Fail').length;
    const avgMarks = total > 0
        ? (marks.reduce((sum, m) => sum + Number(m.marksObtained || 0), 0) / total).toFixed(1)
        : 0;

    res.status(200).json(new ApiResponse(200, {
        marks,
        summary: { total, passing, failing: total - passing, avgMarks }
    }, 'Marks fetched successfully'));
});
