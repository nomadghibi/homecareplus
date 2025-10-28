// Mock data for local development
export const mockData = {
  clients: [
    {
      id: "1",
      name: "Margaret Johnson",
      first_name: "Margaret",
      last_name: "Johnson",
      date_of_birth: "1945-03-15",
      address: "123 Oak Street, Springfield, IL 62701",
      phone: "(555) 123-4567",
      email: "margaret.j@email.com",
      emergency_contact: "John Johnson - (555) 123-4568",
      insurance: "Medicare - ID: 1234567890A",
      diagnosis: "Diabetes, Hypertension",
      status: "active",
      admission_date: "2024-01-15",
      caregiver_id: "1",
      created_date: "2024-01-15T09:00:00.000Z"
    },
    {
      id: "2",
      name: "Robert Williams",
      first_name: "Robert",
      last_name: "Williams",
      date_of_birth: "1938-07-22",
      address: "456 Maple Avenue, Springfield, IL 62702",
      phone: "(555) 234-5678",
      email: "r.williams@email.com",
      emergency_contact: "Sarah Williams - (555) 234-5679",
      insurance: "Medicaid - ID: 9876543210B",
      diagnosis: "Alzheimer's Disease, Arthritis",
      status: "active",
      admission_date: "2024-02-20",
      caregiver_id: "2",
      created_date: "2024-02-20T10:30:00.000Z"
    },
    {
      id: "3",
      name: "Dorothy Martinez",
      first_name: "Dorothy",
      last_name: "Martinez",
      date_of_birth: "1942-11-08",
      address: "789 Pine Road, Springfield, IL 62703",
      phone: "(555) 345-6789",
      email: "dorothy.m@email.com",
      emergency_contact: "Carlos Martinez - (555) 345-6790",
      insurance: "Private Insurance - ID: 5555666677C",
      diagnosis: "COPD, Heart Disease",
      status: "active",
      admission_date: "2024-03-10",
      caregiver_id: "3",
      created_date: "2024-03-10T14:15:00.000Z"
    }
  ],

  caregivers: [
    {
      id: "1",
      name: "Jennifer Smith",
      first_name: "Jennifer",
      last_name: "Smith",
      email: "jennifer.smith@agency.com",
      phone: "(555) 111-2222",
      certifications: ["CNA", "CPR Certified", "First Aid"],
      hire_date: "2022-01-15",
      status: "active",
      availability: "Full-time",
      rating: 4.8,
      completed_visits: 1250,
      created_date: "2022-01-15T08:00:00.000Z"
    },
    {
      id: "2",
      name: "Michael Brown",
      first_name: "Michael",
      last_name: "Brown",
      email: "michael.brown@agency.com",
      phone: "(555) 222-3333",
      certifications: ["RN", "BLS", "Medication Administration", "Wound Care"],
      hire_date: "2021-06-20",
      status: "active",
      availability: "Full-time",
      rating: 4.9,
      completed_visits: 1840,
      created_date: "2021-06-20T08:00:00.000Z"
    },
    {
      id: "3",
      name: "Amanda Davis",
      first_name: "Amanda",
      last_name: "Davis",
      email: "amanda.davis@agency.com",
      phone: "(555) 333-4444",
      certifications: ["LPN", "CPR Certified", "Phlebotomy"],
      hire_date: "2023-03-10",
      status: "active",
      availability: "Part-time",
      rating: 4.7,
      completed_visits: 580,
      created_date: "2023-03-10T08:00:00.000Z"
    }
  ],

  visits: [
    {
      id: "1",
      client_id: "1",
      client_name: "Margaret Johnson",
      caregiver_id: "1",
      caregiver_name: "Jennifer Smith",
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: "09:00",
      scheduled_start_time: "09:00:00",
      scheduled_end_time: "11:00:00",
      duration: 120,
      status: "scheduled",
      service_type: "Personal Care",
      tasks: ["Bathing", "Medication", "Meal Preparation"],
      created_date: new Date().toISOString()
    },
    {
      id: "2",
      client_id: "2",
      client_name: "Robert Williams",
      caregiver_id: "2",
      caregiver_name: "Michael Brown",
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: "11:00",
      scheduled_start_time: "11:00:00",
      scheduled_end_time: "14:00:00",
      duration: 180,
      status: "in_progress",
      service_type: "Skilled Nursing",
      tasks: ["Vital Signs", "Medication", "Wound Care"],
      created_date: new Date().toISOString()
    },
    {
      id: "3",
      client_id: "3",
      client_name: "Dorothy Martinez",
      caregiver_id: "3",
      caregiver_name: "Amanda Davis",
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: "14:00",
      scheduled_start_time: "14:00:00",
      scheduled_end_time: "16:00:00",
      duration: 120,
      status: "scheduled",
      service_type: "Personal Care",
      tasks: ["Exercise", "Medication", "Companionship"],
      created_date: new Date().toISOString()
    },
    {
      id: "4",
      client_id: "1",
      client_name: "Margaret Johnson",
      caregiver_id: "1",
      caregiver_name: "Jennifer Smith",
      scheduled_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      scheduled_time: "09:00",
      scheduled_start_time: "09:00:00",
      scheduled_end_time: "11:00:00",
      duration: 120,
      status: "completed",
      service_type: "Personal Care",
      visit_type: "personal_care",
      tasks: ["Bathing", "Medication", "Meal Preparation"],
      created_date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "5",
      client_id: "1",
      client_name: "Margaret Johnson",
      caregiver_id: "1",
      caregiver_name: "Jennifer Smith",
      scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduled_time: "09:00",
      scheduled_start_time: "09:00:00",
      scheduled_end_time: "11:00:00",
      duration: 120,
      status: "scheduled",
      service_type: "Personal Care",
      visit_type: "personal_care",
      tasks: ["Bathing", "Medication", "Meal Preparation"],
      created_date: new Date().toISOString()
    },
    {
      id: "6",
      client_id: "1",
      client_name: "Margaret Johnson",
      caregiver_id: "1",
      caregiver_name: "Jennifer Smith",
      scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      scheduled_time: "14:00",
      scheduled_start_time: "14:00:00",
      scheduled_end_time: "16:00:00",
      duration: 120,
      status: "scheduled",
      service_type: "Companionship",
      visit_type: "companionship",
      tasks: ["Conversation", "Light Exercise", "Reading"],
      created_date: new Date().toISOString()
    },
    {
      id: "7",
      client_id: "1",
      client_name: "Margaret Johnson",
      caregiver_id: "2",
      caregiver_name: "Michael Brown",
      scheduled_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
      scheduled_time: "10:00",
      scheduled_start_time: "10:00:00",
      scheduled_end_time: "12:00:00",
      duration: 120,
      status: "scheduled",
      service_type: "Skilled Nursing",
      visit_type: "skilled_nursing",
      tasks: ["Vital Signs", "Wound Care", "Medication Administration"],
      created_date: new Date().toISOString()
    }
  ],

  evvEvents: [
    {
      id: "1",
      visit_id: "4",
      client_name: "Margaret Johnson",
      caregiver_name: "Jennifer Smith",
      clock_in: new Date(Date.now() - 86400000).toISOString(),
      clock_out: new Date(Date.now() - 79200000).toISOString(),
      verification_method: "GPS",
      verification_status: "valid",
      status: "verified",
      location: "123 Oak Street, Springfield, IL",
      created_date: new Date(Date.now() - 86400000).toISOString()
    }
  ],

  claims: [
    {
      id: "1",
      client_name: "Margaret Johnson",
      service_date: "2024-01-20",
      service_date_from: "2024-01-20T00:00:00.000Z",
      service_date_to: "2024-01-20T00:00:00.000Z",
      submission_date: "2024-01-21T00:00:00.000Z",
      amount: 450.00,
      total_charge: 450.00,
      paid_amount: 450.00,
      status: "paid",
      claim_status: "paid",
      payer: "Medicare",
      claim_number: "CLM-2024-001",
      days_outstanding: 15,
      created_date: "2024-01-21T00:00:00.000Z"
    },
    {
      id: "2",
      client_name: "Robert Williams",
      service_date: "2024-01-22",
      service_date_from: "2024-01-22T00:00:00.000Z",
      service_date_to: "2024-01-22T00:00:00.000Z",
      submission_date: "2024-01-23T00:00:00.000Z",
      amount: 680.00,
      total_charge: 680.00,
      paid_amount: 680.00,
      status: "accepted",
      claim_status: "accepted",
      payer: "Medicaid",
      claim_number: "CLM-2024-002",
      days_outstanding: 25,
      created_date: "2024-01-23T00:00:00.000Z"
    },
    {
      id: "3",
      client_name: "Dorothy Martinez",
      service_date: "2024-01-25",
      service_date_from: "2024-01-25T00:00:00.000Z",
      service_date_to: "2024-01-25T00:00:00.000Z",
      submission_date: "2024-01-26T00:00:00.000Z",
      amount: 520.00,
      total_charge: 520.00,
      paid_amount: 0,
      status: "pending",
      claim_status: "submitted",
      payer: "Private Insurance",
      claim_number: "CLM-2024-003",
      days_outstanding: 35,
      created_date: "2024-01-26T00:00:00.000Z"
    }
  ],

  documents: [
    {
      id: "1",
      name: "Care Plan - Margaret Johnson",
      type: "Care Plan",
      uploadDate: "2024-01-15",
      size: "245 KB",
      uploadedBy: "Admin User"
    },
    {
      id: "2",
      name: "Medical History - Robert Williams",
      type: "Medical Record",
      uploadDate: "2024-02-20",
      size: "512 KB",
      uploadedBy: "Admin User"
    }
  ],

  messages: [
    {
      id: "1",
      from: "Jennifer Smith",
      subject: "Client Update - Margaret Johnson",
      preview: "Margaret is doing well today. Blood pressure is stable...",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: "2",
      from: "Michael Brown",
      subject: "Schedule Change Request",
      preview: "Requesting to swap shifts on Thursday...",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ],

  medications: [
    {
      id: "1",
      client_id: "1",
      clientId: "1",
      clientName: "Margaret Johnson",
      medication_name: "Metformin",
      medicationName: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Anderson",
      startDate: "2024-01-15",
      instructions: "Take with meals",
      special_instructions: "Take with meals to avoid stomach upset",
      status: "active",
      schedule_times: ["08:00", "20:00"],
      created_date: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "2",
      client_id: "1",
      clientId: "1",
      clientName: "Margaret Johnson",
      medication_name: "Lisinopril",
      medicationName: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Anderson",
      startDate: "2024-01-15",
      instructions: "Take in the morning",
      special_instructions: "Take in the morning before breakfast",
      status: "active",
      schedule_times: ["08:00"],
      created_date: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "3",
      client_id: "2",
      clientId: "2",
      clientName: "Robert Williams",
      medication_name: "Donepezil",
      medicationName: "Donepezil",
      dosage: "10mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Smith",
      startDate: "2024-02-20",
      instructions: "Take at bedtime",
      special_instructions: "Take at bedtime with a full glass of water",
      status: "active",
      schedule_times: ["21:00"],
      created_date: "2024-02-20T00:00:00.000Z"
    },
    {
      id: "4",
      client_id: "1",
      clientId: "1",
      clientName: "Margaret Johnson",
      medication_name: "Vitamin D3",
      medicationName: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      prescribedBy: "Dr. Anderson",
      startDate: "2024-01-15",
      instructions: "Take with food",
      special_instructions: "Take with food for better absorption",
      status: "active",
      schedule_times: ["12:00"],
      created_date: "2024-01-15T00:00:00.000Z"
    }
  ],

  carePlans: [
    {
      id: "1",
      clientId: "1",
      clientName: "Margaret Johnson",
      planName: "Diabetes Management Plan",
      startDate: "2024-01-15",
      status: "Active",
      goals: ["Monitor blood glucose", "Medication compliance", "Diet management"]
    },
    {
      id: "2",
      clientId: "2",
      clientName: "Robert Williams",
      planName: "Alzheimer's Care Plan",
      startDate: "2024-02-20",
      status: "Active",
      goals: ["Memory support", "Safety monitoring", "Social engagement"]
    }
  ],

  incidents: [
    {
      id: "1",
      client_id: "1",
      client_name: "Margaret Johnson",
      incident_type: "Minor Fall",
      date: "2024-01-25",
      incident_date: "2024-01-25T10:30:00.000Z",
      severity: "Low",
      reported_by: "Jennifer Smith",
      status: "Resolved",
      description: "Client slipped while walking to bathroom. No injuries.",
      created_date: "2024-01-25T10:45:00.000Z"
    }
  ],

  familyMembers: [
    {
      id: "1",
      clientId: "1",
      name: "John Johnson",
      relationship: "Son",
      phone: "(555) 123-4568",
      email: "john.johnson@email.com",
      portalAccess: true
    },
    {
      id: "2",
      clientId: "2",
      name: "Sarah Williams",
      relationship: "Daughter",
      phone: "(555) 234-5679",
      email: "sarah.williams@email.com",
      portalAccess: true
    }
  ],

  auditLogs: [
    {
      id: "1",
      action: "Client Created",
      user: "Admin User",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: "Created client record: Margaret Johnson"
    },
    {
      id: "2",
      action: "Visit Completed",
      user: "Jennifer Smith",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: "Completed visit for Margaret Johnson"
    }
  ],

  familyPortalAccess: [
    {
      id: "1",
      family_member_id: "1",
      client_id: "1",
      status: "active",
      permissions: {
        view_schedule: true,
        view_visit_notes: true,
        view_medications: true,
        message_team: true,
        upload_documents: true,
        rate_visits: true
      },
      created_date: "2024-01-15T00:00:00.000Z",
      activated_date: "2024-01-15T00:00:00.000Z"
    },
    {
      id: "2",
      family_member_id: "2",
      client_id: "2",
      status: "active",
      permissions: {
        view_schedule: true,
        view_visit_notes: true,
        view_medications: true,
        message_team: true,
        upload_documents: false,
        rate_visits: true
      },
      created_date: "2024-02-20T00:00:00.000Z",
      activated_date: "2024-02-20T00:00:00.000Z"
    }
  ],

  visitRatings: [
    {
      id: "1",
      visit_id: "4",
      client_id: "1",
      caregiver_id: "1",
      rated_by: "John Johnson",
      overall_rating: 5,
      professionalism: 5,
      punctuality: 5,
      quality_of_care: 5,
      communication: 5,
      comments: "Jennifer was wonderful! Very professional and caring. Mom really enjoys her visits.",
      created_date: new Date(Date.now() - 72000000).toISOString()
    },
    {
      id: "2",
      visit_id: "4",
      client_id: "2",
      caregiver_id: "2",
      rated_by: "Sarah Williams",
      overall_rating: 5,
      professionalism: 5,
      punctuality: 4,
      quality_of_care: 5,
      communication: 5,
      comments: "Michael is excellent with my father. Very patient and understanding.",
      created_date: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

// Dashboard stats
export const mockStats = {
  fillRate: 94.5,
  totalClients: 3,
  totalCaregivers: 3,
  evvVerificationRate: 98.2,
  pendingClaims: 1,
  approvedClaims: 1,
  deniedClaims: 0,
  avgDSO: 28,
  totalRevenue: 145650,
  monthlyGrowth: 12.5
};

// Pricing Strategies
export const mockPricingStrategies = {
  strategies: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Standard Private Pay",
      description: "Default pricing for private pay clients",
      strategy_type: "private_pay",
      is_active: true,
      is_default: true,
      effective_date: "2024-01-01",
      expiration_date: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Medicare Fee Schedule",
      description: "Medicare approved rates and guidelines",
      strategy_type: "medicare",
      is_active: true,
      is_default: false,
      effective_date: "2024-01-01",
      expiration_date: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Medicaid Fee Schedule",
      description: "State Medicaid rates for home care services",
      strategy_type: "medicaid",
      is_active: true,
      is_default: false,
      effective_date: "2024-01-01",
      expiration_date: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      name: "Premium Care Package",
      description: "Premium rates for enhanced concierge-level services",
      strategy_type: "premium",
      is_active: true,
      is_default: false,
      effective_date: "2024-01-01",
      expiration_date: null,
      created_at: "2024-01-01T00:00:00.000Z",
      updated_at: "2024-01-01T00:00:00.000Z"
    }
  ],

  serviceRates: [
    // Standard Private Pay Rates
    { id: "sr-1", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "personal_care", service_name: "Personal Care Services", hourly_rate: 35.00, minimum_hours: 2, minimum_charge: 70.00, billing_increment_minutes: 15 },
    { id: "sr-2", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "companionship", service_name: "Companionship", hourly_rate: 28.00, minimum_hours: 2, minimum_charge: 56.00, billing_increment_minutes: 15 },
    { id: "sr-3", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "medication_management", service_name: "Medication Management", hourly_rate: 40.00, minimum_hours: 1, minimum_charge: 40.00, billing_increment_minutes: 15 },
    { id: "sr-4", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "skilled_nursing", service_name: "Skilled Nursing (RN)", hourly_rate: 75.00, minimum_hours: 1, minimum_charge: 75.00, billing_increment_minutes: 15 },
    { id: "sr-5", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "physical_therapy", service_name: "Physical Therapy", hourly_rate: 85.00, minimum_hours: 1, minimum_charge: 85.00, billing_increment_minutes: 15 },
    { id: "sr-6", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "respite_care", service_name: "Respite Care", hourly_rate: 32.00, minimum_hours: 4, minimum_charge: 128.00, billing_increment_minutes: 30 },
    { id: "sr-7", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "meal_preparation", service_name: "Meal Preparation", hourly_rate: 30.00, minimum_hours: 1, minimum_charge: 30.00, billing_increment_minutes: 15 },
    { id: "sr-8", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "transportation", service_name: "Transportation Services", hourly_rate: 25.00, minimum_hours: 1, minimum_charge: 25.00, billing_increment_minutes: 30 },
    { id: "sr-9", pricing_strategy_id: "11111111-1111-1111-1111-111111111111", service_type: "homemaking", service_name: "Homemaking Services", hourly_rate: 28.00, minimum_hours: 2, minimum_charge: 56.00, billing_increment_minutes: 15 },

    // Medicare Rates (typically lower)
    { id: "sr-10", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", service_type: "personal_care", service_name: "Personal Care Services", hourly_rate: 28.50, minimum_hours: 1, minimum_charge: 28.50, billing_increment_minutes: 15 },
    { id: "sr-11", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", service_type: "skilled_nursing", service_name: "Skilled Nursing (RN)", hourly_rate: 65.00, minimum_hours: 1, minimum_charge: 65.00, billing_increment_minutes: 15 },
    { id: "sr-12", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", service_type: "physical_therapy", service_name: "Physical Therapy", hourly_rate: 72.00, minimum_hours: 1, minimum_charge: 72.00, billing_increment_minutes: 15 },

    // Medicaid Rates (lowest)
    { id: "sr-13", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", service_type: "personal_care", service_name: "Personal Care Services", hourly_rate: 22.75, minimum_hours: 1, minimum_charge: 22.75, billing_increment_minutes: 15 },
    { id: "sr-14", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", service_type: "companionship", service_name: "Companionship", hourly_rate: 18.50, minimum_hours: 2, minimum_charge: 37.00, billing_increment_minutes: 15 },
    { id: "sr-15", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", service_type: "respite_care", service_name: "Respite Care", hourly_rate: 25.00, minimum_hours: 4, minimum_charge: 100.00, billing_increment_minutes: 30 },

    // Premium Rates (highest)
    { id: "sr-16", pricing_strategy_id: "44444444-4444-4444-4444-444444444444", service_type: "personal_care", service_name: "Premium Personal Care", hourly_rate: 55.00, minimum_hours: 2, minimum_charge: 110.00, billing_increment_minutes: 15 },
    { id: "sr-17", pricing_strategy_id: "44444444-4444-4444-4444-444444444444", service_type: "companionship", service_name: "Premium Companionship", hourly_rate: 45.00, minimum_hours: 2, minimum_charge: 90.00, billing_increment_minutes: 15 },
    { id: "sr-18", pricing_strategy_id: "44444444-4444-4444-4444-444444444444", service_type: "skilled_nursing", service_name: "Premium Skilled Nursing", hourly_rate: 95.00, minimum_hours: 1, minimum_charge: 95.00, billing_increment_minutes: 15 }
  ],

  rateModifiers: [
    {
      id: "rm-1",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      modifier_name: "Weekend Premium",
      modifier_type: "weekend",
      applies_to_service_types: null, // applies to all
      multiplier: 1.25,
      flat_amount: null,
      start_time: null,
      end_time: null,
      days_of_week: [0, 6], // Sunday and Saturday
      is_active: true,
      priority: 1
    },
    {
      id: "rm-2",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      modifier_name: "Evening Rate (6PM-10PM)",
      modifier_type: "evening",
      applies_to_service_types: null,
      multiplier: 1.15,
      flat_amount: null,
      start_time: "18:00:00",
      end_time: "22:00:00",
      days_of_week: null, // applies to all days
      is_active: true,
      priority: 2
    },
    {
      id: "rm-3",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      modifier_name: "Night Rate (10PM-6AM)",
      modifier_type: "night",
      applies_to_service_types: null,
      multiplier: 1.35,
      flat_amount: null,
      start_time: "22:00:00",
      end_time: "06:00:00",
      days_of_week: null,
      is_active: true,
      priority: 3
    },
    {
      id: "rm-4",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      modifier_name: "Holiday Premium",
      modifier_type: "holiday",
      applies_to_service_types: null,
      multiplier: 1.50,
      flat_amount: null,
      start_time: null,
      end_time: null,
      days_of_week: null,
      is_active: true,
      priority: 4
    },
    {
      id: "rm-5",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      modifier_name: "Emergency Call (< 24hr notice)",
      modifier_type: "emergency",
      applies_to_service_types: null,
      multiplier: 1.40,
      flat_amount: null,
      start_time: null,
      end_time: null,
      days_of_week: null,
      is_active: true,
      priority: 5
    }
  ],

  mileageRates: [
    {
      id: "mr-1",
      pricing_strategy_id: "11111111-1111-1111-1111-111111111111",
      rate_per_mile: 0.6550,
      minimum_billable_miles: 5.0,
      maximum_billable_miles: null,
      applies_to_service_types: null,
      effective_date: "2024-01-01",
      expiration_date: null,
      notes: "IRS standard mileage rate for 2024"
    },
    {
      id: "mr-2",
      pricing_strategy_id: "22222222-2222-2222-2222-222222222222",
      rate_per_mile: 0.5800,
      minimum_billable_miles: 10.0,
      maximum_billable_miles: 50.0,
      applies_to_service_types: null,
      effective_date: "2024-01-01",
      expiration_date: null,
      notes: "Medicare allowed mileage rate"
    },
    {
      id: "mr-3",
      pricing_strategy_id: "33333333-3333-3333-3333-333333333333",
      rate_per_mile: 0.5000,
      minimum_billable_miles: 10.0,
      maximum_billable_miles: 40.0,
      applies_to_service_types: null,
      effective_date: "2024-01-01",
      expiration_date: null,
      notes: "State Medicaid mileage reimbursement"
    }
  ],

  payerFeeSchedules: [
    // Medicare
    { id: "pfs-1", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", payer_name: "Medicare", service_type: "personal_care", procedure_code: "T1019", allowed_amount: 28.50, unit_type: "hour", max_units_per_day: 8, effective_date: "2024-01-01" },
    { id: "pfs-2", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", payer_name: "Medicare", service_type: "skilled_nursing", procedure_code: "G0299", allowed_amount: 65.00, unit_type: "hour", max_units_per_day: 4, effective_date: "2024-01-01" },
    { id: "pfs-3", pricing_strategy_id: "22222222-2222-2222-2222-222222222222", payer_name: "Medicare", service_type: "physical_therapy", procedure_code: "G0151", allowed_amount: 72.00, unit_type: "hour", max_units_per_day: 3, effective_date: "2024-01-01" },

    // Medicaid
    { id: "pfs-4", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", payer_name: "Medicaid", service_type: "personal_care", procedure_code: null, allowed_amount: 22.75, unit_type: "hour", max_units_per_day: 10, effective_date: "2024-01-01" },
    { id: "pfs-5", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", payer_name: "Medicaid", service_type: "companionship", procedure_code: null, allowed_amount: 18.50, unit_type: "hour", max_units_per_day: 8, effective_date: "2024-01-01" },
    { id: "pfs-6", pricing_strategy_id: "33333333-3333-3333-3333-333333333333", payer_name: "Medicaid", service_type: "respite_care", procedure_code: null, allowed_amount: 25.00, unit_type: "hour", max_units_per_day: 12, effective_date: "2024-01-01" }
  ]
};
