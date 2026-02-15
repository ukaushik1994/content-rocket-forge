
-- Auto-provision a personal workspace for engage users
CREATE OR REPLACE FUNCTION public.ensure_engage_workspace(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  -- Check if user already has a workspace
  SELECT workspace_id INTO v_workspace_id
  FROM public.team_members
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    RETURN v_workspace_id;
  END IF;

  -- Create workspace
  v_workspace_id := gen_random_uuid();
  INSERT INTO public.team_workspaces (id, name, created_at, updated_at)
  VALUES (v_workspace_id, 'My Workspace', now(), now());

  -- Add user as owner
  INSERT INTO public.team_members (workspace_id, user_id, role, joined_at)
  VALUES (v_workspace_id, p_user_id, 'owner', now());

  RETURN v_workspace_id;
END;
$$;
