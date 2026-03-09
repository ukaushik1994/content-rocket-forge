

# Phase 5: Cluster-Gap Traceability + Delete/Status Management for Content Gaps

## Context

The Research Intelligence system is functionally complete: clusters, gaps, recommendations, and performance tracking are all wired to Supabase. However several gaps remain in the day-to-day usability:

1. **Content gaps cannot be deleted or have their status updated** from the UI -- the service functions `deleteContentGap` and `updateContentGap` exist but are never called from any component.
2. **The `dbRowToTopicCluster` mapper** returns hardcoded `keywords: []`, `totalTraffic: 0`, and `avgPosition: 0`, meaning cluster cards always show zero traffic/position even when `topic_performance` data exists.
3. **The ResearchIntelligencePanel GapsTab** has no actions on individual gaps (no delete, no status change).
4. **Recommendations query cache** is not invalidated after the edge function generates new ones, so the user has to manually refresh.

## Plan

### 1. Add gap management actions to ResearchIntelligencePanel GapsTab

**File: `src/components/panels/ResearchIntelligencePanel.tsx`**

- Add delete button (trash icon) per gap card, calling `deleteContentGap` from the service
- Add a status badge that toggles between `identified` / `in_progress` / `resolved` via `updateContentGap`
- Wire these through new mutations in `useContentGaps` hook

### 2. Extend `useContentGaps` hook with delete and update mutations

**File: `src/hooks/useResearchIntelligence.ts`**

- Add `updateMutation` wrapping `svc.updateContentGap(id, updates)`
- Add `deleteMutation` wrapping `svc.deleteContentGap(id)`
- Return `update` and `remove` alongside existing `create`

### 3. Auto-invalidate recommendations after edge function completes

**File: `src/components/research/content-strategy/tabs/ContentGapsTab.tsx`**

- After the `.then()` callback on `generate-strategy-recommendations`, invalidate the `strategy_recommendations` query key so the Recs tab auto-refreshes

### 4. Enrich `dbRowToTopicCluster` with real performance data

**File: `src/types/topicCluster.ts`** and **`src/pages/research/TopicClusters.tsx`**

- Update `dbRowToTopicCluster` to accept optional performance summary (totalClicks, avgPosition)
- In `TopicClusters.tsx`, group `perfData` by cluster and pass per-cluster totals into the mapper so cluster cards show real traffic/position

## Summary

| File | Action |
|------|--------|
| `src/hooks/useResearchIntelligence.ts` | Add `update` and `remove` to `useContentGaps` |
| `src/components/panels/ResearchIntelligencePanel.tsx` | Add delete + status toggle per gap |
| `src/components/research/content-strategy/tabs/ContentGapsTab.tsx` | Invalidate recs cache after generation |
| `src/types/topicCluster.ts` | Accept optional perf data in mapper |
| `src/pages/research/TopicClusters.tsx` | Pass per-cluster perf into mapper |

5 files. No new dependencies. No DB migrations needed.

