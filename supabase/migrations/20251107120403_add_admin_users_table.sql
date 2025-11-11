/*
  # Add admin users table

  1. New Tables
    - `admin_users`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `is_admin` (boolean) - Flag to mark user as admin
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on admin_users table
    - Only admins can view admin_users
    - Only system can modify admin status
  
  3. Important Notes
    - This table tracks which users have admin privileges
    - Users need to be added to this table to become admins
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_admin = true
    )
  );
