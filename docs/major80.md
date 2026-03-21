# Major 80 — Complete Prioritized Plan

> All 80 issues categorized, prioritized, and planned with backend + frontend solutions.
> Three tiers: Ship Blockers (before real users), Month 1 (first 30 days), and User-Driven (when users ask).
>
> **Last audited: 2026-03-20** — Status updated after Lovable implementation rounds.

---

## STATUS LEGEND

| Badge | Meaning |
|-------|---------|
| **DONE** | Fully implemented and verified in codebase |
| **PARTIAL** | Some work done but not complete — see "Remaining" notes |
| **TODO** | Not yet implemented |

---

## PROGRESS SNAPSHOT

| Tier | Total | Done | Partial | TODO |
|------|:-----:|:----:|:-------:|:----:|
| Ship Blockers | 23 | 12 | 4 | 7 |
| Month 1 | 25 | 4 | 0 | 21 |
| User-Driven | 32 | 0 | 0 | 32 |
| **Total** | **80** | **16** | **4** | **60** |

---

## TIER 1: SHIP BLOCKERS — Fix before real users (23 items)

These are things that break promises, create dead ends, or make the tool look broken on first use.

---

### SB-1: PARTIAL — 105 proposals sit untouched — no mechanism turns proposals into action

**Issue #1.** Proposals are generated but the path from proposal → content is too many manual steps.

**What's done:** `ContentCreationChoiceCard.tsx` exists showing user choice between scratch and AI Proposals. PlusMenuDropdown has "AI Proposals" menu item. `AIProposalsHero.tsx` shows proposals with "Generate New Proposals" button.

**Remaining:** No direct one-click "Write This" button on individual proposals that opens Content Wizard pre-filled with the proposal's keyword, content type, and solution_id. The action flow from proposal → wizard → content is still too many clicks.

**Backend:** In `generate-proactive-insights`, surface the top 3 proposals as recommendations with one-click "Write this" actions (already partially done — verify the action strings work end-to-end).

**Frontend:** On the AI Proposals page, add a "Write This" button on each proposal card that opens the Content Wizard pre-filled with the proposal's keyword, content type, and solution_id.

---

### SB-2: TODO — 15 drafts stuck with no path to published

**Issue #3.** Drafts are created but never move forward.

**Backend:** In `generate-proactive-insights`, add a "publish-ready drafts" recommendation when drafts with SEO ≥ 40 exist. Action: "Show my best drafts and help me publish them."

**Frontend:** In the Repository page, add a "Ready to Publish" filter that shows drafts sorted by SEO score descending, with a "Publish" button on each card. Currently `EnhancedContentFilters.tsx` only filters by status (All/Drafts/Published/Archived) — no SEO-based filter exists.

---

### SB-3: DONE — Calendar items disconnected from actual content

**Issue #4, #16.** 200 calendar items are just titles and dates — no link to content, no completion tracking, no deadline alerting.

**Verified:** `content-action-tools.ts` stores `content_id: toolArgs.content_id || null` in calendar items. `create_calendar_item` tool accepts `content_id` parameter for linking.

---

### SB-4: TODO — SEO scores don't reflect actual content quality

**Issue #2, #5, #7.** Average SEO 18 overall. The new scorer exists but old content keeps old scores.

**Backend:** Create a one-time migration script (or edge function) that rescores ALL existing content items:

```ts
// New edge function: rescore-all-content
const { data: items } = await supabase.from('content_items')
  .select('id, content, main_keyword, meta_title, meta_description')
  .eq('user_id', userId);

for (const item of items) {
  const newScore = calculateBasicSeoScore(item.content, item.main_keyword, item.meta_title, item.meta_description);
  await supabase.from('content_items').update({ seo_score: newScore }).eq('id', item.id);
}
```

**Frontend:** Add a "Rescore All Content" button in Settings or make it run automatically once on next login.

---

### SB-5: DONE — Zero website connections blocks core promise

**Issue #6.** "Publish to Website" is a landing page promise. 0 connections.

**Verified:** `WebsiteConnectionsSettings.tsx` and `websiteConnectionService.ts` handle website connections. `APIKeyOnboarding.tsx` provides API key setup guidance post-signup.

---

### SB-6: TODO — Social posting is a stub with no honest messaging

**Issue #8.** Social posts created but never published. Users discover this only after trying.

**Backend:** Update `create_social_post` and `repurpose_for_social` tool responses to include: "Note: Posts are saved as drafts. Direct platform publishing is coming soon — copy the text to post manually."

**Frontend:** In the Social dashboard, add a permanent banner: "Platform publishing coming soon. Posts are saved as drafts for manual posting." Currently SocialPostCard shows Draft/Scheduled/Posted badges but no honesty messaging.

---

### SB-7: PARTIAL — Email sending requires Resend with no guidance

**Issue #8 (email part).** Email campaigns create but don't send.

**What's done:** `EngageSettings.tsx` has Resend API key configuration interface with configured/not-configured status indicators.

**Remaining:** No onboarding guidance or tutorial when user first navigates to Engage → Email with no Resend key. Need a setup card: "To send emails, add your Resend API key (free at resend.com) in Settings → API Keys."

---

### SB-8: DONE — The learning loop has zero data — wire all touchpoints

**Issue #7, #8 (edit feedback).** `content_generation_feedback` has 0 rows despite edit tracking being wired.

**Verified:** `trackContentEdit()` in `contentFeedbackService.ts` captures original and edited content. `originalContentRef` in `EnhancedContentEditForm.tsx` properly stores original content before edit. Full pattern detection implemented (splits_long_paragraphs, adds_examples, removes_generic_filler, adds_data_statistics, etc.).

---

### SB-9: DONE — Content Wizard hidden behind + menu

**Issue #14.** The wizard produces 3x better content than the bare chat tool but most users never find it.

**Verified:** `ContentCreationChoiceCard.tsx` shows explicit choice when keyword provided. `launch_content_wizard` tool returns `content_creation_choice` card. PlusMenuDropdown includes "Content Wizard" menu item.

---

### SB-10: PARTIAL — No first-value guidance after onboarding

**Issue #13.** API key configured → user lands on chat → no idea what to do.

**What's done:** `APIKeyOnboarding.tsx` provides API key setup with test functionality. `OnboardingContext.tsx` and onboarding components exist.

**Remaining:** No "Getting Started" card with milestone steps (add offering → generate proposals → write first article). Need post-API-key-setup guidance that shows until first three actions are completed.

---

### SB-11: TODO — Tool discovery — users only find 5 of 92+ tools

**Issue #12.** Most tools are invisible.

**Frontend:** Enhance the `/help` CapabilitiesCard to be more actionable — each capability should have a "Try it" button that sends the example prompt.

**Backend:** Add a `get_tool_suggestions` logic in the system prompt: when the user's message could benefit from a tool they haven't used, mention it: "Tip: I can also compare your articles side-by-side — try 'compare my content'." No proactive tool suggestion logic currently exists.

---

### SB-12: DONE — Proposal→Calendar→Content context lost at each step

**Issue #47, #79.** Accept proposal → calendar gets title only. Calendar item → wizard starts fresh.

**Verified:** `proposal-action-tools.ts` stores `proposal_data: { primary_keyword: proposal.primary_keyword }` in calendar items when accept_proposal creates a calendar item.

---

### SB-13: DONE — Generated images not persisted with content

**Issue #33.** Wizard generates an image → URL expires → article has broken image.

**Verified:** `generated_images` field exists in content_items table. `ContentDetailModal.tsx` reads `content.generated_images` and saves images back with `.update({ generated_images: allImages })`. Images persisted as JSON in database.

---

### SB-14: DONE — Auto-retry on rate limit

**Issue from previous plan, #6.** User gets rate limited → stares at screen.

**Verified:** `RateLimitBanner.tsx` component with countdown timer, `cooldownSeconds` state, interval-based countdown, "Clear & Retry Now" button, and automatic reset messaging. `apiErrorResilience.ts` manages rate limit state.

---

### SB-15: DONE — Content Wizard doesn't receive chat context

**Issue #14 (wizard-specific).** 10 messages about a topic → open wizard → starts blank.

**Verified:** ContentWizardSidebar receives `extractedContext?: WizardContextExtraction` prop. `extractWizardContext()` service processes conversation history. Wizard context includes keyword, solution_id, content_type, tone, target_audience, content_goal, writing_style, specific_points, additional_instructions. EnhancedChatInterface calls `handleLaunchWizard()` which extracts and passes this context.

---

### SB-16: DONE — AI reuses data from earlier in conversation

**Issue #31, previous plan #10.** Fetches same data twice.

**Verified:** `enhanced-ai-chat/index.ts` contains `## DATA REUSE` prompt instruction telling the AI to check conversation history before re-fetching. Only re-fetches if user asks for fresh/updated data or different parameters.

---

### SB-17: DONE — Meta titles/descriptions don't enforce Google limits

**Issue #29.** Auto-generated meta might exceed 60/155 chars.

**Verified:** `WizardStepGenerate.tsx` validates meta title (50-60 chars) and meta description (120-160 chars) with SEO checklist and character counts.

---

### SB-18: TODO — Campaign content quality gate

**Issue #30.** Campaign generates content → marked "complete" even if SEO is 12.

**Backend:** `supabase/functions/process-content-queue/index.ts` — after content is generated, check score:
```ts
if (seoScore < 30) {
  await supabase.from('content_generation_queue')
    .update({ status: 'needs_review', error_message: `Low SEO score: ${seoScore}/100 — review before publishing` })
    .eq('id', itemId);
} else {
  await supabase.from('content_generation_queue')
    .update({ status: 'completed' })
    .eq('id', itemId);
}
```

**Frontend:** Show "needs review" items differently in the campaign dashboard — amber badge instead of green.

---

### SB-19: TODO — Keyword difficulty not contextualized

**Issue #53.** AI adds keywords without strategic context.

**Backend:** `keyword-action-tools.ts` stores `difficulty: kw.difficulty || null` but does not contextualize. Add difficulty-relative-to-content-volume analysis in `add_keywords` response:
```ts
const contentCount = (await supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('user_id', userId)).count || 0;

let difficultyNote = '';
for (const kw of addedKeywords) {
  if (kw.difficulty && kw.difficulty > 60 && contentCount < 20) {
    difficultyNote += `\n⚠️ "${kw.keyword}" has difficulty ${kw.difficulty}/100 — with ${contentCount} articles, you may struggle to rank. Consider targeting difficulty <30 first.`;
  }
}
```

---

### SB-20: TODO — No content cannibalization prevention during generation

**Issue #74, #13 (cannibalization).** Detected after creation but should prevent during.

**Backend:** `content-action-tools.ts` — in `generate_full_content`, before generation, check:
```ts
const { data: existing } = await supabase.from('content_items')
  .select('id, title, seo_score')
  .eq('user_id', userId)
  .eq('main_keyword', toolArgs.keyword)
  .neq('status', 'archived');

if (existing && existing.length >= 2) {
  return {
    success: false,
    requiresConfirmation: true,
    message: `⚠️ You already have ${existing.length} articles targeting "${toolArgs.keyword}". Creating another may cannibalize rankings.`,
    actions: [
      { id: 'proceed', label: 'Write anyway (different angle)' },
      { id: 'update', label: 'Update best existing article' },
      { id: 'different', label: 'Suggest a different keyword' }
    ]
  };
}
```

---

### SB-21: PARTIAL — Content links back to conversation that created it

**Issue #17.** Content created via chat has no link back to the conversation.

**What's done:** `conversation_id` field exists in Supabase schema (supabase/types.ts).

**Remaining:** Field is not actively populated during content generation in `content-action-tools.ts`. Need to pass `context?.conversation_id` when saving content metadata. Frontend needs "Created in: [conversation title]" link in Repository content detail.

---

### SB-22: PARTIAL — Internal links not embedded in generated HTML

**Issue #68.** Suggestions shown in response but not actually inserted into the content.

**What's done:** `content-action-tools.ts` generates "Consider linking to: [article names]" recommendations.

**Remaining:** Links are NOT injected into the actual generated HTML content. Need post-generation link injection:
```ts
let enrichedContent = generatedContent;
for (const related of relatedArticles) {
  const keyword = related.main_keyword?.toLowerCase();
  if (keyword && enrichedContent.toLowerCase().includes(keyword)) {
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    enrichedContent = enrichedContent.replace(regex, `<a href="/repository#${related.id}">$1</a>`);
    break;
  }
}
```

---

### SB-23: DONE (mostly) — Competitor SWOT weaknesses not used in content differentiation

**Issue #60, #25.** SWOT data exists but content generation doesn't use specific weaknesses.

**Verified:** `content-action-tools.ts` fetches competitors, extracts weaknesses, and includes "Weaknesses to exploit" in `competitorContext` for content generation. Limited to 2 weaknesses max — acceptable for now.

---

## TIER 2: MONTH 1 — Fix in first 30 days after launch (25 items)

---

### M1-1: TODO — AI can't help improve existing content in-place (#22)

**Backend:** Add an `improve_content` tool that fetches an article, sends it to AI for improvement, and updates it in-place (with version snapshot first).

### M1-2: TODO — Content types beyond blog are second-class (#23)

**Backend:** Extend the enrichment pipeline in `generate_full_content` to conditionally apply SERP research for long-form formats and skip it for social/email.

### M1-3: TODO — No composite "content value" metric (#24)

**Backend:** Create a computed score: SEO score × repurpose count × age freshness factor. Store as `content_value_score` on content_items.

### M1-4: TODO — Competitor solutions not surfaced during generation (#25)

**Backend:** In the competitor enrichment section of `generate_full_content`, also query `competitor_solutions` for feature/pricing data when topic overlaps.

### M1-5: TODO — No cross-content consistency checking (#26)

**Backend:** After generating content, check if key claims (numbers, feature counts, pricing) conflict with existing published content. Flag in response.

### M1-6: DONE — No content performance dashboard (#27)

**Verified:** `/analytics` page exists at `src/pages/Analytics.tsx` with AnalyticsHero, AnalyticsOverview, ContentAnalyticsTab, CampaignAnalyticsTab, real analytics data via `useAnalyticsData` hook, date range filtering, metrics display, and drill-down.

### M1-7: DONE — Keyword-to-content mapping not visible (#28)

**Verified:** `KeywordsPage.tsx` shows `content_pieces` linked to keywords with filters for published content, draft content, and cannibalization detection.

### M1-8: TODO — Longitudinal activity summary (#18)

**Backend:** Add a `get_monthly_summary` tool that aggregates: content created, published, SEO change, keywords added, proposals accepted.

### M1-9: TODO — Proposal validation against actual results (#19)

**Backend:** When content created from a proposal gets published, check after 30 days if impression estimates were directionally correct.

### M1-10: TODO — Auto-distribute on publish (#20)

**Backend:** After `publish_to_website` succeeds, automatically offer to create social posts and email campaign (conversational — not silent).

### M1-11: DONE — Global search across all modules (#21)

**Verified:** `GlobalSearchResults` component exists and is integrated into `ChatHistorySidebar`. Searches across content_items, keywords, contacts, campaigns. Returns multi-category results with navigation.

### M1-12: TODO — Content brief persistence (#57)

**Backend:** Add `content_briefs` saving. When wizard completes, save the brief config. When starting a new wizard session, offer to reuse a saved brief.

### M1-13: TODO — Published content URL tracking (#58)

**Backend:** After `publish_to_website`, store the returned URL in `content_items.metadata.published_url`. Show in Repository.

### M1-14: TODO — Content approval as a real gate (#32)

**Backend:** Add a check in `publish_to_website`: if content has `approval_status = 'rejected'`, block publishing with a message.

### M1-15: TODO — Content funnel stage tracking (#41)

**DB:** Add `funnel_stage` column to content_items: 'tofu', 'mofu', 'bofu'. Show in generation config and Repository filters.

### M1-16: TODO — Outline pattern learning (#42)

**Backend:** Track which outline structures (heading count, section types) correlate with higher SEO scores. Feed patterns into wizard outline generation.

### M1-17: TODO — Calendar completion tracking (#16 enhanced)

**Backend:** Add cron check: if calendar item's `scheduled_date` is past and `status` is still 'planned', auto-update to 'overdue'. Notify user.

### M1-18: TODO — Content age "last reviewed" tracking (#72)

**DB:** Add `last_reviewed_at` column to content_items. Set on any view or edit. Use in freshness calculations.

### M1-19: TODO — Meta descriptions as click hooks (#73)

**Backend:** Update the meta description generation prompt: "Write a meta description that's a HOOK, not a summary. Create curiosity. Use a number or bold claim. Max 155 characters."

### M1-20: TODO — Content repurposing within same format (#56)

**Backend:** Add tool `reformat_content` that takes content and a target length (shorter/longer) without changing format.

### M1-21: TODO — User content goals (#39)

**DB:** Add `user_goals` table: `goal_type` ('monthly_articles', 'weekly_publish', 'seo_target'), `target_value`, `period`. Track in Analyst.

### M1-22: TODO — Per-article target audience (#35)

**DB:** Add `target_audience` field to content_items. Set during wizard config step. Use in generation prompt.

### M1-23: TODO — Multi-language support basics (#31)

**DB:** Add `language` field to brand_guidelines and content_items. Pass to generation prompt. Default 'en'.

### M1-24: TODO — Readability scoring (#62)

**Backend:** Add basic readability calculation (avg sentence length, passive voice %) to the SEO scorer output. Show alongside SEO score.

### M1-25: DONE — Conversation tagging UI completion (#36, previous plan #12)

**Verified:** `ChatHistorySidebar.tsx` implements full tag UI with PRESET_TAGS (important, strategy, content, research, follow-up), `onAddTag`/`onRemoveTag` handlers, tag colors, and display logic.

---

## TIER 3: USER-DRIVEN — Fix when users ask for it (32 items)

These are real improvements but not critical until the product has active users generating feedback.

---

### UD-1: TODO — A/B test content variations (#43)
### UD-2: TODO — Content dependency tracking (#44, #77)
### UD-3: TODO — User preference conflict resolution (#45)
### UD-4: TODO — Strategy builder guided flow (#46)
### UD-5: TODO — Multi-user notification scoping (#48)
### UD-6: TODO — AI admits capability limits honestly (#49)
### UD-7: TODO — Factual staleness detection in old content (#50)
### UD-8: TODO — Real case study data from solutions table (#51)
### UD-9: TODO — SERP competitive narrative analysis (#52)
### UD-10: TODO — Campaign ROI tracking (#54)
### UD-11: TODO — Curated/aggregation content support (#55)
### UD-12: TODO — Content distribution timing optimization (#59)
### UD-13: TODO — Content pillar-cluster orchestration (#61)
### UD-14: TODO — Incremental content updates (#63)
### UD-15: TODO — Strategic fit scoring on proposals (#64)
### UD-16: TODO — Multi-keyword SERP research (#65)
### UD-17: TODO — Content mix calendar tracking (#66)
### UD-18: TODO — Keyword strategic reasoning (#67)
### UD-19: TODO — Duplicate content detection (#69)
### UD-20: TODO — Time-aware task suggestions (#70)
### UD-21: TODO — Google indexing verification (#71)
### UD-22: TODO — Per-channel brand voice (#75)
### UD-23: TODO — AI provider tracking per content (#76)
### UD-24: TODO — Content unpublishing from website (#78)
### UD-25: TODO — Product-level feedback mechanism (#80)
### UD-26: TODO — Content summary/clustering of library (#38)
### UD-27: TODO — Shared conversation analytics (#40)
### UD-28: TODO — Email template preview from chat (#34)
### UD-29: TODO — Keyword rank history tracking (#36-keywords)
### UD-30: TODO — Solutions deeply integrated into campaigns (#37)
### UD-31: TODO — Voice input interpretation tolerance (#20-voice)
### UD-32: TODO — Shared conversation continuation (#21-shared)

---

## REMAINING IMPLEMENTATION ORDER

### Next Sprint: Ship Blockers — Remaining TODO (7 items, ~3 hours)

| # | Fix | Backend | Frontend | Effort |
|---|-----|:-------:|:--------:|--------|
| SB-4 | Rescore all existing content | Edge function | Settings button | 30 min |
| SB-6 | Social stub honest messaging | Tool response text | Dashboard banner | 15 min |
| SB-2 | Draft→Publish nudge | Recommendation | "Ready to Publish" filter | 30 min |
| SB-11 | Tool discovery in conversations | Prompt instruction | — | 15 min |
| SB-18 | Campaign content quality gate | Queue processor check | Amber badge | 20 min |
| SB-19 | Keyword difficulty context | Response enrichment | — | 15 min |
| SB-20 | Cannibalization prevention | Pre-generation check | — | 20 min |

### Next Sprint: Ship Blockers — PARTIAL completions (4 items, ~1.5 hours)

| # | Fix | What's left | Effort |
|---|-----|-------------|--------|
| SB-1 | Proposal→Action one-click | "Write This" button per proposal card → wizard pre-fill | 30 min |
| SB-7 | Email Resend onboarding | Setup card on first visit with no Resend key | 15 min |
| SB-10 | First-value milestones | Getting Started card with 3-step checklist | 20 min |
| SB-21 | Content←→Conversation link | Wire conversation_id in content-action-tools + frontend link | 20 min |

**Remaining Ship Blocker total: ~4.5 hours**

### Sprints 4-8: Month 1 items (M1-1 through M1-24, excluding DONE items)

21 items remaining. Suggested order:
- Sprint 4: M1-8 (monthly summary), M1-10 (auto-distribute), M1-17 (calendar tracking), M1-19 (meta hooks)
- Sprint 5: M1-1 (improve existing), M1-14 (approval gate), M1-13 (published URL tracking)
- Sprint 6: M1-12 (brief persistence), M1-15 (funnel stage), M1-22 (target audience)
- Sprint 7: M1-21 (user goals), M1-24 (readability), M1-18 (last reviewed)
- Sprint 8: M1-2 (content types), M1-3 (content value), M1-4 (competitor solutions), M1-5 (consistency check)
- Sprint 9: M1-9 (proposal validation), M1-16 (outline learning), M1-20 (reformat content), M1-23 (multi-language)

### Tier 3: As users request them

No implementation until real users ask. Track feature requests and prioritize by frequency.

---

## SUMMARY

| Tier | Items | Done | Remaining | Remaining Effort |
|------|:-----:|:----:|:---------:|:----------------:|
| Ship Blockers | 23 | 12 + 1 mostly done | 7 TODO + 4 PARTIAL | ~4.5 hours |
| Month 1 | 25 | 4 | 21 | ~15 hours |
| User-Driven | 32 | 0 | 32 | TBD |
| **Total** | **80** | **16** | **60** | |
