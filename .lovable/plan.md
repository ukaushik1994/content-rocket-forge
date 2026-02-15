

# Remove Workspace Dependency and Complete Engage Implementation

## Problem
The Engage module currently requires a `team_workspaces` + `team_members` workspace setup, but the rest of Creaiter uses simple `user_id` scoping. There are 0 workspaces in the database, so users see "No workspace found" and can't use any Engage features.

## Solution
Replace `workspace_id` scoping with `user_id` scoping across all 18 Engage tables, matching the pattern used throughout the rest of Creaiter. Then auto-provision a personal workspace per user so the existing RLS and data isolation work seamlessly without any manual workspace creation step.

---

## Phase 1: Database Migration -- Auto-Provision Workspace ✅ DONE

Instead of removing `workspace_id` (which would require dropping/recreating all 18 tables and RLS policies), we auto-create a personal workspace for each user on first visit:

1. Create a database function `ensure_engage_workspace(p_user_id uuid)` that:
   - Checks if user has any `team_members` row
   - If not, creates a `team_workspaces` row (name = 'My Workspace') and a `team_members` row (role = 'owner')
   - Returns the workspace_id

2. This is called from the `WorkspaceContext` when no workspaces are found, making it completely transparent to the user.

This approach preserves all existing RLS policies, table structures, and the ability to add multi-tenancy later.

---

## Phase 2: Fix WorkspaceContext -- Remove Blocking State ✅ DONE

Update `WorkspaceContext.tsx`:
- When `fetchWorkspaces` returns empty, call `ensure_engage_workspace` RPC to auto-create
- Remove the "No workspace found" blocker from `EngageLayout.tsx`
- Set `canEdit = true` and `canManage = true` for auto-provisioned owners
- Remove workspace switcher from sidebar (only show if user has 2+ workspaces)

---

## Phase 3: Edge Functions (Backend Processing) ✅ DONE

### 3a. `engage-email-send`
- Picks `email_messages` with status = 'queued' in batches of 50
- Reads `email_provider_settings` for the workspace
- Sends via Resend API (if configured) or marks as "sent" (mock mode if no provider)
- Updates message status to sent/failed
- Writes to `engage_activity_log`

### 3b. `engage-journey-processor`
- Picks `journey_steps` where status = 'pending' and `scheduled_for <= now()`
- Per node type:
  - `send_email`: Creates `email_messages` entry
  - `wait`: Creates next step with future `scheduled_for`
  - `condition`: Evaluates rule, picks correct edge, creates next step
  - `update_contact`: Updates contact attributes/tags
  - `webhook`: POSTs to configured URL
  - `end`: Marks enrollment as completed
- Follows `journey_edges` to determine next node
- Writes to `engage_activity_log`

### 3c. `engage-social-poster`
- Picks `social_posts` where status = 'scheduled' and `scheduled_at <= now()`
- Stub: marks posted if `social_accounts` exist for provider, failed otherwise
- Updates `social_post_targets` status
- Writes to `engage_activity_log`

### 3d. `engage-job-runner`
- Master function that orchestrates the above three
- Called by pg_cron every minute
- Processes emails -> journey steps -> social posts in sequence

### 3e. `engage-unsubscribe`
- Public endpoint (verify_jwt = false)
- Accepts `?token=<contact_id>` (simple for MVP)
- Sets `unsubscribed = true` on the contact
- Returns HTML confirmation page

---

## Phase 4: Complete Missing UI Features

### 4a. Template Editor Enhancements
- Add variable inserter buttons (first_name, last_name, email, custom)
- Add live HTML preview panel
- Add "Test Send" modal that sends to a single email via the edge function

### 4b. Campaign Wizard Improvements
- Step 2: Add segment/tag audience selection (currently sends to all contacts)
- Step 3: Add schedule datetime picker
- Show estimated recipient count before launch

### 4c. Journey Builder Polish
- Custom node components (colored, typed, with icons) instead of generic default nodes
- Right-side inspector panel for editing selected node config
- Node config forms: template picker for SendEmail, duration for Wait, rule builder for Condition
- Validate button: check no orphan nodes, all branches connect
- Manual enroll button: pick a contact to enroll in the journey

### 4d. Automation Builder
- Add condition rule builder (same component as segments)
- Add action config: pick template for send_email, pick journey for enroll_journey
- Wire up: when automation trigger fires, execute actions

### 4e. Social Calendar View
- Month/week calendar grid showing scheduled posts by date
- Toggle between calendar and list view

### 4f. Activity Log
- Add contact name resolution (join with engage_contacts)
- Add date range filter
- Add "contact" filter dropdown

---

## Phase 5: Settings Integration

### Engage tab in Settings
- Already created (`EngageIntegrationSettings.tsx`)
- Verify it works: email provider config saves/loads correctly
- Add social account connection cards (placeholder OAuth with "Coming Soon" badges)

---

## Phase 6: Seed Data

Create a "Load Demo Data" button in Engage settings that inserts:
- 10 contacts with varied tags and attributes
- 2 segments ("Active Users", "Newsletter Subscribers")
- 2 email templates (Welcome, Follow-up)
- 1 sample journey (Trigger -> Wait 1 day -> Send Email -> End)
- Activity log entries for each seed action

---

## Implementation Order

| Step | What | Effort | Status |
|------|------|--------|--------|
| 1 | DB function `ensure_engage_workspace` + migration | Small | ✅ |
| 2 | Fix WorkspaceContext auto-provision + remove blocker | Small | ✅ |
| 3 | Edge function: `engage-email-send` | Medium | ✅ |
| 4 | Edge function: `engage-journey-processor` | Medium | ✅ |
| 5 | Edge function: `engage-social-poster` | Small | ✅ |
| 6 | Edge function: `engage-job-runner` (orchestrator) | Small | ✅ |
| 7 | Edge function: `engage-unsubscribe` (public) | Small | ✅ |
| 8 | pg_cron setup SQL for job runner | Small | |
| 9 | Template editor: variable inserter + preview + test send | Medium | |
| 10 | Campaign wizard: audience selector + schedule + review | Medium | |
| 11 | Journey builder: custom nodes + inspector + validation | Large | |
| 12 | Automation builder: conditions + action config | Medium | |
| 13 | Social calendar view | Medium | |
| 14 | Activity log: contact resolution + date filter | Small | |
| 15 | Seed data utility | Small | |

---

## Files to Create/Modify

**Database**: 1 migration (ensure_engage_workspace function)

**Edge Functions** (5 new):
- `supabase/functions/engage-email-send/index.ts`
- `supabase/functions/engage-journey-processor/index.ts`
- `supabase/functions/engage-social-poster/index.ts`
- `supabase/functions/engage-job-runner/index.ts`
- `supabase/functions/engage-unsubscribe/index.ts`

**Modified Components** (~12 files):
- `src/contexts/WorkspaceContext.tsx` -- auto-provision logic
- `src/components/engage/EngageLayout.tsx` -- remove workspace blocker
- `src/components/engage/EngageSidebar.tsx` -- conditional workspace switcher
- `src/components/engage/email/templates/TemplatesList.tsx` -- variable inserter, preview, test send
- `src/components/engage/email/campaigns/CampaignsList.tsx` -- audience selector, schedule, review step
- `src/components/engage/journeys/JourneyBuilder.tsx` -- custom nodes, inspector, validation
- `src/components/engage/automations/AutomationsList.tsx` -- condition builder, action config
- `src/components/engage/social/SocialDashboard.tsx` -- calendar view toggle
- `src/components/engage/activity/ActivityLog.tsx` -- contact resolution, date filter

**New Components** (~6 files):
- `src/components/engage/journeys/nodes/` -- Custom React Flow node components
- `src/components/engage/journeys/JourneyInspector.tsx`
- `src/components/engage/social/SocialCalendar.tsx`
- `src/components/engage/shared/RuleBuilder.tsx` -- Reusable rule builder for segments/conditions
- `src/utils/engage/seedData.ts`

**Config**:
- `supabase/config.toml` -- Add verify_jwt settings for new edge functions
