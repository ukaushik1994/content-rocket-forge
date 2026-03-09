

# Phase 4 Batch 2: Auto-Generate Strategy Recommendations from Content Gaps

## Context
The `strategy_recommendations` table and `useRecommendations()` hook are fully wired, but recommendations can only appear if manually inserted into the DB. There is no mechanism to auto-generate them. Content gaps are now being saved to the DB, which creates a natural trigger point.

## Plan

### 1. Create a Supabase Edge Function: `generate-strategy-recommendations`
When content gaps are saved, the frontend will call this edge function. It will:
- Accept `user_id` and an array of saved gap IDs
- Query the `content_gaps` and `topic_clusters` tables for context
- Use the user's configured LLM (via `user_llm_keys`) to generate 2-3 strategy recommendations
- Insert them into `strategy_recommendations` with `recommendation_type`, `title`, `description`, `priority`, `confidence_score`, `effort_estimate`, and `related_gap_ids` (stored in metadata)
- Return the created recommendations

### 2. Wire the Edge Function from `ContentGapsTab.tsx`
After successfully saving gaps via `handleSaveSelectedGaps`, call the edge function to auto-generate recommendations. Show a subtle toast: "Generating strategy recommendations..."

### 3. Add `related_gap_ids` metadata to `strategy_recommendations`
Add a `metadata` jsonb column to `strategy_recommendations` (migration) to store the gap IDs that triggered the recommendation, enabling traceability.

### 4. Update `ResearchIntelligencePanel.tsx` RecsTab
- Show a link from each recommendation back to its source gap (if `metadata.related_gap_ids` exists)
- Add a "Refresh Recommendations" button that re-triggers generation

## Technical Details

### Edge Function Skeleton
```typescript
// supabase/functions/generate-strategy-recommendations/index.ts
// - Reads gaps + clusters from DB
// - Calls LLM with a structured prompt
// - Inserts recommendations
// - Returns created rows
```

### DB Migration
```sql
ALTER TABLE public.strategy_recommendations 
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
```

## Summary

| File / Resource | Action |
|------|--------|
| `supabase/functions/generate-strategy-recommendations/index.ts` | New edge function |
| DB migration | Add `metadata` column to `strategy_recommendations` |
| `src/components/research/content-strategy/tabs/ContentGapsTab.tsx` | Call edge function after saving gaps |
| `src/components/panels/ResearchIntelligencePanel.tsx` | Show gap links + refresh button in RecsTab |

