

# Fix Plan: Engage Module Issues Found During Testing

## Testing Summary

All 7 Engage subpages were tested (Email, Contacts, Segments, Journeys, Automations, Social, Activity, Settings). While every page loads its UI and shows create buttons, **no data can be created or loaded** because the workspace provisioning is completely broken.

---

## Critical Issue: `ensure_engage_workspace` RPC Fails with CHECK Constraint Violation

### Root Cause

The `ensure_engage_workspace` database function inserts `role = 'owner'` into `team_members`, but the table has a CHECK constraint that only allows:
- `'admin'`
- `'manager'`
- `'member'`

This means **every new user who visits Engage gets a silent failure** -- no workspace is created, `currentWorkspaceId` stays `null`, and:
- All queries with `.eq('workspace_id', currentWorkspaceId!)` return nothing
- All create actions fail (they need a workspace_id)
- The Settings page shows "No workspace found"
- The global Settings Engage tab shows "Unable to initialize Engage"

### Error from Supabase

```text
code: 23514
message: new row for relation "team_members" violates check constraint "team_members_role_check"
details: Failing row contains (..., owner, ...)
```

### Fix (Database Migration)

Update the `ensure_engage_workspace` function to use `'admin'` instead of `'owner'` (since `'admin'` is the highest allowed role in the CHECK constraint):

```sql
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
```

This is a single-line change: `'owner'` becomes `'admin'`.

---

## Secondary Issues Found

### 1. Engage Settings Page (within sidebar) shows "No workspace found"
- **Cause**: Same root cause -- `currentWorkspaceId` is `null` because provisioning failed
- **Fix**: Automatically resolved once the database function is fixed

### 2. Global Settings Engage Tab shows "Unable to initialize Engage"
- **Cause**: Same root cause -- the RPC call in `EngageIntegrationSettings.tsx` also fails
- **Fix**: Automatically resolved once the database function is fixed

### 3. Some 406 errors on `content_strategies` and `ai_context_state`
- These are pre-existing issues unrelated to Engage (likely schema mismatch for `is_active` filter)
- Not blocking Engage functionality

---

## Technical Summary

| What | Status | Fix |
|------|--------|-----|
| Email page | UI loads, no data (no workspace) | DB fix |
| Contacts page | UI loads, "Add Contact" won't work | DB fix |
| Segments page | UI loads, "New Segment" won't work | DB fix |
| Journeys page | UI loads, "New Journey" won't work | DB fix |
| Automations page | UI loads, "New Automation" won't work | DB fix |
| Social page | UI loads, posts won't save | DB fix |
| Activity page | UI loads, no events | DB fix |
| Settings page (sidebar) | "No workspace found" | DB fix |
| Global Settings Engage tab | "Unable to initialize Engage" | DB fix |

### Files to Change
- **Database migration only**: Replace `'owner'` with `'admin'` in the `ensure_engage_workspace` function
- **No frontend changes needed** -- all UI code is correct

### After the Fix
Once the migration runs, refreshing any Engage page will:
1. Call `ensure_engage_workspace` successfully
2. Create a workspace + team_members entry with role `'admin'`
3. Set `currentWorkspaceId` in WorkspaceContext
4. Enable all create buttons, data queries, and settings

