/*
  # Add prompt templates system

  1. New Tables
    - `prompt_templates`: Stores predefined prompts with their triggers
      - `id` (uuid, primary key)
      - `name` (text): Name of the template
      - `trigger` (text): Keyword to invoke the template
      - `prompt_text` (text): The actual prompt template
      - `description` (text): Description of when to use this template
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger text NOT NULL UNIQUE,
  prompt_text text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read prompt templates"
  ON prompt_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create prompt templates"
  ON prompt_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update prompt templates"
  ON prompt_templates
  FOR UPDATE
  TO authenticated
  USING (true);