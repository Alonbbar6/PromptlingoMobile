const { verifyAccessToken } = require('../utils/tokenUtils');
const userService = require('../services/userService');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await userService.findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.google_id,
      avatarUrl: user.avatar_url,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid token',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    const user = await userService.findUserById(decoded.id);

    if (user && user.is_active) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        googleId: user.google_id,
        avatarUrl: user.avatar_url,
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
