-- Fix ai_messages table constraints and add missing fields
-- Update the type check constraint to allow proper message types
ALTER TABLE ai_messages DROP CONSTRAINT IF EXISTS ai_messages_type_check;
ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_type_check CHECK (type IN ('user', 'assistant', 'system'));

-- Add index for better query performance on conversation messages
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created 
ON ai_messages(conversation_id, created_at);

-- Add index for better performance on conversation queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_updated 
ON ai_conversations(user_id, updated_at DESC);

-- Ensure status column has proper default and constraints
ALTER TABLE ai_messages ALTER COLUMN status SET DEFAULT 'completed';
ALTER TABLE ai_messages DROP CONSTRAINT IF EXISTS ai_messages_status_check;
ALTER TABLE ai_messages ADD CONSTRAINT ai_messages_status_check 
CHECK (status IN ('completed', 'pending', 'error', 'processing'));

-- Create trigger to automatically update conversation timestamp when messages are added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON ai_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();