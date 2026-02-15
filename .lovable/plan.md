

# Engage Module: Remaining Functional Gaps

## Current State

Every page exists with glassmorphism styling, framer-motion animations, stats heroes, and basic CRUD. All 5 edge functions are deployed. However, several planned features were skipped during implementation.

## Gap 1: Campaign Audience Selector

**File: `src/components/engage/email/campaigns/CampaignsList.tsx`**

Currently campaigns launch to ALL non-unsubscribed contacts. The plan called for a 3-step wizard:
- Step 1: Name + Template (exists)
- Step 2: Audience -- "All contacts", a specific segment, or filter by tags (MISSING)
- Step 3: Schedule -- "Send now" or pick date/time (MISSING)

**Changes:**
- Replace the simple create dialog with a multi-step wizard (3 steps inside the same dialog)
- Step 2 queries `engage_segments` for a segment picker, and lets user enter tags
- Show estimated recipient count based on selection
- Step 3 adds a `scheduled_at` datetime input with a "Send Now" / "Schedule" toggle
- The `launchCampaign` mutation needs to respect audience: if segment selected, query `engage_segment_memberships` for contact_ids; if tags, filter `engage_contacts` by tags
- The `createCampaign` mutation saves `audience_definition` JSON with `{ type: 'all' | 'segment' | 'tags', segment_id?, tags? }`

## Gap 2: Campaign Edit and Duplicate

**File: `src/components/engage/email/campaigns/CampaignsList.tsx`**

Currently only create and delete exist. Add:
- Edit button on draft campaigns (opens the wizard pre-filled)
- Duplicate button (creates a copy with "(Copy)" suffix in draft status)
- Both added to the existing DropdownMenu

## Gap 3: Automation Edit Dialog

**File: `src/components/engage/automations/AutomationsList.tsx`**

Currently only create and delete. The create dialog only sets name + single trigger type + single action type. Plan called for:
- Edit button on each automation card (opens dialog pre-filled with current config)
- Multi-action support: ability to add multiple actions (add_tag + send_email, etc.)
- Trigger value input (e.g., tag name for tag_added, segment name for segment_entry, event name for event_occurred)
- Action value inputs (template picker for send_email, tag input for add_tag, journey picker for enroll_journey, URL for webhook)

**Changes:**
- Expand the form state to handle `trigger_value` and an `actions` array
- Each action has `type` + `config` (template_id, tag, journey_id, url)
- Add/remove action buttons
- Fetch templates and journeys for pickers
- Edit button opens same dialog pre-filled

## Gap 4: Social Post Edit (real update vs create)

**File: `src/components/engage/social/SocialDashboard.tsx`**

The current `onEdit` handler opens the create dialog pre-filled, but the `createPost` mutation always inserts a new post. It never updates the existing one.

**Changes:**
- Track an `editingPostId` state
- When `editingPostId` is set, the save button runs an UPDATE instead of INSERT
- Also update `social_post_targets` (delete old, insert new)

## Gap 5: Journey Enrollment from Contact Detail

**File: `src/components/engage/contacts/ContactDetailDialog.tsx`**

Plan called for an "Enroll in Journey" button in the contact detail dialog.

**Changes:**
- Add a button "Enroll in Journey" below the tags section
- Opens a small nested dialog/popover listing active journeys (from `journeys` table where status = 'active')
- On select: insert into `journey_enrollments` (workspace_id, journey_id, contact_id, status: 'active')
- Find the trigger node for that journey and insert a `journey_step` (node_id = trigger node, status: 'pending', scheduled_for: now)
- Toast confirmation

## Gap 6: Unsubscribe Link Mismatch Fix

**File: `supabase/functions/engage-unsubscribe/index.ts`**

The unsubscribe function reads `url.searchParams.get("token")`, but `engage-email-send` injects `?contact_id=...`. These don't match.

**Fix:** Change the unsubscribe function to also accept `contact_id` parameter as fallback, or change `engage-email-send` to use `token` instead. Simplest fix: update `engage-unsubscribe` to read either `token` or `contact_id`.

## Gap 7: Breadcrumb Navigation

**New file: `src/components/engage/shared/EngageBreadcrumb.tsx`**

A simple breadcrumb component showing "Engage > Email > Campaigns" style navigation.

**Integration:**
- Add to `EngageLayout.tsx` above `{children}`, reading from the current route path
- Auto-generates crumbs from the URL segments

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/engage/shared/EngageBreadcrumb.tsx` | Breadcrumb component reading route path |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/engage/email/campaigns/CampaignsList.tsx` | 3-step wizard, audience selector, scheduling, edit, duplicate |
| `src/components/engage/automations/AutomationsList.tsx` | Edit dialog, multi-action support, trigger/action value inputs |
| `src/components/engage/social/SocialDashboard.tsx` | Fix edit to update instead of insert |
| `src/components/engage/contacts/ContactDetailDialog.tsx` | Add "Enroll in Journey" button |
| `src/components/engage/EngageLayout.tsx` | Add breadcrumb component |
| `supabase/functions/engage-unsubscribe/index.ts` | Fix param mismatch (accept both token and contact_id) |

## Implementation Order

1. Unsubscribe link fix (quick edge function fix, deploy)
2. Social post edit fix (small state change)
3. Campaign wizard with audience + scheduling + edit + duplicate (biggest change)
4. Automation edit with multi-action and value inputs
5. Journey enrollment from contact detail
6. Breadcrumb navigation
