const { OAuth2Client } = require('google-auth-library');
const authConfig = require('../config/auth.config');

const client = new OAuth2Client(authConfig.google.clientId);

/**
 * Verify Google ID token
 * In developer mode, bypasses actual Google verification
 */
const verifyGoogleToken = async (idToken) => {
  // Developer mode bypass
  if (authConfig.developerMode.enabled && idToken === 'DEV_MODE_TOKEN') {
    console.log('🔧 Developer mode: Bypassing Google token verification');
    return {
      googleId: authConfig.developerMode.user.googleId,
      email: authConfig.developerMode.user.email,
      name: authConfig.developerMode.user.name,
      picture: 'https://via.placeholder.com/150',
      emailVerified: true,
    };
  }

  try {
    console.log('🔍 Verifying Google token...');
    console.log('   Expected audience (backend):', authConfig.google.clientId);

    // Decode token to see what audience it has (without verification)
    const tokenParts = idToken.split('.');
    if (tokenParts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        console.log('   Token audience (frontend):', payload.aud);
        console.log('   Token issuer:', payload.iss);
        console.log('   Token match:', payload.aud === authConfig.google.clientId ? '✅ MATCH' : '❌ MISMATCH');
      } catch (decodeError) {
        console.log('   Could not decode token for debugging');
      }
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: authConfig.google.clientId,
    });

    const payload = ticket.getPayload();

    console.log('✅ Token verified successfully for:', payload.email);

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    console.error('❌ Google token verification error:', error.message);
    throw new Error('Invalid Google token');
  }
};

module.exports = {
  verifyGoogleToken,
};
