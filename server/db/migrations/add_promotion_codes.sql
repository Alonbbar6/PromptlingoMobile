-- Promotion Codes Migration
-- Adds support for promotional codes that grant unlimited usage for a specified period

-- Promotion Codes Table
-- Stores available promotion codes
CREATE TABLE IF NOT EXISTS promotion_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_redemptions INTEGER DEFAULT NULL, -- NULL means unlimited redemptions
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL -- NULL means code never expires
);

-- User Promotions Table
-- Tracks which users have redeemed which promotion codes
CREATE TABLE IF NOT EXISTS user_promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  promotion_code_id UUID NOT NULL REFERENCES promotion_codes(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, promotion_code_id) -- Prevent same user redeeming same code twice
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_promotion_codes_code ON promotion_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotion_codes_is_active ON promotion_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_user_promotions_user_id ON user_promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promotions_expires_at ON user_promotions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_promotions_active ON user_promotions(user_id, is_active, expires_at);

-- Comments for documentation
COMMENT ON TABLE promotion_codes IS 'Stores promotional codes that grant unlimited usage';
COMMENT ON TABLE user_promotions IS 'Tracks which users have redeemed promotional codes';
COMMENT ON COLUMN promotion_codes.duration_days IS 'How many days the promotion lasts after redemption';
COMMENT ON COLUMN promotion_codes.max_redemptions IS 'Maximum number of times this code can be redeemed (NULL = unlimited)';
COMMENT ON COLUMN user_promotions.is_active IS 'Whether this promotion is currently active for the user';

-- Insert a default promotion code for testing
INSERT INTO promotion_codes (code, description, duration_days, max_redemptions, is_active)
VALUES ('UNLIMITED30', 'Get unlimited translations for 30 days', 30, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;
