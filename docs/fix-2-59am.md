# Fix Plan — 2:59am March 20

> Analyst sidebar opens the same way on every conversation. Each conversation should have its own Analyst state.

---

## 4 Fixes

### FIX A: Stop Analyst auto-opening on every conversation switch

**Problem:** Switching conversations always triggers `wasEmpty && messages.length > 0` → Analyst force-opens every time.

**File 1:** `src/hooks/useEnhancedAIChatDB.ts`

Add a ref to track fresh conversations and expose it:

```ts
// Add near other refs (around line 50):
const justCreatedConversationRef = useRef(false);

// In createConversation function, after successful creation:
justCreatedConversationRef.current = true;

// In the return object:
return {
  ...existing,
  justCreatedConversation: justCreatedConversationRef,
};
```

**File 2:** `src/contexts/AIChatDBContext.tsx`

Add `justCreatedConversation` to the context type if needed.

**File 3:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Get the ref from the hook:
```ts
const { ..., justCreatedConversation } = useSharedAIChatDB();
```

Replace the auto-open logic (around line 305-316):

Find:
```ts
// Auto-open analyst panel on first message (0 → 1+)
if (wasEmpty && messages.length > 0) {
  setVisualizationData({
    visualData: { type: 'analyst' },
    chartConfig: null,
    title: 'Intelligence Panel',
    description: 'Charts & insights companion'
  });
  setShowVisualizationSidebar(true);
  setSidebarInteracted(true);
  setAnalystActive(true);
  return;
}
```

Replace with:
```ts
// Auto-open analyst ONLY for brand new conversations (user just created and sent first message)
if (wasEmpty && messages.length > 0 && justCreatedConversation.current) {
  justCreatedConversation.current = false;
  setVisualizationData({
    visualData: { type: 'analyst' },
    chartConfig: null,
    title: 'Intelligence Panel',
    description: 'Charts & insights companion'
  });
  setShowVisualizationSidebar(true);
  setSidebarInteracted(true);
  setAnalystActive(true);
  return;
}

// For loaded existing conversations — don't auto-open, just update message count
if (wasEmpty && messages.length > 0) {
  prevMessageCountRef.current = messages.length;
  return;
}
```

---

### FIX B: Reset Analyst engine state on conversation switch

**Problem:** `crossSignalInsights`, `anomalyInsights`, `previousSessionInsights` persist from previous conversation until memos recompute.

**File 1:** `src/hooks/useAnalystEngine.ts`

Add `activeConversationId` parameter:

Find the function signature:
```ts
export function useAnalystEngine(
  messages: EnhancedChatMessage[],
  userId: string | null,
  isActive: boolean,
  conversationTitle: string | null
): AnalystState {
```

Replace with:
```ts
export function useAnalystEngine(
  messages: EnhancedChatMessage[],
  userId: string | null,
  isActive: boolean,
  conversationTitle: string | null,
  activeConversationId: string | null
): AnalystState {
```

Add a reset effect inside the hook (after the state declarations):

```ts
// Reset conversation-specific state when conversation changes
const prevConversationIdRef = useRef<string | null>(null);
useEffect(() => {
  if (activeConversationId !== prevConversationIdRef.current) {
    prevConversationIdRef.current = activeConversationId;
    setCrossSignalInsights([]);
    setAnomalyInsights([]);
    setPreviousSessionInsights([]);
    lastFetchedTopicsRef.current = '';
    hasInitialFetchedRef.current = false;
    processedMessageIdsRef.current = new Set();
  }
}, [activeConversationId]);
```

**File 2:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Update the hook call (around line 177):

Find:
```ts
const analystState = useAnalystEngine(messages, user?.id || null, true, activeConvObj?.title || null);
```

Replace with:
```ts
const isAnalystVisible = showVisualizationSidebar && visualizationData?.visualData?.type === 'analyst';
const analystState = useAnalystEngine(messages, user?.id || null, isAnalystVisible, activeConvObj?.title || null, activeConversation);
```

This also implements FIX C (engine only runs when visible).

---

### FIX C: Engine only runs when Analyst sidebar is visible

**Already done in FIX B above** — changing `true` to `isAnalystVisible` means the engine's `isActive` flag is false when the sidebar shows a chart, wizard, or is closed. All the `useMemo` hooks inside the engine return empty arrays when `!isActive`, and `fetchPlatformData` skips when `!isActive`.

---

### FIX D: Save/restore Analyst open state per conversation

**Problem:** User opens Analyst in Conversation A, switches to B (Analyst closes), switches back to A — Analyst should reopen.

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Add helper functions at the top of the component:

```ts
const saveAnalystOpenState = (convId: string | null, isOpen: boolean) => {
  if (!convId) return;
  try {
    const stored = JSON.parse(localStorage.getItem('analyst_states') || '{}');
    stored[convId] = isOpen;
    const entries = Object.entries(stored);
    if (entries.length > 30) {
      localStorage.setItem('analyst_states', JSON.stringify(Object.fromEntries(entries.slice(-30))));
    } else {
      localStorage.setItem('analyst_states', JSON.stringify(stored));
    }
  } catch (_) {}
};

const getAnalystOpenState = (convId: string | null): boolean | null => {
  if (!convId) return null;
  try {
    const stored = JSON.parse(localStorage.getItem('analyst_states') || '{}');
    return stored[convId] ?? null;
  } catch { return null; }
};
```

Update the conversation switch reset effect (around line 352):

Find:
```ts
useEffect(() => {
  setUserClosedSidebar(false);
  setShowVisualizationSidebar(false);
  setSidebarInteracted(false);
  setVisualizationData(null);
  prevMessageCountRef.current = 0;
  setIsLoadingConversation(true);
  const timeout = setTimeout(() => setIsLoadingConversation(false), 300);
  return () => clearTimeout(timeout);
}, [activeConversation]);
```

Replace with:
```ts
useEffect(() => {
  setUserClosedSidebar(false);
  setSidebarInteracted(false);
  prevMessageCountRef.current = 0;
  setIsLoadingConversation(true);

  // Restore per-conversation Analyst state
  const wasOpen = getAnalystOpenState(activeConversation);
  if (wasOpen === true) {
    setVisualizationData({
      visualData: { type: 'analyst' },
      chartConfig: null,
      title: 'Intelligence Panel',
      description: 'Charts & insights companion'
    });
    setShowVisualizationSidebar(true);
    setAnalystActive(true);
  } else {
    setShowVisualizationSidebar(false);
    setVisualizationData(null);
    setAnalystActive(false);
  }

  const timeout = setTimeout(() => setIsLoadingConversation(false), 300);
  return () => clearTimeout(timeout);
}, [activeConversation]);
```

Save state when Analyst is opened/closed:

In `handleCloseSidebar`:
```ts
const handleCloseSidebar = () => {
  setShowVisualizationSidebar(false);
  setSidebarInteracted(false);
  setUserClosedSidebar(true);
  setAnalystActive(false);
  saveAnalystOpenState(activeConversation, false); // ADD THIS
};
```

Wherever Analyst is opened (the `onOpenAnalyst` handler, around line 795-802):
```ts
// After opening analyst:
saveAnalystOpenState(activeConversation, true); // ADD THIS
```

Also in the auto-open for new conversations (FIX A):
```ts
if (wasEmpty && messages.length > 0 && justCreatedConversation.current) {
  justCreatedConversation.current = false;
  // ... existing open logic ...
  saveAnalystOpenState(activeConversation, true); // ADD THIS
}
```

---

## Files Changed

| File | Changes |
|------|---------|
| `src/hooks/useEnhancedAIChatDB.ts` | Add `justCreatedConversationRef`, expose in return |
| `src/hooks/useAnalystEngine.ts` | Add `activeConversationId` param, add reset effect |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Fix A (auto-open guard), Fix B+C (engine isActive), Fix D (localStorage save/restore) |

## Backend

No backend changes needed. All fixes are frontend state management.

---

## Expected Behavior After Fix

| Action | Before | After |
|--------|--------|-------|
| Switch to existing Conversation A | Analyst auto-opens | Analyst opens only if it was open for A last time |
| Switch to Conversation B (never had Analyst) | Analyst auto-opens | Sidebar stays closed |
| Create new conversation, send first message | Analyst auto-opens | Analyst auto-opens (correct — new conversation) |
| Open Analyst in A, switch to B, switch back to A | Analyst opens with B's stale data | Analyst opens with A's fresh data (engine reset + recompute) |
| Close Analyst in A, switch away, switch back | Analyst re-opens | Analyst stays closed (remembered) |
| Analyst closed, ask "show my content" | Engine still runs in background | Engine doesn't run (saves CPU/DB queries) |
