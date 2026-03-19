-- Sprint 2: Content Performance Signals table
CREATE TABLE public.content_performance_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  signal_type TEXT NOT NULL, -- 'email_convert', 'social_repurpose', 'publish', 'view'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_perf_signals_user_type ON public.content_performance_signals(user_id, signal_type);
CREATE INDEX idx_perf_signals_content ON public.content_performance_signals(content_id);

-- RLS
ALTER TABLE public.content_performance_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own signals"
  ON public.content_performance_signals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signals"
  ON public.content_performance_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role needs insert access from edge functions
CREATE POLICY "Service role full access"
  ON public.content_performance_signals FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);