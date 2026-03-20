
-- Phase 8B: Soft delete columns
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Create index for efficient filtering of non-deleted rows
CREATE INDEX IF NOT EXISTS idx_content_items_deleted_at ON public.content_items (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_conversations_deleted_at ON public.ai_conversations (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_deleted_at ON public.campaigns (deleted_at) WHERE deleted_at IS NULL;
