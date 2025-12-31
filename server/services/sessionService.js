const db = require('../db/connection');

/**
 * Session Service
 * Manages user authentication sessions
 */

/**
 * Create a new session
 */
const createSession = async (userId, accessToken, refreshToken, expiresAt) => {
  const result = await db.query(
    `INSERT INTO sessions (user_id, access_token, refresh_token, expires_at, is_valid)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [userId, accessToken, refreshToken, expiresAt]
  );
  return result.rows[0];
};

/**
 * Get session by ID
 */
const getSession = async (sessionId) => {
  const result = await db.query(
    'SELECT * FROM sessions WHERE id = $1 AND is_valid = true',
    [sessionId]
  );
  return result.rows[0];
};

/**
 * Get session by user ID and session ID
 */
const getUserSession = async (userId, sessionId) => {
  const result = await db.query(
    'SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND is_valid = true',
    [sessionId, userId]
  );
  return result.rows[0];
};

/**
 * Get active session for user
 */
const getActiveSession = async (userId) => {
  const result = await db.query(
    `SELECT * FROM sessions 
     WHERE user_id = $1 
     AND is_valid = true 
     AND expires_at > CURRENT_TIMESTAMP
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Get all active sessions for user
 */
const getAllUserSessions = async (userId) => {
  const result = await db.query(
    `SELECT * FROM sessions 
     WHERE user_id = $1 
     AND is_valid = true 
     AND expires_at > CURRENT_TIMESTAMP
     ORDER BY last_activity DESC`,
    [userId]
  );
  return result.rows;
};

/**
 * Update last activity timestamp
 */
const updateLastActivity = async (sessionId) => {
  await db.query(
    'UPDATE sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = $1',
    [sessionId]
  );
};

/**
 * Update access token
 */
const updateAccessToken = async (sessionId, newAccessToken) => {
  const result = await db.query(
    `UPDATE sessions 
     SET access_token = $1, last_activity = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [newAccessToken, sessionId]
  );
  return result.rows[0];
};

/**
 * Invalidate a session (soft delete)
 */
const invalidateSession = async (sessionId) => {
  await db.query(
    'UPDATE sessions SET is_valid = false WHERE id = $1',
    [sessionId]
  );
};

/**
 * Invalidate session by refresh token
 */
const invalidateSessionByToken = async (refreshToken) => {
  await db.query(
    'UPDATE sessions SET is_valid = false WHERE refresh_token = $1',
    [refreshToken]
  );
};

/**
 * Invalidate all user sessions
 */
const invalidateAllUserSessions = async (userId) => {
  await db.query(
    'UPDATE sessions SET is_valid = false WHERE user_id = $1',
    [userId]
  );
};

/**
 * Clean up expired sessions
 */
const cleanupExpiredSessions = async () => {
  const result = await db.query(
    `UPDATE sessions 
     SET is_valid = false 
     WHERE expires_at < CURRENT_TIMESTAMP 
     AND is_valid = true
     RETURNING id`
  );
  return result.rowCount;
};

/**
 * Get session by refresh token
 */
const getSessionByRefreshToken = async (refreshToken) => {
  const result = await db.query(
    `SELECT * FROM sessions 
     WHERE refresh_token = $1 
     AND is_valid = true 
     AND expires_at > CURRENT_TIMESTAMP`,
    [refreshToken]
  );
  return result.rows[0];
};

/**
 * Delete old sessions (hard delete)
 * Removes sessions older than specified days
 */
const deleteOldSessions = async (daysOld = 30) => {
  const result = await db.query(
    `DELETE FROM sessions 
     WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
     RETURNING id`
  );
  return result.rowCount;
};

module.exports = {
  createSession,
  getSession,
  getUserSession,
  getActiveSession,
  getAllUserSessions,
  updateLastActivity,
  updateAccessToken,
  invalidateSession,
  invalidateSessionByToken,
  invalidateAllUserSessions,
  cleanupExpiredSessions,
  getSessionByRefreshToken,
  deleteOldSessions,
};
