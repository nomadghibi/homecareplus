-- Care Connect Pro - Sample Seed Data
-- Run this after creating the schema to populate the database with sample data

-- ============================================
-- SAMPLE CLIENTS
-- ============================================

INSERT INTO clients (first_name, last_name, date_of_birth, gender, phone, email, address, city, state, zip_code,
                     emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
                     primary_diagnosis, secondary_diagnoses, allergies, special_instructions,
                     insurance_provider, insurance_policy_number, status, admission_date, language, mobility_status, cognitive_status, fall_risk)
VALUES
  ('Margaret', 'Johnson', '1942-03-15', 'Female', '555-0101', 'mjohnson@email.com', '123 Oak Street', 'Boston', 'MA', '02101',
   'Sarah Johnson', '555-0102', 'Daughter',
   'Diabetes Type 2, Hypertension', ARRAY['Arthritis', 'COPD'], ARRAY['Penicillin', 'Sulfa drugs'], 'Prefers morning visits, hearing impaired',
   'Medicare', 'MED123456789', 'active', '2023-01-15', 'English', 'Walker assistance', 'Alert and oriented', 'Medium'),

  ('Robert', 'Williams', '1938-07-22', 'Male', '555-0103', 'rwilliams@email.com', '456 Maple Avenue', 'Cambridge', 'MA', '02138',
   'Jennifer Williams', '555-0104', 'Daughter',
   'Post-stroke care, Hypertension', ARRAY['Diabetes Type 2'], ARRAY['None known'], 'Left-side weakness, speech therapy ongoing',
   'Blue Cross Blue Shield', 'BCBS987654321', 'active', '2023-06-20', 'English', 'Wheelchair bound', 'Alert and oriented', 'High'),

  ('Dorothy', 'Martinez', '1945-11-08', 'Female', '555-0105', 'dmartinez@email.com', '789 Pine Road', 'Brookline', 'MA', '02445',
   'Carlos Martinez', '555-0106', 'Son',
   'Alzheimer''s disease (early stage)', ARRAY['Hypertension', 'Osteoporosis'], ARRAY['Latex'], 'Memory care protocol, familiar caregiver preferred',
   'Medicare & Medicaid', 'MED456789123', 'active', '2024-02-10', 'Spanish', 'Independent with supervision', 'Mild cognitive impairment', 'Low');

-- ============================================
-- SAMPLE CAREGIVERS
-- ============================================

INSERT INTO caregivers (first_name, last_name, email, phone, address, city, state, zip_code, date_of_birth,
                       hire_date, employment_type, hourly_rate, certifications, license_number, license_expiry,
                       cpr_certification_expiry, first_aid_certification_expiry, background_check_date, background_check_status,
                       skills, languages, max_hours_per_week, status, rating, total_visits)
VALUES
  ('Sarah', 'Anderson', 'sanderson@careconnect.com', '555-0201', '321 Elm Street', 'Boston', 'MA', '02115', '1985-04-12',
   '2022-01-15', 'Full-time', 28.50, ARRAY['CNA', 'CPR', 'First Aid', 'Dementia Care'],
   'CNA-MA-12345', '2026-12-31', '2025-08-15', '2025-08-15', '2024-01-10', 'Cleared',
   ARRAY['Personal Care', 'Medication Management', 'Vital Signs', 'Dementia Care', 'Mobility Assistance'],
   ARRAY['English', 'Spanish'], 40, 'active', 4.85, 247),

  ('Michael', 'Chen', 'mchen@careconnect.com', '555-0202', '654 Birch Lane', 'Cambridge', 'MA', '02139', '1990-09-25',
   '2023-03-20', 'Full-time', 26.00, ARRAY['HHA', 'CPR', 'First Aid'],
   'HHA-MA-67890', '2026-06-30', '2025-11-20', '2025-11-20', '2023-03-01', 'Cleared',
   ARRAY['Personal Care', 'Meal Preparation', 'Light Housekeeping', 'Companionship'],
   ARRAY['English', 'Mandarin'], 40, 'active', 4.72, 189),

  ('Jessica', 'Thompson', 'jthompson@careconnect.com', '555-0203', '987 Cedar Court', 'Brookline', 'MA', '02446', '1988-12-03',
   '2021-11-05', 'Part-time', 27.00, ARRAY['CNA', 'CPR', 'First Aid', 'Wound Care'],
   'CNA-MA-54321', '2025-09-30', '2025-06-10', '2025-06-10', '2023-11-01', 'Cleared',
   ARRAY['Personal Care', 'Medication Management', 'Wound Care', 'Post-surgical Care', 'Vital Signs'],
   ARRAY['English'], 25, 'active', 4.90, 312);

-- ============================================
-- SAMPLE VISITS
-- ============================================

-- Get IDs for relationships (you'll need to adjust these UUIDs after insertion)
DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  client3_id UUID;
  caregiver1_id UUID;
  caregiver2_id UUID;
  caregiver3_id UUID;
BEGIN
  -- Get client IDs
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO client2_id FROM clients WHERE email = 'rwilliams@email.com';
  SELECT id INTO client3_id FROM clients WHERE email = 'dmartinez@email.com';

  -- Get caregiver IDs
  SELECT id INTO caregiver1_id FROM caregivers WHERE email = 'sanderson@careconnect.com';
  SELECT id INTO caregiver2_id FROM caregivers WHERE email = 'mchen@careconnect.com';
  SELECT id INTO caregiver3_id FROM caregivers WHERE email = 'jthompson@careconnect.com';

  -- Insert visits
  INSERT INTO visits (client_id, caregiver_id, scheduled_start, scheduled_end, actual_start, actual_end,
                     status, visit_type, tasks, billable_hours, mileage)
  VALUES
    (client1_id, caregiver1_id,
     NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours',
     NULL, NULL, 'scheduled', 'Personal Care',
     ARRAY['Assistance with bathing', 'Medication reminder', 'Meal preparation', 'Light housekeeping'],
     2.0, 5.2),

    (client2_id, caregiver2_id,
     NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours',
     NULL, NULL, 'scheduled', 'Skilled Nursing',
     ARRAY['Vital signs monitoring', 'Medication administration', 'Physical therapy exercises', 'Mobility assistance'],
     2.0, 8.5),

    (client3_id, caregiver3_id,
     NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '3 hours',
     NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 hours 55 minutes',
     'completed', 'Companionship',
     ARRAY['Memory care activities', 'Medication reminder', 'Meal preparation', 'Conversation and engagement'],
     2.92, 3.7),

    (client1_id, caregiver3_id,
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
     'completed', 'Personal Care',
     ARRAY['Assistance with bathing', 'Grooming', 'Medication administration'],
     2.0, 5.2);

END $$;

-- ============================================
-- SAMPLE FAMILY MEMBERS
-- ============================================

DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  client3_id UUID;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO client2_id FROM clients WHERE email = 'rwilliams@email.com';
  SELECT id INTO client3_id FROM clients WHERE email = 'dmartinez@email.com';

  INSERT INTO family_members (client_id, first_name, last_name, relationship, email, phone,
                              is_primary_contact, is_emergency_contact, can_approve_services)
  VALUES
    (client1_id, 'Sarah', 'Johnson', 'Daughter', 'sarah.johnson@email.com', '555-0102', true, true, true),
    (client2_id, 'Jennifer', 'Williams', 'Daughter', 'jennifer.williams@email.com', '555-0104', true, true, true),
    (client3_id, 'Carlos', 'Martinez', 'Son', 'carlos.martinez@email.com', '555-0106', true, true, true);
END $$;

-- ============================================
-- SAMPLE MEDICATIONS
-- ============================================

DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  client3_id UUID;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO client2_id FROM clients WHERE email = 'rwilliams@email.com';
  SELECT id INTO client3_id FROM clients WHERE email = 'dmartinez@email.com';

  INSERT INTO medication_schedules (client_id, medication_name, dosage, route, frequency, times_per_day,
                                   schedule_times, start_date, prescribing_physician, purpose, side_effects,
                                   special_instructions, refills_remaining, status)
  VALUES
    (client1_id, 'Metformin', '500mg', 'Oral', 'Twice daily', 2,
     ARRAY['08:00', '20:00'], '2023-01-15', 'Dr. Smith', 'Diabetes management',
     ARRAY['Nausea', 'Diarrhea'], 'Take with food', 3, 'active'),

    (client1_id, 'Lisinopril', '10mg', 'Oral', 'Once daily', 1,
     ARRAY['08:00'], '2023-01-15', 'Dr. Smith', 'Blood pressure control',
     ARRAY['Dizziness', 'Dry cough'], 'Take in morning', 5, 'active'),

    (client2_id, 'Warfarin', '5mg', 'Oral', 'Once daily', 1,
     ARRAY['18:00'], '2023-06-20', 'Dr. Johnson', 'Blood thinner for stroke prevention',
     ARRAY['Bleeding', 'Bruising'], 'Avoid vitamin K rich foods. INR monitoring required.', 2, 'active'),

    (client3_id, 'Donepezil', '10mg', 'Oral', 'Once daily', 1,
     ARRAY['20:00'], '2024-02-10', 'Dr. Lee', 'Alzheimer''s disease management',
     ARRAY['Nausea', 'Insomnia', 'Loss of appetite'], 'Take at bedtime', 4, 'active');
END $$;

-- ============================================
-- SAMPLE CARE PLANS
-- ============================================

DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO client2_id FROM clients WHERE email = 'rwilliams@email.com';

  INSERT INTO care_plans (client_id, name, description, start_date, status, goals, interventions, schedule)
  VALUES
    (client1_id, 'Diabetes Management & ADL Support',
     'Comprehensive care plan focused on diabetes management, medication adherence, and assistance with activities of daily living.',
     '2023-01-15', 'active',
     '[
       {"id": "1", "description": "Maintain blood glucose levels within target range (80-130 mg/dL)", "target_date": "2025-12-31", "status": "in-progress"},
       {"id": "2", "description": "Improve mobility and reduce fall risk", "target_date": "2025-06-30", "status": "in-progress"},
       {"id": "3", "description": "Maintain independence in personal care activities", "target_date": "2025-12-31", "status": "in-progress"}
     ]'::jsonb,
     '[
       {"id": "1", "description": "Blood glucose monitoring twice daily", "frequency": "Twice daily"},
       {"id": "2", "description": "Medication administration as prescribed", "frequency": "Per schedule"},
       {"id": "3", "description": "Assistance with bathing and grooming", "frequency": "3 times per week"},
       {"id": "4", "description": "Meal preparation with diabetic diet", "frequency": "Daily"}
     ]'::jsonb,
     '{"visits_per_week": 5, "hours_per_visit": 2, "preferred_times": ["morning"]}'::jsonb),

    (client2_id, 'Post-Stroke Rehabilitation',
     'Intensive rehabilitation plan focused on regaining mobility, speech, and independence following stroke.',
     '2023-06-20', 'active',
     '[
       {"id": "1", "description": "Improve left-side strength and mobility", "target_date": "2025-09-30", "status": "in-progress"},
       {"id": "2", "description": "Enhance speech clarity and communication", "target_date": "2025-08-31", "status": "in-progress"},
       {"id": "3", "description": "Achieve independence in wheelchair transfers", "target_date": "2025-07-31", "status": "in-progress"}
     ]'::jsonb,
     '[
       {"id": "1", "description": "Physical therapy exercises", "frequency": "Daily"},
       {"id": "2", "description": "Speech therapy activities", "frequency": "3 times per week"},
       {"id": "3", "description": "Transfer and mobility training", "frequency": "Daily"},
       {"id": "4", "description": "Vital signs monitoring", "frequency": "Every visit"}
     ]'::jsonb,
     '{"visits_per_week": 7, "hours_per_visit": 2, "preferred_times": ["morning", "afternoon"]}'::jsonb);
END $$;

-- ============================================
-- SAMPLE CLAIMS
-- ============================================

DO $$
DECLARE
  client1_id UUID;
  client2_id UUID;
  visit1_id UUID;
  visit2_id UUID;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO client2_id FROM clients WHERE email = 'rwilliams@email.com';

  -- Get completed visit IDs
  SELECT id INTO visit1_id FROM visits WHERE client_id = client1_id AND status = 'completed' LIMIT 1;
  SELECT id INTO visit2_id FROM visits WHERE client_id = client2_id LIMIT 1;

  INSERT INTO claims (claim_number, client_id, visit_ids, service_date, submission_date, status,
                     insurance_provider, policy_number, total_amount, diagnosis_codes, procedure_codes, service_units)
  VALUES
    ('CLM-2025-001', client1_id, ARRAY[visit1_id], CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day',
     'submitted', 'Medicare', 'MED123456789', 142.00,
     ARRAY['E11.9', 'I10'], ARRAY['G0156', '99509'], 2),

    ('CLM-2025-002', client2_id, ARRAY[visit2_id], CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '2 days',
     'pending', 'Blue Cross Blue Shield', 'BCBS987654321', 198.50,
     ARRAY['I69.351', 'I10', 'E11.9'], ARRAY['G0157', '99509'], 2);
END $$;

-- ============================================
-- SAMPLE DOCUMENTS
-- ============================================

DO $$
DECLARE
  client1_id UUID;
  caregiver1_id UUID;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';
  SELECT id INTO caregiver1_id FROM caregivers WHERE email = 'sanderson@careconnect.com';

  INSERT INTO documents (name, description, file_type, file_size, file_url, category,
                        related_entity_type, related_entity_id, uploaded_by, is_template)
  VALUES
    ('Care Plan - Margaret Johnson', 'Initial care plan document', 'application/pdf', 245760,
     'https://example.com/documents/careplan-mjohnson.pdf', 'care-plans',
     'client', client1_id, caregiver1_id, false),

    ('Insurance Card - Medicare', 'Front and back of Medicare card', 'image/jpeg', 156890,
     'https://example.com/documents/insurance-medicare-mjohnson.jpg', 'insurance-card',
     'client', client1_id, caregiver1_id, false),

    ('CNA License - Sarah Anderson', 'Current CNA certification', 'application/pdf', 189450,
     'https://example.com/documents/cna-license-sanderson.pdf', 'license',
     'caregiver', caregiver1_id, caregiver1_id, false);
END $$;

-- ============================================
-- SAMPLE CHANNELS & MESSAGES
-- ============================================

DO $$
DECLARE
  caregiver1_id UUID;
  caregiver2_id UUID;
  channel_id UUID;
BEGIN
  SELECT id INTO caregiver1_id FROM caregivers WHERE email = 'sanderson@careconnect.com';
  SELECT id INTO caregiver2_id FROM caregivers WHERE email = 'mchen@careconnect.com';

  -- Create a channel
  INSERT INTO channels (name, type, participant_ids, created_by, last_message_at)
  VALUES ('Team Discussion', 'group', ARRAY[caregiver1_id, caregiver2_id], caregiver1_id, NOW())
  RETURNING id INTO channel_id;

  -- Add messages to the channel
  INSERT INTO messages (channel_id, sender_id, sender_name, content, read_by)
  VALUES
    (channel_id, caregiver1_id, 'Sarah Anderson',
     'Hi team! Just wanted to coordinate on Mrs. Johnson''s schedule for next week.',
     ARRAY[caregiver1_id]),

    (channel_id, caregiver2_id, 'Michael Chen',
     'Thanks Sarah! I can cover Monday and Wednesday if that works.',
     ARRAY[caregiver1_id, caregiver2_id]);
END $$;

-- ============================================
-- SAMPLE AUDIT LOGS
-- ============================================

DO $$
DECLARE
  caregiver1_id UUID;
  client1_id UUID;
BEGIN
  SELECT id INTO caregiver1_id FROM caregivers WHERE email = 'sanderson@careconnect.com';
  SELECT id INTO client1_id FROM clients WHERE email = 'mjohnson@email.com';

  INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, entity_name, changes)
  VALUES
    (caregiver1_id, 'Sarah Anderson', 'UPDATE', 'Client', client1_id, 'Margaret Johnson',
     '{"field": "status", "old_value": "pending", "new_value": "active"}'::jsonb),

    (caregiver1_id, 'Sarah Anderson', 'CREATE', 'Visit', NULL, 'New Visit - Margaret Johnson',
     '{"client": "Margaret Johnson", "date": "2025-01-27"}'::jsonb);
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'Seed data inserted successfully!' as message,
       (SELECT COUNT(*) FROM clients) as clients_count,
       (SELECT COUNT(*) FROM caregivers) as caregivers_count,
       (SELECT COUNT(*) FROM visits) as visits_count,
       (SELECT COUNT(*) FROM medication_schedules) as medications_count,
       (SELECT COUNT(*) FROM care_plans) as care_plans_count,
       (SELECT COUNT(*) FROM claims) as claims_count,
       (SELECT COUNT(*) FROM documents) as documents_count,
       (SELECT COUNT(*) FROM family_members) as family_members_count;
