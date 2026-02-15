
-- Phase 2: Contact CRM depth - add fields to engage_contacts
ALTER TABLE public.engage_contacts
  ADD COLUMN IF NOT EXISTS company text,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS lifecycle_stage text DEFAULT 'lead',
  ADD COLUMN IF NOT EXISTS consent_status text DEFAULT 'subscribed',
  ADD COLUMN IF NOT EXISTS consent_reason text;

-- Phase 6: Social inbox items
CREATE TABLE public.social_inbox_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  account_id uuid REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'mention',
  content text NOT NULL DEFAULT '',
  author_name text,
  author_profile_url text,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid,
  linked_contact_id uuid REFERENCES public.engage_contacts(id) ON DELETE SET NULL,
  provider_item_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view social inbox items in their workspaces"
  ON public.social_inbox_items FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can insert social inbox items"
  ON public.social_inbox_items FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can update social inbox items"
  ON public.social_inbox_items FOR UPDATE
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can delete social inbox items"
  ON public.social_inbox_items FOR DELETE
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Social saved replies
CREATE TABLE public.social_saved_replies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_saved_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view saved replies in their workspaces"
  ON public.social_saved_replies FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can manage saved replies"
  ON public.social_saved_replies FOR ALL
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Add approval_status to social_posts
ALTER TABLE public.social_posts
  ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft';

-- Phase 7: Audit log
CREATE TABLE public.engage_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.engage_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs in their workspaces"
  ON public.engage_audit_log FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

CREATE POLICY "Users can insert audit logs"
  ON public.engage_audit_log FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_engage_workspace_ids(auth.uid())));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_inbox_workspace ON public.social_inbox_items(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_log_workspace ON public.engage_audit_log(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_lifecycle ON public.engage_contacts(workspace_id, lifecycle_stage);
