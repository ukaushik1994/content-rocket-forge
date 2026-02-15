
# Remove Workspace Concept from Engage Module

## Approach

Keep `workspace_id` in the database (changing 20+ tables is unnecessary risk), but make it completely invisible to the user. One user = one auto-provisioned workspace, no switching, no management UI. Every user always has full edit/manage permissions on their own data.

## Changes

### 1. Simplify WorkspaceContext (`src/contexts/WorkspaceContext.tsx`)
- Keep auto-provisioning logic (it creates the transparent workspace_id behind the scenes)
- Remove `switchWorkspace`, `workspaces` array, `workspaceRole` from the interface
- Hardcode `canEdit = true` and `canManage = true` (single-user = full access)
- Remove localStorage workspace switching logic
- Keep `currentWorkspaceId` and `loading` (all queries depend on them)

### 2. Remove Workspace Switcher from Sidebar (`src/components/engage/EngageSidebar.tsx`)
- Remove the workspace dropdown Select component at the top
- Remove the `workspaces`, `currentWorkspaceId`, `switchWorkspace` destructuring from `useWorkspace`
- Clean up unused imports (Select components)

### 3. Clean Up Settings Page (`src/components/engage/settings/EngageSettings.tsx`)
- Remove the "Workspace" settings card (rename workspace section, lines ~295-319)
- Remove `canManage` guard on the Danger Zone (user always has access to their own data)
- Update subtitle text to remove "workspace" wording

## What Stays the Same
- All 25+ component files that use `useWorkspace()` to get `currentWorkspaceId` and `canEdit` continue working with zero changes
- All database queries using `.eq('workspace_id', currentWorkspaceId!)` remain valid
- Seed data function still receives workspaceId parameter (passed transparently)
- RLS policies stay as-is (they protect data per workspace, which maps 1:1 to user)

## Technical Detail
The `useWorkspace` hook interface simplifies to:
- `currentWorkspaceId: string | null` -- still needed by all queries
- `loading: boolean` -- still needed by EngageLayout
- `canEdit: true` -- always true
- `canManage: true` -- always true

All other consumers destructure only these fields, so no downstream changes needed.
