
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

const getStaffForUser = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { Staff: true }
    });
    if (!user) throw new ApiError(401, 'User account not found');
    if (user?.Staff) return user.Staff;

    const staff = await prisma.staff.findFirst({ where: { email: user.email } });
    if (!staff) throw new ApiError(404, 'No Staff record linked to this account.');
    return staff;
};

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
        data: { schoolId: req.user.schoolId, staffId, month, year: parseInt(year), netSalary },
        include: { Staff: { include: { User: true, Department: true, Designation: true } } }
    });
    
    // Trigger notification
    try {
        const { createNotification } = require('../utils/notification');
        const staffUser = payroll.Staff?.User;
        const targetEmail = payroll.Staff?.email;

        // Fetch school details for logo image and branding
        const school = await prisma.school.findUnique({
            where: { id: req.user.schoolId },
            select: { logo: true, name: true }
        });

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; padding: 40px 20px; color: #1f2937;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; text-align: center; color: #ffffff;">
                        ${school?.logo ? `<img src="${school.logo}" alt="${school.name} Logo" style="max-height: 60px; margin-bottom: 16px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" />` : ''}
                        <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Payslip Advice</div>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.025em;">Salary Slip Generated</h1>
                        <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">Statement of Earnings for ${payroll.month} ${payroll.year}</p>
                    </div>

                    <!-- Content -->
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #374151;">
                            Dear <strong>${payroll.Staff?.firstName} ${payroll.Staff?.lastName || ''}</strong>,
                        </p>
                        <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                            Your payroll advice for the month of <strong>${payroll.month} ${payroll.year}</strong> has been successfully processed. Here are your salary breakdown details:
                        </p>

                        <!-- Employee Info -->
                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #1e3a8a; font-weight: 700; letter-spacing: 0.05em;">Employee Details</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Staff ID:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${payroll.Staff?.staffId || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Department:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${payroll.Staff?.Department?.name || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Designation:</td>
                                    <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${payroll.Staff?.Designation?.name || 'N/A'}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Financial Summary -->
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; color: #1e3a8a; font-weight: 700; letter-spacing: 0.05em;">Salary Summary</h3>
                        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                                    <th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #475569;">Description</th>
                                    <th style="padding: 12px 16px; text-align: right; font-weight: 600; color: #475569;">Amount</th>
                                </tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;">
                                    <td style="padding: 16px; color: #0f172a; font-weight: 500;">
                                        Net Remuneration
                                        <div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 4px;">Transferable Net Salary</div>
                                    </td>
                                    <td style="padding: 16px; text-align: right; color: #10b981; font-weight: 700; font-size: 18px;">₹${Number(payroll.netSalary).toFixed(2)}</td>
                                </tr>
                                <tr style="background-color: #f8fafc; font-size: 14px;">
                                    <td style="padding: 12px 16px; color: #64748b;">Status</td>
                                    <td style="padding: 12px 16px; text-align: right; color: #1e3a8a; font-weight: 600;">${payroll.status || 'Generated'}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Notice / Note -->
                        <div style="margin-bottom: 24px; font-size: 13px; color: #475569; padding: 12px 16px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; line-height: 1.5;">
                            This is an electronically generated document. For questions regarding payroll calculations, allowances, or tax deductions, please reach out to the Human Resources or Accounts division.
                        </div>

                        <!-- Footer Note -->
                        <div style="text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 24px;">
                            <p style="margin: 0; font-size: 13px; color: #64748b;">If you need a physical payslip, you can print one from your employee portal.</p>
                            <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} ${school?.name || req.user.schoolName || 'School Management System'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await createNotification({
            title: "Payroll Generated",
            message: `Your payroll for ${month} ${year} has been generated. Net Salary: ${netSalary}`,
            type: "info",
            userId: staffUser ? staffUser.id : undefined,
            targetEmail: targetEmail || undefined,
            emailHtml,
            skipInApp: !staffUser // Skip in-app if they have no user account
        });
    } catch (err) {
        console.error("Failed to trigger payroll notification:", err);
    }
    
    res.status(201).json(new ApiResponse(201, payroll, "Payroll generated successfully"));
});

// =====================================
// Leave Controllers
// =====================================
exports.getLeaveTypes = asyncHandler(async (req, res) => {
    const types = await prisma.leaveType.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, types, "Leave types fetched successfully"));
});

exports.createLeaveType = asyncHandler(async (req, res) => {
    const type = await prisma.leaveType.create({ data: { schoolId: req.user.schoolId, name: req.body.name }});
    res.status(201).json(new ApiResponse(201, type, "Leave type created successfully"));
});

exports.getLeaveRequests = asyncHandler(async (req, res) => {
    let { staffId, status } = req.query;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
        const myStaff = await getStaffForUser(req.user.id);
        staffId = myStaff.id;
    }

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
    let { staffId, fromDate, toDate, leaveTypeId, reason, isHalfDay, halfDayType, documentUrl } = req.body;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
        const myStaff = await getStaffForUser(req.user.id);
        staffId = myStaff.id;
    }

    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);
    if (from > to) {
        throw new ApiError(400, "From date cannot be after to date");
    }

    const leave = await prisma.leaveRequest.create({
        data: { schoolId: req.user.schoolId,
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

    // Trigger notification
    try {
        const { createNotification } = require('../utils/notification');
        await createNotification({
            title: "New Leave Application",
            message: `Staff ${leave.Staff?.firstName} ${leave.Staff?.lastName || ''} has applied for ${leave.LeaveType?.name} leave from ${fromDate} to ${toDate}.`,
            type: "leave"
        });
    } catch (err) {
        console.error("Failed to trigger leave request notification:", err);
    }

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
            Staff: { select: { firstName: true, lastName: true, email: true, User: true } },
            LeaveType: { select: { name: true } }
        }
    });

    // Trigger notification
    try {
        const { createNotification } = require('../utils/notification');
        const staffUser = leave.Staff?.User;
        
        await createNotification({
            title: `Leave Application ${status}`,
            message: `Your leave request from ${new Date(leave.fromDate).toLocaleDateString()} to ${new Date(leave.toDate).toLocaleDateString()} has been ${status.toLowerCase()} by Admin.`,
            type: "leave",
            userId: staffUser ? staffUser.id : undefined,
            targetEmail: leave.Staff?.email || undefined,
            skipInApp: !staffUser
        });
    } catch (err) {
        console.error("Failed to trigger leave status notification:", err);
    }

    res.status(200).json(new ApiResponse(200, leave, `Leave request ${status.toLowerCase()} successfully`));
});

exports.deleteLeaveRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'ADMIN') {
        const myStaff = await getStaffForUser(req.user.id);
        const leave = await prisma.leaveRequest.findUnique({ where: { id } });
        if (!leave) throw new ApiError(404, "Leave request not found");
        if (leave.staffId !== myStaff.id) {
            throw new ApiError(403, "You can only delete your own leave requests");
        }
    }

    await prisma.leaveRequest.delete({ where: { id } });
    res.status(200).json(new ApiResponse(200, null, "Leave request deleted successfully"));
});

// =====================================
// Teacher Rating Controllers
// =====================================
exports.getTeacherRatings = asyncHandler(async (req, res) => {
    const ratings = await prisma.teacherRating.findMany({
        where: { schoolId: req.user.schoolId },

        include: {
            Staff: { select: { firstName: true, lastName: true, staffId: true }},
            Student: { select: { firstName: true, lastName: true }}
        },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(new ApiResponse(200, ratings, "Teacher ratings fetched successfully"));
});

exports.createTeacherRating = asyncHandler(async (req, res) => {
    const rating = await prisma.teacherRating.create({ data: { schoolId: req.user.schoolId, ...req.body }});
    res.status(201).json(new ApiResponse(201, rating, "Rating submitted successfully"));
});

// =====================================
// Department & Designation Controllers
// =====================================
exports.getDepartments = asyncHandler(async (req, res) => {
    const departments = await prisma.department.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' }});
    res.status(200).json(new ApiResponse(200, departments, "Departments fetched successfully"));
});

exports.createDepartment = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const existing = await prisma.department.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Department already exists in this school");
    }
    const dept = await prisma.department.create({ data: { schoolId: req.user.schoolId, name } });
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
    const designations = await prisma.designation.findMany({ where: { schoolId: req.user.schoolId },
 orderBy: { name: 'asc' } });
    res.status(200).json(new ApiResponse(200, designations, "Designations fetched successfully"));
});

exports.createDesignation = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const existing = await prisma.designation.findFirst({ where: { name } });
    if (existing) {
        throw new ApiError(400, "Designation already exists in this school");
    }
    const desig = await prisma.designation.create({ data: { schoolId: req.user.schoolId, name } });
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
