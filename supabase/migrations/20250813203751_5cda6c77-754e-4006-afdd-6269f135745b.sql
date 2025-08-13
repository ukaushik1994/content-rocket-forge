-- Enhance unified_keywords table with SERP metadata
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS serp_last_updated TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS competition_score NUMERIC;
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS serp_data_quality TEXT DEFAULT 'unknown';
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS cpc NUMERIC;
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS trend_direction TEXT DEFAULT 'stable';
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS intent TEXT;
ALTER TABLE public.unified_keywords ADD COLUMN IF NOT EXISTS seasonality BOOLEAN DEFAULT false;

-- Create index for better performance on SERP queries
CREATE INDEX IF NOT EXISTS idx_unified_keywords_serp_last_updated ON public.unified_keywords(serp_last_updated);
CREATE INDEX IF NOT EXISTS idx_unified_keywords_keyword_search ON public.unified_keywords(keyword, user_id);

-- Add comments for clarity
COMMENT ON COLUMN public.unified_keywords.serp_last_updated IS 'Timestamp when SERP data was last refreshed for this keyword';
COMMENT ON COLUMN public.unified_keywords.competition_score IS 'Competition score from SERP analysis (0-100)';
COMMENT ON COLUMN public.unified_keywords.serp_data_quality IS 'Quality assessment of SERP data (high/medium/low/unknown)';
COMMENT ON COLUMN public.unified_keywords.cpc IS 'Cost per click for paid advertising';
COMMENT ON COLUMN public.unified_keywords.trend_direction IS 'Search trend direction (rising/stable/declining)';
COMMENT ON COLUMN public.unified_keywords.intent IS 'Search intent classification';
COMMENT ON COLUMN public.unified_keywords.seasonality IS 'Whether keyword shows seasonal patterns';