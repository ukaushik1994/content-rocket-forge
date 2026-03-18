-- Add sharing columns to ai_conversations
ALTER TABLE public.ai_conversations
  ADD COLUMN IF NOT EXISTS is_shared boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Create index on share_token for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_conversations_share_token 
  ON public.ai_conversations(share_token) WHERE share_token IS NOT NULL;

-- RLS policy: allow anyone to SELECT shared conversations by token
CREATE POLICY "Anyone can view shared conversations by token"
  ON public.ai_conversations
  FOR SELECT
  USING (
    is_shared = true 
    AND share_token IS NOT NULL
  );

-- RLS policy: allow anyone to SELECT messages of shared conversations
CREATE POLICY "Anyone can view messages of shared conversations"
  ON public.ai_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_conversations
      WHERE id = ai_messages.conversation_id
        AND is_shared = true
        AND share_token IS NOT NULL
    )
  );