-- ============================================================================
-- CHECK MIGRATION STATUS - Diagnose Multi-Tenant Setup
-- ============================================================================
-- This script checks if migration 001 was properly applied
-- ============================================================================

-- 1. Check if organization_id column exists on operational tables
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'organization_id'
  AND table_name IN (
    'clients', 'caregivers', 'visits', 'visit_notes',
    'claims', 'evv_events', 'documents', 'tasks',
    'assessments', 'care_plans', 'medications',
    'billing_invoices', 'payments', 'schedules'
  )
ORDER BY table_name;

-- Expected: Should see ~15 rows if migration ran
-- Actual if missing: 0 rows

-- 2. Check if user_profiles table exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
) as user_profiles_exists;

-- Expected: true
-- If false: Migration 001 didn't run

-- 3. Check RLS policies (should NOT be just "true")
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'caregivers', 'visits')
ORDER BY tablename, policyname;

-- Expected: Policies should check organization_id
-- Bad: qual = 'true' means no isolation!

-- 4. Check if helper functions exist
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_organization_id',
    'user_has_role',
    'get_current_user_profile'
  )
ORDER BY routine_name;

-- Expected: 3 functions
-- If missing: Migration 001 didn't run

-- 5. List ALL existing tables to see what we have
SELECT
    table_name,
    (SELECT COUNT(*)
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND columns.table_name = tables.table_name
    ) as column_count
FROM information_schema.tables tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- SUMMARY MESSAGE
-- ============================================================================

DO $$
DECLARE
    org_id_count INTEGER;
    user_profiles_exists BOOLEAN;
    helper_functions_count INTEGER;
BEGIN
    -- Count organization_id columns
    SELECT COUNT(*) INTO org_id_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND column_name = 'organization_id';

    -- Check user_profiles table
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'user_profiles'
    ) INTO user_profiles_exists;

    -- Count helper functions
    SELECT COUNT(*) INTO helper_functions_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN (
        'get_user_organization_id',
        'user_has_role',
        'get_current_user_profile'
      );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'MIGRATION STATUS CHECK';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'organization_id columns: %', org_id_count;
    RAISE NOTICE 'Expected: ~18 columns';
    RAISE NOTICE '';
    RAISE NOTICE 'user_profiles table exists: %', user_profiles_exists;
    RAISE NOTICE 'Expected: true';
    RAISE NOTICE '';
    RAISE NOTICE 'Helper functions: %', helper_functions_count;
    RAISE NOTICE 'Expected: 3 functions';
    RAISE NOTICE '';

    IF org_id_count < 10 THEN
        RAISE NOTICE '❌ MIGRATION 001 NOT APPLIED PROPERLY';
        RAISE NOTICE 'Action: Run migration 001_multi_tenant_foundation.sql';
    ELSIF NOT user_profiles_exists THEN
        RAISE NOTICE '❌ user_profiles TABLE MISSING';
        RAISE NOTICE 'Action: Run migration 001_multi_tenant_foundation.sql';
    ELSIF helper_functions_count < 3 THEN
        RAISE NOTICE '❌ HELPER FUNCTIONS MISSING';
        RAISE NOTICE 'Action: Run migration 001_multi_tenant_foundation.sql';
    ELSE
        RAISE NOTICE '✅ MIGRATION 001 APPEARS TO BE APPLIED';
        RAISE NOTICE 'Next: Check migration 002 and 003';
    END IF;
    RAISE NOTICE '========================================';
END $$;
