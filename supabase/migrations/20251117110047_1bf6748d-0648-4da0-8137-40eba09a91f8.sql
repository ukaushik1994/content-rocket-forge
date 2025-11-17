-- Create campaign_analytics table
CREATE TABLE IF NOT EXISTS campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  engagement_count INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  source TEXT,
  platform TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, content_id, date, source)
);

-- Create campaign_costs table
CREATE TABLE IF NOT EXISTS campaign_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  cost_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add performance_metrics column to content_items
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{
  "views": 0,
  "engagement": 0,
  "conversions": 0,
  "clicks": 0,
  "shares": 0,
  "last_updated": null
}'::jsonb;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_campaign ON campaign_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_content ON campaign_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_date ON campaign_analytics(date);
CREATE INDEX IF NOT EXISTS idx_campaign_analytics_user ON campaign_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_costs_campaign ON campaign_costs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_costs_user ON campaign_costs(user_id);

-- Enable RLS
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_costs ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_analytics
CREATE POLICY "Users can view their own campaign analytics"
  ON campaign_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign analytics"
  ON campaign_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign analytics"
  ON campaign_analytics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign analytics"
  ON campaign_analytics FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for campaign_costs
CREATE POLICY "Users can view their own campaign costs"
  ON campaign_costs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaign costs"
  ON campaign_costs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaign costs"
  ON campaign_costs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaign costs"
  ON campaign_costs FOR DELETE
  USING (auth.uid() = user_id);