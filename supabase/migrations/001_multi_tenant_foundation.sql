-- ============================================================================
-- CARE CONNECT PRO - MULTI-TENANT FOUNDATION MIGRATION
-- ============================================================================
-- This migration transforms the platform into a production-grade multi-tenant SaaS
--
-- Changes:
-- 1. Creates user_profiles table linking auth.users to organizations with roles
-- 2. Adds organization_id to all operational tables
-- 3. Updates RLS policies for tenant isolation
-- 4. Creates invitation system for team members
-- 5. Adds audit triggers for compliance
-- ============================================================================

-- ============================================================================
-- PART 1: USER PROFILES & ROLES
-- ============================================================================

-- User Profiles (links Supabase auth users to organizations with roles)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Profile Information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  display_name VARCHAR(200),
  avatar_url TEXT,
  phone VARCHAR(20),

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff', 'caregiver', 'family')),
  permissions JSONB DEFAULT '{}',
  -- Permission examples: { "clients.create": true, "clients.edit": true, "billing.view": true }

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  is_primary_owner BOOLEAN DEFAULT false,

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, organization_id) -- User can belong to org only once
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_organization_id ON user_profiles(organization_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view profiles in their organization" ON user_profiles
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage organization profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
        AND organization_id = user_profiles.organization_id
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PART 2: INVITATION SYSTEM
-- ============================================================================

CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Invitation Details
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'caregiver', 'family')),
  invited_by UUID REFERENCES auth.users(id),

  -- Token & Status
  invitation_token UUID DEFAULT uuid_generate_v4(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id),

  -- Metadata
  metadata JSONB DEFAULT '{}', -- Can store additional context (e.g., client_id for family invites)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(email, organization_id, status) -- Can't have duplicate pending invites
);

-- Indexes
CREATE INDEX idx_user_invitations_organization ON user_invitations(organization_id);
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations" ON user_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
        AND organization_id = user_invitations.organization_id
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- PART 3: ADD ORGANIZATION_ID TO ALL OPERATIONAL TABLES
-- ============================================================================

-- Clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_clients_organization ON clients(organization_id);

-- Caregivers
ALTER TABLE caregivers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_caregivers_organization ON caregivers(organization_id);

-- Visits
ALTER TABLE visits ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_visits_organization ON visits(organization_id);

-- EVV Events
ALTER TABLE evv_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_evv_events_organization ON evv_events(organization_id);

-- Claims
ALTER TABLE claims ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_claims_organization ON claims(organization_id);

-- Care Plans
ALTER TABLE care_plans ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_care_plans_organization ON care_plans(organization_id);

-- Medication Schedules
ALTER TABLE medication_schedules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_medication_schedules_organization ON medication_schedules(organization_id);

-- Medication Administrations
ALTER TABLE medication_administrations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_medication_administrations_organization ON medication_administrations(organization_id);

-- Incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_incidents_organization ON incidents(organization_id);

-- Quality Audits
ALTER TABLE quality_audits ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_quality_audits_organization ON quality_audits(organization_id);

-- Client Satisfaction Surveys
ALTER TABLE client_satisfaction_surveys ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_client_satisfaction_surveys_organization ON client_satisfaction_surveys(organization_id);

-- Visit Ratings
ALTER TABLE visit_ratings ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_visit_ratings_organization ON visit_ratings(organization_id);

-- Family Members
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_family_members_organization ON family_members(organization_id);

-- Family Portal Access
ALTER TABLE family_portal_access ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_family_portal_access_organization ON family_portal_access(organization_id);

-- Channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_channels_organization ON channels(organization_id);

-- Messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_messages_organization ON messages(organization_id);

-- Documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_documents_organization ON documents(organization_id);

-- Audit Logs (already has user_id, add organization for better isolation)
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);

-- Notifications (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_notifications_organization ON notifications(organization_id);
  END IF;
END $$;

-- Reminders (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders') THEN
    ALTER TABLE reminders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_reminders_organization ON reminders(organization_id);
  END IF;
END $$;

-- ============================================================================
-- PART 4: HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to get user's organization ID
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user has role in their organization
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = required_role
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION user_has_any_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND role = ANY(required_roles)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user is in specific organization
CREATE OR REPLACE FUNCTION user_in_organization(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
      AND organization_id = org_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- PART 5: UPDATE RLS POLICIES FOR TENANT ISOLATION
-- ============================================================================

-- DROP old permissive policies
DROP POLICY IF EXISTS "Allow authenticated access" ON clients;
DROP POLICY IF EXISTS "Allow authenticated access" ON caregivers;
DROP POLICY IF EXISTS "Allow authenticated access" ON visits;
DROP POLICY IF EXISTS "Allow authenticated access" ON evv_events;
DROP POLICY IF EXISTS "Allow authenticated access" ON claims;
DROP POLICY IF EXISTS "Allow authenticated access" ON care_plans;
DROP POLICY IF EXISTS "Allow authenticated access" ON medication_schedules;
DROP POLICY IF EXISTS "Allow authenticated access" ON medication_administrations;
DROP POLICY IF EXISTS "Allow authenticated access" ON incidents;
DROP POLICY IF EXISTS "Allow authenticated access" ON quality_audits;
DROP POLICY IF EXISTS "Allow authenticated access" ON client_satisfaction_surveys;
DROP POLICY IF EXISTS "Allow authenticated access" ON visit_ratings;
DROP POLICY IF EXISTS "Allow authenticated access" ON family_members;
DROP POLICY IF EXISTS "Allow authenticated access" ON family_portal_access;
DROP POLICY IF EXISTS "Allow authenticated access" ON channels;
DROP POLICY IF EXISTS "Allow authenticated access" ON messages;
DROP POLICY IF EXISTS "Allow authenticated access" ON documents;
DROP POLICY IF EXISTS "Allow authenticated access" ON audit_logs;

-- CLIENTS - Tenant-isolated policies
CREATE POLICY "Users can view clients in their organization" ON clients
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create clients in their organization" ON clients
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update clients in their organization" ON clients
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- CAREGIVERS - Tenant-isolated policies
CREATE POLICY "Users can view caregivers in their organization" ON caregivers
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage caregivers" ON caregivers
  FOR ALL USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- VISITS - Tenant-isolated with caregiver access
CREATE POLICY "Users can view visits in their organization" ON visits
  FOR SELECT USING (
    organization_id = get_user_organization_id() OR
    -- Caregivers can see their own visits
    (caregiver_id IN (
      SELECT id FROM caregivers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can create visits in their organization" ON visits
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update visits in their organization" ON visits
  FOR UPDATE USING (
    organization_id = get_user_organization_id() OR
    -- Caregivers can update their own visits
    (caregiver_id IN (
      SELECT id FROM caregivers WHERE email IN (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    ))
  );

CREATE POLICY "Admins can delete visits" ON visits
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- EVV EVENTS - Tenant-isolated
CREATE POLICY "Users can view EVV events in their organization" ON evv_events
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create EVV events in their organization" ON evv_events
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update EVV events in their organization" ON evv_events
  FOR UPDATE USING (organization_id = get_user_organization_id());

-- CLAIMS - Tenant-isolated with role-based access
CREATE POLICY "Users can view claims in their organization" ON claims
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Staff can manage claims" ON claims
  FOR ALL USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin', 'staff'])
  );

-- CARE PLANS - Tenant-isolated
CREATE POLICY "Users can view care plans in their organization" ON care_plans
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage care plans in their organization" ON care_plans
  FOR ALL USING (organization_id = get_user_organization_id());

-- MEDICATION SCHEDULES - Tenant-isolated
CREATE POLICY "Users can view medication schedules in their organization" ON medication_schedules
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage medication schedules in their organization" ON medication_schedules
  FOR ALL USING (organization_id = get_user_organization_id());

-- MEDICATION ADMINISTRATIONS - Tenant-isolated
CREATE POLICY "Users can view medication administrations in their organization" ON medication_administrations
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage medication administrations in their organization" ON medication_administrations
  FOR ALL USING (organization_id = get_user_organization_id());

-- INCIDENTS - Tenant-isolated
CREATE POLICY "Users can view incidents in their organization" ON incidents
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage incidents in their organization" ON incidents
  FOR ALL USING (organization_id = get_user_organization_id());

-- QUALITY AUDITS - Tenant-isolated
CREATE POLICY "Users can view quality audits in their organization" ON quality_audits
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Admins can manage quality audits" ON quality_audits
  FOR ALL USING (
    organization_id = get_user_organization_id()
    AND user_has_any_role(ARRAY['owner', 'admin'])
  );

-- SURVEYS - Tenant-isolated
CREATE POLICY "Users can view surveys in their organization" ON client_satisfaction_surveys
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage surveys in their organization" ON client_satisfaction_surveys
  FOR ALL USING (organization_id = get_user_organization_id());

-- VISIT RATINGS - Tenant-isolated with family access
CREATE POLICY "Users can view visit ratings in their organization" ON visit_ratings
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create visit ratings in their organization" ON visit_ratings
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

-- FAMILY MEMBERS - Tenant-isolated
CREATE POLICY "Users can view family members in their organization" ON family_members
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage family members in their organization" ON family_members
  FOR ALL USING (organization_id = get_user_organization_id());

-- FAMILY PORTAL ACCESS - Tenant-isolated
CREATE POLICY "Users can view family portal access in their organization" ON family_portal_access
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage family portal access in their organization" ON family_portal_access
  FOR ALL USING (organization_id = get_user_organization_id());

-- CHANNELS - Tenant-isolated
CREATE POLICY "Users can view channels in their organization" ON channels
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage channels in their organization" ON channels
  FOR ALL USING (organization_id = get_user_organization_id());

-- MESSAGES - Tenant-isolated
CREATE POLICY "Users can view messages in their organization" ON messages
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can create messages in their organization" ON messages
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

-- DOCUMENTS - Tenant-isolated
CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can manage documents in their organization" ON documents
  FOR ALL USING (organization_id = get_user_organization_id());

-- AUDIT LOGS - Tenant-isolated, read-only for non-admins
CREATE POLICY "Users can view audit logs in their organization" ON audit_logs
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PART 6: TRIGGERS & AUTOMATION
-- ============================================================================

-- Auto-create user profile when accepting invitation
CREATE OR REPLACE FUNCTION auto_create_profile_on_invite_accept()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if this email matches a new user
  SELECT id INTO v_user_id FROM auth.users WHERE email = NEW.email LIMIT 1;

  IF v_user_id IS NOT NULL AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Create user profile
    INSERT INTO user_profiles (user_id, organization_id, role, status)
    VALUES (v_user_id, NEW.organization_id, NEW.role, 'active')
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    -- Set accepted_by
    NEW.accepted_by := v_user_id;
    NEW.accepted_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_create_profile_on_invite_accept
  BEFORE UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_profile_on_invite_accept();

-- Auto-expire old invitations
CREATE OR REPLACE FUNCTION auto_expire_invitations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE user_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 7: AUDIT TRIGGER FOR ALL TABLES
-- ============================================================================

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name TEXT;
  v_org_id UUID;
  v_changes JSONB;
BEGIN
  -- Get user name
  SELECT display_name INTO v_user_name FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
  v_user_name := COALESCE(v_user_name, auth.email());

  -- Get organization ID
  v_org_id := get_user_organization_id();

  -- Build changes JSON
  IF TG_OP = 'DELETE' THEN
    v_changes := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    v_changes := jsonb_build_object(
      'before', to_jsonb(OLD),
      'after', to_jsonb(NEW)
    );
  ELSE
    v_changes := to_jsonb(NEW);
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    v_org_id,
    auth.uid(),
    v_user_name,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_changes
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to critical tables (optional - can be selective)
-- Uncomment to enable audit logging on specific tables:
/*
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_caregivers AFTER INSERT OR UPDATE OR DELETE ON caregivers
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

CREATE TRIGGER audit_visits AFTER INSERT OR UPDATE OR DELETE ON visits
  FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- Add more as needed for compliance
*/

-- ============================================================================
-- PART 8: GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_invitations TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_user_organization_id TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_any_role TO authenticated;
GRANT EXECUTE ON FUNCTION user_in_organization TO authenticated;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Multi-tenant foundation migration completed successfully!';
  RAISE NOTICE 'Tables updated: All operational tables now have organization_id';
  RAISE NOTICE 'RLS policies: Updated to enforce tenant isolation';
  RAISE NOTICE 'New tables: user_profiles, user_invitations';
  RAISE NOTICE 'Next steps: Run signup trigger migration and populate organization_id for existing data';
END $$;
