-- First, let's extend the ai_messages table to support enhanced chat features
ALTER TABLE ai_messages 
ADD COLUMN IF NOT EXISTS visual_data JSONB,
ADD COLUMN IF NOT EXISTS progress_indicator JSONB,
ADD COLUMN IF NOT EXISTS workflow_context JSONB;

-- Improve the user_llm_keys table for better OpenRouter persistence
ALTER TABLE user_llm_keys 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS default_model TEXT,
ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{}';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_llm_keys_user_provider ON user_llm_keys(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated ON ai_conversations(user_id, updated_at DESC);