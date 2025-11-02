-- ============================================================================
-- FIX RLS POLICIES - Add Proper Tenant Isolation
-- ============================================================================
-- This script updates RLS policies from USING (true) to proper tenant checks
-- Run this if policies are allowing access to all data instead of just org data
-- ============================================================================

-- Drop old policies that use USING (true)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND qual = 'true'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on table %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- ============================================================================
-- CLIENTS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can create clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can update clients in their organization" ON clients;
DROP POLICY IF EXISTS "Users can delete clients in their organization" ON clients;

CREATE POLICY "Users can view clients in their organization"
ON clients FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create clients in their organization"
ON clients FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update clients in their organization"
ON clients FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete clients in their organization"
ON clients FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- CAREGIVERS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view caregivers in their organization" ON caregivers;
DROP POLICY IF EXISTS "Users can create caregivers in their organization" ON caregivers;
DROP POLICY IF EXISTS "Users can update caregivers in their organization" ON caregivers;
DROP POLICY IF EXISTS "Users can delete caregivers in their organization" ON caregivers;

CREATE POLICY "Users can view caregivers in their organization"
ON caregivers FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create caregivers in their organization"
ON caregivers FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update caregivers in their organization"
ON caregivers FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete caregivers in their organization"
ON caregivers FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- VISITS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view visits in their organization" ON visits;
DROP POLICY IF EXISTS "Users can create visits in their organization" ON visits;
DROP POLICY IF EXISTS "Users can update visits in their organization" ON visits;
DROP POLICY IF EXISTS "Users can delete visits in their organization" ON visits;

CREATE POLICY "Users can view visits in their organization"
ON visits FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create visits in their organization"
ON visits FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update visits in their organization"
ON visits FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete visits in their organization"
ON visits FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- CLAIMS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view claims in their organization" ON claims;
DROP POLICY IF EXISTS "Users can create claims in their organization" ON claims;
DROP POLICY IF EXISTS "Users can update claims in their organization" ON claims;
DROP POLICY IF EXISTS "Users can delete claims in their organization" ON claims;

CREATE POLICY "Users can view claims in their organization"
ON claims FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create claims in their organization"
ON claims FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update claims in their organization"
ON claims FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete claims in their organization"
ON claims FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- EVV_EVENTS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view evv_events in their organization" ON evv_events;
DROP POLICY IF EXISTS "Users can create evv_events in their organization" ON evv_events;
DROP POLICY IF EXISTS "Users can update evv_events in their organization" ON evv_events;
DROP POLICY IF EXISTS "Users can delete evv_events in their organization" ON evv_events;

CREATE POLICY "Users can view evv_events in their organization"
ON evv_events FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create evv_events in their organization"
ON evv_events FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update evv_events in their organization"
ON evv_events FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete evv_events in their organization"
ON evv_events FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- DOCUMENTS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can create documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can update documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can delete documents in their organization" ON documents;

CREATE POLICY "Users can view documents in their organization"
ON documents FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create documents in their organization"
ON documents FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update documents in their organization"
ON documents FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete documents in their organization"
ON documents FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- CARE_PLANS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view care_plans in their organization" ON care_plans;
DROP POLICY IF EXISTS "Users can create care_plans in their organization" ON care_plans;
DROP POLICY IF EXISTS "Users can update care_plans in their organization" ON care_plans;
DROP POLICY IF EXISTS "Users can delete care_plans in their organization" ON care_plans;

CREATE POLICY "Users can view care_plans in their organization"
ON care_plans FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create care_plans in their organization"
ON care_plans FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update care_plans in their organization"
ON care_plans FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete care_plans in their organization"
ON care_plans FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- MEDICATION_SCHEDULES TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view medication_schedules in their organization" ON medication_schedules;
DROP POLICY IF EXISTS "Users can create medication_schedules in their organization" ON medication_schedules;
DROP POLICY IF EXISTS "Users can update medication_schedules in their organization" ON medication_schedules;
DROP POLICY IF EXISTS "Users can delete medication_schedules in their organization" ON medication_schedules;

CREATE POLICY "Users can view medication_schedules in their organization"
ON medication_schedules FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create medication_schedules in their organization"
ON medication_schedules FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update medication_schedules in their organization"
ON medication_schedules FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete medication_schedules in their organization"
ON medication_schedules FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- NOTIFICATIONS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view notifications in their organization" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications in their organization" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications in their organization" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications in their organization" ON notifications;

CREATE POLICY "Users can view notifications in their organization"
ON notifications FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create notifications in their organization"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update notifications in their organization"
ON notifications FOR UPDATE
TO authenticated
USING (organization_id = get_user_organization_id())
WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete notifications in their organization"
ON notifications FOR DELETE
TO authenticated
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- AUDIT_LOGS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view audit_logs in their organization" ON audit_logs;
DROP POLICY IF EXISTS "Users can create audit_logs in their organization" ON audit_logs;

CREATE POLICY "Users can view audit_logs in their organization"
ON audit_logs FOR SELECT
TO authenticated
USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create audit_logs in their organization"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (organization_id = get_user_organization_id());

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================

-- Show updated policies
SELECT
    tablename,
    policyname,
    cmd,
    LEFT(qual::text, 50) as policy_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('clients', 'caregivers', 'visits', 'claims', 'evv_events')
ORDER BY tablename, cmd;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS POLICIES UPDATED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables now have proper tenant isolation';
    RAISE NOTICE 'Policies check: organization_id = get_user_organization_id()';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Disable email verification (or manually confirm user)';
    RAISE NOTICE '2. Test signup flow';
    RAISE NOTICE '3. Verify tenant isolation is working';
    RAISE NOTICE '========================================';
END $$;
