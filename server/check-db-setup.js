/**
 * Quick Database Setup Checker
 * Verifies if the database tables exist and are properly configured
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

async function checkDatabaseSetup() {
  try {
    console.log('🔍 Checking database setup...\n');

    // Test connection
    console.log('1️⃣ Testing database connection...');
    const connTest = await pool.query('SELECT NOW()');
    console.log('   ✅ Connection successful!\n');

    // Check if users table exists
    console.log('2️⃣ Checking if users table exists...');
    const usersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'users'
      );
    `);

    if (usersTableCheck.rows[0].exists) {
      console.log('   ✅ Users table exists!\n');

      // Check users table structure
      console.log('3️⃣ Checking users table structure...');
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
      `);

      console.log('   Columns in users table:');
      columns.rows.forEach(col => {
        console.log(`     - ${col.column_name} (${col.data_type})`);
      });
      console.log('');

    } else {
      console.log('   ❌ Users table does NOT exist!\n');
      console.log('   📝 You need to run the schema setup:');
      console.log('      node server/db/seed.js\n');
    }

    // Check if sessions table exists
    console.log('4️⃣ Checking if sessions table exists...');
    const sessionsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'sessions'
      );
    `);

    if (sessionsTableCheck.rows[0].exists) {
      console.log('   ✅ Sessions table exists!\n');
    } else {
      console.log('   ❌ Sessions table does NOT exist!\n');
      console.log('   📝 You need to run the schema setup:');
      console.log('      node server/db/seed.js\n');
    }

    // Check if uuid extension is enabled
    console.log('5️⃣ Checking UUID extension...');
    const uuidCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_extension WHERE extname = 'uuid-ossp'
      );
    `);

    if (uuidCheck.rows[0].exists) {
      console.log('   ✅ UUID extension enabled!\n');
    } else {
      console.log('   ⚠️  UUID extension NOT enabled!\n');
    }

    // Count existing users
    if (usersTableCheck.rows[0].exists) {
      console.log('6️⃣ Checking existing users...');
      const userCount = await pool.query('SELECT COUNT(*) FROM users;');
      console.log(`   📊 Total users: ${userCount.rows[0].count}\n`);
    }

    console.log('✅ Database setup check complete!\n');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabaseSetup();
