const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyJWT, requirePlatformUser } = require('../middleware/auth.middleware');

const { validate } = require('../middleware/validate.middleware');
const authValidation = require('../validations/auth.validation');

// Public routes
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', authController.logout);
router.post('/logout-all', verifyJWT, authController.logoutAll);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

// Protected routes (any logged-in user)
router.get('/me', verifyJWT, authController.getMe);
router.patch('/change-password', verifyJWT, validate(authValidation.changePassword), authController.changePassword);

// User Management (Admin & Super Admin)
router.post('/users', verifyJWT, requirePlatformUser, validate(authValidation.createUser), authController.createUser);
router.get('/users', verifyJWT, requirePlatformUser, authController.getAllUsers);
router.patch('/users/:id/toggle-status', verifyJWT, requirePlatformUser, authController.toggleUserStatus);

module.exports = router;
