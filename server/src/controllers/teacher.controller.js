const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// ─── Helper: Get Staff linked to this user ─────────────────────────────────
const getStaff = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { Staff: true }
    });
    if (!user) throw new ApiError(401, 'User account not found');
    if (user?.Staff) return user.Staff;

    const staff = await prisma.staff.findFirst({ where: { email: user.email } });
    if (!staff) throw new ApiError(404, 'No Staff record linked to this account. Please contact admin.');
    return staff;
};

const getSchoolFilter = (staff) => staff.schoolId ? { schoolId: staff.schoolId } : {};

const ensureClassAccess = async (staff, classId, sectionId) => {
    const [classTeacher, timetable] = await Promise.all([
        prisma.classTeacher.findFirst({ where: { staffId: staff.id, classId, sectionId, ...getSchoolFilter(staff) } }),
        prisma.timetable.findFirst({ where: { staffId: staff.id, classId, sectionId, ...getSchoolFilter(staff) } })
    ]);

    if (!classTeacher && !timetable) {
        throw new ApiError(403, 'You are not assigned to this class and section');
    }

    return { isClassTeacher: !!classTeacher, teachesClass: !!timetable };
};

const ensureSubjectAccess = async (staff, classId, sectionId, subjectId) => {
    const { isClassTeacher } = await ensureClassAccess(staff, classId, sectionId);
    if (isClassTeacher) return;

    const timetable = await prisma.timetable.findFirst({
        where: { staffId: staff.id, classId, sectionId, subjectId, ...getSchoolFilter(staff) }
    });

    if (!timetable) {
        throw new ApiError(403, 'You are not assigned to teach this subject for the selected class');
    }
};

const normalizeDate = (date) => {
    const normalized = new Date(date);
    if (Number.isNaN(normalized.getTime())) throw new ApiError(400, 'Invalid date');
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const getEndOfDay = (date) => {
    const end = normalizeDate(date);
    end.setHours(23, 59, 59, 999);
    return end;
};

const addSubjectsToClassTeachers = async (assignments, staff) => {
    return Promise.all(assignments.map(async (assignment) => {
        const subjectGroups = await prisma.subjectGroup.findMany({
            where: {
                classId: assignment.classId,
                sectionId: assignment.sectionId,
                ...getSchoolFilter(staff)
            },
            include: {
                Subject: { select: { id: true, name: true, code: true, type: true } }
            }
        });

        const subjects = [];
        subjectGroups.forEach(group => {
            group.Subject.forEach(subject => {
                if (!subjects.some(item => item.id === subject.id)) {
                    subjects.push(subject);
                }
            });
        });

        return { ...assignment, Subjects: subjects };
    }));
};

// ─── Get My Profile ────────────────────────────────────────────────────────
exports.getMyProfile = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);

    const classTeacher = await prisma.classTeacher.findMany({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: {
            Class: { select: { id: true, name: true } },
            Section: { select: { id: true, name: true } }
        }
    });

    const isClassTeacher = classTeacher.length > 0;

    res.status(200).json(new ApiResponse(200, { staff, classTeacher, isClassTeacher }, 'Profile fetched successfully'));
});

// ─── Get My Schedule (Timetable) ───────────────────────────────────────────
exports.getMySchedule = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);

    const schedule = await prisma.timetable.findMany({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: {
            Class: { select: { id: true, name: true } },
            Section: { select: { id: true, name: true } },
            Subject: { select: { id: true, name: true, code: true } }
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped = days.reduce((acc, day) => {
        acc[day] = schedule.filter(s => s.dayOfWeek === day);
        return acc;
    }, {});

    res.status(200).json(new ApiResponse(200, { schedule, grouped }, 'Schedule fetched successfully'));
});

// ─── Get My Classes ────────────────────────────────────────────────────────
exports.getMyClasses = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);

    // Unique class+section combos from timetable
    const timetable = await prisma.timetable.findMany({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: {
            Class: { select: { id: true, name: true } },
            Section: { select: { id: true, name: true } },
            Subject: { select: { id: true, name: true, code: true, type: true } }
        }
    });

    const byClass = new Map();
    timetable.forEach(t => {
        const key = `${t.classId}-${t.sectionId}`;
        if (!byClass.has(key)) {
            byClass.set(key, {
                classId: t.classId,
                sectionId: t.sectionId,
                Class: t.Class,
                Section: t.Section,
                Subjects: [],
                periodCount: 0
            });
        }

        const item = byClass.get(key);
        item.periodCount += 1;
        if (!item.Subjects.some(subject => subject.id === t.Subject.id)) {
            item.Subjects.push(t.Subject);
        }
    });
    const teachingClasses = Array.from(byClass.values());

    // Class teacher assignments
    const assignments = await prisma.classTeacher.findMany({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: {
            Class: { select: { id: true, name: true } },
            Section: { select: { id: true, name: true } }
        }
    });
    const classTeacherOf = await addSubjectsToClassTeachers(assignments, staff);

    const merged = new Map();
    [...classTeacherOf, ...teachingClasses].forEach(item => {
        const key = `${item.classId}-${item.sectionId}`;
        if (!merged.has(key)) {
            merged.set(key, {
                classId: item.classId,
                sectionId: item.sectionId,
                Class: item.Class,
                Section: item.Section,
                Subjects: [],
                isClassTeacher: false,
                periodCount: 0
            });
        }

        const existing = merged.get(key);
        existing.isClassTeacher = existing.isClassTeacher || !!item.staffId;
        existing.periodCount += item.periodCount || 0;
        (item.Subjects || []).forEach(subject => {
            if (!existing.Subjects.some(saved => saved.id === subject.id)) {
                existing.Subjects.push(subject);
            }
        });
    });

    res.status(200).json(new ApiResponse(200, {
        teachingClasses,
        classTeacherOf,
        classes: Array.from(merged.values()),
        isClassTeacher: classTeacherOf.length > 0
    }, 'Classes fetched'));
});

// ─── Get Students for a Class/Section ─────────────────────────────────────
exports.getStudents = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { classId, sectionId } = req.query;
    if (!classId || !sectionId) throw new ApiError(400, 'classId and sectionId are required');
    await ensureClassAccess(staff, classId, sectionId);

    const students = await prisma.student.findMany({
        where: { classId, sectionId, isDisabled: false, ...getSchoolFilter(staff) },
        select: {
            id: true, admissionNo: true, rollNumber: true,
            firstName: true, lastName: true, gender: true, photo: true,
            Class: { select: { name: true } },
            Section: { select: { name: true } }
        },
        orderBy: [{ rollNumber: 'asc' }, { firstName: 'asc' }]
    });

    res.status(200).json(new ApiResponse(200, students, 'Students fetched'));
});

// ─── Take Attendance (Batch Upsert) ───────────────────────────────────────
exports.takeAttendance = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { date, classId, sectionId, attendances } = req.body;
    if (!date || !classId || !sectionId || !Array.isArray(attendances) || attendances.length === 0) {
        throw new ApiError(400, 'date, classId, sectionId, and attendances[] are required');
    }
    await ensureClassAccess(staff, classId, sectionId);

    const attendanceDate = normalizeDate(date);
    const validStudents = await prisma.student.findMany({
        where: {
            id: { in: attendances.map(a => a.studentId) },
            classId,
            sectionId,
            isDisabled: false,
            ...getSchoolFilter(staff)
        },
        select: { id: true }
    });
    if (validStudents.length !== attendances.length) {
        throw new ApiError(400, 'Attendance contains students outside the selected class');
    }

    const ops = attendances.map(a =>
        prisma.studentAttendance.upsert({
            where: { studentId_date: { studentId: a.studentId, date: attendanceDate } },
            update: { status: a.status, note: a.note || null },
            create: { studentId: a.studentId, classId, sectionId, date: attendanceDate, status: a.status, note: a.note || null, schoolId: staff.schoolId || null }
        })
    );

    const results = await prisma.$transaction(ops);

    res.status(200).json(new ApiResponse(200, results, `Attendance saved for ${results.length} students`));
});

// ─── Get Attendance for a Date & Class ───────────────────────────────────
exports.getAttendance = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { date, classId, sectionId } = req.query;
    if (!classId || !sectionId) throw new ApiError(400, 'classId and sectionId are required');
    await ensureClassAccess(staff, classId, sectionId);

    const where = { classId, sectionId, ...getSchoolFilter(staff) };
    if (date) {
        const d = normalizeDate(date);
        where.date = { gte: d, lte: getEndOfDay(date) };
    }

    const attendance = await prisma.studentAttendance.findMany({
        where,
        include: {
            Student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, rollNumber: true, photo: true } }
        },
        orderBy: { date: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, attendance, 'Attendance fetched'));
});

// ─── Get Attendance Report (Summary) ─────────────────────────────────────
exports.getAttendanceReport = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { classId, sectionId, fromDate, toDate } = req.query;
    if (!classId || !sectionId) throw new ApiError(400, 'classId and sectionId are required');
    await ensureClassAccess(staff, classId, sectionId);

    const where = { classId, sectionId, ...getSchoolFilter(staff) };
    if (fromDate && toDate) {
        where.date = { gte: normalizeDate(fromDate), lte: getEndOfDay(toDate) };
    }

    const records = await prisma.studentAttendance.findMany({
        where,
        include: {
            Student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, rollNumber: true } }
        },
        orderBy: { date: 'desc' }
    });

    // Group by student
    const byStudent = records.reduce((acc, r) => {
        if (!acc[r.studentId]) {
            acc[r.studentId] = { student: r.Student, present: 0, absent: 0, late: 0, halfDay: 0, total: 0 };
        }
        acc[r.studentId].total++;
        if (r.status === 'Present') acc[r.studentId].present++;
        else if (r.status === 'Absent') acc[r.studentId].absent++;
        else if (r.status === 'Late') acc[r.studentId].late++;
        else if (r.status === 'HalfDay') acc[r.studentId].halfDay++;
        return acc;
    }, {});

    const summary = Object.values(byStudent).map(s => ({
        ...s,
        attendanceRate: s.total > 0 ? ((s.present + s.halfDay * 0.5) / s.total * 100).toFixed(1) : '0.0'
    }));

    res.status(200).json(new ApiResponse(200, { records, summary }, 'Attendance report fetched'));
});

// ─── Homework CRUD ─────────────────────────────────────────────────────────
exports.createHomework = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { title, description, dueDate, classId, sectionId, subjectId, attachmentUrl } = req.body;
    if (!title || !description || !dueDate || !classId || !sectionId || !subjectId) {
        throw new ApiError(400, 'title, description, dueDate, classId, sectionId, subjectId are required');
    }
    await ensureSubjectAccess(staff, classId, sectionId, subjectId);

    const homework = await prisma.homework.create({
        data: { schoolId: req.user.schoolId, title, description, dueDate: new Date(dueDate), classId, sectionId, subjectId, staffId: staff.id, attachmentUrl: attachmentUrl || null, schoolId: staff.schoolId || null },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Subject: { select: { name: true } }
        }
    });

    res.status(201).json(new ApiResponse(201, homework, 'Homework created'));
});

exports.getHomework = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { classId, sectionId, subjectId } = req.query;

    const homework = await prisma.homework.findMany({
        where: {
            staffId: staff.id,
            ...getSchoolFilter(staff),
            ...(classId && { classId }),
            ...(sectionId && { sectionId }),
            ...(subjectId && { subjectId })
        },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Subject: { select: { name: true } },
            _count: { select: { Submissions: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, homework, 'Homework fetched'));
});

exports.updateHomework = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { id } = req.params;

    const hw = await prisma.homework.findUnique({ where: { id } });
    if (!hw) throw new ApiError(404, 'Homework not found');
    if (hw.staffId !== staff.id) throw new ApiError(403, 'You can only edit your own homework');
    if (staff.schoolId && hw.schoolId !== staff.schoolId) throw new ApiError(403, 'Homework belongs to another school');
    if (req.body.classId || req.body.sectionId || req.body.subjectId) {
        await ensureSubjectAccess(staff, req.body.classId || hw.classId, req.body.sectionId || hw.sectionId, req.body.subjectId || hw.subjectId);
    }

    const updated = await prisma.homework.update({
        where: { id },
        data: { ...req.body, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : hw.dueDate }
    });

    res.status(200).json(new ApiResponse(200, updated, 'Homework updated'));
});

exports.deleteHomework = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { id } = req.params;

    const hw = await prisma.homework.findUnique({ where: { id } });
    if (!hw) throw new ApiError(404, 'Homework not found');
    if (hw.staffId !== staff.id) throw new ApiError(403, 'You can only delete your own homework');
    if (staff.schoolId && hw.schoolId !== staff.schoolId) throw new ApiError(403, 'Homework belongs to another school');

    await prisma.homework.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, 'Homework deleted'));
});

exports.getHomeworkSubmissions = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { id } = req.params;
    const homework = await prisma.homework.findUnique({ where: { id } });
    if (!homework) throw new ApiError(404, 'Homework not found');
    if (homework.staffId !== staff.id) throw new ApiError(403, 'You can only view submissions for your own homework');
    if (staff.schoolId && homework.schoolId !== staff.schoolId) throw new ApiError(403, 'Homework belongs to another school');

    const submissions = await prisma.homeworkSubmission.findMany({
        where: { homeworkId: id },
        include: {
            Student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, rollNumber: true, photo: true } }
        },
        orderBy: { submissionDate: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, submissions, 'Submissions fetched'));
});

exports.gradeSubmission = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { id } = req.params;
    const { marks, remarks } = req.body;
    const submission = await prisma.homeworkSubmission.findUnique({
        where: { id },
        include: { Homework: { select: { staffId: true, schoolId: true } } }
    });
    if (!submission) throw new ApiError(404, 'Submission not found');
    if (submission.Homework.staffId !== staff.id) throw new ApiError(403, 'You can only grade submissions for your own homework');
    if (staff.schoolId && submission.Homework.schoolId !== staff.schoolId) throw new ApiError(403, 'Submission belongs to another school');

    const updated = await prisma.homeworkSubmission.update({
        where: { id },
        data: { marks: marks !== undefined ? parseFloat(marks) : undefined, remarks, status: 'Graded' }
    });

    res.status(200).json(new ApiResponse(200, updated, 'Submission graded'));
});

// ─── Exam Marks ────────────────────────────────────────────────────────────
exports.enterMarks = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { examName, subjectId, classId, sectionId, marks } = req.body;

    if (!examName || !subjectId || !classId || !sectionId || !Array.isArray(marks) || marks.length === 0) {
        throw new ApiError(400, 'examName, subjectId, classId, sectionId, marks[] required');
    }
    await ensureSubjectAccess(staff, classId, sectionId, subjectId);

    const validStudents = await prisma.student.findMany({
        where: {
            id: { in: marks.map(m => m.studentId) },
            classId,
            sectionId,
            isDisabled: false,
            ...getSchoolFilter(staff)
        },
        select: { id: true }
    });
    if (validStudents.length !== marks.length) {
        throw new ApiError(400, 'Marks contain students outside the selected class');
    }

    const ops = marks.map(m =>
        prisma.examMark.upsert({
            where: { examName_studentId_subjectId: { examName, studentId: m.studentId, subjectId } },
            update: { marks: parseFloat(m.marks), maxMarks: parseFloat(m.maxMarks || 100), grade: m.grade || null, remarks: m.remarks || null, teacherId: staff.id },
            create: { examName, marks: parseFloat(m.marks), maxMarks: parseFloat(m.maxMarks || 100), grade: m.grade || null, remarks: m.remarks || null, studentId: m.studentId, subjectId, classId, sectionId, teacherId: staff.id, schoolId: staff.schoolId || null }
        })
    );

    const results = await prisma.$transaction(ops);
    res.status(200).json(new ApiResponse(200, results, `Marks saved for ${results.length} students`));
});

exports.getMarks = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);
    const { examName, classId, sectionId, subjectId } = req.query;
    if (!classId || !sectionId) throw new ApiError(400, 'classId and sectionId are required');
    if (subjectId) await ensureSubjectAccess(staff, classId, sectionId, subjectId);
    else await ensureClassAccess(staff, classId, sectionId);

    const marks = await prisma.examMark.findMany({
        where: {
            classId, sectionId,
            ...getSchoolFilter(staff),
            ...(examName && { examName }),
            ...(subjectId && { subjectId })
        },
        include: {
            Student: { select: { id: true, firstName: true, lastName: true, admissionNo: true, rollNumber: true } },
            Subject: { select: { name: true } }
        },
        orderBy: [{ examName: 'asc' }, { Student: { rollNumber: 'asc' } }]
    });

    res.status(200).json(new ApiResponse(200, marks, 'Marks fetched'));
});

// ─── CLASS TEACHER EXCLUSIVE ────────────────────────────────────────────────

exports.getClassOverview = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);

    const classTeacher = await prisma.classTeacher.findFirst({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: {
            Class: true,
            Section: true
        }
    });

    if (!classTeacher) throw new ApiError(403, 'You are not assigned as a Class Teacher');

    const { classId, sectionId } = classTeacher;

    // Students in class
    const students = await prisma.student.findMany({
        where: { classId, sectionId, isDisabled: false, ...getSchoolFilter(staff) },
        select: { id: true, admissionNo: true, rollNumber: true, firstName: true, lastName: true, gender: true, photo: true, dob: true, mobileNumber: true, fatherName: true, guardianPhone: true }
    });

    // Attendance stats last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceStats = await prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { classId, sectionId, date: { gte: thirtyDaysAgo }, ...getSchoolFilter(staff) },
        _count: { status: true }
    });

    // Pending homework
    const pendingHomework = await prisma.homework.findMany({
        where: { classId, sectionId, dueDate: { gte: new Date() }, ...getSchoolFilter(staff) },
        include: { Subject: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5
    });

    // Exam performance
    const examMarks = await prisma.examMark.findMany({
        where: { classId, sectionId, ...getSchoolFilter(staff) },
        select: { examName: true, marks: true, maxMarks: true, subjectId: true }
    });

    const totalStudents = students.length;
    const maleCount = students.filter(s => s.gender === 'Male').length;
    const femaleCount = students.filter(s => s.gender === 'Female').length;

    res.status(200).json(new ApiResponse(200, {
        classTeacher,
        students,
        totalStudents,
        maleCount,
        femaleCount,
        attendanceStats,
        pendingHomework,
        examMarks
    }, 'Class overview fetched'));
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
    const staff = await getStaff(req.user.id);

    // Today's schedule
    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todaySchedule = await prisma.timetable.findMany({
        where: { staffId: staff.id, dayOfWeek: today, ...getSchoolFilter(staff) },
        include: {
            Class: { select: { name: true } },
            Section: { select: { name: true } },
            Subject: { select: { name: true } }
        },
        orderBy: { startTime: 'asc' }
    });

    // Pending homework (upcoming due dates)
    const pendingHomework = await prisma.homework.findMany({
        where: { staffId: staff.id, dueDate: { gte: new Date() }, ...getSchoolFilter(staff) },
        include: { Subject: { select: { name: true } }, Class: { select: { name: true } }, Section: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5
    });

    // Check class teacher
    const classTeacherOf = await prisma.classTeacher.findFirst({
        where: { staffId: staff.id, ...getSchoolFilter(staff) },
        include: { Class: { select: { name: true } }, Section: { select: { name: true } } }
    });

    // Student count for my classes
    let myStudentCount = 0;
    if (classTeacherOf) {
        myStudentCount = await prisma.student.count({
            where: { classId: classTeacherOf.classId, sectionId: classTeacherOf.sectionId, isDisabled: false, ...getSchoolFilter(staff) }
        });
    }

    // Today attendance summary (for class teacher)
    let todayAttendance = null;
    if (classTeacherOf) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const todayDateEnd = new Date(todayDate);
        todayDateEnd.setHours(23, 59, 59, 999);

        const todayAtt = await prisma.studentAttendance.groupBy({
            by: ['status'],
            where: {
                classId: classTeacherOf.classId,
                sectionId: classTeacherOf.sectionId,
                ...getSchoolFilter(staff),
                date: { gte: todayDate, lte: todayDateEnd }
            },
            _count: { status: true }
        });
        todayAttendance = todayAtt;
    }

    res.status(200).json(new ApiResponse(200, {
        staff,
        isClassTeacher: !!classTeacherOf,
        classTeacherOf,
        myStudentCount,
        todaySchedule,
        pendingHomework,
        todayAttendance
    }, 'Dashboard stats fetched'));
});
