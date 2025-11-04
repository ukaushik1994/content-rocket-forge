-- Create competitor discovery jobs table for tracking progress
CREATE TABLE IF NOT EXISTS public.competitor_discovery_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  competitor_id UUID NOT NULL REFERENCES public.company_competitors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running',
  progress_percent INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 10,
  current_solution TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  diagnostics JSONB DEFAULT '{}'::jsonb,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.competitor_discovery_jobs ENABLE ROW LEVEL SECURITY;

-- Policies for competitor_discovery_jobs
CREATE POLICY "Users can view their own discovery jobs"
  ON public.competitor_discovery_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discovery jobs"
  ON public.competitor_discovery_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discovery jobs"
  ON public.competitor_discovery_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create competitor solutions history table for tracking changes
CREATE TABLE IF NOT EXISTS public.competitor_solutions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID NOT NULL REFERENCES public.competitor_solutions(id) ON DELETE CASCADE,
  changed_fields JSONB,
  snapshot JSONB,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.competitor_solutions_history ENABLE ROW LEVEL SECURITY;

-- Policy for history (users can view history of solutions they can access)
CREATE POLICY "Users can view solution history for their competitors"
  ON public.competitor_solutions_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.competitor_solutions cs
      JOIN public.company_competitors cc ON cs.competitor_id = cc.id
      WHERE cs.id = competitor_solutions_history.solution_id
      AND cc.user_id = auth.uid()
    )
  );

-- Trigger function to track changes to competitor_solutions
CREATE OR REPLACE FUNCTION public.track_competitor_solution_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed_fields_json JSONB := '{}'::jsonb;
BEGIN
  -- Only track updates, not inserts or deletes
  IF TG_OP = 'UPDATE' THEN
    -- Track which fields changed
    IF OLD.solution_name IS DISTINCT FROM NEW.solution_name THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('solution_name', jsonb_build_object('old', OLD.solution_name, 'new', NEW.solution_name));
    END IF;
    
    IF OLD.description IS DISTINCT FROM NEW.description THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('description', jsonb_build_object('old', OLD.description, 'new', NEW.description));
    END IF;
    
    IF OLD.features IS DISTINCT FROM NEW.features THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('features', jsonb_build_object('old', OLD.features, 'new', NEW.features));
    END IF;
    
    IF OLD.pricing_info IS DISTINCT FROM NEW.pricing_info THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('pricing_info', jsonb_build_object('old', OLD.pricing_info, 'new', NEW.pricing_info));
    END IF;
    
    IF OLD.technical_specs IS DISTINCT FROM NEW.technical_specs THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('technical_specs', jsonb_build_object('old', OLD.technical_specs, 'new', NEW.technical_specs));
    END IF;
    
    IF OLD.external_url IS DISTINCT FROM NEW.external_url THEN
      changed_fields_json := changed_fields_json || jsonb_build_object('external_url', jsonb_build_object('old', OLD.external_url, 'new', NEW.external_url));
    END IF;

    -- Insert history record if any fields changed
    IF changed_fields_json != '{}'::jsonb THEN
      INSERT INTO public.competitor_solutions_history (
        solution_id,
        changed_fields,
        snapshot,
        changed_by
      ) VALUES (
        NEW.id,
        changed_fields_json,
        row_to_json(OLD)::jsonb,
        auth.uid()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tracking changes
DROP TRIGGER IF EXISTS track_solution_changes ON public.competitor_solutions;
CREATE TRIGGER track_solution_changes
  AFTER UPDATE ON public.competitor_solutions
  FOR EACH ROW
  EXECUTE FUNCTION public.track_competitor_solution_changes();

-- Add index for faster job lookups
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_user_competitor 
  ON public.competitor_discovery_jobs(user_id, competitor_id);

CREATE INDEX IF NOT EXISTS idx_discovery_jobs_status 
  ON public.competitor_discovery_jobs(status);

-- Add index for history lookups
CREATE INDEX IF NOT EXISTS idx_solutions_history_solution_id 
  ON public.competitor_solutions_history(solution_id, changed_at DESC);