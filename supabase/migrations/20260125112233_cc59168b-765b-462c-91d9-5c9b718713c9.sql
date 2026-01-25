-- =====================================================
-- SECURITY FIX: Remove Overly Permissive RLS Policies on Cache Tables
-- =====================================================
-- These cache tables don't have user_id columns - they're shared caches
-- We restrict them to service_role only (edge functions can access)
-- Direct client access is blocked

-- 1. Fix serp_cache table - service role only
DROP POLICY IF EXISTS "Anyone can read SERP cache data" ON serp_cache;
DROP POLICY IF EXISTS "Users can read serp cache" ON serp_cache;
DROP POLICY IF EXISTS "Users can insert serp cache" ON serp_cache;
DROP POLICY IF EXISTS "Users can update serp cache" ON serp_cache;
DROP POLICY IF EXISTS "Anyone can read SERP cache" ON serp_cache;
DROP POLICY IF EXISTS "service_role_serp_cache_all" ON serp_cache;

-- Create service role only policy
CREATE POLICY "Service role access only"
ON serp_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Fix raw_serp_data table - service role only
DROP POLICY IF EXISTS "Users can read SERP data" ON raw_serp_data;
DROP POLICY IF EXISTS "Users can insert SERP data" ON raw_serp_data;
DROP POLICY IF EXISTS "Users can update SERP data" ON raw_serp_data;
DROP POLICY IF EXISTS "Users can delete SERP data" ON raw_serp_data;
DROP POLICY IF EXISTS "service_role_raw_serp_all" ON raw_serp_data;

CREATE POLICY "Service role access only"
ON raw_serp_data FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Fix serp_tracking_history table - service role only
DROP POLICY IF EXISTS "Serp tracking history is viewable by everyone" ON serp_tracking_history;
DROP POLICY IF EXISTS "Users can insert serp tracking history" ON serp_tracking_history;
DROP POLICY IF EXISTS "Users can update serp tracking history" ON serp_tracking_history;
DROP POLICY IF EXISTS "service_role_serp_tracking_all" ON serp_tracking_history;

CREATE POLICY "Service role access only"
ON serp_tracking_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Fix keyword_position_history table - service role only
DROP POLICY IF EXISTS "Position history is viewable by everyone" ON keyword_position_history;
DROP POLICY IF EXISTS "Users can insert position history" ON keyword_position_history;
DROP POLICY IF EXISTS "Users can update position history" ON keyword_position_history;
DROP POLICY IF EXISTS "service_role_keyword_position_all" ON keyword_position_history;

CREATE POLICY "Service role access only"
ON keyword_position_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Fix keyword_performance_cache table - has user_id, use user-scoped policy
DROP POLICY IF EXISTS "Users can read all cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can insert cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can update cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can delete cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can read own cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can insert own cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can update own cached keyword data" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Users can delete own cached keyword data" ON keyword_performance_cache;

CREATE POLICY "Users can read own cached keyword data"
ON keyword_performance_cache FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cached keyword data"
ON keyword_performance_cache FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cached keyword data"
ON keyword_performance_cache FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own cached keyword data"
ON keyword_performance_cache FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Service role also needs access
CREATE POLICY "Service role full access keyword cache"
ON keyword_performance_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Fix solution_cache table - service role only
DROP POLICY IF EXISTS "solution_cache_public_select" ON solution_cache;
DROP POLICY IF EXISTS "solution_cache_user_insert" ON solution_cache;
DROP POLICY IF EXISTS "solution_cache_user_update" ON solution_cache;
DROP POLICY IF EXISTS "solution_cache_user_delete" ON solution_cache;
DROP POLICY IF EXISTS "service_role_solution_cache_all" ON solution_cache;

CREATE POLICY "Service role access only"
ON solution_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Fix competitor_cache table - service role only
DROP POLICY IF EXISTS "Competitor cache read" ON competitor_cache;
DROP POLICY IF EXISTS "Competitor cache insert" ON competitor_cache;
DROP POLICY IF EXISTS "Competitor cache update" ON competitor_cache;
DROP POLICY IF EXISTS "Competitor cache delete" ON competitor_cache;
DROP POLICY IF EXISTS "service_role_competitor_cache_all" ON competitor_cache;

CREATE POLICY "Service role access only"
ON competitor_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);