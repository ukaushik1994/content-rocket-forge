-- Extend existing content_activity_log to support richer auditing
ALTER TABLE public.content_activity_log
  ADD COLUMN IF NOT EXISTS module TEXT,
  ADD COLUMN IF NOT EXISTS change_summary TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS prompt TEXT,
  ADD COLUMN IF NOT EXISTS content_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Realtime friendliness and performant filters
ALTER TABLE public.content_activity_log REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_content_activity_log_timestamp ON public.content_activity_log("timestamp" DESC);

-- Update trigger for updated_at
CREATE TRIGGER set_updated_at_content_activity_log
BEFORE UPDATE ON public.content_activity_log
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Extend existing dashboard_alerts to act as centralized notifications
ALTER TABLE public.dashboard_alerts
  ADD COLUMN IF NOT EXISTS module TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS severity TEXT NOT NULL DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unread',
  ADD COLUMN IF NOT EXISTS link_url TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.dashboard_alerts REPLICA IDENTITY FULL;
CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_status ON public.dashboard_alerts(status);

CREATE TRIGGER set_updated_at_dashboard_alerts
BEFORE UPDATE ON public.dashboard_alerts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();