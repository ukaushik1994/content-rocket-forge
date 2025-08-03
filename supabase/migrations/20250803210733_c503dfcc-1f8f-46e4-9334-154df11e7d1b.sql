
-- Add competitor intelligence fields to content_opportunities table
ALTER TABLE public.content_opportunities 
ADD COLUMN competitor_analysis jsonb DEFAULT '[]'::jsonb,
ADD COLUMN content_gaps jsonb DEFAULT '[]'::jsonb,
ADD COLUMN competitive_advantage TEXT,
ADD COLUMN content_format_reason TEXT,
ADD COLUMN serp_analysis jsonb DEFAULT '{}'::jsonb,
ADD COLUMN related_keywords jsonb DEFAULT '[]'::jsonb,
ADD COLUMN suggested_headings jsonb DEFAULT '[]'::jsonb,
ADD COLUMN faq_opportunities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN search_intent TEXT DEFAULT 'informational',
ADD COLUMN aio_score INTEGER DEFAULT 0;

-- Add content routing tracking
ALTER TABLE public.content_opportunities 
ADD COLUMN routed_to_content_builder BOOLEAN DEFAULT false,
ADD COLUMN content_builder_payload jsonb DEFAULT '{}'::jsonb,
ADD COLUMN routed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_content_opportunities_competitor_analysis 
ON public.content_opportunities USING gin(competitor_analysis);

CREATE INDEX IF NOT EXISTS idx_content_opportunities_search_intent 
ON public.content_opportunities(search_intent);

-- Add trigger to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_opportunity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_opportunity_timestamp ON public.content_opportunities;
CREATE TRIGGER trigger_update_opportunity_timestamp
  BEFORE UPDATE ON public.content_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_opportunity_timestamp();
