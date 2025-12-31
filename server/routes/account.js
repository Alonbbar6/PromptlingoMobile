const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateAccountDeletion } = require('../middleware/validation');
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * GET /api/auth/export-data
 * Export user data (GDPR Right to Data Portability)
 */
router.get('/export-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`📦 Exporting data for user: ${userId}`);

    // Fetch user data
    const userResult = await db.query(
      'SELECT id, email, name, created_at, subscription_tier FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Fetch translation history (if stored)
    const historyResult = await db.query(
      'SELECT * FROM translation_history WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Fetch usage data
    const usageResult = await db.query(
      'SELECT * FROM usage_records WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscription_tier: user.subscription_tier,
        account_created: user.created_at,
      },
      translation_history: historyResult.rows,
      usage_records: usageResult.rows,
      export_date: new Date().toISOString(),
    };

    console.log(`✅ Data exported successfully for user: ${userId}`);

    res.json(exportData);
  } catch (error) {
    console.error('❌ Data export failed:', error);
    res.status(500).json({ message: 'Failed to export data', error: error.message });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Delete user account (GDPR Right to Erasure)
 */
router.delete('/delete-account', authenticateToken, validateAccountDeletion, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    console.log(`🗑️  Account deletion requested for user: ${userId}`);

    // For Google OAuth users, we don't have passwords
    // We can either skip password verification or require re-authentication
    // For now, we'll allow deletion without password for OAuth users

    // Fetch user data
    const userResult = await db.query(
      'SELECT id, email, stripe_customer_id, subscription_tier FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    // Cancel Stripe subscription if exists
    if (user.stripe_customer_id) {
      try {
        console.log(`💳 Canceling Stripe subscription for customer: ${user.stripe_customer_id}`);

        // List all active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: 'active',
        });

        // Cancel all active subscriptions
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
          console.log(`✅ Canceled subscription: ${subscription.id}`);
        }
      } catch (stripeError) {
        console.error('⚠️  Stripe cancellation error:', stripeError);
        // Continue with deletion even if Stripe fails
      }
    }

    // Delete user data (cascade will handle related records)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    console.log(`✅ Account deleted successfully for user: ${userId}`);

    // Send deletion confirmation email (optional)
    // TODO: Implement email service

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('❌ Account deletion failed:', error);
    res.status(500).json({ message: 'Failed to delete account', error: error.message });
  }
});

module.exports = router;
