-- Add overview, swot_analysis, and last_analyzed_at columns to company_competitors
ALTER TABLE company_competitors 
ADD COLUMN IF NOT EXISTS overview jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS swot_analysis jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_analyzed_at timestamp with time zone DEFAULT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_company_competitors_overview ON company_competitors USING GIN (overview);
CREATE INDEX IF NOT EXISTS idx_company_competitors_swot ON company_competitors USING GIN (swot_analysis);
CREATE INDEX IF NOT EXISTS idx_company_competitors_last_analyzed ON company_competitors (last_analyzed_at);

-- Add comment for documentation
COMMENT ON COLUMN company_competitors.overview IS 'AI-generated strategic overview with insights and recommendations';
COMMENT ON COLUMN company_competitors.swot_analysis IS 'Complete SWOT analysis with competitive positioning';
COMMENT ON COLUMN company_competitors.last_analyzed_at IS 'Timestamp of last intelligence/analysis generation';