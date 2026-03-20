ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;

UPDATE public.content_items SET last_reviewed_at = updated_at WHERE last_reviewed_at IS NULL;