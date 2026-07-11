const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const { authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

// All HR routes require school context
router.use(requireSchoolContext);

// Staff routes
router.route('/staff')
    .get(authorizeRoles('ADMIN'), hrController.getStaffs)
    .post(authorizeRoles('ADMIN'), hrController.createStaff);

router.route('/staff/:id')
    .get(authorizeRoles('ADMIN'), hrController.getStaffById)
    .put(authorizeRoles('ADMIN'), hrController.updateStaff)
    .delete(authorizeRoles('ADMIN'), hrController.deleteStaff);

router.patch('/staff/:id/toggle-status', authorizeRoles('ADMIN'), hrController.toggleStaffStatus);

// Attendance routes
router.route('/attendance')
    .get(authorizeRoles('ADMIN'), hrController.getStaffAttendance)
    .post(authorizeRoles('ADMIN'), hrController.markStaffAttendance);

// Payroll routes
router.route('/payroll')
    .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), hrController.getPayrolls)
    .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), hrController.generatePayroll);

// Leave type routes
router.route('/leave-types')
    .get(hrController.getLeaveTypes) // Allow any authenticated user to see leave types
    .post(authorizeRoles('ADMIN'), hrController.createLeaveType);

router.delete('/leave-types/:id', authorizeRoles('ADMIN'), hrController.deleteLeaveType);

// Leave request routes
router.route('/leave-requests')
    .get(hrController.getLeaveRequests) // Allow any authenticated user to see their own requests
    .post(hrController.createLeaveRequest); // Any authenticated user can request leave

router.route('/leave-requests/:id')
    .patch(authorizeRoles('ADMIN'), hrController.updateLeaveStatus) // Only ADMIN can approve/reject
    .delete(hrController.deleteLeaveRequest); // Any user can delete their own

// Teacher rating routes
router.route('/teacher-ratings')
    .get(authorizeRoles('ADMIN'), hrController.getTeacherRatings)
    .post(authorizeRoles('ADMIN'), hrController.createTeacherRating);

// Department routes
router.route('/departments')
    .get(authorizeRoles('ADMIN'), hrController.getDepartments)
    .post(authorizeRoles('ADMIN'), hrController.createDepartment);

router.route('/departments/:id')
    .put(authorizeRoles('ADMIN'), hrController.updateDepartment)
    .delete(authorizeRoles('ADMIN'), hrController.deleteDepartment);

// Designation routes
router.route('/designations')
    .get(authorizeRoles('ADMIN'), hrController.getDesignations)
    .post(authorizeRoles('ADMIN'), hrController.createDesignation);

router.route('/designations/:id')
    .put(authorizeRoles('ADMIN'), hrController.updateDesignation)
    .delete(authorizeRoles('ADMIN'), hrController.deleteDesignation);

module.exports = router;
