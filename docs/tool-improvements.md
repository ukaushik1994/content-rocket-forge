# Tool Improvements — Living Document

> This file is continuously updated as new issues, gaps, and improvement ideas are found. Newest items at the top.

---

## Last updated: March 19, 2026

---

## CRITICAL — Users will leave without these

### IMP-1: No onboarding → new users can't do anything

**The problem:** User signs up → lands on `/ai-chat` → types "hello" → error: "No AI provider configured." They have no idea what an AI provider is, what API key they need, or where to get one. They leave.

**The welcome screen shows:** A greeting, quick actions, platform summary — all useless without an API key.

**What to build:**
1. On first login (no API keys in `api_keys` table), show an onboarding modal instead of the chat
2. The modal should:
   - Explain: "Creaiter uses your own AI service key to power the chat. We recommend OpenRouter (one key, access to all models)."
   - Show 3 options: OpenRouter (recommended), OpenAI, Anthropic
   - For each: link to get key + input field + "Test & Save" button
   - After saving: "You're ready! Start chatting." → dismiss modal → chat works
3. The settings popup "API Keys" tab already has this UI — just need to surface it as a blocking first-run screen

**Detection logic:**
```ts
// In EnhancedChatInterface or AppLayout
const { data: keyCount } = await supabase
  .from('api_keys')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .eq('is_active', true);

if (keyCount === 0) {
  showOnboardingModal();
}
```

**Files to create/modify:**
- New: `src/components/onboarding/APIKeyOnboarding.tsx`
- Modify: `src/components/ai-chat/EnhancedChatInterface.tsx` — show onboarding instead of chat when no keys

---

### IMP-2: Social posting fakes success — users think it's working

**The problem:** User says "post this to LinkedIn" → AI says "Created social post!" → user checks LinkedIn → nothing there. The social poster is a stub that marks posts as `pending_integration`. The user thinks the tool is broken.

**What to fix:**
1. AI response for social creation tools should say: "I've drafted your social post. Direct publishing to social platforms is coming soon — for now you can copy the text and post manually."
2. Social dashboard should show a banner: "Platform publishing coming soon. Posts are saved as drafts."
3. Remove any "Schedule" or "Publish Now" buttons that imply real publishing

**Files to modify:**
- `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` — update `create_social_post` response text
- `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — update `repurpose_for_social` and `schedule_social_from_repurpose` response text
- `src/components/engage/social/SocialDashboard.tsx` — add "coming soon" banner

---

### IMP-3: "Write a blog post" should use the wizard, not bare generation

**The problem:** When user types "write me a blog post about X", the AI calls `generate_full_content` which sends a simple 2-message prompt to the AI provider. Result: generic, no SERP research, no outline, no brand voice, no solution integration.

The Content Wizard (5-step flow: solution → research → outline → word count → generate) produces dramatically better content. But the AI defaults to the fast/bad path.

**What to fix:**
Update the system prompt to instruct the AI: "When the user asks to create content (blog, article, post), ALWAYS use `launch_content_wizard` — never `generate_full_content` unless the user explicitly says 'quick generate' or 'just write it without the wizard'."

Also consider: remove `generate_full_content` from the tool definitions entirely, or rename it to `quick_generate_content` with a description that says "Only use when user explicitly requests quick generation without the full wizard."

**Files to modify:**
- `supabase/functions/enhanced-ai-chat/index.ts` — update system prompt instructions about content creation
- Optionally: `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — rename/restrict tool

---

## HIGH — Significantly degrades experience

### IMP-4: Missing API key guidance for SERP, Email, and Analytics

**The problem:** Three features require external API keys with zero guidance when they're missing:

| Feature | Needs | What user sees |
|---------|-------|---------------|
| SERP Analysis | SerpAPI key | "No SerpAPI key configured" — what is SerpAPI? |
| Email Sending | Resend key + verified domain | "No Resend API key" — what is Resend? |
| Content Performance | Google Analytics + Search Console | Shows empty data, no explanation |

**What to fix:**
Each tool handler should return rich help text when the key is missing:

```
🔑 **SERP Analysis requires a SerpAPI key**

SerpAPI provides real Google search data for keyword research.
Get a free key (100 searches/month) at [serpapi.com](https://serpapi.com).

👉 [Open Settings → API Keys](/ai-settings) to add it.
```

**Files to modify:**
- `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — `trigger_serp_analysis` handler (line 166-170)
- `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` — `send_email_campaign` and `send_quick_email` handlers
- `supabase/functions/enhanced-ai-chat/brand-analytics-tools.ts` — `get_content_performance` handler

---

### IMP-5: Conversation context drops after 10 messages

**The problem:** User message 1: "My company sells HR software to enterprises." Message 15: "Write content for our product." AI has no idea about HR software — message 1 was dropped from the context window (first + last 9 only).

The landing page promises "learns from YOUR results" and "gets exponentially better." In reality, the AI has a 10-message memory.

**What to build:**
After every 10 messages, generate a 2-3 sentence summary and prepend it as a system message:

```ts
if (allMessages.length > 10) {
  const summary = await getOrCreateConversationSummary(conversationId, allMessages.slice(0, -9));
  conversationHistory.unshift({
    role: 'system',
    content: `[Conversation context] ${summary}`
  });
}
```

Store the summary in the `ai_conversations` table (add a `summary` column) and regenerate when it becomes stale (every 10 new messages).

**Files to modify:**
- `src/hooks/useEnhancedAIChatDB.ts` — `sendMessage` context building (line 528-537)
- New: summary generation function (can use the AI itself)
- Supabase migration: add `summary` column to `ai_conversations`

---

### IMP-6: Rate limits kill tool calls with no retry

**The problem:** The main chat path in `index.ts` has retry logic with exponential backoff for rate limits. But individual tool handlers (`generate_full_content`, `create_topic_cluster`, `repurpose_for_social`) call `ai-proxy` directly with NO retry logic. One 429 response kills the entire operation.

**What to fix:**
Create a shared retry wrapper:

```ts
async function callAiProxyWithRetry(url: string, body: any, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const resp = await fetch(url, { method: 'POST', headers: {...}, body: JSON.stringify(body) });
    if (resp.ok) return resp;
    if (resp.status === 429 && attempt < maxRetries) {
      await new Promise(r => setTimeout(r, 2000 * attempt));
      continue;
    }
    return resp; // Return error response on final attempt
  }
}
```

Use this in `content-action-tools.ts`, `keyword-action-tools.ts`, and `cross-module-tools.ts` instead of raw `fetch`.

---

### IMP-7: No graceful degradation when AI provider is down

**The problem:** If OpenAI is down (or whichever provider the user chose), everything fails — not just chat but every tool that calls `ai-proxy`. The self-healing fallback in `index.ts` only applies to the main chat provider lookup, not to tool-level `ai-proxy` calls.

**What to fix:**
The tool handlers should pass just `{ service, endpoint, params }` to `ai-proxy` and let `ai-proxy` handle provider fallback. Currently tools hardcode the specific provider. Instead:

```ts
// Current (fragile):
body: { service: provider.provider, endpoint: 'chat', apiKey: decryptedApiKey, params: {...} }

// Better (ai-proxy picks best available):
body: { service: 'auto', endpoint: 'chat', params: {...}, userId }
```

This requires `ai-proxy` to support `service: 'auto'` — pick the first available provider with a working key.

---

### IMP-8: Publish to website has poor error UX

**The problem:** "Publish this to my blog" → "No active website connection found. Go to Settings > Publishing to connect WordPress or Wix." The user has to leave the chat, find settings, set up OAuth (multi-step), then come back and try again.

**What to fix:**
When no website is connected, the AI response should:
1. Save the content to repository with `status: 'ready_to_publish'`
2. Say: "Your content is saved and ready to publish. To enable direct publishing, connect your blog in Settings → Websites. For now, you can copy the content from the Repository."
3. Include action buttons: "Open Repository" + "Open Settings → Websites"

---

## MEDIUM — Polish and consistency

### IMP-9: Error messages don't persist on reload (from audit)

**The problem:** Error messages with Retry/Settings buttons are added to local state only, not saved to DB. On page reload, the user sees their message with no response — the error vanishes.

**What to fix:**
Save error messages to DB with a `status: 'error'` field. On reload, render them with action buttons restored.

Alternatively: detect "orphaned" user messages (user message with no subsequent assistant message) on load and show a "Response failed — Retry?" indicator.

---

### IMP-10: Rename accepts empty string (from audit)

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `renameConversation` (line 1021)

**Fix:** Add `if (!newTitle.trim()) return;` at top of function.

---

### IMP-11: Logout doesn't clear stale conversation state (from audit)

**Where:** `src/hooks/useEnhancedAIChatDB.ts`

**Fix:** Add:
```ts
useEffect(() => {
  if (!user) {
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
  }
}, [user]);
```

---

### IMP-12: Rapid-edit race condition (from audit)

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `editMessage`

**Fix:** Add `isEditingRef` guard to prevent concurrent edits.

---

### IMP-13: Rapid conversation switching can show wrong messages briefly (from audit)

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `loadMessages`

**Fix:** Track latest request ID, ignore stale responses.

---

### IMP-14: Export empty conversation creates empty file (from audit)

**Where:** `src/hooks/useEnhancedAIChatDB.ts` — `exportConversation`

**Fix:** Check `messagesData.length === 0` → show "Nothing to export" toast.

---

### IMP-15: `.gitignore` still missing `.env`

**Where:** `.gitignore`

**Fix:** Add:
```
.env
.env.*
.env.local
.env.production
```

---

## LOW — Nice to have

### IMP-16: Content Wizard image generation depends on image provider key

The wizard's "Generate" step can create images via `ImageGenService`, but this requires an `openai_image`, `gemini_image`, or `lmstudio_image` key configured. No error shown if missing — the image step just silently does nothing.

**Fix:** Show "Add an image generation API key in Settings to enable AI images" when no image provider is configured.

---

### IMP-17: Journey activation needs cron to actually process steps

`activate_journey` sets the journey status to 'active' in the DB, but the `engage-journey-processor` edge function needs to run on a schedule (cron) to actually execute journey steps. If no cron is configured, journeys are "active" but never execute.

**Fix:** Document this in the Engage settings, or add a Supabase cron job for `engage-journey-processor`.

---

### IMP-18: Activity log route is hidden

`/engage/activity` exists but has no sidebar link. Users can't find it unless the AI navigates them there.

**Fix:** Add "Activity" to the Engage section in the sidebar, or make it a tab within one of the existing Engage pages.

---

### IMP-19: Segments should be a tab in Contacts

`/engage/segments` is a separate route with no direct sidebar link. Users find it by navigating from the Contacts page. Would be more intuitive as a tab.

**Fix:** Low priority — current flow works, just not intuitive.

---

### IMP-20: Landing page promises "learns from YOUR results"

The comparison table on the landing page says:
- "Content Quality → Improves specifically for YOU"
- "Learning Capability → Learns from YOUR results"
- "Over Time → Gets exponentially better"
- "Your 100th Post → 300% better than 1st"

None of this is implemented. The AI has a 10-message context window with basic user preferences. There's no feedback loop, no quality improvement tracking, no brand voice accumulation.

**Options:**
1. Remove these claims from the landing page (honest)
2. Build a brand voice profile system (significant effort)
3. Add conversation summarization + user preference learning (medium effort, delivers on "learns" partially)

---

## NEWLY FOUND — March 19 (session 2)

### IMP-21: Empty account → AI hallucinates data

**The problem:** A brand-new user with zero content, zero keywords, zero offerings asks "show my content performance." The AI calls `get_content_items` → gets empty array. But the system prompt says "VISUAL-FIRST: ALWAYS include charts." So the AI may fabricate a chart with fake data to satisfy the prompt instruction, or show an empty chart with no explanation of what to do next.

**What to fix:**
When a read tool returns empty data, the AI should guide the user to create data first instead of showing empty visualizations. Add to the system prompt:

```
EMPTY DATA RULE:
If a read tool returns 0 items, do NOT generate a chart. Instead:
1. Tell the user what's missing: "You don't have any content yet."
2. Suggest the action to fix it: "Try 'Write content' to create your first blog post."
3. Include an action button for the creation tool.
```

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — system prompt module

---

### IMP-22: Campaign generation queue may never process

**The problem:** `trigger_content_generation` inserts items into `content_generation_queue` and fires a non-blocking fetch to `process-content-queue`. But:
1. The fetch is fire-and-forget (`.catch(err => console.error(...))`) — if it fails, items sit in queue forever
2. There's no cron/schedule to process the queue — it only runs when triggered
3. If the edge function times out or errors, pending items are never retried automatically

**What happens:** User says "generate content for my campaign" → sees "Started generation for 5 items" → items never complete → campaign stays in processing state forever.

**What to fix:**
1. After the fire-and-forget trigger, add a follow-up check: if items aren't processed within 60 seconds, show a "Generation may be delayed" message
2. Add a Supabase cron job that runs `process-content-queue` every 5 minutes to pick up stuck items
3. Or: show queue status inline so the user can manually retry

---

### IMP-23: Tool execution has a 10-second timeout — too short for AI generation

**The problem:** `executeToolCall` at line 638 wraps every tool in a 10-second timeout:
```ts
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Tool execution timeout (10s)')), 10000)
);
```

But `generate_full_content` calls `ai-proxy` which calls the AI provider to write a 2000-word article. This easily takes 15-30 seconds. The tool will timeout before the article is generated.

**What to fix:**
Different timeouts per tool category:
- Read tools: 10s (fine)
- Write tools (DB only): 10s (fine)
- AI-calling tools (`generate_full_content`, `create_topic_cluster`, `repurpose_for_social`, `trigger_competitor_analysis`): 60s
- SERP tools (`trigger_serp_analysis`): 30s

```ts
const AI_CALLING_TOOLS = ['generate_full_content', 'create_topic_cluster', 'repurpose_for_social', 'trigger_competitor_analysis'];
const SERP_TOOLS = ['trigger_serp_analysis'];
const timeout = AI_CALLING_TOOLS.includes(toolName) ? 60000
  : SERP_TOOLS.includes(toolName) ? 30000
  : 10000;
```

**File:** `supabase/functions/enhanced-ai-chat/tools.ts` — line 637-639

---

### IMP-24: Shared conversation RLS may leak private conversations

**The problem:** The migration at `20260318122546` creates an RLS policy:
```sql
CREATE POLICY "Anyone can view shared conversations by token"
  ON public.ai_conversations FOR SELECT
  USING (is_shared = true AND share_token IS NOT NULL);
```

This allows SELECT on ANY row where `is_shared=true`. A malicious user could query `ai_conversations` with `is_shared=true` and see ALL shared conversations from ALL users — not just the one matching their token.

**What to fix:** The RLS should only allow access when filtered by `share_token`:
```sql
-- The current policy is too broad. In practice, the frontend always filters by share_token,
-- but the RLS should enforce it at the DB level too.
-- Consider using a function-based policy or adding token matching.
```

The `ai_messages` policy is fine (checks via FK to conversations), but the conversations policy itself is overly permissive. In practice, the frontend always queries with `.eq('share_token', token)`, but a direct Supabase client call could list all shared conversations.

**Severity:** Medium — requires direct API access to exploit, but it's a data leak.

---

### IMP-25: File upload sends content to AI without size limit in the prompt

**The problem:** `ContextAwareMessageInput.tsx` line 71 constructs:
```ts
const fileMessage = `I've uploaded a file: **${analysis.fileName}**\n\nPlease analyze this content:\n${analysis.summary}\n\nKey insights:\n${analysis.insights.map(i => `- ${i}`).join('\n')}`;
```

The `analysis.summary` can be very long for large files. This entire string becomes the user message, which then goes to the AI provider. If the file analysis produces a 50KB summary, the message could blow past the AI's context window, causing either truncation or an API error.

**What to fix:** Truncate `analysis.summary` to a max length (e.g., 4000 characters) before constructing the message.

---

### ~~IMP-26~~ accept_proposal calendar entry — VERIFIED WORKING

Confirmed: `accept_proposal` in `proposal-action-tools.ts` lines 87-105 already creates a `content_calendar` entry with the proposal title, default date (7 days out), and proposal link. No fix needed.

---

### IMP-26 (REPLACED): Destructive tools list is incomplete — 7 delete tools execute without confirmation

**The problem:** The destructive tools guard at `index.ts` line 2820-2824 only blocks 6 tools:
```ts
['delete_content_item', 'delete_solution', 'send_email_campaign', 'send_quick_email', 'toggle_automation', 'activate_journey']
```

These 7 delete/irreversible tools execute WITHOUT confirmation:
- `delete_contact` — deletes a CRM contact permanently
- `delete_segment` — deletes an audience segment
- `delete_email_campaign` — deletes an email campaign
- `delete_journey` — deletes a customer journey
- `delete_automation` — deletes an automation rule
- `delete_social_post` — deletes a social post
- `delete_calendar_item` — removes from editorial calendar
- `publish_to_website` — publishes content live (irreversible)

A user saying "delete all my contacts" or "publish this to my website" would execute immediately with no confirmation card.

**What to fix:** Update the list at line 2820:
```ts
const DESTRUCTIVE_TOOLS = [
  'delete_content_item', 'delete_solution', 'delete_contact',
  'delete_segment', 'delete_email_campaign', 'delete_journey',
  'delete_automation', 'delete_social_post', 'delete_calendar_item',
  'send_email_campaign', 'send_quick_email',
  'toggle_automation', 'activate_journey',
  'publish_to_website'
];
```

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — line 2820-2824

---

### IMP-27: Image generation from chat has no feedback during generation

**The problem:** User clicks "Generate Image" → types prompt → sends. The `generate_image` tool calls the `generate-image` edge function, which can take 10-20 seconds for DALL-E HD images. During this time, the 10-second tool timeout (IMP-23) will kill it, AND there's no progress indication specific to image generation.

**What to fix:**
1. Increase timeout for `generate_image` tool (part of IMP-23)
2. The edge function should return progress events if possible
3. At minimum, the tool response should say "Generating image, this may take 15-20 seconds..."

---

### IMP-28: Engage workspace creation is silent — user doesn't know it happened

**The problem:** When user does "create a contact" or "send an email" for the first time, the tool auto-creates an Engage workspace via `ensure_engage_workspace` RPC. This happens silently. The user doesn't know a workspace was created, what it is, or that they now have CRM/email functionality.

**What to fix:** After auto-creating a workspace, include in the tool response: "I've set up your Engage workspace. You can now manage contacts, email campaigns, and automations from the sidebar."

---

### IMP-29: Web search fails silently when no SERP key — but only if NOT forced

**The problem:** In `index.ts` line 2227-2231, when web search is triggered automatically (not via the Web Search button) and no SERP key exists, the code does nothing — `webSearchContext` stays empty, and the AI responds using only training data. The user asked a current-events question and got stale data with no indication why.

But when forced via the Web Search button (`forceWebSearch=true`), it correctly shows "Web search was requested but no SERP API key is configured."

**What to fix:** Even for auto-detected web search intent, add a note:
```ts
if (!serpApiKey) {
  webSearchContext = '\n\nNote: For the most up-to-date information, add a SerpAPI key in Settings → API Keys to enable live web search.\n';
}
```

---

### IMP-30: `trigger_competitor_analysis` calls non-existent edge function

**The problem:** `offerings-action-tools.ts` line 295 calls `competitor-analyzer` edge function. This function does NOT exist in `supabase/functions/`. The call is fire-and-forget so it silently fails. User sees "Started competitor analysis. Check back for results." but results never appear.

**What to fix:** Either:
1. Create the `competitor-analyzer` edge function
2. Or use the existing `competitor-intel` edge function instead
3. Or return honest messaging: "Competitor analysis automation is coming soon."

**File:** `supabase/functions/enhanced-ai-chat/offerings-action-tools.ts` — line 295

---

### IMP-31: Fire-and-forget edge function calls with no verification

**The problem:** Several tools trigger other edge functions via `fetch().catch()`:
- `trigger_content_generation` → `process-content-queue`
- `retry_failed_content` → `process-content-queue`
- `trigger_competitor_analysis` → `competitor-analyzer` (doesn't exist!)

If the fetch fails, the user is told "Started!" but nothing happens. No follow-up check.

**What to fix:** After triggering, verify the operation started. If not, tell the user there was an issue instead of fake success.

---

### IMP-32: Destructive tools list is incomplete — 7 delete tools execute without confirmation

**The problem:** The guard at `index.ts` line 2820 only blocks 6 tools. These execute immediately with NO confirmation:
`delete_contact`, `delete_segment`, `delete_email_campaign`, `delete_journey`, `delete_automation`, `delete_social_post`, `delete_calendar_item`, `publish_to_website`

**What to fix:** Add all delete tools + `publish_to_website` to the `DESTRUCTIVE_TOOLS` array at line 2820.

---

### IMP-33: Image generation tool may not find provider in `ai_service_providers`

**The problem:** `image-generation-tools.ts` checks `ai_service_providers` for the image provider, but image keys may only be in `api_keys` table without an `ai_service_providers` entry.

**What to fix:** Check `api_keys` as fallback, or auto-create the provider entry when a key is saved.

---

### IMP-34: `content_to_email` puts raw markdown as email HTML

**The problem:** `cross-module-tools.ts` line 217 sets `body_html: content.content` directly. Repository content is markdown/mixed HTML — emails will look broken.

**What to fix:** Wrap in basic email styling or convert markdown to email-safe HTML.

---

## COMPLETED ITEMS

_(Move items here when fixed)_

- ~~Anthropic auth header~~ — Fixed
- ~~Params spread in ai-proxy~~ — Fixed
- ~~CORS URL typo~~ — Fixed
- ~~Email encrypted key~~ — Fixed
- ~~SERP service name 'serpapi'~~ — Fixed
- ~~Provider key lookup in enhanced-ai-chat~~ — Fixed (self-healing fallback)
- ~~SSE streaming~~ — Fixed (progress events + done event)
- ~~Fast-path SSE mismatch~~ — Fixed
- ~~URL/key fallbacks~~ — Fixed
- ~~Action buttons dead routes~~ — Fixed
- ~~Settings consolidation~~ — Fixed (one popup, dead pages deleted)
- ~~Dead code cleanup~~ — Fixed (content-builder, enterprise, old hooks)
- ~~generate_full_content API key~~ — Fixed
- ~~create_topic_cluster API key~~ — Fixed
- ~~repurpose_for_social API key~~ — Fixed
- ~~Cross-module workspace auto-creation~~ — Fixed
- ~~Social poster status mismatch~~ — Fixed
- ~~XSS in panels~~ — Fixed (DOMPurify)
- ~~Quick action hardcoded keyword~~ — Fixed
- ~~All `/research/` stale references~~ — Fixed
