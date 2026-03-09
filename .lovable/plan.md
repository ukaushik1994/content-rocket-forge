

# Phase 3 Batch 2: Wire TopicClusters Page to Supabase

## Problem
The `TopicClusters.tsx` page and its child components (`CreateClusterModal`, `ClusterDetailsModal`) use `topicClusterService.ts` which stores everything in **localStorage**. Meanwhile, the Supabase `topic_clusters` table exists and the new `researchIntelligenceService.ts` + `useResearchIntelligence.ts` hooks already provide proper DB CRUD. These two systems are disconnected.

## Plan

### 1. Rewrite `topicClusterService.ts` to use Supabase
Replace the localStorage-based `TopicClusterService` class with functions that delegate to `researchIntelligenceService.ts` (or call Supabase directly). Map the `TopicCluster` frontend interface to/from DB rows using the existing `dbRowToTopicCluster` mapper.

Key changes:
- `getClusters()` becomes async, calls `fetchTopicClusters(userId)`
- `createCluster()` calls `createTopicCluster()` with mapped fields
- `deleteCluster()` calls `deleteTopicCluster()`
- `updateCluster()` calls `updateTopicCluster()`
- `getCluster()` fetches single cluster by ID
- `getPerformanceMetrics()` computes from real cluster data
- Remove all `localStorage` usage

### 2. Update `TopicClusters.tsx` page
- Replace `topicClusterService.getClusters()` (sync) with the `useClusters()` hook from `useResearchIntelligence.ts`
- Remove manual `useState` for clusters/metrics and `loadClusters()` effect
- Wire create/delete/update through the hook's mutation functions
- Derive `ClusterPerformanceMetrics` from the query data

### 3. Update `CreateClusterModal.tsx`
- Accept an `onCreate` callback prop instead of importing `topicClusterService` directly
- Parent passes `clusters.create()` from the hook

### 4. Update `ClusterDetailsModal.tsx`
- Accept cluster data as a prop (parent already has it from the query)
- Remove direct `topicClusterService.getCluster()` call
- Generate content opportunities client-side from cluster data

### Summary

| File | Change |
|------|--------|
| `src/services/topicClusterService.ts` | Rewrite to Supabase-backed async service |
| `src/pages/research/TopicClusters.tsx` | Use `useClusters()` hook, remove manual state |
| `src/components/research/topic-clusters/CreateClusterModal.tsx` | Accept `onCreate` prop |
| `src/components/research/topic-clusters/ClusterDetailsModal.tsx` | Accept cluster as prop |

4 files. No new dependencies. No DB migrations needed.

