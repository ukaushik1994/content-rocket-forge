

# Automations Page -- Complete Feature Audit & Implementation Plan

## What Already Exists (Working)

The Automations page is surprisingly well-built. Here is everything currently functional:

### Frontend (AutomationsList.tsx -- 637 lines)
- CRUD: Create, Edit, Delete automations
- Duplicate automation
- Toggle active/paused via Switch
- Search/filter automations
- 3 trigger types: Segment Entry, Tag Added, Event Occurred
- 6 action types: Send Email, Add Tag, Remove Tag, Enroll Journey, Webhook, Wait/Delay
- Multi-action workflows with reordering (move up/down)
- RuleBuilder-based conditions (optional filter layer)
- Template and Journey picker dropdowns for action config
- Execution count badges (from activity log)
- Execution Log viewer dialog
- Dry Run simulator (pick a contact, simulate actions)
- Premium UI: EngageHero, EngageDialogHeader, EngageButton, GlassCard, motion animations, ping dots
- Stats grid: Active / Paused / Total

### Frontend (AutomationRuns.tsx -- 231 lines)
- Full audit trail page at /engage/automations/runs
- Date range filter (24h, 7d, 30d)
- Status filter (all, success, failed)
- Search by automation name or contact email
- Stats: total runs, successful, failed, avg duration
- CSV export of run history
- Run detail dialog with trigger event + actions executed JSON viewer

### Backend (engage-job-runner edge function -- 292 lines)
- Evaluates all active automations every invocation
- Supports triggers: tag_added, segment_entry, contact_created, email_opened
- Executes actions: add_tag, remove_tag, send_email, enroll_journey, update_field, webhook, wait
- Rate limiting (per-automation daily cap + per-contact daily cap)
- Writes to automation_runs table with success/failure + duration
- Updates automation.updated_at as "last triggered" timestamp

### Database
- `engage_automations` table with: id, workspace_id, name, status, trigger_config, conditions, actions, description, rate_limit, error_routing, created_by, timestamps
- `automation_runs` table with: id, workspace_id, automation_id, contact_id, trigger_event, actions_executed, status, duration_ms, error, created_at
- RLS policies via `get_user_engage_workspace_ids`

---

## What Needs Fixing / Adding

### 1. Missing "View Runs" Link (Minor)
The AutomationRuns page exists at `/engage/automations/runs` but there is no visible link or button to navigate there from the AutomationsList. Users cannot discover it.

**Fix**: Add a "View All Runs" button/link in the hero actions area or stats section.

### 2. Trigger Type Mismatch (Backend vs Frontend)
The edge function supports 4 triggers: `tag_added`, `segment_entry`, `contact_created`, `email_opened`. But the frontend only exposes 3: `segment_entry`, `tag_added`, `event_occurred`.

- `contact_created` is missing from the UI
- `email_opened` is missing from the UI
- `event_occurred` exists in the UI but is not handled by the edge function

**Fix**: Align the frontend trigger options with what the backend supports. Add `contact_created` and `email_opened` as selectable triggers. Either implement `event_occurred` in the edge function or remove it from the UI.

### 3. Action Type Mismatch (Backend vs Frontend)
The edge function handles `update_field` but the UI does not offer it. The UI has `wait` which the backend skips (just logs it).

**Fix**: Add `update_field` as an action type in the UI with field name + value inputs.

### 4. Trigger Config Key Mismatch
The edge function checks `trigger.tag` for tag_added triggers, but the frontend saves as `trigger_config: { type: 'tag_added', value: 'tagname' }`. The key is `value` in the frontend but the backend expects `tag`.

**Fix**: Update the edge function to read `trigger.value || trigger.tag` for backward compatibility, or update the frontend to save as `trigger.tag`.

### 5. Rate Limit & Error Routing Not Exposed in UI
The `engage_automations` table has `rate_limit` and `error_routing` JSONB columns. The edge function reads and enforces `rate_limit.max_per_day` and `rate_limit.max_per_contact_per_day`. But the Create/Edit dialog has no fields for these.

**Fix**: Add an optional "Advanced Settings" collapsible section in the dialog with:
- Max executions per day (number input)
- Max per contact per day (number input)
- Error routing: on failure, continue / stop / notify (select)

### 6. Dry Run is Client-Side Only
The dry run simulator currently does a simplified check: `conditions.every(() => true)` -- it always passes. It does not actually evaluate rules against the contact's data.

**Fix**: Enhance `executeDryRun` to fetch the contact's full record and evaluate each condition rule against actual field values (email, tags, attributes, etc.). This makes the dry run meaningful.

### 7. No "Run Now" / Manual Trigger Button
There is no way to manually invoke the automation engine from the UI. Since `pg_cron` is not configured, automations never actually fire.

**Fix**: Add a "Run Now" button (either per-automation or global) that calls the `engage-job-runner` edge function. This gives immediate feedback while `pg_cron` is not set up.

### 8. Execution Log Queries Activity Log Instead of Runs Table
The execution log viewer in AutomationsList queries `engage_activity_log` (channel=automation), not the `automation_runs` table which has richer data (duration, actions_executed, trigger_event, error). The AutomationRuns page correctly uses `automation_runs`.

**Fix**: Update the inline execution log viewer to query `automation_runs` filtered by automation_id, giving consistent and richer data.

### 9. Empty State Has Standard Button
Line 544: The "Create First Automation" button in the empty state uses standard `Button` with inline gradient class instead of `EngageButton`.

**Fix**: Replace with `EngageButton`.

---

## Implementation Summary

| Change | File(s) | Type |
|--------|---------|------|
| Add "View All Runs" link | AutomationsList.tsx | UI |
| Align triggers (add contact_created, email_opened) | AutomationsList.tsx | UI + logic |
| Add update_field action type | AutomationsList.tsx | UI |
| Fix trigger config key mismatch | engage-job-runner/index.ts | Edge function |
| Add Rate Limit + Error Routing UI | AutomationsList.tsx | UI |
| Enhance dry run with real condition evaluation | AutomationsList.tsx | Logic |
| Add "Run Now" manual trigger button | AutomationsList.tsx | UI + API call |
| Switch exec log to automation_runs table | AutomationsList.tsx | Data query |
| Replace empty state button with EngageButton | AutomationsList.tsx | UI |

### Files Modified
- `src/components/engage/automations/AutomationsList.tsx` (primary -- 9 changes)
- `supabase/functions/engage-job-runner/index.ts` (trigger config key fix + event_occurred handler)

### No Database Changes Needed
All columns (`rate_limit`, `error_routing`) already exist. The `automation_runs` table is fully structured.

