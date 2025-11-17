-- Add rate limiting table for campaign strategy generation
CREATE TABLE IF NOT EXISTS campaign_generation_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  generation_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaign_generation_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own generation limits" ON campaign_generation_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation limits" ON campaign_generation_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation limits" ON campaign_generation_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Reset counter every hour via trigger
CREATE OR REPLACE FUNCTION reset_generation_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.window_start < NOW() - INTERVAL '1 hour' THEN
    NEW.generation_count := 0;
    NEW.window_start := NOW();
    NEW.last_reset := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_generation_limits
  BEFORE UPDATE ON campaign_generation_limits
  FOR EACH ROW
  EXECUTE FUNCTION reset_generation_limit();

-- Fix critical RLS policy on campaign_analytics
DROP POLICY IF EXISTS "Users can create their own campaign analytics" ON campaign_analytics;

-- Create secure policy that validates campaign ownership
CREATE POLICY "Users can create analytics for their own campaigns" ON campaign_analytics
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Validate content ownership if content_id is provided
CREATE POLICY "Users can create analytics for their own content" ON campaign_analytics
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    (content_id IS NULL OR EXISTS (
      SELECT 1 FROM content_items 
      WHERE content_items.id = campaign_analytics.content_id 
      AND content_items.user_id = auth.uid()
    ))
  );

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_content_items_campaign_id ON content_items(campaign_id);
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_user_campaign ON content_items(user_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Update foreign key constraint to CASCADE on delete
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'content_items_campaign_id_fkey' 
    AND table_name = 'content_items'
  ) THEN
    ALTER TABLE content_items DROP CONSTRAINT content_items_campaign_id_fkey;
  END IF;
END $$;

ALTER TABLE content_items 
  ADD CONSTRAINT content_items_campaign_id_fkey 
  FOREIGN KEY (campaign_id) 
  REFERENCES campaigns(id) 
  ON DELETE CASCADE;

-- Fix duplicate analytics entries - drop constraint first, then create unique index
ALTER TABLE campaign_analytics DROP CONSTRAINT IF EXISTS campaign_analytics_campaign_id_content_id_date_source_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_analytics_unique 
  ON campaign_analytics(campaign_id, COALESCE(content_id, '00000000-0000-0000-0000-000000000000'::uuid), date, COALESCE(source, 'unknown'));

-- Create atomic campaign creation function
CREATE OR REPLACE FUNCTION create_campaign_atomic(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_status TEXT,
  p_input JSONB,
  p_strategy JSONB
) RETURNS campaigns AS $$
DECLARE
  v_campaign campaigns;
BEGIN
  -- Create campaign
  INSERT INTO campaigns (user_id, name, original_idea, status, selected_strategy)
  VALUES (p_user_id, p_title, p_description, p_status, p_strategy)
  RETURNING * INTO v_campaign;
  
  -- Create initial cost tracking
  INSERT INTO campaign_costs (campaign_id, user_id, cost_type, amount, description, date)
  VALUES (v_campaign.id, p_user_id, 'ai_generation', 0, 'Initial strategy generation', CURRENT_DATE);
  
  -- Log creation event
  INSERT INTO campaign_analytics (campaign_id, user_id, date, metadata)
  VALUES (v_campaign.id, p_user_id, CURRENT_DATE, jsonb_build_object(
    'event', 'campaign_created',
    'timestamp', NOW()
  ));
  
  RETURN v_campaign;
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Campaign creation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_campaign_atomic TO authenticated;