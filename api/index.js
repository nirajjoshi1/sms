// Vercel serverless function entry point
require('dotenv').config();
const app = require('../server/app');

// Vercel serverless function handler
module.exports = app;
