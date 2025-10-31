/**
 * Central Email Notification Services Export
 *
 * This file provides a unified interface to all email notification services.
 * Import this file to access all email notification functions.
 *
 * Usage:
 * import { emailNotifications } from '@/services';
 *
 * await emailNotifications.agency.sendNewClientSignupEmail({ ... });
 * await emailNotifications.caregiver.sendVisitAssignmentEmail({ ... });
 * await emailNotifications.family.sendCareNoteEmail({ ... });
 */

// Agency Email Services
import {
  sendNewClientSignupEmail,
  sendCaregiverApplicationEmail,
  sendBillingIssueEmail,
  sendIncidentReportEmail,
} from './emailService';

// Caregiver Email Services
import {
  sendVisitAssignmentEmail,
  sendVisitReminderEmail,
  sendScheduleChangeEmail,
  sendPaymentProcessedEmail,
} from './emailServiceCaregiver';

// Family Email Services
import {
  sendCareNoteEmail,
  sendCaregiverArrivalEmail,
  sendCaregiverDepartureEmail,
  sendNewMedicationEmail,
} from './emailServiceFamily';

/**
 * Organized email notification services by recipient type
 */
export const emailNotifications = {
  // Agency notifications
  agency: {
    sendNewClientSignupEmail,
    sendCaregiverApplicationEmail,
    sendBillingIssueEmail,
    sendIncidentReportEmail,
  },

  // Caregiver notifications
  caregiver: {
    sendVisitAssignmentEmail,
    sendVisitReminderEmail,
    sendScheduleChangeEmail,
    sendPaymentProcessedEmail,
  },

  // Family notifications
  family: {
    sendCareNoteEmail,
    sendCaregiverArrivalEmail,
    sendCaregiverDepartureEmail,
    sendNewMedicationEmail,
  },
};

/**
 * Direct exports for convenience
 */
export {
  // Agency
  sendNewClientSignupEmail,
  sendCaregiverApplicationEmail,
  sendBillingIssueEmail,
  sendIncidentReportEmail,
  // Caregiver
  sendVisitAssignmentEmail,
  sendVisitReminderEmail,
  sendScheduleChangeEmail,
  sendPaymentProcessedEmail,
  // Family
  sendCareNoteEmail,
  sendCaregiverArrivalEmail,
  sendCaregiverDepartureEmail,
  sendNewMedicationEmail,
};

export default emailNotifications;
