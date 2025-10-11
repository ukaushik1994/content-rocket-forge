-- Create version history for saved chart analyses
CREATE TABLE IF NOT EXISTS public.saved_chart_analyses_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.saved_chart_analyses(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  description TEXT,
  charts_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  actionable_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  deep_dive_prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(analysis_id, version_number)
);

-- Enable RLS
ALTER TABLE public.saved_chart_analyses_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view versions of their analyses"
  ON public.saved_chart_analyses_versions
  FOR SELECT
  USING (
    analysis_id IN (
      SELECT id FROM public.saved_chart_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their analyses"
  ON public.saved_chart_analyses_versions
  FOR INSERT
  WITH CHECK (
    analysis_id IN (
      SELECT id FROM public.saved_chart_analyses WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

-- Index for performance
CREATE INDEX idx_saved_chart_analyses_versions_analysis_id 
  ON public.saved_chart_analyses_versions(analysis_id);

CREATE INDEX idx_saved_chart_analyses_versions_created_at 
  ON public.saved_chart_analyses_versions(created_at DESC);

-- Function to auto-create version on update
CREATE OR REPLACE FUNCTION create_analysis_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if this is an UPDATE (not INSERT)
  IF TG_OP = 'UPDATE' THEN
    -- Check if content actually changed
    IF NEW.charts_data IS DISTINCT FROM OLD.charts_data 
       OR NEW.insights IS DISTINCT FROM OLD.insights 
       OR NEW.actionable_items IS DISTINCT FROM OLD.actionable_items 
       OR NEW.deep_dive_prompts IS DISTINCT FROM OLD.deep_dive_prompts THEN
      
      -- Get next version number
      INSERT INTO public.saved_chart_analyses_versions (
        analysis_id,
        version_number,
        title,
        description,
        charts_data,
        insights,
        actionable_items,
        deep_dive_prompts,
        context,
        change_summary,
        created_by
      )
      SELECT 
        NEW.id,
        COALESCE((
          SELECT MAX(version_number) + 1 
          FROM public.saved_chart_analyses_versions 
          WHERE analysis_id = NEW.id
        ), 1),
        OLD.title,
        OLD.description,
        OLD.charts_data,
        OLD.insights,
        OLD.actionable_items,
        OLD.deep_dive_prompts,
        OLD.context,
        'Auto-saved version before update',
        NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create versions
CREATE TRIGGER save_analysis_version_trigger
  BEFORE UPDATE ON public.saved_chart_analyses
  FOR EACH ROW
  EXECUTE FUNCTION create_analysis_version();