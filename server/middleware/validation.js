const { body, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
const sanitizeHTML = (value) => {
  if (typeof value === 'string') {
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  }
  return value;
};

/**
 * Validation rules for POST /api/translate
 */
const validateTranslation = [
  body('text')
    .exists().withMessage('Text is required')
    .isString().withMessage('Text must be a string')
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Text must be between 1 and 5000 characters')
    .customSanitizer(sanitizeHTML),
  body('sourceLang')
    .exists().withMessage('Source language is required')
    .isString().withMessage('Source language must be a string')
    .isLength({ min: 2, max: 5 }).withMessage('Invalid language code'),
  body('targetLang')
    .exists().withMessage('Target language is required')
    .isString().withMessage('Target language must be a string')
    .isLength({ min: 2, max: 5 }).withMessage('Invalid language code'),
  body('tone')
    .optional()
    .isString().withMessage('Tone must be a string')
    .isIn(['casual', 'business', 'formal', 'informal', 'medical', 'professional', 'friendly', 'enthusiastic', 'calm', 'authoritative', 'neutral']).withMessage('Invalid tone'),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/auth/google/login
 */
const validateGoogleLogin = [
  body('token')
    .exists().withMessage('Google token is required')
    .isString().withMessage('Token must be a string')
    .trim()
    .notEmpty().withMessage('Token cannot be empty')
    .isLength({ min: 10, max: 2000 }).withMessage('Invalid token format'),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/stripe/create-checkout-session
 */
const validateCheckoutSession = [
  body('planType')
    .exists().withMessage('Plan type is required')
    .isString().withMessage('Plan type must be a string')
    .isIn(['essential', 'monthly', 'yearly']).withMessage('Invalid plan type'),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/synthesize
 */
const validateSynthesize = [
  body('text')
    .exists().withMessage('Text is required')
    .isString().withMessage('Text must be a string')
    .trim()
    .isLength({ min: 1, max: 5000 }).withMessage('Text must be between 1 and 5000 characters')
    .customSanitizer(sanitizeHTML),
  body('language')
    .exists().withMessage('Language is required')
    .isString().withMessage('Language must be a string')
    .isLength({ min: 2, max: 5 }).withMessage('Invalid language code'),
  body('voice')
    .optional()
    .isString().withMessage('Voice must be a string'),
  handleValidationErrors,
];

/**
 * Validation rules for DELETE /api/auth/delete-account
 */
const validateAccountDeletion = [
  body('password')
    .exists().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .trim()
    .notEmpty().withMessage('Password cannot be empty'),
  handleValidationErrors,
];

/**
 * Validation rules for POST /api/auth/logout
 */
const validateLogout = [
  // No body validation needed, but we keep this for consistency
  handleValidationErrors,
];

module.exports = {
  validateTranslation,
  validateGoogleLogin,
  validateCheckoutSession,
  validateSynthesize,
  validateAccountDeletion,
  validateLogout,
  handleValidationErrors,
};

/**
 * Usage in Express routes:
 * 
 * const { validateTranslation } = require('./middleware/validation');
 * 
 * router.post('/api/translate', validateTranslation, async (req, res) => {
 *   // Your route handler here
 * });
 * 
 * Installation:
 * npm install express-validator isomorphic-dompurify
 */
