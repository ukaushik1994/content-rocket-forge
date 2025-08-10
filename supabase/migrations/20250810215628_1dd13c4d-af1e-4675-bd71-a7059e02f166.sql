-- Phase 3: Logging & Analytics for Smart Actions
-- 1) Create approval_recommendations table
CREATE TABLE IF NOT EXISTS public.approval_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  confidence INTEGER,
  reasoning TEXT,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_recommendations_content_id ON public.approval_recommendations(content_id);
CREATE INDEX IF NOT EXISTS idx_approval_recommendations_user_id ON public.approval_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_recommendations_created_at ON public.approval_recommendations(created_at);

-- Enable RLS and add policies
ALTER TABLE public.approval_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can insert their own recommendation records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_recommendations' AND policyname = 'Users can insert their own approval recommendations'
  ) THEN
    CREATE POLICY "Users can insert their own approval recommendations"
    ON public.approval_recommendations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Users can view their own recommendation records OR owners of the content can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_recommendations' AND policyname = 'Users can view own or content-owner can view recommendations'
  ) THEN
    CREATE POLICY "Users can view own or content-owner can view recommendations"
    ON public.approval_recommendations
    FOR SELECT
    USING (
      (auth.uid() = user_id)
      OR (
        content_id IN (
          SELECT ci.id FROM public.content_items ci WHERE ci.user_id = auth.uid()
        )
      )
    );
  END IF;
END$$;

-- Optional: allow users to delete their own logs (keep audit minimal; omit update)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_recommendations' AND policyname = 'Users can delete their own approval recommendations'
  ) THEN
    CREATE POLICY "Users can delete their own approval recommendations"
    ON public.approval_recommendations
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END$$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_recommendations_updated_at'
  ) THEN
    CREATE TRIGGER update_approval_recommendations_updated_at
    BEFORE UPDATE ON public.approval_recommendations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;


-- 2) Create approval_actions_log table
CREATE TABLE IF NOT EXISTS public.approval_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'user', -- 'user'|'ai' (ai reserved for future auto-actions)
  accepted_recommendation BOOLEAN NOT NULL DEFAULT false,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_actions_log_content_id ON public.approval_actions_log(content_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_log_user_id ON public.approval_actions_log(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_log_created_at ON public.approval_actions_log(created_at);

-- Enable RLS and add policies
ALTER TABLE public.approval_actions_log ENABLE ROW LEVEL SECURITY;

-- Users can insert their own action logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_actions_log' AND policyname = 'Users can insert their own approval action logs'
  ) THEN
    CREATE POLICY "Users can insert their own approval action logs"
    ON public.approval_actions_log
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END$$;

-- Users can view their own logs OR owners of the content can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_actions_log' AND policyname = 'Users can view own or content-owner can view action logs'
  ) THEN
    CREATE POLICY "Users can view own or content-owner can view action logs"
    ON public.approval_actions_log
    FOR SELECT
    USING (
      (auth.uid() = user_id)
      OR (
        content_id IN (
          SELECT ci.id FROM public.content_items ci WHERE ci.user_id = auth.uid()
        )
      )
    );
  END IF;
END$$;

-- Optional: allow users to delete their own logs (no updates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'approval_actions_log' AND policyname = 'Users can delete their own approval action logs'
  ) THEN
    CREATE POLICY "Users can delete their own approval action logs"
    ON public.approval_actions_log
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END$$;

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_actions_log_updated_at'
  ) THEN
    CREATE TRIGGER update_approval_actions_log_updated_at
    BEFORE UPDATE ON public.approval_actions_log
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;