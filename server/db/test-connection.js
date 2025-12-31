require('dotenv').config();
const { pool } = require('./connection');
const { getConnectionInfo, validateDatabaseUrl } = require('../utils/db.utils');

async function testConnection() {
  console.log('🔍 Testing Database Connection...\n');

  // Validate DATABASE_URL
  const validation = validateDatabaseUrl(process.env.DATABASE_URL);
  if (!validation.valid) {
    console.error('❌ Invalid DATABASE_URL:', validation.error);
    process.exit(1);
  }

  // Show connection info
  console.log('📋 Connection Info:');
  const connInfo = getConnectionInfo();
  console.log(JSON.stringify(connInfo, null, 2));
  console.log('');

  try {
    // Test basic connection
    console.log('🔗 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // Test query
    console.log('📊 Running test query...');
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful!');
    console.log('⏰ Database time:', timeResult.rows[0].current_time);
    console.log('');

    // Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('📦 PostgreSQL Version:');
    console.log(versionResult.rows[0].version);
    console.log('');

    // List all tables
    console.log('📑 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found. Run migration: npm run db:migrate');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach(row => {
        console.log(`   • ${row.table_name} (${row.column_count} columns)`);
      });
    }
    console.log('');

    // Check for users table
    const usersTableExists = tablesResult.rows.some(row => row.table_name === 'users');
    if (usersTableExists) {
      console.log('👥 Users Table Schema:');
      const usersSchema = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);
      usersSchema.rows.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
      console.log('');

      // Count users
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`📊 Total users: ${userCount.rows[0].count}`);
    }

    // Check for sessions table
    const sessionsTableExists = tablesResult.rows.some(row => row.table_name === 'sessions');
    if (sessionsTableExists) {
      console.log('');
      console.log('🔐 Sessions Table Schema:');
      const sessionsSchema = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sessions'
        ORDER BY ordinal_position
      `);
      sessionsSchema.rows.forEach(col => {
        console.log(`   • ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
      console.log('');

      // Count sessions
      const sessionCount = await client.query('SELECT COUNT(*) FROM sessions WHERE is_valid = true');
      console.log(`📊 Active sessions: ${sessionCount.rows[0].count}`);
    }

    // Check indexes
    console.log('');
    console.log('📇 Checking indexes...');
    const indexesResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    if (indexesResult.rows.length > 0) {
      console.log(`✅ Found ${indexesResult.rows.length} index(es):`);
      let currentTable = '';
      indexesResult.rows.forEach(row => {
        if (row.tablename !== currentTable) {
          console.log(`\n   ${row.tablename}:`);
          currentTable = row.tablename;
        }
        console.log(`     • ${row.indexname}`);
      });
    }

    client.release();

    console.log('\n✨ Database connection test completed successfully!\n');
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database connection test failed!');
    console.error('Error:', error.message);
    console.error('\nStack trace:', error.stack);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your DATABASE_URL in .env file');
    console.error('   2. Verify database is running');
    console.error('   3. Check network connectivity');
    console.error('   4. Verify credentials are correct');
    console.error('   5. Check if SSL is required (Render requires SSL)\n');
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
