-- Content Versioning table (E1)
CREATE TABLE public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  title TEXT,
  meta_title TEXT,
  meta_description TEXT,
  seo_score INTEGER,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_source TEXT NOT NULL DEFAULT 'manual',
  change_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast version history lookups
CREATE INDEX idx_content_versions_content_id ON public.content_versions(content_id, version_number DESC);
CREATE INDEX idx_content_versions_user_id ON public.content_versions(user_id);

-- Enable RLS
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own versions
CREATE POLICY "Users can view own versions" ON public.content_versions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own versions" ON public.content_versions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own versions" ON public.content_versions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());