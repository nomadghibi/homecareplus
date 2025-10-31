# Email Notification Integration Examples

This document provides **copy-paste ready code** for integrating email notifications into your existing components.

## Quick Start Integration

### 1. Visit Assignment (Schedule.jsx)

Add this to your visit creation/assignment handler:

```javascript
import { emailNotifications } from '@/services';

// Inside your handleCreateVisit or handleAssignCaregiver function
async function handleAssignVisit(visitData) {
  try {
    // Your existing code to create/update the visit
    const { data: visit, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select('*, caregiver:caregivers(*), client:clients(*)')
      .single();

    if (error) throw error;

    // NEW: Send email notification to caregiver
    await emailNotifications.caregiver.sendVisitAssignmentEmail({
      caregiverEmail: visit.caregiver.email,
      caregiverId: visit.caregiver.id,
      caregiverName: `${visit.caregiver.first_name} ${visit.caregiver.last_name}`,
      clientName: `${visit.client.first_name} ${visit.client.last_name}`,
      visitId: visit.id,
      visitDate: visit.scheduled_start,
      visitTime: new Date(visit.scheduled_start).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: `${visit.duration_hours || 2} hours`,
      address: `${visit.client.address}, ${visit.client.city}, ${visit.client.state} ${visit.client.zip_code}`,
      specialInstructions: visit.special_instructions || null,
    });

    toast.success('Visit assigned and caregiver notified!');
  } catch (error) {
    console.error('Error assigning visit:', error);
    toast.error('Failed to assign visit');
  }
}
```

### 2. Clock In/Out (MobileApp.jsx or EVV.jsx)

Add to your EVV clock in/out handlers:

```javascript
import { emailNotifications } from '@/services';
import { supabase } from '@/api/supabaseClient';

// Clock In Handler
async function handleClockIn(visitId) {
  try {
    // Update visit status
    const { data: visit, error } = await supabase
      .from('visits')
      .update({
        status: 'in-progress',
        actual_start: new Date().toISOString(),
        clock_in_location: gpsLocation,
      })
      .eq('id', visitId)
      .select('*, caregiver:caregivers(*), client:clients(*, family_members(*))')
      .single();

    if (error) throw error;

    // NEW: Notify all family members of arrival
    if (visit.client.family_members) {
      for (const family of visit.client.family_members) {
        if (family.email && family.notify_on_visits) {
          await emailNotifications.family.sendCaregiverArrivalEmail({
            familyEmail: family.email,
            familyMemberId: family.id,
            familyMemberName: `${family.first_name} ${family.last_name}`,
            clientName: `${visit.client.first_name} ${visit.client.last_name}`,
            caregiverName: `${visit.caregiver.first_name} ${visit.caregiver.last_name}`,
            arrivalTime: new Date(),
            visitId: visit.id,
          });
        }
      }
    }

    toast.success('Clocked in successfully!');
  } catch (error) {
    console.error('Error clocking in:', error);
    toast.error('Failed to clock in');
  }
}

// Clock Out Handler
async function handleClockOut(visitId) {
  try {
    // Update visit status
    const { data: visit, error } = await supabase
      .from('visits')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
        clock_out_location: gpsLocation,
      })
      .eq('id', visitId)
      .select('*, caregiver:caregivers(*), client:clients(*, family_members(*))')
      .single();

    if (error) throw error;

    // Calculate duration
    const duration = calculateDuration(visit.actual_start, visit.actual_end);

    // NEW: Notify family members of departure
    if (visit.client.family_members) {
      for (const family of visit.client.family_members) {
        if (family.email && family.notify_on_visits) {
          await emailNotifications.family.sendCaregiverDepartureEmail({
            familyEmail: family.email,
            familyMemberId: family.id,
            familyMemberName: `${family.first_name} ${family.last_name}`,
            clientName: `${visit.client.first_name} ${visit.client.last_name}`,
            caregiverName: `${visit.caregiver.first_name} ${visit.caregiver.last_name}`,
            departureTime: new Date(),
            visitDuration: duration,
            visitId: visit.id,
          });
        }
      }
    }

    toast.success('Clocked out successfully!');
  } catch (error) {
    console.error('Error clocking out:', error);
    toast.error('Failed to clock out');
  }
}

// Helper function
function calculateDuration(start, end) {
  const diffMs = new Date(end) - new Date(start);
  const diffMins = Math.round(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}
```

### 3. Care Notes (Documentation.jsx)

Add to your care note submission:

```javascript
import { emailNotifications } from '@/services';

async function handleSubmitCareNote(noteData) {
  try {
    // Save care note
    const { data: note, error } = await supabase
      .from('visit_notes')
      .insert([noteData])
      .select('*, visit:visits(*, client:clients(*, family_members(*)), caregiver:caregivers(*))')
      .single();

    if (error) throw error;

    // NEW: Notify family members
    const familyMembers = note.visit.client.family_members;
    if (familyMembers) {
      for (const family of familyMembers) {
        if (family.email && family.notify_on_care_notes) {
          await emailNotifications.family.sendCareNoteEmail({
            familyEmail: family.email,
            familyMemberId: family.id,
            familyMemberName: `${family.first_name} ${family.last_name}`,
            clientName: `${note.visit.client.first_name} ${note.visit.client.last_name}`,
            caregiverName: `${note.visit.caregiver.first_name} ${note.visit.caregiver.last_name}`,
            noteDate: new Date(),
            noteContent: noteData.notes,
            activities: noteData.activities_completed || [],
            mood: noteData.client_mood || null,
            visitId: note.visit.id,
          });
        }
      }
    }

    toast.success('Care note saved and family notified!');
  } catch (error) {
    console.error('Error saving care note:', error);
    toast.error('Failed to save care note');
  }
}
```

### 4. New Client Sign-Up (SignUp.jsx or Clients.jsx)

Add to your client registration:

```javascript
import { emailNotifications } from '@/services';

async function handleClientSignup(clientData) {
  try {
    // Create client account
    const { data: client, error } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (error) throw error;

    // NEW: Notify agency of new client
    // Get agency admin email from settings or hardcode
    const agencyEmail = import.meta.env.VITE_AGENCY_EMAIL || 'admin@agency.com';

    await emailNotifications.agency.sendNewClientSignupEmail({
      agencyEmail: agencyEmail,
      clientName: `${client.first_name} ${client.last_name}`,
      clientEmail: client.email,
      signupDate: new Date(),
    });

    toast.success('Welcome! Your account has been created.');
    // Redirect to client portal or dashboard
  } catch (error) {
    console.error('Error creating client:', error);
    toast.error('Failed to create account');
  }
}
```

### 5. Caregiver Application (CaregiverSetup.jsx)

Add to your caregiver application submission:

```javascript
import { emailNotifications } from '@/services';

async function handleCaregiverApplication(applicationData) {
  try {
    // Save caregiver application
    const { data: application, error } = await supabase
      .from('caregiver_applications')
      .insert([{
        ...applicationData,
        status: 'pending',
        applied_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;

    // NEW: Notify agency of new application
    const agencyEmail = import.meta.env.VITE_AGENCY_EMAIL || 'admin@agency.com';

    await emailNotifications.agency.sendCaregiverApplicationEmail({
      agencyEmail: agencyEmail,
      caregiverName: `${applicationData.first_name} ${applicationData.last_name}`,
      caregiverEmail: applicationData.email,
      phone: applicationData.phone,
      applicationDate: new Date(),
    });

    toast.success('Application submitted! We\'ll review and contact you soon.');
  } catch (error) {
    console.error('Error submitting application:', error);
    toast.error('Failed to submit application');
  }
}
```

### 6. Incident Reporting (IncidentForm.jsx)

Add to your incident report submission:

```javascript
import { emailNotifications } from '@/services';

async function handleIncidentReport(incidentData) {
  try {
    // Save incident
    const { data: incident, error } = await supabase
      .from('incidents')
      .insert([incidentData])
      .select('*, client:clients(*), caregiver:caregivers(*)')
      .single();

    if (error) throw error;

    // NEW: Immediately alert agency
    const agencyEmail = import.meta.env.VITE_AGENCY_EMAIL || 'admin@agency.com';

    await emailNotifications.agency.sendIncidentReportEmail({
      agencyEmail: agencyEmail,
      incidentType: incident.incident_type,
      severity: incident.severity,
      clientName: `${incident.client.first_name} ${incident.client.last_name}`,
      caregiverName: `${incident.caregiver.first_name} ${incident.caregiver.last_name}`,
      incidentDate: incident.incident_datetime,
      description: incident.description,
      incidentId: incident.id,
    });

    toast.success('Incident reported and agency notified immediately.');
  } catch (error) {
    console.error('Error reporting incident:', error);
    toast.error('Failed to report incident');
  }
}
```

### 7. New Medication (Medications.jsx)

Add to medication creation:

```javascript
import { emailNotifications } from '@/services';

async function handleAddMedication(medicationData) {
  try {
    // Save medication
    const { data: medication, error } = await supabase
      .from('medications')
      .insert([medicationData])
      .select('*, client:clients(*, family_members(*))')
      .single();

    if (error) throw error;

    // NEW: Notify family members
    const familyMembers = medication.client.family_members;
    if (familyMembers) {
      for (const family of familyMembers) {
        if (family.email && family.notify_on_medications) {
          await emailNotifications.family.sendNewMedicationEmail({
            familyEmail: family.email,
            familyMemberId: family.id,
            familyMemberName: `${family.first_name} ${family.last_name}`,
            clientName: `${medication.client.first_name} ${medication.client.last_name}`,
            medicationName: medication.name,
            dosage: medication.dosage,
            frequency: medication.frequency,
            startDate: medication.start_date,
            prescribedBy: medication.prescribed_by || null,
            purpose: medication.purpose || null,
            medicationId: medication.id,
          });
        }
      }
    }

    toast.success('Medication added and family notified!');
  } catch (error) {
    console.error('Error adding medication:', error);
    toast.error('Failed to add medication');
  }
}
```

### 8. Schedule Change (Schedule.jsx)

Add to visit rescheduling:

```javascript
import { emailNotifications } from '@/services';

async function handleRescheduleVisit(visitId, newDateTime, reason) {
  try {
    // Get old visit data first
    const { data: oldVisit } = await supabase
      .from('visits')
      .select('*, caregiver:caregivers(*), client:clients(*)')
      .eq('id', visitId)
      .single();

    // Update visit
    const { data: visit, error } = await supabase
      .from('visits')
      .update({
        scheduled_start: newDateTime,
        scheduled_end: new Date(new Date(newDateTime).getTime() + oldVisit.duration_hours * 60 * 60 * 1000),
      })
      .eq('id', visitId)
      .select('*, caregiver:caregivers(*), client:clients(*)')
      .single();

    if (error) throw error;

    // NEW: Notify caregiver of change
    await emailNotifications.caregiver.sendScheduleChangeEmail({
      caregiverEmail: visit.caregiver.email,
      caregiverId: visit.caregiver.id,
      caregiverName: `${visit.caregiver.first_name} ${visit.caregiver.last_name}`,
      clientName: `${visit.client.first_name} ${visit.client.last_name}`,
      visitId: visit.id,
      changeType: 'Rescheduled',
      oldDateTime: oldVisit.scheduled_start,
      newDateTime: visit.scheduled_start,
      reason: reason,
    });

    toast.success('Visit rescheduled and caregiver notified!');
  } catch (error) {
    console.error('Error rescheduling visit:', error);
    toast.error('Failed to reschedule visit');
  }
}
```

### 9. Payment Processing (Billing.jsx or Admin)

Add to payment processing:

```javascript
import { emailNotifications } from '@/services';

async function processPayment(caregiverId, paymentData) {
  try {
    // Process payment through your payment system
    const payment = await processPaymentTransaction(paymentData);

    // Save payment record
    const { data: paymentRecord, error } = await supabase
      .from('payments')
      .insert([{
        caregiver_id: caregiverId,
        amount: paymentData.amount,
        payment_date: new Date().toISOString(),
        payment_method: paymentData.method,
        period_start: paymentData.periodStart,
        period_end: paymentData.periodEnd,
      }])
      .select('*, caregiver:caregivers(*)')
      .single();

    if (error) throw error;

    // NEW: Send payment confirmation email
    await emailNotifications.caregiver.sendPaymentProcessedEmail({
      caregiverEmail: paymentRecord.caregiver.email,
      caregiverId: paymentRecord.caregiver.id,
      caregiverName: `${paymentRecord.caregiver.first_name} ${paymentRecord.caregiver.last_name}`,
      paymentAmount: paymentData.amount,
      paymentPeriod: `${formatDate(paymentData.periodStart)} - ${formatDate(paymentData.periodEnd)}`,
      paymentDate: new Date(),
      paymentMethod: paymentData.method,
      hoursWorked: paymentData.hoursWorked,
      visitCount: paymentData.visitCount,
    });

    toast.success('Payment processed and confirmation sent!');
  } catch (error) {
    console.error('Error processing payment:', error);
    toast.error('Failed to process payment');
  }
}
```

### 10. Billing Issues (Billing.jsx)

Add to billing error detection:

```javascript
import { emailNotifications } from '@/services';

async function handleBillingError(claimId, errorDetails) {
  try {
    // Log the billing error
    const { data: claim, error } = await supabase
      .from('claims')
      .update({
        status: 'error',
        error_message: errorDetails.message,
      })
      .eq('id', claimId)
      .select('*, client:clients(*)')
      .single();

    if (error) throw error;

    // NEW: Alert agency immediately
    const agencyEmail = import.meta.env.VITE_AGENCY_EMAIL || 'admin@agency.com';

    await emailNotifications.agency.sendBillingIssueEmail({
      agencyEmail: agencyEmail,
      issueType: errorDetails.type,
      description: errorDetails.message,
      claimId: claim.id,
      clientName: `${claim.client.first_name} ${claim.client.last_name}`,
    });

    toast.error('Billing error detected. Agency has been notified.');
  } catch (error) {
    console.error('Error handling billing error:', error);
  }
}
```

---

## Automated Reminder Setup

### Create Supabase Edge Function for Visit Reminders

1. Create file: `supabase/functions/send-visit-reminders/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'noreply@careconnectpro.com'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

    // Find visits starting in next hour that haven't been reminded
    const { data: visits, error } = await supabaseClient
      .from('visits')
      .select(`
        *,
        caregiver:caregivers(*),
        client:clients(*)
      `)
      .gte('scheduled_start', now.toISOString())
      .lte('scheduled_start', oneHourLater.toISOString())
      .eq('status', 'scheduled')
      .is('reminder_sent', false)

    if (error) throw error

    let sentCount = 0

    for (const visit of visits || []) {
      // Send email via Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: visit.caregiver.email,
          subject: `⏰ Visit Reminder: ${visit.client.first_name} ${visit.client.last_name} in 1 Hour`,
          html: generateReminderHTML(visit),
        }),
      })

      if (emailResponse.ok) {
        // Mark reminder as sent
        await supabaseClient
          .from('visits')
          .update({ reminder_sent: true })
          .eq('id', visit.id)

        sentCount++
      }
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent: sentCount }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function generateReminderHTML(visit: any) {
  // Use the same HTML template from emailServiceCaregiver.js
  // ... or import it if possible
  return `<!-- Your reminder email HTML -->`
}
```

2. Deploy the Edge Function:
```bash
supabase functions deploy send-visit-reminders
```

3. Schedule it to run every 10 minutes using a cron job or pg_cron:

```sql
-- In Supabase SQL Editor
SELECT cron.schedule(
  'send-visit-reminders',
  '*/10 * * * *', -- Every 10 minutes
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-visit-reminders',
    headers:='{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

---

## Environment Variables Setup

Add to your `.env` file:

```env
# Email Service Configuration
VITE_RESEND_API_KEY=re_your_api_key_here
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_SUPPORT_EMAIL=support@yourdomain.com
VITE_AGENCY_EMAIL=admin@yourdomain.com
```

---

## Quick Testing

Add this test page to quickly test emails:

```jsx
// src/pages/EmailTestPage.jsx
import { useState } from 'react';
import { emailNotifications } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');

  const testEmails = {
    agency: async () => {
      await emailNotifications.agency.sendNewClientSignupEmail({
        agencyEmail: email,
        clientName: 'John Test',
        clientEmail: 'john@test.com',
        signupDate: new Date(),
      });
      alert('Check your email!');
    },
    caregiver: async () => {
      await emailNotifications.caregiver.sendVisitAssignmentEmail({
        caregiverEmail: email,
        caregiverId: 'test-123',
        caregiverName: 'Test Caregiver',
        clientName: 'Jane Doe',
        visitId: 'visit-123',
        visitDate: new Date(),
        visitTime: '2:00 PM',
        duration: '2 hours',
        address: '123 Main St, City, ST 12345',
        specialInstructions: 'Please bring supplies',
      });
      alert('Check your email!');
    },
    family: async () => {
      await emailNotifications.family.sendCareNoteEmail({
        familyEmail: email,
        familyMemberId: 'family-123',
        familyMemberName: 'Test Family',
        clientName: 'Jane Doe',
        caregiverName: 'Mary Caregiver',
        noteDate: new Date(),
        noteContent: 'Had a great visit today. Client was in good spirits.',
        activities: ['Meal preparation', 'Light exercise', 'Medication'],
        mood: 'great',
        visitId: 'visit-123',
      });
      alert('Check your email!');
    },
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Email Testing</h1>
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 max-w-md"
      />
      <div className="space-x-4">
        <Button onClick={testEmails.agency}>Test Agency Email</Button>
        <Button onClick={testEmails.caregiver}>Test Caregiver Email</Button>
        <Button onClick={testEmails.family}>Test Family Email</Button>
      </div>
    </div>
  );
}
```

Add route in `src/pages/index.jsx`:
```javascript
<Route path="/email-test" element={<EmailTestPage />} />
```

---

**You're all set!** Copy the relevant code snippets into your components and start sending email notifications.
