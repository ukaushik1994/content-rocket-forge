
-- =============================================
-- ENGAGE MODULE: Full Database Schema
-- =============================================

-- 1. Security definer function for RLS (avoid recursion)
CREATE OR REPLACE FUNCTION public.get_user_engage_workspace_ids(p_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id FROM public.team_members WHERE user_id = p_user_id;
$$;

-- =============================================
-- 2. CONTACTS
-- =============================================
CREATE TABLE public.engage_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  first_name text,
  last_name text,
  tags text[] DEFAULT '{}',
  attributes jsonb DEFAULT '{}',
  unsubscribed boolean DEFAULT false,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, email)
);
ALTER TABLE public.engage_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_contacts_all" ON public.engage_contacts FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);
CREATE INDEX idx_engage_contacts_ws ON public.engage_contacts(workspace_id);
CREATE INDEX idx_engage_contacts_email ON public.engage_contacts(workspace_id, email);
CREATE INDEX idx_engage_contacts_tags ON public.engage_contacts USING gin(tags);

-- =============================================
-- 3. EVENTS
-- =============================================
CREATE TABLE public.engage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.engage_contacts(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  occurred_at timestamptz DEFAULT now()
);
ALTER TABLE public.engage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_events_all" ON public.engage_events FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);
CREATE INDEX idx_engage_events_contact ON public.engage_events(contact_id);
CREATE INDEX idx_engage_events_type ON public.engage_events(workspace_id, type);

-- =============================================
-- 4. SEGMENTS
-- =============================================
CREATE TABLE public.engage_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  definition jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.engage_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_segments_all" ON public.engage_segments FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 5. SEGMENT MEMBERSHIPS
-- =============================================
CREATE TABLE public.engage_segment_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  segment_id uuid NOT NULL REFERENCES public.engage_segments(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.engage_contacts(id) ON DELETE CASCADE,
  computed_at timestamptz DEFAULT now(),
  UNIQUE(segment_id, contact_id)
);
ALTER TABLE public.engage_segment_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_segment_memberships_all" ON public.engage_segment_memberships FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 6. EMAIL TEMPLATES
-- =============================================
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_html text DEFAULT '',
  body_text text DEFAULT '',
  variables text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_all" ON public.email_templates FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 7. EMAIL CAMPAIGNS
-- =============================================
CREATE TABLE public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  template_id uuid REFERENCES public.email_templates(id),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','complete','failed')),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  audience_definition jsonb DEFAULT '{}',
  stats jsonb DEFAULT '{"sent":0,"delivered":0,"opened":0,"clicked":0,"bounced":0,"failed":0}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_campaigns_all" ON public.email_campaigns FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 8. EMAIL MESSAGES
-- =============================================
CREATE TABLE public.email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.engage_contacts(id),
  to_email text NOT NULL,
  subject text NOT NULL,
  body_html text DEFAULT '',
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','failed')),
  provider_message_id text,
  error text,
  queued_at timestamptz DEFAULT now(),
  sent_at timestamptz
);
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_messages_all" ON public.email_messages FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);
CREATE INDEX idx_email_messages_status ON public.email_messages(status, queued_at);
CREATE INDEX idx_email_messages_campaign ON public.email_messages(campaign_id);

-- =============================================
-- 9. EMAIL PROVIDER SETTINGS
-- =============================================
CREATE TABLE public.email_provider_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE UNIQUE,
  provider text NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend','smtp')),
  config jsonb DEFAULT '{}',
  from_name text DEFAULT '',
  from_email text DEFAULT '',
  reply_to text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_provider_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_provider_settings_all" ON public.email_provider_settings FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 10. JOURNEYS
-- =============================================
CREATE TABLE public.journeys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused')),
  trigger_config jsonb DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journeys_all" ON public.journeys FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 11. JOURNEY NODES
-- =============================================
CREATE TABLE public.journey_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  type text NOT NULL,
  config jsonb DEFAULT '{}',
  position jsonb DEFAULT '{"x":0,"y":0}',
  UNIQUE(journey_id, node_id)
);
ALTER TABLE public.journey_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_nodes_all" ON public.journey_nodes FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 12. JOURNEY EDGES
-- =============================================
CREATE TABLE public.journey_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  source_node_id text NOT NULL,
  target_node_id text NOT NULL,
  condition_label text
);
ALTER TABLE public.journey_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_edges_all" ON public.journey_edges FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 13. JOURNEY ENROLLMENTS
-- =============================================
CREATE TABLE public.journey_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  journey_id uuid NOT NULL REFERENCES public.journeys(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES public.engage_contacts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','exited')),
  enrolled_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(journey_id, contact_id)
);
ALTER TABLE public.journey_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_enrollments_all" ON public.journey_enrollments FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 14. JOURNEY STEPS
-- =============================================
CREATE TABLE public.journey_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.journey_enrollments(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
  scheduled_for timestamptz DEFAULT now(),
  executed_at timestamptz,
  output jsonb DEFAULT '{}',
  error text
);
ALTER TABLE public.journey_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_steps_all" ON public.journey_steps FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);
CREATE INDEX idx_journey_steps_pending ON public.journey_steps(status, scheduled_for) WHERE status = 'pending';

-- =============================================
-- 15. AUTOMATIONS
-- =============================================
CREATE TABLE public.engage_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'paused' CHECK (status IN ('active','paused')),
  trigger_config jsonb DEFAULT '{}',
  conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '[]',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.engage_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_automations_all" ON public.engage_automations FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 16. SOCIAL ACCOUNTS
-- =============================================
CREATE TABLE public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  provider text NOT NULL,
  display_name text DEFAULT '',
  auth_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_accounts_all" ON public.social_accounts FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 17. SOCIAL POSTS
-- =============================================
CREATE TABLE public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  content text DEFAULT '',
  media_urls text[] DEFAULT '{}',
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','posted','failed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_posts_all" ON public.social_posts FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 18. SOCIAL POST TARGETS
-- =============================================
CREATE TABLE public.social_post_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  provider text NOT NULL,
  account_id uuid REFERENCES public.social_accounts(id),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','posted','failed')),
  provider_post_id text,
  error text
);
ALTER TABLE public.social_post_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_post_targets_all" ON public.social_post_targets FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);

-- =============================================
-- 19. ACTIVITY LOG
-- =============================================
CREATE TABLE public.engage_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.team_workspaces(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.engage_contacts(id) ON DELETE SET NULL,
  channel text NOT NULL DEFAULT 'system',
  type text NOT NULL,
  message text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
ALTER TABLE public.engage_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engage_activity_log_all" ON public.engage_activity_log FOR ALL USING (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
) WITH CHECK (
  workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid()))
);
CREATE INDEX idx_engage_activity_log_ws ON public.engage_activity_log(workspace_id, created_at DESC);
CREATE INDEX idx_engage_activity_log_contact ON public.engage_activity_log(contact_id);

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE TRIGGER set_engage_contacts_updated_at BEFORE UPDATE ON public.engage_contacts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_engage_segments_updated_at BEFORE UPDATE ON public.engage_segments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_email_provider_settings_updated_at BEFORE UPDATE ON public.email_provider_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_journeys_updated_at BEFORE UPDATE ON public.journeys
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_journey_enrollments_updated_at BEFORE UPDATE ON public.journey_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_engage_automations_updated_at BEFORE UPDATE ON public.engage_automations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_social_posts_updated_at BEFORE UPDATE ON public.social_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- SEGMENT EVALUATOR FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.evaluate_segment(p_segment_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id uuid;
  v_definition jsonb;
  v_count integer := 0;
BEGIN
  SELECT workspace_id, definition INTO v_workspace_id, v_definition
  FROM public.engage_segments WHERE id = p_segment_id;

  IF v_workspace_id IS NULL THEN RETURN 0; END IF;

  -- Clear old memberships
  DELETE FROM public.engage_segment_memberships WHERE segment_id = p_segment_id;

  -- Simple rule evaluation: match all contacts in workspace (base case)
  -- Rules are evaluated client-side for MVP; this inserts all matching contacts
  INSERT INTO public.engage_segment_memberships (workspace_id, segment_id, contact_id, computed_at)
  SELECT v_workspace_id, p_segment_id, id, now()
  FROM public.engage_contacts
  WHERE workspace_id = v_workspace_id
    AND unsubscribed = false;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
