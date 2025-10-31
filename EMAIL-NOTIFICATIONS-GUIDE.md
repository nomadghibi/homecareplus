# Email Notifications Implementation Guide

## Overview

This guide covers the complete email notification system for Care Connect Pro. The system sends automated emails to agencies, caregivers, and family members for critical events.

## Table of Contents

1. [Setup](#setup)
2. [Available Notifications](#available-notifications)
3. [Usage Examples](#usage-examples)
4. [Integration Points](#integration-points)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `re_...`)

### 2. Configure Environment Variables

Update your `.env` file:

```env
# Email Service Configuration (Resend)
VITE_RESEND_API_KEY=re_your_actual_api_key_here
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_SUPPORT_EMAIL=support@yourdomain.com
```

### 3. Domain Verification (Production)

For production use:
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., careconnectpro.com)
3. Add DNS records as instructed
4. Wait for verification (usually 15-30 minutes)
5. Update `VITE_FROM_EMAIL` to use your verified domain

**Note:** In development, you can use Resend's test mode which delivers to your registered email only.

---

## Available Notifications

### Agency Notifications

#### 1. New Client Sign-Up
Notifies agency when a new client registers.

**Trigger:** Client completes registration

**Parameters:**
```javascript
{
  agencyEmail: string,      // Agency's email address
  clientName: string,       // Client's full name
  clientEmail: string,      // Client's email
  signupDate: Date          // When they signed up
}
```

#### 2. Caregiver Application
Notifies agency of new caregiver applications.

**Trigger:** Caregiver submits application

**Parameters:**
```javascript
{
  agencyEmail: string,      // Agency's email address
  caregiverName: string,    // Applicant's name
  caregiverEmail: string,   // Applicant's email
  phone: string,            // Applicant's phone
  applicationDate: Date     // Application date
}
```

#### 3. Billing Issue
Alerts agency about billing problems.

**Trigger:** Billing error detected

**Parameters:**
```javascript
{
  agencyEmail: string,      // Agency's email
  issueType: string,        // Type of issue
  description: string,      // Detailed description
  claimId: string,          // Related claim ID
  clientName: string        // Affected client
}
```

#### 4. Incident Report
Critical alerts for incidents.

**Trigger:** Incident is reported

**Parameters:**
```javascript
{
  agencyEmail: string,      // Agency's email
  incidentType: string,     // Type of incident
  severity: string,         // 'low', 'medium', 'high', 'critical'
  clientName: string,       // Involved client
  caregiverName: string,    // Involved caregiver
  incidentDate: Date,       // When it occurred
  description: string,      // Full description
  incidentId: string        // Incident ID
}
```

---

### Caregiver Notifications

#### 1. New Visit Assigned
Notifies caregiver of new visit assignment.

**Trigger:** Visit is created/assigned

**Parameters:**
```javascript
{
  caregiverEmail: string,
  caregiverId: string,
  caregiverName: string,
  clientName: string,
  visitId: string,
  visitDate: Date,
  visitTime: string,
  duration: string,
  address: string,
  specialInstructions: string (optional)
}
```

#### 2. Visit Reminder
Reminder sent 1 hour before visit.

**Trigger:** 1 hour before scheduled visit

**Parameters:**
```javascript
{
  caregiverEmail: string,
  caregiverId: string,
  caregiverName: string,
  clientName: string,
  visitId: string,
  visitTime: string,
  address: string
}
```

#### 3. Schedule Change
Notifies of changes to scheduled visits.

**Trigger:** Visit is rescheduled/cancelled

**Parameters:**
```javascript
{
  caregiverEmail: string,
  caregiverId: string,
  caregiverName: string,
  clientName: string,
  visitId: string,
  changeType: string,       // 'Rescheduled', 'Cancelled', etc.
  oldDateTime: Date (optional),
  newDateTime: Date (optional),
  reason: string (optional)
}
```

#### 4. Payment Processed
Confirmation of payment.

**Trigger:** Payment is processed

**Parameters:**
```javascript
{
  caregiverEmail: string,
  caregiverId: string,
  caregiverName: string,
  paymentAmount: number,
  paymentPeriod: string,
  paymentDate: Date,
  paymentMethod: string,
  hoursWorked: number,
  visitCount: number
}
```

---

### Family Notifications

#### 1. New Care Note
Updates family when caregiver adds notes.

**Trigger:** Care note is completed

**Parameters:**
```javascript
{
  familyEmail: string,
  familyMemberId: string,
  familyMemberName: string,
  clientName: string,
  caregiverName: string,
  noteDate: Date,
  noteContent: string,
  activities: string[] (optional),
  mood: string (optional),  // 'great', 'good', 'okay', 'poor'
  visitId: string
}
```

#### 2. Caregiver Arrival
Real-time notification when caregiver arrives.

**Trigger:** Caregiver clocks in

**Parameters:**
```javascript
{
  familyEmail: string,
  familyMemberId: string,
  familyMemberName: string,
  clientName: string,
  caregiverName: string,
  arrivalTime: Date,
  visitId: string
}
```

#### 3. Caregiver Departure
Notification when visit is complete.

**Trigger:** Caregiver clocks out

**Parameters:**
```javascript
{
  familyEmail: string,
  familyMemberId: string,
  familyMemberName: string,
  clientName: string,
  caregiverName: string,
  departureTime: Date,
  visitDuration: string,
  visitId: string
}
```

#### 4. New Medication Added
Alerts family of new medications.

**Trigger:** Medication is added to care plan

**Parameters:**
```javascript
{
  familyEmail: string,
  familyMemberId: string,
  familyMemberName: string,
  clientName: string,
  medicationName: string,
  dosage: string,
  frequency: string,
  startDate: Date,
  prescribedBy: string (optional),
  purpose: string (optional),
  medicationId: string
}
```

---

## Usage Examples

### Import the Services

```javascript
// Option 1: Import organized by type
import { emailNotifications } from '@/services';

// Option 2: Import specific functions
import {
  sendNewClientSignupEmail,
  sendVisitAssignmentEmail
} from '@/services';
```

### Example 1: Send Client Sign-Up Email

```javascript
// In your client registration handler
import { emailNotifications } from '@/services';

async function handleClientRegistration(clientData) {
  // ... save client to database ...

  // Send email to agency
  await emailNotifications.agency.sendNewClientSignupEmail({
    agencyEmail: 'admin@agency.com',
    clientName: `${clientData.firstName} ${clientData.lastName}`,
    clientEmail: clientData.email,
    signupDate: new Date(),
  });
}
```

### Example 2: Send Visit Assignment Email

```javascript
// In your visit creation handler
import { emailNotifications } from '@/services';

async function createVisit(visitData) {
  // ... save visit to database ...

  // Send email to caregiver
  await emailNotifications.caregiver.sendVisitAssignmentEmail({
    caregiverEmail: visitData.caregiver.email,
    caregiverId: visitData.caregiver.id,
    caregiverName: visitData.caregiver.name,
    clientName: visitData.client.name,
    visitId: visit.id,
    visitDate: visitData.scheduledStart,
    visitTime: formatTime(visitData.scheduledStart),
    duration: `${visitData.duration} hours`,
    address: visitData.client.address,
    specialInstructions: visitData.specialInstructions,
  });
}
```

### Example 3: Send Incident Alert

```javascript
// In your incident reporting handler
import { emailNotifications } from '@/services';

async function reportIncident(incidentData) {
  // ... save incident to database ...

  // Send immediate alert to agency
  await emailNotifications.agency.sendIncidentReportEmail({
    agencyEmail: 'admin@agency.com',
    incidentType: incidentData.type,
    severity: incidentData.severity,
    clientName: incidentData.client.name,
    caregiverName: incidentData.caregiver.name,
    incidentDate: new Date(),
    description: incidentData.description,
    incidentId: incident.id,
  });
}
```

### Example 4: Send Family Care Note

```javascript
// In your care documentation handler
import { emailNotifications } from '@/services';

async function submitCareNote(noteData) {
  // ... save note to database ...

  // Get all family members for this client
  const familyMembers = await getFamilyMembers(noteData.clientId);

  // Send email to each family member
  for (const family of familyMembers) {
    await emailNotifications.family.sendCareNoteEmail({
      familyEmail: family.email,
      familyMemberId: family.id,
      familyMemberName: family.name,
      clientName: noteData.client.name,
      caregiverName: noteData.caregiver.name,
      noteDate: new Date(),
      noteContent: noteData.content,
      activities: noteData.activities,
      mood: noteData.mood,
      visitId: noteData.visitId,
    });
  }
}
```

---

## Integration Points

### Where to Add Email Notifications

#### 1. Client Management (`src/components/clients/ClientForm.jsx`)

```javascript
// After successful client creation
await emailNotifications.agency.sendNewClientSignupEmail({...});
```

#### 2. Visit Scheduling (`src/pages/Schedule.jsx`)

```javascript
// After creating/updating a visit
await emailNotifications.caregiver.sendVisitAssignmentEmail({...});

// For schedule changes
await emailNotifications.caregiver.sendScheduleChangeEmail({...});
```

#### 3. Mobile App EVV (`src/pages/MobileApp.jsx`)

```javascript
// On clock in
await emailNotifications.family.sendCaregiverArrivalEmail({...});

// On clock out
await emailNotifications.family.sendCaregiverDepartureEmail({...});
```

#### 4. Documentation (`src/pages/Documentation.jsx`)

```javascript
// After completing visit notes
await emailNotifications.family.sendCareNoteEmail({...});
```

#### 5. Incident Reporting (`src/components/incidents/IncidentForm.jsx`)

```javascript
// Immediately after incident is reported
await emailNotifications.agency.sendIncidentReportEmail({...});
```

#### 6. Medications (`src/pages/Medications.jsx`)

```javascript
// After adding new medication
await emailNotifications.family.sendNewMedicationEmail({...});
```

#### 7. Billing (`src/pages/Billing.jsx`)

```javascript
// When billing issues are detected
await emailNotifications.agency.sendBillingIssueEmail({...});
```

#### 8. Caregiver Management (`src/pages/Caregivers.jsx`)

```javascript
// When new caregiver applies
await emailNotifications.agency.sendCaregiverApplicationEmail({...});

// When payment is processed
await emailNotifications.caregiver.sendPaymentProcessedEmail({...});
```

---

## Automated Reminders

### Visit Reminders (1 Hour Before)

To send automated visit reminders, you can use a scheduled job or Supabase Edge Function:

```javascript
// Example: Supabase Edge Function (runs every 10 minutes)
import { emailNotifications } from './services';
import { supabase } from './supabaseClient';

Deno.serve(async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  // Find visits starting in the next hour
  const { data: upcomingVisits } = await supabase
    .from('visits')
    .select('*, caregiver:caregivers(*), client:clients(*)')
    .gte('scheduled_start', now.toISOString())
    .lte('scheduled_start', oneHourLater.toISOString())
    .eq('status', 'scheduled')
    .is('reminder_sent', false);

  // Send reminders
  for (const visit of upcomingVisits) {
    await emailNotifications.caregiver.sendVisitReminderEmail({
      caregiverEmail: visit.caregiver.email,
      caregiverId: visit.caregiver.id,
      caregiverName: `${visit.caregiver.first_name} ${visit.caregiver.last_name}`,
      clientName: `${visit.client.first_name} ${visit.client.last_name}`,
      visitId: visit.id,
      visitTime: formatTime(visit.scheduled_start),
      address: visit.client.address,
    });

    // Mark as sent
    await supabase
      .from('visits')
      .update({ reminder_sent: true })
      .eq('id', visit.id);
  }

  return new Response('Reminders sent', { status: 200 });
});
```

---

## Testing

### Test in Development

The email service will log attempts to console if API key is not configured:

```javascript
// With no API key configured
⚠️ Resend API key not configured. Email would be sent to: user@example.com
Subject: New Visit Assigned
```

### Test with Real Emails

1. Get a Resend API key
2. Add to `.env`:
   ```env
   VITE_RESEND_API_KEY=re_your_test_key
   ```
3. Use your own email address for testing:
   ```javascript
   await emailNotifications.caregiver.sendVisitAssignmentEmail({
     caregiverEmail: 'your-email@example.com',
     // ... other params
   });
   ```
4. Check your inbox!

### Test Email Template

Create a test page to preview all email templates:

```javascript
// src/pages/EmailTest.jsx
import { emailNotifications } from '@/services';

export default function EmailTest() {
  const testAgencyEmail = async () => {
    await emailNotifications.agency.sendNewClientSignupEmail({
      agencyEmail: 'your-email@example.com',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      signupDate: new Date(),
    });
    alert('Test email sent! Check your inbox.');
  };

  return (
    <div>
      <h1>Email Notification Tests</h1>
      <button onClick={testAgencyEmail}>
        Test Agency Email
      </button>
      {/* Add more test buttons */}
    </div>
  );
}
```

---

## Troubleshooting

### Emails Not Sending

**Problem:** No emails arriving

**Solutions:**
1. Check API key is correct in `.env`
2. Verify domain is verified in Resend (production)
3. Check Resend dashboard logs
4. Look for errors in browser console

### Emails Going to Spam

**Problem:** Emails ending up in spam folder

**Solutions:**
1. Verify domain with SPF/DKIM records
2. Use a custom domain (not generic)
3. Warm up your sending reputation gradually
4. Check email content doesn't trigger spam filters

### Rate Limiting

**Problem:** Too many emails being blocked

**Solutions:**
1. Check Resend rate limits for your plan
2. Implement queuing for bulk sends
3. Batch notifications where possible
4. Upgrade Resend plan if needed

### Missing Data in Emails

**Problem:** Template variables showing as undefined

**Solutions:**
1. Check all required parameters are passed
2. Verify data exists before calling email function
3. Add console.log to debug parameter values
4. Use optional chaining for optional fields

---

## Production Checklist

Before going to production:

- [ ] Resend API key is configured (live key, not test)
- [ ] Domain is verified with DNS records
- [ ] `VITE_FROM_EMAIL` uses verified domain
- [ ] `VITE_SUPPORT_EMAIL` is monitored
- [ ] Test emails sent successfully
- [ ] Email templates reviewed for branding
- [ ] All integration points implemented
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Rate limiting considered
- [ ] Monitoring/alerts set up

---

## Next Steps

1. **Set up Resend account and configure API key**
2. **Test email functions in development**
3. **Integrate notification calls into your app** (see Integration Points)
4. **Set up automated reminders** (Edge Functions or cron jobs)
5. **Monitor email delivery** in Resend dashboard
6. **Customize templates** to match your branding

---

## Support

- **Resend Documentation:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference/emails/send-email
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions

---

**Your email notification system is ready! 📧**

Start by configuring your Resend API key, then begin integrating notification calls throughout your application.
