
# Engage Platform: Complete Frontend & Backend Build

## Scope Assessment

The request describes a full-featured marketing automation platform across 7 modules. After thorough codebase analysis, here is what exists today vs what needs to be built, organized into implementable phases.

### What Already Exists (solid foundation)
- **Email**: Templates with HTML toolbar + variables, 3-step campaign wizard, delivery via Resend, message logs, provider settings
- **Contacts**: CRUD, CSV import, bulk actions, tags, detail dialog with timeline/attributes/journeys, pagination
- **Segments**: RuleBuilder, server-side evaluation, duplicate, export CSV, member viewer
- **Journeys**: Visual React Flow builder with 7 node types, undo/redo, auto-save, templates, analytics dialog, enrollment stats, edge function processor
- **Automations**: CRUD, conditions (RuleBuilder), multi-action with wait/webhook/tag/email/journey, dry run, execution logs
- **Social**: Post CRUD, calendar + list + queue views, media upload, hashtag helper, week view
- **Activity**: Timeline with channel filters, charts, CSV export, payload viewer
- **Backend**: `engage-job-runner` orchestrator, `engage-email-send`, `engage-journey-processor`, `engage-social-poster` edge functions

### What Needs Building (organized by priority)

---

## Phase 1: Email Inbox & Thread System (Highest Impact)

This is the biggest missing piece -- transforming email from "send-only" into a two-way communication hub.

### Database Changes
- New table: `email_threads` -- groups related messages into conversations
  - `id`, `workspace_id`, `contact_id`, `subject`, `status` (needs_reply/waiting/closed), `assigned_to`, `tags`, `last_activity_at`, `sla_deadline`, `created_at`
- New table: `email_thread_messages` -- individual messages in a thread
  - `id`, `workspace_id`, `thread_id`, `direction` (inbound/outbound), `from_email`, `to_email`, `subject`, `body_html`, `body_text`, `attachments` (jsonb), `tracking` (jsonb: delivered/opened/clicked/replied), `created_at`
- New table: `email_thread_notes` -- internal notes on threads
  - `id`, `workspace_id`, `thread_id`, `user_id`, `content`, `created_at`
- Add `thread_id` column to `email_messages` for linking campaign messages to threads

### Frontend Components (new files)
| File | Purpose |
|------|---------|
| `email/inbox/EmailInbox.tsx` | 3-panel layout: thread list (left), reader (center), context (right) |
| `email/inbox/ThreadList.tsx` | Filterable/searchable thread list with status, tags, assignment, SLA timers |
| `email/inbox/ThreadReader.tsx` | Full message timeline (in+out), reply/forward composer, attachment viewer |
| `email/inbox/ThreadContext.tsx` | Contact card, journey status, AI copilot placeholder |
| `email/inbox/ComposeDialog.tsx` | New email composer with template picker and variable insertion |
| `email/sent/SentList.tsx` | Outbound message list with delivery status drill-down |
| `email/scheduled/ScheduledList.tsx` | Queue of scheduled emails with edit/cancel/send-now |
| `email/drafts/DraftsList.tsx` | Draft list with save-as-template |
| `email/reports/EmailReports.tsx` | Performance dashboard with Recharts: open/click/reply rates, template leaderboard |

### EmailDashboard.tsx Restructure
- Change tabs from `Templates | Campaigns | Settings` to `Inbox | Sent | Scheduled | Drafts | Templates | Campaigns | Reports | Settings`
- Each tab renders its dedicated sub-component

### Backend
- New edge function: `engage-email-webhook` -- receives inbound email webhooks from Resend to create thread messages
- Update `engage-email-send` to create/link thread records when sending

---

## Phase 2: Contact Profile & CRM Depth

### Frontend Changes
| File | Changes |
|------|---------|
| `ContactDetailDialog.tsx` | Add tabs: Timeline (all channels), Attributes, Journeys (active/past with next step), Engagement (open/click/reply stats, best times chart) |
| `ContactsList.tsx` | Add columns: Company, Owner, Consent status. Add "Merge Duplicates" button. Add owner assignment. Add consent management toggle |

### Database Changes
- Add columns to `engage_contacts`: `company` (text), `owner_id` (uuid), `lifecycle_stage` (text: lead/customer/at-risk), `consent_status` (text: subscribed/unsubscribed/bounced), `consent_reason` (text)

---

## Phase 3: Segment Builder Upgrade

### Frontend (new file)
| File | Purpose |
|------|---------|
| `contacts/SegmentBuilder.tsx` | Full-page segment builder with nested AND/OR rule groups, live preview count, sample members table, explain mode |

### RuleBuilder Enhancement
- Support nested rule groups (AND within OR, etc.)
- Add engagement-based filters: "opened email in last X days", "clicked link", "replied"
- Add journey-state filters: "currently in journey X", "completed journey X"
- Add activity recency: "no activity in X days"

### Database Changes
- Update `evaluate_segment` RPC to support nested rule groups and engagement filters

---

## Phase 4: Journey Builder -- Production Features

### Frontend Changes
| File | Changes |
|------|---------|
| `JourneyBuilder.tsx` | Add: simulate journey with chosen contact (preview path highlighting), scheduling windows config (send only 9am-6pm), frequency cap settings, suppression rules toggle |
| `JourneysList.tsx` | Add: version indicator (v1/v2), health badge (error count from failed steps), archive action |
| New: `JourneyEnrollments.tsx` | List of enrolled contacts with current node, execution log per contact, retry/skip/pause actions |
| New: `JourneyPerformance.tsx` | Funnel visualization (enrolled > started > engaged > completed > goal), drop-off per node, send-time heatmap |

### Database Changes
- Add `version` (int, default 1) to `journeys` table
- Add `scheduling_config` (jsonb) to `journeys` for send windows and frequency caps
- Add `suppression_rules` (jsonb) to `journeys`

### Backend Changes
- Update `engage-journey-processor` to respect:
  - Scheduling windows (skip if outside send hours, reschedule)
  - Suppression rules (skip unsubscribed/bounced contacts)
  - Frequency caps (check recent sends before delivering)
  - Goal/exit conditions

---

## Phase 5: Automations -- Full IF/THEN Engine

### Frontend Changes
| File | Changes |
|------|---------|
| `AutomationsList.tsx` | Add triggers: email opened/clicked/replied/bounced, contact created/updated, journey step completed/failed, webhook received. Add actions: assign owner (round robin), create task/notification, unenroll from journey. Add rate limit config (max X runs per contact/day). Add error routing |
| New: `AutomationRuns.tsx` | Full audit view: every execution with input event, actions taken, duration, result. Filter by success/fail. Replay button |

### Database Changes
- New table: `automation_runs` -- execution audit log
  - `id`, `workspace_id`, `automation_id`, `contact_id`, `trigger_event` (jsonb), `actions_executed` (jsonb), `status` (success/failed), `duration_ms`, `error`, `created_at`
- Add `rate_limit` (jsonb) and `error_routing` (jsonb) to `engage_automations`

### Backend Changes
- Update `engage-job-runner` automation section to:
  - Check rate limits before executing
  - Log full execution to `automation_runs`
  - Support new trigger types (email events, contact updates)
  - Execute new action types (assign owner, create task)
  - Handle error routing

---

## Phase 6: Social -- Inbox & Publishing

### Frontend (new files)
| File | Purpose |
|------|---------|
| `social/SocialInbox.tsx` | Unified queue of mentions/comments/DMs, thread view, assign/tag/mark done, saved replies, convert to contact |
| `social/SocialComposer.tsx` | Enhanced composer: channel picker with platform-specific edits, media uploader with per-platform preview, approval workflow (draft > needs approval > scheduled), UTM builder |
| `social/SocialAnalytics.tsx` | Growth + engagement per platform (Recharts), best post types, top posts, export |
| `social/SocialAccountConnect.tsx` | Full account connection flow: OAuth placeholder + manual linking with token validation |

### Database Changes
- New table: `social_inbox_items` -- mentions, comments, DMs
  - `id`, `workspace_id`, `account_id`, `type` (mention/comment/dm/reply), `content`, `author_name`, `author_profile_url`, `status` (open/assigned/done), `assigned_to`, `linked_contact_id`, `provider_item_id`, `created_at`
- New table: `social_saved_replies`
  - `id`, `workspace_id`, `title`, `content`, `created_by`, `created_at`
- Add `approval_status` (text: draft/needs_approval/approved/scheduled) to `social_posts`

---

## Phase 7: Activity -- System Health & Audit

### Frontend Changes
| File | Changes |
|------|---------|
| `ActivityLog.tsx` | Add tabs: Activity Feed (existing) / System Health / Audit Log |
| New: `activity/SystemHealth.tsx` | Integration status cards (email provider, social tokens), queue status (pending emails/journey steps/social posts), deliverability snapshot (bounce/complaint trend chart), alert rules config |
| New: `activity/AuditLog.tsx` | Security-grade who/what/when log: template edits, journey publish/pause, contact exports, role changes. Filter + export |

### Database Changes
- New table: `engage_audit_log`
  - `id`, `workspace_id`, `user_id`, `action` (text), `resource_type` (text), `resource_id` (text), `details` (jsonb), `ip_address` (text), `created_at`

---

## Implementation Order

Given the massive scope, I recommend implementing in this order (each phase is self-contained and delivers value):

1. **Phase 1** -- Email Inbox (biggest gap, transforms email from broadcast to conversation)
2. **Phase 4** -- Journey production features (makes journeys actually usable in production)
3. **Phase 5** -- Automations engine (makes automations reliable with audit trail)
4. **Phase 2** -- Contact CRM depth
5. **Phase 3** -- Segment builder upgrade
6. **Phase 6** -- Social inbox & publishing
7. **Phase 7** -- Activity system health & audit

### Database Migrations Summary
- 4 new tables in Phase 1 (threads, thread_messages, thread_notes)
- Column additions in Phase 2 (contacts) and Phase 4 (journeys)
- 1 new table in Phase 5 (automation_runs)
- 2 new tables in Phase 6 (social_inbox_items, social_saved_replies)
- 1 new table in Phase 7 (engage_audit_log)

### New Edge Functions
- `engage-email-webhook` (Phase 1) -- inbound email processing

### Files to Create: ~15 new components
### Files to Modify: ~8 existing components

---

Due to the scope (this is essentially a full Intercom/HubSpot-level platform), I recommend we tackle **Phase 1 (Email Inbox) + Phase 4 (Journey production features)** first, then continue phase by phase. Each phase will take a full implementation cycle.

Shall I proceed with Phase 1 and Phase 4 together, or would you prefer a different starting point?
