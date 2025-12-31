const express = require('express');
const router = express.Router();
const { pool } = require('../db/connection');

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Test database connection
    const result = await pool.query('SELECT NOW()');
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/db-status
 * Detailed database status
 */
router.get('/db-status', async (req, res) => {
  try {
    // Get database version
    const versionResult = await pool.query('SELECT version()');
    
    // Get table list
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // Get connection pool stats
    const poolStats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    };

    res.json({
      status: 'ok',
      dbConnected: true,
      version: versionResult.rows[0].version.split(' ')[1], // Extract version number
      tables: tablesResult.rows.map(row => row.table_name),
      tableCount: tablesResult.rows.length,
      connectionPool: poolStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      dbConnected: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/health/test-user
 * Create a test user to verify database works
 * (Development only)
 */
router.post('/test-user', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test endpoints are disabled in production',
    });
  }

  try {
    const testUser = {
      google_id: `test_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      name: 'Test User',
      avatar_url: 'https://via.placeholder.com/150',
    };

    const result = await pool.query(
      `INSERT INTO users (google_id, email, name, avatar_url, preferences, settings)
       VALUES ($1, $2, $3, $4, '{}', '{}')
       RETURNING *`,
      [testUser.google_id, testUser.email, testUser.name, testUser.avatar_url]
    );

    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
  }
});

/**
 * GET /api/health/stats
 * Get database statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // Count users
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    stats.totalUsers = parseInt(usersResult.rows[0].count);

    // Count active users (logged in within last 30 days)
    const activeUsersResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '30 days'"
    );
    stats.activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Count sessions
    const sessionsResult = await pool.query('SELECT COUNT(*) FROM sessions WHERE is_valid = true');
    stats.activeSessions = parseInt(sessionsResult.rows[0].count);

    // Count expired sessions
    const expiredSessionsResult = await pool.query(
      'SELECT COUNT(*) FROM sessions WHERE expires_at < NOW()'
    );
    stats.expiredSessions = parseInt(expiredSessionsResult.rows[0].count);

    res.json({
      status: 'ok',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
