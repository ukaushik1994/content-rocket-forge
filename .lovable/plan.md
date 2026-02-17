
# Journeys Page -- Complete Audit & Powerhouse Enhancement Plan

## Current State (What Already Works)

### JourneysList.tsx (439 lines)
- CRUD: Create, Rename, Delete, Duplicate journeys
- 3 pre-built templates (Welcome Series, Onboarding Flow, Re-engagement)
- Toggle Active/Paused status
- Search/filter
- Enrollment count badges per journey
- Node count badges per journey
- Stats grid: Active / Draft / Paused
- Premium UI: EngageHero, GlassCard, motion animations, ping dots

### JourneyBuilder.tsx (402 lines)
- React Flow v12 visual canvas with custom node types
- 7 node types: Trigger, Send Email, Wait, Condition, Update Contact, Webhook, End
- Undo/Redo (Ctrl+Z / Ctrl+Y) with 20-step history
- Auto-save (3-second debounce)
- Keyboard shortcuts (Delete node, Ctrl+S)
- Node execution count overlays (for active journeys)
- Edge label editing (double-click)
- Snap-to-grid, MiniMap, Controls, Background
- Validate journey (checks for trigger, end, orphan detection)
- Enrollment stats badges in toolbar (active, done, exited)
- 3 analytics dialogs: Analytics, Enrollments, Performance

### JourneyInspector.tsx (245 lines)
- Side panel for node config
- Trigger: type (Manual, Segment Entry, Event) + segment picker + event name
- Send Email: template picker
- Wait: duration + unit (minutes/hours/days)
- Condition: RuleBuilder
- Update Contact: add_tag / remove_tag / set_attribute
- Webhook: URL + method
- Custom label for all nodes

### JourneyAnalytics.tsx
- Enrollment timeline (30-day line chart)
- Node conversion funnel (bar chart)
- Summary cards: enrolled, active, completed, drop-off rate

### JourneyPerformance.tsx
- Conversion funnel bar chart (passed vs failed per node)
- Drop-off per node table
- Summary: enrolled, active, completed, conversion rate

### JourneyEnrollments.tsx
- Enrollment list with contact names
- Expandable step history per enrollment
- Pause / Skip-to-end actions per enrollment
- Step retry for failed steps

### engage-journey-processor (edge function, 296 lines)
- Processes pending journey_steps
- Suppression check (skip unsubscribed)
- Scheduling window (send_window_start/end for emails)
- Frequency cap (max emails per day)
- Executes: send_email, wait, condition, update_contact, webhook, end
- Condition branching with Yes/No edge labels
- Activity logging

### Database
- `journeys`: id, workspace_id, name, status, trigger_config, description, version, scheduling_config, suppression_rules
- `journey_nodes`: id, workspace_id, journey_id, node_id, type, config, position
- `journey_edges`: id, workspace_id, journey_id, source_node_id, target_node_id, condition_label
- `journey_enrollments`: id, workspace_id, journey_id, contact_id, status, enrolled_at, updated_at
- `journey_steps`: id, workspace_id, enrollment_id, node_id, status, scheduled_for, executed_at, output, error

---

## Issues & Missing Features

### Fix 1: Empty State Button Not Using EngageButton
Line 365: "Create First Journey" uses standard `Button` with inline gradient. Should use `EngageButton` for consistency.

### Fix 2: No Manual Enrollment Button
There is no way to manually enroll a contact into a journey from the UI. The Enrollments dialog shows existing enrollments but cannot add new ones. Users cannot test journeys without backend triggers.

### Fix 3: Journey Description Not Editable After Creation
The description is set at creation time but cannot be updated from the list or builder. Only rename exists.

### Fix 4: No "Run Processor" Button
The journey processor edge function is invoked by the engage-job-runner, but there is no manual trigger. Unlike automations which now have "Run Now", journeys have no equivalent.

### Fix 5: Update Contact Node Config Mismatch
The Inspector saves `config.tag` and `config.action`, but the edge function reads `config.set_tag` and `config.set_field`. This means tags and attributes saved from the UI will never be applied by the processor.

### Fix 6: Condition Node Inspector Uses Simple RuleBuilder But Processor Expects Single Field
The Inspector renders a full `RuleBuilder` (multi-rule) for conditions, but the processor only reads `config.field`, `config.operator`, `config.value` (single rule). Multi-rule conditions are silently ignored.

### Fix 7: journey_steps Has No journey_id Column
The Analytics, Performance, and Builder all query `journey_steps` filtering by `journey_id`, but the table only has `enrollment_id`. These queries silently return empty results. Need to either join through `journey_enrollments` or add a `journey_id` column to `journey_steps`.

### Fix 8: No Scheduling/Suppression Config UI in Builder
The `journeys` table has `scheduling_config` and `suppression_rules` JSONB columns, and the edge function enforces them, but there is zero UI to configure them. These powerful features are completely inaccessible.

---

## Enhancements

### Enhancement 1: Journey Analytics on List Page
Currently, the list only shows enrollment counts. Add a mini analytics row showing total enrollments, completion rate, and active contacts across all journeys -- similar to what was done for Automations.

### Enhancement 2: Bulk Actions
Multi-select journeys with checkboxes and a floating action bar for bulk Activate, Pause, Delete operations.

### Enhancement 3: Manual Contact Enrollment
Add an "Enroll Contact" button in the builder toolbar. Opens a contact picker dialog. Enrolling creates a `journey_enrollment` record and the first `journey_step` for the trigger node, making the contact enter the flow immediately.

### Enhancement 4: Scheduling & Suppression Settings Panel
Add a settings drawer/dialog in the builder (gear icon in toolbar) exposing:
- Send Window: enable + start/end hour
- Frequency Cap: enable + max emails per day
- Suppression: skip unsubscribed contacts toggle
All stored in the existing `scheduling_config` and `suppression_rules` JSONB columns.

### Enhancement 5: Journey Version Snapshots
Before each save, snapshot the current nodes/edges into a `journey_versions` table. Add a "Version History" button in the toolbar showing timestamped snapshots with restore capability.

### Enhancement 6: Node Copy/Paste
Allow selecting a node and pressing Ctrl+C / Ctrl+V to duplicate it in-place. Useful for quickly building repetitive sequences.

### Enhancement 7: Add Tag / Remove Tag Node Types
Currently "Update Contact" combines 3 actions (add_tag, remove_tag, set_attribute). Split into dedicated "Add Tag" and "Remove Tag" node types for clearer visual flows. Keep "Update Contact" for set_attribute only.

### Enhancement 8: Export Journey as JSON
Add an "Export" button in the builder that downloads the journey definition (nodes + edges + config) as a JSON file. This enables backup and sharing between workspaces.

---

## Implementation Summary

| # | Change | Type | Files |
|---|--------|------|-------|
| F1 | EngageButton in empty state | Fix | JourneysList.tsx |
| F2 | Manual enrollment from builder | Fix + Feature | JourneyBuilder.tsx |
| F3 | Editable description | Fix | JourneysList.tsx |
| F4 | "Run Processor" manual trigger | Fix | JourneyBuilder.tsx |
| F5 | Update Contact config key alignment | Fix | JourneyInspector.tsx OR engage-journey-processor |
| F6 | Condition node: align single rule | Fix | JourneyInspector.tsx OR engage-journey-processor |
| F7 | journey_steps queries join through enrollments | Fix | JourneyAnalytics.tsx, JourneyPerformance.tsx, JourneyBuilder.tsx |
| F8 | Scheduling/Suppression settings UI | Feature | JourneyBuilder.tsx (new dialog) |
| E1 | Analytics on list page | Feature | JourneysList.tsx |
| E2 | Bulk actions | Feature | JourneysList.tsx |
| E3 | Manual contact enrollment | Feature | JourneyBuilder.tsx |
| E4 | Scheduling & Suppression panel | Feature | JourneyBuilder.tsx |
| E5 | Version history snapshots | Feature | JourneyBuilder.tsx + DB migration |
| E6 | Node copy/paste | Feature | JourneyBuilder.tsx |
| E7 | Dedicated tag node types | Feature | CustomNodes.tsx, JourneyInspector.tsx, JourneyBuilder.tsx |
| E8 | Export journey JSON | Feature | JourneyBuilder.tsx |

### Database Changes
- 1 new table: `journey_versions` (journey_id, version_number, snapshot JSONB, created_at, created_by) with RLS
- No changes to existing tables -- Fix 7 solved via query joins, Fix 5/F6 solved via edge function alignment

### Files Modified
- `src/components/engage/journeys/JourneysList.tsx` (F1, F3, E1, E2)
- `src/components/engage/journeys/JourneyBuilder.tsx` (F2, F4, E3, E4, E5, E6, E8)
- `src/components/engage/journeys/JourneyInspector.tsx` (F5, F6, E7)
- `src/components/engage/journeys/JourneyAnalytics.tsx` (F7)
- `src/components/engage/journeys/JourneyPerformance.tsx` (F7)
- `src/components/engage/journeys/nodes/CustomNodes.tsx` (E7)
- `supabase/functions/engage-journey-processor/index.ts` (F5 alignment)

### Priority Sequencing
1. Critical Fixes First: F5 (config mismatch), F6 (condition mismatch), F7 (broken queries) -- these are silently broken
2. UX Fixes: F1, F3, F4, F2
3. Power Features: E4 (scheduling UI), E3 (manual enroll), E1 (list analytics)
4. Advanced: E2 (bulk), E5 (versions), E6 (copy/paste), E7 (tag nodes), E8 (export)
