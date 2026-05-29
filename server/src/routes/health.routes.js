const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const dbCheck = await prisma.$queryRaw`SELECT 1`;

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV || 'development',
            database: dbCheck ? 'connected' : 'disconnected',
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

router.get('/api/v1/status', (req, res) => {
    res.json({
        success: true,
        message: 'School Management System API v1',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
