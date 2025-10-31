/**
 * Email Notification Service
 *
 * Handles sending emails through Resend API for all notification types:
 * - Agency notifications (client signup, caregiver applications, billing, incidents)
 * - Caregiver notifications (visit assignments, reminders, schedule changes, payments)
 * - Family notifications (care notes, arrival/departure, medications)
 */

import { supabase } from '../api/supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@careconnectpro.com';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@careconnectpro.com';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

/**
 * Base email sender function using Supabase Edge Function
 * This calls a Supabase Edge Function which then calls Resend API
 * (Email APIs cannot be called directly from browser due to CORS)
 */
async function sendEmail({ to, subject, html, replyTo = SUPPORT_EMAIL }) {
  if (!SUPABASE_URL) {
    console.warn('⚠️ Supabase not configured. Email would be sent to:', to);
    console.log('Subject:', subject);
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to send email');
    }

    console.log('✅ Email sent successfully:', data.emailId);
    return { success: true, emailId: data.emailId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Log email notifications to reminders table for tracking
 */
async function logEmailReminder({
  type,
  relatedEntityId,
  relatedEntityType,
  recipientType,
  recipientId,
  recipientEmail,
  title,
  message,
  status = 'sent',
  errorMessage = null
}) {
  try {
    const { error } = await supabase
      .from('reminders')
      .insert([{
        type,
        related_entity_id: relatedEntityId,
        related_entity_type: relatedEntityType,
        recipient_type: recipientType,
        recipient_id: recipientId,
        recipient_email: recipientEmail,
        title,
        message,
        reminder_datetime: new Date().toISOString(),
        notification_method: 'email',
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        error_message: errorMessage,
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error logging email reminder:', error);
  }
}

// ============================================
// AGENCY EMAIL NOTIFICATIONS
// ============================================

/**
 * Send email when new client signs up
 */
export async function sendNewClientSignupEmail({ agencyEmail, clientName, clientEmail, signupDate }) {
  const subject = '🎉 New Client Sign-Up';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🎉 New Client Sign-Up
                  </h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Great news! A new client has signed up for your services.
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Client Details</h3>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Name:</strong> ${clientName}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Email:</strong> ${clientEmail}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Sign-up Date:</strong> ${new Date(signupDate).toLocaleDateString()}
                    </p>
                  </div>

                  <p style="margin: 24px 0 30px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Please review their profile and set up their care plan in the dashboard.
                  </p>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Clients"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Client Profile
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Professional Home Care Management Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: agencyEmail, subject, html });

  await logEmailReminder({
    type: 'system',
    relatedEntityType: 'client',
    relatedEntityId: null,
    recipientType: 'agency',
    recipientId: null,
    recipientEmail: agencyEmail,
    title: subject,
    message: `New client ${clientName} signed up`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email when caregiver applies
 */
export async function sendCaregiverApplicationEmail({ agencyEmail, caregiverName, caregiverEmail, phone, applicationDate }) {
  const subject = '👋 New Caregiver Application';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    👋 New Caregiver Application
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    You have received a new caregiver application that requires your review.
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Applicant Details</h3>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Name:</strong> ${caregiverName}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Email:</strong> ${caregiverEmail}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Phone:</strong> ${phone}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Applied:</strong> ${new Date(applicationDate).toLocaleDateString()}
                    </p>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Caregivers"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Review Application
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Professional Home Care Management Platform
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: agencyEmail, subject, html });

  await logEmailReminder({
    type: 'system',
    relatedEntityType: 'caregiver',
    relatedEntityId: null,
    recipientType: 'agency',
    recipientId: null,
    recipientEmail: agencyEmail,
    title: subject,
    message: `New caregiver application from ${caregiverName}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email for billing issues
 */
export async function sendBillingIssueEmail({ agencyEmail, issueType, description, claimId, clientName }) {
  const subject = '⚠️ Billing Issue Requires Attention';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ⚠️ Billing Issue Alert
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    A billing issue has been detected that requires your immediate attention.
                  </p>

                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #92400e; font-size: 18px;">Issue Details</h3>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Type:</strong> ${issueType}
                    </p>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Client:</strong> ${clientName}
                    </p>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Claim ID:</strong> ${claimId}
                    </p>
                    <p style="margin: 16px 0 8px; color: #78350f; font-size: 16px;">
                      <strong>Description:</strong>
                    </p>
                    <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                      ${description}
                    </p>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Billing"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Review Billing Issue
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: agencyEmail, subject, html });

  await logEmailReminder({
    type: 'system',
    relatedEntityType: 'claim',
    relatedEntityId: claimId,
    recipientType: 'agency',
    recipientId: null,
    recipientEmail: agencyEmail,
    title: subject,
    message: `Billing issue: ${issueType}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email for incident reports
 */
export async function sendIncidentReportEmail({ agencyEmail, incidentType, severity, clientName, caregiverName, incidentDate, description, incidentId }) {
  const subject = `🚨 ${severity.toUpperCase()} Incident Report: ${incidentType}`;
  const severityColor = severity === 'critical' ? '#ef4444' : severity === 'high' ? '#f59e0b' : '#3b82f6';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: ${severityColor}; border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🚨 Incident Report
                  </h1>
                  <p style="margin: 10px 0 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                    ${severity.toUpperCase()} SEVERITY
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 24px; margin: 0 0 24px;">
                    <h3 style="margin: 0 0 16px; color: #991b1b; font-size: 18px;">Incident Details</h3>
                    <p style="margin: 8px 0; color: #7f1d1d; font-size: 16px;">
                      <strong>Type:</strong> ${incidentType}
                    </p>
                    <p style="margin: 8px 0; color: #7f1d1d; font-size: 16px;">
                      <strong>Client:</strong> ${clientName}
                    </p>
                    <p style="margin: 8px 0; color: #7f1d1d; font-size: 16px;">
                      <strong>Caregiver:</strong> ${caregiverName}
                    </p>
                    <p style="margin: 8px 0; color: #7f1d1d; font-size: 16px;">
                      <strong>Date & Time:</strong> ${new Date(incidentDate).toLocaleString()}
                    </p>
                    <p style="margin: 16px 0 8px; color: #7f1d1d; font-size: 16px;">
                      <strong>Description:</strong>
                    </p>
                    <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                      ${description}
                    </p>
                  </div>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Please review this incident immediately and take appropriate action.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Incidents"
                           style="display: inline-block; padding: 16px 40px; background: ${severityColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Full Report
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: agencyEmail, subject, html });

  await logEmailReminder({
    type: 'incident',
    relatedEntityType: 'incident',
    relatedEntityId: incidentId,
    recipientType: 'agency',
    recipientId: null,
    recipientEmail: agencyEmail,
    title: subject,
    message: `${severity} severity incident: ${incidentType}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

// Export emailService for use throughout the application
export const emailService = {
  sendNewClientSignupEmail,
  sendCaregiverApplicationEmail,
  sendBillingIssueEmail,
  sendIncidentReportEmail,
  // More functions will be added in next file...
};
