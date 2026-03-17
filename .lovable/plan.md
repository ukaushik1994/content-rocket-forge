

# AI Chat Diagnostic Report — Bugs Found

After thorough analysis of the full `enhanced-ai-chat` backend (3746 lines), the frontend hook (`useEnhancedAIChatDB`, 1127 lines), and the tool execution layer, here are the issues discovered:

---

## BUG-1 (P0 — Crash): Data recovery `executeToolCall` called with wrong signature

**File:** `supabase/functions/enhanced-ai-chat/index.ts` line 3303

The "empty visualization recovery" path calls:
```
executeToolCall(toolCall, userId, supabase)
```
But the actual function signature is:
```
executeToolCall(toolName: string, toolArgs: any, supabase, userId, cache)
```
This passes a whole object as `toolName` and `userId` as `toolArgs`. It will always throw a runtime error, meaning **automatic data recovery never works**. Additionally, `hasAttemptedToolCalls` (line 3241) is **never declared** anywhere in the file — this is an undefined variable reference that would crash the entire response pipeline before recovery even starts.

**Fix:** Declare `let hasAttemptedToolCalls = toolCalls && toolCalls.length > 0;` near line 2554, and fix the call to `executeToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments), supabase, user.id, toolCache)`. Also fix the `callAI` function reference on line 3324 which doesn't exist.

Since the whole recovery block is broken and unreachable (crashes on the undefined `hasAttemptedToolCalls` variable), the simplest fix is to **remove the dead recovery block entirely** (lines 3241-3346) — the fallback chart generation from tool results (lines 3519-3528) already covers this case.

## BUG-2 (P1 — Silent failure): `executeSerpAnalysis` uses env secret, not user's key

**File:** `supabase/functions/enhanced-ai-chat/index.ts` lines 2206-2237

The keyword/SEO SERP analysis path (`executeSerpAnalysis`) does NOT use the user's decrypted SERP key. Only the `executeWebSearch` path (lines 2172-2205) was fixed to use `getApiKey('serp', user.id)`. So keyword-triggered SERP queries still fail silently because the env secret `SERP_API_KEY` doesn't exist.

**Fix:** Pass the already-decrypted `serpApiKey` to `executeSerpAnalysis`, or decrypt before entering the keyword path (same pattern as the web search path).

## BUG-3 (P2 — UX): Share conversation generates broken link

**File:** `src/hooks/useEnhancedAIChatDB.ts` line 972

`shareConversation` generates a URL to `/shared-conversation/${conversationId}`. This path requires no auth check — any user with the link can see the conversation. More critically, the comment says "Fixed: Use /shared-conversation route which now exists" but we should verify this route actually exists and has proper RLS on the `ai_messages` table to prevent data leakage.

**Recommendation:** Verify the route exists. If not, remove the share feature or add a proper sharing mechanism with access tokens.

## BUG-4 (P2 — UX): `editMessage` has no server-side time window check

**File:** `src/hooks/useEnhancedAIChatDB.ts` lines 1010-1039

The comment says "Edit message (within 5-minute window)" but there's no actual time check — neither client-side nor server-side. Any message can be edited at any time. The RLS policy likely allows unrestricted updates.

**Recommendation:** Add a client-side check (`Date.now() - msg.created_at < 5 * 60 * 1000`) and an RLS policy with `created_at > now() - interval '5 minutes'`.

## BUG-5 (P2 — UX): Conversation title double-update race condition

**File:** `src/hooks/useEnhancedAIChatDB.ts` lines 393-408 and 554-568

The conversation title is updated **twice** on the first message: once immediately (line 396, fire-and-forget) and again after the AI response (line 556). Both use `content.slice(0, 40)` so the result is the same, but it's a wasted DB write and could race with a user rename.

**Fix:** Remove the second title update block (lines 554-568).

---

## Summary of Recommended Fixes

| Bug | Severity | Fix |
|-----|----------|-----|
| BUG-1: Dead recovery block with undefined vars | P0 | Remove lines 3241-3346 (dead code) |
| BUG-2: SERP keyword analysis ignores user key | P1 | Pass decrypted key to `executeSerpAnalysis` |
| BUG-3: Share link may be broken/insecure | P2 | Verify route + RLS, or disable |
| BUG-4: Edit window not enforced | P2 | Add time check client-side |
| BUG-5: Double title update | P2 | Remove duplicate block |

Total: 2 backend files + 1 frontend file + 1 deploy.

