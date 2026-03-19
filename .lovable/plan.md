

# Phase-by-Phase Implementation Plan: Value Logic + Prompt Efficiency

Two documents, 23 total fixes across 8 files + 1 new service + 1 migration. Organized into 5 phases for safe, incremental delivery.

---

## Phase 1: Content Generation Quality (Value Logic Fixes 1, 3, 16, 17, 18, 19)
**File: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`**

All changes are in the `generate_full_content` case (lines 419-516). These are additive — no existing logic is removed.

1. **Enrich system prompt** (Fix 1): Replace the generic one-liner system message (line 460-461) with the full humanization + SEO structure prompt (banned words, Key Takeaways, FAQ, varied sentence length, first-person voice)
2. **Brand voice + solution context** (Fix 1): Before `callAiProxyWithRetry` (line 446), fetch `brand_guidelines` and optionally `solutions` table. Append to system message. All try/catch, non-blocking.
3. **Fix response parsing** (Fix 1): Update line 478 to check `aiResult.data?.choices?.[0]?.message?.content` first
4. **Auto meta title/description** (Fix 3): After `saveAutoSeoScore` (line 506), extract plain text and update `content_items` with `meta_title` (60 chars) and `meta_description` (155 chars)
5. **Solution mention density** (Fix 16): In the solution context string, add rules for mention frequency based on `targetWords`
6. **Reading level from audience** (Fix 17): Fetch `target_audience` from `brand_guidelines`, match against patterns (technical/executive/beginner), append reading level instruction
7. **Fact-checking flags** (Fix 18): After generation, regex-match statistics/citations, append warning to return message
8. **Content freshness detection** (Fix 19): At top of case, check if user has existing content with same keyword via `ilike`. Append freshness note (refresh vs different angle) to system message
9. **Top content structure reuse** (Fix 10): Fetch top 3 published articles by SEO score, analyze avg headings and words-per-section, append structure guidance
10. **Competitor gap as input** (Fix 11): Fetch `company_competitors`, check if intelligence mentions keyword, append competitive context
11. **Internal linking suggestions** (Fix 12): After save, scan published articles for keyword overlap, include link suggestions in return message
12. **Calendar topic diversity** (Fix 15): In `create_calendar_item` case, check month's content mix after insert, append diversity note if >70% is one type

**Risk**: Zero — all additions are wrapped in try/catch, non-blocking. Existing flow untouched.

---

## Phase 2: Brand Voice Everywhere (Value Logic Fixes 2, 4, 5, 6, 7, 13)
**Files: `index.ts`, `cross-module-tools.ts`, `advancedContentGeneration.ts`, `campaign-content-generator/index.ts`, `engage-action-tools.ts`**

1. **Brand voice in main chat** (Fix 2): In `index.ts` before `realDataContext` injection (line 2552), fetch `brand_guidelines` and append to system prompt. Non-blocking try/catch.
2. **Platform-specific social** (Fix 4): In `cross-module-tools.ts` (line 342), replace generic social prompt with platform-specific rules (Twitter 270 chars, LinkedIn 300-600 words thought-leadership, Facebook storytelling, Instagram caption + hashtags). Also inject brand tone before the AI call.
3. **Existing content in proposals** (Fix 5): In `index.ts` near the campaign strategy fast path, fetch top 20 `content_items` with scores, inject as context so AI avoids duplicate topics.
4. **Brand voice in Content Wizard** (Fix 6): In `src/services/advancedContentGeneration.ts` after the system prompt is built (~line 399), fetch brand guidelines and append.
5. **Brand voice in campaign generator** (Fix 7): In `campaign-content-generator/index.ts` `buildContentPrompt` function, add brand voice fetch via supabase query and append to prompt.
6. **Audience-aware email tone** (Fix 13): In `engage-action-tools.ts` `create_email_campaign` case (line 481), when `segment_id` is provided, fetch segment name and detect VIP/new lead/inactive patterns to set tone hint.

**Risk**: Low — all non-blocking fetches. Campaign generator needs supabase client which already exists (line 63).

---

## Phase 3: Content Feedback Loop (Value Logic Fixes 8, 9, 14)
**New files + modifications**

1. **Create migration** `content_generation_feedback` table: `id`, `user_id`, `content_id`, `feedback_type`, `feedback_data` (JSONB), `created_at`. RLS policy for own rows.
2. **Create service** `src/services/contentFeedbackService.ts`: `trackContentEdit()` function that compares original vs edited content (word count change, headings change, length ratio).
3. **Hook into Repository editor**: Where content is saved after user edits, if `metadata.generated_via` exists, call `trackContentEdit`.
4. **Feed edit patterns into generation** (Fix 9): In `content-action-tools.ts` `generate_full_content`, after brand voice fetch, query last 10 feedback rows. If user consistently shortens/expands, append learned preference to system message.
5. **Performance-driven topic prioritization** (Fix 14): In `index.ts` where `realDataContext` is built, analyze content scores grouped by keyword theme, append ranked topic performance to system prompt.

**Risk**: Medium — requires migration. The feedback table is isolated, so no impact on existing tables. The editor hook needs careful placement.

---

## Phase 4: Prompt Efficiency (Prompt Efficiency Fixes 1-4)
**File: `supabase/functions/enhanced-ai-chat/index.ts`**

This phase reduces token usage by ~50% on average requests. Changes are in the NORMAL path (lines 2447-2508).

1. **Intent-gated module loading** (PE Fix 1): Replace unconditional module appending with conditional logic:
   - `CHART_MODULE` / `MULTI_CHART_MODULE`: only when categories include content/keywords/campaigns/analytics/performance
   - `TABLE_MODULE`: only when query matches `/table|spreadsheet|list all|export|raw data|csv/i`
   - `ACTION_MODULE`: only for non-summary scope with campaigns/engage/content categories
   - `PLATFORM_KNOWLEDGE_MODULE`: only when categories include navigation/general or query matches `/where|how do i|find|navigate/i`

2. **Intent-gated tool definitions** (PE Fix 2): Create `getToolsForIntent()` function with category-to-tools mapping. Filter `TOOL_DEFINITIONS` to only include tools relevant to `queryIntent.categories`. Always include a minimum set for general queries. Pass `filteredTools` instead of full `TOOL_DEFINITIONS` to AI call (line 2598).

3. **Split PLATFORM_KNOWLEDGE_MODULE** (PE Fix 3): Extract a lightweight `PLATFORM_BASICS` (~200 tokens) with just page routes and navigation links. Load full `PLATFORM_DEEP` only when `needsPlatformKnowledge` is true.

4. **Compress data context for simple queries** (PE Fix 4): When `queryIntent.scope === 'summary'`, append only a one-line data snapshot instead of full `realDataContext`.

**Risk**: Medium — this changes the AI's behavior by giving it less context. Mitigated by keeping always-on modules (BASE_PROMPT, TOOL_USAGE, RESPONSE_STRUCTURE) and generous category matching. The fallback ensures general queries still get a useful tool set.

---

## Phase 5: Verification & Deploy

1. Deploy all edge functions (`enhanced-ai-chat`, `campaign-content-generator`)
2. Run migration for `content_generation_feedback` table
3. Test matrix:
   - "Write a blog post about remote work tools" → verify humanized output, brand voice, Key Takeaways, FAQ, no AI slop words, internal link suggestions, fact-check flags
   - "Repurpose my latest article for Twitter and LinkedIn" → Twitter <280 chars, LinkedIn 300-600 words with line breaks
   - "Show my content" → verify reduced token count in logs (~8k vs ~20k)
   - "What should I write next" → verify performance-weighted suggestions, no duplicate topics
   - Content Wizard generation → verify brand voice applied
   - Edit generated content, then generate again → verify learned preferences

---

## Summary

| Phase | Fixes | Files Modified | Risk |
|-------|-------|---------------|------|
| 1 | Value 1,3,10-12,15-19 | `content-action-tools.ts` | Zero |
| 2 | Value 2,4-7,13 | `index.ts`, `cross-module-tools.ts`, `advancedContentGeneration.ts`, `campaign-content-generator/index.ts`, `engage-action-tools.ts` | Low |
| 3 | Value 8,9,14 | New migration, new service, `content-action-tools.ts`, `index.ts` | Medium |
| 4 | Efficiency 1-4 | `index.ts` | Medium |
| 5 | Verification | None | None |

All fixes are non-blocking (try/catch). No existing functionality is removed — only enriched. Token efficiency changes gate existing modules behind intent checks that already exist in the codebase.

