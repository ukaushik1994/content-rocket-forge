

# Fix Remaining 4 AI Chat Issues

## Issue 1 — SharedConversation `type` vs `role` Mismatch
**File:** `src/pages/SharedConversation.tsx`

The page queries `type` from `ai_messages` and uses `message.type` for rendering (line 184: `message.type === 'user'`). This actually works correctly since `type` is the real DB column. No functional bug here — just inconsistency with the hook which maps `type` to `role`. 

**Change:** Rename `type` to `role` in the message mapping (line 82-85) for consistency:
```ts
messages: (messagesData || []).map(msg => ({
  ...msg,
  role: msg.type as 'user' | 'assistant' | 'system'
}))
```
Then update all `message.type` references in the JSX (lines 184, 190-191, 197) to `message.role`.

---

## Issue 2 — `messageStatus` Not Persisted to DB
**File:** `src/hooks/useEnhancedAIChatDB.ts` — `saveMessage` (line 240)

Currently hardcodes `status: 'completed'` for all messages. Error messages with `messageStatus: 'error'` lose their retry button on reload.

**Change:** In `saveMessage`, map the message's `messageStatus` field to the DB `status` column:
```ts
status: message.messageStatus === 'error' ? 'error' : 'completed'
```
In `loadMessages`, read back the `status` column and map it to `messageStatus` on the loaded message objects so error messages re-render with the retry button.

---

## Issue 3 — `deleteMessage` Leaves Orphaned Assistant Responses
**File:** `src/hooks/useEnhancedAIChatDB.ts` — `deleteMessage` (lines 1307-1335)

When a user message is deleted, the subsequent assistant response remains, creating a confusing dangling reply.

**Change:** After identifying the message to delete, check if it's a user message. If so, find the next message in `messages` state — if it's an assistant message, delete that too (both from DB and local state). Single DB call with `.in('id', [messageId, nextAssistantId])`.

---

## Issue 4 — Hardcoded Supabase URL/Key in 3 Places
**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 281-282, 551-552, 1194-1195)

The Supabase URL and anon key are duplicated as inline fallbacks in `executeToolAction`, `sendMessage`, and `editMessage`.

**Change:** Extract to module-level constants at the top of the file:
```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '...';
```
Replace all 3 inline declarations with these constants. Also create a shared helper:
```ts
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || SUPABASE_KEY;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'apikey': SUPABASE_KEY,
  };
}
```
Use in all 3 fetch calls.

---

## Implementation Order
1. Issue 4 first (constants extraction) — reduces diff noise for other changes
2. Issue 2 (status persistence) — functional fix
3. Issue 3 (orphan cleanup) — functional fix  
4. Issue 1 (SharedConversation) — consistency fix

## Files Modified
- `src/hooks/useEnhancedAIChatDB.ts` — issues 2, 3, 4
- `src/pages/SharedConversation.tsx` — issue 1

