-- ============================================
-- CARE CONNECT PRO - SUBSCRIPTION & TRIAL MANAGEMENT
-- ============================================
-- This schema handles user subscriptions, trials, and resource limits

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Plan Information
    plan_name VARCHAR(50) NOT NULL DEFAULT 'starter', -- starter, professional, enterprise
    plan_status VARCHAR(50) NOT NULL DEFAULT 'trial', -- trial, active, past_due, canceled, expired

    -- Trial Information
    is_trial BOOLEAN NOT NULL DEFAULT true,
    trial_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

    -- Subscription Dates
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),

    -- Payment Information (for future Stripe integration)
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    payment_method_last4 VARCHAR(4),
    payment_method_brand VARCHAR(50),

    -- Resource Limits (based on plan)
    max_clients INTEGER NOT NULL DEFAULT 50,
    max_caregivers INTEGER NOT NULL DEFAULT 15,
    max_visits_per_month INTEGER NOT NULL DEFAULT 500,
    max_users INTEGER NOT NULL DEFAULT 5,
    max_storage_gb INTEGER NOT NULL DEFAULT 10,

    -- Usage Tracking
    current_clients INTEGER NOT NULL DEFAULT 0,
    current_caregivers INTEGER NOT NULL DEFAULT 0,
    current_visits_this_month INTEGER NOT NULL DEFAULT 0,
    current_users INTEGER NOT NULL DEFAULT 1,
    current_storage_gb DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    canceled_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_plan_name CHECK (plan_name IN ('starter', 'professional', 'enterprise')),
    CONSTRAINT valid_status CHECK (plan_status IN ('trial', 'active', 'past_due', 'canceled', 'expired'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(plan_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial ON public.subscriptions(is_trial);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policy (optional - for staff to manage subscriptions)
CREATE POLICY "Service role can manage all subscriptions"
    ON public.subscriptions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ORGANIZATION/AGENCY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,

    -- Organization Details
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100), -- 'home_care', 'home_health', 'hospice', etc.

    -- Contact Information
    primary_contact_name VARCHAR(255),
    primary_contact_email VARCHAR(255),
    primary_contact_phone VARCHAR(50),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Settings
    timezone VARCHAR(100) DEFAULT 'America/New_York',
    currency VARCHAR(10) DEFAULT 'USD',

    -- Onboarding
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    onboarding_step INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_organizations_user_id ON public.organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON public.organizations(subscription_id);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own organization"
    ON public.organizations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own organization"
    ON public.organizations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organization"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USAGE TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tracking Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Usage Metrics
    clients_created INTEGER NOT NULL DEFAULT 0,
    caregivers_created INTEGER NOT NULL DEFAULT 0,
    visits_created INTEGER NOT NULL DEFAULT 0,
    storage_used_gb DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_subscription ON public.usage_tracking(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
    ON public.usage_tracking FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create subscription on user signup
CREATE OR REPLACE FUNCTION public.create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
    -- Create starter plan trial subscription for new user
    INSERT INTO public.subscriptions (
        user_id,
        plan_name,
        plan_status,
        is_trial,
        trial_start_date,
        trial_end_date,
        current_period_start,
        current_period_end,
        max_clients,
        max_caregivers,
        max_visits_per_month,
        max_users,
        max_storage_gb
    ) VALUES (
        NEW.id,
        'starter',
        'trial',
        true,
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW() + INTERVAL '30 days',
        50,    -- Starter plan limits
        15,
        500,
        5,
        10
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create subscription on signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_trial_subscription();

-- Function to check if user has exceeded resource limits
CREATE OR REPLACE FUNCTION public.check_resource_limit(
    p_user_id UUID,
    p_resource_type VARCHAR,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
    v_subscription RECORD;
    v_current_count INTEGER;
    v_max_count INTEGER;
    v_allowed BOOLEAN := false;
BEGIN
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM public.subscriptions
    WHERE user_id = p_user_id
    AND plan_status IN ('trial', 'active')
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'No active subscription found'
        );
    END IF;

    -- Check if trial has expired
    IF v_subscription.is_trial AND v_subscription.trial_end_date < NOW() THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'reason', 'Trial period has expired',
            'trial_ended', true
        );
    END IF;

    -- Check resource limits based on type
    CASE p_resource_type
        WHEN 'clients' THEN
            v_current_count := v_subscription.current_clients;
            v_max_count := v_subscription.max_clients;
        WHEN 'caregivers' THEN
            v_current_count := v_subscription.current_caregivers;
            v_max_count := v_subscription.max_caregivers;
        WHEN 'visits' THEN
            v_current_count := v_subscription.current_visits_this_month;
            v_max_count := v_subscription.max_visits_per_month;
        WHEN 'users' THEN
            v_current_count := v_subscription.current_users;
            v_max_count := v_subscription.max_users;
        ELSE
            RETURN jsonb_build_object(
                'allowed', false,
                'reason', 'Invalid resource type'
            );
    END CASE;

    -- Check if adding increment would exceed limit
    v_allowed := (v_current_count + p_increment) <= v_max_count;

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'current', v_current_count,
        'max', v_max_count,
        'remaining', GREATEST(0, v_max_count - v_current_count),
        'plan', v_subscription.plan_name,
        'is_trial', v_subscription.is_trial,
        'trial_days_remaining', CASE
            WHEN v_subscription.is_trial
            THEN GREATEST(0, EXTRACT(DAY FROM (v_subscription.trial_end_date - NOW())))
            ELSE NULL
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment resource usage
CREATE OR REPLACE FUNCTION public.increment_resource_usage(
    p_user_id UUID,
    p_resource_type VARCHAR,
    p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated BOOLEAN := false;
BEGIN
    -- Increment the appropriate resource counter
    UPDATE public.subscriptions
    SET
        current_clients = CASE WHEN p_resource_type = 'clients' THEN current_clients + p_increment ELSE current_clients END,
        current_caregivers = CASE WHEN p_resource_type = 'caregivers' THEN current_caregivers + p_increment ELSE current_caregivers END,
        current_visits_this_month = CASE WHEN p_resource_type = 'visits' THEN current_visits_this_month + p_increment ELSE current_visits_this_month END,
        current_users = CASE WHEN p_resource_type = 'users' THEN current_users + p_increment ELSE current_users END,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND plan_status IN ('trial', 'active');

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly visit counter (run via cron job)
CREATE OR REPLACE FUNCTION public.reset_monthly_visit_counters()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.subscriptions
    SET
        current_visits_this_month = 0,
        updated_at = NOW()
    WHERE plan_status IN ('trial', 'active')
    AND current_period_end < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trial status (check for expired trials)
CREATE OR REPLACE FUNCTION public.update_expired_trials()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.subscriptions
    SET
        plan_status = 'expired',
        updated_at = NOW()
    WHERE is_trial = true
    AND plan_status = 'trial'
    AND trial_end_date < NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT ON public.usage_tracking TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.check_resource_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_resource_usage TO authenticated;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Note: In production, subscriptions are auto-created by trigger
-- This is just for reference

/*
-- Example: Manually create a subscription (usually auto-created)
INSERT INTO public.subscriptions (
    user_id,
    plan_name,
    plan_status,
    is_trial,
    trial_end_date
) VALUES (
    'user-uuid-here',
    'starter',
    'trial',
    true,
    NOW() + INTERVAL '30 days'
);
*/

-- ============================================
-- NOTES FOR PRODUCTION
-- ============================================

/*
1. Set up Supabase Database Functions as Cron Jobs:
   - reset_monthly_visit_counters() - Run on 1st of each month
   - update_expired_trials() - Run daily

2. Set up Edge Functions for:
   - Stripe webhook handling (payment success/failure)
   - Email notifications (trial expiring, limits reached)

3. Environment Variables needed:
   - VITE_USE_MOCK_MODE=false
   - VITE_SUPABASE_URL=your_supabase_url
   - VITE_SUPABASE_ANON_KEY=your_anon_key
   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx (for production)

4. Testing checklist:
   - [ ] New user signup creates subscription automatically
   - [ ] Resource limits are enforced
   - [ ] Trial expiration is tracked
   - [ ] Upgrade flow works
   - [ ] Payment integration (if using Stripe)
*/
