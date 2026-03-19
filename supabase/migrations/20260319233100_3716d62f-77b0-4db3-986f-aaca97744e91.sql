-- SB-21: Add conversation_id to content_items for linking content to conversations
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL;

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_content_items_conversation_id ON public.content_items(conversation_id) WHERE conversation_id IS NOT NULL;