-- ============================================================================
-- DEBUG: Check Auth Trigger Setup
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose the signup issue
-- ============================================================================

-- 1. Check if the trigger function exists
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'handle_new_user_signup';

-- 2. Check if the trigger is attached to auth.users
SELECT
    trigger_name,
    event_object_table,
    action_statement,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_org_profile';

-- 3. Check if organizations table exists and has correct columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'organizations'
ORDER BY ordinal_position;

-- 4. Check if user_profiles table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 5. Check if subscription_plans exist (needed for default trial)
SELECT id, name, display_name, tier_level, monthly_price
FROM public.subscription_plans
WHERE is_active = true
ORDER BY tier_level;

-- 6. Test the trigger manually (OPTIONAL - only if you want to debug)
-- This creates a test scenario to see what error occurs
-- COMMENT THIS OUT if you don't want to create a test user
/*
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_org_id UUID;
BEGIN
    -- Simulate what the trigger does
    RAISE NOTICE 'Starting manual trigger test...';

    -- Try to create organization
    INSERT INTO public.organizations (
        name,
        slug,
        email,
        subscription_status,
        trial_ends_at
    ) VALUES (
        'Test Organization Manual',
        'test-org-manual',
        'test@example.com',
        'trial',
        NOW() + INTERVAL '30 days'
    ) RETURNING id INTO test_org_id;

    RAISE NOTICE 'Organization created: %', test_org_id;

    -- Try to create user profile
    INSERT INTO public.user_profiles (
        user_id,
        organization_id,
        first_name,
        last_name,
        role,
        is_primary_owner
    ) VALUES (
        test_user_id,
        test_org_id,
        'Test',
        'User',
        'owner',
        true
    );

    RAISE NOTICE 'User profile created successfully';

    -- Clean up test data
    DELETE FROM public.user_profiles WHERE user_id = test_user_id;
    DELETE FROM public.organizations WHERE id = test_org_id;

    RAISE NOTICE 'Test completed and cleaned up successfully';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    -- Try to clean up even on error
    DELETE FROM public.user_profiles WHERE user_id = test_user_id;
    DELETE FROM public.organizations WHERE id = test_org_id;
END $$;
*/
