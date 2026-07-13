const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

// Public route to verify certificate by its unique code
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

module.exports = router;
