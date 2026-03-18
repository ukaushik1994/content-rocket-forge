

# AI Chat Comprehensive Audit Report

## Summary

After reviewing ~3,900 lines of the `enhanced-ai-chat` edge function, the `useEnhancedAIChatDB` frontend hook (1,127 lines), and all supporting files, I identified **11 issues** across 3 severity levels.

---

## Critical Issues (Breaks Functionality)

### 1. `maxRetries` Variable Redeclared in Same Scope
**File:** `index.ts` ~line 2519 and ~line 2937
The variable `const maxRetries = 3` is declared twice within the same `doProcessing` function scope — once for the Phase 1 AI call (line 2519) and again for the Phase 2 second call after tool execution (line 2937). In strict mode or certain bundler configurations, this causes a `SyntaxError`. Even without errors, it shadows the outer declaration unnecessarily.

**Fix:** Rename the second one to `maxRetriesPhase2` or use a shared constant outside `doProcessing`.

### 2. `data` Variable Reference After Retry/Auto-Execute May Be Stale
**File:** `index.ts` ~line 2953
After the retry (Fix 2) and auto-execute (Fix 3) paths, the code at line 2953 references `data.choices[0].message` — the original Phase 1 AI response object. If the retry succeeded and updated `aiProxyResult.data.data`, this reference is correct. But if the auto-execute path ran (line 2714-2813) and set `toolCalls = null`, the code falls through to line 2826 `if (toolCalls && toolCalls.length > 0)` which is skipped. However, `data` at line 2953 still points to the **original** response, not the auto-execute follow-up. This means the "tool_calls + tool_results → second AI call" path at line 2953 could send **stale** tool_calls from the original response if both retry AND auto-execute partially ran.

**Fix:** Add a guard that explicitly checks if `data` was updated after retry, or restructure to avoid reusing the `data` variable across different execution paths.

### 3. `analystContext` Queries Missing `user_id` Filter
**File:** `index.ts` ~line 3776
The `engage_email_campaigns` count query in the analyst context block (line 3776) does NOT filter by `user_id` or `workspace_id`:
```typescript
const { count } = await supabase.from('engage_email_campaigns').select('id', { count: 'exact', head: true });
```
This returns counts for ALL users' email campaigns, not just the current user's. If RLS is not enforcing this, it's a data leakage issue.

**Fix:** Add `.eq('workspace_id', engageWorkspaceId)` filter (consistent with the `fetchRealDataContext` function which does filter correctly at line 1645).

---

## Medium Issues (Degraded Experience)

### 4. Edit Message Uses Client-Generated `id` — DB Query Will Fail
**File:** `useEnhancedAIChatDB.ts` ~line 1013-1018
Messages are assigned client-generated IDs like `user-${Date.now()}` and `assistant-${Date.now()}` (lines 379, 389). The `editMessage` function queries `supabase.from('ai_messages').update(...).eq('id', messageId)` using these client IDs. But the database assigns its own UUID `id` on insert — the client-generated ID is never stored in the DB. The `.eq('id', messageId)` query will match **zero rows**, so edits silently fail.

**Fix:** After `saveMessage` inserts the message, return the DB-generated `id` and update the local message state with it. Alternatively, store the client ID in a metadata column and query by that.

### 5. Delete Message Has Same ID Mismatch
**File:** `useEnhancedAIChatDB.ts` ~line 1047-1050
Same issue as #4 — `deleteMessage` uses `supabase.from('ai_messages').delete().eq('id', messageId)` with a client-generated ID that doesn't match the database UUID.

**Fix:** Same as #4 — use DB-returned IDs.

### 6. Share Conversation Exposes Private Data Without Access Control
**File:** `useEnhancedAIChatDB.ts` ~line 954-980
The `shareConversation` function generates a URL like `/shared-conversation/{conversationId}` and copies it to the clipboard. There is no mention of creating a share token, public access flag, or RLS policy for shared access. Anyone with the conversation UUID could potentially access private conversations if the route exists without proper auth.

**Fix:** Implement a share token system (e.g., `share_tokens` table with expiry) or add a `is_public` flag to conversations with RLS policies. Alternatively, remove the share feature if not fully implemented.

### 7. `useEnhancedAIChat` Hook is Orphaned / Duplicate
**File:** `src/hooks/useEnhancedAIChat.tsx`
This hook duplicates functionality from `useEnhancedAIChatDB.ts` but uses a completely different approach (direct `supabase.functions.invoke` instead of SSE streaming, no DB persistence, no conversation management). It's imported by `useEnhancedAIChat.tsx` but the context system uses `useEnhancedAIChatDB`. If any component imports the wrong hook, it will get stale behavior without streaming or persistence.

**Fix:** Audit all imports. If nothing uses `useEnhancedAIChat.tsx`, delete it to prevent accidental usage.

### 8. Conversation Title Race Condition
**File:** `useEnhancedAIChatDB.ts` ~line 393-408
The conversation title is set via a fire-and-forget `.then()` call immediately after the first message. If the user sends a second message before this resolves (unlikely but possible), the second `sendMessage` call sees `messages.length === 0` is false, so it skips title generation. But the first call's `.then()` could fail silently (no `.catch()` handler), leaving the conversation with the default "New Chat" title.

**Fix:** Add a `.catch()` handler to the title update. Consider using a dedicated naming strategy or deferring to the AI response.

---

## Low Issues (Code Quality / Performance)

### 9. `fetchRealDataContext` Still Runs Unnecessary Query
**File:** `index.ts` ~line 1654-1656
Even when `needsEngage` is false, the function still queries `team_members` to get `engageWorkspaceId`. This query runs on EVERY non-engage request unnecessarily.

**Fix:** Only query for workspace ID when `needsEngage` is true or when building the context string conditionally includes it.

### 10. Duplicate `generateFallbackChartFromToolResults` Logic
**File:** `index.ts` ~line 2595-2666 and ~line 3001-3121
Two nearly identical functions exist: `generateFallbackChartFromAutoResults` (for auto-execute path) and `generateFallbackChartFromToolResults` (for normal tool path). They duplicate chart generation logic for content, keywords, and proposals.

**Fix:** Consolidate into a single reusable function.

### 11. SSE Progress Events Not Emitted During Retry/Auto-Execute
**File:** `index.ts` ~line 2670-2813
When the retry (Fix 2) fires, no `emitProgress` call is made to inform the user. The auto-execute path does emit `emitProgress('tools', 'Fetching your data...')` (line 2767), but the retry path is silent. Users see a stalled "Processing with AI..." message during retries that could take 10+ seconds.

**Fix:** Add `emitProgress('retry', 'Refining response...')` before the retry AI call at line 2673.

---

## Recommended Fix Priority

```text
Priority 1 (Fix Now):
  #3 - Analyst email campaign count missing user filter (data leak)
  #4 + #5 - Message edit/delete silently failing (broken features)

Priority 2 (Fix Soon):
  #1 - maxRetries redeclaration (potential runtime error)
  #2 - Stale data reference after retry paths
  #6 - Share conversation security gap
  #11 - Missing progress events during retry

Priority 3 (Cleanup):
  #7 - Remove orphaned useEnhancedAIChat hook
  #8 - Title update race condition
  #9 - Unnecessary workspace query
  #10 - Deduplicate fallback chart generators
```

---

## Implementation Plan

### File: `supabase/functions/enhanced-ai-chat/index.ts`
- **#1:** Rename second `maxRetries` at ~line 2937 to `maxRetriesPhase2`
- **#2:** Add explicit `data` reassignment guard after retry/auto-execute paths
- **#3:** Add `.eq('workspace_id', engageWorkspaceId)` filter at line 3776 (conditional on workspace availability)
- **#9:** Wrap workspace query in `needsEngage` conditional
- **#10:** Extract shared fallback chart function, remove duplicate
- **#11:** Add `emitProgress('retry', 'Refining response...')` before retry call

### File: `src/hooks/useEnhancedAIChatDB.ts`
- **#4 + #5:** Modify `saveMessage` to return the DB-generated `id`, then update local message state with it. Update `editMessage` and `deleteMessage` to use DB IDs.
- **#6:** Add a note/TODO or implement proper share token system
- **#8:** Add `.catch()` to title update `.then()` chain

### File: `src/hooks/useEnhancedAIChat.tsx`
- **#7:** Verify no active imports, then delete the file

