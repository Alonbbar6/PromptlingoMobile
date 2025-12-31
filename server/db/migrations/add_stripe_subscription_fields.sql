-- Migration: Add Stripe Subscription Fields
-- Adds additional fields needed for complete Stripe subscription management

-- Add Stripe subscription tracking columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Add comments for documentation
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, canceled, past_due, trialing, incomplete, incomplete_expired, unpaid';
COMMENT ON COLUMN users.subscription_start_date IS 'When the subscription started';
COMMENT ON COLUMN users.subscription_end_date IS 'When the subscription ends/ended';
COMMENT ON COLUMN users.subscription_cancel_at_period_end IS 'Whether subscription will cancel at end of billing period';
COMMENT ON COLUMN users.stripe_price_id IS 'Stripe price ID for the subscribed plan';

-- Display success message
SELECT 'Stripe subscription fields added successfully!' as message;