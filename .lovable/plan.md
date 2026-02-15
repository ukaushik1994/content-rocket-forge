

# Engage Module: Complete Feature & Functionality Deep-Dive Plan

## Current State Summary

The Engage module has **11 pages/components** and **5 edge functions** fully built with consistent glassmorphism styling. All core CRUD operations work. However, several features need enhancement for production readiness.

---

## Phase 1: Contact Management Enhancements

### 1A. ContactsList -- Missing Features

**File: `src/components/engage/contacts/ContactsList.tsx`**

What exists: Stats hero, search, tag filters, pagination, add (single + CSV), delete, click-to-detail.

What's missing:
- **Inline edit from table**: Currently clicking opens ContactDetailDialog, but there's no quick-edit for common fields. Add a pencil icon per row that opens a small inline edit popover for name/tags without opening the full dialog.
- **Bulk selection & actions**: Add checkboxes on each row. When 1+ selected, show a floating action bar with: "Delete Selected", "Add Tag", "Remove Tag", "Export Selected". This is critical for managing large lists.
- **Export contacts**: Add an "Export CSV" button (like ActivityLog has) that exports all or filtered contacts.
- **Sort controls**: Add sortable column headers (by email, name, created_at, status). Currently only sorted by created_at desc.
- **Tag management popover**: The tag filter only shows first 5 tags. Add a "Show all" expandable or a tag management dropdown.

### 1B. ContactDetailDialog -- Missing Features

**File: `src/components/engage/contacts/ContactDetailDialog.tsx`**

What exists: Edit fields, tags with add/remove, unsubscribe toggle, journey enrollment, activity & events tabs.

What's missing:
- **Journey enrollment is broken**: The `enrollInJourney` mutation references `enrollErr` in the `journey_steps` insert (line 124), which is incorrect -- it should use the enrollment ID from the insert response. Also queries `journey.nodes` but the journeys query only selects `id, name` (line 69 -- no `nodes` column exists on the journeys table; nodes are in `journey_nodes` table).
- **Attributes editor**: The contact has an `attributes` JSON field but there's no UI to view/edit it. Add a key-value editor section.
- **Email history**: Add a 4th tab "Emails" showing messages sent to this contact from `email_messages` where `contact_id` matches.
- **Segment membership**: Show which segments this contact belongs to (query `engage_segment_memberships`).

### 1C. SegmentsList -- Missing Features

**File: `src/components/engage/contacts/SegmentsList.tsx`**

What exists: Create/edit with RuleBuilder, delete with confirmation, evaluate, member count, rule summary.

What's missing:
- **View members**: Click on a segment card to see the list of contacts in that segment (query `engage_segment_memberships` joined with `engage_contacts`).
- **Last evaluated timestamp**: Show when the segment was last computed. The `engage_segment_memberships` table has `computed_at` -- display the max value.
- **Auto-evaluate on save**: After creating/updating a segment, automatically trigger `evaluate_segment` so the count is fresh.

---

## Phase 2: Email System Enhancements

### 2A. TemplatesList -- Missing Features

**File: `src/components/engage/email/templates/TemplatesList.tsx`**

What exists: Create/edit/duplicate/delete, variable insertion, code/preview tabs, test send.

What's missing:
- **Rich text / drag-drop editor**: Currently only raw HTML textarea. For MVP, this is acceptable, but add a small toolbar above the textarea with buttons for Bold, Italic, Link, Image, Heading that insert HTML tags at cursor position.
- **Template categories/folders**: As templates grow, add a simple "category" field (text input) and filter by category.
- **Usage count**: Show how many campaigns use each template (query `email_campaigns` where `template_id` matches).

### 2B. CampaignsList -- Missing Features

**File: `src/components/engage/email/campaigns/CampaignsList.tsx`**

What exists: 3-step wizard (name+template, audience, schedule), edit/duplicate, launch with audience filtering, stats cards.

What's missing:
- **Campaign detail view**: Click on a completed/sending campaign to see delivery stats breakdown -- sent/delivered/opened/clicked/bounced/failed from the `stats` JSON column. Show as a mini dashboard with progress bars or pie chart.
- **Campaign message log**: Within the detail view, show individual messages from `email_messages` for that campaign with their status (queued/sent/delivered/failed).
- **Pause/Cancel campaign**: For sending campaigns, add ability to cancel (update status to 'failed', delete unprocessed queued messages).
- **A/B testing placeholder**: Add a "Coming Soon" badge for future A/B test support.

### 2C. EmailProviderSettings -- Cleanup

**File: `src/components/engage/email/settings/EmailProviderSettings.tsx`**

What exists: Sender config form, link to Engage Settings for API key.

What's needed:
- **Delivery stats**: Show aggregate email delivery metrics -- total sent, delivery rate, bounce rate from `email_messages` table.
- **Bounce handling info**: Explain that bounced emails auto-update via webhooks (future feature placeholder).

---

## Phase 3: Journey Builder Enhancements

### 3A. JourneysList -- Missing Features

**File: `src/components/engage/journeys/JourneysList.tsx`**

What exists: Create, delete, navigate to builder, stats, status badges.

What's missing:
- **Enrollment count**: Show how many contacts are enrolled per journey (query `journey_enrollments` count).
- **Duplicate journey**: Copy a journey with all nodes and edges (insert journey + bulk insert nodes + edges with new journey_id).
- **Edit name inline**: Currently can only set name at creation. Add a rename option in the dropdown menu.
- **Status toggle from list**: Add activate/pause buttons directly on the card without entering the builder.

### 3B. JourneyBuilder -- Missing Features

**File: `src/components/engage/journeys/JourneyBuilder.tsx`**

What exists: Full React Flow canvas, custom nodes, add/connect/validate/save, inspector panel, publish/pause.

What's missing:
- **Enrollment stats overlay**: Show active/completed/exited enrollment counts in the toolbar.
- **Node execution stats**: For active journeys, show how many contacts have passed through each node (query `journey_steps` grouped by `node_id`).
- **Undo/Redo**: Basic undo stack for node additions/deletions.
- **Zoom to fit button**: Already has `fitView` on load, but add an explicit button.
- **Delete selected node**: When a node is selected in the inspector, add a "Delete Node" button.

### 3C. JourneyInspector -- Enhancements

**File: `src/components/engage/journeys/JourneyInspector.tsx`**

What exists: Config forms for all 7 node types (trigger, send_email, wait, condition, update_contact, webhook, end).

What's missing:
- **Segment picker for trigger**: When trigger type is "segment_entry", add a segment dropdown (currently only has manual/segment_entry/event as options but no segment picker).
- **Delete node button**: Add at the bottom of the inspector panel.
- **Node label customization**: Let users rename nodes for clarity (e.g., "Send Welcome Email" instead of "Send Email").

---

## Phase 4: Automation Enhancements

### 4A. AutomationsList -- Missing Features

**File: `src/components/engage/automations/AutomationsList.tsx`**

What exists: Create/edit with multi-action support, trigger value inputs (tag/segment/event), action configs (template/tag/journey/webhook pickers), status toggle, delete.

What's missing:
- **Execution history**: Show how many times each automation has fired. Add an `execution_count` to the card display (query from `engage_activity_log` where channel='automation').
- **Duplicate automation**: Copy an automation with "(Copy)" suffix.
- **Conditions support**: The `conditions` field exists in the type/schema but isn't used in the UI. Add optional conditions between trigger and actions (e.g., "only if contact has tag X").
- **Dry run / test**: Button to simulate the automation on a single contact without actually executing.

---

## Phase 5: Social Media Enhancements

### 5A. SocialDashboard -- Missing Features

**File: `src/components/engage/social/SocialDashboard.tsx`**

What exists: Create/edit/delete posts, calendar view, list view, channel selection with char limits, connected accounts display.

What's missing:
- **Media upload**: The `media_urls` field exists but there's no UI to upload images. Add a file input that uploads to Supabase Storage and appends the URL.
- **Post analytics placeholder**: For posted items, show engagement metrics area (views, likes, shares) with "Coming Soon" badges.
- **Hashtag suggestions**: Simple input helper for hashtags.
- **Post preview per channel**: Show how the post would look on each selected platform (character truncation, media preview).

### 5B. SocialCalendar -- Enhancements

**File: `src/components/engage/social/SocialCalendar.tsx`**

What exists: Month calendar with dot indicators for scheduled posts.

What's missing:
- **Drag to reschedule**: Drag a post dot to a different day to update `scheduled_at`.
- **Week view**: Toggle between month and week view.
- **Post count per day**: Show number badge on days with multiple posts.

---

## Phase 6: Activity Log Enhancements

### 6A. ActivityLog -- Missing Features

**File: `src/components/engage/activity/ActivityLog.tsx`**

What exists: Timeline with channel icons, filters (channel, search, date range), payload viewer dialog, CSV export, stats.

What's missing:
- **Contact navigation**: Click on "-> contactName" to navigate to contacts page with that contact filtered/selected.
- **Real-time updates**: Add Supabase realtime subscription on `engage_activity_log` for live feed.
- **Aggregate charts**: Add a small bar chart showing activity distribution by channel over the selected time period (using recharts which is already installed).

---

## Phase 7: Settings Enhancements

### 7A. EngageSettings -- Missing Features

**File: `src/components/engage/settings/EngageSettings.tsx`**

What exists: Connection status, Resend API key (SimpleProviderCard), sender config, social accounts (Coming Soon), workspace rename, demo data loader, danger zone.

What's missing:
- **Webhook settings**: Configure incoming webhook URL for external event ingestion (e.g., Stripe events triggering automations).
- **Team members management**: Show workspace team members with roles. Currently only shows workspace name.
- **Data export**: Export all workspace data (contacts, templates, campaigns) as a ZIP.
- **Unsubscribe page customization**: Let users customize the unsubscribe landing page message/branding.

---

## Phase 8: Bug Fixes

### 8A. Journey Enrollment Bug (Critical)

**File: `src/components/engage/contacts/ContactDetailDialog.tsx`** (lines 108-137)

The `enrollInJourney` mutation has two bugs:
1. **Wrong enrollment_id**: Line 124 uses `enrollErr ? '' : 'pending'` which is always the string `'pending'` because `enrollErr` is the error from the INSERT (which is `null` on success). It should capture the enrollment ID from the insert response.
2. **Missing nodes data**: The query on line 69 selects `id, name, nodes` from `journeys` but the `journeys` table doesn't have a `nodes` column. Nodes are stored in `journey_nodes` table. The trigger node lookup on line 121 will always fail.

**Fix:**
- Change the enrollment insert to `.select().single()` to get back the `id`
- Query `journey_nodes` separately for the trigger node
- Use the returned enrollment ID for the journey_step insert

### 8B. `evaluate_segment` Only Matches All Contacts

**File: Database function `evaluate_segment`**

The current implementation ignores the actual rules in the segment definition and just inserts ALL non-unsubscribed contacts. The comment says "Rules are evaluated client-side for MVP." This means segment filtering doesn't actually work server-side.

**Fix:** Implement basic rule evaluation in the function. For MVP, handle:
- `tags includes X` -> `tags @> ARRAY[X]`
- `email contains X` -> `email ILIKE '%X%'`
- `first_name equals X` -> `first_name = X`

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `ContactsList.tsx` | Bulk selection, export, sort, enhanced tag filter |
| `ContactDetailDialog.tsx` | Fix enrollment bug, add attributes editor, emails tab, segment memberships |
| `SegmentsList.tsx` | View members, last evaluated time, auto-evaluate on save |
| `TemplatesList.tsx` | HTML toolbar, category field, usage count |
| `CampaignsList.tsx` | Campaign detail view with stats, message log, cancel |
| `EmailProviderSettings.tsx` | Delivery stats |
| `JourneysList.tsx` | Enrollment count, duplicate, rename, status toggle |
| `JourneyBuilder.tsx` | Enrollment stats, node stats, delete node |
| `JourneyInspector.tsx` | Segment picker, delete node, custom label |
| `AutomationsList.tsx` | Execution history, duplicate, conditions |
| `SocialDashboard.tsx` | Media upload, post preview |
| `SocialCalendar.tsx` | Post count badges |
| `ActivityLog.tsx` | Contact navigation, activity chart |
| `EngageSettings.tsx` | Team members, webhook config, data export |

### Database Changes Needed

1. **Fix `evaluate_segment` function**: Add actual rule evaluation logic for common operators
2. No new tables needed -- all features use existing tables

### Edge Function Changes

1. **`engage-email-send`**: Already handles stats and unsubscribe links -- no changes needed
2. **`engage-job-runner`**: Already handles automation triggers -- no changes needed

### Implementation Priority

| Priority | Item | Impact | Effort |
|----------|------|--------|--------|
| 1 | Fix journey enrollment bug | Critical fix | Small |
| 2 | Campaign detail view with stats | High user value | Medium |
| 3 | Bulk contact actions | High user value | Medium |
| 4 | Contact attributes editor | Feature gap | Small |
| 5 | Segment member viewer | Feature gap | Small |
| 6 | Journey enrollment count + duplicate | Usability | Medium |
| 7 | Template HTML toolbar | Usability | Small |
| 8 | Activity log chart | Visual polish | Small |
| 9 | Media upload for social | Feature gap | Medium |
| 10 | Settings team members | Feature gap | Medium |
| 11 | Fix evaluate_segment rules | Data accuracy | Medium |

