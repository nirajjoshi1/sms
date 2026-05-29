const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All routes require authentication
router.use(verifyJWT);

// Get all staff
router.get('/', staffController.getStaff);

// Get disabled staff
router.get('/disabled', staffController.getDisabledStaff);

// Add new staff (with photo upload)
router.post(
    '/add',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    upload.single('photo'),
    staffController.addStaff
);

// Get staff details by ID
router.get('/:id', staffController.getStaffDetails);

// Update staff (with photo upload)
router.put(
    '/:id',
    authorizeRoles('SUPER_ADMIN', 'ADMIN'),
    upload.single('photo'),
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
