
CREATE TABLE public.automation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  automation_id UUID NOT NULL REFERENCES public.engage_automations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

CREATE INDEX idx_automation_versions_automation ON public.automation_versions(automation_id);
CREATE INDEX idx_automation_versions_workspace ON public.automation_versions(workspace_id);

ALTER TABLE public.automation_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view automation versions in their workspace"
ON public.automation_versions FOR SELECT
USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can insert automation versions in their workspace"
ON public.automation_versions FOR INSERT
WITH CHECK (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));
