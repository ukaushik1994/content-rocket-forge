

# Phase 3 Batch 3: Wire Content Gaps to DB + Clean Up Dead Code

## What We're Doing

Two focused changes to complete the Research Intelligence data layer:

### 1. Persist Content Gaps to Supabase

**File: `src/components/research/content-strategy/tabs/ContentGapsTab.tsx`**

Currently, AI-generated content gaps are displayed but never saved to the `content_gaps` DB table. After analysis completes:
- Call `createContentGap()` from `researchIntelligenceService` for each gap returned by AI
- Map each gap string + opportunity score to a `content_gaps` row with `user_id`, `gap_title`, `opportunity_score`, and `target_cluster_id` (optional)
- Show previously saved gaps from DB below the analysis section using `useContentGaps()` hook
- Add a "Save Selected Gaps" action that persists only checked gaps

### 2. Delete Unused `TopicClustersTab.tsx`

**File: `src/components/research/content-strategy/tabs/TopicClustersTab.tsx`**

This component is entirely hardcoded mock data and is not imported anywhere. Remove it.

---

## Summary

| File | Action |
|------|--------|
| `ContentGapsTab.tsx` | Wire to `content_gaps` DB via hooks — persist + show saved gaps |
| `TopicClustersTab.tsx` | Delete (unused dead code) |

2 files. No new dependencies. No DB migrations needed.

