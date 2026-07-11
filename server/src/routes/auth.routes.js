const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');

const { validate } = require('../middleware/validate.middleware');
const authValidation = require('../validations/auth.validation');

// Public routes
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);

// Protected routes (any logged-in user)
router.get('/me', verifyJWT, authController.getMe);
router.patch('/change-password', verifyJWT, authController.changePassword);

// User Management (Admin & Super Admin)
router.post('/users', verifyJWT, authorizeRoles('SUPER_ADMIN', 'ADMIN'), validate(authValidation.createUser), authController.createUser);

// Super Admin only routes
router.get('/users', verifyJWT, authorizeRoles('SUPER_ADMIN'), authController.getAllUsers);
router.patch('/users/:id/toggle-status', verifyJWT, authorizeRoles('SUPER_ADMIN'), authController.toggleUserStatus);

module.exports = router;
