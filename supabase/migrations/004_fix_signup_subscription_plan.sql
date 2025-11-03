-- ============================================================================
-- FIX: Correct subscription plan query in signup trigger
-- ============================================================================
-- The previous migration used 'plan_slug' which doesn't exist in the schema.
-- The subscription_plans table uses 'name' column instead.
-- Also, the free tier plan is named 'free', not 'trial'.
-- ============================================================================

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

  -- Only proceed if organization metadata is provided
  IF v_organization_name IS NULL OR v_organization_slug IS NULL THEN
    RAISE NOTICE 'Skipping organization creation - metadata not provided for user %', NEW.email;
    RETURN NEW;
  END IF;

  -- Get the free trial subscription plan (tier_level = 0)
  -- Using tier_level is more reliable than plan name
  SELECT id INTO v_subscription_plan_id
  FROM subscription_plans
  WHERE tier_level = 0 AND is_active = true
  ORDER BY tier_level ASC
  LIMIT 1;

  -- Fallback: try to get by name if tier_level query fails
  IF v_subscription_plan_id IS NULL THEN
    SELECT id INTO v_subscription_plan_id
    FROM subscription_plans
    WHERE name IN ('free', 'trial', 'starter') AND is_active = true
    ORDER BY tier_level ASC
    LIMIT 1;
  END IF;

  -- If still no plan found, raise an error
  IF v_subscription_plan_id IS NULL THEN
    RAISE EXCEPTION 'No subscription plan found for new user signup. Please ensure subscription plans are seeded.';
  END IF;

  -- Create organization
  INSERT INTO organizations (
    id,
    name,
    slug,
    email,
    subscription_plan_id,
    subscription_status,
    trial_ends_at,
    subscription_start_date,
    is_active,
    onboarding_completed
  ) VALUES (
    uuid_generate_v4(),
    v_organization_name,
    v_organization_slug,
    NEW.email,
    v_subscription_plan_id,
    'trial',
    NOW() + INTERVAL '30 days',
    NOW(),
    true,
    false
  )
  RETURNING id INTO v_organization_id;

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
    NEW.id,
    v_organization_id,
    v_first_name,
    v_last_name,
    COALESCE(v_first_name || ' ' || v_last_name, NEW.email),
    'owner',
    'active',
    true
  );

  -- Log the signup in audit logs (with error handling)
  BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log error but don't block signup
      RAISE WARNING 'Failed to log signup audit: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger to use updated function
DROP TRIGGER IF EXISTS on_auth_user_created_org_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_org_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 004 completed successfully!';
  RAISE NOTICE 'Fixed subscription plan query in signup trigger:';
  RAISE NOTICE '  ✓ Changed from plan_slug to tier_level for reliability';
  RAISE NOTICE '  ✓ Added fallback to search by name (free/trial/starter)';
  RAISE NOTICE '  ✓ Added error if no plans are found';
END $$;
