-- Add solution_id and objective columns to campaigns table
ALTER TABLE campaigns 
ADD COLUMN solution_id UUID REFERENCES solutions(id) ON DELETE SET NULL,
ADD COLUMN objective TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_solution_id ON campaigns(solution_id);

-- Add comment explaining the columns
COMMENT ON COLUMN campaigns.solution_id IS 'References the solution being promoted by this campaign';
COMMENT ON COLUMN campaigns.objective IS 'Brief summary of what this campaign aims to achieve';