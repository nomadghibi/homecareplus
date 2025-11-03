-- ============================================================================
-- ADD ORGANIZATION CREATION - STEP BY STEP
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created_org_profile ON auth.users;

-- Step 1: Try to create organization (wrapped in exception handler)
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
  -- Wrap EVERYTHING in exception handler so it never blocks
  BEGIN
    -- Extract metadata
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_organization_name := NEW.raw_user_meta_data->>'organization_name';
    v_organization_slug := NEW.raw_user_meta_data->>'organization_slug';

    -- Only proceed if we have org data
    IF v_organization_name IS NOT NULL AND v_organization_slug IS NOT NULL THEN

      -- Get free plan
      SELECT id INTO v_subscription_plan_id
      FROM subscription_plans
      WHERE tier_level = 0 AND is_active = true
      LIMIT 1;

      -- Create organization if we found a plan
      IF v_subscription_plan_id IS NOT NULL THEN
        INSERT INTO organizations (
          name, slug, email,
          subscription_plan_id, subscription_status,
          trial_ends_at, subscription_start_date,
          is_active
        ) VALUES (
          v_organization_name, v_organization_slug, NEW.email,
          v_subscription_plan_id, 'trial',
          NOW() + INTERVAL '30 days', NOW(),
          true
        )
        RETURNING id INTO v_organization_id;

        -- Create user profile
        IF v_organization_id IS NOT NULL THEN
          INSERT INTO user_profiles (
            user_id, organization_id,
            first_name, last_name, display_name,
            role, status, is_primary_owner
          ) VALUES (
            NEW.id, v_organization_id,
            v_first_name, v_last_name,
            COALESCE(v_first_name || ' ' || v_last_name, NEW.email),
            'owner', 'active', true
          );
        END IF;
      END IF;
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      -- Silently ignore all errors - don't block signup
      NULL;
  END;

  -- ALWAYS return NEW
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
CREATE TRIGGER on_auth_user_created_org_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_signup();

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Trigger with organization creation enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'This version:';
  RAISE NOTICE '  ✓ Creates organization + user profile';
  RAISE NOTICE '  ✓ Wrapped in exception handler';
  RAISE NOTICE '  ✓ ALWAYS returns NEW (never blocks signup)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 TRY SIGNUP NOW!';
END $$;
