const googleAuthService = require('../services/googleAuthService');
const userService = require('../services/userService');
const sessionService = require('../services/sessionService');
const tokenService = require('../services/tokenService');
const authConfig = require('../config/auth.config');
const { successResponse, errorResponse, unauthorizedResponse } = require('../utils/apiResponse');

/**
 * Developer Login - Bypass Google OAuth for testing (only works when DEV_MODE=true)
 * Works WITHOUT database connection - uses in-memory mock data
 */
const developerLogin = async (req, res) => {
  try {
    // Check if developer mode is enabled
    if (!authConfig.developerMode.enabled) {
      return errorResponse(res, 'Developer mode is not enabled', 403);
    }

    console.log('🔧 Developer mode login initiated');

    // Create mock developer user (no database required)
    const mockUser = {
      id: 'dev-user-id-12345',
      email: authConfig.developerMode.user.email,
      name: authConfig.developerMode.user.name,
      avatar_url: 'https://via.placeholder.com/150',
      google_id: authConfig.developerMode.user.googleId,
    };

    console.log(`✅ Developer user logged in: ${mockUser.email} (no database)`);

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(mockUser.id);
    const refreshToken = tokenService.generateRefreshToken(mockUser.id);

    // SECURITY: Set tokens as HttpOnly cookies (protected from XSS)
    // For cross-domain auth (Netlify + Render), we need sameSite: 'none' with secure: true
    // In development, use 'lax' and allow HTTP for mobile testing
    // Using subdomain (api.promptlingo.ai), set domain to .promptlingo.ai for cookie sharing
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response without tokens in body (cookies only)
    return successResponse(res, {
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatar: mockUser.avatar_url,
        googleId: mockUser.google_id,
      },
      expiresIn: 900, // 15 minutes in seconds
      devMode: true,
    }, 'Developer login successful (no database)', 200);
  } catch (error) {
    console.error('Developer login error:', error);
    return errorResponse(res, error.message || 'Failed to authenticate in developer mode', 500);
  }
};

/**
 * Google Login - Verify Google token and create/login user
 * Works with or without database connection - uses in-memory mock data as fallback
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Google ID token is required', 400);
    }

    // Verify Google token
    const googleData = await googleAuthService.verifyGoogleToken(idToken);

    let user;
    let usedDatabase = false;

    try {
      // Try to find or create user in database
      user = await userService.findUserByGoogleId(googleData.googleId);

      if (!user) {
        // Create new user
        user = await userService.createUser(googleData);
        console.log(`✅ New user created in database: ${user.email}`);
      } else {
        // Update last login
        await userService.updateLastLogin(user.id);
        console.log(`✅ User logged in from database: ${user.email}`);
      }
      usedDatabase = true;
    } catch (dbError) {
      // Database failed - use in-memory mock user
      console.warn('⚠️ Database unavailable, using in-memory user data');
      user = {
        id: `google-${googleData.googleId}`,
        email: googleData.email,
        name: googleData.name,
        avatar_url: googleData.avatar,
        google_id: googleData.googleId,
      };
      console.log(`✅ User logged in (no database): ${user.email}`);
    }

    // Generate tokens
    const accessToken = tokenService.generateAccessToken(user.id);
    const refreshToken = tokenService.generateRefreshToken(user.id);

    // Try to create session in database (skip if database unavailable)
    if (usedDatabase) {
      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        await sessionService.createSession(user.id, accessToken, refreshToken, expiresAt);
      } catch (sessionError) {
        console.warn('⚠️ Could not create session in database, continuing without it');
      }
    }

    // SECURITY: Set tokens as HttpOnly cookies (protected from XSS)
    // For cross-domain auth (Netlify + Render), we need sameSite: 'none' with secure: true
    // In development, use 'lax' and allow HTTP for mobile testing
    // Using subdomain (api.promptlingo.ai), set domain to .promptlingo.ai for cookie sharing
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response without tokens in body (cookies only)
    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar_url || user.avatar,
        googleId: user.google_id || user.googleId,
      },
      expiresIn: 900, // 15 minutes in seconds
    }, usedDatabase ? 'Login successful' : 'Login successful (no database)', 200);
  } catch (error) {
    console.error('Google login error:', error);
    return unauthorizedResponse(res, error.message || 'Failed to authenticate with Google');
  }
};

/**
 * Logout - Invalidate refresh token and clear cookies
 */
const logout = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await sessionService.invalidateSessionByToken(refreshToken);
    }

    // SECURITY: Clear HttpOnly cookies (must match the same settings used when setting)
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.promptlingo.ai' : undefined,
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      domain: isProduction ? '.promptlingo.ai' : undefined,
    });

    return successResponse(res, null, 'Logged out successfully', 200);
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, error.message, 500);
  }
};

/**
 * Verify token - Check if access token is valid
 */
const verifyToken = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    return successResponse(res, {
      valid: true,
      user: req.user,
    }, 'Token is valid', 200);
  } catch (error) {
    return unauthorizedResponse(res, error.message);
  }
};

/**
 * Refresh token - Get new access token using refresh token from cookie
 */
const refreshAccessToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const { valid, decoded, error } = tokenService.verifyRefreshToken(refreshToken);

    if (!valid) {
      return unauthorizedResponse(res, error || 'Invalid refresh token');
    }

    // Check if session exists in database
    const session = await sessionService.getSessionByRefreshToken(refreshToken);

    if (!session) {
      return unauthorizedResponse(res, 'Session not found or expired');
    }

    // Get user
    const user = await userService.findUserById(decoded.userId);

    if (!user || !user.is_active) {
      return unauthorizedResponse(res, 'User not found or inactive');
    }

    // Generate new access token
    const accessToken = tokenService.generateAccessToken(user.id);

    // Optionally rotate refresh token (more secure)
    const newRefreshToken = tokenService.generateRefreshToken(user.id);

    // Calculate new expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Delete old session and create new one
    await sessionService.invalidateSessionByToken(refreshToken);
    await sessionService.createSession(user.id, accessToken, newRefreshToken, expiresAt);

    // SECURITY: Set new tokens as HttpOnly cookies (protected from XSS)
    // IMPORTANT: Cookie settings MUST match the login endpoint to prevent session issues
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction, // Only require HTTPS in production
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain in prod, 'lax' for same-domain in dev
      domain: isProduction ? '.promptlingo.ai' : undefined, // Share cookies across subdomains in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response without tokens in body (cookies only)
    return successResponse(res, {
      expiresIn: 900, // 15 minutes
    }, 'Token refreshed successfully', 200);
  } catch (error) {
    console.error('Refresh token error:', error);
    return unauthorizedResponse(res, error.message || 'Token refresh failed');
  }
};

/**
 * Get current user - Get authenticated user's profile
 */
const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by authenticate middleware
    const user = await userService.findUserById(req.userId);

    if (!user) {
      return unauthorizedResponse(res, 'User not found');
    }

    return successResponse(res, {
      id: user.id,
      googleId: user.google_id,
      email: user.email,
      name: user.name,
      avatar: user.avatar_url,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      preferences: user.preferences,
      settings: user.settings
    }, 'User retrieved successfully', 200);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  googleLogin,
  developerLogin,
  logout,
  verifyToken,
  refreshAccessToken,
  getCurrentUser,
};
