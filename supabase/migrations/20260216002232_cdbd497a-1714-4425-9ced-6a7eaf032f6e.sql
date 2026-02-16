CREATE OR REPLACE FUNCTION public.ensure_engage_workspace(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workspace_id uuid;
BEGIN
  SELECT workspace_id INTO v_workspace_id
  FROM public.team_members
  WHERE user_id = p_user_id
  LIMIT 1;

  IF v_workspace_id IS NOT NULL THEN
    RETURN v_workspace_id;
  END IF;

  v_workspace_id := gen_random_uuid();
  INSERT INTO public.team_workspaces (id, name, owner_id, created_at, updated_at)
  VALUES (v_workspace_id, 'My Workspace', p_user_id, now(), now());

  INSERT INTO public.team_members (workspace_id, user_id, role, joined_at)
  VALUES (v_workspace_id, p_user_id, 'admin', now());

  RETURN v_workspace_id;
END;
$$;