-- Sprint 3: Proactive Recommendations table
CREATE TABLE public.proactive_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'stale_draft', 'content_refresh', 'unused_proposal', 'calendar_gap', 'competitor_stale'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action TEXT NOT NULL, -- chat message to send when clicked
  priority INTEGER NOT NULL DEFAULT 5, -- 1=highest
  dismissed BOOLEAN NOT NULL DEFAULT false,
  acted_on BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_proactive_recs_user ON public.proactive_recommendations(user_id, dismissed, acted_on);

ALTER TABLE public.proactive_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recommendations"
  ON public.proactive_recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
  ON public.proactive_recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on proactive_recommendations"
  ON public.proactive_recommendations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);