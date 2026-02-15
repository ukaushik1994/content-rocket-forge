

# Segments, Journeys, Automations & Social -- Complete Feature Build

## What Exists vs What's Missing

### Segments (mostly complete)
- Has: Create/edit with RuleBuilder, delete, evaluate, member viewer, stats, rule summaries
- Missing:
  1. **Duplicate segment** -- no copy button
  2. **Export members** -- no CSV download of segment members
  3. **Server-side rule evaluation** -- `evaluate_segment` DB function ignores rules, just adds ALL contacts (critical data accuracy bug)

### Journeys (well-built, needs depth)
- Has: List with stats, create, rename, duplicate, delete, status toggle, enrollment counts, full React Flow builder with 7 node types, inspector panel, validate, save, publish
- Missing:
  1. **Segment picker in trigger config** -- when trigger type = "segment_entry", no segment dropdown in JourneyInspector
  2. **Delete node** -- no way to remove a node from the canvas (only via React Flow keyboard shortcut, no explicit button)
  3. **Custom node labels** -- nodes always show generic "Send Email", can't rename to "Send Welcome Email"
  4. **Enrollment stats in builder toolbar** -- no visibility into active/completed/exited enrollments while editing
  5. **Node execution counts** -- for active journeys, no way to see how many contacts passed through each node
  6. **Zoom to fit button** -- `fitView` runs on load but no explicit button in toolbar

### Automations (functional, needs polish)
- Has: Create/edit with multi-action, trigger value inputs (tag/segment/event), action configs (template/tag/journey/webhook pickers), status toggle, delete, stats
- Missing:
  1. **Duplicate automation** -- no copy button
  2. **Execution count per automation** -- cards don't show how many times the automation fired
  3. **Conditions layer** -- `conditions` field exists in schema but no UI; no "only if contact has tag X" filter between trigger and actions
  4. **Last triggered timestamp** -- no visibility into when automation last executed

### Social (solid base, missing media + analytics)
- Has: Create/edit/delete posts, calendar + list views, channel selection with char limits, connected accounts display, edit updates (not inserts)
- Missing:
  1. **Media upload** -- `media_urls` field exists but no file upload UI; posts are text-only
  2. **Post count badge on calendar** -- calendar shows dots but no count for days with many posts
  3. **Post preview per channel** -- no preview of how content looks truncated on each platform
  4. **Hashtag helper** -- no quick-insert for hashtags
  5. **Post analytics placeholder** -- posted items have no engagement metrics area
  6. **Duplicate post** -- no copy button

---

## Implementation Plan

### 1. Fix `evaluate_segment` Database Function (Critical)
Update the RPC to actually evaluate rules server-side instead of blindly inserting all contacts.

**SQL changes:**
- Parse `v_definition->'rules'` array
- Build dynamic WHERE clauses for each rule:
  - `field = 'email'` + `operator = 'contains'` -> `email ILIKE '%value%'`
  - `field = 'first_name'` + `operator = 'equals'` -> `first_name = 'value'`
  - `field = 'tags'` + `operator = 'includes'` -> `tags @> ARRAY['value']`
  - `field = 'created_at'` + `operator = 'gt'` -> `created_at > 'value'::timestamptz`
- Respect `match = 'all'` (AND) vs `match = 'any'` (OR)

### 2. Segments Enhancements
**File: `SegmentsList.tsx`**
- Add **Duplicate** button in card actions (copy name + " (Copy)", same definition)
- Add **Export Members CSV** button in the member viewer dialog

### 3. Journey Inspector -- Segment Picker + Delete Node + Custom Label
**File: `JourneyInspector.tsx`**
- When trigger type = `segment_entry`, add a segment dropdown (query `engage_segments`)
- Add a **Delete Node** button at the bottom of the inspector panel
- Add a **Label** text input at the top of every node's config so users can rename nodes (stored in `config.label`)

**File: `CustomNodes.tsx`**
- Update each node to display `config.label` if set, falling back to the default label

**File: `JourneyBuilder.tsx`**
- Add `onDeleteNode` handler that removes the node and its connected edges from state
- Pass it to JourneyInspector
- Add **Zoom to Fit** button in toolbar
- Add enrollment stats badge in toolbar (query `journey_enrollments` counts for current journey)
- Add node execution counts: query `journey_steps` grouped by `node_id`, pass counts into node data so they display on the canvas

### 4. Automations Enhancements
**File: `AutomationsList.tsx`**
- Add **Duplicate** in dropdown menu (copy with "(Copy)" suffix)
- Add **execution count** per automation card (query `engage_activity_log` where `channel = 'automation'` and filter by automation name/id in payload)
- Add **Conditions section** in the create/edit dialog between Trigger and Actions: a mini RuleBuilder for contact attribute conditions that must be true for actions to fire
- Add **last triggered** timestamp display on cards

### 5. Social Media Enhancements
**File: `SocialDashboard.tsx`**
- Add **media upload**: file input below content textarea, upload to Supabase Storage bucket `social-media`, append URL to `media_urls` array
- Add **media preview**: show uploaded image thumbnails in the create dialog and on post cards
- Add **Duplicate post** button in SocialPostCard dropdown
- Add **hashtag helper**: a small "#" button that inserts `#` at cursor, plus common hashtag suggestions

**File: `SocialCalendar.tsx`**
- Add **post count badge**: show a small count number on days with 2+ posts

**File: `SocialPostCard.tsx`**
- Show **media thumbnails** if `media_urls` has entries
- Add **analytics placeholder** for posted items: "Engagement: Coming Soon" badge
- Add **Duplicate** menu item

### 6. Supabase Storage Bucket
- Create a `social-media` storage bucket for social post image uploads (public access for display)

---

## Technical Details

### Database Migration
- Replace `evaluate_segment` function with proper rule evaluation SQL
- Create `social-media` storage bucket with public read policy

### Files to Modify

| File | Changes |
|------|---------|
| `SegmentsList.tsx` | Duplicate segment, export members CSV |
| `JourneyInspector.tsx` | Segment picker for triggers, delete node button, custom label input |
| `JourneyBuilder.tsx` | Delete node handler, zoom-to-fit, enrollment stats, node execution counts |
| `CustomNodes.tsx` | Display custom labels, show execution count badges |
| `AutomationsList.tsx` | Duplicate, execution count, conditions UI, last triggered |
| `SocialDashboard.tsx` | Media upload, hashtag helper, media preview |
| `SocialCalendar.tsx` | Post count badges |
| `SocialPostCard.tsx` | Media thumbnails, duplicate, analytics placeholder |

### Implementation Order
1. `evaluate_segment` DB function fix (unblocks accurate segment data)
2. Segments: duplicate + export
3. Journey Inspector + Builder enhancements
4. Custom node labels + execution counts
5. Automations: duplicate, conditions, execution history
6. Social: storage bucket + media upload + calendar badges
7. Social post card: thumbnails, duplicate, analytics placeholder

