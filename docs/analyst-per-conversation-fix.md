# Fix: Analyst Sidebar Opening Same Way on Every Conversation

## The Problem

When you switch conversations, the Analyst sidebar opens with the same view regardless of which conversation you're in. The narrative timeline sections don't reflect the current conversation's data — they show stale data from the previous computation until the engine re-processes.

## Root Cause

Three issues compound:

### Issue A: Auto-open triggers on every conversation switch

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — line 305-316

```ts
// Auto-open analyst panel on first message (0 → 1+)
if (wasEmpty && messages.length > 0) {
  setVisualizationData({ visualData: { type: 'analyst' }, ... });
  setShowVisualizationSidebar(true);
  setAnalystActive(true);
  return;
}
```

When switching conversations:
1. Reset effect sets messages to `[]` → `prevMessageCountRef = 0` → `wasEmpty = true`
2. Messages load from DB → `messages.length > 0` becomes true
3. This condition fires EVERY time → Analyst sidebar auto-opens on EVERY conversation switch

### Issue B: `useAnalystEngine` is always-on with `isActive = true`

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — line 177

```ts
const analystState = useAnalystEngine(messages, user?.id || null, true, ...);
```

The third parameter is hardcoded to `true`. The engine always runs, always fetches platform data, always computes health scores — even when the Analyst sidebar is closed. This means the engine has state from the previous conversation's computation until it fully re-processes the new conversation's messages.

### Issue C: Analyst state is not per-conversation

The `useAnalystEngine` hook uses `useState` internally — all state (`topics`, `insightsFeed`, `cumulativeMetrics`, `platformData`, etc.) is global to the component. When messages change (conversation switch), the `useMemo` hooks re-compute from the new messages, but:
- `platformData` (fetched from DB) persists across switches because it's user-level data, not conversation-level
- `crossSignalInsights` and `anomalyInsights` persist until the useEffect re-runs
- The health score persists until platformData triggers a re-computation
- `previousSessionInsights` persist because they're from localStorage

So when you switch from Conversation A (about content) to Conversation B (about keywords), the Analyst briefly shows content-related topics/insights from A until the engine processes B's messages.

---

## Fix Plan

### FIX A: Don't auto-open Analyst on conversation switch — only on genuinely new first message

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

The problem is distinguishing "messages loaded from DB for an existing conversation" from "user sent the very first message in a new conversation."

Add a ref to track whether this is a fresh conversation (just created) vs loaded:

```tsx
const freshConversationRef = useRef(false);
```

In `createConversation` (wherever it's called in this component or passed down), set:
```tsx
freshConversationRef.current = true;
```

In the reset effect (line 352), DON'T set freshConversation:
```tsx
useEffect(() => {
  setUserClosedSidebar(false);
  setShowVisualizationSidebar(false);
  setSidebarInteracted(false);
  setVisualizationData(null);
  prevMessageCountRef.current = 0;
  setIsLoadingConversation(true);
  // Don't set freshConversationRef here — only createConversation sets it
  const timeout = setTimeout(() => setIsLoadingConversation(false), 300);
  return () => clearTimeout(timeout);
}, [activeConversation]);
```

Change the auto-open logic (line 305-316):
```tsx
// Auto-open analyst panel ONLY when user sends their first message in a NEW conversation
// NOT when loading an existing conversation's history
if (wasEmpty && messages.length > 0 && freshConversationRef.current) {
  freshConversationRef.current = false; // Only once
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

// For loaded conversations, don't auto-open
if (wasEmpty && messages.length > 0 && !freshConversationRef.current) {
  // Existing conversation loaded — don't force open sidebar
  prevMessageCountRef.current = messages.length;
  return;
}
```

**But where is `createConversation` called from in this component?** It comes from the hook via `useSharedAIChatDB`. The hook's `sendMessage` calls `createConversation` internally when `activeConversation` is null. We need to expose a signal.

Simpler approach — track via the hook:

**File:** `src/hooks/useEnhancedAIChatDB.ts`

Add a ref and expose it:
```tsx
const justCreatedConversationRef = useRef(false);

// In createConversation:
const createConversation = useCallback(async (title: string = "New Chat") => {
  // ... existing code ...
  justCreatedConversationRef.current = true; // Mark as fresh
  return data.id;
}, [...]);

// In the return:
return {
  ...existing,
  justCreatedConversation: justCreatedConversationRef.current,
  clearJustCreated: () => { justCreatedConversationRef.current = false; },
};
```

Then in `EnhancedChatInterface.tsx`:
```tsx
const { ..., justCreatedConversation, clearJustCreated } = useSharedAIChatDB();

// In auto-open effect:
if (wasEmpty && messages.length > 0 && justCreatedConversation) {
  clearJustCreated();
  // ... open analyst ...
}
```

---

### FIX B: Reset engine state on conversation switch

**File:** `src/hooks/useAnalystEngine.ts`

The engine's `platformData`, `crossSignalInsights`, `anomalyInsights`, and `previousSessionInsights` need to reset when the conversation changes. The engine currently doesn't know when the conversation switches — it only sees `messages` change.

Add `activeConversationId` as a parameter:

```ts
export function useAnalystEngine(
  messages: EnhancedChatMessage[],
  userId: string | null,
  isActive: boolean,
  conversationTitle: string | null,
  activeConversationId: string | null  // NEW
): AnalystState {
```

Add a reset effect:
```ts
// Reset conversation-specific state when conversation changes
const prevConversationIdRef = useRef<string | null>(null);
useEffect(() => {
  if (activeConversationId !== prevConversationIdRef.current) {
    prevConversationIdRef.current = activeConversationId;
    // Reset conversation-level state (keep platform data since it's user-level)
    setCrossSignalInsights([]);
    setAnomalyInsights([]);
    setPreviousSessionInsights([]);
    // Reset the fetch guard so platform data re-fetches
    lastFetchedTopicsRef.current = '';
    hasInitialFetchedRef.current = false;
    processedMessageIdsRef.current = new Set();
  }
}, [activeConversationId]);
```

Pass from `EnhancedChatInterface.tsx`:
```tsx
const analystState = useAnalystEngine(
  messages,
  user?.id || null,
  true,
  activeConvObj?.title || null,
  activeConversation  // Pass conversation ID
);
```

---

### FIX C: Only run Analyst engine when sidebar is open

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — line 177

Current:
```tsx
const analystState = useAnalystEngine(messages, user?.id || null, true, ...);
```

The `isActive` parameter is hardcoded `true`. This means the engine runs ALL the time — even when the Analyst sidebar is closed. It fetches platform data, runs anomaly detection, computes health scores — all wasted work.

Change to:
```tsx
const isAnalystVisible = showVisualizationSidebar && visualizationData?.visualData?.type === 'analyst';
const analystState = useAnalystEngine(
  messages,
  user?.id || null,
  isAnalystVisible,  // Only active when sidebar is actually showing analyst
  activeConvObj?.title || null,
  activeConversation
);
```

**But:** The `setAnalystActive(true)` call in the hook (line 315) tells the edge function to include analyst-enriched context. This should still work — it's a separate flag sent to the backend. The engine's `isActive` controls client-side computation only.

---

### FIX D: Save/restore Analyst open state per conversation

For users who explicitly open the Analyst in Conversation A and then switch to B and back — they expect A to still have the Analyst open.

**Option 1: Simple — localStorage map**

```tsx
// When Analyst is toggled, save state per conversation
const saveAnalystState = (convId: string, isOpen: boolean) => {
  const stored = JSON.parse(localStorage.getItem('analyst_open_states') || '{}');
  stored[convId] = isOpen;
  // Keep only last 20 entries
  const entries = Object.entries(stored);
  if (entries.length > 20) {
    const trimmed = Object.fromEntries(entries.slice(-20));
    localStorage.setItem('analyst_open_states', JSON.stringify(trimmed));
  } else {
    localStorage.setItem('analyst_open_states', JSON.stringify(stored));
  }
};

const getAnalystState = (convId: string): boolean => {
  const stored = JSON.parse(localStorage.getItem('analyst_open_states') || '{}');
  return stored[convId] === true;
};
```

In the reset effect (conversation switch):
```tsx
useEffect(() => {
  setUserClosedSidebar(false);
  setSidebarInteracted(false);
  prevMessageCountRef.current = 0;
  setIsLoadingConversation(true);

  // Restore per-conversation analyst state
  if (activeConversation && getAnalystState(activeConversation)) {
    setVisualizationData({ visualData: { type: 'analyst' }, chartConfig: null, title: 'Intelligence Panel', description: '' });
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

When Analyst is opened/closed:
```tsx
const handleCloseSidebar = () => {
  setShowVisualizationSidebar(false);
  setSidebarInteracted(false);
  setUserClosedSidebar(true);
  setAnalystActive(false);
  if (activeConversation) saveAnalystState(activeConversation, false);
};

// When opening analyst:
if (activeConversation) saveAnalystState(activeConversation, true);
```

**Option 2: DB column** — add `analyst_open BOOLEAN` to `ai_conversations`. Heavier, survives localStorage clears, but adds a DB write on every toggle. Not worth it for this.

---

## Implementation Summary

| Fix | What it solves | File(s) | Effort |
|-----|---------------|---------|--------|
| **A** | Analyst stops auto-opening on every conversation switch | `EnhancedChatInterface.tsx` + `useEnhancedAIChatDB.ts` | 20 min |
| **B** | Engine resets conversation-specific state (cross-signals, anomalies) on switch | `useAnalystEngine.ts` + `EnhancedChatInterface.tsx` | 15 min |
| **C** | Engine only runs when sidebar is actually visible (saves CPU/DB queries) | `EnhancedChatInterface.tsx` | 5 min |
| **D** | Analyst open/close state persists per conversation | `EnhancedChatInterface.tsx` | 15 min |

**Total: ~55 minutes.**

### What happens after all 4 fixes:

1. **Switch to Conversation A** → If Analyst was open here before, it reopens with A's data. If not, sidebar stays closed.
2. **Switch to Conversation B** → Analyst sidebar closes (or opens if it was open for B). Engine resets and re-processes B's messages. No stale data from A.
3. **Send first message in brand new conversation** → Analyst auto-opens (fresh conversation signal). This is the ONLY time it auto-opens.
4. **Close Analyst and switch away, switch back** → Analyst stays closed (remembered per conversation).
5. **Engine doesn't run when sidebar is closed** → No wasted DB queries or computations.
