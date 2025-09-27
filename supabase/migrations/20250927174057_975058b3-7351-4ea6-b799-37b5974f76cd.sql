-- Fix function search path security issues
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix the pagination function as well
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;