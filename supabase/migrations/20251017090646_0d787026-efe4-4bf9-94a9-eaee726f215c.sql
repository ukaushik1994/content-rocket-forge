-- Add indexes for faster queries on AI strategy proposals, strategies, and content items
CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_user_status 
  ON ai_strategy_proposals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_strategies_user_status 
  ON ai_strategies(user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_items_user_status 
  ON content_items(user_id, status);

CREATE INDEX IF NOT EXISTS idx_ai_strategy_proposals_created 
  ON ai_strategy_proposals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_user 
  ON content_pipeline(user_id);

CREATE INDEX IF NOT EXISTS idx_content_strategies_user_active 
  ON content_strategies(user_id, is_active);