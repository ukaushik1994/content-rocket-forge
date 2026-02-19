

# Universal Publishing Engine -- Complete Communication from AI Chat

## Current State

The AI Chat can already do a lot, but has critical gaps that prevent true end-to-end communication:

| Channel | Create/Draft | Send/Publish | Gap |
|---------|-------------|-------------|-----|
| Blog Content | generate_full_content, create_content_item | -- | No tool to push to WordPress/Wix |
| Email (Campaign) | create_email_campaign | send_email_campaign | Working end-to-end |
| Email (Quick) | -- | send_quick_email | Working end-to-end |
| Social Media | repurpose_for_social (AI generates text) | -- | Generated posts are returned in chat but never saved to `social_posts` table or scheduled |
| Journeys | create_journey | activate_journey | Working end-to-end |
| Automations | create_automation | toggle_automation | Working end-to-end |

**Bottom line**: Email, Journeys, and Automations already work end-to-end. The two broken pipelines are **Website Publishing** and **Social Posting**.

---

## Plan -- 3 New Tools + Intent Detection

### Tool 1: `publish_to_website`
Push a saved content item to the user's connected WordPress or Wix site.

- Looks up the content item by ID
- Checks `website_connections` for an active provider
- Calls the existing `publish-wordpress` or `publish-wix` edge function server-to-server
- Updates content status to "published" and stores the live URL
- Returns the URL in the result card

**Trigger phrases**: "publish to my website", "push to WordPress", "post this on my blog", "publish this article"
**Requires confirmation**: Yes (pushes to a live external site)

### Tool 2: `create_social_post`
Create and optionally schedule a social media post directly (without needing to repurpose existing content first).

- Creates a record in `social_posts` table with content, media URLs, and target platforms
- Creates entries in `social_post_targets` for each platform
- Supports immediate posting or scheduled time
- The existing `engage-social-poster` background job picks it up

**Trigger phrases**: "create a social post", "schedule a tweet", "post on LinkedIn", "write a social update"
**Requires confirmation**: Yes for immediate posts, No for drafts

### Tool 3: `schedule_social_from_repurpose`
Takes the output of `repurpose_for_social` (which currently just returns AI-generated text in chat) and actually saves + schedules it.

- Accepts the generated posts array and a scheduled time
- Creates `social_posts` and `social_post_targets` records for each platform
- Links back to the source content item

**Trigger phrases**: "schedule these social posts", "post these to social", "save and schedule the social posts"
**Requires confirmation**: Yes

---

## Technical Details

### File Changes

| File | Change |
|---------|--------|
| `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` | Add `publish_to_website` tool definition + execution (~50 lines). Add `schedule_social_from_repurpose` tool definition + execution (~40 lines). Add both to `CROSS_MODULE_TOOL_NAMES`. |
| `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` | Add `create_social_post` tool definition + execution (~50 lines). Add to `ENGAGE_ACTION_TOOL_NAMES`. |
| `src/utils/actionIntentDetector.ts` | Add 3 new intent rules for publish, social post creation, and social scheduling (~25 lines). Add `publish_to_website`, `create_social_post`, `schedule_social_from_repurpose` to `DESTRUCTIVE_TOOLS` set. |
| `supabase/functions/enhanced-ai-chat/index.ts` | Update the system prompt's tool list to include the 3 new tools. |

### publish_to_website Execution Logic

```text
1. Fetch content_items by ID + user_id
2. Query website_connections for active connection
3. If none -> return error with "Go to Settings > Publishing"
4. Call publish-wordpress or publish-wix via fetch() with SERVICE_ROLE_KEY
5. On success -> update content_items.status = 'published', store URL in metadata
6. Return { success, url, provider }
```

### create_social_post Execution Logic

```text
1. Get user's engage workspace_id
2. Insert into social_posts (content, media_urls, scheduled_at, status)
3. For each platform -> insert into social_post_targets
4. If scheduled_at is null and status = 'scheduled' -> engage-social-poster picks it up
5. Return { success, post_id, platforms, scheduled_at }
```

### Updated Intent Detection Rules

```text
publish_to_website:
  "publish to website/blog", "push to wordpress/wix", "post on my site"
  requiresConfirmation: true

create_social_post:
  "create social post", "schedule tweet", "post on linkedin/twitter/facebook"
  requiresConfirmation: true (for non-draft)

schedule_social_from_repurpose:
  "schedule these social posts", "post these to social", "save the social posts"
  requiresConfirmation: true
```

### Complete End-to-End Flows After This Change

**Blog to Website**:
User: "Write a blog post about AI trends" -> generate_full_content -> saved as draft
User: "Publish it to my website" -> Confirmation Card -> publish_to_website -> live URL returned

**Content to Social**:
User: "Repurpose my latest article for Twitter and LinkedIn" -> repurpose_for_social -> AI text returned
User: "Schedule these for tomorrow" -> Confirmation Card -> schedule_social_from_repurpose -> scheduled

**Direct Social Post**:
User: "Post on LinkedIn: Excited to announce our new product launch!" -> Confirmation Card -> create_social_post -> posted/scheduled

**Email Campaign**:
User: "Create an email campaign for our VIP segment" -> create_email_campaign -> draft created
User: "Send it now" -> Confirmation Card -> send_email_campaign -> sending

**Quick Email**:
User: "Send an email to john@example.com about the meeting" -> Confirmation Card -> send_quick_email -> sent

All 5 communication channels will be fully operational from a single chat interface.

### No Database Changes Required
All tables (`social_posts`, `social_post_targets`, `website_connections`, `content_items`, `email_campaigns`, `email_messages`) already exist. The edge functions (`publish-wordpress`, `publish-wix`, `engage-social-poster`, `engage-email-send`) are already deployed. This plan only wires them into the AI Chat tool system.

