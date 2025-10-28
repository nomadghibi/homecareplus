-- ============================================================================
-- CARE CONNECT PRO - SAAS SUBSCRIPTION & MONETIZATION SYSTEM
-- ============================================================================
-- This schema implements platform monetization with:
-- - Subscription tiers (Free, Starter, Professional, Enterprise)
-- - Usage tracking and limits
-- - Billing and payment management
-- - Feature access control
-- - Add-on purchases
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTION PLANS (Platform pricing tiers)
-- ============================================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  tier_level INTEGER NOT NULL, -- 0=Free, 1=Starter, 2=Pro, 3=Enterprise
  monthly_price DECIMAL(10, 2) NOT NULL,
  annual_price DECIMAL(10, 2), -- Discounted annual price

  -- Usage Limits
  max_clients INTEGER, -- NULL = unlimited
  max_caregivers INTEGER,
  max_visits_per_month INTEGER,
  max_users INTEGER, -- Platform users/staff accounts
  max_storage_gb DECIMAL(10, 2),

  -- Feature Flags
  features JSONB NOT NULL DEFAULT '{}', -- Feature access map
  /*
  Example features JSON:
  {
    "evv": true,
    "billing": true,
    "advanced_reporting": false,
    "api_access": false,
    "white_label": false,
    "priority_support": false,
    "custom_integrations": false,
    "multi_location": false,
    "role_based_access": true,
    "audit_logs": true,
    "family_portal": true,
    "mobile_app": true,
    "automated_scheduling": false,
    "payroll_integration": false
  }
  */

  -- Billing Configuration
  trial_days INTEGER DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true, -- Show on pricing page
  setup_fee DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier_level);

-- ============================================================================
-- 2. ORGANIZATIONS/AGENCIES (Customer accounts)
-- ============================================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL, -- URL-friendly identifier

  -- Contact Info
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,

  -- Subscription Details
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  subscription_status VARCHAR(50) DEFAULT 'trial',
    -- 'trial', 'active', 'past_due', 'cancelled', 'suspended'
  trial_ends_at TIMESTAMP,
  subscription_start_date TIMESTAMP,
  subscription_end_date TIMESTAMP,

  -- Billing
  billing_email VARCHAR(255),
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
  next_billing_date TIMESTAMP,
  payment_method_id VARCHAR(255), -- Stripe/payment provider ID

  -- Usage Tracking
  current_client_count INTEGER DEFAULT 0,
  current_caregiver_count INTEGER DEFAULT 0,
  current_user_count INTEGER DEFAULT 0,
  current_storage_gb DECIMAL(10, 2) DEFAULT 0,

  -- Settings
  settings JSONB DEFAULT '{}',

  -- Status
  is_active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_plan ON organizations(subscription_plan_id);
CREATE INDEX idx_organizations_status ON organizations(subscription_status);

-- ============================================================================
-- 3. INVOICES (Billing history)
-- ============================================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),

  -- Amount Details
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Billing Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'paid', 'failed', 'refunded', 'void'
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,

  -- Payment Details
  payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'paypal'
  payment_provider_id VARCHAR(255), -- External payment ID

  -- Line Items
  line_items JSONB NOT NULL DEFAULT '[]',
  /*
  Example:
  [
    {
      "description": "Professional Plan - Monthly",
      "quantity": 1,
      "unit_price": 149.00,
      "amount": 149.00
    },
    {
      "description": "Additional Users (5)",
      "quantity": 5,
      "unit_price": 10.00,
      "amount": 50.00
    }
  ]
  */

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_organization ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ============================================================================
-- 4. PAYMENT TRANSACTIONS (Payment history)
-- ============================================================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),

  -- Transaction Details
  transaction_id VARCHAR(255) UNIQUE, -- External transaction ID
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(50) NOT NULL,
    -- 'pending', 'completed', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'credit_card', 'bank_transfer', 'paypal'

  -- Payment Provider
  provider VARCHAR(50), -- 'stripe', 'paypal', 'square'
  provider_transaction_id VARCHAR(255),
  provider_response JSONB,

  -- Metadata
  failure_reason TEXT,
  refund_reason TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_org ON payment_transactions(organization_id);
CREATE INDEX idx_payment_transactions_invoice ON payment_transactions(invoice_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- ============================================================================
-- 5. USAGE METRICS (Track platform usage)
-- ============================================================================
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage Counts
  total_clients INTEGER DEFAULT 0,
  total_caregivers INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_claims INTEGER DEFAULT 0,
  total_documents INTEGER DEFAULT 0,

  -- Storage
  storage_used_gb DECIMAL(10, 2) DEFAULT 0,

  -- Activity
  api_calls INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,

  -- Calculated Metrics
  billable_overage JSONB DEFAULT '{}',
  /*
  Example:
  {
    "extra_clients": 5,
    "extra_caregivers": 3,
    "extra_storage_gb": 2.5
  }
  */

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_metrics_org ON usage_metrics(organization_id);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- ============================================================================
-- 6. ADD-ONS (Extra features/capacity)
-- ============================================================================
CREATE TABLE subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Pricing
  addon_type VARCHAR(50) NOT NULL,
    -- 'per_unit', 'flat_fee', 'usage_based'
  unit_price DECIMAL(10, 2) NOT NULL,
  unit_name VARCHAR(50), -- 'user', 'client', 'GB', etc.

  -- Limits
  min_quantity INTEGER DEFAULT 1,
  max_quantity INTEGER,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. ORGANIZATION ADD-ONS (Purchased add-ons)
-- ============================================================================
CREATE TABLE organization_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES subscription_addons(id),

  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,

  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_org_addons_org ON organization_addons(organization_id);
CREATE INDEX idx_org_addons_addon ON organization_addons(addon_id);

-- ============================================================================
-- 8. SUBSCRIPTION HISTORY (Track plan changes)
-- ============================================================================
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Change Details
  previous_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  change_type VARCHAR(50) NOT NULL,
    -- 'upgrade', 'downgrade', 'cancelled', 'reactivated', 'trial_started'

  -- Billing Impact
  prorated_amount DECIMAL(10, 2),
  effective_date DATE NOT NULL,

  -- Metadata
  reason TEXT,
  changed_by UUID, -- Reference to user who made the change
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscription_history_org ON subscription_history(organization_id);
CREATE INDEX idx_subscription_history_date ON subscription_history(effective_date);

-- ============================================================================
-- SAMPLE DATA - SUBSCRIPTION PLANS
-- ============================================================================

-- Free Plan
INSERT INTO subscription_plans (
  id, name, display_name, description, tier_level,
  monthly_price, annual_price,
  max_clients, max_caregivers, max_visits_per_month, max_users, max_storage_gb,
  features, trial_days, is_public, sort_order
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'free',
  'Free Trial',
  'Perfect for trying out Care Connect Pro',
  0,
  0.00,
  0.00,
  10, 5, 50, 2, 1.0,
  '{
    "evv": false,
    "billing": true,
    "advanced_reporting": false,
    "api_access": false,
    "white_label": false,
    "priority_support": false,
    "custom_integrations": false,
    "multi_location": false,
    "role_based_access": false,
    "audit_logs": false,
    "family_portal": true,
    "mobile_app": false,
    "automated_scheduling": false,
    "payroll_integration": false
  }',
  14,
  true,
  1
);

-- Starter Plan
INSERT INTO subscription_plans (
  id, name, display_name, description, tier_level,
  monthly_price, annual_price,
  max_clients, max_caregivers, max_visits_per_month, max_users, max_storage_gb,
  features, trial_days, is_public, sort_order
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'starter',
  'Starter',
  'For small home care agencies getting started',
  1,
  99.00,
  990.00,
  50, 15, 500, 5, 10.0,
  '{
    "evv": true,
    "billing": true,
    "advanced_reporting": false,
    "api_access": false,
    "white_label": false,
    "priority_support": false,
    "custom_integrations": false,
    "multi_location": false,
    "role_based_access": true,
    "audit_logs": true,
    "family_portal": true,
    "mobile_app": true,
    "automated_scheduling": false,
    "payroll_integration": false
  }',
  14,
  true,
  2
);

-- Professional Plan
INSERT INTO subscription_plans (
  id, name, display_name, description, tier_level,
  monthly_price, annual_price,
  max_clients, max_caregivers, max_visits_per_month, max_users, max_storage_gb,
  features, trial_days, is_public, sort_order
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'professional',
  'Professional',
  'For growing agencies with advanced needs',
  2,
  299.00,
  2990.00,
  200, 50, 2000, 15, 50.0,
  '{
    "evv": true,
    "billing": true,
    "advanced_reporting": true,
    "api_access": true,
    "white_label": false,
    "priority_support": true,
    "custom_integrations": false,
    "multi_location": true,
    "role_based_access": true,
    "audit_logs": true,
    "family_portal": true,
    "mobile_app": true,
    "automated_scheduling": true,
    "payroll_integration": true
  }',
  14,
  true,
  3
);

-- Enterprise Plan
INSERT INTO subscription_plans (
  id, name, display_name, description, tier_level,
  monthly_price, annual_price,
  max_clients, max_caregivers, max_visits_per_month, max_users, max_storage_gb,
  features, trial_days, is_public, sort_order
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'enterprise',
  'Enterprise',
  'For large organizations with custom requirements',
  3,
  599.00,
  5990.00,
  NULL, NULL, NULL, NULL, NULL, -- Unlimited
  '{
    "evv": true,
    "billing": true,
    "advanced_reporting": true,
    "api_access": true,
    "white_label": true,
    "priority_support": true,
    "custom_integrations": true,
    "multi_location": true,
    "role_based_access": true,
    "audit_logs": true,
    "family_portal": true,
    "mobile_app": true,
    "automated_scheduling": true,
    "payroll_integration": true
  }',
  30,
  true,
  4
);

-- Add-ons
INSERT INTO subscription_addons (name, display_name, description, addon_type, unit_price, unit_name, min_quantity, max_quantity)
VALUES
  ('extra_user', 'Additional User', 'Add extra user accounts', 'per_unit', 15.00, 'user', 1, 100),
  ('extra_client', 'Additional Clients', 'Increase client capacity', 'per_unit', 2.00, 'client', 10, 1000),
  ('extra_storage', 'Additional Storage', 'Add extra storage space', 'per_unit', 5.00, 'GB', 10, 1000),
  ('priority_onboarding', 'Priority Onboarding', 'Dedicated onboarding specialist', 'flat_fee', 499.00, NULL, 1, 1),
  ('custom_training', 'Custom Training', 'Personalized training sessions', 'flat_fee', 299.00, 'session', 1, 20);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if organization has access to a feature
CREATE OR REPLACE FUNCTION has_feature_access(
  p_organization_id UUID,
  p_feature_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT (sp.features->p_feature_name)::boolean INTO v_has_access
  FROM organizations o
  JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = p_organization_id AND o.is_active = true;

  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql;

-- Check if organization is within usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_organization_id UUID,
  p_limit_type VARCHAR -- 'clients', 'caregivers', 'users', 'storage'
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count NUMERIC;
  v_max_limit NUMERIC;
BEGIN
  SELECT
    CASE p_limit_type
      WHEN 'clients' THEN o.current_client_count
      WHEN 'caregivers' THEN o.current_caregiver_count
      WHEN 'users' THEN o.current_user_count
      WHEN 'storage' THEN o.current_storage_gb
    END,
    CASE p_limit_type
      WHEN 'clients' THEN sp.max_clients
      WHEN 'caregivers' THEN sp.max_caregivers
      WHEN 'users' THEN sp.max_users
      WHEN 'storage' THEN sp.max_storage_gb
    END
  INTO v_current_count, v_max_limit
  FROM organizations o
  JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = p_organization_id;

  -- NULL limit means unlimited
  IF v_max_limit IS NULL THEN
    RETURN true;
  END IF;

  RETURN v_current_count < v_max_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active Subscriptions Summary
CREATE OR REPLACE VIEW v_active_subscriptions AS
SELECT
  o.id AS organization_id,
  o.name AS organization_name,
  sp.display_name AS plan_name,
  o.subscription_status,
  o.subscription_start_date,
  o.next_billing_date,
  sp.monthly_price,
  o.billing_cycle,
  o.current_client_count,
  sp.max_clients,
  o.current_caregiver_count,
  sp.max_caregivers
FROM organizations o
JOIN subscription_plans sp ON o.subscription_plan_id = sp.id
WHERE o.subscription_status IN ('trial', 'active');

-- Revenue Summary
CREATE OR REPLACE VIEW v_revenue_summary AS
SELECT
  DATE_TRUNC('month', i.period_start) AS month,
  COUNT(DISTINCT i.organization_id) AS paying_customers,
  SUM(i.total_amount) AS total_revenue,
  SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END) AS collected_revenue,
  SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END) AS pending_revenue
FROM invoices i
GROUP BY DATE_TRUNC('month', i.period_start)
ORDER BY month DESC;
