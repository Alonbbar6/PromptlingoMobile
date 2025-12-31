/**
 * Promotion Codes API Routes
 * Endpoints for redeeming and managing promotion codes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  redeemPromotionCode,
  hasActivePromotion,
  getUserPromotions,
  deactivateExpiredPromotions,
  validatePromotionCode
} = require('../services/promotionService');

/**
 * POST /api/promotions/redeem
 * Redeem a promotion code for the current user
 */
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Promotion code is required'
      });
    }

    // Deactivate any expired promotions first
    await deactivateExpiredPromotions(userId);

    // Redeem the code
    const result = await redeemPromotionCode(userId, code.trim());

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Error redeeming promotion code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem promotion code'
    });
  }
});

/**
 * GET /api/promotions/active
 * Check if the current user has an active promotion
 */
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Deactivate any expired promotions first
    await deactivateExpiredPromotions(userId);

    const activePromotion = await hasActivePromotion(userId);

    res.json({
      hasActivePromotion: !!activePromotion,
      promotion: activePromotion
    });

  } catch (error) {
    console.error('Error checking active promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check active promotion'
    });
  }
});

/**
 * GET /api/promotions/my-promotions
 * Get all promotions for the current user
 */
router.get('/my-promotions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const promotions = await getUserPromotions(userId);

    res.json({
      promotions
    });

  } catch (error) {
    console.error('Error getting user promotions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user promotions'
    });
  }
});

/**
 * POST /api/promotions/validate
 * Validate a promotion code without redeeming it
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({
        valid: false,
        error: 'Promotion code is required'
      });
    }

    const validation = await validatePromotionCode(code.trim());

    res.json(validation);

  } catch (error) {
    console.error('Error validating promotion code:', error);
    res.status(500).json({
      valid: false,
      error: 'Failed to validate promotion code'
    });
  }
});

module.exports = router;
