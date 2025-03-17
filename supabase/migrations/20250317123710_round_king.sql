/*
  # Add diagnostic results storage

  1. New Columns
    - Add `diagnostic_results` column to `startups` table to store the latest diagnostic
    
  2. Changes
    - Update existing rows to initialize the column with null
*/

ALTER TABLE startups 
ADD COLUMN IF NOT EXISTS diagnostic_results text DEFAULT NULL;