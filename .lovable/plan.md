

# Implement Remaining Major 80 Items — 5 Phases

All 7 items from the uploaded plan are missing. Here's the phase-by-phase breakdown.

---

## Phase A: Make SB-20 Blocking (not just a warning)

**Problem**: Cannibalization check appends a warning string but generates anyway.

**Change**: In `content-action-tools.ts` (~line 504-522), when 2+ non-archived articles target the same keyword, return early with `requiresConfirmation: true` and action buttons (write different angle / update existing / suggest alternative keyword). Stop generation.

**File**: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
**Scope**: ~20 lines replaced. No frontend changes — action button format already renders.

---

## Phase B: Content Improvement Tool (M1-1)

The highest-impact missing feature. Users can create content but never refine it.

**Changes**:
1. `content-action-tools.ts` — Add `improve_content` tool definition + handler: fetch content → snapshot to `content_versions` → AI-rewrite based on instruction → rescore → save
2. `tools.ts` — Register `improve_content` in CONTENT category

**No frontend changes** — works via chat ("improve my article about X").

---

## Phase C: Post-Publish Actions + AI Meta Descriptions (M1-10, M1-19)

Two dead-end fixes in one phase.

### M1-10: Distribution Actions
In `cross-module-tools.ts`, update the `publish_to_website` success return to include action buttons: "Create social posts", "Email to subscribers", "Done for now".

### M1-19: AI Meta Descriptions
In `content-action-tools.ts` (~line 792-794), replace the truncation logic with an AI call that generates a proper meta title (max 60 chars with keyword + power word) and meta description (max 155 chars with hook). Falls back to truncation if AI fails.

**Files**: `cross-module-tools.ts`, `content-action-tools.ts`
**Deploy**: `enhanced-ai-chat` edge function

---

## Phase D: Monthly Summary + Reformat Tool (M1-8, M1-20)

### M1-8: Monthly Summary
Add `get_monthly_summary` tool to `brand-analytics-tools.ts` — parallel queries for content created/published, keywords added, proposals accepted, calendar items completed, emails sent. Returns formatted summary with top content by SEO score.

Register in `tools.ts` under analytics category.

### M1-20: Reformat Content
Add `reformat_content` tool to `content-action-tools.ts` — same pattern as improve_content (fetch → snapshot → AI reformat → rescore → save). Supports: shorter, longer, more_casual, more_formal, add_bullets, simplify.

Register in `tools.ts`.

**Deploy**: `enhanced-ai-chat` edge function

---

## Phase E: Content Freshness Tracking (M1-18)

### Database
Migration: Add `last_reviewed_at timestamptz` column to `content_items`. Backfill with `updated_at`.

### Backend
In content tools, update `last_reviewed_at` whenever content is fetched for display/review.

### Frontend
In `ContentDetailView.tsx`, fire `last_reviewed_at` update on mount via `useEffect`.

### Analyst Integration
In `useAnalystEngine.ts`, add stale content anomaly: flag published articles not reviewed in 90+ days.

---

## Summary

| Phase | Items | Files Changed | Frontend? |
|-------|-------|---------------|-----------|
| A | SB-20 | content-action-tools.ts | No |
| B | M1-1 | content-action-tools.ts, tools.ts | No |
| C | M1-10, M1-19 | cross-module-tools.ts, content-action-tools.ts | No |
| D | M1-8, M1-20 | brand-analytics-tools.ts, content-action-tools.ts, tools.ts | No |
| E | M1-18 | migration, content-action-tools.ts, ContentDetailView.tsx, useAnalystEngine.ts | Yes (minor) |

Each phase is atomic — I finish it completely before moving to the next. Edge function deploys after each phase that touches backend. If anything blocks, I stop and tell you.

**6 items intentionally skipped** (M1-3, M1-5, M1-9, M1-15, M1-16, M1-21) — they'd be invisible without surrounding UI/data infrastructure that doesn't exist yet.

