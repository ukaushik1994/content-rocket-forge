

# Analyst Enhancement Plan — 6 Enhancements in 3 Phases

Builds on the existing `useAnalystEngine.ts` hook and `VisualizationSidebar.tsx`. No DB migrations needed — all client-side.

---

## Phase 1: Quick Wins (Frontend-heavy)

### 1a. Enhancement F — "Why This Matters" metric context
**File:** `src/components/ai-chat/VisualizationSidebar.tsx`
- Add `getMetricContext(label, value, allData)` function that returns contextual one-liners for each platform stat (Total Content, Published, Active Campaigns, Tracked Competitors, Keyword Proposals).
- Render the context line below each stat value in the Platform Data Cards grid (~line 1084).

### 1b. Enhancement C — Cross-Signal Intelligence
**File:** `src/hooks/useAnalystEngine.ts`
- Add `crossSignalInsights` state with a `useEffect` that runs 5 analyses after platform data loads:
  1. SEO trend detection (last 5 articles — declining/improving scores)
  2. Topic concentration (50%+ content on one keyword)
  3. Publishing consistency gap (days since last vs average cadence)
  4. Content-to-keyword ratio (untargeted keywords)
  5. Proposal utilization rate
- Merge `crossSignalInsights` into the existing `enrichedInsightsFeed` (currently only merges `anomalyInsights`).
- Add `crossSignalInsights` to `AnalystState` interface and return.

---

## Phase 2: Health Score + Sparklines

### 2a. Enhancement A — Workspace Health Score
**File:** `src/hooks/useAnalystEngine.ts`
- Add `HealthFactor` and `HealthScore` interfaces.
- Add `computeHealthScore(platformData, anomalyInsights, crossSignalInsights)` — scores 5 dimensions (publish velocity 25pts, content volume 20pts, SEO quality 20pts, anomaly penalties 15pts, strategic completeness 20pts).
- Add `healthScore` useMemo to the hook. Add to `AnalystState` and return.

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`
- Render a circular SVG score ring at the top of the Analyst content area (before Key Metrics, ~line 1045).
- Show trend indicator (improving/declining/stable) and top critical factor.
- Add expandable factors list below the ring.

### 2b. Enhancement B — Trend Sparklines
**File:** `src/hooks/useAnalystEngine.ts`
- Add `trendData?: number[]` to `PlatformDataPoint` interface.
- In `fetchPlatformData`, add a query for `content_items` created in last 28 days, bucket by week for "Content Created" and "Published" trend arrays.

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`
- Add `MiniSparkline` SVG component (48x16px polyline).
- Render sparkline in each platform stat card when `trendData` exists.

---

## Phase 3: Goal Progress + Session Memory

### 3a. Enhancement E — Goal Progress Tracking
**File:** `src/hooks/useAnalystEngine.ts`
- Add `GoalProgress` interface and `assessGoalProgress(goal, messages)` function with switch-case logic for 6 goal types (Content Creation, SEO Research, Email Campaign, Performance Analysis, Competitive Analysis, Strategy Planning).
- Accept `conversationGoal` as a new parameter to the hook.
- Add `goalProgress` useMemo. Add to `AnalystState` and return.

**File:** `src/components/ai-chat/VisualizationSidebar.tsx`
- Render a progress bar below topic tags in the header with goal name, percentage, status, and next step.

**File:** Where `useAnalystEngine` is called — pass `conversationGoal` from the active conversation.

### 3b. Enhancement D — Cross-Session Memory
**File:** `src/hooks/useAnalystEngine.ts`
- Save: On deactivation (`prevActiveRef` pattern), save top 5 warning/opportunity insights + health score + topics to `localStorage` key `analyst_last_summary`.
- Load: On activation with 0 messages, restore insights from localStorage if <72 hours old, prefix with "Previous session:".
- Add `previousSessionInsights` state, merge into `enrichedInsightsFeed`.

---

## Summary

| Phase | Enhancements | Files |
|-------|-------------|-------|
| 1 | F (metric context) + C (cross-signals) | `useAnalystEngine.ts`, `VisualizationSidebar.tsx` |
| 2 | A (health score) + B (sparklines) | `useAnalystEngine.ts`, `VisualizationSidebar.tsx` |
| 3 | E (goal progress) + D (session memory) | `useAnalystEngine.ts`, `VisualizationSidebar.tsx`, caller file |

All 6 enhancements are additive — no existing code is removed, only extended.

