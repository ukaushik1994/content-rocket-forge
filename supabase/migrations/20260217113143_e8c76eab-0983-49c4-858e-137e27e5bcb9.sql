
-- Contact scoring results (cached)
CREATE TABLE public.engage_contact_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.engage_contacts(id) ON DELETE CASCADE,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  churn_risk TEXT DEFAULT 'low' CHECK (churn_risk IN ('low', 'medium', 'high', 'critical')),
  scoring_factors JSONB DEFAULT '{}'::jsonb,
  recommended_actions TEXT[] DEFAULT '{}',
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, contact_id)
);

ALTER TABLE public.engage_contact_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scores in their workspace"
  ON public.engage_contact_scores FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can manage scores in their workspace"
  ON public.engage_contact_scores FOR ALL
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- AI briefing cache
CREATE TABLE public.engage_ai_briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT 'daily' CHECK (period IN ('daily', 'weekly')),
  summary TEXT NOT NULL,
  insights JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engage_ai_briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view briefings in their workspace"
  ON public.engage_ai_briefings FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can manage briefings in their workspace"
  ON public.engage_ai_briefings FOR ALL
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Add category to email_templates
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT null;

-- Add auto_evaluate to engage_segments
ALTER TABLE public.engage_segments ADD COLUMN IF NOT EXISTS auto_evaluate BOOLEAN DEFAULT false;
