/**
 * Database Migration Runner for Promotion Codes
 * Run this to add promotion code tables
 *
 * Usage: node server/db/run-promo-migration.js
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
    const migrationPath = path.join(__dirname, 'migrations', 'add_promotion_codes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Running migration: add_promotion_codes.sql');

    // Execute migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    const verifyQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('promotion_codes', 'user_promotions')
      ORDER BY table_name;
    `;

    const verification = await pool.query(verifyQuery);

    console.log('\n📋 Tables created:');
    verification.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Show the default promotion code
    const promoCodeQuery = 'SELECT code, description, duration_days FROM promotion_codes;';
    const promoCodes = await pool.query(promoCodeQuery);

    console.log('\n🎁 Available promotion codes:');
    promoCodes.rows.forEach(row => {
      console.log(`  ✓ ${row.code} - ${row.description} (${row.duration_days} days)`);
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
