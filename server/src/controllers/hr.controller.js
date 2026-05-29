
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

// =====================================
// Staff Controllers
// =====================================
exports.getStaffs = asyncHandler(async (req, res) => {
    const { role, search, isDisabled } = req.query;

    const where = {
        ...(role && { role }),
        ...(isDisabled !== undefined && { isDisabled: isDisabled === 'true' }),
        ...(search && {
            OR: [
                { staffId: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ]
        })
    };

    const staffs = await prisma.staff.findMany({
        where,
        include: {
            Department: { select: { name: true } },
            Designation: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(new ApiResponse(200, staffs, "Staff fetched successfully"));
});

exports.getStaffById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const staff = await prisma.staff.findUnique({
        where: { id },
        include: {
            Department: true,
            Designation: true
        }
    });

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    res.status(200).json(new ApiResponse(200, staff, "Staff details fetched successfully"));
});

exports.createStaff = asyncHandler(async (req, res) => {
    const data = req.body;

    // Check if staffId already exists
    const existingStaff = await prisma.staff.findUnique({
        where: { staffId: data.staffId }
    });

    if (existingStaff) {
        throw new ApiError(400, "Staff ID already exists");
    }

    // Check email uniqueness if provided
    if (data.email) {
        const emailExists = await prisma.staff.findFirst({
            where: { email: data.email }
        });
        if (emailExists) {
            throw new ApiError(400, "Email already exists");
        }
    }

    const staff = await prisma.staff.create({
        data,
        include: {
            Department: true,
            Designation: true
        }
    });

    res.status(201).json(new ApiResponse(201, staff, "Staff created successfully"));
});

exports.updateStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const existingStaff = await prisma.staff.findUnique({ where: { id } });
    if (!existingStaff) {
        throw new ApiError(404, "Staff not found");
    }

    // Check email uniqueness if changed
    if (data.email && data.email !== existingStaff.email) {
        const emailExists = await prisma.staff.findFirst({
            where: {
                email: data.email,
                id: { not: id }
            }
        });
        if (emailExists) {
            throw new ApiError(400, "Email already exists");
        }
    }

    const staff = await prisma.staff.update({
        where: { id },
        data,
        include: {
            Department: true,
            Designation: true
        }
    });

    res.status(200).json(new ApiResponse(200, staff, "Staff updated successfully"));
});

exports.deleteStaff = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if staff has any dependencies
    const hasLeaves = await prisma.leaveRequest.count({ where: { staffId: id } });
    const hasPayroll = await prisma.payroll.count({ where: { staffId: id } });
    const hasAttendance = await prisma.staffAttendance.count({ where: { staffId: id } });

    if (hasLeaves > 0 || hasPayroll > 0 || hasAttendance > 0) {
        throw new ApiError(400, "Cannot delete staff with existing records. Please disable instead.");
    }

    await prisma.staff.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Staff deleted successfully"));
});

exports.toggleStaffStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isDisabled, disableReason } = req.body;

    const staff = await prisma.staff.update({
        where: { id },
        data: { isDisabled, disableReason }
    });

    res.status(200).json(new ApiResponse(200, staff, `Staff ${isDisabled ? 'disabled' : 'enabled'} successfully`));
});

// =====================================
// Staff Attendance Controllers
// =====================================
exports.getStaffAttendance = asyncHandler(async (req, res) => {
    const { date, role } = req.query;

    const attendance = await prisma.staffAttendance.findMany({
        where: {
            date: date ? new Date(date) : undefined,
            ...(role && { Staff: { role } })
        },
        include: { Staff: true }
    });

    res.status(200).json(new ApiResponse(200, attendance, "Staff attendance fetched successfully"));
});

exports.markStaffAttendance = asyncHandler(async (req, res) => {
    const { date, staffId, status, note } = req.body;
    
    const attendance = await prisma.staffAttendance.upsert({
        where: {
            staffId_date: { staffId, date: new Date(date) }
        },
        update: { status, note },
        create: { staffId, date: new Date(date), status, note }
    });
    
    res.status(200).json(new ApiResponse(200, attendance, "Staff attendance marked successfully"));
});

// =====================================
// Payroll Controllers
// =====================================
exports.getPayrolls = asyncHandler(async (req, res) => {
    const { month, year, role } = req.query;

    const payrolls = await prisma.payroll.findMany({
        where: {
            ...(month && { month }),
            ...(year && { year: parseInt(year) }),
            ...(role && { Staff: { role } })
        },
        include: { Staff: true }
    });

    res.status(200).json(new ApiResponse(200, payrolls, "Payrolls fetched successfully"));
});

exports.generatePayroll = asyncHandler(async (req, res) => {
    const { staffId, month, year, netSalary } = req.body;
    
    const payroll = await prisma.payroll.create({
        data: { staffId, month, year: parseInt(year), netSalary }
    });
    
    res.status(201).json(new ApiResponse(201, payroll, "Payroll generated successfully"));
});

// =====================================
// Leave Controllers
// =====================================
exports.getLeaveTypes = asyncHandler(async (req, res) => {
    const types = await prisma.leaveType.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, types, "Leave types fetched successfully"));
});

exports.createLeaveType = asyncHandler(async (req, res) => {
    const type = await prisma.leaveType.create({ data: { name: req.body.name }});
    res.status(201).json(new ApiResponse(201, type, "Leave type created successfully"));
});

exports.getLeaveRequests = asyncHandler(async (req, res) => {
    const { staffId, status } = req.query;

    const leaves = await prisma.leaveRequest.findMany({
        where: {
            ...(staffId && { staffId }),
            ...(status && { status })
        },
        include: {
            Staff: { select: { firstName: true, lastName: true, role: true, staffId: true }},
            LeaveType: { select: { name: true }}
        },
        orderBy: { applyDate: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, leaves, "Leave requests fetched successfully"));
});

exports.createLeaveRequest = asyncHandler(async (req, res) => {
    const { staffId, fromDate, toDate, leaveTypeId, reason, isHalfDay, halfDayType, documentUrl } = req.body;

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
        throw new ApiError(400, "From date cannot be after to date");
    }

    const leave = await prisma.leaveRequest.create({
        data: {
            staffId,
            fromDate: from,
            toDate: to,
            leaveTypeId,
            reason,
            isHalfDay: isHalfDay || false,
            halfDayType,
            documentUrl,
            applyDate: new Date(),
            status: 'Pending'
        },
        include: {
            Staff: { select: { firstName: true, lastName: true, staffId: true } },
            LeaveType: { select: { name: true } }
        }
    });
    res.status(201).json(new ApiResponse(201, leave, "Leave request submitted successfully"));
});

exports.updateLeaveStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        throw new ApiError(400, "Status must be either Approved or Rejected");
    }

    const leave = await prisma.leaveRequest.update({
        where: { id },
        data: { status, note },
        include: {
            Staff: { select: { firstName: true, lastName: true } },
            LeaveType: { select: { name: true } }
        }
    });

    res.status(200).json(new ApiResponse(200, leave, `Leave request ${status.toLowerCase()} successfully`));
});

exports.deleteLeaveRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await prisma.leaveRequest.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Leave request deleted successfully"));
});

// =====================================
// Teacher Rating Controllers
// =====================================
exports.getTeacherRatings = asyncHandler(async (req, res) => {
    const ratings = await prisma.teacherRating.findMany({
        include: {
            Staff: { select: { firstName: true, lastName: true, staffId: true }},
            Student: { select: { firstName: true, lastName: true }}
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, ratings, "Teacher ratings fetched successfully"));
});

exports.createTeacherRating = asyncHandler(async (req, res) => {
    const rating = await prisma.teacherRating.create({ data: { ...req.body }});
    res.status(201).json(new ApiResponse(201, rating, "Rating submitted successfully"));
});

// =====================================
// Department & Designation Controllers
// =====================================
exports.getDepartments = asyncHandler(async (req, res) => {
    const departments = await prisma.department.findMany({ orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, departments, "Departments fetched successfully"));
});

exports.createDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Department already exists");
    }
    const dept = await prisma.department.create({ data: { name } });
    res.status(201).json(new ApiResponse(201, dept, "Department created successfully"));
});

exports.updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const dept = await prisma.department.update({
        where: { id },
        data: { name }
    });
    res.status(200).json(new ApiResponse(200, dept, "Department updated successfully"));
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const staffCount = await prisma.staff.count({ where: { departmentId: id } });
    if (staffCount > 0) {
        throw new ApiError(400, `Cannot delete department. ${staffCount} staff members are assigned to this department`);
    }
    await prisma.department.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Department deleted successfully"));
});

exports.getDesignations = asyncHandler(async (req, res) => {
    const designations = await prisma.designation.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json(new ApiResponse(200, designations, "Designations fetched successfully"));
});

exports.createDesignation = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const existing = await prisma.designation.findUnique({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Designation already exists");
    }
    const desig = await prisma.designation.create({ data: { name } });
    res.status(201).json(new ApiResponse(201, desig, "Designation created successfully"));
});

exports.updateDesignation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const desig = await prisma.designation.update({
        where: { id },
        data: { name }
    });
    res.status(200).json(new ApiResponse(200, desig, "Designation updated successfully"));
});

exports.deleteDesignation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const staffCount = await prisma.staff.count({ where: { designationId: id } });
    if (staffCount > 0) {
        throw new ApiError(400, `Cannot delete designation. ${staffCount} staff members have this designation`);
    }
    await prisma.designation.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Designation deleted successfully"));
});

exports.deleteLeaveType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const leaveCount = await prisma.leaveRequest.count({ where: { leaveTypeId: id } });
    if (leaveCount > 0) {
        throw new ApiError(400, `Cannot delete leave type. ${leaveCount} leave requests use this type`);
    }
    await prisma.leaveType.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Leave type deleted successfully"));
});
