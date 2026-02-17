

# Fix Plan: AI Chat Action Engine - Critical Bugs

## End-to-End Test Results

Testing revealed **3 critical bugs** that completely break the action engine when used via `useEnhancedAIChat.tsx`. The unified chat (`useUnifiedChatDB.ts`) works correctly, but the enhanced chat hook is broken.

---

## Bug 1: Request Body Format Mismatch (CRITICAL - Breaks All Requests)

**Problem:** `useEnhancedAIChat.tsx` sends:
```
{ message: content, conversationHistory: [...], userId: user.id }
```
But the edge function validates with Zod and expects:
```
{ messages: [{ role: "user", content: "..." }] }
```
This means every request from `useEnhancedAIChat.tsx` fails with a **400 validation error**.

**Fix:** Update `useEnhancedAIChat.tsx` `sendMessage` to format the body as `{ messages: [...] }` matching the schema.

---

## Bug 2: Response Field Name Mismatch (CRITICAL - No Content Displayed)

**Problem:** `useEnhancedAIChat.tsx` reads `data.response` (line 53) for the assistant message content. But the edge function returns `data.message` and `data.content` -- there is no `response` field. Result: every response shows "No response received".

**Fix:** Change `data.response` to `data.message || data.content` in `useEnhancedAIChat.tsx`.

---

## Bug 3: `globalThis` Pollution for Promoted Actions (MODERATE - Race Condition)

**Problem:** The action promotion system uses `(globalThis as any).__promotedToolActions` to pass data between the tool execution block (line 2091) and the response builder (line 3015). In a serverless environment, `globalThis` persists across requests on the same isolate. If two requests hit the same isolate, one request could pick up another's promoted actions.

**Fix:** Replace `globalThis` with a local variable passed through the function scope. Since the tool execution and response building happen in the same `serve()` handler, a local variable scoped to the request is sufficient.

---

## Files to Modify

| File | Change |
|---|---|
| `src/hooks/useEnhancedAIChat.tsx` | Fix request body format + response field name |
| `supabase/functions/enhanced-ai-chat/index.ts` | Replace globalThis with request-scoped variable for promoted actions |

---

## Technical Details

### useEnhancedAIChat.tsx Changes

**sendMessage function -- request body fix:**
```typescript
// BEFORE (broken):
body: {
  message: content,
  conversationHistory: messages.slice(-10),
  userId: user.id
}

// AFTER (correct):
body: {
  messages: [
    ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content }
  ]
}
```

**sendMessage function -- response field fix:**
```typescript
// BEFORE (broken):
content: data.response || 'No response received',

// AFTER (correct):
content: data.message || data.content || 'No response received',
```

### index.ts Changes

Replace the `globalThis.__promotedToolActions` pattern with a local `let promotedToolActions: any[] = []` declared at the top of the request handler, populated after tool execution, and used directly when building the response. No globalThis needed.

