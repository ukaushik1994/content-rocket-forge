-- Create saved_chart_analyses table for persisting chart analysis
CREATE TABLE IF NOT EXISTS public.saved_chart_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  charts_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  insights JSONB DEFAULT '[]'::jsonb,
  actionable_items JSONB DEFAULT '[]'::jsonb,
  deep_dive_prompts JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_chart_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own analyses"
  ON public.saved_chart_analyses
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own analyses"
  ON public.saved_chart_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
  ON public.saved_chart_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON public.saved_chart_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_saved_chart_analyses_updated_at
  BEFORE UPDATE ON public.saved_chart_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_saved_chart_analyses_user_id ON public.saved_chart_analyses(user_id);
CREATE INDEX idx_saved_chart_analyses_created_at ON public.saved_chart_analyses(created_at DESC);
CREATE INDEX idx_saved_chart_analyses_is_public ON public.saved_chart_analyses(is_public) WHERE is_public = true;