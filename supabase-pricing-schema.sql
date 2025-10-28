-- ============================================================================
-- CARE CONNECT PRO - PRICING STRATEGY SYSTEM
-- ============================================================================
-- This schema implements a flexible, multi-tier pricing system supporting:
-- - Multiple pricing strategies per organization
-- - Service-specific base rates
-- - Time-based rate modifiers (weekends, nights, holidays)
-- - Insurance payer-specific fee schedules
-- - Client-specific custom rates
-- - Mileage reimbursement rules
-- ============================================================================

-- ============================================================================
-- 1. PRICING STRATEGIES (Master pricing plans)
-- ============================================================================
CREATE TABLE pricing_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  strategy_type VARCHAR(50) NOT NULL DEFAULT 'standard',
    -- 'standard', 'premium', 'medicaid', 'medicare', 'private_pay', 'custom'
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_strategies_active ON pricing_strategies(is_active);
CREATE INDEX idx_pricing_strategies_default ON pricing_strategies(is_default);

-- ============================================================================
-- 2. SERVICE RATES (Base rates per service type)
-- ============================================================================
CREATE TABLE service_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_strategy_id UUID NOT NULL REFERENCES pricing_strategies(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
    -- 'personal_care', 'companionship', 'medication_management',
    -- 'skilled_nursing', 'physical_therapy', 'respite_care',
    -- 'meal_preparation', 'transportation', 'homemaking'
  service_name VARCHAR(200) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  minimum_hours DECIMAL(5, 2) DEFAULT 0,
  minimum_charge DECIMAL(10, 2) DEFAULT 0,
  billing_increment_minutes INTEGER DEFAULT 15, -- Round to 15-min increments
  allow_overtime BOOLEAN DEFAULT true,
  overtime_multiplier DECIMAL(5, 2) DEFAULT 1.5,
  overtime_threshold_hours DECIMAL(5, 2) DEFAULT 8, -- Daily OT after 8 hours
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pricing_strategy_id, service_type)
);

CREATE INDEX idx_service_rates_strategy ON service_rates(pricing_strategy_id);
CREATE INDEX idx_service_rates_type ON service_rates(service_type);

-- ============================================================================
-- 3. RATE MODIFIERS (Time-based and conditional adjustments)
-- ============================================================================
CREATE TABLE rate_modifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_strategy_id UUID NOT NULL REFERENCES pricing_strategies(id) ON DELETE CASCADE,
  modifier_name VARCHAR(200) NOT NULL,
  modifier_type VARCHAR(50) NOT NULL,
    -- 'weekend', 'evening', 'night', 'holiday', 'emergency', 'live_in'
  applies_to_service_types TEXT[], -- NULL = applies to all
  multiplier DECIMAL(5, 2), -- e.g., 1.25 for 25% increase
  flat_amount DECIMAL(10, 2), -- Alternative to multiplier
  start_time TIME, -- For time-of-day modifiers
  end_time TIME,
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority modifiers apply first
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_modifiers_strategy ON rate_modifiers(pricing_strategy_id);
CREATE INDEX idx_rate_modifiers_type ON rate_modifiers(modifier_type);

-- ============================================================================
-- 4. PAYER FEE SCHEDULES (Insurance-specific rates)
-- ============================================================================
CREATE TABLE payer_fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_strategy_id UUID NOT NULL REFERENCES pricing_strategies(id) ON DELETE CASCADE,
  payer_name VARCHAR(200) NOT NULL, -- 'Medicare', 'Medicaid', 'Aetna', etc.
  payer_id VARCHAR(100), -- External payer identifier
  service_type VARCHAR(100) NOT NULL,
  procedure_code VARCHAR(20), -- CPT/HCPCS code if applicable
  allowed_amount DECIMAL(10, 2) NOT NULL,
  unit_type VARCHAR(50) DEFAULT 'hour', -- 'hour', 'visit', 'day', 'unit'
  max_units_per_day DECIMAL(5, 2),
  max_units_per_week DECIMAL(5, 2),
  requires_authorization BOOLEAN DEFAULT false,
  copay_amount DECIMAL(10, 2) DEFAULT 0,
  coinsurance_percent DECIMAL(5, 2) DEFAULT 0,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payer_fee_schedules_strategy ON payer_fee_schedules(pricing_strategy_id);
CREATE INDEX idx_payer_fee_schedules_payer ON payer_fee_schedules(payer_name);
CREATE INDEX idx_payer_fee_schedules_service ON payer_fee_schedules(service_type);

-- ============================================================================
-- 5. CLIENT PRICING OVERRIDES (Client-specific custom rates)
-- ============================================================================
CREATE TABLE client_pricing_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pricing_strategy_id UUID REFERENCES pricing_strategies(id),
  service_type VARCHAR(100),
  custom_hourly_rate DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2), -- e.g., 10.00 for 10% discount
  discount_reason VARCHAR(500),
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_client_pricing_client ON client_pricing_overrides(client_id);
CREATE INDEX idx_client_pricing_strategy ON client_pricing_overrides(pricing_strategy_id);

-- ============================================================================
-- 6. MILEAGE RATES (Travel reimbursement)
-- ============================================================================
CREATE TABLE mileage_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_strategy_id UUID NOT NULL REFERENCES pricing_strategies(id) ON DELETE CASCADE,
  rate_per_mile DECIMAL(10, 4) NOT NULL, -- e.g., 0.6550 for $0.655/mile
  minimum_billable_miles DECIMAL(5, 2) DEFAULT 0,
  maximum_billable_miles DECIMAL(5, 2),
  applies_to_service_types TEXT[], -- NULL = all services
  effective_date DATE NOT NULL,
  expiration_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mileage_rates_strategy ON mileage_rates(pricing_strategy_id);

-- ============================================================================
-- 7. PRICING AUDIT LOG (Track all price calculations)
-- ============================================================================
CREATE TABLE pricing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES visits(id),
  claim_id UUID REFERENCES claims(id),
  pricing_strategy_id UUID REFERENCES pricing_strategies(id),
  calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  base_rate DECIMAL(10, 2),
  billable_hours DECIMAL(5, 2),
  modifiers_applied JSONB, -- Array of applied modifiers with details
  mileage_charged DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  adjustments DECIMAL(10, 2),
  final_amount DECIMAL(10, 2),
  calculation_details JSONB, -- Full calculation breakdown
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_audit_visit ON pricing_audit_log(visit_id);
CREATE INDEX idx_pricing_audit_claim ON pricing_audit_log(claim_id);

-- ============================================================================
-- 8. UPDATE VISITS TABLE (Add pricing fields)
-- ============================================================================
ALTER TABLE visits ADD COLUMN IF NOT EXISTS pricing_strategy_id UUID REFERENCES pricing_strategies(id);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS calculated_amount DECIMAL(10, 2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS override_amount DECIMAL(10, 2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2);
ALTER TABLE visits ADD COLUMN IF NOT EXISTS pricing_notes TEXT;

CREATE INDEX idx_visits_pricing_strategy ON visits(pricing_strategy_id);

-- ============================================================================
-- 9. UPDATE CLIENTS TABLE (Link to pricing strategy)
-- ============================================================================
ALTER TABLE clients ADD COLUMN IF NOT EXISTS pricing_strategy_id UUID REFERENCES pricing_strategies(id);

CREATE INDEX idx_clients_pricing_strategy ON clients(pricing_strategy_id);

-- ============================================================================
-- 10. SAMPLE DATA - DEFAULT PRICING STRATEGIES
-- ============================================================================

-- Standard Private Pay Strategy
INSERT INTO pricing_strategies (id, name, description, strategy_type, is_active, is_default, effective_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Standard Private Pay', 'Default pricing for private pay clients', 'private_pay', true, true, '2024-01-01'),
  ('22222222-2222-2222-2222-222222222222', 'Medicare Fee Schedule', 'Medicare approved rates', 'medicare', true, false, '2024-01-01'),
  ('33333333-3333-3333-3333-333333333333', 'Medicaid Fee Schedule', 'State Medicaid rates', 'medicaid', true, false, '2024-01-01'),
  ('44444444-4444-4444-4444-444444444444', 'Premium Care Package', 'Premium rates for enhanced services', 'premium', true, false, '2024-01-01');

-- Service Rates for Standard Private Pay
INSERT INTO service_rates (pricing_strategy_id, service_type, service_name, hourly_rate, minimum_hours, minimum_charge, billing_increment_minutes)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'personal_care', 'Personal Care Services', 35.00, 2, 70.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'companionship', 'Companionship', 28.00, 2, 56.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'medication_management', 'Medication Management', 40.00, 1, 40.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'skilled_nursing', 'Skilled Nursing (RN)', 75.00, 1, 75.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'physical_therapy', 'Physical Therapy', 85.00, 1, 85.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'respite_care', 'Respite Care', 32.00, 4, 128.00, 30),
  ('11111111-1111-1111-1111-111111111111', 'meal_preparation', 'Meal Preparation', 30.00, 1, 30.00, 15),
  ('11111111-1111-1111-1111-111111111111', 'transportation', 'Transportation Services', 25.00, 1, 25.00, 30),
  ('11111111-1111-1111-1111-111111111111', 'homemaking', 'Homemaking Services', 28.00, 2, 56.00, 15);

-- Rate Modifiers for Standard Strategy
INSERT INTO rate_modifiers (pricing_strategy_id, modifier_name, modifier_type, multiplier, days_of_week, is_active, priority)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Weekend Premium', 'weekend', 1.25, ARRAY[0,6], true, 1),
  ('11111111-1111-1111-1111-111111111111', 'Evening Rate (6PM-10PM)', 'evening', 1.15, NULL, true, 2),
  ('11111111-1111-1111-1111-111111111111', 'Night Rate (10PM-6AM)', 'night', 1.35, NULL, true, 3),
  ('11111111-1111-1111-1111-111111111111', 'Holiday Premium', 'holiday', 1.50, NULL, true, 4),
  ('11111111-1111-1111-1111-111111111111', 'Emergency Call (< 24hr notice)', 'emergency', 1.40, NULL, true, 5);

-- Update Evening modifier with time constraints
UPDATE rate_modifiers
SET start_time = '18:00:00', end_time = '22:00:00'
WHERE modifier_type = 'evening';

-- Update Night modifier with time constraints
UPDATE rate_modifiers
SET start_time = '22:00:00', end_time = '06:00:00'
WHERE modifier_type = 'night';

-- Mileage Rates
INSERT INTO mileage_rates (pricing_strategy_id, rate_per_mile, minimum_billable_miles, effective_date)
VALUES
  ('11111111-1111-1111-1111-111111111111', 0.6550, 5.0, '2024-01-01'),
  ('22222222-2222-2222-2222-222222222222', 0.5800, 10.0, '2024-01-01'),
  ('33333333-3333-3333-3333-333333333333', 0.5000, 10.0, '2024-01-01');

-- Payer Fee Schedules (Medicare Example)
INSERT INTO payer_fee_schedules (pricing_strategy_id, payer_name, service_type, procedure_code, allowed_amount, max_units_per_day, effective_date)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Medicare', 'personal_care', 'T1019', 28.50, 8, '2024-01-01'),
  ('22222222-2222-2222-2222-222222222222', 'Medicare', 'skilled_nursing', 'G0299', 65.00, 4, '2024-01-01'),
  ('22222222-2222-2222-2222-222222222222', 'Medicare', 'physical_therapy', 'G0151', 72.00, 3, '2024-01-01');

-- Payer Fee Schedules (Medicaid Example)
INSERT INTO payer_fee_schedules (pricing_strategy_id, payer_name, service_type, allowed_amount, max_units_per_day, effective_date)
VALUES
  ('33333333-3333-3333-3333-333333333333', 'Medicaid', 'personal_care', 22.75, 10, '2024-01-01'),
  ('33333333-3333-3333-3333-333333333333', 'Medicaid', 'companionship', 18.50, 8, '2024-01-01'),
  ('33333333-3333-3333-3333-333333333333', 'Medicaid', 'respite_care', 25.00, 12, '2024-01-01');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get effective rate for a service
CREATE OR REPLACE FUNCTION get_service_rate(
  p_pricing_strategy_id UUID,
  p_service_type VARCHAR,
  p_visit_date TIMESTAMP
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_base_rate DECIMAL(10, 2);
BEGIN
  SELECT hourly_rate INTO v_base_rate
  FROM service_rates
  WHERE pricing_strategy_id = p_pricing_strategy_id
    AND service_type = p_service_type;

  RETURN COALESCE(v_base_rate, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate visit amount with modifiers
CREATE OR REPLACE FUNCTION calculate_visit_amount(
  p_visit_id UUID
) RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_amount DECIMAL(10, 2);
  v_base_rate DECIMAL(10, 2);
  v_hours DECIMAL(5, 2);
  v_pricing_strategy_id UUID;
  v_service_type VARCHAR;
BEGIN
  -- Get visit details
  SELECT
    pricing_strategy_id,
    visit_type,
    billable_hours
  INTO
    v_pricing_strategy_id,
    v_service_type,
    v_hours
  FROM visits
  WHERE id = p_visit_id;

  -- Get base rate
  SELECT hourly_rate INTO v_base_rate
  FROM service_rates
  WHERE pricing_strategy_id = v_pricing_strategy_id
    AND service_type = v_service_type;

  -- Calculate base amount
  v_amount := v_base_rate * v_hours;

  -- TODO: Apply modifiers based on time of day, day of week, etc.

  RETURN v_amount;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_strategies_updated_at BEFORE UPDATE ON pricing_strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_rates_updated_at BEFORE UPDATE ON service_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_modifiers_updated_at BEFORE UPDATE ON rate_modifiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Active Pricing Summary
CREATE OR REPLACE VIEW v_active_pricing_summary AS
SELECT
  ps.id AS strategy_id,
  ps.name AS strategy_name,
  ps.strategy_type,
  COUNT(DISTINCT sr.id) AS service_count,
  COUNT(DISTINCT rm.id) AS modifier_count,
  COUNT(DISTINCT pfs.id) AS payer_schedule_count,
  COUNT(DISTINCT c.id) AS client_count
FROM pricing_strategies ps
LEFT JOIN service_rates sr ON ps.id = sr.pricing_strategy_id
LEFT JOIN rate_modifiers rm ON ps.id = rm.pricing_strategy_id
LEFT JOIN payer_fee_schedules pfs ON ps.id = pfs.pricing_strategy_id
LEFT JOIN clients c ON ps.id = c.pricing_strategy_id
WHERE ps.is_active = true
GROUP BY ps.id, ps.name, ps.strategy_type;

-- View: Service Rate Comparison
CREATE OR REPLACE VIEW v_service_rate_comparison AS
SELECT
  sr.service_type,
  sr.service_name,
  ps.name AS strategy_name,
  sr.hourly_rate,
  sr.minimum_hours,
  sr.minimum_charge
FROM service_rates sr
JOIN pricing_strategies ps ON sr.pricing_strategy_id = ps.id
WHERE ps.is_active = true
ORDER BY sr.service_type, ps.strategy_type;
