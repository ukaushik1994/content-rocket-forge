

# AI Chat Bug Fix Plan — 10 Issues, 3 Phases

## Phase 1: Critical Functional Bugs (Issues 1, 2, 3)

### Fix 1 — Error Retry Button Never Renders
**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 510-521)

`EnhancedMessageBubble` is rendered without `onRetry`. The component (line 73) only shows `ErrorMessageBubble` when both `messageStatus === 'error'` AND `onRetry` is truthy.

**Change:** Add `onRetry` prop to `EnhancedMessageBubble` in the messages map. The callback should find the last user message before the error message and re-send it:
```
onRetry={() => {
  const idx = messages.findIndex(m => m.id === message.id);
  const lastUserMsg = messages.slice(0, idx).reverse().find(m => m.role === 'user');
  if (lastUserMsg) sendMessage(lastUserMsg.content);
}}
```

### Fix 2 — Edit Message Creates Duplicate Messages
**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 1042-1097)

`editMessage` calls `sendMessage(newContent)` which creates a NEW user message + AI response. The edited message stays, plus a duplicate appears.

**Change:** Instead of calling `sendMessage`, directly invoke the edge function with the existing conversation history (with the edited content substituted in). Build `conversationHistory` from `messages` state (replacing the edited message's content), then run the same fetch+SSE logic that `sendMessage` uses. Extract the SSE fetch into a shared helper `invokeAIStream(conversationHistory, conversationId)` that both `sendMessage` and `editMessage` can call. After the AI responds, insert the assistant message right after the edited message's position (not appended).

### Fix 3 — SSE Timeout Clears Too Early
**File:** `src/hooks/useEnhancedAIChatDB.ts` (line 488)

`clearTimeout(timeoutId)` fires after `fetch()` resolves headers, not after streaming completes.

**Change:** Move `clearTimeout(timeoutId)` from line 488 to after the `while(true)` reader loop (after line 531), inside a `finally` block wrapping the reader loop.

---

## Phase 2: Medium Severity Fixes (Issues 4, 5, 7, 8)

### Fix 4 — `open_settings` Event Detail Malformed
**File:** `src/hooks/useEnhancedAIChatDB.ts` (line 655)

Currently: `{ detail: action.data?.tab || 'api' }` — detail is a string.
Listener in `AIChat.tsx` expects: `event.detail?.tab`.

**Change:** `{ detail: { tab: action.data?.tab || 'api' } }`

### Fix 5 — `RateLimitBanner` Retry Is a No-Op
**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` (line 422)

Currently logs to console.

**Change:** Wire it to retry the last failed message:
```tsx
onRetry={() => {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  if (lastUserMsg) sendMessage(lastUserMsg.content);
}}
```

### Fix 6 — `setMessageSearchResults` Inside `useMemo`
**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` (line 95)

`setState` inside `useMemo` is a React anti-pattern causing potential infinite loops.

**Change:** Split into a `useMemo` for the filtered IDs and a `useEffect` to sync them to state. Or simply compute `messageSearchResults` as a derived `useMemo` value and remove the separate state entirely:
```tsx
const messageSearchResults = useMemo(() => {
  if (!messageSearchQuery.trim()) return [];
  const q = messageSearchQuery.toLowerCase();
  return messages.filter(m => m.content.toLowerCase().includes(q)).map(m => m.id);
}, [messages, messageSearchQuery]);
```
Remove the `useState` for `messageSearchResults`.

### Fix 7 — Title Truncation at Word Boundary
**File:** `src/hooks/useEnhancedAIChatDB.ts` (line 406)

Currently slices at exactly 40 chars, potentially mid-word.

**Change:** Truncate at last space before 40 chars:
```ts
const rawTitle = content.slice(0, 50);
const title = rawTitle.length > 40
  ? rawTitle.slice(0, rawTitle.lastIndexOf(' ', 40) || 40) + '...'
  : rawTitle;
```

---

## Phase 3: Dead Code Cleanup (Issues 6, 9, 10)

### Fix 8 — Remove `StreamingMessageBubble` and `InfiniteScrollMessages`
**Files to delete:**
- `src/components/ai-chat/StreamingMessageBubble.tsx`
- `src/components/ai-chat/InfiniteScrollMessages.tsx`

Neither is used by `EnhancedChatInterface`. Verify no other active imports exist first.

### Fix 9 — Remove Dead `ChatContextBridge` (or Sync It)
**File:** `src/contexts/ChatContextBridge.tsx`

`ChatContextBridge` maintains `activeConversationId`, `sharedMessages`, `messageStatuses` that are never synced from the real source of truth (`useEnhancedAIChatDB`). Components using it (`ContextSnapshotPanel`, `RealTimeCollaboration`, `EnhancedContextSidebar`, `AdvancedChatFeatures`) get stale/empty data.

**Change:** Add a `useEffect` bridge inside `ChatContextBridgeProvider` that reads from `useSharedAIChatDB()` and syncs `activeConversationId` and `sharedMessages` to the bridge state. This requires `ChatContextBridgeProvider` to be rendered inside `AIChatDBProvider` (verify in `App.tsx`).

### Fix 10 — Remove Dead `enhancedAIService.processEnhancedMessage`
**File:** `src/services/enhancedAIService.ts`

The `processEnhancedMessage` method and related helpers are never called by the active chat. Keep only `getWorkflowState` and `updateWorkflowState`.

---

## Implementation Order

1. **Phase 1** first — these are user-facing broken features (retry, edit, timeout).
2. **Phase 2** second — medium bugs that degrade UX.
3. **Phase 3** last — cleanup that reduces confusion and bundle size.

No database migrations needed. No edge function changes. All fixes are frontend-only.

