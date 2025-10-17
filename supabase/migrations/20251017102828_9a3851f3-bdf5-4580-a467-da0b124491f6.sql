-- Fix 1.1: Remove dangerous FK constraint from keyword_performance_cache
ALTER TABLE keyword_performance_cache 
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE keyword_performance_cache 
  DROP CONSTRAINT IF EXISTS keyword_performance_cache_user_id_fkey;

-- Fix 1.2: Add unique constraint to unified_keywords for proper upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_unified_keywords_user_keyword 
  ON unified_keywords(user_id, keyword);

-- Fix 1.3: Schedule automatic cache cleanup daily at 2 AM UTC
-- First ensure pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup
SELECT cron.schedule(
  'cleanup-expired-keyword-cache',
  '0 2 * * *',
  $$SELECT cleanup_expired_keyword_cache();$$
);