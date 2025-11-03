-- Create competitor_cache table for caching auto-fill results
CREATE TABLE IF NOT EXISTS competitor_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  profile_data JSONB NOT NULL,
  diagnostics JSONB,
  last_crawled_at TIMESTAMPTZ DEFAULT NOW(),
  url_count INTEGER,
  etag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_cache_key ON competitor_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_domain ON competitor_cache(domain);
CREATE INDEX IF NOT EXISTS idx_cache_last_crawled ON competitor_cache(last_crawled_at);

-- Enable RLS
ALTER TABLE competitor_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view cached data (public read for performance)
CREATE POLICY "Anyone can view competitor cache"
ON competitor_cache
FOR SELECT
USING (true);

-- Policy: System can insert/update cache (edge functions)
CREATE POLICY "Service role can manage cache"
ON competitor_cache
FOR ALL
USING (auth.role() = 'service_role');