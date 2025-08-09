-- Phase 1: Persistent AI analysis and settings tables

-- 1) Table: content_ai_analyses
CREATE TABLE IF NOT EXISTS public.content_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  user_id UUID NOT NULL,
  ai_provider TEXT,
  model TEXT,
  prompt_version TEXT,
  settings_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_score INTEGER,
  readability_score NUMERIC,
  reanalyze_count INTEGER NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure a single analysis per content item
CREATE UNIQUE INDEX IF NOT EXISTS content_ai_analyses_content_id_key
  ON public.content_ai_analyses(content_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS content_ai_analyses_user_idx
  ON public.content_ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS content_ai_analyses_analyzed_at_idx
  ON public.content_ai_analyses(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS content_ai_analyses_analysis_gin
  ON public.content_ai_analyses USING GIN (analysis);

-- Optional FK (keeps data tidy)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'content_ai_analyses_content_id_fkey'
  ) THEN
    ALTER TABLE public.content_ai_analyses
      ADD CONSTRAINT content_ai_analyses_content_id_fkey
      FOREIGN KEY (content_id) REFERENCES public.content_items(id) ON DELETE CASCADE;
  END IF;
END $$;

-- RLS for content_ai_analyses
ALTER TABLE public.content_ai_analyses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own analyses'
  ) THEN
    CREATE POLICY "Users can insert their own analyses"
    ON public.content_ai_analyses
    FOR INSERT
    WITH CHECK (
      user_id = auth.uid()
      AND content_id IN (
        SELECT id FROM public.content_items WHERE user_id = auth.uid()
      )
    );
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own analyses'
  ) THEN
    CREATE POLICY "Users can update their own analyses"
    ON public.content_ai_analyses
    FOR UPDATE
    USING (user_id = auth.uid());
  END IF;

  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view analyses for their content'
  ) THEN
    CREATE POLICY "Users can view analyses for their content"
    ON public.content_ai_analyses
    FOR SELECT
    USING (
      user_id = auth.uid()
      OR content_id IN (
        SELECT id FROM public.content_items WHERE user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_content_ai_analyses'
  ) THEN
    CREATE TRIGGER set_updated_at_content_ai_analyses
    BEFORE UPDATE ON public.content_ai_analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;


-- 2) Table: content_analysis_settings (per-user scoring and prompt config)
CREATE TABLE IF NOT EXISTS public.content_analysis_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt_template TEXT,
  scoring_metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One settings row per user
CREATE UNIQUE INDEX IF NOT EXISTS content_analysis_settings_user_key
  ON public.content_analysis_settings(user_id);

-- Helpful index on updated_at (for stale checks)
CREATE INDEX IF NOT EXISTS content_analysis_settings_updated_idx
  ON public.content_analysis_settings(updated_at DESC);

-- RLS for content_analysis_settings
ALTER TABLE public.content_analysis_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own analysis settings'
  ) THEN
    CREATE POLICY "Users can insert their own analysis settings"
    ON public.content_analysis_settings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());
  END IF;

  -- UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own analysis settings'
  ) THEN
    CREATE POLICY "Users can update their own analysis settings"
    ON public.content_analysis_settings
    FOR UPDATE
    USING (user_id = auth.uid());
  END IF;

  -- SELECT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own analysis settings'
  ) THEN
    CREATE POLICY "Users can view their own analysis settings"
    ON public.content_analysis_settings
    FOR SELECT
    USING (user_id = auth.uid());
  END IF;
END $$;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_content_analysis_settings'
  ) THEN
    CREATE TRIGGER set_updated_at_content_analysis_settings
    BEFORE UPDATE ON public.content_analysis_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;