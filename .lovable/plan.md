

# Phase 8: Deferred Infrastructure — Implementation Plan

6 items, each with DB + backend + frontend work. Ordered by dependency and impact.

---

## 8A: Content Value Metric (M1-3)

**DB Migration**:
- Add `content_value_score numeric DEFAULT 0` to `content_items`

**Backend** (`content-action-tools.ts`):
- After any rescore operation, compute: `(seo_score * 0.4) + (repurpose_count * 10) + (freshness_bonus * 0.2)` where freshness = `max(0, 100 - days_since_update)`, repurpose_count from `content_performance_signals`
- Save to `content_value_score`

**Frontend**:
- Show value score badge on content cards in Repository (`ContentCard.tsx` or equivalent)
- Add sortable column in Analytics content tab
- Display in `ContentIntelligenceSection.tsx`

---

## 8B: Funnel Stage Tagging (M1-15)

**DB Migration**:
- Add `funnel_stage text` to `content_items` (values: tofu, mofu, bofu) — use validation trigger, not CHECK constraint

**Frontend — Wizard**:
- `WizardStepSolution.tsx`: Add "Content Purpose" selector (Awareness/Consideration/Decision → tofu/mofu/bofu)
- Save selected stage when content is created

**Frontend — Repository**:
- Add funnel stage filter to `EnhancedContentFilters.tsx`
- Show funnel badge on content cards

---

## 8C: Outline Persistence (M1-16 Step 1)

**DB Migration**:
- Add `outline jsonb` column to `content_items`

**Frontend**:
- `WizardStepGenerate.tsx`: When saving generated content, also save `wizardState.outline` to the `outline` column

**Backend — Learning (Step 2)**:
- In outline generation prompt (content-action-tools.ts), query top 10 highest-SEO-score articles for user, extract outline patterns (heading count, section structure, avg words/section), inject winning patterns into prompt

---

## 8D: User Goals Tracking (M1-21)

**DB Migration**:
```sql
CREATE TABLE user_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  period text DEFAULT 'monthly',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);
-- RLS + policy for user's own goals
```

**Frontend**:
- Wire `GoalProgressSection.tsx` (already exists) to query `user_goals` table instead of receiving null
- Update `useAnalystEngine.ts` `assessGoalProgress` to read from DB goals, compute `current_value` from real content/publish counts
- Add "Set Goal" action in analyst sidebar — modal with goal type + target + period

**Backend**:
- Add `get_goal_progress` + `set_goal` tools to AI chat tools

---

## 8E: Cross-Content Consistency (M1-5)

**Backend** (`content-action-tools.ts`):
- After `generate_full_content`, extract key claims (numbers, percentages, pricing, feature counts) via regex
- Query published content with overlapping keywords
- Compare extracted claims — flag conflicts
- Return warnings in generation result

**Frontend**:
- Show conflict warnings alongside fact-check flags in generation result view
- Add "Consistency Check" button in `ContentDetailView.tsx` that triggers a chat message

---

## 8F: Proposal Validation (M1-9)

**DB Migration**:
```sql
CREATE TABLE proposal_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES ai_strategy_proposals(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  predicted_impressions integer,
  actual_impressions integer,
  accuracy_score numeric,
  validated_at timestamptz DEFAULT now(),
  data_source text DEFAULT 'manual'
);
-- RLS policy
```

**Backend**:
- Add `validate_proposal` tool — accepts actual performance data, computes accuracy score
- Store in `proposal_validations`

**Frontend**:
- Show accuracy badge on proposals with validation data: "Predicted 500 → Actual 380 (76%)"
- Note: Full automation requires Google Search Console integration (future)

---

## Execution Order

| Phase | Item | Depends On | Deploy |
|-------|------|-----------|--------|
| 8A | Content Value Metric | — | Migration + edge fn |
| 8B | Funnel Stage Tagging | — | Migration + frontend |
| 8C | Outline Persistence | — | Migration + frontend + edge fn |
| 8D | User Goals Tracking | — | Migration + frontend + edge fn |
| 8E | Cross-Content Consistency | 8C (outlines help) | Edge fn + frontend |
| 8F | Proposal Validation | — | Migration + edge fn + frontend |

Each sub-phase is atomic. Edge function deploys after each backend change.

