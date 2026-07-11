const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { verifyJWT, requireSchoolContext } = require('../middleware/auth.middleware');

router.get('/stats', verifyJWT, requireSchoolContext, getDashboardStats);

module.exports = router;
