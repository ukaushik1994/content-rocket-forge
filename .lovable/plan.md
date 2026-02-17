
# Engage Module End-to-End Audit Report

## Pages Tested (All 7 render successfully)

| Page | Status | Data |
|------|--------|------|
| Email (Inbox/Sent/Templates/Campaigns/Reports) | Renders | 0 threads, 0 templates, 0 campaigns |
| Contacts | Renders | 1 contact (John CEO) |
| Segments | Renders | 0 segments |
| Journeys | Renders | 1 draft journey (5 nodes) |
| Automations | Renders | 0 automations |
| Social | Renders | 0 posts, 0 connected accounts |
| Activity | Renders | 0 events |

No console errors specific to Engage. All RLS policies are properly configured using `get_user_engage_workspace_ids(auth.uid())`.

---

## Issues Found (Categorized)

### A. Visual Consistency Gaps (5 files still have old styling)

These files still use the redundant `bg-card/95 backdrop-blur-xl border-border/50` and plain `DialogTitle` without the shared `EngageDialogHeader` component:

1. **TemplatesList.tsx** (line 271) - Editor dialog has old glass override + plain title
2. **TemplatesList.tsx** (line 324) - Test Send dialog has plain title
3. **CampaignsList.tsx** (line 312) - Wizard dialog has old glass override + plain title
4. **CampaignsList.tsx** (line 389) - Campaign Detail dialog has old glass override + manual icon title
5. **CampaignsList.tsx** (line 306) - "New Campaign" button uses standard `Button` instead of `EngageButton`
6. **SentList.tsx** (line 96) - Detail dialog has old glass override + plain title
7. **AuditLog.tsx** (line 173) - Detail dialog has old glass override + plain title
8. **JourneyBuilder.tsx** (line 334) - Dropdown menu has old glass override (minor)
9. **ContactsList.tsx** (line 260) - "Add Contact" submit button inside dialog uses standard `Button`

### B. Backend/Edge Function Issues

1. **No RESEND_API_KEY secret configured** - The `engage-email-send` edge function looks for `RESEND_API_KEY` env var or falls back to `api_keys` table. Without either, emails will be marked "sent" but never actually delivered via Resend.
2. **No email_provider_settings rows exist** - The edge function joins `email_provider_settings!inner` but this table is empty AND has no FK from `email_messages`. This join will return 0 rows, meaning the email sender function will process 0 messages every run (all queued emails are silently skipped).
3. **No `engage-email-webhook` edge function exists** - The memory states inbound email processing via webhook, but no such function directory exists in `supabase/functions/`. Inbound email replies cannot be received.
4. **ComposeDialog sends with empty `from_email`** (line 81) - The outbound thread message has `from_email: ''`, which will show as blank in the thread reader.

### C. Functional Gaps (Features referenced but incomplete)

1. **Email sending pipeline is broken** - Due to issue B2 above, the `engage-email-send` function cannot process any queued messages. The entire email delivery flow (compose, campaigns, test sends) will queue messages but never deliver them.
2. **Social posting edge function** - `engage-social-poster` exists but no social accounts are connected and no OAuth flow is implemented for connecting real accounts (Twitter, LinkedIn, etc.).
3. **Journey processor** - `engage-journey-processor` edge function exists but there is no cron/scheduler to trigger it automatically. Journeys must be manually triggered.
4. **Automation runner** - `engage-job-runner` exists but same cron issue - no automated trigger.

### D. Data Sparsity (UX issue, not a bug)

The workspace has almost no data (1 contact, 1 draft journey). The "Load Demo Data" feature mentioned in the memory would help demonstrate the platform's capabilities immediately.

---

## What I Need From You

To fix the broken email pipeline and complete the module:

1. **Resend API Key** - Do you have a Resend API key? I need it to configure the email sending secret so the `engage-email-send` function can actually deliver emails.

2. **Decision on email provider architecture** - The edge function expects `email_provider_settings` to be configured per-workspace, but the `email_messages` table has no FK to it. Should I:
   - (a) Fix the edge function to work without the join (simpler), or
   - (b) Add the FK relationship and create a settings setup flow (more robust)?

3. **Decision on demo data** - Should I seed comprehensive demo data (contacts, templates, campaigns, activity logs) so you can immediately see the full platform in action?

---

## Recommended Fix Priority

### Phase 1 - Critical (email pipeline fix)
- Fix `engage-email-send` to not require `email_provider_settings!inner` join
- Set `from_email` in ComposeDialog from provider settings or a default
- Configure RESEND_API_KEY secret (needs your key)

### Phase 2 - Visual cleanup (5 remaining dialog files)
- Apply `EngageDialogHeader` + remove old overrides in TemplatesList, CampaignsList, SentList, AuditLog
- Swap remaining `Button` to `EngageButton` in CampaignsList

### Phase 3 - Demo data + polish
- Seed demo data for a rich first-use experience
- Wire up ComposeDialog `from_email` from settings

