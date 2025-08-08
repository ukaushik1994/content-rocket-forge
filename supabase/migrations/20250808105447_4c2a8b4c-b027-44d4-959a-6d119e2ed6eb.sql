-- Create table to store SERP reuse metadata per content
CREATE TABLE IF NOT EXISTS public.content_reuse_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content_id uuid NOT NULL,
  primary_keyword text NOT NULL,
  used_faqs text[] NOT NULL DEFAULT '{}',
  used_headings text[] NOT NULL DEFAULT '{}',
  used_titles text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reuse_history ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can CRUD their own rows
CREATE POLICY "Users can insert their own reuse history"
ON public.content_reuse_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reuse history"
ON public.content_reuse_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reuse history"
ON public.content_reuse_history
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reuse history"
ON public.content_reuse_history
FOR DELETE
USING (auth.uid() = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_crh_user ON public.content_reuse_history(user_id);
CREATE INDEX IF NOT EXISTS idx_crh_keyword ON public.content_reuse_history(primary_keyword);
CREATE INDEX IF NOT EXISTS idx_crh_created_at ON public.content_reuse_history(created_at DESC);
