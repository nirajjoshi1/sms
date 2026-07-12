const express = require('express');
const router = express.Router();
const studentSetupController = require('../controllers/studentSetup.controller');
const { verifyJWT, requirePermission, requireSchoolContext } = require('../middleware/auth.middleware');
const { PERMISSIONS } = require('../config/permissions');
const { validate } = require('../middleware/validate.middleware');
const studentValidation = require('../validations/student.validation');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Category routes
router.route('/categories')
    .get(studentSetupController.getCategories)
    .post(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createCategory), studentSetupController.createCategory);

router.route('/categories/:id')
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createCategory), studentSetupController.updateCategory)
    .delete(requirePermission(PERMISSIONS.SETTINGS_MANAGE), studentSetupController.deleteCategory);

// House routes
router.route('/houses')
    .get(studentSetupController.getHouses)
    .post(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createHouse), studentSetupController.createHouse);

router.route('/houses/:id')
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createHouse), studentSetupController.updateHouse)
    .delete(requirePermission(PERMISSIONS.SETTINGS_MANAGE), studentSetupController.deleteHouse);

// Disable Reason routes
router.route('/disable-reasons')
    .get(studentSetupController.getDisableReasons)
    .post(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createDisableReason), studentSetupController.createDisableReason);

router.route('/disable-reasons/:id')
    .put(requirePermission(PERMISSIONS.SETTINGS_MANAGE), validate(studentValidation.createDisableReason), studentSetupController.updateDisableReason)
    .delete(requirePermission(PERMISSIONS.SETTINGS_MANAGE), studentSetupController.deleteDisableReason);

module.exports = router;
