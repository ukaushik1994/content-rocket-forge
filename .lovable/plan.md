

# Phase 4: Topic Performance Tracking + Cluster-Gap Linking

## Context
Phase 3 is complete — topic clusters, content gaps, and strategy recommendations are all persisted to Supabase and accessible via the Research Intelligence sidebar panel. The `topic_performance` table exists in the DB but has zero frontend integration. Additionally, content gaps can be saved but aren't linked back to specific clusters.

## Plan

### Batch 1: Wire `topic_performance` Table + Cluster Performance View (this batch)

**1. Add `topic_performance` service functions to `researchIntelligenceService.ts`**
- `fetchTopicPerformance(userId, clusterId?, dateRange?)` — query `topic_performance` with optional cluster/date filters
- `createTopicPerformance(data)` — insert performance metrics
- Add `useTopicPerformance(clusterId?)` hook to `useResearchIntelligence.ts`

**2. Add Performance section to `ClusterDetailsModal.tsx`**
Currently this modal shows static content opportunities. Enhance it with:
- A "Performance" tab showing metrics from `topic_performance` (impressions, clicks, CTR, avg position) for the selected cluster
- Simple sparkline/trend visualization using existing recharts dependency
- Empty state when no performance data exists yet

**3. Link Content Gaps to Clusters**
Update `ContentGapsTab.tsx` and `ResearchIntelligencePanel.tsx` GapsTab:
- Add optional cluster selector dropdown when saving gaps (using `useClusters()` to populate options)
- Pass `target_cluster_id` when creating gaps
- In the Research Intelligence panel's Gaps tab, allow filtering by cluster

**4. Enhance TopicClusters page metrics cards**
Replace the hardcoded `'0'` values in the metrics cards on `TopicClusters.tsx` with aggregated data from `topic_performance`:
- Total Traffic = sum of clicks across all clusters
- Avg Position = weighted average from `topic_performance`
- These become live queries instead of static zeros

### Summary

| File | Action |
|------|--------|
| `src/services/researchIntelligenceService.ts` | Add `topic_performance` CRUD |
| `src/hooks/useResearchIntelligence.ts` | Add `useTopicPerformance` hook |
| `src/components/research/topic-clusters/ClusterDetailsModal.tsx` | Add Performance tab with charts |
| `src/components/research/content-strategy/tabs/ContentGapsTab.tsx` | Add cluster selector for gap linking |
| `src/components/panels/ResearchIntelligencePanel.tsx` | Add cluster filter to Gaps tab |
| `src/pages/research/TopicClusters.tsx` | Wire metrics cards to real performance data |

6 files. No new dependencies. No DB migrations needed.

