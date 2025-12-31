/**
 * Validation Middleware
 * Input validation using express-validator
 */

const { body, validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/apiResponse');

/**
 * Validate Google login request
 */
const validateGoogleLogin = [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required')
    .isString()
    .withMessage('ID token must be a string'),
];

/**
 * Validate refresh token request
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string'),
];

/**
 * Validate user update request
 */
const validateUserUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

/**
 * Validate preferences update
 */
const validatePreferences = [
  body('preferences')
    .notEmpty()
    .withMessage('Preferences are required')
    .isObject()
    .withMessage('Preferences must be an object'),
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors.array());
  }
  
  next();
};

module.exports = {
  validateGoogleLogin,
  validateRefreshToken,
  validateUserUpdate,
  validatePreferences,
  handleValidationErrors
};
