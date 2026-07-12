const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const staffValidation = require('../validations/staff.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Get all staff
router.get('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), staffController.getStaff);

// Get disabled staff
router.get('/disabled', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), staffController.getDisabledStaff);

// Add new staff (with photo upload)
router.post(
    '/add',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    upload.single('photo'),
    validate(staffValidation.addStaff),
    staffController.addStaff
);

// Get staff details by ID
router.get('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'), staffController.getStaffDetails);

// Update staff (with photo upload)
router.put(
    '/:id',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    upload.single('photo'),
    validate(staffValidation.updateStaff),
    staffController.updateStaff
);

// Delete staff
router.delete(
    '/:id',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    staffController.deleteStaff
);

// Toggle staff status (disable/enable)
router.patch(
    '/:id/status',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    staffController.toggleStaffStatus
);

// Bulk delete staff
router.post(
    '/bulk-delete',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    staffController.bulkDeleteStaff
);

module.exports = router;
