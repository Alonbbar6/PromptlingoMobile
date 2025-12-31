-- Migration: Add Usage Tracking to Users Table
-- Run this to add subscription and usage tracking columns

-- Add subscription and usage tracking columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Create index for faster subscription tier queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Add comments
COMMENT ON COLUMN users.subscription_tier IS 'User subscription level: free, pro';
COMMENT ON COLUMN users.api_calls_this_month IS 'Count of API calls made this month';
COMMENT ON COLUMN users.monthly_reset_date IS 'Date when monthly API call counter resets';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for payment processing';

-- Display success message
SELECT 'Usage tracking columns added successfully!' as message;