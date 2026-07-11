const express = require('express');
const router = express.Router();
const studentSetupController = require('../controllers/studentSetup.controller');
const { verifyJWT, authorizeRoles, requireSchoolContext } = require('../middleware/auth.middleware');

// All routes require authentication and school context
router.use(verifyJWT);
router.use(requireSchoolContext);

// Category routes
router.route('/categories')
    .get(studentSetupController.getCategories)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.createCategory);

router.route('/categories/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.updateCategory)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.deleteCategory);

// House routes
router.route('/houses')
    .get(studentSetupController.getHouses)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.createHouse);

router.route('/houses/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.updateHouse)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.deleteHouse);

// Disable Reason routes
router.route('/disable-reasons')
    .get(studentSetupController.getDisableReasons)
    .post(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.createDisableReason);

router.route('/disable-reasons/:id')
    .put(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.updateDisableReason)
    .delete(authorizeRoles('SUPER_ADMIN', 'ADMIN'), studentSetupController.deleteDisableReason);

module.exports = router;
