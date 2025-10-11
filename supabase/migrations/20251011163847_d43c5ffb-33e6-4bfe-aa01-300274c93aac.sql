-- Create table for tracking AI insight interactions
CREATE TABLE IF NOT EXISTS public.chart_insight_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.saved_chart_analyses(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('prediction', 'anomaly', 'recommendation', 'trend')),
  insight_content TEXT NOT NULL,
  action_taken TEXT CHECK (action_taken IN ('viewed', 'applied', 'dismissed', 'shared')),
  chart_index INTEGER,
  interaction_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_insight_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insight analytics"
  ON public.chart_insight_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight analytics"
  ON public.chart_insight_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_chart_insight_analytics_user_id ON public.chart_insight_analytics(user_id);
CREATE INDEX idx_chart_insight_analytics_created_at ON public.chart_insight_analytics(created_at DESC);
CREATE INDEX idx_chart_insight_analytics_insight_type ON public.chart_insight_analytics(insight_type);