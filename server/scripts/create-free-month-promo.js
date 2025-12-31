/**
 * Script to create a 1-month free unlimited usage promotion code
 */

require('dotenv').config();
const { query } = require('../db/connection');

async function createFreeMonthPromo() {
  try {
    console.log('📝 Creating 1-month free unlimited usage promotion code...\n');

    // Check if code already exists
    const existing = await query(
      'SELECT * FROM promotion_codes WHERE code = $1',
      ['FREEMONTH']
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Promotion code "FREEMONTH" already exists:');
      console.log(JSON.stringify(existing.rows[0], null, 2));

      // Update it to ensure it's active
      await query(
        'UPDATE promotion_codes SET is_active = true, duration_days = 30 WHERE code = $1',
        ['FREEMONTH']
      );
      console.log('\n✅ Updated existing code to be active with 30 days duration');
      return;
    }

    // Create new promotion code
    const result = await query(
      `INSERT INTO promotion_codes (code, description, duration_days, max_redemptions, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [
        'FREEMONTH',
        'Get 1 month of unlimited translations for free!',
        30, // 30 days
        null // unlimited redemptions
      ]
    );

    console.log('✅ Successfully created promotion code:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('\n🎉 Users can now redeem code "FREEMONTH" for 30 days of unlimited usage!');

  } catch (error) {
    console.error('❌ Error creating promotion code:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

createFreeMonthPromo();
