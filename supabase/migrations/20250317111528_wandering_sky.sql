/*
  # Create Startups Schema

  1. New Tables
    - `startups`
      - `id` (uuid, primary key)
      - `name` (text)
      - `sector` (text)
      - `problems` (text)
      - `solutions` (text)
      - `status` (text)
      - `timeline` (jsonb)
      - `resources` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `startups` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS startups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL,
  problems text,
  solutions text,
  status text NOT NULL DEFAULT 'To Analyze',
  timeline jsonb DEFAULT '[]'::jsonb,
  resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their startups"
  ON startups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their startups"
  ON startups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their startups"
  ON startups
  FOR UPDATE
  TO authenticated
  USING (true);