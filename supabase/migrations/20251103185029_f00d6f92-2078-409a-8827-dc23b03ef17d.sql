-- Create solution_cache table for caching AI-extracted solution data
CREATE TABLE IF NOT EXISTS solution_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  domain TEXT NOT NULL,
  solutions_data JSONB NOT NULL,
  diagnostics JSONB,
  last_crawled_at TIMESTAMPTZ DEFAULT NOW(),
  url_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_solution_cache_key ON solution_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_solution_cache_domain ON solution_cache(domain);
CREATE INDEX IF NOT EXISTS idx_solution_cache_last_crawled ON solution_cache(last_crawled_at);

-- Enable RLS
ALTER TABLE solution_cache ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "solution_cache_service_role_all" ON solution_cache FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "solution_cache_public_select" ON solution_cache FOR SELECT USING (true);