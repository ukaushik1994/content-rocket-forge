-- ============================================================================
-- Phase 3 & 5: Content Generation Queue + Performance Indexes
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TASK 3.1: Content Generation Queue Table
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS content_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brief JSONB NOT NULL,
  format_id TEXT NOT NULL,
  piece_index INTEGER NOT NULL,
  
  -- Queue management
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Results
  content_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  error_message TEXT,
  
  -- Context (for resuming)
  campaign_context JSONB DEFAULT '{}',
  solution_id UUID,
  solution_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate queue entries
  UNIQUE(campaign_id, format_id, piece_index)
);

-- Queue table indexes
CREATE INDEX idx_queue_status_priority ON content_generation_queue(status, priority DESC, created_at);
CREATE INDEX idx_queue_campaign ON content_generation_queue(campaign_id, status);
CREATE INDEX idx_queue_user ON content_generation_queue(user_id, status);
CREATE INDEX idx_queue_created ON content_generation_queue(created_at DESC);

-- RLS policies for queue
ALTER TABLE content_generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue items" ON content_generation_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items" ON content_generation_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own queue items" ON content_generation_queue
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own queue items" ON content_generation_queue
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_queue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER queue_update_timestamp
  BEFORE UPDATE ON content_generation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_timestamp();

-- ----------------------------------------------------------------------------
-- TASK 5.4: Performance Indexes
-- ----------------------------------------------------------------------------

-- Campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_created ON campaigns(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_updated ON campaigns(updated_at DESC);

-- Content items table indexes
CREATE INDEX IF NOT EXISTS idx_content_campaign_created ON content_items(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_user_type ON content_items(user_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status);

-- Campaign analytics table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_campaign_date ON campaign_analytics(campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_content ON campaign_analytics(content_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_source ON campaign_analytics(source, date DESC);

-- Campaign costs table indexes
CREATE INDEX IF NOT EXISTS idx_costs_campaign_date ON campaign_costs(campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_costs_type ON campaign_costs(cost_type);

-- Analyze tables for query planner optimization
ANALYZE campaigns;
ANALYZE content_items;
ANALYZE campaign_analytics;
ANALYZE campaign_costs;
ANALYZE content_generation_queue;