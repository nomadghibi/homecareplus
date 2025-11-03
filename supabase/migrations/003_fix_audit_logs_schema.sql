-- ============================================================================
-- FIX: Add missing organization_id column to audit_logs table
-- ============================================================================
-- This migration fixes a schema mismatch where the auth signup trigger
-- attempts to insert organization_id into audit_logs, but the column
-- doesn't exist in the table definition.
--
-- Issue: The 002_auth_signup_flow.sql migration inserts into audit_logs
-- with organization_id, but the base schema (supabase-schema.sql) doesn't
-- have this column.
--
-- This migration is idempotent and safe to run multiple times.
-- ============================================================================

-- Add organization_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'audit_logs'
    AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE audit_logs
    ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

    RAISE NOTICE 'Added organization_id column to audit_logs table';
  ELSE
    RAISE NOTICE 'organization_id column already exists in audit_logs table';
  END IF;
END $$;

-- Add index for organization_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization
ON audit_logs(organization_id);

-- Wrap audit log insertions in trigger to be fault-tolerant
-- This ensures auth operations never fail due to audit log issues
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

  -- Get default trial subscription plan (30-day trial)
  SELECT id INTO v_subscription_plan_id
  FROM subscription_plans
  WHERE plan_slug = 'trial'
  LIMIT 1;

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
  RAISE NOTICE 'Migration 003 completed successfully!';
  RAISE NOTICE 'Fixed audit_logs schema:';
  RAISE NOTICE '  ✓ Added organization_id column';
  RAISE NOTICE '  ✓ Added index on organization_id';
  RAISE NOTICE '  ✓ Wrapped audit log insertions with error handling';
  RAISE NOTICE '  ✓ Auth signup will never fail due to audit log issues';
END $$;
