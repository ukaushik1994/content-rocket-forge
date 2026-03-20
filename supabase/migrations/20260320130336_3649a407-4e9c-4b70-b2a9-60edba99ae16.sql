
-- 8A: Content Value Metric
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS content_value_score numeric DEFAULT 0;

-- 8B: Funnel Stage Tagging
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS funnel_stage text;

-- Validation trigger for funnel_stage
CREATE OR REPLACE FUNCTION public.validate_funnel_stage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.funnel_stage IS NOT NULL AND NEW.funnel_stage NOT IN ('tofu', 'mofu', 'bofu') THEN
    RAISE EXCEPTION 'Invalid funnel_stage: %. Must be tofu, mofu, or bofu', NEW.funnel_stage;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_funnel_stage_trigger ON public.content_items;
CREATE TRIGGER validate_funnel_stage_trigger
  BEFORE INSERT OR UPDATE ON public.content_items
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_funnel_stage();

-- 8C: Outline Persistence
ALTER TABLE public.content_items ADD COLUMN IF NOT EXISTS outline jsonb;

-- 8D: User Goals Tracking
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_type text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  period text DEFAULT 'monthly',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals"
  ON public.user_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8F: Proposal Validation
CREATE TABLE IF NOT EXISTS public.proposal_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.ai_strategy_proposals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  predicted_impressions integer,
  actual_impressions integer,
  accuracy_score numeric,
  validated_at timestamptz DEFAULT now(),
  data_source text DEFAULT 'manual',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.proposal_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own validations"
  ON public.proposal_validations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
