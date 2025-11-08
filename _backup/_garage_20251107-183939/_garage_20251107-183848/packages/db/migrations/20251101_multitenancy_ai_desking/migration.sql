-- Enhanced Multitenancy & AI Desking Companion Migration
-- This migration adds comprehensive tenant customization and AI-powered counter-offer system

-- ═══════════════════════════════════════════════════════════════════════════════
-- TENANT SETTINGS - Store dealership-specific configuration
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "tenant_settings" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenant_id" TEXT NOT NULL UNIQUE REFERENCES "tenants"("id") ON DELETE CASCADE,

  -- Branding
  "logo_url" TEXT,
  "primary_color" TEXT DEFAULT '#0EA5E9', -- Brand color for UI theming
  "secondary_color" TEXT DEFAULT '#8B5CF6',
  "theme" TEXT DEFAULT 'light', -- light, dark, high-contrast, automotive

  -- Business Rules
  "min_profit_margin" DECIMAL(10,2) DEFAULT 1500.00, -- Minimum profit per deal
  "preferred_profit_margin" DECIMAL(10,2) DEFAULT 2500.00, -- Target profit per deal
  "max_discount_percent" DECIMAL(5,2) DEFAULT 10.00, -- Max discount allowed
  "aged_vehicle_threshold_days" INTEGER DEFAULT 50, -- When to consider vehicle "aged"
  "aged_vehicle_discount_strategy" TEXT DEFAULT 'price_reduction', -- price_reduction, trade_allowance, payment_reduction

  -- Lender Configuration
  "preferred_lenders" JSONB DEFAULT '[]'::jsonb, -- Array of lender IDs in priority order
  "default_apr_prime" DECIMAL(5,2) DEFAULT 5.90,
  "default_apr_subprime" DECIMAL(5,2) DEFAULT 12.90,
  "credit_score_prime_threshold" INTEGER DEFAULT 700,

  -- AI Configuration
  "ai_enabled" BOOLEAN DEFAULT true,
  "ai_aggressiveness" TEXT DEFAULT 'balanced', -- conservative, balanced, aggressive
  "ai_use_historical_data" BOOLEAN DEFAULT true,
  "ai_min_confidence_threshold" DECIMAL(3,2) DEFAULT 0.70, -- Minimum AI confidence to show suggestions

  -- Compliance & Features
  "require_manager_approval_over" DECIMAL(10,2) DEFAULT 5000.00, -- Require approval for discounts over this amount
  "enable_sms_notifications" BOOLEAN DEFAULT true,
  "enable_email_notifications" BOOLEAN DEFAULT true,
  "timezone" TEXT DEFAULT 'America/New_York',
  "business_hours" JSONB DEFAULT '{"mon": {"open": "09:00", "close": "18:00"}}'::jsonb,

  -- Metadata
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "tenant_settings_tenant_id_idx" ON "tenant_settings"("tenant_id");

-- ═══════════════════════════════════════════════════════════════════════════════
-- AI COUNTER OFFERS - Store AI-generated counter-offers for deals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "ai_counter_offers" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tenant_id" TEXT NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "deal_id" TEXT NOT NULL REFERENCES "deals"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE, -- Salesperson who requested

  -- Original Customer Offer
  "customer_payment" DECIMAL(10,2) NOT NULL,
  "customer_down_payment" DECIMAL(10,2) NOT NULL,
  "customer_term_months" INTEGER NOT NULL,
  "customer_apr" DECIMAL(5,2),

  -- Vehicle & Trade Context
  "vehicle_cost" DECIMAL(10,2) NOT NULL, -- Dealer invoice cost
  "vehicle_msrp" DECIMAL(10,2) NOT NULL,
  "vehicle_days_on_lot" INTEGER NOT NULL,
  "trade_in_value" DECIMAL(10,2) DEFAULT 0.00,
  "trade_in_payoff" DECIMAL(10,2) DEFAULT 0.00,

  -- Customer Context
  "customer_credit_score" INTEGER,
  "customer_debt_to_income" DECIMAL(5,2),

  -- AI Analysis
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processed_at" TIMESTAMPTZ(6),
  "model_version" TEXT DEFAULT 'v1.0',
  "confidence_score" DECIMAL(3,2), -- 0.00 to 1.00
  "processing_time_ms" INTEGER,

  -- AI-Generated Counter Options (stored as JSONB array)
  "counter_options" JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [
  --   {
  --     "label": "Max Profit",
  --     "payment": 475.00,
  --     "down_payment": 4500.00,
  --     "term_months": 60,
  --     "apr": 5.9,
  --     "profit": 1800.00,
  --     "close_probability": 0.60,
  --     "talking_points": ["Payment stays close to what you want", "Just need more down for taxes"],
  --     "strategy": "maximize_profit"
  --   },
  --   ...
  -- ]

  -- Selection & Outcome
  "selected_option_index" INTEGER, -- Which option salesperson chose (0-based)
  "selected_at" TIMESTAMPTZ(6),
  "outcome" TEXT, -- won, lost, pending, abandoned
  "outcome_recorded_at" TIMESTAMPTZ(6),
  "actual_profit" DECIMAL(10,2), -- Actual profit if deal closed

  -- Feedback for ML training
  "feedback_helpful" BOOLEAN,
  "feedback_comment" TEXT,
  "feedback_submitted_at" TIMESTAMPTZ(6),

  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ai_counter_offers_tenant_id_idx" ON "ai_counter_offers"("tenant_id");
CREATE INDEX "ai_counter_offers_deal_id_idx" ON "ai_counter_offers"("deal_id");
CREATE INDEX "ai_counter_offers_user_id_idx" ON "ai_counter_offers"("user_id");
CREATE INDEX "ai_counter_offers_requested_at_idx" ON "ai_counter_offers"("requested_at" DESC);
CREATE INDEX "ai_counter_offers_outcome_idx" ON "ai_counter_offers"("outcome") WHERE "outcome" IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on tenant_settings
ALTER TABLE "tenant_settings" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see settings for their tenant
CREATE POLICY "tenant_settings_tenant_isolation" ON "tenant_settings"
  FOR ALL
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE)::TEXT);

-- Enable RLS on ai_counter_offers
ALTER TABLE "ai_counter_offers" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see counter offers for their tenant
CREATE POLICY "ai_counter_offers_tenant_isolation" ON "ai_counter_offers"
  FOR ALL
  USING ("tenant_id" = current_setting('app.current_tenant_id', TRUE)::TEXT);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-update updated_at timestamp
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenant_settings_updated_at
  BEFORE UPDATE ON "tenant_settings"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_counter_offers_updated_at
  BEFORE UPDATE ON "ai_counter_offers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DEFAULT SETTINGS FOR EXISTING TENANTS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO "tenant_settings" ("tenant_id")
SELECT "id" FROM "tenants"
ON CONFLICT ("tenant_id") DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE "tenant_settings" IS 'Dealership-specific configuration for branding, business rules, and AI behavior';
COMMENT ON TABLE "ai_counter_offers" IS 'AI-generated counter-offers with multiple strategic options and outcome tracking';

COMMENT ON COLUMN "tenant_settings"."min_profit_margin" IS 'Minimum acceptable profit per deal (hard floor)';
COMMENT ON COLUMN "tenant_settings"."preferred_profit_margin" IS 'Target profit margin for optimal deals';
COMMENT ON COLUMN "tenant_settings"."ai_aggressiveness" IS 'Controls AI counter-offer strategy: conservative (safer), balanced, aggressive (max profit)';
COMMENT ON COLUMN "ai_counter_offers"."counter_options" IS 'Array of AI-generated counter-offer strategies with close probability predictions';
COMMENT ON COLUMN "ai_counter_offers"."confidence_score" IS 'AI model confidence in predictions (0.0 to 1.0)';
