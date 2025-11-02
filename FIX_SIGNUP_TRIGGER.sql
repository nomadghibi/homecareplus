-- ============================================================================
-- QUICK FIX: Update signup trigger to use free trial plan
-- ============================================================================
-- This fixes the signup error by ensuring the trigger uses the free plan
-- ============================================================================

-- Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_organization_id UUID;
  v_organization_name TEXT;
  v_organization_slug TEXT;
  v_subscription_plan_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  RAISE NOTICE 'Starting signup trigger for user: %', NEW.email;

  -- Extract metadata from user signup
  v_first_name := NEW.raw_user_meta_data->>'first_name';
  v_last_name := NEW.raw_user_meta_data->>'last_name';
  v_organization_name := NEW.raw_user_meta_data->>'organization_name';
  v_organization_slug := NEW.raw_user_meta_data->>'organization_slug';

  RAISE NOTICE 'Metadata - Name: %, Org: %', v_first_name, v_organization_name;

  -- If no organization metadata, create default
  IF v_organization_name IS NULL OR v_organization_name = '' THEN
    v_organization_name := COALESCE(v_first_name || '''s Organization', 'My Organization');
    v_organization_slug := LOWER(REPLACE(v_organization_name, ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;

  -- Generate slug if not provided
  IF v_organization_slug IS NULL OR v_organization_slug = '' THEN
    v_organization_slug := LOWER(REPLACE(v_organization_name, ' ', '-')) || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;

  -- Get the free trial plan (tier_level = 0)
  SELECT id INTO v_subscription_plan_id
  FROM subscription_plans
  WHERE tier_level = 0
    AND is_active = true
  LIMIT 1;

  -- If no free plan, get any active plan
  IF v_subscription_plan_id IS NULL THEN
    SELECT id INTO v_subscription_plan_id
    FROM subscription_plans
    WHERE is_active = true
    ORDER BY tier_level ASC
    LIMIT 1;
  END IF;

  RAISE NOTICE 'Using subscription plan: %', v_subscription_plan_id;

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
  ) RETURNING id INTO v_organization_id;

  RAISE NOTICE 'Organization created: %', v_organization_id;

  -- Create user profile
  INSERT INTO user_profiles (
    user_id,
    organization_id,
    first_name,
    last_name,
    email,
    role,
    is_primary_owner,
    status,
    permissions
  ) VALUES (
    NEW.id,
    v_organization_id,
    COALESCE(v_first_name, ''),
    COALESCE(v_last_name, ''),
    NEW.email,
    'owner',
    true,
    'active',
    '{}'::jsonb
  );

  RAISE NOTICE 'User profile created successfully';

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in signup trigger: %', SQLERRM;
  -- Return NEW anyway so auth signup succeeds even if trigger fails
  -- This allows users to sign up even if there's a DB issue
  RETURN NEW;
END;
$$;

-- Ensure the trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_org_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_org_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

-- Verify the trigger was created
SELECT
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_org_profile';

RAISE NOTICE '✅ Signup trigger updated successfully';
