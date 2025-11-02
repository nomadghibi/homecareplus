-- ============================================================================
-- PARTIAL SUBSCRIPTION SCHEMA - Only Missing Tables
-- ============================================================================
-- This creates ONLY the subscription_plans and related tables
-- since you already have organizations from the trial schema
-- ============================================================================

-- ============================================================================
-- 1. SUBSCRIPTION PLANS (Platform pricing tiers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
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

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON public.subscription_plans(tier_level);

-- ============================================================================
-- 2. UPDATE ORGANIZATIONS TABLE (Add missing columns)
-- ============================================================================

-- Add subscription_plan_id reference to existing organizations table
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS subscription_plan_id UUID REFERENCES public.subscription_plans(id);

-- Add other subscription-related columns if they don't exist
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255);

-- Add usage tracking columns
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS current_client_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_caregiver_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_user_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_storage_gb DECIMAL(10, 2) DEFAULT 0;

-- Add index
CREATE INDEX IF NOT EXISTS idx_organizations_plan ON public.organizations(subscription_plan_id);

-- ============================================================================
-- 3. INVOICES (if not exists)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id),

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
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,

  -- Payment Details
  payment_method VARCHAR(50),
  payment_provider_id VARCHAR(255),

  -- Line Items
  line_items JSONB NOT NULL DEFAULT '[]',

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_organization ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- ============================================================================
-- 4. PAYMENT TRANSACTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id),

  -- Transaction Details
  transaction_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),

  -- Payment Provider
  provider VARCHAR(50),
  provider_transaction_id VARCHAR(255),
  provider_response JSONB,

  -- Metadata
  failure_reason TEXT,
  refund_reason TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_org ON public.payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice ON public.payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);

-- ============================================================================
-- 5. USAGE METRICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

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

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_org ON public.usage_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON public.usage_metrics(period_start, period_end);

-- ============================================================================
-- 6. SUBSCRIPTION HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Change Details
  previous_plan_id UUID REFERENCES public.subscription_plans(id),
  new_plan_id UUID REFERENCES public.subscription_plans(id),
  change_type VARCHAR(50) NOT NULL,

  -- Billing Impact
  prorated_amount DECIMAL(10, 2),
  effective_date DATE NOT NULL,

  -- Metadata
  reason TEXT,
  changed_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_org ON public.subscription_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_date ON public.subscription_history(effective_date);

-- ============================================================================
-- 7. INSERT SAMPLE SUBSCRIPTION PLANS
-- ============================================================================

-- Free Plan
INSERT INTO public.subscription_plans (
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
) ON CONFLICT (id) DO NOTHING;

-- Starter Plan
INSERT INTO public.subscription_plans (
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
) ON CONFLICT (id) DO NOTHING;

-- Professional Plan
INSERT INTO public.subscription_plans (
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
) ON CONFLICT (id) DO NOTHING;

-- Enterprise Plan
INSERT INTO public.subscription_plans (
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
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Check if organization has access to a feature
CREATE OR REPLACE FUNCTION public.has_feature_access(
  p_organization_id UUID,
  p_feature_name VARCHAR
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT (sp.features->p_feature_name)::boolean INTO v_has_access
  FROM public.organizations o
  JOIN public.subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = p_organization_id AND o.is_active = true;

  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if organization is within usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
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
  FROM public.organizations o
  JOIN public.subscription_plans sp ON o.subscription_plan_id = sp.id
  WHERE o.id = p_organization_id;

  -- NULL limit means unlimited
  IF v_max_limit IS NULL THEN
    RETURN true;
  END IF;

  RETURN v_current_count < v_max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✓ Subscription plans table created';
  RAISE NOTICE '✓ Organizations table updated with subscription columns';
  RAISE NOTICE '✓ Invoices, payment_transactions, usage_metrics tables created';
  RAISE NOTICE '✓ 4 subscription plans inserted (Free, Starter, Professional, Enterprise)';
  RAISE NOTICE '✓ Helper functions created (has_feature_access, check_usage_limit)';
  RAISE NOTICE '';
  RAISE NOTICE 'Now you can run migration 003 successfully!';
END $$;
