-- Create workspace_results table
CREATE TABLE IF NOT EXISTS workspace_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL,
  startup_id uuid NOT NULL,
  phase text NOT NULL CHECK (phase IN ('diagnostic', 'solutions')),
  response text NOT NULL,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE workspace_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their workspace results"
  ON workspace_results
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM startups s
    WHERE s.id = workspace_results.startup_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM startups s
    WHERE s.id = workspace_results.startup_id
  )); 