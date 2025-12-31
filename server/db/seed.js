require('dotenv').config();
const { pool } = require('./connection');

/**
 * Seed database with initial data
 * This is optional and for development/testing purposes
 */

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);

    if (userCount > 0) {
      console.log(`⚠️  Database already has ${userCount} user(s)`);
      console.log('Skipping seed to avoid duplicates.\n');
      
      const proceed = process.argv.includes('--force');
      if (!proceed) {
        console.log('💡 Use --force flag to seed anyway: npm run db:seed -- --force\n');
        await pool.end();
        process.exit(0);
      }
      console.log('🔄 Force flag detected, proceeding with seed...\n');
    }

    // Seed test users (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('👥 Creating test users...');
      
      const testUsers = [
        {
          google_id: 'test_google_id_1',
          email: 'test1@promptlingo.com',
          name: 'Test User 1',
          avatar_url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=T1',
          preferences: JSON.stringify({
            language: 'en',
            theme: 'light',
            tone: 'professional',
          }),
        },
        {
          google_id: 'test_google_id_2',
          email: 'test2@promptlingo.com',
          name: 'Test User 2',
          avatar_url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=T2',
          preferences: JSON.stringify({
            language: 'es',
            theme: 'dark',
            tone: 'friendly',
          }),
        },
      ];

      for (const user of testUsers) {
        try {
          const result = await pool.query(
            `INSERT INTO users (google_id, email, name, avatar_url, preferences, settings)
             VALUES ($1, $2, $3, $4, $5, '{}')
             ON CONFLICT (google_id) DO NOTHING
             RETURNING id, email`,
            [user.google_id, user.email, user.name, user.avatar_url, user.preferences]
          );

          if (result.rows.length > 0) {
            console.log(`   ✅ Created user: ${result.rows[0].email}`);
          } else {
            console.log(`   ⏭️  User already exists: ${user.email}`);
          }
        } catch (error) {
          console.error(`   ❌ Failed to create user ${user.email}:`, error.message);
        }
      }

      console.log('');
    }

    // Get final count
    const finalCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`✨ Seeding complete! Total users: ${finalCount.rows[0].count}\n`);

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error('Stack trace:', error.stack);
    await pool.end();
    process.exit(1);
  }
}

seedDatabase();
