/**
 * Authentication Routes
 * Handles Google OAuth login, logout, token refresh, and verification
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  validateGoogleLogin, 
  validateRefreshToken, 
  handleValidationErrors 
} = require('../middleware/validationMiddleware');

// Google login
router.post(
  '/google/login',
  validateGoogleLogin,
  handleValidationErrors,
  authController.googleLogin
);

// Developer login (only works when DEV_MODE=true)
router.post('/dev/login', authController.developerLogin);

// Logout
router.post('/logout', authController.logout);

// Verify token
router.get('/verify', authenticateToken, authController.verifyToken);

// Refresh access token
router.post(
  '/refresh', 
  validateRefreshToken, 
  handleValidationErrors, 
  authController.refreshAccessToken
);

// Get current user
router.get('/user', authenticateToken, authController.getCurrentUser);

// Auth status check
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      googleOAuthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      databaseConnected: true,
      jwtConfigured: !!process.env.JWT_SECRET,
      devMode: process.env.DEV_MODE === 'true'
    },
    message: 'Auth status retrieved'
  });
});

module.exports = router;
