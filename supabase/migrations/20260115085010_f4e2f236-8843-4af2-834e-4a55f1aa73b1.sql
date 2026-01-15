-- Fix public exposure on cache tables - restrict to authenticated users only

-- 1. competitor_cache - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for competitor_cache" ON competitor_cache;
DROP POLICY IF EXISTS "Allow public select on competitor_cache" ON competitor_cache;
DROP POLICY IF EXISTS "Anyone can read competitor cache" ON competitor_cache;
CREATE POLICY "Authenticated users can read competitor_cache"
ON competitor_cache FOR SELECT
TO authenticated
USING (true);

-- 2. solution_cache - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for solution_cache" ON solution_cache;
DROP POLICY IF EXISTS "Allow public select on solution_cache" ON solution_cache;
DROP POLICY IF EXISTS "Anyone can read solution cache" ON solution_cache;
CREATE POLICY "Authenticated users can read solution_cache"
ON solution_cache FOR SELECT
TO authenticated
USING (true);

-- 3. serp_cache - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for serp_cache" ON serp_cache;
DROP POLICY IF EXISTS "Allow public select on serp_cache" ON serp_cache;
DROP POLICY IF EXISTS "Anyone can read SERP cache" ON serp_cache;
CREATE POLICY "Authenticated users can read serp_cache"
ON serp_cache FOR SELECT
TO authenticated
USING (true);

-- 4. raw_serp_data - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for raw_serp_data" ON raw_serp_data;
DROP POLICY IF EXISTS "Allow public select on raw_serp_data" ON raw_serp_data;
DROP POLICY IF EXISTS "Anyone can read raw SERP data" ON raw_serp_data;
CREATE POLICY "Authenticated users can read raw_serp_data"
ON raw_serp_data FOR SELECT
TO authenticated
USING (true);

-- 5. keyword_performance_cache - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for keyword_performance_cache" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Allow public select on keyword_performance_cache" ON keyword_performance_cache;
DROP POLICY IF EXISTS "Anyone can read keyword cache" ON keyword_performance_cache;
CREATE POLICY "Authenticated users can read keyword_performance_cache"
ON keyword_performance_cache FOR SELECT
TO authenticated
USING (true);

-- 6. keyword_position_history - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for keyword_position_history" ON keyword_position_history;
DROP POLICY IF EXISTS "Allow public select on keyword_position_history" ON keyword_position_history;
DROP POLICY IF EXISTS "Anyone can read position history" ON keyword_position_history;
CREATE POLICY "Authenticated users can read keyword_position_history"
ON keyword_position_history FOR SELECT
TO authenticated
USING (true);

-- 7. serp_tracking_history - Drop any existing public policy and add authenticated-only
DROP POLICY IF EXISTS "Public read access for serp_tracking_history" ON serp_tracking_history;
DROP POLICY IF EXISTS "Allow public select on serp_tracking_history" ON serp_tracking_history;
DROP POLICY IF EXISTS "Anyone can read tracking history" ON serp_tracking_history;
CREATE POLICY "Authenticated users can read serp_tracking_history"
ON serp_tracking_history FOR SELECT
TO authenticated
USING (true);