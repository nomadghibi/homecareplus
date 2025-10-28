-- Notifications and Reminders Schema
-- Run this in Supabase SQL Editor to add notification features

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('visit', 'message', 'document', 'claim', 'medication', 'incident', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data (e.g., visit_id, client_name, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT, -- URL to navigate when clicked
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Allow system to create notifications
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================
-- REMINDERS TABLE
-- ============================================

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('visit', 'medication', 'appointment', 'task', 'follow-up')),
  related_entity_type VARCHAR(50), -- 'visit', 'medication_schedule', etc.
  related_entity_id UUID,
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('caregiver', 'client', 'family')),
  recipient_id UUID NOT NULL,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  reminder_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_method VARCHAR(20) DEFAULT 'email' CHECK (notification_method IN ('email', 'sms', 'both', 'in-app')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reminders
CREATE INDEX idx_reminders_reminder_datetime ON reminders(reminder_datetime);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_recipient ON reminders(recipient_id);
CREATE INDEX idx_reminders_type ON reminders(type);
CREATE INDEX idx_reminders_related_entity ON reminders(related_entity_type, related_entity_id);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to manage reminders
CREATE POLICY "Allow authenticated access to reminders" ON reminders
  FOR ALL TO authenticated
  USING (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at on reminders
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS FOR CREATING NOTIFICATIONS
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_data JSONB DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, action_url, priority)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url, p_priority)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE id = p_notification_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND is_read = FALSE;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- AUTOMATIC NOTIFICATION TRIGGERS
-- ============================================

-- Function to notify caregivers when assigned to a visit
CREATE OR REPLACE FUNCTION notify_caregiver_on_visit_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
  v_visit_time TEXT;
BEGIN
  -- Get client name
  SELECT first_name || ' ' || last_name INTO v_client_name
  FROM clients WHERE id = NEW.client_id;

  -- Format visit time
  v_visit_time := TO_CHAR(NEW.scheduled_start, 'MM/DD/YYYY at HH:MI AM');

  -- Create notification for caregiver
  PERFORM create_notification(
    NEW.caregiver_id,
    'visit',
    'New Visit Assigned',
    'You have been assigned to visit ' || v_client_name || ' on ' || v_visit_time,
    jsonb_build_object(
      'visit_id', NEW.id,
      'client_id', NEW.client_id,
      'client_name', v_client_name,
      'scheduled_start', NEW.scheduled_start
    ),
    '/Schedule',
    'normal'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify on new visit creation
CREATE TRIGGER trigger_notify_visit_assignment
  AFTER INSERT ON visits
  FOR EACH ROW
  EXECUTE FUNCTION notify_caregiver_on_visit_assignment();

-- Function to notify on visit status change
CREATE OR REPLACE FUNCTION notify_on_visit_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_client_name TEXT;
  v_message TEXT;
BEGIN
  -- Only notify if status actually changed
  IF NEW.status != OLD.status THEN
    -- Get client name
    SELECT first_name || ' ' || last_name INTO v_client_name
    FROM clients WHERE id = NEW.client_id;

    -- Create appropriate message based on status
    CASE NEW.status
      WHEN 'completed' THEN
        v_message := 'Visit with ' || v_client_name || ' has been completed';
      WHEN 'cancelled' THEN
        v_message := 'Visit with ' || v_client_name || ' has been cancelled';
      WHEN 'in-progress' THEN
        v_message := 'Visit with ' || v_client_name || ' has started';
      ELSE
        v_message := 'Visit with ' || v_client_name || ' status updated to ' || NEW.status;
    END CASE;

    -- Notify caregiver
    PERFORM create_notification(
      NEW.caregiver_id,
      'visit',
      'Visit Status Updated',
      v_message,
      jsonb_build_object(
        'visit_id', NEW.id,
        'client_id', NEW.client_id,
        'status', NEW.status
      ),
      '/Documentation',
      'normal'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify on visit status change
CREATE TRIGGER trigger_notify_visit_status
  AFTER UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_visit_status_change();

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
BEGIN
  -- Get channel participants
  FOR v_recipient_id IN
    SELECT UNNEST(participant_ids)
    FROM channels
    WHERE id = NEW.channel_id
  LOOP
    -- Don't notify the sender
    IF v_recipient_id != NEW.sender_id THEN
      PERFORM create_notification(
        v_recipient_id,
        'message',
        'New Message from ' || NEW.sender_name,
        LEFT(NEW.content, 100),
        jsonb_build_object(
          'channel_id', NEW.channel_id,
          'message_id', NEW.id,
          'sender_id', NEW.sender_id,
          'sender_name', NEW.sender_name
        ),
        '/Messages',
        'normal'
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Notify on new message
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_message();

-- ============================================
-- FUNCTION TO CREATE VISIT REMINDERS
-- ============================================

CREATE OR REPLACE FUNCTION create_visit_reminders()
RETURNS INTEGER AS $$
DECLARE
  v_visit RECORD;
  v_caregiver RECORD;
  v_client RECORD;
  v_family RECORD;
  v_reminder_time TIMESTAMP WITH TIME ZONE;
  v_count INTEGER := 0;
BEGIN
  -- Find visits scheduled in the next 24-48 hours that don't have reminders yet
  FOR v_visit IN
    SELECT * FROM visits
    WHERE scheduled_start BETWEEN NOW() + INTERVAL '24 hours' AND NOW() + INTERVAL '48 hours'
      AND status = 'scheduled'
      AND NOT EXISTS (
        SELECT 1 FROM reminders
        WHERE related_entity_id = visits.id
          AND related_entity_type = 'visit'
          AND status IN ('pending', 'sent')
      )
  LOOP
    -- Get caregiver info
    SELECT * INTO v_caregiver FROM caregivers WHERE id = v_visit.caregiver_id;

    -- Get client info
    SELECT * INTO v_client FROM clients WHERE id = v_visit.client_id;

    -- Set reminder for 24 hours before visit
    v_reminder_time := v_visit.scheduled_start - INTERVAL '24 hours';

    -- Create reminder for caregiver
    IF v_caregiver.email IS NOT NULL THEN
      INSERT INTO reminders (
        type, related_entity_type, related_entity_id,
        recipient_type, recipient_id, recipient_email, recipient_phone,
        title, message, reminder_datetime, notification_method
      ) VALUES (
        'visit', 'visit', v_visit.id,
        'caregiver', v_caregiver.id, v_caregiver.email, v_caregiver.phone,
        'Upcoming Visit Reminder',
        'You have a scheduled visit with ' || v_client.first_name || ' ' || v_client.last_name ||
        ' tomorrow at ' || TO_CHAR(v_visit.scheduled_start, 'HH:MI AM'),
        v_reminder_time,
        CASE WHEN v_caregiver.phone IS NOT NULL THEN 'both' ELSE 'email' END
      );
      v_count := v_count + 1;
    END IF;

    -- Create reminder for family members
    FOR v_family IN
      SELECT fm.*, fpa.can_view_visits
      FROM family_members fm
      JOIN family_portal_access fpa ON fpa.family_member_id = fm.id
      WHERE fm.client_id = v_visit.client_id
        AND fpa.can_view_visits = TRUE
        AND fm.email IS NOT NULL
    LOOP
      INSERT INTO reminders (
        type, related_entity_type, related_entity_id,
        recipient_type, recipient_id, recipient_email, recipient_phone,
        title, message, reminder_datetime, notification_method
      ) VALUES (
        'visit', 'visit', v_visit.id,
        'family', v_family.id, v_family.email, v_family.phone,
        'Care Visit Reminder',
        v_caregiver.first_name || ' ' || v_caregiver.last_name ||
        ' will visit tomorrow at ' || TO_CHAR(v_visit.scheduled_start, 'HH:MI AM'),
        v_reminder_time,
        'email'
      );
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Create some sample notifications
DO $$
DECLARE
  v_caregiver_id UUID;
BEGIN
  -- Get first caregiver
  SELECT id INTO v_caregiver_id FROM caregivers LIMIT 1;

  IF v_caregiver_id IS NOT NULL THEN
    -- Create sample notifications
    PERFORM create_notification(
      v_caregiver_id,
      'system',
      'Welcome to HomeCare+',
      'Your account has been successfully set up and connected to Supabase!',
      NULL,
      '/Dashboard',
      'normal'
    );
  END IF;
END $$;

-- Success message
SELECT 'Notifications schema created successfully!' as message,
       (SELECT COUNT(*) FROM notifications) as notifications_count,
       (SELECT COUNT(*) FROM reminders) as reminders_count;
