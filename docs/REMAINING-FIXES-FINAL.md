# Creaiter — Remaining Fixes (Final Sweep)

> **Date:** 2026-03-15
> **Context:** After 5 rounds of fixes by Lovable, this is a fresh audit of everything still open — bugs, silent failures, dead code, and UX gaps. Each item has exact files, root cause, and fix instructions.

---

## SUMMARY

| Priority | Count | Description |
|----------|-------|-------------|
| **P0** | 3 | Blocking — feature completely broken |
| **P1** | 8 | Silent failure — looks like it works but doesn't |
| **P2** | 5 | UX / code quality issues |
| **P3** | 4 | Dead code / cleanup |
| **Total** | **20** | |

---

## P0 — BLOCKING

### P0-0: AI Chat "Failed to send message" — Provider Key Lookup Broken

**Impact:** The AI Chat fails on almost every message with "Failed to send message". This is the most critical bug — the entire chat is non-functional.

**Root cause:** The `enhanced-ai-chat` edge function reads API keys from `ai_service_providers.api_key` (plaintext column). But this column is often empty because:
1. New encryption flow stores keys in the `api_keys` table (encrypted)
2. The plaintext sync to `ai_service_providers` only happens when `toggleApiKeyStatus()` runs successfully
3. If the sync failed, was skipped, or the key was added through a different path, `ai_service_providers.api_key` is null
4. The edge function filters out providers with empty `api_key` → "No active AI provider" → frontend shows "Failed to send message"

**Evidence:**
- `supabase/functions/enhanced-ai-chat/index.ts` lines 1716-1729: filters providers where `p.api_key && p.api_key.trim() !== ''`
- `supabase/functions/enhanced-ai-chat/index.ts` lines 1731-1742: returns 400 error "No active AI provider found"
- `src/hooks/useEnhancedAIChatDB.ts` lines 491-501: catches error and shows "Failed to send message" toast

**Fix:** The edge function should NOT read API keys from `ai_service_providers`. It should use the secure `shared/apiKeyService.ts` to decrypt keys from the `api_keys` table — the same way `ai-proxy` already does as a fallback.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — lines 1697-1750

Replace the current provider lookup + key validation block with:

```ts
// 2. Get the single active AI service provider
const { data: allProviders, error: providerError } = await supabase
  .from('ai_service_providers')
  .select('provider, preferred_model, status, priority')  // DON'T select api_key
  .eq('user_id', user.id)
  .eq('status', 'active')
  .limit(1);

if (providerError) {
  console.error("❌ Error fetching providers:", providerError);
  return new Response(JSON.stringify({ error: "Failed to fetch AI providers" }), {
    status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// 3. Filter providers with valid models
const validProviders = (allProviders || []).filter(p => {
  return p.preferred_model && p.preferred_model.trim() !== '';
});

if (validProviders.length === 0) {
  return new Response(JSON.stringify({
    error: "No AI provider configured. Please add and test an API key in Settings → AI Service Hub."
  }), {
    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const provider = validProviders[0];

// 4. Get the API key from the secure encrypted store
const { getApiKey } = await import('../shared/apiKeyService.ts');

// Check OpenRouter in user_llm_keys first (legacy path)
let apiKey: string | null = null;
if (provider.provider === 'openrouter' && openrouterKey) {
  apiKey = openrouterKey;
} else {
  apiKey = await getApiKey(provider.provider, user.id);
}

if (!apiKey) {
  return new Response(JSON.stringify({
    error: `No API key found for ${provider.provider}. Please add your key in Settings → AI Service Hub.`
  }), {
    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Attach decrypted key for use in ai-proxy calls
provider.api_key = apiKey;

console.log(`🔑 Using active provider: ${provider.provider} (model: ${provider.preferred_model})`);
```

This also fixes the security issue (P1-1) by no longer relying on plaintext keys in `ai_service_providers`.

**ALSO update the campaign strategy fast path** (line ~1772) which also uses `provider.api_key` — after the fix above, this will automatically use the decrypted key.

**Verify:** Open AI Chat → send any message → should get an AI response instead of "Failed to send message".

---

### P0-0b: SSE Streaming Broken — Fast-Path Bypasses Stream + Missing URL Fallbacks

**Impact:** Lovable added SSE streaming to `enhanced-ai-chat`, but it's broken. Simple messages like "hi" or "thanks" return nothing — the user sees "Analyzing..." then the message disappears. Three bugs:

**Bug A: Fast-path returns plain JSON even when `stream: true`**

File: `supabase/functions/enhanced-ai-chat/index.ts` — lines 1662-1681

`streamMode` is extracted at line 1644, but the conversational fast-path at line 1662 returns a plain JSON `Response` BEFORE reaching the SSE dispatch at line 3259. The frontend SSE parser can't find `event: done` lines in plain JSON, so `response` stays null and line 495 throws "No response received from AI".

Fix — make the fast-path respect `streamMode`:

```ts
if (queryIntent.isConversational) {
  console.log('⚡ FAST-PATH: Conversational query detected');
  const conversationalResponse = generateConversationalResponse(userQuery);

  const responseData = {
    message: conversationalResponse,
    content: conversationalResponse,
    fastPath: true,
    queryType: 'conversational',
    metadata: { processed_at: new Date().toISOString(), has_actions: false, has_visual_data: false }
  };

  // Respect stream mode
  if (streamMode) {
    const enc = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(enc.encode(`event: done\ndata: ${JSON.stringify(responseData)}\n\n`));
        controller.close();
      }
    });
    return new Response(readable, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
    });
  }

  return new Response(JSON.stringify(responseData), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
```

**Bug B: No URL/key fallbacks in frontend**

File: `src/hooks/useEnhancedAIChatDB.ts` — lines 428-429

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

If these env vars aren't set, the fetch URL becomes `undefined/functions/v1/enhanced-ai-chat`.

Fix:
```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA';
```

These are the same values hardcoded in `src/integrations/supabase/client.ts` — the anon key is public by design.

**Bug C: SSE parser has no JSON fallback**

File: `src/hooks/useEnhancedAIChatDB.ts` — line 495

If the backend returns plain JSON (e.g., an error response or the unfixed fast-path), the SSE parser reads it as text, finds no `event:` lines, and `response` stays null. Line 495 throws "No response received from AI".

Fix — after the SSE while loop (line 493), add a JSON fallback:

```ts
// After the while loop, before the null check:
if (!response && textBuffer.trim()) {
  try {
    response = JSON.parse(textBuffer);
  } catch {
    // Not valid JSON either — truly no response
  }
}

if (!response) throw new Error('No response received from AI');
```

**Verify:**
1. Send "hi" → get a conversational response (not blank/error)
2. Send "show my content" → get data response with real progress events
3. Works on production even without explicit env vars

---

### P0-1: SSE Streaming Added But Not Yet Token-Level (downgraded to P2)

**Status:** Lovable added SSE streaming with real progress events (`event: progress` with stages like "Analyzing...", "Fetching data..."). The frontend now uses `fetch()` with SSE parsing instead of `supabase.functions.invoke()`. This is a major improvement.

**Remaining gap:** The AI response text still arrives as a single `event: done` blob — there's no token-by-token streaming. Users see real progress stages but still wait for the full AI text before it appears. This is acceptable for now — the progress events provide meaningful feedback.

**Future improvement:** Stream the AI response tokens from `ai-proxy` back through `enhanced-ai-chat` as `event: token` events. This requires the AI provider call to use streaming mode and pipe tokens through the ReadableStream.

**Fix — Option A (recommended): Hybrid approach**

1. Use `ai-streaming` for the text response portion (real SSE, tokens appear as they generate)
2. When tool calls are needed, the streaming function detects this and returns a `tool_required` signal
3. Client then calls `enhanced-ai-chat` for tool execution only, and streams the final AI response via `ai-streaming`

This requires:
- Modifying `ai-streaming` to support the same system prompt and context injection as `enhanced-ai-chat`
- Adding tool detection logic to `ai-streaming`
- Frontend changes to handle the two-phase flow

**Fix — Option B (simpler): Convert enhanced-ai-chat to SSE**

Change `enhanced-ai-chat/index.ts` to return a `ReadableStream` with `text/event-stream`:

```ts
// Instead of building full response then returning JSON:
const stream = new ReadableStream({
  async start(controller) {
    const encoder = new TextEncoder();

    // Send progress events as tools execute
    function sendEvent(data: any) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    }

    sendEvent({ type: 'progress', step: 'Analyzing query...' });
    // ... query analysis ...

    sendEvent({ type: 'progress', step: 'Fetching your data...' });
    // ... tool execution ...

    // Stream AI response tokens
    sendEvent({ type: 'token', content: '...' });

    // Final complete event
    sendEvent({ type: 'complete', message: finalContent, visualData, actions });
    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    controller.close();
  }
});

return new Response(stream, {
  headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
});
```

Frontend changes in `useEnhancedAIChatDB.ts`:
- Replace `supabase.functions.invoke()` with direct `fetch()` to the edge function URL
- Read the SSE stream using `response.body.getReader()` (same pattern as `useStreamingAI.ts`)
- Update placeholder message content with each progress/token event

**Fix — Option C (minimum): Better fake progress**

If streaming is too complex right now, at least make the progress indicators useful:
1. Show a timer: "Processing... (8s)" so users know it's still working
2. Remove the fake step rotation — just show one honest message: "Generating response, this may take up to 30 seconds..."
3. Add a cancel button that aborts the request

**Files involved:**
- `supabase/functions/enhanced-ai-chat/index.ts` — all response paths
- `src/hooks/useEnhancedAIChatDB.ts` — lines 386-490 (sendMessage)
- `supabase/functions/ai-streaming/index.ts` — reference for SSE pattern
- `src/hooks/useStreamingAI.ts` — reference for client-side SSE consumption

---

### P0-2: SERP Analysis Tool Uses Wrong Service Name — Always Fails

**Impact:** When a user asks the AI to analyze a keyword (e.g., "analyze keyword content marketing"), the `trigger_serp_analysis` tool checks for a SERP API key using `getApiKey('serpapi', userId)`. But keys are stored with `service = 'serp'` (not `'serpapi'`). The shared `getApiKey` function does NOT normalize this. So even users who HAVE a SERP key configured will be told "No SerpAPI key configured."

**Evidence:**
- `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` line 164: `getApiKey('serpapi', userId)`
- `supabase/functions/shared/apiKeyService.ts` line 79: `WHERE service = 'serpapi'` — no normalization
- Other edge functions use `getApiKey('serp', userId)` correctly (e.g., `company-intel/index.ts:135`, `solution-intel/index.ts:287`)
- Client-side `apiKeyService.ts` normalizes `'serpapi'` → `'serp'`, but the edge function shared service does not

**File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — line 164

**Fix:**

Change:
```ts
const serpKey = await getApiKey('serpapi', userId);
```

To:
```ts
const serpKey = await getApiKey('serp', userId);
```

This matches the pattern used by every other edge function that looks up SERP keys.

**Also fix the shared service** (`supabase/functions/shared/apiKeyService.ts`) to normalize as a safety net. At the top of `getApiKey()`:

```ts
export async function getApiKey(service: string, userId?: string): Promise<string | null> {
  // Normalize service aliases
  const normalizedService = service === 'serpapi' ? 'serp' : service;

  // ... rest uses normalizedService instead of service
```

**Verify:** Ask the AI "analyze keyword 'content marketing'" with a SERP key configured. Should run analysis instead of showing "No SerpAPI key."

---

## P1 — SILENT FAILURES

### P1-1: Plaintext API Keys Written to ai_service_providers Table

**Impact:** When a user toggles an AI provider active, `apiKeyService.ts:toggleApiKeyStatus()` decrypts the API key and writes the plaintext into `ai_service_providers.api_key`. This defeats the entire encryption system. Anyone with Supabase dashboard access sees raw API keys.

**Files:**
- `src/services/apiKeyService.ts` — lines 418-431 (update path), lines 444-471 (insert path)

**Fix:** Stop syncing plaintext keys to `ai_service_providers`. Edge functions already use `shared/apiKeyService.ts` to decrypt from `api_keys` directly. Remove these lines:

Lines 418-431 — remove the `if (isActive && apiKeyData)` block that decrypts and sets `updateData.api_key`.

Lines 444-468 — in the insert path, remove `api_key: plainTextKey` from the insert object.

The `ai_service_providers` table should only store metadata (status, model, priority) — never keys.

---

### P1-2: Email Builder BlockRenderer Has Unsanitized HTML

**Impact:** Two `dangerouslySetInnerHTML` usages in the email builder render raw content without DOMPurify:
- Line 182: `dangerouslySetInnerHTML={!isSelected ? { __html: p.content } : undefined}` — text blocks
- Line 252: `dangerouslySetInnerHTML={{ __html: col.content || '' }}` — column blocks

The content comes from user-editable email templates. While this is an internal email builder (not public-facing), it's still an XSS vector if a user's templates are compromised or imported.

**File:** `src/components/engage/email/builder/BlockRenderer.tsx` — lines 182, 252

**Fix:**

Add import:
```ts
import DOMPurify from 'dompurify';
```

Line 182:
```ts
dangerouslySetInnerHTML={!isSelected ? { __html: DOMPurify.sanitize(p.content || '') } : undefined}
```

Line 252:
```ts
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(col.content || '') }}
```

---

### P1-3: HubSpot API Key Sent From Browser

**Impact:** `src/services/marketingIntegrationHooks.ts` sends the HubSpot API key directly from the browser in the `Authorization: Bearer` header when calling `https://api.hubapi.com`. The key is visible in DevTools Network tab.

**File:** `src/services/marketingIntegrationHooks.ts` — `sendToHubSpot` method (~line 250)

**Fix:** Route HubSpot API calls through a Supabase edge function. The edge function retrieves the key server-side and makes the API call. The client only sends `{ provider: 'hubspot', action: 'create_note', data: {...} }`.

For now, at minimum: add a comment and toast warning that HubSpot integration requires server-side configuration for security.

---

### P1-4: .gitignore Missing .env Files

**Impact:** If anyone creates `.env`, `.env.local`, or `.env.production` with secrets, they'll be committed to git.

**File:** `.gitignore`

**Fix:** Add:
```
.env
.env.*
.env.local
.env.production
```

---

### P1-5: Social Poster Activity Log Shows Wrong Status

**Impact:** In `engage-social-poster/index.ts`, when social posting fails (which it always does since there's no real integration), the activity log entry uses `allPosted ? "social_posted" : "social_failed"`. But since the stub now sets `pending_integration` instead of `posted`, `allPosted` is always `false`, so the log always says `"social_failed"` — which is misleading. It should say something like `"social_pending"`.

**File:** `supabase/functions/engage-social-poster/index.ts` — lines 73-78

**Fix:**

Change:
```ts
type: allPosted ? "social_posted" : "social_failed",
message: `Social post ${allPosted ? "published" : "failed"}: ${post.content.substring(0, 60)}`,
```

To:
```ts
type: "social_pending",
message: `Social post saved (publishing integration coming soon): ${post.content.substring(0, 60)}`,
```

---

## P2 — UX / CODE QUALITY

### P2-1: Dead LM Studio Handler Code in ai-proxy

**Impact:** The switch case at line 87-93 returns an error before reaching the LM Studio handlers. But the handler functions (`handleLMStudio`, `testLMStudio`, `chatLMStudio` at lines 825-928) are still in the file — ~100 lines of dead code.

**File:** `supabase/functions/ai-proxy/index.ts` — lines 825-928

**Fix:** Delete the 3 functions: `handleLMStudio`, `testLMStudio`, `chatLMStudio`. They're unreachable.

---

### P2-2: Conversation Context Only 10 Messages (no summarization)

**Impact:** `useEnhancedAIChatDB.ts` line 419-424 sends the first message + last 9 to the AI. In a 20+ message conversation, the AI has no idea what was discussed in messages 2-11. The landing page promises "learns from YOUR results" and "gets exponentially better" — but the AI has a 10-message memory window.

**File:** `src/hooks/useEnhancedAIChatDB.ts` — lines 416-425

**Fix (recommended): Conversation summarization**

After every 10 messages, generate a 2-3 sentence summary and prepend it as a system message:

```ts
let conversationHistory: Array<{ role: string; content: string }>;

if (allMessages.length <= 10) {
  conversationHistory = allMessages.map(m => ({ role: m.role, content: m.content }));
} else {
  // Get or generate conversation summary
  const summary = await getOrCreateConversationSummary(conversationId, allMessages.slice(0, -9));

  const summaryMessage = { role: 'system', content: `Previous conversation context: ${summary}` };
  const recentMessages = allMessages.slice(-9).map(m => ({ role: m.role, content: m.content }));
  conversationHistory = [summaryMessage, ...recentMessages];
}
```

The summary can be stored in the `ai_conversations` table (add a `summary` column) and regenerated when it becomes stale.

**Simpler alternative:** Just increase from 10 to 20 messages. Token cost increases but context improves significantly:
```ts
const recent = allMessages.slice(-19);
```

---

### P2-3: Glossary References Still in Code

**Impact:** The GlossaryBuilder files were deleted, but 5 files still reference it:
- `src/App.tsx:22` — comment only, harmless
- `src/components/repository/ContentDetailModal.tsx:246,258,276,277` — handles `content_type === 'glossary'` and tries to navigate to `/glossary-builder`
- `src/components/repository/EmptyState.tsx` — may reference glossary
- `src/components/repository/RepositoryDetailView.tsx` — may reference glossary
- `src/components/layout/NavItems.tsx:157` — includes `/glossary-builder` in nav items list

**Fix:** In `ContentDetailModal.tsx`, the glossary navigation at line 277 (`navigate('/glossary-builder?edit=${content.id}')`) will navigate to a route that redirects to `/ai-chat`. The icon/color mappings at lines 246, 258 are harmless. But the navigation should be updated to go directly to `/ai-chat` or removed. In `NavItems.tsx`, remove `/glossary-builder` from the array.

---

### P2-4: ContentRepurposing Components Still Exist

**Impact:** The page files (`src/pages/ContentRepurposing.tsx`, `src/pages/content-repurposing/`) were deleted, but the component directory `src/components/content-repurposing/` still has ~15 files. Some are imported by `ContentRepurposingModal.tsx` and `ContentDetailModal.tsx` in the repository, so they may still be in use.

**Files:** `src/components/content-repurposing/` — ~15 files

**Fix:** Audit which components are still imported:
- `src/components/repository/ContentRepurposingModal.tsx` — likely the primary consumer
- If the modal still works and is accessible from the Repository page, these files should stay
- If the modal is also dead, delete the entire `content-repurposing/` directory

---

## P3 — CLEANUP

### P3-1: 1,143 Console.log Calls in Services

**Impact:** 1,143 `console.log/warn/error` calls across 131 service files ship in production. Performance overhead + internal info leaks in browser DevTools.

**Fix:** Add to `vite.config.ts`:
```ts
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
},
```

This strips all console calls from production builds while keeping them in development.

---

### P3-2: Dead LM Studio Code (100 lines)

Same as P2-1. Delete `handleLMStudio`, `testLMStudio`, `chatLMStudio` from `supabase/functions/ai-proxy/index.ts` (lines 825-928).

---

### P3-3: Supabase Client Hardcoded URL

**Impact:** `src/integrations/supabase/client.ts` hardcodes the Supabase URL and anon key. This is the Lovable default pattern and is fine for the anon key (it's public by design). However, some files use `import.meta.env.VITE_SUPABASE_URL` and others use the hardcoded value, creating inconsistency.

**File:** `src/integrations/supabase/client.ts` — lines 5-6

**Fix:** Low priority — this is Lovable's auto-generated file. If you ever need to change projects, you'd need to update this file. The inconsistency between env var and hardcoded URL doesn't cause bugs since they resolve to the same value.

---

## FINDINGS FROM LIVE WALKTHROUGH (Antigravity Audit, March 15)

> The live audit scored the app **4.2/10**. The `enhanced-ai-chat` edge function returned HTTP 500 on every single message. 42 of 65 tests were blocked. Full report: `/Users/URK/Downloads/walkthrough.md`

### P1-6: No Error UI When Backend Fails

**Impact:** When `enhanced-ai-chat` returns 500, the loading spinner clears but NO error message is shown. The user sees their message, then... nothing. No toast, no retry button, no indication anything went wrong. The placeholder message is silently removed.

**File:** `src/hooks/useEnhancedAIChatDB.ts` — lines 491-505

**Current behavior:**
```ts
} catch (error) {
  clearInterval(progressInterval);
  console.error('Error sending enhanced message:', error);
  setMessages(prev => prev.filter(m => m.id !== assistantId)); // Silently remove placeholder
  toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
}
```

The toast fires but it's easily missed — it appears briefly in the corner. And the placeholder message vanishes, leaving no trace of the failure in the conversation.

**Fix:** Instead of removing the placeholder, replace it with an error message + retry button:

```ts
} catch (error: any) {
  clearInterval(progressInterval);
  console.error('Error sending enhanced message:', error);

  // Show error in the conversation with retry action
  const errorMessage: EnhancedChatMessage = {
    id: assistantId,
    role: 'assistant',
    content: '❌ Failed to get a response. This usually means your AI provider needs to be configured or toggled on in Settings.',
    timestamp: new Date(),
    messageStatus: 'error',
    actions: [
      { id: 'retry', type: 'button', label: 'Retry', action: `send:${content}`, variant: 'primary' },
      { id: 'settings', type: 'button', label: 'Open Settings', action: 'navigate:/ai-settings', variant: 'outline' },
    ],
  };
  setMessages(prev => prev.map(m => m.id === assistantId ? errorMessage : m));
}
```

This gives the user:
1. A visible error in the conversation (doesn't vanish)
2. A "Retry" button that resends the same message
3. A "Settings" link to check their AI provider configuration

---

### P1-7: Auto-naming Fails When Backend Errors

**Impact:** Sidebar fills with "New Chat" entries because conversation titles are only set AFTER a successful AI response (line 476). When the backend 500s, the try block exits before reaching the title update.

**File:** `src/hooks/useEnhancedAIChatDB.ts` — lines 475-490

**Fix:** Move the title update to happen BEFORE the AI call, right after creating the conversation. The title is already derived from the user's input (line 477: `content.slice(0, 40)`), so it doesn't need the AI response:

Move lines 476-490 to right after `setMessages(prev => [...prev, userMessage])` (line 395), changing the condition from `if (messages.length === 0)` to checking if this is a new conversation:

```ts
// Set title immediately from user's first message (don't wait for AI response)
if (!activeConversation || messages.length === 0) {
  const title = (displayContent || content).slice(0, 40) + (content.length > 40 ? '...' : '');
  await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', conversationId);
  setConversations(prev =>
    prev.map(conv => conv.id === conversationId ? { ...conv, title } : conv)
  );
}
```

---

### P1-8: AI Proposals May Not Appear in + Menu (Conditional Rendering)

**Impact:** The Antigravity audit reported "AI Proposals" missing from the + menu. The code wires it up correctly (`PlusMenuDropdown` receives `onAIProposals` from `ContextAwareMessageInput`), but the item only renders when the prop is provided. If `onOpenProposals` is undefined in a certain render path, the item silently disappears.

**File:** `src/components/ai-chat/PlusMenuDropdown.tsx` — line 52

**Status:** The code looks correct — `onAIProposals` IS passed. This may have been a deployment timing issue. **Verify in production** — if "AI Proposals" shows in the + menu with all 5 items (Attach File, Content Wizard, Research Intelligence, Analyst, AI Proposals), this is resolved. If not, check that `ContextAwareMessageInput` receives `onOpenProposals` from its parent.

---

### P3-4: 330 Elements Use `transition: all` (Performance)

**Impact:** The audit flagged 330 DOM elements using `transition: all`, which forces the browser to check all CSS properties on every transition. On complex views with charts and sidebars, this causes unnecessary repaints.

**Fix:** In `tailwind.config.ts`, the `tailwindcss-animate` plugin likely sets `transition: all` as default. Override with specific properties in components that have performance-sensitive animations. Low priority but worth noting for future optimization.

---

## IMPLEMENTATION ORDER

### Sprint 1: Unblock AI Chat (do first — NOTHING WORKS without this)
| # | Item | Est. |
|---|------|------|
| 0 | **P0-0: Fix provider key lookup — chat returns 500 on every message** | 30 min |
| 0b | **P0-0b: Fix SSE streaming — fast-path + URL fallbacks (see below)** | 30 min |
| 1 | P1-6: Add error UI with retry button when backend fails | 15 min |
| 2 | P1-7: Move auto-naming before AI call so titles work even on failure | 10 min |
| 3 | P0-2: Fix `'serpapi'` → `'serp'` in keyword-action-tools | 2 min |

### Sprint 3: Silent failures
| # | Item | Est. |
|---|------|------|
| 5 | P1-1: Stop writing plaintext keys to ai_service_providers | 15 min |
| 6 | P1-2: Sanitize email builder BlockRenderer HTML | 5 min |
| 7 | P1-4: Add .env to .gitignore | 1 min |
| 8 | P1-5: Fix social poster activity log status | 5 min |
| 9 | P1-3: Note about HubSpot key exposure | 5 min |
| 10 | P1-8: Verify AI Proposals appears in + menu | 5 min |

### Sprint 4: UX / quality
| # | Item | Est. |
|---|------|------|
| 11 | P2-1: Delete dead LM Studio handlers | 5 min |
| 12 | P2-2: Increase context window or add summarization | 30 min - 2 hrs |
| 13 | P2-3: Clean glossary references | 10 min |
| 14 | P2-4: Audit content-repurposing components | 15 min |

### Sprint 5: Cleanup
| # | Item | Est. |
|---|------|------|
| 15 | P3-1: Strip console logs in production | 5 min |
| 16 | P3-2: Delete dead LM Studio code | 5 min |
| 17 | P3-3: Document hardcoded URL | 2 min |
| 18 | P3-4: Audit `transition: all` usage | 30 min |

---

## FULL TESTING CHECKLIST

### AI Chat (from Antigravity audit — re-run all 65 tests after fixes)
- [ ] **Send ANY message → get AI response (not "Failed to send message" / 500)**
- [ ] Backend failure → error message visible IN the chat with Retry + Settings buttons
- [ ] New conversation → auto-named from first message (not "New Chat")
- [ ] + Menu → shows all 5 items: Attach File, Content Wizard, Research Intelligence, Analyst, AI Proposals
- [ ] Send message → response appears with real progress (not 20s blank wait)
- [ ] "Analyze keyword X" with SERP key → analysis runs (not "no key" error)
- [ ] "Analyze keyword X" without SERP key → clear message pointing to Settings
- [ ] 15+ message conversation → AI still remembers early context
- [ ] "Delete my latest post" → confirmation card before deletion

### Email
- [ ] Send email with Resend key → email delivers
- [ ] Email builder text blocks render safely (no script injection)

### Social
- [ ] Schedule social post → status shows "pending_integration" not "failed"
- [ ] Activity log shows honest messaging (not "failed")

### Security
- [ ] Toggle AI provider active → check `ai_service_providers` table → NO plaintext api_key
- [ ] `.env` file → not committed to git
- [ ] Browser DevTools Network → no API keys visible in request bodies

### Cleanup
- [ ] Production build → no console.log output in browser
- [ ] No references to deleted glossary-builder pages causing errors
- [ ] Build succeeds without errors
