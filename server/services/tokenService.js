/**
 * JWT Token Service
 * Handles JWT token generation, verification, and management
 */

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

/**
 * Generate access token for user
 * @param {String} userId - User ID
 * @returns {String} JWT access token
 */
const generateAccessToken = (userId) => {
  const payload = {
    userId,
    type: 'access',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.accessTokenExpiry,
    algorithm: authConfig.jwt.algorithm
  });
};

/**
 * Generate refresh token for user
 * @param {String} userId - User ID
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, authConfig.jwt.secret, {
    expiresIn: authConfig.jwt.refreshTokenExpiry,
    algorithm: authConfig.jwt.algorithm
  });
};

/**
 * Verify access token
 * @param {String} token - JWT token
 * @returns {Object} { valid, decoded, error }
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    if (decoded.type !== 'access') {
      return { valid: false, decoded: null, error: 'Invalid token type' };
    }

    return { valid: true, decoded, error: null };
  } catch (error) {
    return { valid: false, decoded: null, error: error.message };
  }
};

/**
 * Verify refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} { valid, decoded, error }
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, authConfig.jwt.secret);
    
    if (decoded.type !== 'refresh') {
      return { valid: false, decoded: null, error: 'Invalid token type' };
    }

    return { valid: true, decoded, error: null };
  } catch (error) {
    return { valid: false, decoded: null, error: error.message };
  }
};

/**
 * Decode token without verification
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} True if expired
 */
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

/**
 * Get token expiration time in seconds
 * @param {String} token - JWT token
 * @returns {Number} Expiration time in seconds, or null if invalid
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return decoded?.exp || null;
};

/**
 * Calculate time until token expires
 * @param {String} token - JWT token
 * @returns {Number} Seconds until expiration, or 0 if expired/invalid
 */
const getTimeUntilExpiration = (token) => {
  const exp = getTokenExpiration(token);
  if (!exp) return 0;

  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = exp - currentTime;
  return timeLeft > 0 ? timeLeft : 0;
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration
};
