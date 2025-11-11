/*
  # Add notifications and analytics

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `booking_id` (uuid, foreign key to bookings)
      - `type` (text) - Type: 'booking_created', 'booking_reminder', 'booking_cancelled'
      - `title` (text)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamptz)
    
    - `booking_history`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, foreign key to bookings)
      - `action` (text) - 'created', 'updated', 'cancelled'
      - `changed_by` (uuid, foreign key to auth.users)
      - `changes` (jsonb) - JSON diff of what changed
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can view own notifications
    - Users can view history of their bookings
  
  3. Important Notes
    - Notifications track booking lifecycle events
    - History provides audit trail of changes
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  action text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view history of their bookings"
  ON booking_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_history.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications(read);
CREATE INDEX IF NOT EXISTS booking_history_booking_id_idx ON booking_history(booking_id);
