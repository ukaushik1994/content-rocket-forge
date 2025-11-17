-- Remove artificial rate limiting for campaign generation
-- External AI and SERP services handle their own rate limits

-- Drop trigger first
DROP TRIGGER IF EXISTS before_update_generation_limits ON campaign_generation_limits;

-- Drop function
DROP FUNCTION IF EXISTS reset_generation_limit();

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own generation limits" ON campaign_generation_limits;
DROP POLICY IF EXISTS "Users can insert their own generation limits" ON campaign_generation_limits;
DROP POLICY IF EXISTS "Users can update their own generation limits" ON campaign_generation_limits;

-- Drop table
DROP TABLE IF EXISTS campaign_generation_limits;