
# Fix: Workspace Loading Failure (Root Cause of All Empty Pages)

## The Real Problem

Every Engage page appears empty and has no create buttons because the **workspace never loads**. This is caused by two database-level bugs:

### Bug 1: Infinite Recursion in RLS Policies (Error 42P17)

The SELECT policies on `team_workspaces` and `team_members` reference each other, creating an infinite loop:

```text
team_workspaces SELECT policy --> checks team_members table
team_members SELECT policy --> checks team_workspaces table
        --> INFINITE LOOP --> PostgreSQL error 42P17
```

### Bug 2: `ensure_engage_workspace` Function Missing `owner_id`

The auto-provisioning function inserts into `team_workspaces` without setting `owner_id`, which is a NOT NULL column. This means even if RLS was fixed, workspace creation would fail.

## Impact

Because `currentWorkspaceId` is never set:
- `canEdit` is always `false` -- no create/edit buttons appear
- All queries have `enabled: !!currentWorkspaceId` -- no data loads
- "Load Demo Data" cannot work (needs workspace_id)
- Every single Engage page is broken

## Fix Plan

### Step 1: Fix RLS Policies (Database Migration)

Replace the circular policies with non-recursive ones:

**`team_members` SELECT policy** -- Use the `get_user_engage_workspace_ids()` SECURITY DEFINER function (already exists) instead of querying `team_workspaces`:

```sql
DROP POLICY "Users can view team members of workspaces they belong to" ON team_members;
CREATE POLICY "Users can view their own team memberships"
  ON team_members FOR SELECT
  USING (user_id = auth.uid());
```

**`team_workspaces` SELECT policy** -- Use the same SECURITY DEFINER function to avoid touching `team_members`:

```sql
DROP POLICY "Users can view workspaces they own or are members of" ON team_workspaces;
CREATE POLICY "Users can view workspaces they belong to"
  ON team_workspaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR id IN (SELECT get_user_engage_workspace_ids(auth.uid()))
  );
```

Also fix the INSERT/UPDATE/DELETE policies on `team_members` that reference `team_workspaces`:

```sql
-- Use SECURITY DEFINER function or direct user_id check
DROP POLICY "Users can create team members for workspaces they own" ON team_members;
CREATE POLICY "Owners can manage team members"
  ON team_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM team_workspaces WHERE owner_id = auth.uid()
    )
  );
```

Wait -- this still references `team_workspaces`. The fix is to make `team_members` policies only check `user_id = auth.uid()` for SELECT, and use the SECURITY DEFINER function for write operations.

### Step 2: Fix `ensure_engage_workspace` Function

Update to include `owner_id`:

```sql
INSERT INTO public.team_workspaces (id, name, owner_id, created_at, updated_at)
VALUES (v_workspace_id, 'My Workspace', p_user_id, now(), now());
```

### Step 3: No Frontend Changes Needed

Once the database is fixed, the existing WorkspaceContext code will work correctly -- it already calls `ensure_engage_workspace` as a fallback and fetches team_members with the workspace join.

## Technical Details

### Files to Modify
- Database migration only (no frontend file changes)

### SQL Migration Steps
1. Drop all 4 circular RLS policies on `team_members`
2. Drop all 4 RLS policies on `team_workspaces`
3. Recreate `team_members` policies using `user_id = auth.uid()` for SELECT and the SECURITY DEFINER function for write ops
4. Recreate `team_workspaces` policies using `owner_id` check + SECURITY DEFINER function
5. Replace `ensure_engage_workspace` function to include `owner_id = p_user_id`

### Verification
After the migration, navigating to any Engage page will:
1. Query `team_members` successfully (no recursion)
2. Auto-provision a workspace via `ensure_engage_workspace` (with owner_id set)
3. Set `currentWorkspaceId` and `canEdit = true`
4. Show all create buttons and enable data loading
