/**
 * Database Migration Runner
 * Run this to add usage tracking columns to the users table
 *
 * Usage: node server/db/run-migration.js
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  try {
    console.log('🔄 Connecting to database...');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', 'add_usage_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Running migration: add_usage_tracking.sql');

    // Execute migration
    const result = await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('📊 Result:', result.rows);

    // Verify columns were added
    const verifyQuery = `
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('subscription_tier', 'api_calls_this_month', 'monthly_reset_date', 'stripe_customer_id')
      ORDER BY column_name;
    `;

    const verification = await pool.query(verifyQuery);

    console.log('\n📋 New columns added to users table:');
    verification.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type}) - Default: ${row.column_default || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Details:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
runMigration();