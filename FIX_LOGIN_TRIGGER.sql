-- ============================================================================
-- FIX LOGIN TRIGGER - Prevent Database Error During Login
-- ============================================================================
-- This script fixes the "Database error granting user" issue that occurs
-- when the login trigger tries to update a non-existent user_profile
-- ============================================================================

-- STEP 1: Make the login trigger more robust to handle missing profiles
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists first
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = NEW.id
  ) INTO v_profile_exists;

  -- Only update if profile exists
  IF v_profile_exists THEN
    UPDATE user_profiles
    SET last_login_at = NOW()
    WHERE user_id = NEW.id;
  ELSE
    -- Log that profile doesn't exist (for debugging)
    RAISE WARNING 'User profile not found for user ID: %. Skipping last_login_at update.', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the login
    RAISE WARNING 'Error updating last_login_at for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Check what users don't have profiles
SELECT
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at,
  CASE WHEN up.user_id IS NULL THEN '❌ Missing Profile' ELSE '✅ Has Profile' END as profile_status
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
ORDER BY au.created_at DESC;

-- STEP 3: For any users without profiles, create them
DO $$
DECLARE
  v_user RECORD;
  v_organization_id UUID;
  v_subscription_plan_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_organization_name TEXT;
  v_organization_slug TEXT;
BEGIN
  -- Get the starter plan ID
  SELECT id INTO v_subscription_plan_id
  FROM subscription_plans
  WHERE tier_level = 1 OR name = 'starter'
  ORDER BY tier_level ASC
  LIMIT 1;

  -- Loop through users without profiles
  FOR v_user IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN user_profiles up ON up.user_id = au.id
    WHERE up.user_id IS NULL
  LOOP
    RAISE NOTICE 'Creating profile for user: %', v_user.email;

    -- Extract metadata
    v_first_name := v_user.raw_user_meta_data->>'first_name';
    v_last_name := v_user.raw_user_meta_data->>'last_name';
    v_organization_name := v_user.raw_user_meta_data->>'organization_name';
    v_organization_slug := v_user.raw_user_meta_data->>'organization_slug';

    -- Set defaults if missing
    IF v_organization_name IS NULL THEN
      v_organization_name := COALESCE(v_first_name || '''s Organization', 'My Organization');
    END IF;

    IF v_organization_slug IS NULL THEN
      v_organization_slug := LOWER(REPLACE(v_organization_name, ' ', '-')) || '-' || SUBSTRING(v_user.id::TEXT, 1, 8);
    END IF;

    -- Check if organization already exists for this email
    SELECT id INTO v_organization_id
    FROM organizations
    WHERE email = v_user.email
    LIMIT 1;

    -- Create organization if it doesn't exist
    IF v_organization_id IS NULL THEN
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
        v_user.email,
        v_subscription_plan_id,
        'trial',
        NOW() + INTERVAL '30 days',
        NOW(),
        'monthly',
        true,
        false
      )
      RETURNING id INTO v_organization_id;

      RAISE NOTICE '✅ Created organization: %', v_organization_id;
    ELSE
      RAISE NOTICE '✅ Using existing organization: %', v_organization_id;
    END IF;

    -- Create user profile
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
      v_user.id,
      v_organization_id,
      v_first_name,
      v_last_name,
      COALESCE(v_first_name || ' ' || v_last_name, v_user.email),
      'owner',
      'active',
      true
    );

    RAISE NOTICE '✅ Created profile for: %', v_user.email;

    -- Log the profile creation
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
      v_user.id,
      COALESCE(v_first_name || ' ' || v_last_name, v_user.email),
      'PROFILE_CREATED',
      'user',
      v_user.id,
      v_user.email,
      jsonb_build_object(
        'email', v_user.email,
        'created_retroactively', true
      )
    );
  END LOOP;
END $$;

-- STEP 4: Verify all users now have profiles
SELECT
  au.email,
  CASE WHEN up.user_id IS NULL THEN '❌ Missing Profile' ELSE '✅ Has Profile' END as status,
  up.organization_id,
  up.role
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
ORDER BY au.created_at DESC;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Login trigger fixed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '  1. Updated update_user_last_login() to handle missing profiles gracefully';
  RAISE NOTICE '  2. Created missing profiles for existing users';
  RAISE NOTICE '  3. Login will no longer fail with "Database error granting user"';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now try logging in again!';
END $$;
