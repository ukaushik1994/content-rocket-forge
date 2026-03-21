

# Smart Suggestions: Kill Regex, Let AI Decide

## Summary
Remove the dumb client-side regex follow-up system and let the backend AI generate contextual suggestions only when genuinely useful. Also fix 3 silent failure bugs in the chat hook.

## Phase 1: Backend — AI Follow-Up Prompt Injection
**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Step 1a: Add follow-up instruction to RESPONSE_STRUCTURE** (~line 707, before the closing backtick)

Append a new section to the `RESPONSE_STRUCTURE` template instructing the AI to optionally include a `"suggestedFollowUps"` JSON array (2-3 items, under 8 words each) only when there's a clear next step. Include the GOOD/BAD examples and the 7 rules from the plan. Tell the AI to omit the field entirely when the response is self-contained.

**Step 1b: Parse suggestedFollowUps into deepDivePrompts** (~line 4650, in the `responseData` construction)

After building `responseData`, extract `suggestedFollowUps` from the AI response text using a JSON regex pattern. If found and `visualData` has no existing `deepDivePrompts`, inject them:

```
// After cleaning AI response, scan for suggestedFollowUps JSON
// If found, merge into visualData.deepDivePrompts
// This reuses the existing deepDivePrompts rendering pipeline
```

This means no new frontend rendering code is needed — the existing `deepDivePrompts` display in `EnhancedMessageBubble.tsx` handles it.

## Phase 2: Frontend — Remove Regex System
**File:** `src/components/ai-chat/EnhancedMessageBubble.tsx`

**Step 2a: Delete `smartFollowUps` useMemo** (lines 64-92)
Remove the entire regex-based suggestion generator.

**Step 2b: Delete `smartFollowUps` rendering block** (lines 403-421)
Remove the JSX that renders these generic buttons.

**Keep untouched:** The `deepDivePrompts` rendering block (lines 383-401) — this is the good one that shows AI-generated suggestions.

## Phase 3: Silent Failure Fixes
**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Step 3a: Ensure `isSendingRef` clears on crash** (~line 981-986)
The `finally` block already has `isSendingRef.current = false` — verify it's truly in a `finally` (it is, confirmed at line 985). No change needed here.

**Step 3b: Toast on message save failure** (~lines 552, 815)
After both user message save (line 552) and assistant message save (line 815), add a warning toast when `saveMessage` returns `null`:

```ts
// Line ~552: after user message save
if (!userDbId) {
  toast({ title: "Warning", description: "Message may not be saved — check your connection", variant: "destructive" });
}

// Line ~815: after assistant message save
if (!assistantDbId) {
  toast({ title: "Warning", description: "Response may not persist — try refreshing if it disappears", variant: "destructive" });
}
```

**Step 3c: Retry on 401 with session refresh** (~line 701-704)
Before throwing on `!resp.ok`, add a 401 check that refreshes the session and retries the fetch once:

```ts
if (resp.status === 401) {
  const { error: refreshErr } = await supabase.auth.refreshSession();
  if (!refreshErr) {
    const retryHeaders = await getAuthHeaders();
    const retryResp = await fetch(url, { ...options, headers: retryHeaders });
    if (retryResp.ok && retryResp.body) {
      // Use retryResp instead, continue normally
    }
  }
}
```

## Files Changed: 3
1. `supabase/functions/enhanced-ai-chat/index.ts` — system prompt + response parsing
2. `src/components/ai-chat/EnhancedMessageBubble.tsx` — delete regex system
3. `src/hooks/useEnhancedAIChatDB.ts` — save failure toasts + 401 retry

## Implementation Order
| Step | What | File |
|------|------|------|
| 1 | Add follow-up prompt to RESPONSE_STRUCTURE | `enhanced-ai-chat/index.ts` |
| 2 | Parse suggestedFollowUps → deepDivePrompts | `enhanced-ai-chat/index.ts` |
| 3 | Delete smartFollowUps useMemo + rendering | `EnhancedMessageBubble.tsx` |
| 4 | Toast on save failures | `useEnhancedAIChatDB.ts` |
| 5 | 401 retry with session refresh | `useEnhancedAIChatDB.ts` |

