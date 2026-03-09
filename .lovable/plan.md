

# Phase 3: Research Intelligence — Wire DB + Service Layer + Sidebar Access

## Current State
- **DB tables exist**: `topic_clusters`, `content_gaps`, `strategy_recommendations`, `topic_performance` — all with RLS and proper schemas
- **UI components exist**: `TopicClusterCard`, `CreateClusterModal`, `ClusterDetailsModal`, `ContentGapsTab`, `StrategyDashboard`
- **Zero DB queries** — no file calls `.from('topic_clusters')`, `.from('content_gaps')`, or `.from('strategy_recommendations')`
- **Frontend type mismatch** — `TopicCluster` interface in `src/types/topicCluster.ts` doesn't match the DB schema (e.g., DB has `cluster_name`, frontend has `name`)
- **No sidebar entry** — Topic Clusters and Research Intelligence aren't accessible from the chat sidebar

## Implementation Plan (3 batches)

### Batch 1: Service Layer + Type Alignment (this batch)

**1. Create `src/services/researchIntelligenceService.ts`**
CRUD service for all three tables:
- `fetchTopicClusters(userId)` → query `topic_clusters` with `content_gaps` count
- `createTopicCluster(data)` / `updateTopicCluster` / `deleteTopicCluster`
- `fetchContentGaps(userId, clusterId?)` → query `content_gaps` ordered by opportunity_score
- `createContentGap(data)` / `updateContentGap` / `deleteContentGap`
- `fetchStrategyRecommendations(userId)` → query `strategy_recommendations` with status filter
- `acceptRecommendation(id)` / `dismissRecommendation(id)`

**2. Update `src/types/topicCluster.ts`**
Align the `TopicCluster` interface to match DB columns:
- `name` → `cluster_name`
- Add `user_id`, `importance_score`, `parent_cluster_id`, `topic_count`
- Add mapper functions `dbToTopicCluster()` and `topicClusterToDb()` for backward compat with existing card components

**3. Create `src/hooks/useResearchIntelligence.ts`**
React Query hook wrapping the service:
- `useClusters()` — fetch + create + delete with cache invalidation
- `useContentGaps(clusterId?)` — fetch gaps with optional cluster filter
- `useRecommendations()` — fetch + accept/dismiss

**4. Add sidebar entry in `ChatHistorySidebar.tsx`**
Add "Research" item to the `toolsItems` array:
```
{ icon: <Brain />, label: 'Research', action: () => handlePanel('research_intelligence') }
```

**5. Create `src/components/panels/ResearchIntelligencePanel.tsx`**
Panel with 3 tabs:
- **Clusters** — list of `TopicClusterCard` items + "Create Cluster" button, wired to real DB
- **Content Gaps** — reuses `ContentGapsTab` but also shows saved gaps from DB
- **Recommendations** — cards showing AI strategy recommendations with Accept/Dismiss actions

**6. Register panel in `VisualizationSidebar.tsx`**
Add `case 'research_intelligence'` rendering `ResearchIntelligencePanel`

---

### Summary

| File | Action |
|------|--------|
| New `src/services/researchIntelligenceService.ts` | CRUD for 3 DB tables |
| New `src/hooks/useResearchIntelligence.ts` | React Query wrapper |
| New `src/components/panels/ResearchIntelligencePanel.tsx` | 3-tab panel |
| `src/types/topicCluster.ts` | Align types to DB schema + mappers |
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Add Research sidebar item |
| `src/components/ai-chat/VisualizationSidebar.tsx` | Register panel |

6 files. No new dependencies. No DB migrations needed — tables already exist.

