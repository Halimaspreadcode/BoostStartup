/*
  # Add is_system column to prompt_templates

  1. Changes
    - Add `is_system` boolean column to `prompt_templates` table with default value false
    
  2. Purpose
    - Allow tracking of system-defined templates that cannot be modified by users
    - Distinguish between user-created and system templates
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'prompt_templates' 
    AND column_name = 'is_system'
  ) THEN
    ALTER TABLE prompt_templates 
    ADD COLUMN is_system boolean DEFAULT false;
  END IF;
END $$;