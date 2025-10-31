/**
 * Family Email Notifications
 *
 * Handles all family member email notifications:
 * - New care note added
 * - Caregiver arrival/departure notifications
 * - New medication added
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
// FAMILY EMAIL NOTIFICATIONS
// ============================================

/**
 * Send email when new care note is added
 */
export async function sendCareNoteEmail({
  familyEmail,
  familyMemberId,
  familyMemberName,
  clientName,
  caregiverName,
  noteDate,
  noteContent,
  activities,
  mood,
  visitId
}) {
  const subject = `📝 New Care Note: ${clientName}`;
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
                    📝 New Care Note
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${familyMemberName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${caregiverName} has added a new care note for ${clientName}.
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                      <strong>Date:</strong> ${new Date(noteDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                      <strong>Caregiver:</strong> ${caregiverName}
                    </p>
                  </div>

                  ${mood ? `
                  <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 8px; color: #1e40af; font-size: 14px; font-weight: 600;">
                      Mood Today
                    </p>
                    <p style="margin: 0; font-size: 32px;">
                      ${mood === 'great' ? '😊' : mood === 'good' ? '🙂' : mood === 'okay' ? '😐' : mood === 'poor' ? '😟' : '😃'}
                    </p>
                    <p style="margin: 8px 0 0; color: #1e3a8a; font-size: 16px; font-weight: 600; text-transform: capitalize;">
                      ${mood}
                    </p>
                  </div>
                  ` : ''}

                  ${activities && activities.length > 0 ? `
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 12px; color: #1f2937; font-size: 16px; font-weight: 600;">
                      Activities Completed:
                    </p>
                    <ul style="margin: 0; padding-left: 24px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                      ${activities.map(activity => `<li>${activity}</li>`).join('')}
                    </ul>
                  </div>
                  ` : ''}

                  ${noteContent ? `
                  <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <p style="margin: 0 0 12px; color: #1f2937; font-size: 16px; font-weight: 600;">
                      Care Notes:
                    </p>
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
                      ${noteContent}
                    </p>
                  </div>
                  ` : ''}

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/FamilyPortal"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #0d9488 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
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
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Stay connected with your loved one's care
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

  const result = await sendEmail({ to: familyEmail, subject, html });

  await logEmailReminder({
    type: 'system',
    relatedEntityId: visitId,
    relatedEntityType: 'visit_note',
    recipientType: 'family',
    recipientId: familyMemberId,
    recipientEmail: familyEmail,
    title: subject,
    message: `New care note from ${caregiverName}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email when caregiver arrives
 */
export async function sendCaregiverArrivalEmail({
  familyEmail,
  familyMemberId,
  familyMemberName,
  clientName,
  caregiverName,
  arrivalTime,
  visitId
}) {
  const subject = `✅ Caregiver Arrived: ${caregiverName}`;
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
                    ✅ Caregiver Arrived
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${familyMemberName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${caregiverName} has arrived for ${clientName}'s scheduled visit.
                  </p>

                  <div style="background-color: #d1fae5; border-left: 4px solid #059669; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <p style="margin: 0 0 12px; color: #065f46; font-size: 16px;">
                      <strong>Caregiver:</strong> ${caregiverName}
                    </p>
                    <p style="margin: 0; color: #065f46; font-size: 16px;">
                      <strong>Arrival Time:</strong> ${new Date(arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <p style="margin: 24px 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                    ${clientName} is in good hands. You'll receive another notification when the visit is complete.
                  </p>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/FamilyPortal"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #059669 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Visit Details
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
                    Real-time updates for peace of mind
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

  const result = await sendEmail({ to: familyEmail, subject, html });

  await logEmailReminder({
    type: 'visit',
    relatedEntityId: visitId,
    relatedEntityType: 'visit',
    recipientType: 'family',
    recipientId: familyMemberId,
    recipientEmail: familyEmail,
    title: subject,
    message: `${caregiverName} arrived for visit`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email when caregiver departs
 */
export async function sendCaregiverDepartureEmail({
  familyEmail,
  familyMemberId,
  familyMemberName,
  clientName,
  caregiverName,
  departureTime,
  visitDuration,
  visitId
}) {
  const subject = `👋 Visit Complete: ${caregiverName}`;
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
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    👋 Visit Complete
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${familyMemberName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    ${caregiverName}'s visit with ${clientName} has been completed.
                  </p>

                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <p style="margin: 0 0 12px; color: #4b5563; font-size: 16px;">
                      <strong>Departure Time:</strong> ${new Date(departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style="margin: 0; color: #4b5563; font-size: 16px;">
                      <strong>Visit Duration:</strong> ${visitDuration}
                    </p>
                  </div>

                  <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                    <p style="margin: 0 0 12px; color: #1e40af; font-size: 16px;">
                      Care notes will be available shortly. You'll receive an email once they're posted.
                    </p>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/FamilyPortal"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Visit History
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
                    Stay connected with your loved one's care
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

  const result = await sendEmail({ to: familyEmail, subject, html });

  await logEmailReminder({
    type: 'visit',
    relatedEntityId: visitId,
    relatedEntityType: 'visit',
    recipientType: 'family',
    recipientId: familyMemberId,
    recipientEmail: familyEmail,
    title: subject,
    message: `${caregiverName} completed visit`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

/**
 * Send email when new medication is added
 */
export async function sendNewMedicationEmail({
  familyEmail,
  familyMemberId,
  familyMemberName,
  clientName,
  medicationName,
  dosage,
  frequency,
  startDate,
  prescribedBy,
  purpose,
  medicationId
}) {
  const subject = `💊 New Medication Added: ${medicationName}`;
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
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    💊 New Medication Added
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                    Hi ${familyMemberName},
                  </p>

                  <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
                    A new medication has been added to ${clientName}'s care plan.
                  </p>

                  <div style="background-color: #fae8ff; border-left: 4px solid #a855f7; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin: 0 0 16px; color: #6b21a8; font-size: 20px; font-weight: bold;">
                      ${medicationName}
                    </h3>
                    <p style="margin: 8px 0; color: #581c87; font-size: 16px;">
                      <strong>Dosage:</strong> ${dosage}
                    </p>
                    <p style="margin: 8px 0; color: #581c87; font-size: 16px;">
                      <strong>Frequency:</strong> ${frequency}
                    </p>
                    <p style="margin: 8px 0; color: #581c87; font-size: 16px;">
                      <strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}
                    </p>
                    ${prescribedBy ? `
                    <p style="margin: 8px 0; color: #581c87; font-size: 16px;">
                      <strong>Prescribed By:</strong> ${prescribedBy}
                    </p>
                    ` : ''}
                  </div>

                  ${purpose ? `
                  <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #1f2937; font-size: 14px; font-weight: 600;">
                      Purpose:
                    </p>
                    <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                      ${purpose}
                    </p>
                  </div>
                  ` : ''}

                  <div style="background-color: #dbeafe; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.7;">
                      ℹ️ Our caregivers will administer this medication according to the prescribed schedule. You can track administration times and view the full medication list in your family portal.
                    </p>
                  </div>

                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${APP_URL}/FamilyPortal"
                           style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
                          View Medication Schedule
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
                    Questions about medications? Contact ${SUPPORT_EMAIL}
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

  const result = await sendEmail({ to: familyEmail, subject, html });

  await logEmailReminder({
    type: 'medication',
    relatedEntityId: medicationId,
    relatedEntityType: 'medication',
    recipientType: 'family',
    recipientId: familyMemberId,
    recipientEmail: familyEmail,
    title: subject,
    message: `New medication added: ${medicationName}`,
    status: result.success ? 'sent' : 'failed',
    errorMessage: result.error,
  });

  return result;
}

export const familyEmailService = {
  sendCareNoteEmail,
  sendCaregiverArrivalEmail,
  sendCaregiverDepartureEmail,
  sendNewMedicationEmail,
};
