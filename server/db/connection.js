const { Pool } = require('pg');
require('dotenv').config();

// Database connection configuration
// Enable SSL if using Render.com (required) or in production
const isRender = process.env.DATABASE_URL?.includes('render.com');
const requiresSSL = process.env.NODE_ENV === 'production' || isRender;

const config = {
  connectionString: process.env.DATABASE_URL,
  ssl: requiresSSL
    ? { rejectUnauthorized: false } // Required for Render.com and production
    : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(config);

// Connection event handlers
pool.on('connect', () => {
  console.log('✅ Database client connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

pool.on('remove', () => {
  console.log('🔌 Database client removed from pool');
});

// Test connection function
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    console.log('📅 Server time:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Graceful shutdown
async function closePool() {
  try {
    await pool.end();
    console.log('🔒 Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  testConnection,
  closePool,
};
