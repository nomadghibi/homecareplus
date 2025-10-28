-- Care Connect Pro - Supabase Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Clients (Patients receiving care)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(100),
  primary_diagnosis TEXT,
  secondary_diagnoses TEXT[],
  allergies TEXT[],
  medications TEXT[],
  special_instructions TEXT,
  insurance_provider VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  insurance_group_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  admission_date DATE,
  discharge_date DATE,
  preferred_caregiver_id UUID,
  language VARCHAR(50) DEFAULT 'English',
  mobility_status VARCHAR(50),
  cognitive_status VARCHAR(50),
  fall_risk VARCHAR(20),
  diet_restrictions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Caregivers (Staff providing care)
CREATE TABLE caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  employment_type VARCHAR(50) CHECK (employment_type IN ('Full-time', 'Part-time', 'Per Diem', 'Contract')),
  hourly_rate DECIMAL(10, 2),
  certifications TEXT[],
  license_number VARCHAR(100),
  license_expiry DATE,
  cpr_certification_expiry DATE,
  first_aid_certification_expiry DATE,
  background_check_date DATE,
  background_check_status VARCHAR(20),
  skills TEXT[],
  languages TEXT[],
  availability JSONB, -- Store availability schedule as JSON
  max_hours_per_week INTEGER,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated')),
  rating DECIMAL(3, 2) DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  profile_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visits (Scheduled care visits)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES caregivers(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_start TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show')),
  visit_type VARCHAR(50) NOT NULL,
  tasks TEXT[],
  notes TEXT,
  billable_hours DECIMAL(5, 2),
  mileage DECIMAL(8, 2),
  cancelled_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVV Events (Electronic Visit Verification)
CREATE TABLE evv_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('clock-in', 'clock-out')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy DECIMAL(8, 2),
  verification_method VARCHAR(50) CHECK (verification_method IN ('GPS', 'Phone', 'Manual', 'Biometric')),
  device_id VARCHAR(255),
  ip_address VARCHAR(45),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BILLING & CLAIMS
-- ============================================

-- Claims (Insurance billing claims)
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  visit_ids UUID[],
  service_date DATE NOT NULL,
  submission_date DATE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'denied', 'paid')),
  insurance_provider VARCHAR(200),
  policy_number VARCHAR(100),
  total_amount DECIMAL(10, 2) NOT NULL,
  approved_amount DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2),
  denial_reason TEXT,
  diagnosis_codes TEXT[],
  procedure_codes TEXT[],
  service_units INTEGER,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CLINICAL & CARE MANAGEMENT
-- ============================================

-- Care Plans
CREATE TABLE care_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'on-hold')),
  goals JSONB, -- Array of goal objects
  interventions JSONB, -- Array of intervention objects
  schedule JSONB, -- Care schedule configuration
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  review_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Schedules
CREATE TABLE medication_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  medication_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  route VARCHAR(50) CHECK (route IN ('Oral', 'Topical', 'Injection', 'Inhalation', 'Other')),
  frequency VARCHAR(100) NOT NULL,
  times_per_day INTEGER,
  schedule_times TEXT[], -- Array of times like ['08:00', '20:00']
  start_date DATE NOT NULL,
  end_date DATE,
  prescribing_physician VARCHAR(200),
  prescription_number VARCHAR(100),
  pharmacy VARCHAR(200),
  pharmacy_phone VARCHAR(20),
  purpose TEXT,
  side_effects TEXT[],
  special_instructions TEXT,
  refills_remaining INTEGER DEFAULT 0,
  last_refill_date DATE,
  next_refill_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued', 'on-hold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication Administration Records
CREATE TABLE medication_administrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medication_schedule_id UUID NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  administered_by UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'administered', 'missed', 'refused', 'held')),
  dosage_given VARCHAR(100),
  reason_missed TEXT,
  reason_refused TEXT,
  reason_held TEXT,
  side_effects_observed TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  incident_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT,
  description TEXT NOT NULL,
  immediate_action TEXT,
  witnesses TEXT[],
  injury_occurred BOOLEAN DEFAULT FALSE,
  injury_description TEXT,
  medical_attention_required BOOLEAN DEFAULT FALSE,
  family_notified BOOLEAN DEFAULT FALSE,
  family_notified_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  resolution TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  reported_by UUID,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- QUALITY ASSURANCE
-- ============================================

-- Quality Audits
CREATE TABLE quality_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_number VARCHAR(100) UNIQUE NOT NULL,
  audit_type VARCHAR(100) NOT NULL,
  audit_date DATE NOT NULL,
  auditor_id UUID,
  auditor_name VARCHAR(200),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  caregiver_id UUID REFERENCES caregivers(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  score DECIMAL(5, 2),
  max_score DECIMAL(5, 2),
  percentage DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  findings JSONB, -- Array of finding objects
  recommendations TEXT[],
  corrective_actions JSONB,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Satisfaction Surveys
CREATE TABLE client_satisfaction_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  survey_date DATE NOT NULL,
  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5),
  caregiver_professionalism INTEGER CHECK (caregiver_professionalism BETWEEN 1 AND 5),
  care_quality INTEGER CHECK (care_quality BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  timeliness INTEGER CHECK (timeliness BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  comments TEXT,
  areas_for_improvement TEXT[],
  positive_feedback TEXT,
  response_method VARCHAR(50) CHECK (response_method IN ('Phone', 'Email', 'In-person', 'Mail', 'Online')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visit Ratings (Family ratings of specific visits)
CREATE TABLE visit_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FAMILY PORTAL
-- ============================================

-- Family Members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  is_primary_contact BOOLEAN DEFAULT FALSE,
  is_emergency_contact BOOLEAN DEFAULT FALSE,
  can_approve_services BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family Portal Access
CREATE TABLE family_portal_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- Links to Supabase auth user
  access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'admin')),
  can_view_visits BOOLEAN DEFAULT TRUE,
  can_view_care_plans BOOLEAN DEFAULT TRUE,
  can_view_medications BOOLEAN DEFAULT TRUE,
  can_view_documents BOOLEAN DEFAULT FALSE,
  can_message_staff BOOLEAN DEFAULT TRUE,
  can_rate_visits BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_member_id, user_id)
);

-- ============================================
-- COMMUNICATION
-- ============================================

-- Channels (Message channels/conversations)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200),
  type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'visit')),
  participant_ids UUID[] NOT NULL,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB, -- Array of attachment objects
  read_by UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS & FILES
-- ============================================

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_type VARCHAR(50),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  category VARCHAR(100) CHECK (category IN ('care-plans', 'doctors-orders', 'authorization', 'insurance-card', 'id-document', 'consent-form', 'certification', 'background-check', 'license', 'contract', 'other')),
  related_entity_type VARCHAR(50) CHECK (related_entity_type IN ('client', 'caregiver', 'visit', 'claim', 'incident')),
  related_entity_id UUID,
  uploaded_by UUID NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  template_category VARCHAR(100),
  tags TEXT[],
  share_link VARCHAR(255) UNIQUE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AUDIT & SYSTEM LOGS
-- ============================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_name VARCHAR(200) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  entity_name VARCHAR(255),
  changes JSONB, -- Store before/after values
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Clients
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_admission_date ON clients(admission_date);
CREATE INDEX idx_clients_preferred_caregiver ON clients(preferred_caregiver_id);

-- Caregivers
CREATE INDEX idx_caregivers_status ON caregivers(status);
CREATE INDEX idx_caregivers_email ON caregivers(email);
CREATE INDEX idx_caregivers_license_expiry ON caregivers(license_expiry);

-- Visits
CREATE INDEX idx_visits_client ON visits(client_id);
CREATE INDEX idx_visits_caregiver ON visits(caregiver_id);
CREATE INDEX idx_visits_scheduled_start ON visits(scheduled_start);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_date_range ON visits(scheduled_start, scheduled_end);

-- EVV Events
CREATE INDEX idx_evv_visit ON evv_events(visit_id);
CREATE INDEX idx_evv_timestamp ON evv_events(timestamp);
CREATE INDEX idx_evv_status ON evv_events(status);

-- Claims
CREATE INDEX idx_claims_client ON claims(client_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_service_date ON claims(service_date);
CREATE INDEX idx_claims_claim_number ON claims(claim_number);

-- Care Plans
CREATE INDEX idx_care_plans_client ON care_plans(client_id);
CREATE INDEX idx_care_plans_status ON care_plans(status);

-- Medications
CREATE INDEX idx_medication_schedules_client ON medication_schedules(client_id);
CREATE INDEX idx_medication_schedules_status ON medication_schedules(status);
CREATE INDEX idx_medication_administrations_schedule ON medication_administrations(medication_schedule_id);
CREATE INDEX idx_medication_administrations_scheduled_time ON medication_administrations(scheduled_time);

-- Incidents
CREATE INDEX idx_incidents_client ON incidents(client_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_date ON incidents(incident_date);

-- Quality
CREATE INDEX idx_quality_audits_client ON quality_audits(client_id);
CREATE INDEX idx_quality_audits_caregiver ON quality_audits(caregiver_id);
CREATE INDEX idx_quality_audits_date ON quality_audits(audit_date);

-- Family
CREATE INDEX idx_family_members_client ON family_members(client_id);
CREATE INDEX idx_family_portal_access_family_member ON family_portal_access(family_member_id);
CREATE INDEX idx_visit_ratings_visit ON visit_ratings(visit_id);

-- Communication
CREATE INDEX idx_channels_type ON channels(type);
CREATE INDEX idx_messages_channel ON messages(channel_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Documents
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_related_entity ON documents(related_entity_type, related_entity_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE evv_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_administrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_satisfaction_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_portal_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- For MVP, allow authenticated users to access all data
-- TODO: Implement proper role-based policies later

CREATE POLICY "Allow authenticated access" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON caregivers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON visits FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON evv_events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON claims FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON care_plans FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON medication_schedules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON medication_administrations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON incidents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON quality_audits FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON client_satisfaction_surveys FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON visit_ratings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON family_members FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON family_portal_access FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON channels FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access" ON audit_logs FOR ALL TO authenticated USING (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caregivers_updated_at BEFORE UPDATE ON caregivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_plans_updated_at BEFORE UPDATE ON care_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medication_schedules_updated_at BEFORE UPDATE ON medication_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_audits_updated_at BEFORE UPDATE ON quality_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_portal_access_updated_at BEFORE UPDATE ON family_portal_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert a sample client
-- INSERT INTO clients (first_name, last_name, date_of_birth, phone, email, address, city, state, zip_code, primary_diagnosis)
-- VALUES ('John', 'Doe', '1950-01-15', '555-0101', 'john.doe@example.com', '123 Main St', 'Boston', 'MA', '02101', 'Diabetes Management');

-- Insert a sample caregiver
-- INSERT INTO caregivers (first_name, last_name, email, phone, hire_date, employment_type, hourly_rate, certifications, skills)
-- VALUES ('Sarah', 'Smith', 'sarah.smith@example.com', '555-0102', '2023-01-15', 'Full-time', 25.00, ARRAY['CNA', 'CPR'], ARRAY['Personal Care', 'Medication Management']);

-- Schema creation complete!
