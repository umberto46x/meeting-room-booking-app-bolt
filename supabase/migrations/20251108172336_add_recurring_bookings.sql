/*
  # Add recurring bookings functionality

  1. New Tables
    - `recurring_bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `room_id` (uuid, foreign key to rooms)
      - `title` (text)
      - `description` (text)
      - `start_time` (time) - Time of day for booking
      - `end_time` (time) - End time of booking
      - `participants_count` (integer)
      - `recurrence_type` (text) - 'daily', 'weekly', 'biweekly', 'monthly'
      - `recurrence_end_date` (date) - When the recurrence should stop
      - `days_of_week` (integer[]) - 0-6 for weekly recurrences (0=Monday)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on recurring_bookings table
    - Users can view/create/update/delete only their own recurring bookings
  
  3. Important Notes
    - Recurring bookings automatically generate individual bookings
    - System processes recurring bookings daily to create new instances
    - Users can pause or cancel recurring bookings
*/

CREATE TABLE IF NOT EXISTS recurring_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time time NOT NULL,
  end_time time NOT NULL,
  participants_count integer NOT NULL CHECK (participants_count > 0),
  recurrence_type text NOT NULL CHECK (recurrence_type IN ('daily', 'weekly', 'biweekly', 'monthly')),
  recurrence_end_date date NOT NULL,
  days_of_week integer[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring bookings"
  ON recurring_bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recurring bookings"
  ON recurring_bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring bookings"
  ON recurring_bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring bookings"
  ON recurring_bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS recurring_bookings_user_id_idx ON recurring_bookings(user_id);
CREATE INDEX IF NOT EXISTS recurring_bookings_active_idx ON recurring_bookings(is_active);
CREATE INDEX IF NOT EXISTS recurring_bookings_end_date_idx ON recurring_bookings(recurrence_end_date);
