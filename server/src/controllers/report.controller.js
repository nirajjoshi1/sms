const prisma = require('../config/prisma');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

// 1. Student Report
exports.getStudentReport = asyncHandler(async (req, res) => {
    const [total, active, disabled, classes, categories, genders] = await Promise.all([
        prisma.student.count(),
        prisma.student.count({ where: { isDisabled: false } }),
        prisma.student.count({ where: { isDisabled: true } }),
        prisma.class.findMany({
            where: { schoolId: req.user.schoolId },

            select: {
                name: true,
                _count: { select: { Student: { where: { isDisabled: false } } } }
            }
        }),
        prisma.category.findMany({
            where: { schoolId: req.user.schoolId },

            select: {
                name: true,
                _count: { select: { Student: { where: { isDisabled: false } } } }
            }
        }),
        prisma.student.groupBy({
            by: ['gender'],
            _count: { _all: true },
            where: { isDisabled: false }
        })
    ]);

    res.status(200).json(new ApiResponse(200, {
        total,
        active,
        disabled,
        byClass: classes.map(c => ({ name: c.name, count: c._count.Student })),
        byCategory: categories.map(cat => ({ name: cat.name, count: cat._count.Student })),
        byGender: genders.map(g => ({ gender: g.gender, count: g._count._all }))
    }, "Student report fetched successfully"));
});

// 2. Attendance Report
exports.getAttendanceReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [studentAttendance, staffAttendance] = await Promise.all([
        prisma.studentAttendance.groupBy({
            by: ['status'],
            _count: { _all: true },
            where: { date: { gte: start, lte: end } }
        }),
        prisma.staffAttendance.groupBy({
            by: ['status'],
            _count: { _all: true },
            where: { date: { gte: start, lte: end } }
        })
    ]);

    const formatStats = (records) => {
        const stats = { Present: 0, Absent: 0, Late: 0, HalfDay: 0, total: 0 };
        records.forEach(r => {
            if (r.status in stats) {
                stats[r.status] = r._count._all;
                stats.total += r._count._all;
            }
        });
        return stats;
    };

    res.status(200).json(new ApiResponse(200, {
        student: formatStats(studentAttendance),
        staff: formatStats(staffAttendance),
        range: { start, end }
    }, "Attendance report fetched successfully"));
});

// 3. Finance Report
exports.getFinanceReport = asyncHandler(async (req, res) => {
    const [feePayments, incomes, expenses] = await Promise.all([
        prisma.feePayment.findMany({ where: { schoolId: req.user.schoolId },
 select: { netAmount: true } }),
        prisma.income.findMany({ where: { schoolId: req.user.schoolId },
 select: { amount: true } }),
        prisma.expense.findMany({ where: { schoolId: req.user.schoolId },
 select: { amount: true } })
    ]);

    const totalFees = feePayments.reduce((sum, p) => sum + Number(p.netAmount), 0);
    const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    res.status(200).json(new ApiResponse(200, {
        totalFees,
        totalIncome,
        totalExpense,
        netBalance: totalFees + totalIncome - totalExpense
    }, "Finance report fetched successfully"));
});

// 4. HR Report
exports.getHRReport = asyncHandler(async (req, res) => {
    const [totalStaff, departments, designations, leaveStats] = await Promise.all([
        prisma.staff.count({ where: { isDisabled: false } }),
        prisma.department.findMany({
            where: { schoolId: req.user.schoolId },

            select: {
                name: true,
                _count: { select: { Staff: { where: { isDisabled: false } } } }
            }
        }),
        prisma.designation.findMany({
            where: { schoolId: req.user.schoolId },

            select: {
                name: true,
                _count: { select: { Staff: { where: { isDisabled: false } } } }
            }
        }),
        prisma.leaveRequest.groupBy({
            by: ['status'],
            _count: { _all: true }
        })
    ]);

    const leaves = { Pending: 0, Approved: 0, Rejected: 0 };
    leaveStats.forEach(l => {
        if (l.status in leaves) {
            leaves[l.status] = l._count._all;
        }
    });

    res.status(200).json(new ApiResponse(200, {
        totalStaff,
        byDepartment: departments.map(d => ({ name: d.name, count: d._count.Staff })),
        byDesignation: designations.map(d => ({ name: d.name, count: d._count.Staff })),
        leaveSummary: leaves
    }, "HR report fetched successfully"));
});

// 5. Homework Report
exports.getHomeworkReport = asyncHandler(async (req, res) => {
    const [totalHomework, totalSubmissions, classSubmissions] = await Promise.all([
        prisma.homework.count(),
        prisma.homeworkSubmission.count(),
        prisma.class.findMany({
            where: { schoolId: req.user.schoolId },

            select: {
                name: true,
                Homework: {
                    select: {
                        _count: { select: { HomeworkSubmission: true } }
                    }
                }
            }
        })
    ]);

    const byClass = classSubmissions.map(c => {
        const count = c.Homework.reduce((sum, h) => sum + h._count.HomeworkSubmission, 0);
        return { name: c.name, count };
    });

    res.status(200).json(new ApiResponse(200, {
        totalHomework,
        totalSubmissions,
        byClass
    }, "Homework report fetched successfully"));
});

// 6. Alumni Report
exports.getAlumniReport = asyncHandler(async (req, res) => {
    const graduates = await prisma.student.findMany({
        where: { isDisabled: true },
        select: {
            id: true,
            admissionNo: true,
            firstName: true,
            lastName: true,
            gender: true,
            dob: true,
            mobileNumber: true,
            email: true,
            admissionDate: true,
            Class: { select: { name: true } },
            Section: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, graduates, "Alumni report fetched successfully"));
});

// 7. Audit Trail Report
exports.getAuditTrail = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, action, resource, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
        ...(action && { action }),
        ...(resource && { resource }),
        ...(search && {
            OR: [
                { userEmail: { contains: search, mode: 'insensitive' } },
                { ipAddress: { contains: search, mode: 'insensitive' } },
                { status: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.auditLog.count({ where })
    ]);

    res.status(200).json(new ApiResponse(200, logs, "Audit trail fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

// 8. User Logs Report
exports.getUserLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
        action: { in: ['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'FORGOT_PASSWORD'] },
        ...(search && {
            OR: [
                { userEmail: { contains: search, mode: 'insensitive' } },
                { ipAddress: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip: parseInt(skip),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.auditLog.count({ where })
    ]);

    res.status(200).json(new ApiResponse(200, logs, "User logs fetched successfully", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});
