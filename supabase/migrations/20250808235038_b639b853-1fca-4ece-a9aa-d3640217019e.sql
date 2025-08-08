-- Create tables for strategy creation runs and related data

-- Enable pgcrypto for gen_random_uuid if not enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) strategy_runs
CREATE TABLE IF NOT EXISTS public.strategy_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  region TEXT,
  language TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
  summary_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own strategy runs"
  ON public.strategy_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategy runs"
  ON public.strategy_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategy runs"
  ON public.strategy_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategy runs"
  ON public.strategy_runs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_strategy_runs_user ON public.strategy_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_runs_created ON public.strategy_runs(created_at DESC);

-- 2) strategy_clusters
CREATE TABLE IF NOT EXISTS public.strategy_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.strategy_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority_score INT,
  forecast_best NUMERIC,
  forecast_cons NUMERIC,
  edge_note TEXT,
  asset_mix_json JSONB
);

ALTER TABLE public.strategy_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clusters of their runs"
  ON public.strategy_clusters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.strategy_runs r
    WHERE r.id = run_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert clusters for their runs"
  ON public.strategy_clusters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.strategy_runs r
    WHERE r.id = run_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can update clusters of their runs"
  ON public.strategy_clusters FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_runs r
    WHERE r.id = run_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete clusters of their runs"
  ON public.strategy_clusters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_runs r
    WHERE r.id = run_id AND r.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_strategy_clusters_run ON public.strategy_clusters(run_id);
CREATE INDEX IF NOT EXISTS idx_strategy_clusters_priority ON public.strategy_clusters(priority_score DESC);

-- 3) strategy_keywords
CREATE TABLE IF NOT EXISTS public.strategy_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES public.strategy_clusters(id) ON DELETE CASCADE,
  kw TEXT NOT NULL,
  volume INT,
  difficulty INT,
  intent TEXT,
  related_searches JSONB,
  paa_questions JSONB,
  top_titles JSONB,
  has_snippet BOOLEAN,
  has_ai_overview BOOLEAN,
  priority_score INT,
  forecast_best NUMERIC,
  forecast_cons NUMERIC
);

ALTER TABLE public.strategy_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view keywords of their runs"
  ON public.strategy_keywords FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert keywords for their runs"
  ON public.strategy_keywords FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can update keywords of their runs"
  ON public.strategy_keywords FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete keywords of their runs"
  ON public.strategy_keywords FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_strategy_keywords_cluster ON public.strategy_keywords(cluster_id);
CREATE INDEX IF NOT EXISTS idx_strategy_keywords_kw ON public.strategy_keywords(kw);

-- 4) strategy_calendar
CREATE TABLE IF NOT EXISTS public.strategy_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES public.strategy_clusters(id) ON DELETE CASCADE,
  week INT,
  title TEXT,
  type TEXT
);

ALTER TABLE public.strategy_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view strategy calendar of their runs"
  ON public.strategy_calendar FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert strategy calendar for their runs"
  ON public.strategy_calendar FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can update strategy calendar of their runs"
  ON public.strategy_calendar FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete strategy calendar of their runs"
  ON public.strategy_calendar FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_strategy_calendar_cluster ON public.strategy_calendar(cluster_id);

-- 5) strategy_briefs
CREATE TABLE IF NOT EXISTS public.strategy_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES public.strategy_clusters(id) ON DELETE CASCADE,
  brief_stub_json JSONB
);

ALTER TABLE public.strategy_briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view strategy briefs of their runs"
  ON public.strategy_briefs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert strategy briefs for their runs"
  ON public.strategy_briefs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can update strategy briefs of their runs"
  ON public.strategy_briefs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete strategy briefs of their runs"
  ON public.strategy_briefs FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.strategy_clusters c
    JOIN public.strategy_runs r ON r.id = c.run_id
    WHERE c.id = cluster_id AND r.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_strategy_briefs_cluster ON public.strategy_briefs(cluster_id);

-- 6) content_input_history (reuse tracking)
CREATE TABLE IF NOT EXISTS public.content_input_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  primary_keyword TEXT,
  used_headings JSONB,
  used_faqs JSONB,
  used_titles JSONB,
  content_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_input_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own content input history"
  ON public.content_input_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content input history"
  ON public.content_input_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content input history"
  ON public.content_input_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_content_input_history_user ON public.content_input_history(user_id);
CREATE INDEX IF NOT EXISTS idx_content_input_history_kw ON public.content_input_history(primary_keyword);
