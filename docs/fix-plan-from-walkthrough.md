# Fix Plan from Antigravity Walkthrough — March 19

> Based on test execution: 83 PASS, 5 FAIL, 4 PARTIAL, 16 BLOCKED out of 107 tests.
> This plan covers every FAIL and PARTIAL with exact fixes.

---

## 6 Issues Found — Ordered by Severity

---

### BUG 1 (HIGH): User message actions not accessible — no Edit/Delete on user messages

**Test:** 3.1, 3.4, 3.5
**What Antigravity saw:** Three-dot menu only appears on AI messages. User messages have no hover menu, no edit, no delete. The `MessageActions` component exists with edit/delete logic but it's not rendering on user message bubbles.

**Root cause:** In `EnhancedMessageBubble.tsx`, the `MessageActions` component is likely only rendered for `!isUser` messages, or the hover trigger CSS isn't working for user-side bubbles.

**File:** `src/components/ai-chat/EnhancedMessageBubble.tsx`

Find where `MessageActions` is rendered and check if it's gated by `!isUser`:

```tsx
// Current (likely):
{!isUser && (
  <MessageActions messageId={message.id} content={message.content} isUser={false} ... />
)}

// Should be (for ALL messages):
<MessageActions
  messageId={message.id}
  content={message.content}
  isUser={isUser}
  timestamp={message.timestamp}
  onEdit={isUser ? onEditMessage : undefined}
  onDelete={onDeleteMessage}
  onRegenerate={!isUser ? onRetry : undefined}
  onFeedback={!isUser ? onFeedback : undefined}
  onPin={!isUser ? onPin : undefined}
/>
```

The `MessageActions` component already handles `isUser` internally — it shows Edit only for user messages within 5 min, Delete for all messages, and Regenerate/Feedback/Pin only for AI messages. The fix is just rendering it for both sides.

Also check CSS: the hover actions may be hidden on user bubbles because the bubble is right-aligned and the absolute-positioned actions overflow offscreen. Ensure the actions container has `right: 0` for user messages instead of `left: 0`.

**Backend:** No changes needed.

---

### BUG 2 (HIGH): Time to First Token is 25-30 seconds

**Test:** 12.3
**What Antigravity saw:** After sending a message, it takes 25-30 seconds before any AI text appears. Progress steps show "Fetching your data" and "Refining response" for a long time.

**Root cause:** Multiple sequential operations in `enhanced-ai-chat/index.ts`:
1. Auth validation (~200ms)
2. Provider lookup + key decryption (~500ms)
3. Query intent analysis (~100ms)
4. SERP intent detection + possible web search (~0-5s)
5. `fetchRealDataContext` — 7+ DB queries in parallel (~1-3s)
6. Brand voice fetch (~200ms)
7. User intelligence profile fetch (~200ms)
8. System prompt assembly (~50ms)
9. AI provider call via `ai-proxy` (~5-20s depending on model and prompt size)
10. Response parsing + tool execution (~1-5s if tools called)

Steps 1-8 total ~2-5 seconds. Step 9 is the main bottleneck — the AI provider call. With a 10k+ token system prompt, cheaper models (GPT-4o-mini) take 15-20s to process everything.

**Fixes (layered — each one helps):**

**Fix A: Parallelize pre-AI-call operations**

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Currently steps 4-7 run somewhat sequentially. Parallelize everything before the AI call:

```ts
// Instead of sequential:
// const serpResult = await checkSerp();
// const context = await fetchRealDataContext();
// const brandVoice = await fetchBrandVoice();
// const intelligence = await fetchIntelligence();

// Run ALL pre-AI operations in parallel:
const [serpResult, contextResult, brandVoiceResult, intelligenceResult] = await Promise.allSettled([
  checkSerpIfNeeded(queryIntent, userQuery, userId),
  fetchRealDataContext(userId, queryIntent, userQuery),
  fetchBrandVoice(userId),
  getUserIntelligenceContext(userId)
]);
```

This can save 2-5 seconds by overlapping DB queries and SERP calls.

**Fix B: Reduce system prompt size for simple queries**

The intent-gated modules are already in place, but the BASE_PROMPT itself is ~1000 tokens of instructions that go on EVERY request. For simple queries (`queryIntent.scope === 'summary'` or `'conversational'`), use a minimal base prompt:

```ts
const MINIMAL_BASE = `You are a helpful AI assistant for content strategy. Answer directly and concisely. Use data from the provided context. Include action buttons when relevant.`;

// Use minimal for simple queries
const basePrompt = (queryIntent.scope === 'conversational' || queryIntent.scope === 'summary')
  ? MINIMAL_BASE
  : BASE_PROMPT;
```

This saves ~800 tokens on simple queries, which translates to ~3-5s faster AI response.

**Fix C: Skip unnecessary data fetches for conversational queries**

The fast-path already handles greetings ("hi", "thanks"). But queries like "what's my SEO score?" still trigger the full pipeline. For `summary` scope queries that only need one tool call, skip the full context fetch:

```ts
if (queryIntent.scope === 'summary' && queryIntent.categories.length === 1) {
  // Skip heavy context — the AI will use tools to fetch specific data
  realDataContext = `Data counts: ${counts.contentCount} content items, ${counts.keywordCount} keywords.`;
}
```

**Backend only.** No frontend changes needed.

---

### BUG 3 (MEDIUM): Service errors / API timeouts on follow-up messages

**Test:** 13.5
**What Antigravity saw:** First message works, but follow-up messages sometimes get service errors or API timeouts.

**Root cause:** Multiple possible causes:
1. **Rate limiting** — the first message uses tokens, the follow-up may hit the provider's rate limit (especially on free/low tiers)
2. **Token accumulation** — each follow-up includes more conversation history, making the prompt larger. By the 5th message, the total tokens may exceed the model's limit
3. **AbortController reuse** — if the previous request's abort controller isn't fully cleaned up, the new request may inherit a stale abort signal

**Fixes:**

**Fix A: Better error messages for rate limits**

**File:** `src/hooks/useEnhancedAIChatDB.ts` — in the catch block

```ts
} catch (error: any) {
  const errorMsg = error?.message || '';
  let userMessage = "I wasn't able to process your request.";

  if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
    userMessage = "The AI provider is rate-limited. Wait 30 seconds and try again, or switch to a different provider in Settings.";
  } else if (errorMsg.includes('timeout') || error?.name === 'AbortError') {
    userMessage = "The request timed out. This can happen with complex queries. Try a simpler question or retry.";
  } else if (errorMsg.includes('token') || errorMsg.includes('context length')) {
    userMessage = "The conversation is too long for the AI to process. Start a new chat for a fresh context window.";
  }

  // ... rest of error handling
}
```

**Fix B: Token budget guard before sending**

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — the token budget check already exists at line ~2580. Ensure it throws a user-friendly error instead of letting the AI provider reject it:

```ts
if (totalTokens > maxInputTokens * 0.9) {
  // Approaching limit — trim context aggressively
  console.warn(`⚠️ Token budget at ${Math.round(totalTokens / maxInputTokens * 100)}% — trimming context`);
  // Reduce conversation history to last 5 messages instead of 10
  // Remove optional modules from prompt
}
```

---

### BUG 4 (MEDIUM): No "Previous session" prefix on Analyst cross-session insights

**Test:** 5.10
**What Antigravity saw:** Closing Analyst and reopening in a new conversation does not show "📋 Previous session:" prefixed insights.

**Root cause:** The cross-session memory saves to `localStorage` but the load logic may not trigger correctly — the condition `messages.length === 0` (which gates loading previous session data) may not be true when the Analyst reopens because the new conversation might already have loaded messages by the time the effect runs.

**File:** `src/hooks/useAnalystEngine.ts` — the `previousSessionInsights` loading effect

**Fix:** Change the load condition to check for both `isActive` becoming true AND having no analyst-specific insights yet (rather than checking `messages.length`):

```ts
useEffect(() => {
  // Load previous session insights when Analyst activates for the first time
  if (isActive && previousSessionInsights.length === 0 && insightsFeed.length === 0) {
    try {
      const saved = localStorage.getItem(SESSION_MEMORY_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const ageHours = (Date.now() - data.savedAt) / 3600000;
        if (ageHours < 72 && data.insights?.length > 0) {
          const restored: InsightItem[] = data.insights.map((content: string, i: number) => ({
            id: `prev-session-${i}`,
            content: `📋 Previous session: ${content}`,
            type: 'trend' as const,
            source: 'memory' as const,
            timestamp: new Date(data.savedAt)
          }));
          setPreviousSessionInsights(restored);
        }
      }
    } catch (_) {}
  }
}, [isActive]);  // Only depend on isActive, not messages
```

**Frontend only.**

---

### BUG 5 (LOW): Export JSON/Markdown inconsistently accessible

**Test:** 7.8, 7.9
**What Antigravity saw:** Export options appear in the conversation context menu but are "inconsistently accessible" — sometimes they work, sometimes they don't.

**Root cause:** The export function in `useEnhancedAIChatDB.ts` requires `conversations.find(c => c.id === conversationId)` to succeed. If the conversations list hasn't loaded yet, or if the conversation was just created and not yet in the local state, the export silently returns without doing anything.

**File:** `src/hooks/useEnhancedAIChatDB.ts` — `exportConversation` function

**Fix:** Add a fallback that fetches the conversation directly if not found in local state:

```ts
const exportConversation = useCallback(async (conversationId: string, format: 'json' | 'txt' | 'markdown' = 'json') => {
  try {
    let conversation = conversations.find(c => c.id === conversationId);

    // Fallback: fetch directly if not in local state
    if (!conversation) {
      const { data } = await supabase
        .from('ai_conversations')
        .select('id, title, created_at, updated_at, tags')
        .eq('id', conversationId)
        .single();
      if (!data) {
        toast({ title: "Error", description: "Conversation not found", variant: "destructive" });
        return;
      }
      conversation = data;
    }

    // ... rest of export logic
  }
}, [conversations, toast]);
```

**Frontend only.**

---

### BUG 6 (LOW): AI Delete removes AI message but leaves paired user message

**Test:** 3.7
**What Antigravity saw:** Deleting an AI message removes only the AI message. The user message above it remains. This is actually correct behavior (test 3.8 says "delete AI message → only that message removed"). But the reverse — deleting a USER message should delete the paired AI response too. Since user delete isn't accessible (Bug 1), this couldn't be fully tested.

**Once Bug 1 is fixed**, the existing `deleteMessage` logic in the hook already handles paired deletion for user messages (lines 1357-1359):
```ts
if (targetMsg?.role === 'user' && nextMsg?.role === 'assistant') {
  idsToDelete.push(nextMsg.id);
}
```

So this bug resolves itself when Bug 1 (user message actions) is fixed.

**No additional fix needed.**

---

## IMPLEMENTATION ORDER

### Immediate (fixes user-facing bugs)

| # | Fix | File | Effort | Impact |
|---|-----|------|--------|--------|
| 1 | **User message actions** — render MessageActions on both sides | `EnhancedMessageBubble.tsx` | 15 min | Edit/Delete/three-dot menu works on user messages |
| 4 | **Previous session prefix** — fix load condition | `useAnalystEngine.ts` | 10 min | Cross-session memory visible |
| 5 | **Export fallback** — fetch conversation if not in local state | `useEnhancedAIChatDB.ts` | 10 min | Export always works |

### Performance (reduces TTFT from 25s to ~10-15s)

| # | Fix | File | Effort | Impact |
|---|-----|------|--------|--------|
| 2A | **Parallelize pre-AI operations** | `enhanced-ai-chat/index.ts` | 30 min | Saves 2-5s |
| 2B | **Minimal base prompt for simple queries** | `enhanced-ai-chat/index.ts` | 15 min | Saves 3-5s on simple queries |
| 2C | **Skip context for summary queries** | `enhanced-ai-chat/index.ts` | 10 min | Saves 1-3s |

### Reliability (prevents follow-up failures)

| # | Fix | File | Effort | Impact |
|---|-----|------|--------|--------|
| 3A | **Better error messages for rate limits/timeouts** | `useEnhancedAIChatDB.ts` | 15 min | User knows what went wrong |
| 3B | **Token budget guard with aggressive trimming** | `enhanced-ai-chat/index.ts` | 20 min | Prevents context overflow errors |

**Total: ~2 hours for all fixes.**

---

## WHAT THE 16 BLOCKED TESTS NEED

These weren't bugs — they need specific setup or conditions:

| Tests | What's needed |
|-------|--------------|
| 2.11 | Send 10+ messages to see context indicator |
| 3.6 | Wait 5 minutes after sending a message to test edit expiry |
| 4.11 | Prepare a .txt file to upload |
| 8.4-8.6 | Trigger a destructive action (e.g., "delete my latest article") to test confirmation flow |
| 8.7-8.8 | Force an error (disconnect network or use invalid API key) to test error buttons |
| 9.5 | Send an email campaign and wait for the background notification |
| 10.5 | Open visualization sidebar on mobile to test overlay |
| 11.1, 11.5 | Network manipulation (disconnect during streaming) |
| 11.7-11.8 | Create a shared conversation first, then test the shared link |
| 12.5 | Open browser DevTools to inspect WebSocket/SSE |

These can be tested in a follow-up session with explicit setup instructions.

---

## PASS RATE PROJECTION AFTER FIXES

| Category | Before | After fixes |
|----------|:------:|:----------:|
| PASS | 83 | 90+ |
| FAIL | 5 | 0 |
| PARTIAL | 4 | 1 (export, if edge case persists) |
| BLOCKED | 16 | 16 (same — need manual setup) |
| **PASS rate (executed)** | **89.8%** | **98%+** |
