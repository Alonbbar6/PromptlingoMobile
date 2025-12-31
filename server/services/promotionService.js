const db = require('../db/connection');

/**
 * Validate a promotion code
 * Checks if code exists, is active, and hasn't exceeded redemption limit
 */
const validatePromotionCode = async (code) => {
  const result = await db.query(
    `SELECT * FROM promotion_codes
     WHERE code = $1
     AND is_active = true
     AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
    [code.toUpperCase()]
  );

  const promoCode = result.rows[0];

  if (!promoCode) {
    return { valid: false, error: 'Invalid or expired promotion code' };
  }

  // Check if max redemptions reached
  if (promoCode.max_redemptions !== null && promoCode.current_redemptions >= promoCode.max_redemptions) {
    return { valid: false, error: 'This promotion code has reached its maximum number of redemptions' };
  }

  return { valid: true, promoCode };
};

/**
 * Redeem a promotion code for a user
 */
const redeemPromotionCode = async (userId, code) => {
  try {
    // Start transaction
    await db.query('BEGIN');

    // Validate the code
    const validation = await validatePromotionCode(code);
    if (!validation.valid) {
      await db.query('ROLLBACK');
      return { success: false, error: validation.error };
    }

    const promoCode = validation.promoCode;

    // Check if user has already redeemed this code
    const existingRedemption = await db.query(
      'SELECT * FROM user_promotions WHERE user_id = $1 AND promotion_code_id = $2',
      [userId, promoCode.id]
    );

    if (existingRedemption.rows.length > 0) {
      await db.query('ROLLBACK');
      return { success: false, error: 'You have already redeemed this promotion code' };
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + promoCode.duration_days);

    // Create user promotion record
    const userPromotionResult = await db.query(
      `INSERT INTO user_promotions (user_id, promotion_code_id, expires_at, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [userId, promoCode.id, expiresAt]
    );

    // Increment redemption count
    await db.query(
      'UPDATE promotion_codes SET current_redemptions = current_redemptions + 1 WHERE id = $1',
      [promoCode.id]
    );

    // Commit transaction
    await db.query('COMMIT');

    console.log(`✅ User ${userId} redeemed promotion code: ${code}`);

    return {
      success: true,
      promotion: {
        ...userPromotionResult.rows[0],
        code: promoCode.code,
        description: promoCode.description,
        durationDays: promoCode.duration_days
      }
    };

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error redeeming promotion code:', error);
    throw error;
  }
};

/**
 * Check if user has an active promotion
 */
const hasActivePromotion = async (userId) => {
  const result = await db.query(
    `SELECT up.*, pc.code, pc.description
     FROM user_promotions up
     JOIN promotion_codes pc ON up.promotion_code_id = pc.id
     WHERE up.user_id = $1
     AND up.is_active = true
     AND up.expires_at > CURRENT_TIMESTAMP
     ORDER BY up.expires_at DESC
     LIMIT 1`,
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get all active promotions for a user
 */
const getUserPromotions = async (userId) => {
  const result = await db.query(
    `SELECT up.*, pc.code, pc.description, pc.duration_days
     FROM user_promotions up
     JOIN promotion_codes pc ON up.promotion_code_id = pc.id
     WHERE up.user_id = $1
     ORDER BY up.redeemed_at DESC`,
    [userId]
  );

  return result.rows;
};

/**
 * Deactivate expired promotions for a user
 */
const deactivateExpiredPromotions = async (userId) => {
  const result = await db.query(
    `UPDATE user_promotions
     SET is_active = false
     WHERE user_id = $1
     AND is_active = true
     AND expires_at <= CURRENT_TIMESTAMP
     RETURNING *`,
    [userId]
  );

  if (result.rows.length > 0) {
    console.log(`🔄 Deactivated ${result.rows.length} expired promotion(s) for user ${userId}`);
  }

  return result.rows;
};

/**
 * Create a new promotion code (admin only)
 */
const createPromotionCode = async ({ code, description, durationDays, maxRedemptions, expiresAt }) => {
  const result = await db.query(
    `INSERT INTO promotion_codes (code, description, duration_days, max_redemptions, expires_at, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING *`,
    [code.toUpperCase(), description, durationDays, maxRedemptions || null, expiresAt || null]
  );

  console.log(`✅ Created promotion code: ${code}`);
  return result.rows[0];
};

/**
 * Get all promotion codes (admin only)
 */
const getAllPromotionCodes = async () => {
  const result = await db.query(
    'SELECT * FROM promotion_codes ORDER BY created_at DESC'
  );

  return result.rows;
};

/**
 * Deactivate a promotion code (admin only)
 */
const deactivatePromotionCode = async (code) => {
  const result = await db.query(
    'UPDATE promotion_codes SET is_active = false WHERE code = $1 RETURNING *',
    [code.toUpperCase()]
  );

  if (result.rows.length > 0) {
    console.log(`✅ Deactivated promotion code: ${code}`);
  }

  return result.rows[0];
};

module.exports = {
  validatePromotionCode,
  redeemPromotionCode,
  hasActivePromotion,
  getUserPromotions,
  deactivateExpiredPromotions,
  createPromotionCode,
  getAllPromotionCodes,
  deactivatePromotionCode,
};
