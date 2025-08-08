-- Create table to log all user-driven content changes and review activity
CREATE TABLE IF NOT EXISTS public.content_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_id UUID NULL REFERENCES public.content_items(id) ON DELETE SET NULL,
  module TEXT NOT NULL, -- e.g. 'approval', 'editor', 'seo', 'repurpose'
  action TEXT NOT NULL, -- e.g. 'edit', 'note_added', 'approve', 'reject', 'request_changes'
  change_summary TEXT,  -- short human summary of what changed
  notes TEXT,           -- free-form notes added by reviewer/editor
  prompt TEXT,          -- the prompt or instruction given (for continuous learning)
  details JSONB NOT NULL DEFAULT '{}'::jsonb, -- structured metadata for analytics
  content_snapshot JSONB, -- optional snapshot of content/fields after change
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Improve realtime payloads
ALTER TABLE public.content_activity_log REPLICA IDENTITY FULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_activity_log_user_id ON public.content_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_content_activity_log_content_id ON public.content_activity_log(content_id);
CREATE INDEX IF NOT EXISTS idx_content_activity_log_created_at ON public.content_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.content_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies: owners can manage their own logs, admins can read/manage all
CREATE POLICY "Users can insert their own activity logs" ON public.content_activity_log
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can select their own activity logs" ON public.content_activity_log
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own activity logs" ON public.content_activity_log
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete activity logs" ON public.content_activity_log
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER set_updated_at_content_activity_log
BEFORE UPDATE ON public.content_activity_log
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- Centralized notifications table
CREATE TABLE IF NOT EXISTS public.dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- recipient
  module TEXT NOT NULL,  -- source module
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','success','warning','error')),
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread','read','archived')),
  link_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Improve realtime payloads
ALTER TABLE public.dashboard_alerts REPLICA IDENTITY FULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_user_id ON public.dashboard_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_created_at ON public.dashboard_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_status ON public.dashboard_alerts(status);

-- Enable RLS
ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own alerts" ON public.dashboard_alerts
FOR INSERT
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own alerts" ON public.dashboard_alerts
FOR SELECT
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own alerts" ON public.dashboard_alerts
FOR UPDATE
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete alerts" ON public.dashboard_alerts
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER set_updated_at_dashboard_alerts
BEFORE UPDATE ON public.dashboard_alerts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();