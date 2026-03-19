

# Fix Plan: 6 Bugs from Antigravity Walkthrough

**Test Results:** 83 PASS, 5 FAIL, 4 PARTIAL, 16 BLOCKED (91.2% pass rate)
**Target:** 98%+ pass rate after fixes

---

## Phase 1: User Message Actions (BUG 1 + BUG 6) — Frontend
**Files:** `EnhancedMessageBubble.tsx`

**Problem:** `MessageActions` is wrapped in `{!isUser && (...)}` at line 262, so user messages never get Edit/Delete/three-dot menu. Bug 6 (paired deletion) auto-resolves once users can delete their own messages.

**Fix:**
- Remove the `!isUser` gate on lines 262/278
- Render `MessageActions` for ALL messages, passing conditional handlers:
  - `onEdit` → only for user messages
  - `onRegenerate`, `onFeedback`, `onPin` → only for AI messages
  - `onDelete` → both
- Position the actions container with `justify-end mr-1` for user bubbles (right-aligned) vs `ml-1` for AI bubbles

---

## Phase 2: Performance — Reduce TTFT (BUG 2) — Edge Function
**File:** `enhanced-ai-chat/index.ts`

**Problem:** Brand voice fetch (line 2656), user intelligence fetch (line 2677), and SERP detection run sequentially before the AI call. Total pre-call overhead: 2-5s unnecessary.

**Fix A — Parallelize pre-AI operations:**
- Wrap brand voice fetch, user intelligence fetch, and SERP check in `Promise.allSettled()` so they run concurrently instead of sequentially. Saves ~1-3s.

**Fix B — Minimal base prompt for simple queries:**
- For `conversational` and `summary` scope queries, use a ~50-token minimal system prompt instead of the full ~1000-token BASE_PROMPT. Saves ~3-5s on model processing.

**Fix C — Skip heavy context for single-category summary queries:**
- When `queryIntent.scope === 'summary'` and only 1 category is detected, skip the full `realDataContext` fetch — the AI will use tools to get specific data. Already partially done at line 2772 but can be more aggressive.

Requires edge function redeployment.

---

## Phase 3: Error Handling for Follow-ups (BUG 3) — Frontend + Edge Function
**Files:** `useEnhancedAIChatDB.ts`, `enhanced-ai-chat/index.ts`

**Problem:** Follow-up messages sometimes get service errors or API timeouts. Error messages are generic.

**Fix A — Specific error messages (frontend, line 750-756):**
- Detect `429`/rate limit → "Provider rate-limited. Wait 30s or switch provider."
- Detect `token`/`context length` → "Conversation too long. Start a new chat."
- Keep existing timeout and generic fallback messages.

**Fix B — Token budget guard (edge function):**
- Before sending to AI provider, check if total estimated tokens exceed 90% of model max. If so, trim conversation history from 10 to 5 messages and strip optional system prompt modules.

---

## Phase 4: Analyst Session Memory (BUG 4) — Frontend
**File:** `useAnalystEngine.ts`

**Problem:** Line 957 checks `messages.length === 0` to gate loading previous session insights. But by the time the Analyst activates, messages are already loaded, so the condition is never true.

**Fix:** Change condition from `messages.length === 0` to `insightsFeed.length === 0` (no analyst-specific insights yet). Remove `messages.length` from the dependency array — only depend on `isActive`.

---

## Phase 5: Export Reliability (BUG 5) — Frontend
**File:** `useEnhancedAIChatDB.ts`

**Problem:** Line 1127-1128 — `conversations.find()` silently returns if conversation isn't in local state (e.g., just created, list not refreshed).

**Fix:** Add a Supabase fallback query when `conversations.find()` returns undefined:
```
if (!conversation) {
  fetch from ai_conversations by ID
  if still not found → show error toast
}
```

---

## Implementation Order

| Phase | Bug | Effort | Impact |
|-------|-----|--------|--------|
| 1 | User message actions + paired delete | 15 min | Fixes 4 test cases (3.1, 3.4, 3.5, 3.7) |
| 2 | TTFT performance | 30 min | Fixes test 12.3, improves all responses |
| 3 | Error handling | 20 min | Fixes test 13.5 |
| 4 | Analyst session memory | 10 min | Fixes test 5.10 |
| 5 | Export reliability | 10 min | Fixes tests 7.8, 7.9 |

**Total: ~1.5 hours. Projected pass rate: 98%+ (90/91 executed)**

