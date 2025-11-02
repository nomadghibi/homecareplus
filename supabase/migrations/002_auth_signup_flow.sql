-- ============================================================================
-- CARE CONNECT PRO - AUTHENTICATION & SIGNUP FLOW
-- ============================================================================
-- This migration implements automatic organization creation and user profile
-- setup when users sign up through Supabase Auth
--
-- Features:
-- 1. Auto-create organization on first signup
-- 2. Auto-create user profile with owner role
-- 3. Auto-create trial subscription
-- 4. Handle MFA setup
-- 5. Email verification workflow
-- ============================================================================

-- ============================================================================
-- PART 1: AUTOMATIC ORGANIZATION & PROFILE CREATION ON SIGNUP
-- ============================================================================

-- Function to create organization and user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  v_organization_id UUID;
  v_organization_name TEXT;
  v_organization_slug TEXT;
  v_subscription_plan_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Extract metadata from user signup
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  v_organization_name := NEW.raw_user_meta_data->>'organization_name';
  v_organization_slug := NEW.raw_user_meta_data->>'organization_slug';

  -- If no organization metadata, this might be an invitation acceptance
  -- In that case, the profile will be created by invitation trigger
  IF v_organization_name IS NULL THEN
    -- Check if there's a pending invitation for this email
    IF EXISTS (
      SELECT 1 FROM user_invitations
      WHERE email = NEW.email
        AND status = 'pending'
        AND expires_at > NOW()
    ) THEN
      -- Will be handled by invitation acceptance flow
      RETURN NEW;
    ELSE
      -- No org name and no invitation - set default
      v_organization_name := COALESCE(v_first_name || '''s Organization', 'My Organization');
      v_organization_slug := LOWER(REPLACE(v_organization_name, ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
  END IF;

  -- Generate slug if not provided
  IF v_organization_slug IS NULL THEN
    v_organization_slug := LOWER(REPLACE(v_organization_name, ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;

  -- Get the starter plan ID (or free trial plan)
  SELECT id INTO v_subscription_plan_id
  FROM subscription_plans
  WHERE name = 'starter' OR tier_level = 1
  ORDER BY tier_level ASC
  LIMIT 1;

  -- Create organization
  INSERT INTO organizations (
    name,
    slug,
    email,
    subscription_plan_id,
    subscription_status,
    trial_ends_at,
    subscription_start_date,
    billing_cycle,
    is_active,
    onboarding_completed
  ) VALUES (
    v_organization_name,
    v_organization_slug,
    NEW.email,
    v_subscription_plan_id,
    'trial',
    NOW() + INTERVAL '30 days',
    NOW(),
    'monthly',
    true,
    false
  )
  RETURNING id INTO v_organization_id;

  -- Create user profile as primary owner
  INSERT INTO user_profiles (
    user_id,
    organization_id,
    first_name,
    last_name,
    display_name,
    role,
    status,
    is_primary_owner
  ) VALUES (
    NEW.id,
    v_organization_id,
    v_first_name,
    v_last_name,
    COALESCE(v_first_name || ' ' || v_last_name, NEW.email),
    'owner',
    'active',
    true
  );

  -- Log the signup in audit logs
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    entity_name,
    changes
  ) VALUES (
    v_organization_id,
    NEW.id,
    COALESCE(v_first_name || ' ' || v_last_name, NEW.email),
    'SIGNUP',
    'organization',
    v_organization_id,
    v_organization_name,
    jsonb_build_object(
      'email', NEW.email,
      'organization', v_organization_name,
      'plan', 'trial',
      'trial_ends_at', NOW() + INTERVAL '30 days'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_org_profile ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created_org_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

-- ============================================================================
-- PART 2: UPDATE LAST LOGIN
-- ============================================================================

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login_at = NOW()
  WHERE user_id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users last_sign_in_at update
DROP TRIGGER IF EXISTS on_user_login ON auth.users;

CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_user_last_login();

-- ============================================================================
-- PART 3: MFA SETUP (Prepare tables for future MFA)
-- ============================================================================

-- Table to track MFA methods
CREATE TABLE IF NOT EXISTS user_mfa_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- MFA Method
  method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms', 'email')),
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,

  -- TOTP Secret (encrypted)
  totp_secret TEXT,

  -- Phone for SMS
  phone_number VARCHAR(20),

  -- Backup codes
  backup_codes TEXT[],

  -- Status
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, method)
);

-- Indexes
CREATE INDEX idx_user_mfa_methods_user ON user_mfa_methods(user_id);
CREATE INDEX idx_user_mfa_methods_enabled ON user_mfa_methods(enabled);

-- Enable RLS
ALTER TABLE user_mfa_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own MFA methods" ON user_mfa_methods
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- PART 4: EMAIL VERIFICATION TRACKING
-- ============================================================================

-- Function to track email verification
CREATE OR REPLACE FUNCTION track_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- If email was just confirmed, update user profile
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Log verification in audit logs
    INSERT INTO audit_logs (
      organization_id,
      user_id,
      user_name,
      action,
      entity_type,
      entity_id,
      changes
    )
    SELECT
      up.organization_id,
      NEW.id,
      up.display_name,
      'EMAIL_VERIFIED',
      'user',
      NEW.id,
      jsonb_build_object('email', NEW.email, 'verified_at', NEW.email_confirmed_at)
    FROM user_profiles up
    WHERE up.user_id = NEW.id
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_email_verified ON auth.users;

CREATE TRIGGER on_email_verified
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION track_email_verification();

-- ============================================================================
-- PART 5: PASSWORD RESET TRACKING
-- ============================================================================

-- Table to track password resets for security
CREATE TABLE IF NOT EXISTS password_reset_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) CHECK (status IN ('requested', 'completed', 'expired')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_password_reset_log_user ON password_reset_log(user_id);
CREATE INDEX idx_password_reset_log_status ON password_reset_log(status);

-- Enable RLS
ALTER TABLE password_reset_log ENABLE ROW LEVEL SECURITY;

-- Admins can view password reset logs for security
CREATE POLICY "Admins can view password reset logs" ON password_reset_log
  FOR SELECT USING (
    user_has_any_role(ARRAY['owner', 'admin'])
  );

-- ============================================================================
-- PART 6: SESSION MANAGEMENT
-- ============================================================================

-- Table to track active sessions (for future session management)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Session Info
  session_token TEXT,
  device_info JSONB, -- Browser, OS, device type
  ip_address VARCHAR(45),
  location JSONB, -- City, country from IP

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON user_sessions
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- PART 7: HELPER FUNCTIONS FOR AUTHENTICATION
-- ============================================================================

-- Function to get current user's full profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', up.id,
    'user_id', up.user_id,
    'organization_id', up.organization_id,
    'organization_name', o.name,
    'organization_slug', o.slug,
    'first_name', up.first_name,
    'last_name', up.last_name,
    'display_name', up.display_name,
    'email', au.email,
    'avatar_url', up.avatar_url,
    'phone', up.phone,
    'role', up.role,
    'permissions', up.permissions,
    'status', up.status,
    'is_primary_owner', up.is_primary_owner,
    'subscription_status', o.subscription_status,
    'subscription_plan', sp.name,
    'trial_ends_at', o.trial_ends_at,
    'email_confirmed', au.email_confirmed_at IS NOT NULL,
    'last_login_at', up.last_login_at
  ) INTO v_profile
  FROM user_profiles up
  JOIN organizations o ON o.id = up.organization_id
  LEFT JOIN subscription_plans sp ON sp.id = o.subscription_plan_id
  JOIN auth.users au ON au.id = up.user_id
  WHERE up.user_id = auth.uid()
  LIMIT 1;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if organization trial has expired
CREATE OR REPLACE FUNCTION is_trial_expired()
RETURNS BOOLEAN AS $$
DECLARE
  v_expired BOOLEAN;
BEGIN
  SELECT
    o.subscription_status = 'trial' AND o.trial_ends_at < NOW()
  INTO v_expired
  FROM organizations o
  JOIN user_profiles up ON up.organization_id = o.id
  WHERE up.user_id = auth.uid()
  LIMIT 1;

  RETURN COALESCE(v_expired, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get organization subscription info
CREATE OR REPLACE FUNCTION get_organization_subscription()
RETURNS JSONB AS $$
DECLARE
  v_subscription JSONB;
BEGIN
  SELECT jsonb_build_object(
    'organization_id', o.id,
    'plan_name', sp.name,
    'plan_display_name', sp.display_name,
    'tier_level', sp.tier_level,
    'monthly_price', sp.monthly_price,
    'status', o.subscription_status,
    'is_trial', o.subscription_status = 'trial',
    'trial_ends_at', o.trial_ends_at,
    'trial_days_remaining', CASE
      WHEN o.subscription_status = 'trial' AND o.trial_ends_at > NOW()
      THEN EXTRACT(DAY FROM (o.trial_ends_at - NOW()))
      ELSE 0
    END,
    'next_billing_date', o.next_billing_date,
    'features', sp.features,
    'limits', jsonb_build_object(
      'max_clients', sp.max_clients,
      'max_caregivers', sp.max_caregivers,
      'max_visits_per_month', sp.max_visits_per_month,
      'max_users', sp.max_users,
      'max_storage_gb', sp.max_storage_gb,
      'current_clients', o.current_client_count,
      'current_caregivers', o.current_caregiver_count,
      'current_users', o.current_user_count,
      'current_storage_gb', o.current_storage_gb
    )
  ) INTO v_subscription
  FROM organizations o
  JOIN subscription_plans sp ON sp.id = o.subscription_plan_id
  JOIN user_profiles up ON up.organization_id = o.id
  WHERE up.user_id = auth.uid()
  LIMIT 1;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- PART 8: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON user_mfa_methods TO authenticated;
GRANT SELECT ON password_reset_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO authenticated;

GRANT EXECUTE ON FUNCTION get_current_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_expired TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_subscription TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Authentication & signup flow migration completed successfully!';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '  ✓ Auto-create organization on signup';
  RAISE NOTICE '  ✓ Auto-create user profile with owner role';
  RAISE NOTICE '  ✓ Auto-create 30-day trial subscription';
  RAISE NOTICE '  ✓ Track email verification';
  RAISE NOTICE '  ✓ Track password resets';
  RAISE NOTICE '  ✓ Session management (future)';
  RAISE NOTICE '  ✓ MFA preparation (future)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update frontend signup to pass organization metadata';
  RAISE NOTICE '  2. Configure Supabase Auth email templates';
  RAISE NOTICE '  3. Test signup flow end-to-end';
END $$;
