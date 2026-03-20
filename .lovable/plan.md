

# Creaiter Improvement Plan — 27 Items, 8 Phases

---

## Phase 1: AI Model + Cost + Context Window (backend only)

| # | Item | File | Change |
|---|------|------|--------|
| 1A | Smart Model Routing | `enhanced-ai-chat/index.ts` | Route cheap model (`gpt-4o-mini`) for lookups/chat, premium model (`gpt-4o`) for generation intents + heavy tools |
| 1B | Expand Context Window | `enhanced-ai-chat/index.ts` | Change `MAX_HISTORY_MESSAGES` 5→15, `SUMMARIZE_THRESHOLD` 10→25 |
| 1C | Reduce System Prompt Tokens | `enhanced-ai-chat/index.ts` | 3 optimizations: compress non-relevant tool defs to name+first-sentence, skip platform knowledge for experienced users (10+ convos), lazy-load chart modules only when query needs them |

**Deploy:** Edge function only. No frontend changes.

---

## Phase 2: Content Generation Quality (backend only)

| # | Item | File | Change |
|---|------|------|--------|
| 2A | Enforce Word Count | `content-action-tools.ts` | Add explicit word count instruction to generation prompt with ±10% target |
| 2B | SERP in Chunked Generation | `advancedContentGeneration.ts` | Pass remaining SERP items to each chunk prompt |
| 2C | Outline Structure in Chunks | `advancedContentGeneration.ts` | Slice outline sections per chunk instead of sending full outline |
| 2D | SEO Scoring Penalties | `content-action-tools.ts` | Add penalties for keyword stuffing (>3%), no links, uniform paragraph lengths, no questions. Bonus for FAQ section |
| 2E | Readability Score | `content-action-tools.ts` | Compute avg sentence length, append readability note to response |

**Deploy:** Edge function only. No frontend changes.

---

## Phase 3: Data Architecture (DB only)

| # | Item | Change |
|---|------|--------|
| 3A | Performance Indexes | Migration: 12 indexes on `content_items`, `ai_messages`, `ai_conversations`, `keywords`, `proposals`, `content_calendar`, `campaigns`, `content_analytics`, `content_performance_signals` |
| 3B | Data Retention | Migration: `cleanup_old_data()` function — deletes archived conversation messages >1yr, acted-on recommendations >90d, old performance signals >1yr. Wire into `engage-job-runner` on Sundays |

**Deploy:** Migration only.

---

## Phase 4: UX Fixes (mostly frontend)

| # | Item | File | Change |
|---|------|------|--------|
| 4A | Conversation Goal in Header | `EnhancedChatInterface.tsx` | Show `activeConvObj.goal` as a small chip next to conversation title |
| 4B | Empty State Guidance | Analytics, Keywords, Calendar, Competitors pages | Add icon + text + setup hint when no data exists |
| 4C | Notification Auto-Triggers | `generate-proactive-insights/index.ts` | Insert into `dashboard_alerts` when high-priority recommendation is created |
| 4D | Repository Bulk Archive | `RepositoryBulkBar.tsx` | Add "Archive" button that sets `status: 'archived'` for selected items |

**Deploy:** 4C = edge function. Rest = frontend only.

---

## Phase 5: Analyst Sidebar (frontend only)

| # | Item | File | Change |
|---|------|------|--------|
| 5A | Competitive Position Detail | `CompetitivePositionSection.tsx` | Show strengths, weaknesses, and "analyzed X days ago" per competitor |
| 5B | Campaign Pulse Performance | `CampaignPulseSection.tsx` | Show avg content SEO alongside campaign count |
| 5C | Health Score Fix | `useAnalystEngine.ts` | Replace hardcoded SEO factor with real avg SEO score from platformData |

**Deploy:** Frontend only.

---

## Phase 6: Scalability (frontend only)

| # | Item | File | Change |
|---|------|------|--------|
| 6A | Pagination | Repository, Keywords, Proposals list hooks | Add `PAGE_SIZE=20`, `.range()` query, "Load more" button |
| 6B | Analyst Query Frequency | `useAnalystEngine.ts` | Change refresh interval 60s→120s, skip refresh when `document.hidden` |
| 6C | React Query Caching | All Supabase query hooks | Add `staleTime: 30s`, `cacheTime: 5min` to content, keywords, proposals, campaigns, competitors queries |

**Deploy:** Frontend only.

---

## Phase 7: Code Quality (frontend only)

| # | Item | Change |
|---|------|--------|
| 7A | Remove Hardcoded Supabase Fallbacks | Remove hardcoded URL/key fallbacks in `TestOpenRouterButton.tsx`, `useEnhancedAIChatDB.ts`, and any other file with `.supabase.co` strings. Use env vars only |
| 7B | ESLint + Prettier Config | Create `.eslintrc.json` and `.prettierrc` at project root (config only, don't reformat existing code) |
| 7C | Error Boundary | `App.tsx` — wrap router with `react-error-boundary` fallback component showing error + retry button |

**Deploy:** Frontend only.

---

## Phase 8: Business Viability (DB + backend + frontend)

| # | Item | Change |
|---|------|--------|
| 8A | Token Usage Tracking | **Migration:** Create `ai_usage_log` table with RLS. **Backend:** Log `prompt_tokens`, `completion_tokens`, `model`, `tool_name` after every AI call in `index.ts`. **Frontend:** Add "Usage" tab in Settings showing monthly token usage + estimated cost |
| 8B | Soft Delete | **Migration:** Add `deleted_at` to `content_items`, `ai_conversations`, `campaigns`. Update RLS policies to filter `deleted_at IS NULL`. **Backend:** Change delete handlers to set `deleted_at` instead of hard deleting |

**Deploy:** Migration + edge function + frontend.

---

## Execution Summary

| Phase | Items | Backend | Frontend | Migrations |
|-------|-------|---------|----------|------------|
| 1 | 1A, 1B, 1C | 3 | 0 | 0 |
| 2 | 2A–2E | 5 | 0 | 0 |
| 3 | 3A, 3B | 1 | 0 | 2 |
| 4 | 4A–4D | 1 | 3 | 0 |
| 5 | 5A–5C | 0 | 3 | 0 |
| 6 | 6A–6C | 0 | 3 | 0 |
| 7 | 7A–7C | 0 | 3 | 0 |
| 8 | 8A, 8B | 2 | 1 | 2 |
| **Total** | **27** | **12** | **13** | **4** |

Each phase completes fully before the next starts. Edge function deploys after each backend phase.

