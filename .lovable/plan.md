

# Phase 5: Surface Silent Failures

4 items — all focused on making hidden errors visible to users.

---

## 5A: Content Enrichment Failure Warnings

**Problem**: In `content-action-tools.ts` line ~645, 7 parallel queries run via `Promise.allSettled()`. If any fail, the code silently skips them — user never knows their brand voice or competitor data was missing from generation.

**Fix**: After the `Promise.allSettled` block (~line 678), collect names of rejected/errored promises. If any failed, append a note to the AI response: "⚠️ Some context was unavailable: [brand voice, competitors, etc.]. Results may be less personalized."

**File**: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

---

## 5B: Analyst Stale Data Indicator

**Problem**: `AnalystState` exposes `lastUpdated` and `isEnriching` but the timeline UI never shows data age or refresh errors.

**Fix**:
1. In `useAnalystEngine.ts`, add `lastRefreshError: string | null` to state. Set it in the fetch catch blocks. Expose in the return object and `AnalystState` interface.
2. In `AnalystNarrativeTimeline.tsx`, add a small status line at the top: "Last updated Xm ago" (from `lastUpdated`) and "⚠️ Refresh failed" if `lastRefreshError` is set.

**Files**: `src/hooks/useAnalystEngine.ts`, `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`

---

## 5C: Session Memory Timestamp Fix

**Problem**: In `saveSessionMemory` (line 835), insights are saved with `timestamp: new Date()` — overwriting the real timestamp. When restored, they show as "Previous session: ..." but appear fresh in timeline sorting.

**Fix**: In `saveSessionMemory`, preserve original `i.timestamp` instead of `new Date()`. In `loadSessionMemory`, prefix content with time-ago string (e.g., "2h ago: ...") instead of just "Previous session:".

**File**: `src/hooks/useAnalystEngine.ts`

---

## 5D: File Upload Bucket Error Toast

**Problem**: In `FileUploadHandler.tsx` lines 104-107, when storage upload fails (e.g., missing bucket), it logs a `console.warn` and continues silently. User doesn't know their file wasn't stored.

**Fix**: Show a non-blocking info toast: "File analyzed but not stored — storage unavailable". Keep the analysis flow running (don't break it), just inform the user.

**File**: `src/components/ai-chat/FileUploadHandler.tsx`

---

## Deploy

- Edge function `enhanced-ai-chat` after 5A
- Frontend-only for 5B, 5C, 5D

