
-- Step 1: Drop all existing policies on team_members
DROP POLICY IF EXISTS "Users can view team members of workspaces they belong to" ON public.team_members;
DROP POLICY IF EXISTS "Users can create team members for workspaces they own" ON public.team_members;
DROP POLICY IF EXISTS "Users can update team members in their workspaces" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete team members from workspaces they own" ON public.team_members;
DROP POLICY IF EXISTS "Users can view their own team memberships" ON public.team_members;
DROP POLICY IF EXISTS "Owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can delete team members" ON public.team_members;

-- Step 2: Drop all existing policies on team_workspaces
DROP POLICY IF EXISTS "Users can view workspaces they own or are members of" ON public.team_workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.team_workspaces;
DROP POLICY IF EXISTS "Owners can update their workspaces" ON public.team_workspaces;
DROP POLICY IF EXISTS "Owners can delete their workspaces" ON public.team_workspaces;
DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON public.team_workspaces;

-- Step 3: Recreate team_members policies (no cross-table references)
CREATE POLICY "Users can view their own team memberships"
  ON public.team_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership"
  ON public.team_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
  ON public.team_members FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own membership"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

-- Step 4: Recreate team_workspaces policies (uses SECURITY DEFINER function, no recursion)
CREATE POLICY "Users can view workspaces they belong to"
  ON public.team_workspaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT get_user_engage_workspace_ids(auth.uid()))
  );

CREATE POLICY "Users can create workspaces"
  ON public.team_workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their workspaces"
  ON public.team_workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their workspaces"
  ON public.team_workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Step 5: Fix ensure_engage_workspace to include owner_id
CREATE OR REPLACE FUNCTION public.ensure_engage_workspace(p_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  VALUES (v_workspace_id, p_user_id, 'owner', now());

  RETURN v_workspace_id;
END;
$function$;
