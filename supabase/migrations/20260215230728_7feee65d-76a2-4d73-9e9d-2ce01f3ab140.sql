
-- Phase 1: Email thread system
CREATE TABLE public.email_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  contact_id UUID REFERENCES public.engage_contacts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'needs_reply' CHECK (status IN ('needs_reply','waiting','closed')),
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  sentiment TEXT,
  sla_deadline TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage threads in their workspace" ON public.email_threads
  FOR ALL USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE TABLE public.email_thread_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  thread_id UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'outbound' CHECK (direction IN ('inbound','outbound')),
  from_email TEXT NOT NULL DEFAULT '',
  to_email TEXT NOT NULL DEFAULT '',
  subject TEXT NOT NULL DEFAULT '',
  body_html TEXT DEFAULT '',
  body_text TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]',
  tracking JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_thread_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage thread messages in their workspace" ON public.email_thread_messages
  FOR ALL USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE TABLE public.email_thread_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  thread_id UUID NOT NULL REFERENCES public.email_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.email_thread_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage thread notes in their workspace" ON public.email_thread_notes
  FOR ALL USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Add thread_id to email_messages
ALTER TABLE public.email_messages ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES public.email_threads(id) ON DELETE SET NULL;

-- Phase 4: Journey production columns
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS scheduling_config JSONB DEFAULT '{}';
ALTER TABLE public.journeys ADD COLUMN IF NOT EXISTS suppression_rules JSONB DEFAULT '{}';

-- Phase 5: Automation runs audit table
CREATE TABLE public.automation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  automation_id UUID NOT NULL,
  contact_id UUID,
  trigger_event JSONB DEFAULT '{}',
  actions_executed JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed')),
  duration_ms INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view automation runs in their workspace" ON public.automation_runs
  FOR ALL USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Add rate_limit and error_routing to automations
ALTER TABLE public.engage_automations ADD COLUMN IF NOT EXISTS rate_limit JSONB DEFAULT '{}';
ALTER TABLE public.engage_automations ADD COLUMN IF NOT EXISTS error_routing JSONB DEFAULT '{}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_threads_workspace ON public.email_threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_contact ON public.email_threads(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_threads_status ON public.email_threads(status);
CREATE INDEX IF NOT EXISTS idx_email_thread_messages_thread ON public.email_thread_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_automation ON public.automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_runs_workspace ON public.automation_runs(workspace_id);
