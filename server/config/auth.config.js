/**
 * Authentication Configuration
 * Central configuration for JWT, Google OAuth, and security settings
 */

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required. Generate one with: openssl rand -hex 64');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('CRITICAL: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required');
}

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m', // 15 minutes
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d', // 7 days
    algorithm: 'HS256',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  developerMode: {
    enabled: process.env.DEV_MODE === 'true',
    user: {
      email: process.env.DEV_USER_EMAIL || 'developer@test.com',
      name: process.env.DEV_USER_NAME || 'Developer User',
      googleId: 'dev-mode-user-id',
    },
  },
};
