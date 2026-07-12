const express = require('express');
const router = express.Router();
const schoolRequestController = require('../controllers/schoolRequest.controller');
const { verifyJWT, requirePlatformUser } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const schoolRequestValidation = require('../validations/schoolRequest.validation');

// Public route to submit registration request
router.post('/', validate(schoolRequestValidation.createSchoolRequest), schoolRequestController.createSchoolRequest);

// Super Admin restricted routes to manage requests
router.get('/', verifyJWT, requirePlatformUser, schoolRequestController.getAllSchoolRequests);
router.patch('/:id/status', verifyJWT, requirePlatformUser, schoolRequestController.updateSchoolRequestStatus);

module.exports = router;
