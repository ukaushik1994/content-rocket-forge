
# Engage Module: Comprehensive Remaining Work Plan

## Current Status: All 7 pages render and load data correctly

| Page | Renders | Data Loads | Visual Standard | Dialogs Use Shared Components |
|------|---------|------------|-----------------|------------------------------|
| Email (Inbox/Sent/Scheduled/Drafts/Templates/Campaigns/Reports) | Yes | Yes | Yes | Yes |
| Contacts | Yes | Yes (1 contact) | Yes | Yes |
| Segments | Yes | Yes (0 segments) | Partial | No (still uses plain DialogTitle) |
| Journeys | Yes | Yes (1 journey) | Partial | No (still uses plain DialogTitle) |
| Automations | Yes | Yes (0 automations) | Partial | No (still uses plain DialogTitle) |
| Social | Yes | Yes (0 posts) | Partial | No (still uses plain DialogTitle) |
| Activity (Feed/Health/Audit) | Yes | Yes | Yes | Yes |

No Engage-specific console errors detected. All RLS policies work correctly via `get_user_engage_workspace_ids`.

---

## Phase 1: Visual Consistency (Remaining Dialog Headers)

5 files still use plain `DialogTitle` with manual gradient text instead of the shared `EngageDialogHeader` component with icon glow halo + separator line:

### 1. SegmentsList.tsx (3 dialogs)
- **Line 198**: Create/Edit Segment dialog -- replace `DialogHeader > DialogTitle` with `EngageDialogHeader` (icon: Layers, violet/purple gradient)
- **Line 242-246**: Segment Members viewer dialog -- replace manual icon+gradient title with `EngageDialogHeader`
- **Line 216**: "Create Segment" submit button -- replace standard `Button` with `EngageButton`
- Add missing `EngageDialogHeader` import

### 2. JourneysList.tsx (2 dialogs)
- **Line 287**: Create Journey dialog -- replace `DialogTitle` with `EngageDialogHeader` (icon: GitBranch, purple/blue gradient)
- **Line 330**: Rename Journey dialog -- replace `DialogTitle` with `EngageDialogHeader`
- **Line 311**: "Create from Template" button -- replace standard `Button` with `EngageButton`
- Add `EngageDialogHeader` import

### 3. AutomationsList.tsx (3 dialogs)
- **Line 369**: Create/Edit Automation dialog -- replace `DialogTitle` with `EngageDialogHeader` (icon: Zap, amber/orange gradient)
- **Line ~540 (execution log dialog)**: Already uses a manual styled title -- replace with `EngageDialogHeader`
- **Line ~580 (dry run dialog)**: Replace with `EngageDialogHeader`
- Add `EngageDialogHeader` import

### 4. SocialDashboard.tsx (2 dialogs)
- **Line 309**: Create/Edit Post dialog -- replace `DialogTitle` with `EngageDialogHeader` (icon: Share2, purple/blue gradient)
- **Link Account dialog**: Replace with `EngageDialogHeader`
- Add `EngageDialogHeader` import

### 5. ContactDetailDialog.tsx (1 dialog)
- **Lines 217-228**: Currently has a manual icon glow implementation inline -- replace with `EngageDialogHeader` component to ensure consistency (emerald/teal gradient, Mail icon)
- Add `EngageDialogHeader` import

---

## Phase 2: Functional Fixes

### A. Contacts Page
- **Active/Unsubscribed counts are local-page-only** (lines 77-78): These count only the current page of contacts (up to 50), not the total. When there are 200+ contacts across multiple pages, the stat cards will show incorrect numbers. Fix: add separate count queries filtered by `unsubscribed` status, like the existing `totalCount` query.

### B. Segments Page -- Missing `EngageDialogHeader` import
- The Segment Members viewer uses a manual `DialogTitle` with inline icon -- standardize.

### C. Social Dashboard -- Storage bucket may not exist
- `handleMediaUpload` uploads to `social-media` storage bucket (line 121). If this bucket doesn't exist, uploads will fail silently. Verify bucket existence or add graceful error handling.

### D. Email Compose -- `from_email` fallback
- Currently defaults to `'noreply@engage.app'` -- this is fine for dev but should pull from `email_provider_settings` when available to match what the edge function uses.

---

## Phase 3: Data Seeding (Manual Add Approach)

Since you chose to add data manually, here is the recommended order to verify the full flow:

1. **Contacts**: Add 3-5 more contacts via the Add Contact dialog (email, name, tags like "newsletter", "vip")
2. **Segments**: Create a segment with rule "tags includes newsletter" -- click the refresh icon to evaluate. The members viewer should populate.
3. **Templates**: Create an email template with `{{first_name}}` variable, use the Preview tab to verify rendering
4. **Campaigns**: Create a campaign using the template, select "All contacts" audience, and Launch. Messages should appear in the Sent tab (marked "sent" without Resend key).
5. **Journeys**: Open the existing journey in the builder, verify the visual flow renders with React Flow nodes
6. **Automations**: Create an automation with trigger "Tag Added" and action "Send Email"
7. **Social**: Create a draft social post, try the calendar and queue views
8. **Activity**: After the above actions, the Activity feed should show events from the `engage_activity_log` table

---

## Phase 4: Edge Function Completeness

| Function | Status | Issue |
|----------|--------|-------|
| engage-email-send | Fixed | Works without `email_provider_settings` join. Mock-delivers without Resend key. |
| engage-job-runner | Exists | No pg_cron trigger configured -- requires Supabase dashboard setup |
| engage-journey-processor | Exists | Same -- needs cron or manual invoke |
| engage-social-poster | Exists | No real OAuth -- accounts are "linked" manually with tokens |
| engage-unsubscribe | Exists | Functional for one-click unsubscribe |
| engage-email-webhook | Missing | Inbound email processing not implemented -- low priority |

---

## Summary of Changes

- **8 files modified** (5 for EngageDialogHeader + EngageButton integration, 1 for contact count fix, 2 minor cleanups)
- **Zero database changes** needed
- **Zero edge function changes** needed
- All changes are purely frontend visual standardization + 1 small logic fix for accurate contact stats
