# AI Chat — Fixes & Corrections for Lovable.dev

> This document covers everything broken, silently failing, or misrepresented in the AI Chat system specifically. For general platform bugs, see `LOVABLE-IMPLEMENTATION-GUIDE.md`.

---

## DOCUMENT vs REALITY — What the Technical Doc Claims vs What the Code Does

The AI Chat technical document (provided by the team) contains several claims that don't match the actual code. These need to be fixed in the codebase to match what's promised.

---

## FIX 1: AI Chat Has No Streaming (the #1 UX problem)

**What the doc says:**
- Section 2 architecture diagram: "SSE (chunk-based streaming)"
- Section 3 step 8: "Backend: Response Streaming — Streams the final response chunk-by-chunk via SSE"
- Section 11: "Streams the final response via SSE with chunk-based delivery"

**What the code actually does:**
- `supabase/functions/enhanced-ai-chat/index.ts` line 3272: `return new Response(JSON.stringify(responseData), { headers: { ...corsHeaders, "Content-Type": "application/json" } })` — every response is plain JSON
- `src/hooks/useEnhancedAIChatDB.ts` line 405: `supabase.functions.invoke('enhanced-ai-chat', ...)` — regular POST, not SSE
- Every single response path in the 3,288-line `enhanced-ai-chat/index.ts` returns `Content-Type: application/json`
- A separate `ai-streaming` edge function (`supabase/functions/ai-streaming/index.ts`) exists with real SSE, but the main chat path never uses it

**User impact:** Users stare at a loading spinner for 5-30 seconds per message. For tool-call chains (article generation, SERP analysis + content creation), waits exceed 30 seconds with zero feedback.

**What to fix:**

Option A (recommended — hybrid):
1. For simple messages (no tool calls needed): route through `ai-streaming` which already has working SSE
2. For tool-call messages (data queries, write operations): keep `enhanced-ai-chat` but show real-time progress indicators for each tool execution step
3. Frontend detects which path based on query analysis or tries streaming first

Option B (simpler — progress events):
1. Keep `enhanced-ai-chat` as the only path
2. Convert it from single JSON response to `ReadableStream` that sends progress events:
   - After query analysis: `{ "type": "progress", "step": "Analyzing your request..." }`
   - After each tool call: `{ "type": "progress", "step": "Fetching your content data..." }`
   - Final response: `{ "type": "complete", "message": "...", "visualData": {...} }`
3. Frontend reads the stream and updates the placeholder message with each progress event

Option C (minimum viable — fast):
1. Don't change the backend
2. In `useEnhancedAIChatDB.ts`, update the placeholder message to show meaningful loading text instead of empty:
```ts
const placeholderMessage: EnhancedChatMessage = {
  id: assistantId,
  role: 'assistant',
  content: '🔍 Analyzing your request and fetching relevant data...',
  timestamp: new Date()
};
```
3. The `ThinkingTextRotator` component already exists — make sure it's visible during the wait

**Files involved:**
- `src/hooks/useEnhancedAIChatDB.ts` — lines 386-462 (sendMessage function)
- `supabase/functions/enhanced-ai-chat/index.ts` — response handling
- `supabase/functions/ai-streaming/index.ts` — existing SSE implementation (reference)
- `src/components/ai-chat/ThinkingTextRotator.tsx` — loading state component

---

## FIX 2: Email Sending Uses Encrypted Key Without Decrypting

**What happens:** User configures Resend API key → key is encrypted and stored → `engage-email-send` edge function reads `encrypted_key` column directly and passes the encrypted ciphertext blob to Resend as the API key → Resend rejects it → email fails silently.

**File:** `supabase/functions/engage-email-send/index.ts` — line 31

**The bug:**
```ts
const { data: keyRow } = await supabase
  .from("api_keys")
  .select("encrypted_key")
  .eq("user_id", owner.user_id)
  .eq("service", "resend")
  .eq("is_active", true)
  .single();

return keyRow?.encrypted_key || null;  // <-- Returns encrypted blob, not plaintext
```

**The fix:**
```ts
// Import the shared decryption service used by other edge functions
const { getApiKey } = await import('../shared/apiKeyService.ts');
const decryptedKey = await getApiKey('resend', owner.user_id);
return decryptedKey;
```

The `shared/apiKeyService.ts` already handles decryption with the server-side encryption key and is used by `ai-proxy` and other edge functions.

**Verify:** Configure Resend key → create email campaign → send it → email actually delivers.

---

## FIX 3: SERP Analysis Fails Silently Without API Key

**What happens:** User clicks "Research keywords" quick action or asks "analyze keyword X" → AI calls `trigger_serp_analysis` tool → tool tries to call SERP API → no key configured → returns generic error string → AI shows vague "I couldn't complete the analysis" message → user has no idea they need to add a SERP API key.

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — inside the `trigger_serp_analysis` execution handler

**The fix:** When no SERP key is found, return a structured response that the AI can present clearly:

```ts
if (!serpApiKey) {
  return JSON.stringify({
    success: false,
    error: 'SERP API key not configured',
    userMessage: 'To run SERP analysis, you need to add a SerpAPI or Serpstack API key. You can get one at serpapi.com (free tier available).',
    action: {
      type: 'button',
      label: 'Open Settings',
      action: 'navigate:/ai-settings',
      variant: 'primary'
    }
  });
}
```

Also update the system prompt to instruct the AI: "If a tool returns an error with a `userMessage` field, show that message to the user verbatim along with any action buttons."

---

## FIX 4: Email Send Fails Silently Without Resend Key

**Same pattern as Fix 3.**

**Files:**
- `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` — `send_email_campaign` and `send_quick_email` handlers

**The fix:** Same approach — detect missing key, return clear message with settings link:

```ts
if (!resendKey) {
  return JSON.stringify({
    success: false,
    error: 'Email provider not configured',
    userMessage: 'To send emails, add your Resend API key in Settings. Get a free key at resend.com.',
    action: {
      type: 'button',
      label: 'Configure Email',
      action: 'navigate:/ai-settings',
      variant: 'primary'
    }
  });
}
```

---

## FIX 5: Social Posting Is a Stub (fake success)

**What happens:** User says "post this to LinkedIn" → AI calls `create_social_post` + `schedule_social_post` → records are created in DB → `engage-social-poster` edge function marks them as "posted" with `stub_${Date.now()}` → user sees "Posted successfully!" → nothing was actually posted anywhere.

**File:** `supabase/functions/engage-social-poster/index.ts` — line 53

```ts
// Stub: mark as posted (real integration would call provider API)
await supabase.from("social_post_targets").update({
  status: "posted",
  provider_post_id: `stub_${Date.now()}`,
}).eq("id", target.id);
```

**The fix (honest approach):**

1. In the AI chat tool responses for `create_social_post`, `schedule_social_post`, and `repurpose_for_social`, append to the response:
```
Note: Your social post has been saved as a draft. Direct publishing to social platforms is coming soon — for now, you can copy the content and post manually.
```

2. In the social dashboard UI (`src/components/engage/social/SocialDashboard.tsx`), add a banner:
```
Social publishing integration is coming soon. Posts are saved as drafts for manual publishing.
```

3. In `engage-social-poster`, change the stub to NOT mark posts as "posted":
```ts
// No real integration yet — leave as scheduled, don't fake success
await supabase.from("social_post_targets").update({
  status: "pending_integration",
  error: "Social platform integration not yet configured",
}).eq("id", target.id);
```

---

## FIX 6: Write Action Confirmations Not Enforced

**What the doc says (Section 7):**
> "All write operations display an ActionConfirmationCard in the chat requiring explicit user approval before execution."
> "Cross-Module Chain Confirmation: When a user request requires 2+ sequential write tools, the AI executes only the first..."

**What actually happens:** These are prompt instructions only. The AI can and does execute `delete_content_item`, `delete_contact`, etc. without showing a confirmation card. The confirmation infrastructure exists in the frontend (`pendingConfirmation` state, `ActionConfirmationCard` component, `handleConfirmAction`/`handleCancelAction`) but nothing triggers it reliably.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — tool execution loop

**The fix:**

Define destructive tools that MUST require confirmation:
```ts
const DESTRUCTIVE_TOOLS = [
  'delete_content_item', 'delete_solution', 'delete_contact',
  'delete_segment', 'delete_email_campaign', 'delete_journey',
  'delete_automation', 'delete_social_post', 'delete_calendar_item',
  'send_email_campaign', 'send_quick_email',
  'publish_to_website'
];
```

In the tool execution loop, before executing a destructive tool, return a confirmation request instead:
```ts
if (DESTRUCTIVE_TOOLS.includes(toolCall.function.name)) {
  // Don't execute — return confirmation request
  const confirmationResponse = {
    message: `I need your confirmation before I ${toolCall.function.name.replace(/_/g, ' ')}. This action cannot be undone.`,
    confirmationData: {
      toolName: toolCall.function.name,
      toolArgs: JSON.parse(toolCall.function.arguments),
      requiresConfirmation: true
    }
  };
  // Break the tool loop and return the confirmation
  return confirmationResponse;
}
```

The frontend already has `ActionConfirmationCard` rendering logic — it just needs the `confirmationData` field in the response to trigger it.

---

## FIX 7: Conversation Context Limited to Last 10 Messages

**What happens:** `src/hooks/useEnhancedAIChatDB.ts` line 400:
```ts
const conversationHistory = [...messages, userMessage].slice(-10).map(m => ({
  role: m.role,
  content: m.content
}));
```

Only the last 10 messages are sent to the AI. In a long conversation, the AI completely loses context from earlier messages.

**This is a known trade-off** (token cost), not a bug. But the landing page promises "learns from YOUR results" and "gets exponentially better" — which implies persistent memory, not a 10-message window.

**Recommended improvements (in priority order):**

1. **Conversation summary (medium effort):** After every 10 messages, use the AI to generate a 2-3 sentence summary of the conversation so far. Prepend this summary as a system message so the AI always has context, even beyond the 10-message window.

2. **Smart context selection (lower effort):** Instead of blindly taking the last 10, take the first message (original intent) + last 8 + any messages the user pinned/starred.

3. **Brand voice persistence (higher effort):** Store a user's "brand voice profile" that accumulates from approved content, user edits, and feedback signals. Inject this into every conversation as system context. This would deliver on the "learns from YOUR results" promise.

---

## FIX 8: SerpAPI Test Calls API Directly From Browser

**What happens:** `src/utils/apiKeyTestUtils.ts:120` calls `fetch('https://serpapi.com/search?api_key=...')` from the browser. SerpAPI blocks CORS, so the test always fails. The API key is also visible in the URL in DevTools.

**The fix:** Route through the existing edge function:
```ts
const { data, error } = await supabase.functions.invoke('api-proxy', {
  body: { service: 'serp', endpoint: 'test', apiKey: cleanKey }
});
```

---

## PRIORITY ORDER

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| **P0** | Fix 1: No streaming / blocking waits | Every user, every message | 2-4 hours (Option B/C) |
| **P0** | Fix 2: Email encrypted key not decrypted | All email sending broken | 10 min |
| **P1** | Fix 3: SERP missing key messaging | Users confused why research fails | 15 min |
| **P1** | Fix 4: Email missing key messaging | Users confused why email fails | 15 min |
| **P1** | Fix 5: Social posting stub honesty | Users think posts are published | 30 min |
| **P1** | Fix 6: Write confirmation enforcement | Safety risk — data can be deleted without asking | 1 hour |
| **P2** | Fix 7: Conversation context limits | Context lost in long chats | 1-2 hours |
| **P2** | Fix 8: SerpAPI browser test | Test always fails | 10 min |

---

## TESTING CHECKLIST

### Streaming / Loading
- [ ] Send a simple message → response appears progressively (not after 10s blank wait)
- [ ] Send a tool-call message ("show my content") → see progress indicator during tool execution
- [ ] Send a complex message ("create a blog post about X") → progress visible during generation

### Email
- [ ] Configure Resend key in Settings → key is stored encrypted
- [ ] Send email via chat → email actually delivers (not auth error)
- [ ] Try to send email without Resend key → clear message with Settings link

### SERP / Keywords
- [ ] Ask "analyze keyword X" without SERP key → clear message with Settings link
- [ ] Ask "analyze keyword X" with SERP key → analysis runs and results shown
- [ ] Test SERP key in Settings → test works (not CORS error)

### Social
- [ ] Schedule social post via chat → see "draft saved, publishing coming soon" messaging
- [ ] Check social dashboard → no fake "posted" status on unposted content

### Safety
- [ ] Ask AI to "delete my latest blog post" → confirmation card appears BEFORE deletion
- [ ] Ask AI to "send this email to all contacts" → confirmation card appears BEFORE send
- [ ] Cancel a confirmation → action is not executed

### Context
- [ ] Have 15+ message conversation → AI still remembers the topic from early messages
