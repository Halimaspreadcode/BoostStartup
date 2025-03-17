/*
  # Add workspace tables

  1. New Tables
    - `workspace_steps`
      - `id` (uuid, primary key)
      - `name` (text)
      - `startups` (jsonb)
      - `actions` (jsonb)
      - `results` (jsonb)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS workspace_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  startups jsonb DEFAULT '[]'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  results jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workspace_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspace steps"
  ON workspace_steps
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);