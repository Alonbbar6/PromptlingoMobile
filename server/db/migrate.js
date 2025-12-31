const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema file loaded');
    console.log('🔗 Connecting to database...\n');

    // Execute schema
    await pool.query(schema);

    console.log('✅ Migration completed successfully!\n');

    // Verify tables were created
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    const result = await pool.query(tablesQuery);
    
    console.log('📊 Tables in database:');
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    // Verify indexes
    const indexesQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY indexname;
    `;

    const indexes = await pool.query(indexesQuery);
    
    console.log('\n📑 Indexes created:');
    indexes.rows.forEach(row => {
      console.log(`   ✓ ${row.indexname}`);
    });

    console.log('\n✨ Database is ready to use!\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

// Run migration
runMigration();
