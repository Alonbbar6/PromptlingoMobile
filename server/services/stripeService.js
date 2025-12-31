/**
 * Stripe Service
 * Handles all Stripe payment and subscription operations
 */

const Stripe = require('stripe');
const { query } = require('../db/connection');

// Initialize Stripe with API key (conditional to prevent crashes)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('YOUR_SECRET_KEY')) {
  try {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error.message);
    console.warn('⚠️  Stripe features will be disabled');
  }
} else {
  console.warn('⚠️  STRIPE_SECRET_KEY not configured - Stripe features disabled');
  console.warn('   Set a valid Stripe key in your environment variables to enable payments');
}

// Stripe Price IDs (these will be created in Stripe Dashboard)
const STRIPE_PRICES = {
  ESSENTIAL_MONTHLY: process.env.STRIPE_PRICE_ID_ESSENTIAL_MONTHLY || 'price_essential_monthly',
  PRO_MONTHLY: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRICE_ID_PRO_YEARLY || 'price_pro_yearly',
};

/**
 * Check if Stripe is properly initialized
 * @throws {Error} If Stripe is not initialized
 */
function ensureStripeInitialized() {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
  }
}

/**
 * Create or retrieve a Stripe customer for a user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} name - User name
 * @returns {Promise<string>} Stripe customer ID
 */
async function getOrCreateCustomer(userId, email, name) {
  try {
    ensureStripeInitialized();

    // Check if user already has a Stripe customer ID
    const result = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows[0]?.stripe_customer_id) {
      console.log(`✅ Found existing Stripe customer: ${result.rows[0].stripe_customer_id}`);
      return result.rows[0].stripe_customer_id;
    }

    // Create new Stripe customer
    console.log(`📝 Creating new Stripe customer for user: ${email}`);
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Save Stripe customer ID to database
    await query(
      'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
      [customer.id, userId]
    );

    console.log(`✅ Created Stripe customer: ${customer.id}`);
    return customer.id;
  } catch (error) {
    console.error('❌ Error creating Stripe customer:', error);
    throw error;
  }
}

/**
 * Create a Stripe Checkout session for subscription
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} priceId - Stripe price ID
 * @param {string} successUrl - Success redirect URL
 * @param {string} cancelUrl - Cancel redirect URL
 * @returns {Promise<object>} Checkout session
 */
async function createCheckoutSession(userId, email, name, priceId, successUrl, cancelUrl) {
  try {
    ensureStripeInitialized();
    console.log(`🛒 Creating checkout session for user: ${email}`);

    // Get or create customer
    const customerId = await getOrCreateCustomer(userId, email, name);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    });

    console.log(`✅ Created checkout session: ${session.id}`);
    return session;
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a Stripe Billing Portal session for managing subscriptions
 * @param {string} userId - User ID
 * @param {string} returnUrl - Return URL after portal session
 * @returns {Promise<object>} Portal session
 */
async function createBillingPortalSession(userId, returnUrl) {
  try {
    ensureStripeInitialized();
    console.log(`🔧 Creating billing portal session for user: ${userId}`);

    // Get customer ID from database
    const result = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]?.stripe_customer_id) {
      throw new Error('No Stripe customer found for this user');
    }

    const customerId = result.rows[0].stripe_customer_id;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    console.log(`✅ Created billing portal session: ${session.id}`);
    return session;
  } catch (error) {
    console.error('❌ Error creating billing portal session:', error);
    throw error;
  }
}

/**
 * Handle successful subscription creation/update
 * @param {object} subscription - Stripe subscription object
 */
async function handleSubscriptionCreated(subscription) {
  try {
    const userId = subscription.metadata.userId;
    const customerId = subscription.customer;
    const priceId = subscription.items.data[0].price.id;

    console.log(`✅ Handling subscription created for user: ${userId}`);

    // Determine tier based on price ID
    let tier = 'free';
    if (priceId === STRIPE_PRICES.ESSENTIAL_MONTHLY) {
      tier = 'essential';
    } else if (priceId === STRIPE_PRICES.PRO_MONTHLY || priceId === STRIPE_PRICES.PRO_YEARLY) {
      tier = 'pro';
    }

    await query(
      `UPDATE users SET
        stripe_subscription_id = $1,
        subscription_tier = $2,
        subscription_status = $3,
        subscription_start_date = $4,
        subscription_end_date = $5,
        subscription_cancel_at_period_end = $6,
        stripe_price_id = $7
      WHERE id = $8 OR stripe_customer_id = $9`,
      [
        subscription.id,
        tier,
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        priceId,
        userId,
        customerId,
      ]
    );

    console.log(`✅ Updated user ${userId} to ${tier} tier`);
  } catch (error) {
    console.error('❌ Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle subscription updates
 * @param {object} subscription - Stripe subscription object
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const userId = subscription.metadata.userId;
    const customerId = subscription.customer;

    console.log(`🔄 Handling subscription updated for user: ${userId}`);

    await query(
      `UPDATE users SET
        subscription_status = $1,
        subscription_start_date = $2,
        subscription_end_date = $3,
        subscription_cancel_at_period_end = $4,
        stripe_price_id = $5
      WHERE id = $6 OR stripe_customer_id = $7`,
      [
        subscription.status,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000),
        subscription.cancel_at_period_end,
        subscription.items.data[0].price.id,
        userId,
        customerId,
      ]
    );

    console.log(`✅ Updated subscription for user ${userId}`);
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle subscription cancellation
 * @param {object} subscription - Stripe subscription object
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const userId = subscription.metadata.userId;
    const customerId = subscription.customer;

    console.log(`❌ Handling subscription deleted for user: ${userId}`);

    await query(
      `UPDATE users SET
        subscription_tier = 'free',
        subscription_status = 'canceled',
        subscription_end_date = $1
      WHERE id = $2 OR stripe_customer_id = $3`,
      [
        new Date(subscription.ended_at * 1000),
        userId,
        customerId,
      ]
    );

    console.log(`✅ Downgraded user ${userId} to free tier`);
  } catch (error) {
    console.error('❌ Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Get subscription status for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Subscription details
 */
async function getSubscriptionStatus(userId) {
  try {
    const result = await query(
      `SELECT
        subscription_tier,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        subscription_cancel_at_period_end,
        stripe_subscription_id,
        stripe_customer_id
      FROM users
      WHERE id = $1`,
      [userId]
    );

    if (!result.rows[0]) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    throw error;
  }
}

/**
 * Cancel a subscription at the end of the billing period
 * @param {string} userId - User ID
 * @returns {Promise<object>} Updated subscription
 */
async function cancelSubscription(userId) {
  try {
    ensureStripeInitialized();
    console.log(`🚫 Canceling subscription for user: ${userId}`);

    // Get subscription ID
    const result = await query(
      'SELECT stripe_subscription_id FROM users WHERE id = $1',
      [userId]
    );

    if (!result.rows[0]?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    const subscriptionId = result.rows[0].stripe_subscription_id;

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await query(
      'UPDATE users SET subscription_cancel_at_period_end = true WHERE id = $1',
      [userId]
    );

    console.log(`✅ Subscription will be canceled at end of period`);
    return subscription;
  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    throw error;
  }
}

module.exports = {
  stripe,
  STRIPE_PRICES,
  getOrCreateCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  getSubscriptionStatus,
  cancelSubscription,
};