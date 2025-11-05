-- Add JSONB columns for enhanced intelligence data
ALTER TABLE company_competitors 
ADD COLUMN IF NOT EXISTS intelligence_data JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS quality_metrics JSONB DEFAULT '{}'::jsonb;

-- Add indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_competitors_intelligence_data ON company_competitors USING gin(intelligence_data);
CREATE INDEX IF NOT EXISTS idx_competitors_quality_metrics ON company_competitors USING gin(quality_metrics);

-- Add comment for documentation
COMMENT ON COLUMN company_competitors.intelligence_data IS 'Enhanced competitive intelligence including pricing, features, target market, social proof, etc.';
COMMENT ON COLUMN company_competitors.quality_metrics IS 'Extraction quality metrics including completeness_score, confidence_score, fields_extracted, etc.';