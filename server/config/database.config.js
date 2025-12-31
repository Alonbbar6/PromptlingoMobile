require('dotenv').config();

/**
 * Database Configuration
 * Environment-specific settings for PostgreSQL connection
 */

const config = {
  // Database connection URL
  databaseUrl: process.env.DATABASE_URL,

  // Connection pool settings
  pool: {
    max: process.env.DB_POOL_MAX || 20, // Maximum number of clients
    min: process.env.DB_POOL_MIN || 2,  // Minimum number of clients
    idleTimeoutMillis: 30000,            // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000,      // Return error after 10 seconds if connection fails
    acquireTimeoutMillis: 30000,         // Maximum time to wait for a connection
  },

  // SSL Configuration
  ssl: {
    // Render.com and most cloud providers require SSL
    enabled: process.env.NODE_ENV === 'production',
    rejectUnauthorized: false, // Required for Render.com
  },

  // Query settings
  query: {
    timeout: 30000, // Query timeout in milliseconds
  },

  // Retry settings
  retry: {
    maxAttempts: 5,
    initialDelay: 1000,    // 1 second
    maxDelay: 10000,       // 10 seconds
    factor: 2,             // Exponential backoff factor
  },

  // Logging settings
  logging: {
    enabled: process.env.DB_LOGGING === 'true' || process.env.NODE_ENV === 'development',
    logQueries: process.env.DB_LOG_QUERIES === 'true',
    logErrors: true,
  },

  // Session settings
  session: {
    defaultExpiryDays: 7,
    cleanupIntervalHours: 24,
  },

  // Migration settings
  migrations: {
    directory: './db/migrations',
    tableName: 'migrations',
  },
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const errors = [];

  if (!config.databaseUrl) {
    errors.push('DATABASE_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Database configuration errors:\n${errors.join('\n')}`);
  }

  return true;
};

/**
 * Get environment-specific configuration
 */
const getConfig = () => {
  validateConfig();
  return config;
};

module.exports = {
  config,
  getConfig,
  validateConfig,
};
