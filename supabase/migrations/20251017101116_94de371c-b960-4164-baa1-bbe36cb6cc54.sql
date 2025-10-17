-- Phase 1: Create keyword_performance_cache table for persistent caching
CREATE TABLE IF NOT EXISTS public.keyword_performance_cache (
  keyword TEXT PRIMARY KEY,
  search_volume INTEGER NOT NULL DEFAULT 0,
  keyword_difficulty INTEGER NOT NULL DEFAULT 0,
  cpc NUMERIC(10,2),
  competition_score INTEGER,
  serp_features JSONB DEFAULT '[]'::jsonb,
  intent TEXT,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_keyword_cache_keyword ON public.keyword_performance_cache(keyword);
CREATE INDEX IF NOT EXISTS idx_keyword_cache_expires ON public.keyword_performance_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_keyword_cache_user ON public.keyword_performance_cache(user_id);

-- Enable RLS
ALTER TABLE public.keyword_performance_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can read all cached data (shared cache), but only system can write
CREATE POLICY "Users can read all cached keyword data"
  ON public.keyword_performance_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update cache data
CREATE POLICY "Service role can manage cache"
  ON public.keyword_performance_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add cleanup function for expired cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_keyword_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.keyword_performance_cache 
  WHERE expires_at < now();
END;
$$;

COMMENT ON TABLE public.keyword_performance_cache IS 'Persistent cache for keyword SERP data to reduce API costs and improve performance. Data expires after 7 days.';
COMMENT ON FUNCTION public.cleanup_expired_keyword_cache IS 'Removes expired keyword cache entries. Should be run periodically via cron.';