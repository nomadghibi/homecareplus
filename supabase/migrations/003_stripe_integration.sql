-- ============================================================================
-- CARE CONNECT PRO - STRIPE INTEGRATION
-- ============================================================================
-- This migration sets up Stripe payment integration for subscription management
--
-- Features:
-- 1. Stripe customer and subscription linking
-- 2. Webhook event processing
-- 3. Payment method management
-- 4. Subscription lifecycle handling
-- 5. Invoice and payment tracking
-- ============================================================================

-- ============================================================================
-- PART 1: ENHANCE ORGANIZATIONS TABLE FOR STRIPE
-- ============================================================================

-- Add Stripe-specific columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_payment_method_id VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_setup_intent_id VARCHAR(255);

-- Indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription ON organizations(stripe_subscription_id);

-- ============================================================================
-- PART 2: STRIPE WEBHOOK EVENTS LOG
-- ============================================================================

-- Table to log all Stripe webhook events (for debugging and replay)
CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Stripe Event Details
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- e.g., 'customer.subscription.updated'
  api_version VARCHAR(50),

  -- Payload
  event_data JSONB NOT NULL, -- Full webhook payload
  livemode BOOLEAN DEFAULT false,

  -- Processing Status
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stripe_webhook_events_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_stripe_webhook_events_created ON stripe_webhook_events(created_at DESC);

-- No RLS needed - this is system-level data processed by Edge Functions

-- ============================================================================
-- PART 3: STRIPE PRICES (Sync Stripe prices with subscription plans)
-- ============================================================================

-- Link Stripe price IDs to our subscription plans
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_monthly VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id_annual VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_monthly ON subscription_plans(stripe_price_id_monthly);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_annual ON subscription_plans(stripe_price_id_annual);

-- ============================================================================
-- PART 4: PAYMENT METHOD STORAGE
-- ============================================================================

-- Table to store payment method details (last4, brand, etc.)
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe Details
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,

  -- Card Details (for display only)
  type VARCHAR(20) CHECK (type IN ('card', 'bank_account', 'sepa_debit')),
  card_brand VARCHAR(50), -- 'visa', 'mastercard', etc.
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  card_funding VARCHAR(20), -- 'credit', 'debit', 'prepaid'

  -- Bank Account Details (if applicable)
  bank_name VARCHAR(255),
  bank_last4 VARCHAR(4),

  -- Status
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_organization ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(organization_id, is_default) WHERE is_default = true;

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payment methods in their organization" ON payment_methods
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage payment methods" ON payment_methods
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PART 5: ENHANCE INVOICES TABLE
-- ============================================================================

-- Link invoices to Stripe
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255) UNIQUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice ON invoices(stripe_invoice_id);

-- ============================================================================
-- PART 6: ENHANCE PAYMENT TRANSACTIONS TABLE
-- ============================================================================

-- Add Stripe charge/payment intent ID
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS stripe_charge_id VARCHAR(255);
ALTER TABLE payment_transactions ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_charge ON payment_transactions(stripe_charge_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id);

-- ============================================================================
-- PART 7: SUBSCRIPTION EVENTS TABLE
-- ============================================================================

-- Track all subscription lifecycle events
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event Details
  event_type VARCHAR(100) NOT NULL,
    -- 'trial_started', 'trial_ending_soon', 'trial_ended', 'subscription_created',
    -- 'subscription_updated', 'subscription_cancelled', 'subscription_renewed',
    -- 'payment_succeeded', 'payment_failed', 'plan_upgraded', 'plan_downgraded'

  -- Previous & New State (for changes)
  previous_state JSONB,
  new_state JSONB,

  -- Stripe Reference
  stripe_event_id VARCHAR(255),

  -- Notification Status
  email_sent BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_organization ON subscription_events(organization_id);
CREATE INDEX idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX idx_subscription_events_created ON subscription_events(created_at DESC);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view subscription events in their organization" ON subscription_events
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- PART 8: WEBHOOK PROCESSING FUNCTIONS
-- ============================================================================

-- Function to process customer.subscription.created
CREATE OR REPLACE FUNCTION process_subscription_created(
  p_stripe_event_id VARCHAR,
  p_subscription_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id VARCHAR;
  v_subscription_id VARCHAR;
  v_org_id UUID;
  v_plan_id UUID;
  v_status VARCHAR;
BEGIN
  v_customer_id := p_subscription_data->>'customer';
  v_subscription_id := p_subscription_data->>'id';
  v_status := p_subscription_data->>'status';

  -- Find organization by Stripe customer ID
  SELECT id INTO v_org_id
  FROM organizations
  WHERE stripe_customer_id = v_customer_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found for Stripe customer: %', v_customer_id;
  END IF;

  -- Find subscription plan by Stripe price ID
  SELECT sp.id INTO v_plan_id
  FROM subscription_plans sp
  WHERE sp.stripe_price_id_monthly = (p_subscription_data->'items'->'data'->0->'price'->>'id')
     OR sp.stripe_price_id_annual = (p_subscription_data->'items'->'data'->0->'price'->>'id');

  -- Update organization
  UPDATE organizations SET
    stripe_subscription_id = v_subscription_id,
    subscription_plan_id = COALESCE(v_plan_id, subscription_plan_id),
    subscription_status = CASE v_status
      WHEN 'active' THEN 'active'
      WHEN 'trialing' THEN 'trial'
      WHEN 'past_due' THEN 'past_due'
      WHEN 'canceled' THEN 'cancelled'
      ELSE subscription_status
    END,
    subscription_start_date = TO_TIMESTAMP((p_subscription_data->>'current_period_start')::INTEGER),
    subscription_end_date = TO_TIMESTAMP((p_subscription_data->>'current_period_end')::INTEGER),
    next_billing_date = TO_TIMESTAMP((p_subscription_data->>'current_period_end')::INTEGER),
    updated_at = NOW()
  WHERE id = v_org_id;

  -- Log event
  INSERT INTO subscription_events (organization_id, event_type, new_state, stripe_event_id)
  VALUES (v_org_id, 'subscription_created', p_subscription_data, p_stripe_event_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process customer.subscription.updated
CREATE OR REPLACE FUNCTION process_subscription_updated(
  p_stripe_event_id VARCHAR,
  p_subscription_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id VARCHAR;
  v_subscription_id VARCHAR;
  v_org_id UUID;
  v_plan_id UUID;
  v_status VARCHAR;
  v_old_status VARCHAR;
BEGIN
  v_customer_id := p_subscription_data->>'customer';
  v_subscription_id := p_subscription_data->>'id';
  v_status := p_subscription_data->>'status';

  -- Find organization
  SELECT id, subscription_status INTO v_org_id, v_old_status
  FROM organizations
  WHERE stripe_subscription_id = v_subscription_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Organization not found for Stripe subscription: %', v_subscription_id;
  END IF;

  -- Find subscription plan
  SELECT sp.id INTO v_plan_id
  FROM subscription_plans sp
  WHERE sp.stripe_price_id_monthly = (p_subscription_data->'items'->'data'->0->'price'->>'id')
     OR sp.stripe_price_id_annual = (p_subscription_data->'items'->'data'->0->'price'->>'id');

  -- Update organization
  UPDATE organizations SET
    subscription_plan_id = COALESCE(v_plan_id, subscription_plan_id),
    subscription_status = CASE v_status
      WHEN 'active' THEN 'active'
      WHEN 'trialing' THEN 'trial'
      WHEN 'past_due' THEN 'past_due'
      WHEN 'canceled' THEN 'cancelled'
      ELSE subscription_status
    END,
    subscription_end_date = TO_TIMESTAMP((p_subscription_data->>'current_period_end')::INTEGER),
    next_billing_date = TO_TIMESTAMP((p_subscription_data->>'current_period_end')::INTEGER),
    updated_at = NOW()
  WHERE id = v_org_id;

  -- Determine event type
  DECLARE
    v_event_type VARCHAR;
  BEGIN
    IF v_plan_id IS NOT NULL AND v_plan_id != (SELECT subscription_plan_id FROM organizations WHERE id = v_org_id) THEN
      v_event_type := 'plan_changed';
    ELSIF v_status = 'canceled' AND v_old_status != 'canceled' THEN
      v_event_type := 'subscription_cancelled';
    ELSE
      v_event_type := 'subscription_updated';
    END IF;

    -- Log event
    INSERT INTO subscription_events (organization_id, event_type, new_state, stripe_event_id)
    VALUES (v_org_id, v_event_type, p_subscription_data, p_stripe_event_id);
  END;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process customer.subscription.deleted
CREATE OR REPLACE FUNCTION process_subscription_deleted(
  p_stripe_event_id VARCHAR,
  p_subscription_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_id VARCHAR;
  v_org_id UUID;
BEGIN
  v_subscription_id := p_subscription_data->>'id';

  -- Find organization
  SELECT id INTO v_org_id
  FROM organizations
  WHERE stripe_subscription_id = v_subscription_id;

  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update organization status
  UPDATE organizations SET
    subscription_status = 'cancelled',
    subscription_end_date = NOW(),
    updated_at = NOW()
  WHERE id = v_org_id;

  -- Log event
  INSERT INTO subscription_events (organization_id, event_type, new_state, stripe_event_id)
  VALUES (v_org_id, 'subscription_cancelled', p_subscription_data, p_stripe_event_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process invoice.payment_succeeded
CREATE OR REPLACE FUNCTION process_invoice_payment_succeeded(
  p_stripe_event_id VARCHAR,
  p_invoice_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id VARCHAR;
  v_org_id UUID;
  v_invoice_id VARCHAR;
  v_amount DECIMAL;
  v_subscription_id VARCHAR;
BEGIN
  v_customer_id := p_invoice_data->>'customer';
  v_invoice_id := p_invoice_data->>'id';
  v_amount := (p_invoice_data->>'amount_paid')::DECIMAL / 100; -- Convert from cents
  v_subscription_id := p_invoice_data->>'subscription';

  -- Find organization
  SELECT id INTO v_org_id
  FROM organizations
  WHERE stripe_customer_id = v_customer_id;

  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Create/update invoice record
  INSERT INTO invoices (
    organization_id,
    invoice_number,
    stripe_invoice_id,
    status,
    total_amount,
    subtotal,
    period_start,
    period_end,
    due_date,
    paid_date,
    hosted_invoice_url,
    invoice_pdf_url,
    payment_provider_id
  ) VALUES (
    v_org_id,
    p_invoice_data->>'number',
    v_invoice_id,
    'paid',
    v_amount,
    v_amount,
    TO_TIMESTAMP((p_invoice_data->>'period_start')::INTEGER),
    TO_TIMESTAMP((p_invoice_data->>'period_end')::INTEGER),
    TO_TIMESTAMP((p_invoice_data->>'due_date')::INTEGER),
    TO_TIMESTAMP((p_invoice_data->>'status_transitions'->'paid_at')::INTEGER),
    p_invoice_data->>'hosted_invoice_url',
    p_invoice_data->>'invoice_pdf',
    v_invoice_id
  )
  ON CONFLICT (stripe_invoice_id) DO UPDATE SET
    status = 'paid',
    paid_date = TO_TIMESTAMP((p_invoice_data->>'status_transitions'->'paid_at')::INTEGER),
    hosted_invoice_url = p_invoice_data->>'hosted_invoice_url',
    invoice_pdf_url = p_invoice_data->>'invoice_pdf';

  -- Create payment transaction
  INSERT INTO payment_transactions (
    organization_id,
    amount,
    status,
    provider,
    provider_transaction_id,
    provider_response,
    processed_at
  ) VALUES (
    v_org_id,
    v_amount,
    'completed',
    'stripe',
    p_invoice_data->>'payment_intent',
    p_invoice_data,
    NOW()
  );

  -- Log event
  INSERT INTO subscription_events (organization_id, event_type, new_state, stripe_event_id)
  VALUES (v_org_id, 'payment_succeeded', p_invoice_data, p_stripe_event_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process invoice.payment_failed
CREATE OR REPLACE FUNCTION process_invoice_payment_failed(
  p_stripe_event_id VARCHAR,
  p_invoice_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id VARCHAR;
  v_org_id UUID;
BEGIN
  v_customer_id := p_invoice_data->>'customer';

  -- Find organization
  SELECT id INTO v_org_id
  FROM organizations
  WHERE stripe_customer_id = v_customer_id;

  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Update organization status to past_due
  UPDATE organizations SET
    subscription_status = 'past_due',
    updated_at = NOW()
  WHERE id = v_org_id;

  -- Log event
  INSERT INTO subscription_events (organization_id, event_type, new_state, stripe_event_id)
  VALUES (v_org_id, 'payment_failed', p_invoice_data, p_stripe_event_id);

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 9: TRIGGER FOR PAYMENT METHOD UPDATE
-- ============================================================================

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 10: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON stripe_webhook_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payment_methods TO authenticated;
GRANT SELECT ON subscription_events TO authenticated;

GRANT EXECUTE ON FUNCTION process_subscription_created TO service_role;
GRANT EXECUTE ON FUNCTION process_subscription_updated TO service_role;
GRANT EXECUTE ON FUNCTION process_subscription_deleted TO service_role;
GRANT EXECUTE ON FUNCTION process_invoice_payment_succeeded TO service_role;
GRANT EXECUTE ON FUNCTION process_invoice_payment_failed TO service_role;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Stripe integration migration completed successfully!';
  RAISE NOTICE 'Tables created/updated:';
  RAISE NOTICE '  ✓ stripe_webhook_events - Log all webhook events';
  RAISE NOTICE '  ✓ payment_methods - Store payment method details';
  RAISE NOTICE '  ✓ subscription_events - Track subscription lifecycle';
  RAISE NOTICE '  ✓ organizations - Added Stripe customer/subscription IDs';
  RAISE NOTICE '  ✓ invoices - Added Stripe invoice links';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Create Stripe Edge Function for webhook handling';
  RAISE NOTICE '  2. Set up Stripe products and prices';
  RAISE NOTICE '  3. Configure Stripe webhook endpoint URL';
  RAISE NOTICE '  4. Update frontend checkout flow';
  RAISE NOTICE '  5. Test subscription lifecycle end-to-end';
END $$;
