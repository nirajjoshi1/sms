const express = require('express');
const router = express.Router();
const schoolRequestController = require('../controllers/schoolRequest.controller');
const { verifyJWT, authorizeRoles } = require('../middleware/auth.middleware');

// Public route to submit registration request
router.post('/', schoolRequestController.createSchoolRequest);

// Super Admin restricted routes to manage requests
router.get('/', verifyJWT, authorizeRoles('SUPER_ADMIN'), schoolRequestController.getAllSchoolRequests);
router.patch('/:id/status', verifyJWT, authorizeRoles('SUPER_ADMIN'), schoolRequestController.updateSchoolRequestStatus);

module.exports = router;
