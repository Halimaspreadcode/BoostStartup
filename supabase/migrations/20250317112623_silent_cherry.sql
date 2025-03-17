/*
  # Add representative and needs fields to startups table

  1. Changes
    - Add `representative` column to store the startup representative's name
    - Add `needs` column to store keywords about startup needs
    - Make existing `problems` and `solutions` columns nullable since they will be built later

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE startups
ADD COLUMN representative text NOT NULL DEFAULT '',
ADD COLUMN needs text;

-- Make problems and solutions nullable since they will be built later
ALTER TABLE startups
ALTER COLUMN problems DROP NOT NULL,
ALTER COLUMN solutions DROP NOT NULL;