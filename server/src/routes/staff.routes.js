const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const upload = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const staffValidation = require('../validations/staff.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Get all staff
router.get('/', requirePermission(PERMISSIONS.STAFF_READ), staffController.getStaff);

// Get disabled staff
router.get('/disabled', requirePermission(PERMISSIONS.STAFF_READ), staffController.getDisabledStaff);

// Add new staff (with photo upload)
router.post(
    '/add',
    requirePermission(PERMISSIONS.STAFF_MANAGE),
    upload.single('photo'),
    validate(staffValidation.addStaff),
    staffController.addStaff
);

// Get staff details by ID
router.get('/:id', requirePermission(PERMISSIONS.STAFF_READ), staffController.getStaffDetails);

// Update staff (with photo upload)
router.put(
    '/:id',
    requirePermission(PERMISSIONS.STAFF_MANAGE),
    upload.single('photo'),
    validate(staffValidation.updateStaff),
    staffController.updateStaff
);

// Delete staff
router.delete(
    '/:id',
    requirePermission(PERMISSIONS.STAFF_MANAGE),
    staffController.deleteStaff
);

// Toggle staff status (disable/enable)
router.patch(
    '/:id/status',
    requirePermission(PERMISSIONS.STAFF_MANAGE),
    staffController.toggleStaffStatus
);

// Bulk delete staff
router.post(
    '/bulk-delete',
    requirePermission(PERMISSIONS.STAFF_MANAGE),
    staffController.bulkDeleteStaff
);

module.exports = router;
