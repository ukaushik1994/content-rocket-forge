

# AI Chat Gap Fix -- Complete Patch

## What's Being Fixed

4 categories of gaps identified across the AI Chat system:

### 1. Missing Cache Invalidation (tools.ts)

The following write tools are missing from `WRITE_TOOL_CACHE_INVALIDATION`, meaning the UI won't refresh after they execute:

| Tool | Should Invalidate |
|------|------------------|
| `publish_to_website` | `get_content_items` |
| `create_social_post` | (no read tool yet, empty array) |
| `schedule_social_from_repurpose` | (no read tool yet, empty array) |
| `enroll_contacts_in_journey` | `get_engage_journeys` |
| `send_quick_email` | (empty array) |
| `trigger_content_gap_analysis` | `get_keywords`, `get_content_items` |
| `start_content_builder` | (empty array) |

### 2. Missing Confirmation Card Labels (ActionConfirmationCard.tsx)

`TOOL_LABELS` only has 4 entries. The following destructive tools show raw snake_case names instead of human-readable labels:

| Tool | Label to Add |
|------|-------------|
| `publish_to_website` | Publish to Website |
| `create_social_post` | Post to Social Media |
| `schedule_social_from_repurpose` | Schedule Social Posts |

### 3. Missing Intent Detection Rules (actionIntentDetector.ts)

These backend tools exist but have no intent detection patterns, so the chat can never route to them automatically:

| Tool | Trigger Phrases to Add |
|------|----------------------|
| `trigger_content_gap_analysis` | "find content gaps", "what am I missing", "content gap analysis" |
| `start_content_builder` | "open content builder", "start content builder", "guided content creation" |
| `update_company_info` | "update company info", "change company name", "set company details" |
| `update_competitor` | "update competitor", "edit competitor", "change competitor details" |

### 4. Missing Delete/Cleanup Tools

No delete tools exist for contacts, segments, campaigns, journeys, automations, or social posts. Adding the most critical ones:

| New Tool | File | Purpose |
|----------|------|---------|
| `delete_contact` | engage-action-tools.ts | Remove a contact from CRM |
| `delete_segment` | engage-action-tools.ts | Remove an audience segment |
| `delete_email_campaign` | engage-action-tools.ts | Remove a draft campaign |
| `delete_journey` | engage-action-tools.ts | Remove a draft journey |
| `delete_automation` | engage-action-tools.ts | Remove an automation |
| `delete_social_post` | engage-action-tools.ts | Remove a scheduled/draft social post |

---

## Technical Details

### File 1: `supabase/functions/enhanced-ai-chat/tools.ts`

Add 7 entries to `WRITE_TOOL_CACHE_INVALIDATION`:

```
publish_to_website: ['get_content_items'],
create_social_post: [],
schedule_social_from_repurpose: [],
enroll_contacts_in_journey: ['get_engage_journeys'],
send_quick_email: [],
trigger_content_gap_analysis: ['get_keywords', 'get_content_items'],
start_content_builder: [],
```

### File 2: `src/components/ai-chat/ActionConfirmationCard.tsx`

Expand `TOOL_LABELS` with all destructive/confirmable tools:

```
publish_to_website: 'Publish to Website',
create_social_post: 'Post to Social Media',
schedule_social_from_repurpose: 'Schedule Social Posts',
delete_contact: 'Delete Contact',
delete_segment: 'Delete Segment',
delete_email_campaign: 'Delete Email Campaign',
delete_journey: 'Delete Journey',
delete_automation: 'Delete Automation',
delete_social_post: 'Delete Social Post',
```

### File 3: `src/utils/actionIntentDetector.ts`

Add 4 missing intent rules for existing tools + 6 intent rules for new delete tools. Add all 6 delete tools to `DESTRUCTIVE_TOOLS`.

New intent patterns:
- `trigger_content_gap_analysis`: "find content gaps", "what am I missing", "gap analysis"
- `start_content_builder`: "open content builder", "start content builder", "guided content"
- `update_company_info`: "update company info", "change company name/details"
- `update_competitor`: "update competitor", "edit competitor"
- `delete_contact`: "delete contact", "remove contact"
- `delete_segment`: "delete segment", "remove segment"
- `delete_email_campaign`: "delete campaign", "remove email campaign"
- `delete_journey`: "delete journey", "remove journey"
- `delete_automation`: "delete automation", "remove automation"
- `delete_social_post`: "delete social post", "remove social post"

### File 4: `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`

Add 6 new delete tool definitions and their execution handlers:

Each delete tool follows the same pattern:
1. Accept the item UUID
2. Verify workspace ownership
3. Delete from the appropriate table
4. Return success/failure

Add to `ENGAGE_ACTION_TOOL_NAMES` array.

### File 5: `supabase/functions/enhanced-ai-chat/tools.ts` (cache section)

Add cache invalidation entries for all 6 delete tools:

```
delete_contact: ['get_engage_contacts'],
delete_segment: ['get_engage_segments'],
delete_email_campaign: ['get_engage_email_campaigns'],
delete_journey: ['get_engage_journeys'],
delete_automation: ['get_engage_automations'],
delete_social_post: [],
```

### File 6: `supabase/functions/enhanced-ai-chat/index.ts`

Update the system prompt's WRITE tools list to include the 6 new delete tools in the Engage line.

---

## Summary of Changes

| File | Lines Added (approx) |
|------|---------------------|
| `tools.ts` (cache invalidation) | ~15 |
| `ActionConfirmationCard.tsx` (labels) | ~10 |
| `actionIntentDetector.ts` (10 new rules + destructive set) | ~70 |
| `engage-action-tools.ts` (6 delete tools) | ~120 |
| `index.ts` (system prompt) | ~2 |
| **Total** | **~217 lines** |

No database changes required. All tables already exist with proper RLS.

