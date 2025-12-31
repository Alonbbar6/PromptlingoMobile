const { pool } = require('../db/connection');

/**
 * Database Service Layer
 * Provides low-level database operations
 */

class DatabaseService {
  /**
   * Execute a raw SQL query
   */
  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient() {
    return await pool.connect();
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Transaction failed:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Insert a record into a table
   */
  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const columns = keys.join(', ');

    const query = `
      INSERT INTO ${table} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * Update a record in a table
   */
  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;

    const result = await this.query(query, [...values, id]);
    return result.rows[0];
  }

  /**
   * Delete a record from a table
   */
  async delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find a record by ID
   */
  async findById(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Find records by a specific field
   */
  async findBy(table, field, value) {
    const query = `SELECT * FROM ${table} WHERE ${field} = $1`;
    const result = await this.query(query, [value]);
    return result.rows;
  }

  /**
   * Find one record by a specific field
   */
  async findOneBy(table, field, value) {
    const query = `SELECT * FROM ${table} WHERE ${field} = $1 LIMIT 1`;
    const result = await this.query(query, [value]);
    return result.rows[0];
  }

  /**
   * Get all records from a table
   */
  async findAll(table, limit = 100, offset = 0) {
    const query = `SELECT * FROM ${table} LIMIT $1 OFFSET $2`;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Count records in a table
   */
  async count(table, whereClause = '', params = []) {
    const query = `SELECT COUNT(*) FROM ${table} ${whereClause}`;
    const result = await this.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if a record exists
   */
  async exists(table, field, value) {
    const query = `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${field} = $1)`;
    const result = await this.query(query, [value]);
    return result.rows[0].exists;
  }
}

module.exports = new DatabaseService();
