const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');

// Staff routes
router.route('/staff')
    .get(hrController.getStaffs)
    .post(hrController.createStaff);

router.route('/staff/:id')
    .get(hrController.getStaffById)
    .put(hrController.updateStaff)
    .delete(hrController.deleteStaff);

router.patch('/staff/:id/toggle-status', hrController.toggleStaffStatus);

// Attendance routes
router.route('/attendance')
    .get(hrController.getStaffAttendance)
    .post(hrController.markStaffAttendance);

// Payroll routes
router.route('/payroll')
    .get(hrController.getPayrolls)
    .post(hrController.generatePayroll);

// Leave type routes
router.route('/leave-types')
    .get(hrController.getLeaveTypes)
    .post(hrController.createLeaveType);

router.delete('/leave-types/:id', hrController.deleteLeaveType);

// Leave request routes
router.route('/leave-requests')
    .get(hrController.getLeaveRequests)
    .post(hrController.createLeaveRequest);

router.route('/leave-requests/:id')
    .patch(hrController.updateLeaveStatus)
    .delete(hrController.deleteLeaveRequest);

// Teacher rating routes
router.route('/teacher-ratings')
    .get(hrController.getTeacherRatings)
    .post(hrController.createTeacherRating);

// Department routes
router.route('/departments')
    .get(hrController.getDepartments)
    .post(hrController.createDepartment);

router.route('/departments/:id')
    .put(hrController.updateDepartment)
    .delete(hrController.deleteDepartment);

// Designation routes
router.route('/designations')
    .get(hrController.getDesignations)
    .post(hrController.createDesignation);

router.route('/designations/:id')
    .put(hrController.updateDesignation)
    .delete(hrController.deleteDesignation);

module.exports = router;
