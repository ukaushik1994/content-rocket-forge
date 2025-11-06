-- Add competitor tracking columns to ai_strategy_proposals
ALTER TABLE ai_strategy_proposals
ADD COLUMN IF NOT EXISTS solution_id uuid REFERENCES solutions(id),
ADD COLUMN IF NOT EXISTS competitor_id uuid REFERENCES company_competitors(id),
ADD COLUMN IF NOT EXISTS competitive_angle jsonb DEFAULT '{}'::jsonb;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_solution_id ON ai_strategy_proposals(solution_id);
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_competitor_id ON ai_strategy_proposals(competitor_id);

-- Add comment for documentation
COMMENT ON COLUMN ai_strategy_proposals.solution_id IS 'Links proposal to the specific solution it was generated for';
COMMENT ON COLUMN ai_strategy_proposals.competitor_id IS 'Links proposal to the competitor it is positioned against (optional)';
COMMENT ON COLUMN ai_strategy_proposals.competitive_angle IS 'Stores competitive positioning and differentiation strategy used in the proposal';