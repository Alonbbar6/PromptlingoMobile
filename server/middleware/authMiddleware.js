/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

const tokenService = require('../services/tokenService');
const userService = require('../services/userService');
const { unauthorizedResponse } = require('../utils/apiResponse');

/**
 * Authenticate JWT token from HttpOnly cookie
 * Requires database verification - fails if database unavailable (secure by design)
 */
const authenticateToken = async (req, res, next) => {
  try {
    // SECURITY: Get token from HttpOnly cookie (protected from XSS)
    // Fallback to Authorization header for backwards compatibility during transition
    let token = req.cookies?.accessToken;

    if (!token) {
      // Try Authorization header as fallback
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return unauthorizedResponse(res, 'Access token required');
    }

    // Verify token
    const { valid, decoded } = tokenService.verifyAccessToken(token);

    if (!valid) {
      return unauthorizedResponse(res, 'Invalid or expired token');
    }

    // Get user from database - REQUIRED for security
    const user = await userService.findUserById(decoded.userId);

    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }

    if (!user.is_active) {
      return unauthorizedResponse(res, 'User account is deactivated');
    }

    // Attach verified user from database to request
    req.user = {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url
    };
    req.userId = user.id;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    // SECURITY: Get token from HttpOnly cookie (protected from XSS)
    // Fallback to Authorization header for backwards compatibility
    let token = req.cookies?.accessToken;

    if (!token) {
      // Try Authorization header as fallback
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const { valid, decoded } = tokenService.verifyAccessToken(token);

    if (valid) {
      const user = await userService.findUserById(decoded.userId);
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          googleId: user.google_id,
          email: user.email,
          name: user.name,
          avatar: user.avatar_url
        };
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Provider-based authentication
 * Requires authentication for OpenAI provider, optional for NLLB (free) provider
 */
const providerBasedAuth = async (req, res, next) => {
  try {
    // Check if provider is NLLB (free model)
    const provider = req.body?.provider || req.query?.provider;

    if (provider === 'nllb') {
      console.log('  → NLLB provider detected, authentication not required');
      // NLLB is free, no authentication required
      req.user = null;
      req.userId = null;
      return next();
    }

    // For OpenAI or unspecified provider, require authentication
    console.log(`  → ${provider || 'OpenAI (default)'} provider detected, authentication required`);
    return authenticateToken(req, res, next);
  } catch (error) {
    console.error('Provider-based auth error:', error);
    return unauthorizedResponse(res, 'Authentication failed');
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  providerBasedAuth
};
