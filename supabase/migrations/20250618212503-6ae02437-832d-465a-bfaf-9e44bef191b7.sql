
-- Create serp_cache table for 24h caching
CREATE TABLE public.serp_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  geo TEXT DEFAULT 'US',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(keyword, geo)
);

-- Create index for faster lookups
CREATE INDEX idx_serp_cache_keyword_geo ON public.serp_cache(keyword, geo);
CREATE INDEX idx_serp_cache_updated_at ON public.serp_cache(updated_at);

-- Enable RLS
ALTER TABLE public.serp_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read cache data
CREATE POLICY "Users can read serp cache" ON public.serp_cache
  FOR SELECT USING (true);

-- Create policy for service role to manage cache
CREATE POLICY "Service role can manage serp cache" ON public.serp_cache
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.serp_cache
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
