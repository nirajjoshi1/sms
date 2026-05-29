const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.get('/stats', verifyJWT, getDashboardStats);

module.exports = router;
