const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', userController.getProfile);

// Get user preferences
router.get('/preferences', userController.getPreferences);

// Update user preferences
router.post('/preferences', userController.updatePreferences);

// Get translation history
router.get('/history', userController.getHistory);

// Save translation to history
router.post('/history', userController.saveTranslation);

module.exports = router;
