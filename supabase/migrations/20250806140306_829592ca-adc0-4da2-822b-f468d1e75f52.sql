-- Add enhanced fields to solutions table for comprehensive solution management
ALTER TABLE public.solutions 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS benefits jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS market_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS competitors jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technical_specs jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_model jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS case_studies jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS metrics jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS unique_value_propositions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS positioning_statement text,
ADD COLUMN IF NOT EXISTS key_differentiators jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.solutions.market_data IS 'Market size, growth rate, geographic availability, compliance requirements';
COMMENT ON COLUMN public.solutions.competitors IS 'Competitor analysis with strengths, weaknesses, market share, pricing';
COMMENT ON COLUMN public.solutions.technical_specs IS 'System requirements, platforms, API capabilities, security features';
COMMENT ON COLUMN public.solutions.pricing_model IS 'Pricing model, tiers, starting price, free trial information';
COMMENT ON COLUMN public.solutions.case_studies IS 'Customer success stories with metrics and testimonials';
COMMENT ON COLUMN public.solutions.metrics IS 'Adoption rate, customer satisfaction, ROI, implementation time';
COMMENT ON COLUMN public.solutions.unique_value_propositions IS 'Key value propositions that differentiate the solution';
COMMENT ON COLUMN public.solutions.key_differentiators IS 'Key differentiating factors from competitors';
COMMENT ON COLUMN public.solutions.metadata IS 'Website metadata, completeness score, last updated timestamp';