-- Phase 3: Content generation feedback table for learning user editing patterns
CREATE TABLE public.content_generation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'edit_pattern',
  feedback_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.content_generation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON public.content_generation_feedback
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.content_generation_feedback
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_content_gen_feedback_user ON public.content_generation_feedback(user_id, created_at DESC);