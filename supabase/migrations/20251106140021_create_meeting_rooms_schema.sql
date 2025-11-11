/*
  # Meeting Room Booking System Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text) - Nome della sala
      - `capacity` (integer) - Capacità massima persone
      - `floor` (text) - Piano dell'edificio
      - `equipment` (text[]) - Attrezzature disponibili (proiettore, lavagna, ecc.)
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to rooms)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text) - Titolo della riunione
      - `description` (text) - Descrizione della riunione
      - `start_time` (timestamptz) - Inizio prenotazione
      - `end_time` (timestamptz) - Fine prenotazione
      - `participants_count` (integer) - Numero partecipanti
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can view all rooms
    - Users can view all bookings (for availability checking)
    - Users can create their own bookings
    - Users can update/delete only their own bookings
  
  3. Important Notes
    - Booking times must not overlap for the same room
    - Participants count must not exceed room capacity
    - Users must be authenticated to create bookings
*/

CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  floor text NOT NULL,
  equipment text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  participants_count integer NOT NULL CHECK (participants_count > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_time > start_time)
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS bookings_room_id_idx ON bookings(room_id);
CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings(user_id);
CREATE INDEX IF NOT EXISTS bookings_time_idx ON bookings(start_time, end_time);

INSERT INTO rooms (name, capacity, floor, equipment) VALUES
  ('Sala Conferenze A', 20, 'Piano 1', ARRAY['Proiettore', 'Lavagna', 'Video conferenza', 'WiFi']),
  ('Sala Riunioni B', 8, 'Piano 1', ARRAY['Monitor TV', 'Lavagna', 'WiFi']),
  ('Sala Meeting C', 6, 'Piano 2', ARRAY['Monitor TV', 'WiFi']),
  ('Sala Grande', 50, 'Piano Terra', ARRAY['Proiettore', 'Microfoni', 'Video conferenza', 'Sistema audio', 'WiFi']),
  ('Sala Piccola', 4, 'Piano 2', ARRAY['Monitor TV', 'WiFi'])
ON CONFLICT DO NOTHING;