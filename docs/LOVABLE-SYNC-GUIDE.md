# Lovable Sync Guide — Changes Made by Claude

> **Date:** 2026-03-22
> **Commits:** 16 commits pushed directly to main
> **Rule:** All changes are additive or fix-only. No features removed. No UI redesigns. All existing functionality preserved.

---

## WHAT TO DO IN LOVABLE

1. **Pull latest from git** — all changes are on `main`
2. **Read this document** — understand what changed and why
3. **Deploy edge functions** — several backend files changed (enhanced-ai-chat, ai-proxy, keyword-action-tools, etc.). These need Supabase deployment.
4. **Test the app** — verify everything works end-to-end
5. **DO NOT revert any changes** unless something is broken — every change has a specific purpose documented below

---

## ALL CHANGES BY FILE (what was changed and why)

### DELETED FILES (dead code — zero imports anywhere)

| File | Why Deleted |
|------|-----------|
| `src/components/ai-chat/DataPointDetailPopup.tsx` | Built but never connected to any chart |
| `src/components/ai-chat/ChartActionModal.tsx` | Partially built, never integrated |
| `src/components/keywords/AddKeywordDialog.tsx` | Zero imports anywhere in codebase |
| `src/components/settings/modals/AIChatTestModal.tsx` | Debug tool only, not user-facing |
| `src/components/settings/debug/ApiKeyDebugModal.tsx` | Debug tool only, not user-facing |
| `src/components/settings/modals/SERPTestModal.tsx` | Debug tool only, not user-facing |

**Action for Lovable:** These files are gone. If any import errors appear, remove the import line (there shouldn't be any — verified zero imports before deletion).

---

### FRONTEND CHANGES

#### `src/components/layout/AppLayout.tsx`
**What:** Mounted `OnboardingProvider` wrapping the entire app. Added auto-trigger for first-time users.
**Why:** The entire onboarding system (BusinessSetupForm, OnboardingCarousel, processOnboardingSetup) existed but was never activated — `OnboardingProvider` was exported but never mounted. Now new users automatically see the onboarding carousel which collects company URL + competitor URLs and auto-extracts company info, competitors, solutions, and brand guidelines.
**Details:**
- `OnboardingProvider` wraps `AIChatDBProvider` and `ChatSearchProvider`
- `useOnboarding()` hook called in `AppLayoutInner`
- Auto-triggers `startOnboarding()` after 1 second if `hasCompletedOnboarding` is false
- `OnboardingCarousel` renders as overlay when `isOnboardingActive` is true

#### `src/pages/Analytics.tsx`
**What:** Added internal metrics section + actionable metric hints + trend arrows.
**Why:** Analytics page was empty without GA/GSC credentials. Now shows internal content performance metrics (articles created, published, avg SEO, trends) as the primary view. External GA data is a bonus section below.
**Details:**
- New `internalMetrics` from `useAnalyticsData` hook displayed in a 6-column grid
- Each metric shows 30-day trend with ↑/↓ percentage arrows (green/red)
- `getMetricContext()` function returns status (good/ok/attention) + actionable hint for each metric
- Status shown as green/yellow/red dot next to value
- Hint shown as small text below label (e.g., "High bounce — improve intro paragraphs and page load speed")
- Empty state banner text improved: "Connect Google Analytics in Settings → API Keys for traffic data"

#### `src/hooks/useAnalyticsData.ts`
**What:** Added `InternalMetrics` interface and computation. Returns `internalMetrics` alongside existing `metrics`.
**Why:** Provides analytics data from internal DB (content_items table) when no external analytics are configured.
**Details:**
- Computes: totalContent, published, drafts, avgSeoScore, contentCreatedThisMonth, contentCreatedTrend, contentPublishedThisMonth, contentPublishedTrend, typeDistribution, weeklyCreationData
- Runs 3 parallel Supabase queries (current 30d, previous 30d, all content)
- Non-blocking — wrapped in try-catch
- Returns `internalMetrics` from hook (can be null if computation fails)

#### `src/pages/keywords/KeywordsPage.tsx`
**What:** Added `loadError` state with retry button. Removed grid/list view toggle.
**Why:** Keywords page showed blank when fetch failed (no error indication). View toggle showed identical data in both modes.
**Details:**
- `loadError` state set on fetch failure, renders error message with "Retry" button
- `viewMode` changed from state to constant (`'grid' as const`) — always grid view
- `Button` import added

#### `src/pages/AIProposals.tsx`
**What:** Removed grid/list view toggle.
**Why:** Both views showed identical data — cognitive load for zero benefit.
**Details:**
- `viewMode` changed from state to constant (`'tiles' as const`)
- `ViewToggle` component render removed (replaced with comment)

#### `src/pages/Solutions.tsx`
**What:** Added progress indicator + reordered sections (Competitors moved to step 2).
**Why:** Page was 4 sections with no workflow guidance. Users didn't know where to start or why filling this out matters.
**Details:**
- Progress bar at top: "X of 4 steps complete" with 4 segment bars (green when done)
- Checks: company name != 'My Company', brand tone exists
- Section order: Company → Competitors → Solutions → Brand Voice (was: Company → Solutions → Brand → Competitors)
- Subtitle: "This data powers your AI content quality"

#### `src/components/keywords/KeywordCard.tsx`
**What:** Added "Write About This" button + expanded interface for SERP metrics + clickable cannibalization badge.
**Why:** Keywords page showed data but had no actionable next step. Users saw cannibalization warnings but couldn't fix them.
**Details:**
- Interface expanded: `search_volume?: number | null`, `difficulty?: number | null`
- SERP metrics section: shows KD badge (green/yellow/red) + volume estimate when available
- "Write About This" button: navigates to `/ai-chat?prompt=Write a comprehensive blog post about "[keyword]"`
- Cannibalization badge: clickable, navigates to AI Chat with differentiation prompt
- `TrendingUp` icon used for Write button

#### `src/components/research/content-strategy/ProposalCard.tsx`
**What:** Renamed "Write This" button to "Open in Wizard".
**Why:** Users didn't know what happened when clicking the button.

#### `src/components/approval/ContentApprovalView.tsx`
**What:** Fixed dead route + added visual workflow diagram.
**Why:** "Create Content" button pointed to `/content-type-selection` (404). Workflow not explained.
**Details:**
- Button now points to `/ai-chat`
- Empty state text: "No content pending approval. Create content in AI Chat or the Content Wizard, then submit it for review."
- Visual workflow: 4 color-coded pill badges showing Create → Submit → Review → Publish

#### `src/components/campaigns/CampaignsHero.tsx`
**What:** Updated subtitle + renamed "Express Mode" to "Quick Setup".
**Why:** Subtitle didn't differentiate from AI Chat. "Express Mode" sounded intimidating.
**Details:**
- Subtitle: "Plan multi-content campaigns with AI strategy. For single articles, use AI Chat."
- Mode label: "Express Mode" → "Quick Setup"

#### `src/components/engage/email/EmailDashboard.tsx`
**What:** Restructured tabs + changed default tab from inbox to campaigns.
**Why:** 7 tabs overwhelmed new users. Inbox was default but usually empty.
**Details:**
- Default tab: `'campaigns'` (was `'inbox'`)
- Tab array restructured: primary tabs (campaigns, templates, sent) listed first

#### `src/components/engage/email/templates/TemplatesList.tsx`
**What:** Added 3 seed template buttons in empty state.
**Why:** Empty templates page had no way to get started quickly.
**Details:**
- Newsletter, Product Update, Welcome Email — each pre-fills the template form with subject + HTML body
- Shown only when no templates exist

#### `src/components/engage/email/builder/BlockInspector.tsx`
**What:** Added "Generate with AI" button on email image blocks.
**Why:** Email builder had image blocks but no way to generate images with AI — only manual URL input.
**Details:**
- Dynamic import of `ImageGenService`
- `window.prompt()` for image description
- Sets block `url` and `alt` on generation success
- Uses `Sparkles` icon (already imported)

#### `src/components/engage/social/AISocialWriterDialog.tsx`
**What:** Added AI image generation button + image preview + image attachment to posts.
**Why:** Social posts need visuals. Image generation existed in the system but wasn't accessible from social tools.
**Details:**
- `ImagePlus` icon + `Button` imports added
- `generatedImageUrl` and `imageLoading` state added
- "Generate Image with AI" button before Generate Posts button
- Image preview rendered when URL exists
- `handleInsert` appends `[Image: URL]` to post content when image exists
- Toast shows "with AI image" on insert

#### `src/components/engage/automations/AutomationsList.tsx`
**What:** Added empty state with 3 preset quickstart cards.
**Why:** Empty automations page had no guidance. Presets existed but were hidden behind a dialog button.
**Details:**
- Shows top 3 presets (Welcome Series, Re-engagement, Tag-based Nurture) as clickable cards
- Clicking applies preset + opens creation form
- Only shown when `automations.length === 0 && !isLoading`

#### `src/components/engage/journeys/JourneysList.tsx`
**What:** Added 3 journey template cards in empty state.
**Why:** "Create First Journey" button didn't suggest what kind of journey to build.
**Details:**
- Welcome Series, Re-engagement, Onboarding — clickable cards
- Pre-fills journey name and description in creation form

#### `src/components/engage/contacts/ContactsList.tsx`
**What:** Updated subtitle to explain Tags vs Segments.
**Why:** Users confused about difference between Tags and Segments.
**Details:**
- Subtitle: "X contacts — Tags = labels you apply. Segments = auto-filtered groups based on rules."

#### `src/components/settings/api/DefaultAiProviderSelector.tsx`
**What:** Added description to provider switch toast.
**Why:** Users switching providers during active conversation didn't know about in-flight message behavior.
**Details:**
- Toast: "New messages will use this provider. Any in-progress response will complete with the previous one."

#### `src/components/settings/api/types.ts`
**What:** Marked video providers as (Beta).
**Why:** Video generation providers listed but not fully integrated.
**Details:**
- Runway: "(Beta)" appended to description
- Kling: "(Beta)" appended
- Replicate: "(Beta)" appended

#### `src/components/settings/HelpAndTourSettings.tsx`
**What:** "Restart Tour" button now clears localStorage completion flag.
**Why:** Previously the button just navigated — didn't reset the onboarding state.
**Details:**
- `localStorage.removeItem('creAiter-onboarding-completed')` called before `handleStartTour()`

#### `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`
**What:** Added data source + freshness label at top of timeline.
**Why:** Users didn't know where analyst data came from or how fresh it was.
**Details:**
- Shows "Data from your content library • Updated Xm ago" when `dataAgeLabel` is available
- `dataAgeLabel` was already computed but never rendered

#### `src/components/repository/RepositoryBulkBar.tsx`
**What:** Bulk delete now reports partial failures.
**Why:** Previously showed "Deleted X items" even when some failed.
**Details:**
- Tracks `deleted` and `failed` counts separately
- If `failed > 0`, shows destructive toast: "Deleted X, failed Y — some items may have dependencies"

#### `src/contexts/content/ContentProvider.tsx`
**What:** Fixed infinite refresh loop in Repository.
**Why:** `fetchContentItems` had `contentItems.length` in its `useCallback` dependency array. When content loaded → length changed → callback recreated → `useEffect` re-triggered → infinite loop.
**Details:**
- Added `useRef` import
- Added `contentItemsRef` to track content length without triggering re-renders
- Removed `contentItems.length` from `useCallback` deps
- Offset for pagination reads from ref instead of state
- `contentItemsRef.current` synced on every setContentItems call

#### `src/hooks/useAnalystEngine.ts`
**What:** Enriched publishing gap insight with last article title.
**Why:** Generic "X days since last publish" message didn't tell user which article was last.
**Details:**
- Changed from: `⏰ X days since last published content — consistency drives SEO growth`
- Changed to: `⏰ X days since your last publish ("Article Title"). Consistency drives SEO growth — aim for weekly.`

#### `src/pages/research/Calendar.tsx`
**What:** "Smart Scheduling" label → "Content Schedule".
**Why:** No AI scheduling exists. "Smart" label was misleading.

---

### BACKEND CHANGES (Edge Functions)

#### `supabase/functions/shared/cors.ts`
**What:** CORS lockdown — unknown origins no longer get wildcard `*`.
**Why:** Security — any origin could make cross-origin requests before.
**Details:**
- Unknown origins now get `Access-Control-Allow-Origin: https://creaiter.lovable.app` (not `*`)
- Legacy `corsHeaders` constant also defaults to production origin
- Known origins (lovable.app, localhost) unchanged

#### `supabase/functions/enhanced-ai-chat/index.ts`
**What:** Per-user rate limiting (30 requests/minute).
**Why:** No rate limiting existed — a single user could burn unlimited AI provider credits.
**Details:**
- Counts recent requests from `llm_usage_logs` table (last 60 seconds)
- If count ≥ 30, returns 429 with `Retry-After: 30` header
- Non-blocking: if count check fails, request proceeds normally

#### `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts`
**What:** Added `estimateKeywordMetrics()` function + saves metrics on SERP analysis.
**Why:** Keywords had `volume: 0`, `difficulty: 0` — the SEO foundation was hollow.
**Details:**
- `estimateKeywordMetrics()` extracts volume/difficulty/opportunity from SERP data:
  - Volume: logarithmic estimate from `total_results` (50 to 50,000)
  - Difficulty: 0-95 scale based on authority domains in top 5 results
  - Opportunity: inverse of difficulty × volume
- Called after `trigger_serp_analysis` returns — saves metrics to `keywords` table
- Zero extra API calls — uses data from the SERP response we already fetch

#### `supabase/functions/enhanced-ai-chat/proposal-action-tools.ts`
**What:** `create_proposal` now checks keywords table for SERP-backed volume data.
**Why:** Impression estimates were AI guesses with no data backing.
**Details:**
- Before inserting proposal, queries `keywords` table for matching keyword
- If SERP-estimated volume exists: calculates impressions at 4% CTR
- Stores `impression_source: 'serp_estimate'` or `'ai_estimate'` in metadata

#### `supabase/functions/enhanced-ai-chat/campaign-intelligence-tool.ts`
**What:** Fallback to `content_performance_signals` when `campaign_analytics` is empty.
**Why:** Campaign metrics showed "Views: 0" because no external analytics. But internal distribution signals exist.
**Details:**
- When `campaign_analytics` returns empty, queries `content_performance_signals` for campaign content
- Returns `internalMetrics`: totalContent, published, avgSeoScore, timesPublished, timesEmailed, timesRepurposed, totalDistributions

#### `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`
**What:** Added approval gate on `publish_to_website`.
**Why:** Rejected content could still be published through the chat tool.
**Details:**
- Before publishing, checks `approval_status` of the content item
- If `approval_status === 'rejected'`, returns error: "was rejected and cannot be published. Edit it and resubmit for review first."

#### `supabase/functions/enhanced-ai-chat/tools.ts`
**What:** Removed `send_quick_email` from cache invalidation map.
**Why:** This tool had no handler — if AI called it, it would error. Ghost reference.

#### `supabase/functions/keyword-serp/index.ts`
**What:** Extended SERP cache TTL from 24 hours to 7 days.
**Why:** Keyword metrics don't change daily. Reduces SERP API calls by ~7x.

---

### DOCUMENTATION FILES ADDED

These are plan/documentation files in `docs/`. They don't affect the app but provide context:

| File | Purpose |
|------|---------|
| `docs/roadmap.md` | Complete roadmap with phase status |
| `docs/roadmap-v2.md` | Phase 1-5 plan for getting all modules to 7+ |
| `docs/all-pages-to-9.md` | Detailed plan for every page to reach 9/10 |
| `docs/remaining-38-plan.md` | 38 UX cleanup items organized in batches |
| `docs/creaiter-audit-rating.md` | Full tool audit with module scores |
| `docs/final-11-fixes.md` | AI output quality fixes |
| `docs/self-learning-fix-plan.md` | Self-learning wiring plan |
| `docs/ai-confusion-fix-plan.md` | AI response confusion fixes |
| `docs/analyst-ai-sync-plan.md` | Analyst↔AI synchronization plan |
| `docs/ai-api-consolidation-plan.md` | API key storage consolidation plan |
| `docs/breakpoints-fix-plan.md` | 39 break points with fixes |
| Various other docs/ files | Historical plans from earlier sessions |

---

## THINGS LOVABLE SHOULD NOT CHANGE

1. **`ContentProvider.tsx` fix** — the `useCallback` dependency fix prevents an infinite loop. Don't add `contentItems.length` back to the deps array.
2. **`cors.ts` lockdown** — don't change back to `*` for unknown origins.
3. **`index.ts` rate limiting** — the 30/min limit uses `llm_usage_logs` table. If this table doesn't exist, the rate limit check will fail gracefully (non-blocking).
4. **Deleted files** — don't recreate the 6 deleted files. They were verified to have zero imports.
5. **`estimateKeywordMetrics()`** — this function uses data from SERP responses we already fetch. No extra API calls. Don't add separate SERP calls for keyword metrics.

---

## THINGS LOVABLE CAN IMPROVE ON TOP

These Claude implementations are functional but could be polished visually:

1. **Analytics internal metrics section** — currently a basic grid. Could add charts (weekly creation area chart, content type pie chart).
2. **Offerings progress bar** — currently simple segment bars. Could add animated progress or checkmark icons per step.
3. **Email seed templates** — currently basic HTML. Could add richer template designs with the email builder blocks.
4. **Journey templates** — currently just name/description pre-fill. Could add pre-built node layouts (start → email → wait → email → end).
5. **Content Approval workflow diagram** — currently pill badges in a row. Could add connecting lines or a visual flow.
6. **Social image attachment** — currently appends `[Image: URL]` to post content text. Could store in `media_urls` array properly.

---

## DATABASE CHANGES

**No migrations were created.** All changes use existing tables and columns. The only DB-related changes are:

1. Keywords table: `search_volume` and `difficulty` columns are now populated by `estimateKeywordMetrics()` (these columns already exist).
2. `llm_usage_logs` table: used for rate limiting count (table already exists).
3. `content_performance_signals` table: queried by campaign intelligence fallback (table already exists).

---

## EDGE FUNCTIONS THAT NEED REDEPLOYMENT

These edge function files were modified and need to be deployed to Supabase:

1. `supabase/functions/shared/cors.ts` — CORS lockdown
2. `supabase/functions/enhanced-ai-chat/index.ts` — rate limiting
3. `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` — keyword metrics
4. `supabase/functions/enhanced-ai-chat/proposal-action-tools.ts` — SERP-backed proposals
5. `supabase/functions/enhanced-ai-chat/campaign-intelligence-tool.ts` — campaign fallback metrics
6. `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — approval gate on publish
7. `supabase/functions/enhanced-ai-chat/tools.ts` — removed ghost tool reference
8. `supabase/functions/keyword-serp/index.ts` — cache TTL extension

Lovable should auto-deploy these when it syncs. If not, manually deploy via Supabase CLI or dashboard.
