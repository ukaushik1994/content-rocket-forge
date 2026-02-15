

# Complete Build: Journeys, Automations, Segments & Social

## Current State Assessment

After thorough code review, here is what each module HAS vs what it NEEDS to be production-complete.

### Segments -- 95% Complete
Already has: Create/edit/delete, RuleBuilder, server-side evaluation (fixed), member viewer with export CSV, duplicate, stats, last evaluated timestamp, auto-evaluate on save.

Remaining gaps:
1. **Search/filter segments** -- no way to search by name when list grows
2. **Segment description in cards** -- shows but truncates; no expand

### Journeys -- 80% Complete
Already has: List with create/delete/duplicate/rename/status toggle/enrollment counts, full React Flow builder with 7 node types, custom labels, exec counts, segment picker for triggers, delete node, zoom-to-fit, enrollment stats, save/validate/publish.

Remaining gaps:
1. **Search/filter journeys list** -- no search bar
2. **Journey description** -- no description field at creation or on cards
3. **Edge label editing** -- condition node has Yes/No branches but no way to label edges between nodes
4. **Undo/Redo in builder** -- no way to undo accidental node deletion or move
5. **Journey analytics view** -- no reporting on conversion rates, drop-off per node, average time in journey
6. **Node count on list cards** -- cards don't show how many nodes each journey has
7. **Keyboard shortcuts** -- no Delete key to remove selected node, no Ctrl+S to save
8. **Auto-save** -- changes can be lost if user navigates away without saving
9. **Journey templates** -- no pre-built starter templates (Welcome series, Onboarding, Re-engagement)

### Automations -- 85% Complete
Already has: Create/edit/delete, duplicate, multi-action with config pickers, conditions (RuleBuilder), execution counts, status toggle, last triggered timestamp, trigger value inputs.

Remaining gaps:
1. **Search/filter automations** -- no search bar
2. **Execution log viewer** -- can see count but can't view individual execution records
3. **Dry run / test** -- no way to simulate automation on a test contact
4. **Automation description** -- no description field
5. **Action reordering** -- actions in the dialog can't be reordered (drag to rearrange)
6. **Delay between actions** -- no "wait X minutes" between actions

### Social -- 75% Complete
Already has: Create/edit/delete posts, calendar + list views, channel selection with char limits, media upload to Supabase Storage, hashtag helper, duplicate, post count badges, analytics placeholder, media thumbnails.

Remaining gaps:
1. **Search/filter posts** -- no search bar
2. **Bulk delete posts** -- no multi-select
3. **Post approval workflow** -- no review/approve flow for team use
4. **Week view on calendar** -- only month view exists
5. **Character limit per-channel preview** -- dialog shows limit but post cards don't warn about truncation
6. **Social accounts connection** -- still shows "Coming Soon"; needs at least a manual account link flow
7. **Post scheduling queue** -- no view of upcoming posts in chronological order (separate from calendar)
8. **Draft vs scheduled filter** -- no status filter tabs on list view

---

## Implementation Plan

### Phase 1: Search & Filter Across All Modules
Add a consistent search bar pattern to all 4 list pages.

**JourneysList.tsx**: Add search Input above the grid, filter by `j.name`.
**AutomationsList.tsx**: Add search Input, filter by `a.name`.
**SegmentsList.tsx**: Add search Input, filter by `s.name`.
**SocialDashboard.tsx**: Add search Input + status filter tabs (All / Draft / Scheduled / Posted), filter posts in list view.

### Phase 2: Journey Builder Depth

**JourneyBuilder.tsx**:
- Add **undo/redo** using a simple history stack (snapshot nodes+edges on each change, max 20 steps). Add Undo/Redo buttons in toolbar.
- Add **keyboard shortcuts**: Delete key removes selected node, Ctrl+S triggers save.
- Add **auto-save** debounced (save 3 seconds after last change, show "Saving..." indicator).
- Add **edge label editing**: double-click an edge to set a label (e.g., "Has tag", "No match"). Store in edge data.

**JourneysList.tsx**:
- Add **description** field to create dialog and display on cards.
- Add **node count** badge per journey card (query `journey_nodes` count grouped by `journey_id`).
- Add **journey templates**: a "Start from Template" button in create dialog with 3 presets (Welcome Series, Onboarding Flow, Re-engagement). Each inserts pre-configured nodes and edges.

**JourneyInspector.tsx**:
- No changes needed -- already has segment picker, delete node, custom label.

### Phase 3: Automations Depth

**AutomationsList.tsx**:
- Add **description** field to create/edit dialog and show on cards.
- Add **execution log viewer**: a dialog that opens when clicking the execution count badge, showing recent logs from `engage_activity_log` where `channel='automation'` and `payload->automation_id` matches.
- Add **action reordering**: use `@dnd-kit/sortable` (already installed) to make actions draggable in the dialog.
- Add **delay action type**: add a new action type `wait` with duration + unit config, allowing "wait 1 hour" between steps.
- Add **dry run button**: "Test" button on each automation card that opens a contact picker, then simulates the trigger match + condition check and shows what would happen (without executing).

### Phase 4: Social Completeness

**SocialDashboard.tsx**:
- Add **status filter tabs** (All / Draft / Scheduled / Posted / Failed) above the post list.
- Add **bulk selection** with checkboxes and a "Delete Selected" action bar.
- Add **upcoming queue view**: a third view mode (list / calendar / queue) showing only future scheduled posts in chronological order with countdown timers.

**SocialCalendar.tsx**:
- Add **week view toggle**: a Month/Week switcher. Week view shows 7 columns with time slots (morning/afternoon/evening) and posts placed in slots.

**SocialDashboard.tsx** (accounts section):
- Replace "Coming Soon" with a **manual account linking flow**: dialog to add account name + provider + optional access token. This at minimum lets users track which accounts they have, even without OAuth.

### Phase 5: Journey Analytics View

**New file: `JourneyAnalytics.tsx`**
- A dialog or panel accessible from JourneyBuilder toolbar ("Analytics" button).
- Shows: total enrollments over time (line chart), conversion funnel (how many contacts reached each node), average time between nodes, drop-off rate per node.
- Data source: `journey_enrollments` + `journey_steps` tables.
- Uses Recharts (already installed).

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `JourneyAnalytics.tsx` | Journey funnel/conversion analytics dialog |

### Files to Modify
| File | Changes |
|------|---------|
| `JourneysList.tsx` | Search, description, node count badges, journey templates |
| `JourneyBuilder.tsx` | Undo/redo, keyboard shortcuts, auto-save, edge label editing, analytics button |
| `AutomationsList.tsx` | Search, description, execution log viewer, action reordering (dnd-kit), delay action, dry run |
| `SegmentsList.tsx` | Search bar |
| `SocialDashboard.tsx` | Search, status filters, bulk delete, queue view, account linking |
| `SocialCalendar.tsx` | Week view toggle |

### Database Changes
- Add `description` column to `journeys` table (text, nullable)
- Add `description` column to `engage_automations` table (text, nullable)
- No other schema changes needed -- all other features use existing tables

### Dependencies Already Available
- `@dnd-kit/sortable` -- for action reordering in automations
- `recharts` -- for journey analytics charts
- `framer-motion` -- for animations (already used everywhere)
- `@xyflow/react` -- for journey builder (already used)

### Implementation Order
1. DB migration: add `description` columns to `journeys` and `engage_automations`
2. Search bars across all 4 modules (quick win, consistent UX)
3. Journey: description + node count + templates on list page
4. Journey Builder: undo/redo + keyboard shortcuts + auto-save + edge labels
5. Journey Analytics component + integration
6. Automations: description + execution log viewer + delay action
7. Automations: action reordering with dnd-kit + dry run
8. Social: status filters + bulk delete + queue view
9. Social: week view on calendar + account linking flow

