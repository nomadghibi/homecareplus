/**
 * Caregiver Email Notifications
 *
 * Handles all caregiver-specific email notifications:
 * - New visit assigned
 * - Visit reminder (1 hour before)
 * - Schedule changes
 * - Payment processed
 */

import { supabase } from '../api/supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const FROM_EMAIL = import.meta.env.VITE_FROM_EMAIL || 'noreply@careconnectpro.com';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@careconnectpro.com';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

async function sendEmail({ to, subject, html, replyTo = SUPPORT_EMAIL }) {
  if (!SUPABASE_URL) {
    console.warn('⚠️ Supabase not configured. Email would be sent to:', to);
    return { success: false, error: 'Supabase not configured' };
  }

  try {
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
    if (!response.ok || !data.success) throw new Error(data.error || 'Failed to send email');

    console.log('✅ Email sent successfully:', data.emailId);
    return { success: true, emailId: data.emailId };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

async function logEmailReminder({ type, relatedEntityId, relatedEntityType, recipientType, recipientId, recipientEmail, title, message, status = 'sent', errorMessage = null }) {
  try {
    await supabase.from('reminders').insert([{
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
  } catch (error) {
    console.error('Error logging email reminder:', error);
  }
}

// ============================================
// CAREGIVER EMAIL NOTIFICATIONS
// ============================================

/**
 * Send email when new visit is assigned
 */
export async function sendVisitAssignmentEmail({
  caregiverEmail,
  caregiverId,
  caregiverName,
  clientName,
  visitId,
  visitDate,
  visitTime,
  duration,
  address,
  specialInstructions
}) {
  const subject = `📅 New Visit Assigned: ${clientName}`;
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
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    📅 New Visit Assigned
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${caregiverName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    You have been assigned to a new visit. Please review the details below:
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Visit Details</h3>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Client:</strong> ${clientName}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Date:</strong> ${new Date(visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Time:</strong> ${visitTime}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Duration:</strong> ${duration}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Address:</strong> ${address}
                    </p>
                  </div>

                  ${specialInstructions ? `
                  <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                    <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">
                      Special Instructions:
                    </p>
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                      ${specialInstructions}
                    </p>
                  </div>
                  ` : ''}

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Schedule"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Full Schedule
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Remember to clock in when you arrive and complete all required documentation after the visit.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Questions? Reply to this email or contact support.
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

  const result = await sendEmail({ to: caregiverEmail, subject, html });

  await logEmailReminder({
    type: 'visit',
    relatedEntityId: visitId,
    relatedEntityType: 'visit',
    recipientType: 'caregiver',
    recipientId: caregiverId,
    recipientEmail: caregiverEmail,
    title: subject,
    message: `New visit assigned with ${clientName}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send visit reminder 1 hour before scheduled visit
 */
export async function sendVisitReminderEmail({
  caregiverEmail,
  caregiverId,
  caregiverName,
  clientName,
  visitId,
  visitTime,
  address
}) {
  const subject = `⏰ Visit Reminder: ${clientName} in 1 Hour`;
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
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    ⏰ Visit Reminder
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 18px; line-height: 1.6; font-weight: 600;">
                    Hi ${caregiverName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    This is a reminder that you have a scheduled visit in <strong>1 hour</strong>.
                  </p>

                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #92400e; font-size: 18px;">Visit Details</h3>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Client:</strong> ${clientName}
                    </p>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Time:</strong> ${visitTime}
                    </p>
                    <p style="margin: 8px 0; color: #78350f; font-size: 16px;">
                      <strong>Address:</strong> ${address}
                    </p>
                  </div>

                  <p style="margin: 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                    Please ensure you arrive on time and have all necessary supplies.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/MobileApp"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          Clock In Now
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

  const result = await sendEmail({ to: caregiverEmail, subject, html });

  await logEmailReminder({
    type: 'visit',
    relatedEntityId: visitId,
    relatedEntityType: 'visit',
    recipientType: 'caregiver',
    recipientId: caregiverId,
    recipientEmail: caregiverEmail,
    title: subject,
    message: `Visit reminder for ${clientName}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email for schedule changes
 */
export async function sendScheduleChangeEmail({
  caregiverEmail,
  caregiverId,
  caregiverName,
  clientName,
  visitId,
  changeType,
  oldDateTime,
  newDateTime,
  reason
}) {
  const subject = `📝 Schedule Change: ${clientName} Visit ${changeType}`;
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
                    📝 Schedule Change
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${caregiverName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    There has been a change to your scheduled visit with ${clientName}.
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Change Details</h3>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Change Type:</strong> ${changeType}
                    </p>
                    ${oldDateTime ? `
                    <p style="margin: 8px 0; color: #6b7280; font-size: 16px; text-decoration: line-through;">
                      <strong>Previous:</strong> ${new Date(oldDateTime).toLocaleString()}
                    </p>
                    ` : ''}
                    ${newDateTime ? `
                    <p style="margin: 8px 0; color: #059669; font-size: 16px; font-weight: 600;">
                      <strong>New:</strong> ${new Date(newDateTime).toLocaleString()}
                    </p>
                    ` : ''}
                    ${reason ? `
                    <p style="margin: 16px 0 8px; color: #4b5563; font-size: 16px;">
                      <strong>Reason:</strong>
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      ${reason}
                    </p>
                    ` : ''}
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/Schedule"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Updated Schedule
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

  const result = await sendEmail({ to: caregiverEmail, subject, html });

  await logEmailReminder({
    type: 'visit',
    relatedEntityId: visitId,
    relatedEntityType: 'visit',
    recipientType: 'caregiver',
    recipientId: caregiverId,
    recipientEmail: caregiverEmail,
    title: subject,
    message: `Schedule change for ${clientName} visit`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email when payment is processed
 */
export async function sendPaymentProcessedEmail({
  caregiverEmail,
  caregiverId,
  caregiverName,
  paymentAmount,
  paymentPeriod,
  paymentDate,
  paymentMethod,
  hoursWorked,
  visitCount
}) {
  const subject = `💰 Payment Processed: $${paymentAmount.toFixed(2)}`;
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
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #059669 0%, #3b82f6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    💰 Payment Processed
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${caregiverName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Your payment has been successfully processed!
                  </p>

                  <div style="background-color: #d1fae5; border-left: 4px solid #059669; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 8px; color: #065f46; font-size: 16px; font-weight: 600;">
                      Payment Amount
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 36px; font-weight: bold;">
                      $${paymentAmount.toFixed(2)}
                    </p>
                  </div>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #1f2937; font-size: 18px;">Payment Details</h3>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Period:</strong> ${paymentPeriod}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Payment Date:</strong> ${new Date(paymentDate).toLocaleDateString()}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Method:</strong> ${paymentMethod}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Hours Worked:</strong> ${hoursWorked}
                    </p>
                    <p style="margin: 8px 0; color: #4b5563; font-size: 16px;">
                      <strong>Visits Completed:</strong> ${visitCount}
                    </p>
                  </div>

                  <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                    Thank you for your dedication and hard work!
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Care Connect Pro</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Questions about your payment? Contact ${SUPPORT_EMAIL}
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

  const result = await sendEmail({ to: caregiverEmail, subject, html });

  await logEmailReminder({
    type: 'system',
    relatedEntityType: 'payment',
    relatedEntityId: null,
    recipientType: 'caregiver',
    recipientId: caregiverId,
    recipientEmail: caregiverEmail,
    title: subject,
    message: `Payment processed: $${paymentAmount.toFixed(2)}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

export const caregiverEmailService = {
  sendVisitAssignmentEmail,
  sendVisitReminderEmail,
  sendScheduleChangeEmail,
  sendPaymentProcessedEmail,
};
