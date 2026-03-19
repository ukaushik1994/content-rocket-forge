

# AI Chat Enhancement — 7 Problems, 4 Phases

Based on the uploaded analysis document. All problems verified against the current codebase.

---

## Phase 1: Fix Broken UX (Problems 1, 2, 5)
**Scope:** Frontend only — `EnhancedChatInterface.tsx`

**Problem 1 — Sidebar state bleeds across conversations**
- Line 324-327: The conversation-switch effect only resets `userClosedSidebar`
- Fix: Also reset `isAnalystPanelActive`, `showVisualizationSidebar`, `sidebarInteracted`, and `visualizationData`

**Problem 2 — Sidebar auto-opens on old conversations**
- Lines 279-322: The auto-open effect fires on every `messages` change, including loaded history
- Fix: Add `prevMessageCountRef` to track message count. Only auto-open sidebar when a genuinely new message arrives (count increased from a non-zero baseline). On conversation load, close sidebar unless user explicitly interacted.
- Also reset `prevMessageCountRef` to 0 on conversation switch.

**Problem 5 — Welcome screen flash on conversation switch**
- Fix: Add `isLoadingConversation` state. Set true when switching conversations, false after messages load (with 300ms fallback). Show a skeleton placeholder (3 alternating-width rounded blocks) instead of the welcome screen during loading.

---

## Phase 2: Improve AI Response Quality (Problem 3)
**Scope:** Edge function — `enhanced-ai-chat/index.ts`

**3a — Conditional `<think>` tags**
- Currently the BASE_PROMPT forces `<think>` on all providers
- Fix: Extract thinking instruction into a separate block. Only inject it for Anthropic/Claude models. Other providers get a simpler "go straight to your answer" instruction.

**3b — Smart visualization guidance**
- Currently a blanket "ALWAYS include visualData" mandate
- Fix: Replace with decision criteria — charts only when 3+ data points benefit from comparison. No charts for simple counts, yes/no, single lookups, or conversational responses.

**3c — Response length adapts to query scope**
- Fix: After query intent is determined, inject length guidance:
  - Conversational: under 100 words
  - Summary: under 200 words
  - Detailed: 200-500 words
  - Full: as thorough as needed

Requires redeployment of the `enhanced-ai-chat` edge function.

---

## Phase 3: Background Job Notifications (Problem 4)
**Scope:** 4 edge functions

Add a shared `notifyUser` helper that inserts into `dashboard_alerts`. Apply to:

| Function | Notification |
|---|---|
| `engage-email-send` | Success/failure after campaign send |
| `process-content-queue` | Completion count after queue processing |
| `engage-social-poster` | Posts processed count |
| `engage-journey-processor` | Journey step execution count |

Each notification is non-blocking (fire-and-forget). `engage-email-send` and social/journey functions resolve `user_id` from `team_members` via `workspace_id`. `process-content-queue` uses `user_id` directly from queue items.

Requires redeployment of all 4 edge functions.

---

## Phase 4: Polish (Problems 6, 7)
**Scope:** Frontend only

**Problem 6 — Notification aggregation**
- Currently no grouping logic exists
- Fix: Add `groupNotifications()` in the notifications hook/service that groups by `title + hour`. Display count badge (e.g., "Content generated (12 items)") instead of 50 individual entries.

**Problem 7 — Tool results look identical to AI opinion**
- Fix: In `EnhancedMessageBubble.tsx`, add a small label ("Data Analysis" or "Action Result") with a colored dot before messages that have `visualData` or `actions`, distinguishing data-backed responses from conversational ones.

---

## Summary

| Phase | Problems | Files Changed | Type |
|-------|----------|--------------|------|
| 1 | 1, 2, 5 | `EnhancedChatInterface.tsx` | Frontend |
| 2 | 3a, 3b, 3c | `enhanced-ai-chat/index.ts` | Edge function |
| 3 | 4 | 4 edge functions | Edge functions |
| 4 | 6, 7 | Notifications service + `EnhancedMessageBubble.tsx` | Frontend |

