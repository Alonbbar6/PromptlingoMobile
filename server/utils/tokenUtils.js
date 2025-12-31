const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

/**
 * Generate JWT access token
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    googleId: user.google_id,
  };

  return jwt.sign(payload, authConfig.jwt.accessTokenSecret, {
    expiresIn: authConfig.jwt.accessTokenExpiry,
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, authConfig.jwt.refreshTokenSecret, {
    expiresIn: authConfig.jwt.refreshTokenExpiry,
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.accessTokenSecret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, authConfig.jwt.refreshTokenSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
