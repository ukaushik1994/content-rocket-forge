

# AI Chat: Remaining Bugs & Incomplete Features

After auditing the current implementation across hooks, components, edge functions, contexts, and database, here are the issues that remain.

---

## Critical — Will Break for Users

### 1. `ChatContextBridge` Queries Non-Existent Table with `as any` Cast
**Files:** `src/contexts/ChatContextBridge.tsx` lines 121, 149-174

The bridge queries `ai_context_state` using `supabase.from('ai_context_state' as any)`. The table exists in migrations but is NOT in the generated Supabase types (`types.ts`). The `as any` cast suppresses TypeScript errors but the queries silently fail at runtime. The `saveInterval` fires every 30 seconds, making failed upsert calls continuously. Similarly, `ai_context_snapshots` is queried with `as any` inside `saveContextSnapshot` and `loadContextSnapshot`.

**Fix:** Either regenerate Supabase types to include these tables, or remove the periodic save logic since it's non-critical and failing silently.

---

### 2. `ErrorMessageBubble` Crashes When `timestamp` Is a String
**File:** `src/components/ai-chat/ErrorMessageBubble.tsx` line 116

```tsx
message.timestamp.toLocaleTimeString(...)
```

When messages are loaded from the database, `timestamp` is set to `new Date(msg.created_at)` (a Date object). But error messages created inline use `new Date()` which is fine. However, if an error message gets persisted and reloaded, `msg.created_at` is a string. The `loadMessages` function correctly wraps it in `new Date()`, but the type says `timestamp: Date` while some code paths may pass a string. More critically, if `message.timestamp` is somehow invalid (e.g. `Invalid Date`), `toLocaleTimeString()` returns `"Invalid Date"` — an ugly but non-fatal display issue.

**Fix:** Add defensive `instanceof Date` check or wrap in `new Date()` before calling `toLocaleTimeString`.

---

### 3. `executeToolAction` Uses Blocking `supabase.functions.invoke` Instead of SSE
**File:** `src/hooks/useEnhancedAIChatDB.ts` lines 265-270

When `handleConfirmAction` calls `executeToolAction`, it uses the blocking `supabase.functions.invoke('enhanced-ai-chat', ...)` instead of the SSE fetch pattern. This means:
- No progress events — user sees "Executing..." with no updates
- No timeout protection (the 90s AbortController isn't used)
- If the edge function takes 30+ seconds for tool execution, Supabase's default invoke timeout may kill it

**Fix:** Refactor `executeToolAction` to use the same SSE fetch pattern as `sendMessage`.

---

### 4. Shared Conversation `type` Field Mismatch
**File:** `src/pages/SharedConversation.tsx` line 74

The query selects `type` from `ai_messages` and renders based on `message.type`. But the database column is `type` while the hook maps it to `role`. The SharedConversation page uses `type` directly for rendering (line 175+). This works but creates inconsistency — if the page tries to render with components that expect `role`, it will break.

**Fix:** Rename to use `role` consistently, or keep it isolated since SharedConversation has its own rendering.

---

## Medium — Degraded UX

### 5. No Cancel Button for In-Flight AI Requests
**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

The `abortControllerRef` exists in the hook, but there's no UI cancel button exposed to users. When the AI is processing (isTyping=true), the user has no way to stop a long-running request other than navigating away. The `ThinkingTextRotator` shows progress but has no cancel affordance.

**Fix:** Add a cancel/stop button next to the typing indicator that calls `abortControllerRef.current?.abort()`. Expose an `abortRequest` callback from the hook.

---

### 6. `createConversation` Makes Redundant `loadConversations` Call
**File:** `src/hooks/useEnhancedAIChatDB.ts` line 170

After inserting a new conversation and adding it to local state (line 164), the code immediately calls `await loadConversations()` which re-fetches ALL conversations from the database. This is redundant since the conversation was just added to state, and adds latency to every new chat start.

**Fix:** Remove `await loadConversations()` from `createConversation` since the local state is already updated.

---

### 7. `sendMessage` Re-Reads Full `messages` Array in Closure
**File:** `src/hooks/useEnhancedAIChatDB.ts` line 431

```ts
const allMessages = [...messages, userMessage];
```

The `messages` reference comes from the closure, not from the latest state. If `sendMessage` is called rapidly (e.g., quick action buttons triggering multiple sends), the second call sees the stale `messages` array from when the callback was created, potentially missing the first user message. The `useCallback` dependency on `[messages, ...]` recreates the callback on every message change, which is correct but creates excessive re-renders.

**Fix:** Use a ref to always read the latest messages, or use `setMessages` callback form to derive the conversation history.

---

### 8. `ChatContextBridge` `getContextSuggestions` Calls Non-Existent Edge Function
**File:** `src/contexts/ChatContextBridge.tsx` line 323

```ts
await supabase.functions.invoke('ai-context-manager', {...})
```

This edge function may or may not be deployed. If it's not, every call silently fails. The function is never called from any component