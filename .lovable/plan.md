

# Engage Module -- Full Build Plan for Creaiter

## Overview

Add a complete marketing engagement hub at `/engage` with five tabs: **Email**, **Journeys**, **Automations**, **Social**, and **Activity Log**. Plus a new **Engage** tab in Settings for integration connections (email provider, social accounts).

This is built using the existing Vite + React Router + Supabase stack (not Next.js). Server Actions are replaced with Supabase Edge Functions. The existing `team_workspaces` and `team_members` tables provide the multi-workspace foundation.

---

## Database Schema (Single Migration)

### New Tables (17 tables total)

```text
1. engage_contacts
   - id, workspace_id, email, phone, first_name, last_name, tags (text[]),
     attributes (jsonb), unsubscribed (bool), unsubscribed_at, created_at, updated_at

2. engage_events
   - id, workspace_id, contact_id (FK), type, payload (jsonb), occurred_at

3. engage_segments
   - id, workspace_id, name, description, definition (jsonb), created_at, updated_at

4. engage_segment_memberships
   - id, workspace_id, segment_id (FK), contact_id (FK), computed_at

5. email_templates
   - id, workspace_id, name, subject, body_html, body_text, variables (text[]),
     created_at, updated_at, created_by

6. email_campaigns
   - id, workspace_id, name, template_id (FK), status (draft/scheduled/sending/complete/failed),
     scheduled_at, started_at, completed_at, audience_definition (jsonb),
     stats (jsonb), created_by, created_at, updated_at

7. email_messages
   - id, workspace_id, campaign_id (FK), contact_id (FK), to_email, subject,
     body_html, status (queued/sent/delivered/failed), provider_message_id,
     error, queued_at, sent_at

8. email_provider_settings
   - id, workspace_id, provider (resend/smtp), config (jsonb -- encrypted ref),
     from_name, from_email, reply_to, created_at, updated_at

9. journeys
   - id, workspace_id, name, status (draft/active/paused), trigger_config (jsonb),
     created_by, created_at, updated_at

10. journey_nodes
    - id, workspace_id, journey_id (FK), node_id (text), type, config (jsonb),
      position (jsonb)

11. journey_edges
    - id, workspace_id, journey_id (FK), source_node_id, target_node_id,
      condition_label (nullable)

12. journey_enrollments
    - id, workspace_id, journey_id (FK), contact_id (FK),
      status (active/completed/exited), enrolled_at, updated_at

13. journey_steps
    - id, workspace_id, enrollment_id (FK), node_id (text),
      status (pending/running/done/failed), scheduled_for, executed_at,
      output (jsonb), error

14. engage_automations
    - id, workspace_id, name, status (active/paused), trigger_config (jsonb),
      conditions (jsonb), actions (jsonb), created_by, created_at, updated_at

15. social_accounts
    - id, workspace_id, provider, display_name, auth_data (jsonb placeholder),
      created_at, updated_at

16. social_posts
    - id, workspace_id, content, media_urls (text[]), scheduled_at,
      status (draft/scheduled/posted/failed), created_by, created_at, updated_at

17. social_post_targets
    - id, workspace_id, post_id (FK), provider, account_id (FK),
      status (scheduled/posted/failed), provider_post_id, error

18. engage_activity_log
    - id, workspace_id, contact_id (nullable), channel (email/social/journey/automation),
      type, message, payload (jsonb), created_at, created_by (nullable)
```

### RLS Policies (all tables)

Every table gets workspace-scoped RLS:
- SELECT/INSERT/UPDATE/DELETE: `workspace_id IN (SELECT workspace_id FROM team_members WHERE user_id = auth.uid())`
- Uses a `security definer` helper function to avoid recursion

### Database Functions

1. `evaluate_segment(segment_id uuid)` -- computes segment membership based on jsonb rules, populates `engage_segment_memberships`
2. `get_user_workspace_ids(user_id uuid)` -- security definer function for RLS
3. Trigger on `engage_contacts` to auto-log changes to `engage_activity_log`
4. Trigger on `email_messages` status changes to update `email_campaigns.stats`

---

## New Dependency

- `@xyflow/react` (React Flow v12) -- for the Journey visual builder canvas

---

## File Structure

```text
src/pages/
  Engage.tsx                          -- Main page with tab router

src/components/engage/
  EngageLayout.tsx                    -- Sidebar + content area
  EngageSidebar.tsx                   -- Left nav: Email, Journeys, Automations, Social, Activity

  contacts/
    ContactsList.tsx                  -- Table with search, filters
    ContactForm.tsx                   -- Add/edit contact drawer
    ContactDetail.tsx                 -- Contact profile + events timeline
    SegmentsList.tsx                  -- Segments list
    SegmentBuilder.tsx                -- Rule builder UI (jsonb definition)
    SegmentMembersPreview.tsx         -- Shows computed members

  email/
    EmailDashboard.tsx                -- Sub-tabs: Templates, Campaigns, Settings
    templates/
      TemplatesList.tsx               -- Grid/list of templates
      TemplateEditor.tsx              -- Name, subject, WYSIWYG/markdown editor
      VariableInserter.tsx            -- Insert {{first_name}} etc.
      TestSendModal.tsx               -- Send test to single email
    campaigns/
      CampaignsList.tsx               -- Status-filtered list
      CampaignWizard.tsx              -- 4-step wizard (name/template, audience, schedule, review)
      CampaignDetail.tsx              -- Summary + stats + message log
    settings/
      EmailProviderSettings.tsx       -- Resend/SMTP config

  journeys/
    JourneysList.tsx                  -- List with status badges
    JourneyBuilder.tsx                -- React Flow canvas
    JourneyCanvas.tsx                 -- Nodes + edges + controls
    JourneyInspector.tsx              -- Right panel for node config
    JourneyToolbar.tsx                -- Save, Validate, Publish, Pause
    nodes/
      TriggerNode.tsx                 -- Segment entry, tag added, event occurred
      SendEmailNode.tsx               -- Pick template
      WaitNode.tsx                    -- Duration or date
      ConditionNode.tsx               -- Branch logic
      UpdateContactNode.tsx           -- Set attribute/tag
      WebhookNode.tsx                 -- POST URL
      EndNode.tsx                     -- Terminal

  automations/
    AutomationsList.tsx               -- List with on/off toggle
    AutomationBuilder.tsx             -- Trigger + conditions + actions form

  social/
    SocialDashboard.tsx               -- Connect accounts + create post
    SocialCalendar.tsx                -- Month/week calendar view
    SocialPostForm.tsx                -- Content, media, channels, schedule
    ConnectAccountCard.tsx            -- Provider connection placeholder

  activity/
    ActivityLog.tsx                   -- Filtered timeline view
    ActivityFilters.tsx               -- Channel, contact, date range filters

src/components/settings/engage/
  EngageIntegrationSettings.tsx       -- New settings tab content
  EmailProviderConfig.tsx             -- Resend API key / SMTP config
  SocialAccountsConfig.tsx            -- Social account connections

src/services/engage/
  contactService.ts                   -- CRUD for contacts
  segmentService.ts                   -- CRUD + evaluate
  emailTemplateService.ts             -- Template CRUD
  emailCampaignService.ts             -- Campaign lifecycle
  emailSendService.ts                 -- Queue + send logic
  journeyService.ts                   -- Journey CRUD + node/edge persistence
  journeyExecutionService.ts          -- Step processing client
  automationService.ts                -- Automation CRUD
  socialService.ts                    -- Posts + accounts
  engageActivityService.ts            -- Activity log queries

src/hooks/engage/
  useContacts.ts
  useSegments.ts
  useEmailTemplates.ts
  useEmailCampaigns.ts
  useJourneys.ts
  useAutomations.ts
  useSocialPosts.ts
  useActivityLog.ts

src/types/engage.ts                   -- All TypeScript interfaces
```

---

## Edge Functions

### 1. `engage-email-send` (new)
- Picks queued `email_messages` in batches
- Sends via Resend API (or SMTP stub)
- Updates message status
- Logs to `engage_activity_log`
- Idempotent (checks status before sending)

### 2. `engage-journey-processor` (new)
- Processes pending `journey_steps` where `scheduled_for <= now()`
- Handles each node type: send email, wait, condition, update contact, webhook
- Creates next step(s) based on edges
- Logs to `engage_activity_log`

### 3. `engage-social-poster` (new)
- Checks due `social_posts`
- Stub implementation: marks as posted if auth_data present, failed if not
- Logs to `engage_activity_log`

### 4. `engage-segment-evaluator` (new)
- Recomputes segment memberships
- Called on-demand or by cron
- Checks trigger conditions for journeys/automations

### 5. `engage-unsubscribe` (new, public)
- Public endpoint: `/functions/v1/engage-unsubscribe?token=...`
- Validates token, flips `unsubscribed = true` on contact
- Returns simple HTML confirmation page

---

## Job Runner

A single `engage-job-runner` edge function called by pg_cron every minute:
1. Calls `engage-email-send` logic (process queued messages)
2. Calls `engage-journey-processor` logic (advance journey steps)
3. Calls `engage-social-poster` logic (post due social content)
4. Calls `engage-segment-evaluator` logic (recompute memberships for active journeys)

---

## Settings Tab: "Engage"

Add a new tab to `SettingsPopup.tsx`:
- Tab ID: `engage`
- Label: "Engage"
- Icon: `Send` (from lucide-react)
- Content: `EngageIntegrationSettings` component with:
  - **Email Provider** section: Choose Resend or SMTP, enter API key (stored via existing `api_keys` pattern)
  - **Social Accounts** section: Cards for Twitter/X, LinkedIn, Instagram, Facebook with "Connect" buttons (placeholder OAuth flow)
  - **Default From** section: From name, from email, reply-to

Update `SettingsContext.tsx` to include `'engage'` in the valid tabs list.

---

## Navigation

- Add "Engage" to `NavItems.tsx` between Campaigns and Analytics
- Icon: `Send` from lucide-react
- Route: `/engage`
- Active when pathname starts with `/engage`

---

## Routes (in App.tsx)

```text
/engage                    -- Main engage page (redirects to /engage/email)
/engage/email              -- Email tab (templates, campaigns, settings sub-tabs)
/engage/journeys           -- Journeys list
/engage/journeys/:id       -- Journey builder
/engage/automations        -- Automations list
/engage/social             -- Social scheduler
/engage/activity           -- Activity log
/engage/contacts           -- Contacts list
/engage/contacts/:id       -- Contact detail
/engage/segments           -- Segments list
```

---

## Workspace Context

Create `src/contexts/WorkspaceContext.tsx`:
- Provides `currentWorkspaceId`, `workspaceRole`, `switchWorkspace()`
- Fetches from `team_members` + `team_workspaces` for current user
- All engage services use this context for workspace scoping
- Role-based permission checks (viewer = read-only, marketer = create/edit, admin/owner = everything)

---

## Seed Data

Create `src/utils/engage/seedData.ts`:
- 10 contacts with varied tags/attributes
- 2 segments (e.g., "Active Users", "Newsletter Subscribers")
- 2 email templates (Welcome email, Follow-up)
- 1 sample journey (Segment Entry -> Wait 1 Day -> Send Email -> End)
- Accessible via a "Load Demo Data" button in the Engage settings

---

## Implementation Sequence

| Step | What | Files |
|------|------|-------|
| 1 | Database migration (all 18 tables + RLS + functions) | SQL migration |
| 2 | Types + WorkspaceContext + services | types/engage.ts, contexts, services |
| 3 | Engage page shell + routing + sidebar nav | Engage.tsx, EngageLayout.tsx, App.tsx, NavItems.tsx |
| 4 | Settings tab for Engage integrations | SettingsPopup.tsx, EngageIntegrationSettings.tsx |
| 5 | Contacts + Segments (UI + service) | contacts/ components + hooks |
| 6 | Email Templates (editor + list + test send) | email/templates/ components |
| 7 | Email Campaigns (wizard + list + detail) | email/campaigns/ components |
| 8 | Email send edge function + job runner | engage-email-send, engage-job-runner |
| 9 | Journey Builder (React Flow canvas + persistence) | journeys/ components |
| 10 | Journey execution edge function | engage-journey-processor |
| 11 | Automations (rule form + tie to journeys) | automations/ components |
| 12 | Social scheduler (calendar + post form + stub poster) | social/ components |
| 13 | Activity Log (filtered timeline) | activity/ components |
| 14 | Seed data utility | seedData.ts |
| 15 | Unsubscribe public endpoint | engage-unsubscribe edge function |

---

## What Stays Unchanged

- Existing `team_workspaces` and `team_members` tables (reused as-is)
- All existing pages, routes, and features
- Database table naming convention (all new tables prefixed with `engage_`, `email_`, `journey_`, `social_`)
- Existing API key storage pattern (reused for email provider keys)

