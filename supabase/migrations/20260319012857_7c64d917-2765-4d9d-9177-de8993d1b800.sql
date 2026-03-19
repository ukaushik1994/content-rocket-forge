-- Phase 2 & 3: Add feedback_helpful and is_pinned columns to ai_messages
-- Phase 4: Add goal column to ai_conversations

ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS feedback_helpful boolean DEFAULT NULL;
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS goal text DEFAULT NULL;