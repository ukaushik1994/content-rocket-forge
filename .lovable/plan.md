

# Analyst Overhaul — 12 Fixes in 4 Phases

The document describes 30 problems consolidated into 12 fixes that transform the Analyst from a "dashboard with labels" into an "opinionated strategist with predictions, benchmarks, and accountability."

All 12 fixes primarily modify **one backend file** (`useAnalystEngine.ts`) and add **one new frontend component** (`StrategicStanceSection.tsx`). Most fixes produce cross-signal insights that flow through the existing rendering pipeline with no new UI components.

---

## Phase 1: Strategic Stance + Positive Reinforcement + Urgency Scoring

**Fixes 2, 10, 11** — The highest-impact, most visible changes.

### Fix 2: Opinionated Recommendations (new section)
- **`useAnalystEngine.ts`**: Add `StrategicRecommendation` interface and `strategicRecommendation` useMemo. Four rules: (1) too many drafts → "stop creating", (2) bad SEO → "fix quality first", (3) everything good → "accelerate", (4) just starting → "focus on first 5". Add to `AnalystState` interface and return.
- **New file `StrategicStanceSection.tsx`**: Section "00" with stance headline, reasoning paragraph, and action buttons with effort/impact badges.
- **`AnalystNarrativeTimeline.tsx`**: Insert `StrategicStanceSection` as first section (before Health Assessment).

### Fix 10: Positive Reinforcement
- **`useAnalystEngine.ts`** in `computeCrossSignals`: Add two win-detection signals — publishing streak (2+ articles this week) and SEO improvement (latest > 3rd-latest and >= 60). These appear as green `opportunity` insights in existing UI.

### Fix 11: Urgency Scoring
- **`useAnalystEngine.ts`**: Add `urgency?: 'critical' | 'high' | 'medium' | 'low'` to `InsightItem`. Assign urgency when creating signals (SEO declining = critical, empty calendar = high, stale drafts = medium, topic concentration = low). Sort `enrichedInsightsFeed` by urgency order.
- **`AnalystInsightCard.tsx`**: Show `<span className="text-[8px] text-rose-400 uppercase">Urgent</span>` when `urgency === 'critical'`.

**Files**: `useAnalystEngine.ts`, `AnalystInsightCard.tsx`, `AnalystNarrativeTimeline.tsx`, new `StrategicStanceSection.tsx`

---

## Phase 2: Cross-Data Patterns + Predictions + Temporal Awareness

**Fixes 1, 4, 5** — All backend-only additions to `computeCrossSignals` in `useAnalystEngine.ts`. No new UI components needed — insights flow into existing Strategic Divergence section.

### Fix 1: Cross-Data Pattern Engine
Add 3 new signal detections after existing 5:
- **Keyword cannibalization**: Query `content_items` for duplicate `main_keyword` values, warn when 2+ articles target same keyword.
- **Content-to-contact correlation**: Compare 2-week published count vs new contacts. Signal positive correlation or warn about zero conversion.
- **WHY SEO is declining**: When scores trend down, analyze recent articles for missing FAQ sections, too few headings, and short content.

### Fix 4: Predictive Intelligence
Add 2 prediction signals:
- **Draft depletion forecast**: Calculate avg days between publishes, project when drafts run out. Warn if < 14 days.
- **Topic saturation**: Detect when 4+ articles target the same 2-word topic prefix. Warn about diminishing returns.

### Fix 5: Temporal/Seasonal Awareness
Add 2 temporal signals:
- **Seasonal gap**: Map months to trending topics. Warn if user has 5+ articles but none targeting current seasonal topics.
- **Content aging**: Find published articles older than 180 days. Suggest refreshing the oldest one.

**Files**: `useAnalystEngine.ts` only

---

## Phase 3: Benchmarks + Business Attribution + Narrative Depth

**Fixes 3, 6, 8** — Stage-aware scoring and attribution signals.

### Fix 3: Benchmarks and Goal Tracking
- **`useAnalystEngine.ts`**: Add `UserStage` type (`starter`/`growing`/`established`/`scaling`) with `getUserStage()` function. Add `BENCHMARKS` record with stage-specific targets (publishRate, avgSeo, weeklyArticles). Update `computeHealthScore` to use benchmark-relative scoring. Add `userStage` and `benchmarks` to `AnalystState`.
- **`HealthAssessmentSection.tsx`**: Show stage and benchmark line: "Stage: growing · Benchmark: 45 SEO, 1.5 articles/week"

### Fix 6: Content-to-Business Attribution
Add 2 signal detections in `computeCrossSignals`:
- **Pareto proposals**: Query top 20 `ai_strategy_proposals` by `estimated_impressions`. If top 3 capture 50%+ of total, surface them as priority focus.
- **Solution-content gaps**: Cross-reference `solutions` table with `content_items`. Warn when a solution has 0 articles targeting it.

### Fix 8: Contextual Narrative Depth
- **`useAnalystEngine.ts`**: Expand `getMetricContext()` to accept `userStage` parameter. Return benchmark-relative context strings (e.g., "42/100 (growing benchmark: 45) — below target").
- Update all callers to pass `userStage`.

**Files**: `useAnalystEngine.ts`, `HealthAssessmentSection.tsx`

---

## Phase 4: Accountability + Adaptive Ordering + Traffic Proxy

**Fixes 7, 9, 12** — Behavioral intelligence and engagement tracking.

### Fix 7: Accountability Loop
- **`useAnalystEngine.ts`**: In `computeCrossSignals`, analyze user messages for repeated 4-word query patterns. If same simplified query appears 3+ times, signal "you've asked about X 3 times without acting." Limit to one loop alert per session.

### Fix 9: Adaptive Section Ordering
- **`AnalystNarrativeTimeline.tsx`**: Add `getSectionPriority()`/`recordSectionInteraction()` localStorage helpers. Track which sections users click into. Before rendering, sort visible sections by interaction frequency (most-clicked first). Wrap each section in an `onClick` handler that calls `recordSectionInteraction`.

### Fix 12: Real Traffic Intelligence Proxy
- **`useAnalystEngine.ts`** in `fetchPlatformData`: Query `content_performance_signals` grouped by `content_id`. Find top 3 most-engaged content items. Push the #1 as a `content_detail` platform data point with article title and signal count.
- **`ContentIntelligenceSection.tsx`**: Render the "most engaged" content item alongside existing SEO data.

**Files**: `useAnalystEngine.ts`, `AnalystNarrativeTimeline.tsx`, `ContentIntelligenceSection.tsx`

---

## Summary

| Phase | Fixes | New Files | Modified Files | Complexity |
|-------|-------|-----------|----------------|------------|
| 1 | 2, 10, 11 | `StrategicStanceSection.tsx` | `useAnalystEngine.ts`, `AnalystInsightCard.tsx`, `AnalystNarrativeTimeline.tsx` | Medium |
| 2 | 1, 4, 5 | None | `useAnalystEngine.ts` | Medium |
| 3 | 3, 6, 8 | None | `useAnalystEngine.ts`, `HealthAssessmentSection.tsx` | Medium |
| 4 | 7, 9, 12 | None | `useAnalystEngine.ts`, `AnalystNarrativeTimeline.tsx`, `ContentIntelligenceSection.tsx` | Medium |

