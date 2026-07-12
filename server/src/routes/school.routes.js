const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { verifyJWT, requirePlatformUser } = require('../middleware/auth.middleware');

// All school management routes are restricted to SUPER_ADMIN
router.use(verifyJWT);
router.use(requirePlatformUser);

router.route('/')
    .get(schoolController.getAllSchools)
    .post(schoolController.createSchoolWithAdmin);

router.route('/:id/toggle-status')
    .patch(schoolController.toggleSchoolStatus);

module.exports = router;
