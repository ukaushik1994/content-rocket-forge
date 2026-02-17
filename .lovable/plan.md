

# Engage Module -- Remaining Pages Enhancement Plan
## Contacts, Segments, Email, and Activity

This plan covers all four remaining Engage pages that haven't been given the "powerhouse" treatment yet. Each section lists critical fixes first, then enhancements.

---

## Phase 1: Contacts & Segments

### Current State
- **Contacts**: CRUD, bulk import (CSV), bulk delete, bulk tag, export, pagination, search, tag filter, sort, contact detail dialog with events/activity/emails/segments/attributes/journey enrollment
- **Segments**: CRUD, RuleBuilder, evaluate via RPC, duplicate, view members, export members CSV, search

### Fixes

**C-F1: Sorting is client-side only**
Contacts sort by `created_at` server-side, but client-side sorting by `email` or `first_name` only applies to the 50 contacts on the current page. Users think they're sorting all contacts but only the visible page is reordered.
- Fix: Move sorting into the Supabase query (`.order(sortField, { ascending: sortDir === 'asc' })`) and include `sortField`/`sortDir` in the query key.

**C-F2: Tag filter is derived from current page only**
`allTags` is built from `contacts` (current page of 50). Tags that exist on contacts on other pages never appear in the filter.
- Fix: Add a dedicated query to fetch all distinct tags across the workspace (aggregate from DB or from a separate RPC/distinct query).

**C-F3: Bulk CSV import has no error handling per row**
If any row in the bulk insert fails (e.g., duplicate email), the entire batch fails silently.
- Fix: Use `upsert` with `onConflict: 'workspace_id,email'` or insert rows individually with error collection.

**C-F4: Empty state button in Segments uses standard Button**
Line 299: "Create First Segment" uses `Button` with inline gradient instead of `EngageButton`.

**C-F5: Contact detail "Save Changes" uses plain Button**
Line 349: Uses standard `Button` instead of `EngageButton` for consistency.

### Enhancements

**C-E1: Contact Merge**
When two contacts share overlapping data, allow selecting two contacts and merging them (keeping the primary email, combining tags and attributes).

**C-E2: Contact Import with Column Mapping**
Replace the rigid CSV format with a column mapping step -- detect headers and let users map columns to fields (email, first_name, last_name, tags).

**C-E3: Segments -- Scheduled Auto-Evaluation**
Add a toggle per segment to auto-evaluate daily. Store a `auto_evaluate` boolean on the segment row. The `engage-job-runner` can call `evaluate_segment` for segments with this flag.

**C-E4: Segments -- Bulk Actions**
Multi-select segments with checkboxes and floating action bar for bulk Evaluate, Duplicate, Delete.

**C-E5: Contact Lifecycle Stage**
Add a `lifecycle_stage` field to contacts (lead, prospect, customer, churned) with a visual pipeline view.

---

## Phase 2: Email

### Current State
- **Dashboard**: 7 tabs (Inbox, Sent, Scheduled, Drafts, Templates, Campaigns, Reports)
- **Inbox**: 3-panel layout (Thread List, Thread Reader, Thread Context), compose dialog, status filters
- **Templates**: CRUD, HTML toolbar, variable insertion, preview, test send, duplicate, usage counts
- **Campaigns**: 3-step wizard (Setup, Audience, Schedule), launch, cancel, detail view with message table, recipient estimate
- **Reports**: Summary cards, pie chart (status distribution), campaign performance bar chart, template leaderboard
- **Sent/Scheduled/Drafts**: Basic list views with search and detail dialogs

### Fixes

**E-F1: "Send Now" in ScheduledList does nothing**
The `sendNow` mutation (line 44-48) only shows a toast. It doesn't actually trigger the processor or change any status. Users click it expecting immediate delivery.
- Fix: Either invoke `engage-email-send` edge function directly, or update the message `queued_at` to `now()` to prioritize it.

**E-F2: Campaign launch doesn't handle Supabase 1000-row limit**
`launchCampaign` (line 228-273) does `select('id, email, first_name, last_name')` on contacts without pagination. If the audience has >1000 contacts, only the first 1000 get messages.
- Fix: Implement pagination loop (fetch in batches of 1000) or move this logic to an edge function.

**E-F3: DraftsList has no actions**
Drafts are shown as read-only cards. Users can't edit, delete, or launch a draft campaign from this tab.
- Fix: Add Edit, Delete, and Launch buttons to each draft card.

**E-F4: Templates have no search**
With many templates, there's no way to filter or search.

**E-F5: Campaign detail dialog lacks navigation back to list**
Once you open a campaign detail, there's no clear way to close or go back.

### Enhancements

**E-E1: Template Categories/Folders**
Add a `category` field to templates (e.g., Welcome, Newsletter, Transactional) with filter tabs.

**E-E2: A/B Testing for Campaigns**
Allow creating two template variants for a campaign. Split the audience and track which performs better. Needs a `variant` field on `email_messages` and comparison metrics in Reports.

**E-E3: Email Scheduling with Time Zone**
Add timezone selection to the campaign scheduler so emails land at the right local time for recipients.

**E-E4: Reports -- Date Range Filter**
Reports currently show all-time data. Add a date range selector (7d, 30d, 90d, custom).

**E-E5: Inbox -- Keyboard Navigation**
Add Up/Down arrow keys to navigate threads, Enter to open, Escape to deselect.

**E-E6: Template Starter Library**
Pre-built template recipes (Welcome Email, Newsletter, Password Reset, etc.) similar to the automation presets.

---

## Phase 3: Activity Log, System Health & Audit

### Current State
- **Activity Feed**: Timeline with channel filters, search, date range, CSV export, channel distribution bar chart, payload viewer dialog
- **System Health**: Integration status, queue counts, deliverability trend chart
- **Audit Log**: Action/resource filters, search, date range, CSV export, detail dialog

### Fixes

**A-F1: Activity feed limited to 200 rows with no pagination**
If there are >200 events in the date range, older events are silently lost.
- Fix: Add cursor-based pagination (Load More button).

**A-F2: System Health queue query may fail for large workspaces**
The `journey_steps` count query uses `.eq('workspace_id', ...)` but `journey_steps` doesn't have a direct `workspace_id` column in some schemas -- it goes through `journey_enrollments`.
- Fix: Join through `journey_enrollments` for accurate counts.

**A-F3: Audit log has no user name resolution**
Shows raw `user_id` UUIDs instead of names. Makes it hard to tell who did what.
- Fix: Join with `profiles` to show display names.

### Enhancements

**A-E1: Real-Time Activity Stream**
Subscribe to `engage_activity_log` inserts via Supabase Realtime for live updates without manual refresh.

**A-E2: Activity Feed -- Grouped by Day**
Group timeline entries by date headers (Today, Yesterday, Mar 15, etc.) for easier scanning.

**A-E3: System Health -- Auto-Refresh**
Add a 30-second auto-refresh toggle for queue counts and integration status.

**A-E4: Audit Log -- Diff Viewer**
For "update" actions that include before/after snapshots in `details`, show a visual diff highlighting what changed.

**A-E5: Notification Rules**
Let users configure alerts (e.g., "Notify me when delivery rate drops below 90%") stored in a lightweight `engage_alert_rules` table, evaluated by the job runner.

---

## Implementation Priority

The work is sequenced to fix broken things first, then add value:

1. **Critical Fixes** (all modules): C-F1, C-F2, C-F3, E-F1, E-F2, E-F3, A-F1, A-F2
2. **UI Consistency**: C-F4, C-F5, E-F4, A-F3
3. **High-Value Features**: C-E4, E-E1, E-E4, E-E6, A-E2
4. **Power Features**: C-E1, C-E2, C-E3, E-E2, E-E3, E-E5, A-E1, A-E3, A-E4
5. **Advanced**: C-E5, E-E5, A-E5

---

## Technical Details

### Database Changes
- Add `category` column to `email_templates` (text, nullable, default null)
- Add `auto_evaluate` column to `engage_segments` (boolean, default false)
- No new tables needed for Phase 1-3 (leveraging existing JSONB columns and tables)

### Files Modified
- `src/components/engage/contacts/ContactsList.tsx` (C-F1, C-F2, C-F3, C-F5, C-E1, C-E2, C-E4)
- `src/components/engage/contacts/SegmentsList.tsx` (C-F4, C-E3, C-E4)
- `src/components/engage/contacts/ContactDetailDialog.tsx` (C-F5)
- `src/components/engage/email/EmailDashboard.tsx` (minor)
- `src/components/engage/email/templates/TemplatesList.tsx` (E-F4, E-E1, E-E6)
- `src/components/engage/email/campaigns/CampaignsList.tsx` (E-F2, E-F5)
- `src/components/engage/email/drafts/DraftsList.tsx` (E-F3)
- `src/components/engage/email/scheduled/ScheduledList.tsx` (E-F1)
- `src/components/engage/email/reports/EmailReports.tsx` (E-E4)
- `src/components/engage/email/inbox/EmailInbox.tsx` (E-E5)
- `src/components/engage/activity/ActivityLog.tsx` (A-F1, A-E1, A-E2)
- `src/components/engage/activity/SystemHealth.tsx` (A-F2, A-E3)
- `src/components/engage/activity/AuditLog.tsx` (A-F3, A-E4)
- `src/components/engage/shared/RuleBuilder.tsx` (minor operator additions)

### Edge Function Updates
- `engage-job-runner` -- add segment auto-evaluation loop for segments with `auto_evaluate = true`

