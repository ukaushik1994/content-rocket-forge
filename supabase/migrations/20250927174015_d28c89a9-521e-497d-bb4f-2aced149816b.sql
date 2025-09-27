-- Add message status tracking and performance indexes to ai_messages table
ALTER TABLE ai_messages 
ADD COLUMN IF NOT EXISTS message_status TEXT DEFAULT 'sent' CHECK (message_status IN ('sending', 'sent', 'delivered', 'read', 'error')),
ADD COLUMN IF NOT EXISTS message_sequence BIGSERIAL,
ADD COLUMN IF NOT EXISTS read_by JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_details TEXT,
ADD COLUMN IF NOT EXISTS is_streaming BOOLEAN DEFAULT false;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_sequence ON ai_messages(conversation_id, message_sequence DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_status ON ai_messages(message_status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_conversations ON ai_messages(conversation_id) WHERE status = 'completed';

-- Enable real-time updates for ai_messages
ALTER TABLE ai_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;

-- Add function to update message status with real-time notifications
CREATE OR REPLACE FUNCTION update_message_status(
  message_id UUID,
  new_status TEXT,
  user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_messages 
  SET 
    message_status = new_status,
    read_by = CASE 
      WHEN new_status = 'read' AND user_id IS NOT NULL THEN 
        COALESCE(read_by, '[]'::jsonb) || jsonb_build_array(user_id::text)
      ELSE read_by
    END,
    updated_at = NOW()
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get conversation messages with pagination
CREATE OR REPLACE FUNCTION get_conversation_messages(
  conv_id UUID,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  type TEXT,
  content TEXT,
  visual_data JSONB,
  progress_indicator JSONB,
  workflow_context JSONB,
  function_calls JSONB,
  status TEXT,
  message_status TEXT,
  message_sequence BIGINT,
  read_by JSONB,
  is_streaming BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.type,
    m.content,
    m.visual_data,
    m.progress_indicator,
    m.workflow_context,
    m.function_calls,
    m.status,
    m.message_status,
    m.message_sequence,
    m.read_by,
    m.is_streaming,
    m.created_at
  FROM ai_messages m
  WHERE m.conversation_id = conv_id
  ORDER BY m.message_sequence DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user typing indicators table for real-time collaboration
CREATE TABLE IF NOT EXISTS user_typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT false,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes and RLS for typing indicators
CREATE UNIQUE INDEX IF NOT EXISTS idx_typing_user_conversation ON user_typing_indicators(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_typing_conversation ON user_typing_indicators(conversation_id);

ALTER TABLE user_typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage typing indicators for their conversations" 
ON user_typing_indicators FOR ALL 
USING (
  conversation_id IN (
    SELECT id FROM ai_conversations WHERE user_id = auth.uid()
  )
);

-- Enable real-time for typing indicators
ALTER TABLE user_typing_indicators REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_typing_indicators;