const express = require('express');
const { getIdentity } = require('../controllers/qrIdentity.controller');

const router = express.Router();
router.get('/:token', getIdentity);

module.exports = router;
