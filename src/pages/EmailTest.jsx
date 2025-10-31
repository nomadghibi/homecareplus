import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Import email services
import {
  sendNewClientSignupEmail,
  sendCaregiverApplicationEmail,
  sendBillingIssueEmail,
  sendIncidentReportEmail,
} from '../services/emailService';

import {
  sendVisitAssignmentEmail,
  sendVisitReminderEmail,
  sendScheduleChangeEmail,
  sendPaymentProcessedEmail,
} from '../services/emailServiceCaregiver';

import {
  sendCareNoteEmail,
  sendCaregiverArrivalEmail,
  sendCaregiverDepartureEmail,
  sendNewMedicationEmail,
} from '../services/emailServiceFamily';

export default function EmailTest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async (type) => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      switch (type) {
        case 'agency-client':
          await sendNewClientSignupEmail({
            agencyEmail: email,
            clientName: 'John Test Client',
            clientEmail: 'john@testclient.com',
            signupDate: new Date(),
          });
          break;

        case 'agency-caregiver':
          await sendCaregiverApplicationEmail({
            agencyEmail: email,
            caregiverName: 'Sarah Test Caregiver',
            caregiverEmail: 'sarah@testcaregiver.com',
            phone: '(555) 123-4567',
            applicationDate: new Date(),
          });
          break;

        case 'agency-billing':
          await sendBillingIssueEmail({
            agencyEmail: email,
            issueType: 'Claim Rejected',
            description: 'Insurance claim was rejected due to missing authorization code.',
            claimId: 'CLM-2024-001',
            clientName: 'Jane Smith',
          });
          break;

        case 'agency-incident':
          await sendIncidentReportEmail({
            agencyEmail: email,
            incidentType: 'Fall',
            severity: 'high',
            clientName: 'Robert Johnson',
            caregiverName: 'Mary Williams',
            incidentDate: new Date(),
            description: 'Client experienced a minor fall. No injuries sustained.',
            incidentId: 'INC-2024-042',
          });
          break;

        case 'caregiver-visit':
          await sendVisitAssignmentEmail({
            caregiverEmail: email,
            caregiverId: 'CG-123',
            caregiverName: 'Test Caregiver',
            clientName: 'Margaret Davis',
            visitId: 'VST-2024-789',
            visitDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            visitTime: '2:00 PM',
            duration: '2 hours',
            address: '123 Main Street, Anytown, ST 12345',
            specialInstructions: 'Please bring medication supplies.',
          });
          break;

        case 'caregiver-reminder':
          await sendVisitReminderEmail({
            caregiverEmail: email,
            caregiverId: 'CG-123',
            caregiverName: 'Test Caregiver',
            clientName: 'Margaret Davis',
            visitId: 'VST-2024-789',
            visitTime: '3:00 PM',
            address: '123 Main Street, Anytown, ST 12345',
          });
          break;

        case 'caregiver-schedule':
          await sendScheduleChangeEmail({
            caregiverEmail: email,
            caregiverId: 'CG-123',
            caregiverName: 'Test Caregiver',
            clientName: 'Margaret Davis',
            visitId: 'VST-2024-789',
            changeType: 'Rescheduled',
            oldDateTime: new Date(),
            newDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
            reason: 'Client has a doctor appointment.',
          });
          break;

        case 'caregiver-payment':
          await sendPaymentProcessedEmail({
            caregiverEmail: email,
            caregiverId: 'CG-123',
            caregiverName: 'Test Caregiver',
            paymentAmount: 1250.00,
            paymentPeriod: 'December 1-15, 2024',
            paymentDate: new Date(),
            paymentMethod: 'Direct Deposit',
            hoursWorked: 62.5,
            visitCount: 25,
          });
          break;

        case 'family-note':
          await sendCareNoteEmail({
            familyEmail: email,
            familyMemberId: 'FM-456',
            familyMemberName: 'Test Family Member',
            clientName: 'Mom',
            caregiverName: 'Mary Williams',
            noteDate: new Date(),
            noteContent: 'Had a wonderful visit today! All medications administered on schedule.',
            activities: ['Morning walk', 'Meal preparation', 'Medication'],
            mood: 'great',
            visitId: 'VST-2024-789',
          });
          break;

        case 'family-arrival':
          await sendCaregiverArrivalEmail({
            familyEmail: email,
            familyMemberId: 'FM-456',
            familyMemberName: 'Test Family Member',
            clientName: 'Mom',
            caregiverName: 'Mary Williams',
            arrivalTime: new Date(),
            visitId: 'VST-2024-789',
          });
          break;

        case 'family-departure':
          await sendCaregiverDepartureEmail({
            familyEmail: email,
            familyMemberId: 'FM-456',
            familyMemberName: 'Test Family Member',
            clientName: 'Mom',
            caregiverName: 'Mary Williams',
            departureTime: new Date(),
            visitDuration: '2h 15m',
            visitId: 'VST-2024-789',
          });
          break;

        case 'family-medication':
          await sendNewMedicationEmail({
            familyEmail: email,
            familyMemberId: 'FM-456',
            familyMemberName: 'Test Family Member',
            clientName: 'Mom',
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: new Date(),
            prescribedBy: 'Dr. James Anderson',
            purpose: 'Blood pressure management',
            medicationId: 'MED-2024-123',
          });
          break;

        default:
          throw new Error('Unknown email type');
      }

      toast.success('✅ Test email sent! Check your inbox (and spam folder).');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error(`❌ Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            📧 Email Notification Test Center
          </h1>
          <p className="text-slate-600">
            Test all 12 email notification templates
          </p>
        </div>

        {/* Email Input */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white text-lg p-6"
            />
            <span className="text-sm text-slate-600 whitespace-nowrap font-medium">
              {email ? '✅ Ready' : '⚠️ Enter email'}
            </span>
          </div>
        </div>

        {/* Agency Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            🏢 Agency Notifications
          </h2>
          <p className="text-slate-600 mb-6">
            Critical alerts for agency administrators
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => sendTestEmail('agency-client')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              <span className="text-lg font-semibold">🎉 New Client Sign-Up</span>
              <span className="text-xs opacity-90">Client registration notification</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('agency-caregiver')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            >
              <span className="text-lg font-semibold">👋 Caregiver Application</span>
              <span className="text-xs opacity-90">New application received</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('agency-billing')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <span className="text-lg font-semibold">⚠️ Billing Issue</span>
              <span className="text-xs opacity-90">Critical billing problem</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('agency-incident')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
            >
              <span className="text-lg font-semibold">🚨 Incident Report</span>
              <span className="text-xs opacity-90">High severity incident</span>
            </Button>
          </div>
        </div>

        {/* Caregiver Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            👨‍⚕️ Caregiver Notifications
          </h2>
          <p className="text-slate-600 mb-6">
            Updates and reminders for caregivers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => sendTestEmail('caregiver-visit')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              <span className="text-lg font-semibold">📅 Visit Assigned</span>
              <span className="text-xs opacity-90">New visit assignment</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('caregiver-reminder')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              <span className="text-lg font-semibold">⏰ Visit Reminder</span>
              <span className="text-xs opacity-90">1 hour before visit</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('caregiver-schedule')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <span className="text-lg font-semibold">📝 Schedule Change</span>
              <span className="text-xs opacity-90">Visit rescheduled</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('caregiver-payment')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <span className="text-lg font-semibold">💰 Payment Processed</span>
              <span className="text-xs opacity-90">Payment confirmation</span>
            </Button>
          </div>
        </div>

        {/* Family Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            👨‍👩‍👧 Family Notifications
          </h2>
          <p className="text-slate-600 mb-6">
            Keep families informed and engaged
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => sendTestEmail('family-note')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
            >
              <span className="text-lg font-semibold">📝 Care Note</span>
              <span className="text-xs opacity-90">Daily care update</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('family-arrival')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              <span className="text-lg font-semibold">✅ Caregiver Arrived</span>
              <span className="text-xs opacity-90">Real-time arrival</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('family-departure')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <span className="text-lg font-semibold">👋 Visit Complete</span>
              <span className="text-xs opacity-90">Departure notification</span>
            </Button>

            <Button
              onClick={() => sendTestEmail('family-medication')}
              disabled={loading || !email}
              className="h-auto py-6 flex flex-col items-start text-left bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <span className="text-lg font-semibold">💊 New Medication</span>
              <span className="text-xs opacity-90">Medication added</span>
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="space-y-3 text-sm text-slate-600">
            <p>✅ <strong>API Key:</strong> Configured and ready</p>
            <p>📧 <strong>From:</strong> noreply@careconnectpro.com</p>
            <p>⚠️ <strong>Note:</strong> Check spam folder if emails don't arrive</p>
            <p>📊 <strong>Tracking:</strong> All emails logged in Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
