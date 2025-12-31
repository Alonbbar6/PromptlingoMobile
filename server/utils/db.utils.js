/**
 * Database Utility Functions
 */

/**
 * Format user record for API responses
 * Removes sensitive fields
 */
const formatUserResponse = (userRecord) => {
  if (!userRecord) return null;

  return {
    id: userRecord.id,
    email: userRecord.email,
    name: userRecord.name,
    avatarUrl: userRecord.avatar_url,
    googleId: userRecord.google_id,
    createdAt: userRecord.created_at,
    lastLogin: userRecord.last_login,
    preferences: userRecord.preferences || {},
    settings: userRecord.settings || {},
    isActive: userRecord.is_active,
  };
};

/**
 * Validate DATABASE_URL format
 */
const validateDatabaseUrl = (url) => {
  if (!url) {
    return { valid: false, error: 'DATABASE_URL is not set' };
  }

  // Check for PostgreSQL URL format
  const postgresRegex = /^postgres(ql)?:\/\/.+/;
  if (!postgresRegex.test(url)) {
    return { valid: false, error: 'DATABASE_URL must be a valid PostgreSQL connection string' };
  }

  return { valid: true };
};

/**
 * Get connection info for logging (without password)
 */
const getConnectionInfo = () => {
  const url = process.env.DATABASE_URL;
  
  if (!url) {
    return 'No DATABASE_URL configured';
  }

  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: urlObj.port || 5432,
      database: urlObj.pathname.slice(1),
      user: urlObj.username,
      ssl: process.env.NODE_ENV === 'production',
    };
  } catch (error) {
    return 'Invalid DATABASE_URL format';
  }
};

/**
 * Format database error for logging/responses
 */
const handleDatabaseError = (error) => {
  const errorResponse = {
    message: 'Database error occurred',
    code: error.code,
    timestamp: new Date().toISOString(),
  };

  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // unique_violation
      errorResponse.message = 'A record with this value already exists';
      errorResponse.field = error.constraint;
      break;
    case '23503': // foreign_key_violation
      errorResponse.message = 'Referenced record does not exist';
      break;
    case '23502': // not_null_violation
      errorResponse.message = 'Required field is missing';
      errorResponse.field = error.column;
      break;
    case '22P02': // invalid_text_representation
      errorResponse.message = 'Invalid data format';
      break;
    case '42P01': // undefined_table
      errorResponse.message = 'Database table does not exist';
      break;
    case 'ECONNREFUSED':
      errorResponse.message = 'Could not connect to database';
      break;
    case 'ETIMEDOUT':
      errorResponse.message = 'Database connection timeout';
      break;
    default:
      errorResponse.message = error.message || 'Unknown database error';
  }

  return errorResponse;
};

/**
 * Check if error is connection-related
 */
const isConnectionError = (error) => {
  const connectionErrors = [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNRESET',
    'EPIPE',
  ];

  return connectionErrors.includes(error.code) || 
         error.message?.includes('connect') ||
         error.message?.includes('connection');
};

/**
 * Retry connection with exponential backoff
 */
const retryConnection = async (pool, maxRetries = 5) => {
  let retries = 0;
  let delay = 1000; // Start with 1 second

  while (retries < maxRetries) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      retries++;
      console.error(`❌ Connection attempt ${retries}/${maxRetries} failed:`, error.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  console.error('❌ Failed to connect to database after maximum retries');
  return false;
};

/**
 * Sanitize SQL input (basic protection)
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input.replace(/[;'"\\]/g, '');
};

/**
 * Format session response
 */
const formatSessionResponse = (session) => {
  if (!session) return null;

  return {
    id: session.id,
    userId: session.user_id,
    createdAt: session.created_at,
    expiresAt: session.expires_at,
    lastActivity: session.last_activity,
    isValid: session.is_valid,
  };
};

/**
 * Check if session is expired
 */
const isSessionExpired = (session) => {
  if (!session) return true;
  return new Date(session.expires_at) < new Date();
};

/**
 * Calculate session expiry time
 */
const calculateExpiryTime = (daysFromNow = 7) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + daysFromNow);
  return expiry;
};

module.exports = {
  formatUserResponse,
  validateDatabaseUrl,
  getConnectionInfo,
  handleDatabaseError,
  isConnectionError,
  retryConnection,
  sanitizeInput,
  formatSessionResponse,
  isSessionExpired,
  calculateExpiryTime,
};
