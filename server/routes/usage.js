/**
 * Usage API Routes
 * Get user's API usage statistics
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getUsage } = require('../middleware/usageMiddleware');

// Get current user's usage
router.get('/', authenticateToken, getUsage);

module.exports = router;