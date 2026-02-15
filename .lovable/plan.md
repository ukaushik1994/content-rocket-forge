

# Complete Engage Module Build Plan

## Current State Assessment

The Engage module already has a solid foundation:

**Frontend (Built)**
- Sidebar navigation with 7 sections (Email, Contacts, Segments, Journeys, Automations, Social, Activity)
- Workspace context with auto-provisioning
- All 7 page components exist and are functional
- Social Dashboard is fully polished (glassmorphism, framer-motion)
- Campaigns, Automations, Journeys lists are polished with GlassCard + stats
- Journey Builder with custom React Flow nodes and inspector panel
- Settings page in global Settings popup with Resend API key + sender config

**Backend (Built)**
- 20 database tables with RLS enabled and workspace-scoped policies
- 5 Edge Functions: engage-email-send, engage-job-runner, engage-journey-processor, engage-social-poster, engage-unsubscribe
- Seed data utility for demo data
- Workspace provisioning via ensure_engage_workspace RPC

**What's Missing or Incomplete**
The pages that still use basic/plain styling and lack important functionality:

---

## Phase 1: Contacts & Segments Polish + Functionality

### 1A. ContactsList Redesign
**Current**: Plain table with basic add dialog. No edit, no delete, no bulk actions, no detail view.

**Changes to `ContactsList.tsx`**:
- GlassCard + framer-motion stagger layout (match Social/Campaigns pattern)
- Hero section with stat cards: Total, Active, Unsubscribed counts
- Add inline edit capability: click contact row to open detail side panel or dialog
- Edit contact: update first_name, last_name, phone, tags, attributes
- Delete contact with confirmation dialog
- Bulk import contacts via CSV paste (textarea, parse rows)
- Contact detail dialog showing: all fields, tags as editable chips, event history (from engage_events), activity timeline (from engage_activity_log filtered by contact_id)
- Search should also search by tags
- Pagination or "load more" since contact lists can grow beyond default 1000 limit
- Filter by tag (dropdown multi-select)
- Unsubscribe/Resubscribe toggle button per contact

### 1B. SegmentsList Redesign
**Current**: Basic cards, create dialog only has name/description, no rule builder.

**Changes to `SegmentsList.tsx`**:
- GlassCard + framer-motion layout with stat cards (Total segments, Total members across all)
- Integrate the existing `RuleBuilder.tsx` component into the create/edit dialog
- Edit segment: click to open dialog with name, description, and rule builder
- Delete segment with confirmation
- Show last evaluated timestamp
- Show rule summary on each card (e.g., "plan != free AND tags includes newsletter")
- Re-evaluate button already works -- just style it better

---

## Phase 2: Email Section Polish

### 2A. EmailDashboard Redesign
**Current**: Basic Tabs component. No hero section.

**Changes to `EmailDashboard.tsx`**:
- Add hero section with gradient title "Email" and stats: Total Templates, Active Campaigns, Emails Sent
- Query email_messages count for stats
- Glassmorphism tab styling

### 2B. TemplatesList Redesign
**Current**: Functional but plain Card styling. No edit capability.

**Changes to `TemplatesList.tsx`**:
- GlassCard styling with hover effects
- Edit template: click to open editor with pre-filled form (reuse create dialog logic)
- Duplicate template button
- Template preview card showing rendered preview thumbnail
- Better variable insertion UX

### 2C. EmailProviderSettings Cleanup
**Current**: Still has plain API key input field, duplicates what EngageIntegrationSettings now handles.

**Changes to `EmailProviderSettings.tsx`**:
- Remove the API key input (handled by EngageIntegrationSettings now)
- Only show from_name, from_email, reply_to config
- Add a note linking to Settings > Engage for API key management
- Or alternatively, embed the SimpleProviderCard here too
- GlassCard styling

---

## Phase 3: Activity Log Polish

### 3A. ActivityLog Redesign
**Current**: Functional but plain styling with basic hover.

**Changes to `ActivityLog.tsx`**:
- GlassCard containers + framer-motion entry animation
- Hero section with stats: Total Events (24h), Emails Sent, Journey Steps Executed
- Timeline visual: vertical line connecting events with node dots per channel type
- Click on an activity to see full payload in a popover/dialog
- Export activity log (CSV download)
- Better empty state with gradient icon (match other pages)

---

## Phase 4: Settings -- Move Engage Config into Engage Sidebar

The user specifically asked: "all settings related connection and API should be in the Engage section."

### 4A. Add Settings Nav Item to Engage Sidebar

**Changes to `EngageSidebar.tsx`**:
- Add a `{ path: '/engage/settings', label: 'Settings', icon: Settings }` nav item at the bottom, separated with a divider

**Changes to `Engage.tsx` (router)**:
- Add route: `<Route path="settings" element={<EngageSettings />} />`

### 4B. Create Dedicated Engage Settings Page

**New file: `src/components/engage/settings/EngageSettings.tsx`**

This page consolidates everything from `EngageIntegrationSettings.tsx` but lives inside the Engage module itself (not the global settings popup). It includes:

- **Connection Status Dashboard** (existing pattern from EngageIntegrationSettings)
- **Email API Key Section**: SimpleProviderCard for Resend
- **Sender Configuration**: from_name, from_email, reply_to form
- **Test Email Button**
- **Social Accounts Section**: Provider cards with Coming Soon badges
- **Workspace Settings**: Rename workspace, manage team members
- **Demo Data Loader**
- **Danger Zone**: Delete all contacts, reset workspace

All styled with GlassCard + framer-motion consistent with the rest of Engage.

### 4C. Keep Global Settings Entry Point
The `EngageIntegrationSettings` in the global Settings popup should remain but simplified -- just show connection status summary and a "Go to Engage Settings" link/button that navigates to `/engage/settings`.

---

## Phase 5: Cross-Page Connections

### 5A. Contact Detail Links
- From Activity Log: click contact name to navigate to `/engage/contacts` with that contact highlighted/filtered
- From Campaign stats: show which contacts received the email

### 5B. Campaign Audience from Segments
- In CampaignsList create dialog: add audience step to pick "All Contacts" or a specific segment
- When launching: if segment selected, query engage_segment_memberships for contact_ids instead of all contacts

### 5C. Journey Enrollment from Contacts
- In Contact detail dialog: "Enroll in Journey" button that shows a journey picker dialog
- Creates journey_enrollment + first journey_step

### 5D. Breadcrumb Navigation
- Add breadcrumb component at top of each Engage page: "Engage > Email > Campaigns"
- Makes navigation context clear

---

## Phase 6: Backend Improvements

### 6A. Automation Trigger Engine
**New Edge Function: Update `engage-job-runner/index.ts`**
- Add automation evaluation step: query active automations, check if their trigger conditions match any recent events
- For `tag_added` triggers: check engage_events for recent tag_added events
- For `segment_entry` triggers: compare current vs previous segment memberships
- Execute actions: send_email, add_tag, enroll_journey, webhook

### 6B. Email Campaign Stats Tracking
- After engage-email-send processes messages, update the campaign's `stats` JSON with sent/delivered/failed counts
- This makes the campaign cards show real stats instead of always-zero

### 6C. Unsubscribe Link Injection
- In engage-email-send, auto-append unsubscribe link to every email body using contact ID as token
- The engage-unsubscribe function already handles the landing page

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/engage/settings/EngageSettings.tsx` | Dedicated Engage settings page with all connections |
| `src/components/engage/contacts/ContactDetailDialog.tsx` | Contact detail/edit dialog component |
| `src/components/engage/shared/EngageBreadcrumb.tsx` | Breadcrumb navigation component |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/engage/EngageSidebar.tsx` | Add Settings nav item with divider |
| `src/pages/Engage.tsx` | Add /engage/settings route |
| `src/components/engage/contacts/ContactsList.tsx` | Full redesign: GlassCard, stats, edit/delete, bulk import, filters, contact detail |
| `src/components/engage/contacts/SegmentsList.tsx` | GlassCard, RuleBuilder integration, edit/delete, rule summary |
| `src/components/engage/email/EmailDashboard.tsx` | Hero section with stats, glassmorphism tabs |
| `src/components/engage/email/templates/TemplatesList.tsx` | GlassCard, edit template, duplicate |
| `src/components/engage/email/settings/EmailProviderSettings.tsx` | Remove API key field, link to Engage settings |
| `src/components/engage/email/campaigns/CampaignsList.tsx` | Add audience/segment picker to create dialog |
| `src/components/engage/activity/ActivityLog.tsx` | GlassCard, stats hero, timeline visual, payload viewer |
| `src/components/settings/engage/EngageIntegrationSettings.tsx` | Simplify to status summary + link to /engage/settings |
| `supabase/functions/engage-email-send/index.ts` | Update campaign stats after processing, inject unsubscribe link |
| `supabase/functions/engage-job-runner/index.ts` | Add automation trigger evaluation |

### Implementation Order

1. **Engage Sidebar + Settings Route** -- Add nav item and route (quick, unblocks everything)
2. **EngageSettings page** -- Move/consolidate settings content
3. **ContactsList redesign** -- Biggest user-facing page, highest impact
4. **ContactDetailDialog** -- Enables cross-page links
5. **SegmentsList redesign** -- RuleBuilder integration
6. **EmailDashboard + TemplatesList** -- Polish and edit capability
7. **ActivityLog redesign** -- Timeline visual
8. **Campaign audience picker** -- Cross-page integration
9. **Edge function updates** -- Campaign stats, automation triggers, unsubscribe injection
10. **Breadcrumbs** -- Final navigation polish

### No New Dependencies
Uses existing: `framer-motion`, `GlassCard`, `lucide-react`, `date-fns`, `RuleBuilder`, `SimpleProviderCard`, `@xyflow/react`

