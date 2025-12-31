/**
 * Environment Variable Validation
 * Validates that all required environment variables are set
 */

const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FRONTEND_URL',
    'PORT'
  ];

  const missing = [];
  const warnings = [];

  // Check required variables
  required.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional but recommended variables
  if (!process.env.JWT_ACCESS_TOKEN_EXPIRY) {
    warnings.push('JWT_ACCESS_TOKEN_EXPIRY not set, using default: 15m');
  }

  if (!process.env.JWT_REFRESH_TOKEN_EXPIRY) {
    warnings.push('JWT_REFRESH_TOKEN_EXPIRY not set, using default: 7d');
  }

  // Report missing variables
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Report warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach(warning => {
      console.warn(`   - ${warning}`);
    });
  }

  console.log('✅ All required environment variables are set');
  return true;
};

module.exports = validateEnv;
