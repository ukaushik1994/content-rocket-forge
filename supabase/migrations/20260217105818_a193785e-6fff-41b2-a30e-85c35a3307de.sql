
-- Journey version snapshots for undo/restore capability
CREATE TABLE public.journey_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  journey_id UUID NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_summary TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_journey_versions_journey ON public.journey_versions(journey_id);
CREATE INDEX idx_journey_versions_workspace ON public.journey_versions(workspace_id);

ALTER TABLE public.journey_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view journey versions in their workspace"
  ON public.journey_versions FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can create journey versions in their workspace"
  ON public.journey_versions FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can delete journey versions in their workspace"
  ON public.journey_versions FOR DELETE
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));
