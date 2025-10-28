# Notifications & Reminders Setup Guide

## Features Added

### 1. Real-time Notifications System
- **Toast notifications** for instant alerts
- **Notification Center** with bell icon and badge count
- **Real-time updates** using Supabase Realtime
- **Automatic notifications** for key events (visits, messages, etc.)

### 2. Visit Reminders (Email/SMS Ready)
- Reminder scheduling system
- Caregiver and family member reminders
- Email/SMS integration ready (needs email service setup)

---

## Setup Steps

### Step 1: Run the Notifications Schema

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Click **New Query**
4. Open `supabase-notifications-schema.sql` from your project
5. Copy all the SQL and paste it into the editor
6. Click **Run**

This will create:
- `notifications` table with real-time subscriptions
- `reminders` table for scheduling
- Automatic triggers for visit assignments and messages
- Sample welcome notification

### Step 2: Enable Supabase Realtime

1. In Supabase Dashboard, go to **Database → Replication**
2. Find the `notifications` table
3. Toggle **Enable Realtime** ON
4. Click **Save**

### Step 3: Test the Notifications

The app is now ready! The notification bell icon should appear in the top-right corner of your app.

---

## How It Works

### Automatic Notifications

The system automatically creates notifications for:

1. **Visit Assignments** - When a caregiver is assigned to a visit
2. **Visit Status Changes** - When visit status changes (completed, cancelled, etc.)
3. **New Messages** - When someone sends a message in a channel
4. **System Events** - Welcome messages, important updates

### Notification Center Features

- 🔔 **Bell Icon** with unread count badge
- ✅ **Mark as Read** individual or all notifications
- 🗑️ **Delete** notifications
- 🔗 **Click** to navigate to related page
- ⚡ **Real-time** updates without page refresh
- 📱 **Mobile-friendly** responsive design

### Toast Notifications

Toasts appear in the bottom-right corner for:
- Normal priority: Blue success toast
- High priority: Orange warning toast
- Urgent priority: Red error toast

Each toast can have an action button to navigate to the relevant page.

---

## Testing Notifications

### Test 1: Create a Visit
1. Log in to the app
2. Go to **Schedule** page
3. Create a new visit and assign a caregiver
4. A notification should appear instantly for the caregiver

### Test 2: Send a Message
1. Go to **Messages** page
2. Send a message in a channel
3. Other participants will receive a notification

### Test 3: Manual Notification (for testing)
Run this in Supabase SQL Editor:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users LIMIT 5;

-- Create a test notification (replace USER_ID with your actual user ID)
SELECT create_notification(
  'YOUR_USER_ID_HERE'::uuid,
  'system',
  'Test Notification',
  'This is a test notification to verify everything is working!',
  NULL,
  '/Dashboard',
  'normal'
);
```

---

## Visit Reminders

### How Reminders Work

The `reminders` table stores scheduled reminders for:
- **Visit Reminders** - 24 hours before visits
- **Medication Reminders** - Based on medication schedules
- **Follow-up Reminders** - Custom reminders

### Creating Reminders

Run this function periodically (e.g., via cron job):

```sql
-- This will create reminders for visits in the next 24-48 hours
SELECT create_visit_reminders();
```

The function:
- Finds visits scheduled 24-48 hours from now
- Creates email/SMS reminders for caregivers
- Creates email reminders for family members
- Sets reminder time to 24 hours before visit

### Setting Up Email Service (Optional)

To actually send emails, you need to:

1. **Option A: Supabase Edge Functions + Resend**
   - Create a Supabase Edge Function
   - Use Resend API to send emails
   - Schedule function to run every hour

2. **Option B: External Cron Job**
   - Query `reminders` table for pending reminders
   - Use your preferred email service (SendGrid, Mailgun, etc.)
   - Mark reminders as sent

3. **Option C: n8n / Zapier**
   - Watch for new rows in `reminders` table
   - Send emails via integration
   - Update reminder status

### SMS Setup (Optional)

For SMS reminders:
1. Sign up for Twilio
2. Add Twilio integration to send SMS
3. Use `recipient_phone` field from reminders table

---

## Database Tables

### `notifications` Table
- Real-time notifications visible in the app
- Stores notification history
- Tracks read/unread status
- Includes action URLs for navigation

### `reminders` Table
- Scheduled reminders (not in-app notifications)
- For email and SMS notifications
- Tracks sent status and errors
- Supports multiple recipient types

---

## API Usage

### In Your Components

```javascript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent({ userId }) {
  const {
    notifications,       // Array of notifications
    unreadCount,         // Number of unread notifications
    loading,             // Loading state
    markAsRead,          // Function to mark notification as read
    markAllAsRead,       // Function to mark all as read
    deleteNotification,  // Function to delete a notification
    createNotification,  // Function to create a notification
    refresh,             // Function to manually refresh
  } = useNotifications(userId);

  // notifications are automatically updated in real-time!
}
```

### Create a Notification Programmatically

```javascript
await createNotification({
  type: 'visit',          // visit, message, document, claim, medication, incident, system
  title: 'New Visit',
  message: 'You have a new visit scheduled',
  data: { visit_id: '123', client_name: 'John Doe' },
  action_url: '/Schedule',
  priority: 'normal',     // low, normal, high, urgent
});
```

---

## Customization

### Adding New Notification Types

1. Update the `type` CHECK constraint in `notifications` table
2. Add icon in `NotificationCenter.jsx` `getNotificationIcon()` function
3. Create trigger function for automatic notifications (optional)

### Email Templates

When setting up email service, create templates in:
`src/email-templates/`

Suggested templates:
- `visit-reminder.html` - Visit reminder email
- `medication-reminder.html` - Medication reminder
- `visit-completed.html` - Visit completion confirmation

---

## Troubleshooting

### Notifications Not Appearing

1. Check browser console for errors
2. Verify Supabase Realtime is enabled for `notifications` table
3. Check Supabase logs in Dashboard → Logs
4. Verify user is authenticated (notifications require userId)

### Real-time Not Working

1. Check Supabase project status
2. Verify network connection
3. Check browser console for WebSocket errors
4. Try refreshing the page

### Triggers Not Firing

1. Check trigger exists: `SELECT * FROM pg_trigger;`
2. Verify trigger function has no errors
3. Check Supabase logs for function errors

---

## Next Steps

1. ✅ Notifications system is live
2. ⏳ Set up email service for reminders
3. ⏳ Set up SMS service (optional)
4. ⏳ Create email templates
5. ⏳ Schedule reminder function to run periodically
6. ⏳ Add more automatic notification triggers

---

## Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Review trigger functions in `supabase-notifications-schema.sql`
- Test SQL functions in Supabase SQL Editor
- Check application logs in browser console

---

**Your notification system is ready to use! 🎉**

Log in to your app and you should see the bell icon in the top-right corner.
