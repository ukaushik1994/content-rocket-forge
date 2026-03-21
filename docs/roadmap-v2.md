# Creaiter — Master Roadmap v2

> **Updated:** 2026-03-22
> **Purpose:** Where we are, where we need to go, and how to get there without burning API credits.

---

## WHERE WE ARE (honest snapshot)

### What's Genuinely Strong (7+/10)

| Module | Score | Reality |
|--------|:-----:|---------|
| Contacts/Segments/Journeys | 9/8 | Real CRM, real segmentation, journey execution with duplicate protection. Best module. |
| AI Chat | 8/7 | 90 tools that execute. Self-learning. Priority rules. Dynamic temperature. Streaming. |
| Content Generation | 8/7 | 7-source enrichment. Chunked generation. SERP integration. Improve + reformat tools. |
| Calendar | 8/7 | Full CRUD, overdue detection, proposal linking, bulk operations. |
| Email (Engage) | 8/7 | Full campaign workflow, Resend sending, templates, scheduling. |
| Settings | 8/7 | 19 providers, auto-detect models, real token tracking, default provider selector. |
| Analyst Sidebar | 7/6 | 12 sections, real DB data, stage-aware health, trajectory recommendations, analyst↔AI sync. |
| Competitors | 7/6 | Real crawling, SWOT analysis (AI-generated), feeds into content generation. |
| Solutions/Offerings | 7/6 | Rich storage, used in content generation context. |
| Publishing | 7/6 | Real WordPress/Wix publishing. URL tracked. |
| Social (Engage) | 7/6 | Post creation, platform limits, scheduling. Drafts-only. |
| Repository | 6/6 | CRUD, versioning, approval workflow, SEO scoring. |

### What's Weak (under 6/10)

| Module | Score | The Problem |
|--------|:-----:|------------|
| Campaigns | 6/5 | Queue processor works but metrics are internal counts only. No external performance data. |
| Proposals | 5/4 | Impression estimates are AI guesses. No validation against real data. |
| Keywords + SERP | 3/3 | SERP API returns search results but NO volume, difficulty, or CPC. The foundation of SEO strategy is hollow. |
| Analytics | 3/2 | GA/GSC infrastructure exists but shows nothing without credentials. Page is empty for most users. |

---

## WHERE WE NEED TO GO

### The Goal: Every Module at 7+/10

| Module | Now | Target | What's needed |
|--------|:---:|:------:|--------------|
| Keywords + SERP | 3 | 7 | Add volume + difficulty from SERP results. Cache intelligently. |
| Analytics | 3 | 7 | Make internal analytics useful even without GA. Show content performance from what we have. |
| Proposals | 5 | 7 | Back estimates with SERP volume data. Add validation tracking. |
| Campaigns | 6 | 7 | Connect campaign content to performance signals. Show real progress. |
| Repository | 6 | 7 | Surface readability alongside SEO. Make approval workflow enforce publishing gate. |

### The Constraint: Don't Burn API Credits

Every SERP API call costs money. Every AI call costs tokens. The plan must:
- Cache aggressively (24h+ for SERP data)
- Batch requests (one SERP call returns multiple data points)
- Compute what we can locally (readability, word count, heading analysis)
- Only call external APIs when user explicitly asks or data is stale
- Never call SERP in background/cron — only on user action

---

## THE PLAN: 5 Phases

---

## PHASE 1: Make Keywords Actually Useful (biggest impact)

**Current state:** SERP API is called and returns organic results, People Also Ask, Related Searches. But the keyword objects stored in the DB have `volume: 0`, `difficulty: 0`, `cpc: '$0.00'`. The entire Keywords page is hollow.

**The fix:** When SERP results come back, extract and compute keyword metrics from the data we already get. No extra API calls needed.

### 1A — Extract volume estimates from SERP data we already have

**Backend — File:** `supabase/functions/serp-ai/index.ts` (or wherever SERP results are parsed)

SerpAPI returns `search_information.total_results` and organic result positions. We can estimate relative volume from these signals:

```ts
// After SERP results are parsed:
function estimateKeywordMetrics(serpData: any): { volume: string; difficulty: number; opportunity: number } {
  const totalResults = serpData?.search_information?.total_results || 0;
  const organicResults = serpData?.organic_results || [];
  const paaCount = serpData?.related_questions?.length || 0;
  const relatedCount = serpData?.related_searches?.length || 0;

  // Volume estimate based on total results (logarithmic scale)
  // 1B+ results = very high volume, 1M = high, 100K = medium, 10K = low
  let volumeEstimate = 'Low';
  let volumeNumber = 100;
  if (totalResults > 1_000_000_000) { volumeEstimate = 'Very High'; volumeNumber = 50000; }
  else if (totalResults > 100_000_000) { volumeEstimate = 'High'; volumeNumber = 10000; }
  else if (totalResults > 10_000_000) { volumeEstimate = 'Medium-High'; volumeNumber = 5000; }
  else if (totalResults > 1_000_000) { volumeEstimate = 'Medium'; volumeNumber = 1000; }
  else if (totalResults > 100_000) { volumeEstimate = 'Low-Medium'; volumeNumber = 500; }

  // Difficulty estimate based on what's ranking
  // If top results are from high-authority domains, difficulty is high
  const topDomains = organicResults.slice(0, 5).map((r: any) => {
    const url = r.link || r.url || '';
    try { return new URL(url).hostname; } catch { return ''; }
  });
  const authorityDomains = ['wikipedia.org', 'forbes.com', 'hubspot.com', 'nytimes.com',
    'amazon.com', 'linkedin.com', 'medium.com', 'youtube.com', 'reddit.com', 'quora.com',
    'gov', 'edu', 'bbc.com', 'cnn.com', 'techcrunch.com', 'mashable.com'];
  const authorityCount = topDomains.filter((d: string) =>
    authorityDomains.some(a => d.includes(a))
  ).length;

  // Difficulty: 0-100 scale
  const difficulty = Math.min(95, Math.round(
    (authorityCount / 5) * 50 +  // 0-50 from authority
    (totalResults > 10_000_000 ? 20 : totalResults > 1_000_000 ? 10 : 0) +  // 0-20 from competition
    (organicResults.length >= 10 ? 15 : 5)  // 5-15 from SERP fullness
  ));

  // Opportunity score (inverse of difficulty, weighted by volume)
  const opportunity = Math.round(Math.max(0, (100 - difficulty) * (volumeNumber / 10000)));

  return {
    volume: `${volumeEstimate} (~${volumeNumber.toLocaleString()}/mo est.)`,
    difficulty,
    opportunity
  };
}
```

**Important:** This is an ESTIMATE based on SERP signals, not real Google Keyword Planner data. Label it accordingly in the UI. But it's infinitely better than showing 0.

**Cost:** ZERO extra API calls. We extract from data we already fetch.

### 1B — Store metrics when SERP is analyzed

**Backend — File:** `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts`

When `trigger_serp_analysis` or `add_keywords` runs and SERP data is available, save the computed metrics:

```ts
// After SERP analysis, update keyword with estimated metrics:
if (serpData) {
  const metrics = estimateKeywordMetrics(serpData);
  await supabase.from('keywords')
    .update({
      search_volume: metrics.volume,
      difficulty: metrics.difficulty,
      opportunity_score: metrics.opportunity,
      metrics_source: 'serp_estimate',
      metrics_updated_at: new Date().toISOString()
    })
    .eq('id', keywordId)
    .eq('user_id', userId);
}
```

### 1C — Show metrics on Keywords page

**Frontend — File:** `src/components/keywords/KeywordCard.tsx` (or wherever keyword data displays)

The card already shows keyword name. Add the new fields:

```tsx
{keyword.difficulty > 0 && (
  <div className="flex items-center gap-2 mt-1">
    <span className={cn(
      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
      keyword.difficulty > 70 ? "bg-red-500/20 text-red-300" :
      keyword.difficulty > 40 ? "bg-yellow-500/20 text-yellow-300" :
      "bg-green-500/20 text-green-300"
    )}>
      Difficulty: {keyword.difficulty}
    </span>
    {keyword.search_volume && (
      <span className="text-[10px] text-muted-foreground">
        {keyword.search_volume}
      </span>
    )}
  </div>
)}
```

**Cost:** Zero. Just displaying data already computed.

### 1D — Cache SERP results aggressively

**Backend:** SERP results should be cached for 7 days (not 24 hours). Keyword metrics don't change daily.

Find where SERP cache TTL is set. Change from 24h to 7 days:

```ts
const SERP_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
```

This means each keyword costs 1 SERP API call per week maximum.

**Frontend:** No changes.

---

## PHASE 2: Make Analytics Useful Without GA (second biggest impact)

**Current state:** Analytics page shows 0 for everything without GA credentials. But we HAVE internal data — content created/published, SEO scores, keyword coverage, publish rate, content age.

**The fix:** Build an internal analytics dashboard from DB data. Show what we CAN show. GA/GSC is a bonus layer on top.

### 2A — Compute internal content analytics

**Frontend — File:** `src/hooks/useAnalyticsData.ts`

Instead of only querying `content_analytics` table (empty without GA), also compute from `content_items`:

```ts
// Add internal analytics computation:
async function computeInternalAnalytics(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  // Current period (last 30 days)
  const { data: currentContent } = await supabase
    .from('content_items')
    .select('id, status, seo_score, created_at, content_type, word_count')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo);

  // Previous period (30-60 days ago) for comparison
  const { data: prevContent } = await supabase
    .from('content_items')
    .select('id, status, seo_score, created_at')
    .eq('user_id', userId)
    .gte('created_at', sixtyDaysAgo)
    .lt('created_at', thirtyDaysAgo);

  // All content for totals
  const { data: allContent } = await supabase
    .from('content_items')
    .select('id, status, seo_score, content_type, word_count, created_at')
    .eq('user_id', userId)
    .is('deleted_at', null);

  const current = currentContent || [];
  const prev = prevContent || [];
  const all = allContent || [];

  const published = all.filter(c => c.status === 'published');
  const drafts = all.filter(c => c.status === 'draft');
  const avgSeo = published.length > 0
    ? Math.round(published.reduce((sum, c) => sum + (c.seo_score || 0), 0) / published.length)
    : 0;
  const totalWords = all.reduce((sum, c) => sum + (c.word_count || 0), 0);

  // Trends
  const currentCreated = current.length;
  const prevCreated = prev.length;
  const createdTrend = prevCreated > 0 ? Math.round(((currentCreated - prevCreated) / prevCreated) * 100) : 0;

  const currentPublished = current.filter(c => c.status === 'published').length;
  const prevPublished = prev.filter(c => c.status === 'published').length;
  const publishedTrend = prevPublished > 0 ? Math.round(((currentPublished - prevPublished) / prevPublished) * 100) : 0;

  // Content type distribution
  const typeDistribution: Record<string, number> = {};
  all.forEach(c => {
    const type = c.content_type || 'blog';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });

  // Weekly creation rate (last 12 weeks)
  const weeklyData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const count = all.filter(c => {
      const d = new Date(c.created_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    weeklyData.push({
      week: weekStart.toISOString().slice(5, 10),
      created: count
    });
  }

  return {
    totalContent: all.length,
    published: published.length,
    drafts: drafts.length,
    avgSeoScore: avgSeo,
    totalWords,
    contentCreatedThisMonth: currentCreated,
    contentCreatedTrend: createdTrend,
    contentPublishedThisMonth: currentPublished,
    contentPublishedTrend: publishedTrend,
    typeDistribution,
    weeklyCreationData: weeklyData,
    hasExternalAnalytics: false
  };
}
```

### 2B — Show internal analytics on Analytics page

**Frontend — File:** `src/pages/Analytics.tsx`

When GA/GSC data is empty, show internal analytics instead of empty cards:

```tsx
// If no external analytics, show internal metrics:
{!hasExternalData && internalAnalytics && (
  <>
    <MetricCard title="Content Created (30d)" value={internalAnalytics.contentCreatedThisMonth}
      trend={internalAnalytics.contentCreatedTrend} />
    <MetricCard title="Content Published (30d)" value={internalAnalytics.contentPublishedThisMonth}
      trend={internalAnalytics.contentPublishedTrend} />
    <MetricCard title="Total Articles" value={internalAnalytics.totalContent} />
    <MetricCard title="Avg SEO Score" value={`${internalAnalytics.avgSeoScore}/100`} />
    <MetricCard title="Total Words Written" value={internalAnalytics.totalWords.toLocaleString()} />
    <MetricCard title="Drafts Pending" value={internalAnalytics.drafts} />

    {/* Weekly creation chart */}
    <AreaChart data={internalAnalytics.weeklyCreationData} />

    {/* Content type pie chart */}
    <PieChart data={Object.entries(internalAnalytics.typeDistribution).map(([type, count]) => ({
      name: type, value: count
    }))} />

    <p className="text-xs text-muted-foreground mt-4">
      Showing internal content metrics. Connect Google Analytics in Settings for traffic data.
    </p>
  </>
)}
```

**Cost:** Zero API calls. Pure DB queries on user's own data.

---

## PHASE 3: Back Proposals With Real Data

**Current state:** Proposals show "Estimated Monthly Impressions: 12,500" but this is an AI guess.

**The fix:** When proposals are generated, use SERP volume estimates (from Phase 1) to back the numbers. If SERP data exists for the keyword, use it. If not, say "estimate unavailable."

### 3A — Feed SERP metrics into proposal generation

**Backend — File:** `supabase/functions/enhanced-ai-chat/proposal-action-tools.ts` (or wherever proposals are created)

When creating a proposal, check if we have SERP-backed metrics for the keyword:

```ts
// Before saving proposal:
let estimatedImpressions = null;
let impressionSource = 'none';

// Check if keyword has SERP-estimated volume
const { data: kwData } = await supabase
  .from('keywords')
  .select('search_volume, difficulty, opportunity_score, metrics_source')
  .eq('user_id', userId)
  .ilike('keyword', toolArgs.keyword)
  .maybeSingle();

if (kwData?.search_volume && kwData.metrics_source === 'serp_estimate') {
  // Extract numeric volume from string like "Medium (~1,000/mo est.)"
  const volumeMatch = kwData.search_volume.match(/~([\d,]+)/);
  const monthlyVolume = volumeMatch ? parseInt(volumeMatch[1].replace(/,/g, '')) : 0;
  // Assume 3-5% CTR for position 1-3
  estimatedImpressions = Math.round(monthlyVolume * 0.04);
  impressionSource = 'serp_estimate';
} else {
  impressionSource = 'unavailable';
}

// Save proposal with backed estimate:
await supabase.from('ai_strategy_proposals').insert({
  ...proposalData,
  estimated_impressions: estimatedImpressions,
  metadata: {
    ...proposalData.metadata,
    impression_source: impressionSource,
    keyword_difficulty: kwData?.difficulty || null
  }
});
```

### 3B — Show confidence level on proposal cards

**Frontend — File:** `src/components/research/content-strategy/ProposalCard.tsx`

Next to the impression number, show the source:

```tsx
<div className="text-2xl font-bold text-white">
  {estImpressions > 0 ? (
    <>
      {estImpressions.toLocaleString()}
      <span className="text-sm font-normal text-white/50 ml-1">
        ({proposal.metadata?.impression_source === 'serp_estimate' ? 'SERP est.' : 'est.'})
      </span>
    </>
  ) : (
    <span className="text-sm font-normal text-white/50">Run SERP analysis for estimates</span>
  )}
</div>
```

**Cost:** Zero extra SERP calls. Uses data from Phase 1 cache.

---

## PHASE 4: Campaign Metrics From Internal Signals

**Current state:** Campaign intelligence shows "Total Views: 0" because there's no external analytics. But we DO have performance signals (publish, email_convert, social_repurpose).

### 4A — Aggregate performance signals per campaign

**Backend — File:** `supabase/functions/enhanced-ai-chat/campaign-intelligence-tool.ts`

When campaign intelligence is requested, aggregate from `content_performance_signals`:

```ts
// Get real performance signals for campaign content
const { data: campaignContent } = await supabase
  .from('content_items')
  .select('id, title, seo_score, status')
  .eq('campaign_id', campaignId)
  .eq('user_id', userId);

const contentIds = campaignContent?.map(c => c.id) || [];

if (contentIds.length > 0) {
  const { data: signals } = await supabase
    .from('content_performance_signals')
    .select('content_id, signal_type')
    .in('content_id', contentIds);

  const signalCounts: Record<string, number> = {};
  (signals || []).forEach(s => {
    signalCounts[s.signal_type] = (signalCounts[s.signal_type] || 0) + 1;
  });

  campaignMetrics = {
    totalContent: campaignContent.length,
    published: campaignContent.filter(c => c.status === 'published').length,
    avgSeo: Math.round(campaignContent.reduce((sum, c) => sum + (c.seo_score || 0), 0) / campaignContent.length),
    timesPublished: signalCounts['publish'] || 0,
    timesEmailed: signalCounts['email_convert'] || 0,
    timesRepurposed: signalCounts['social_repurpose'] || 0,
    totalDistributions: Object.values(signalCounts).reduce((a, b) => a + b, 0)
  };
}
```

**Cost:** Zero external API calls. Pure DB queries.

### 4B — Show distribution metrics instead of "views"

**Frontend:** Instead of showing "Total Views: 0", show what we actually know:

```tsx
<MetricCard title="Content Pieces" value={metrics.totalContent} />
<MetricCard title="Published" value={metrics.published} />
<MetricCard title="Avg SEO" value={`${metrics.avgSeo}/100`} />
<MetricCard title="Times Distributed" value={metrics.totalDistributions}
  description="Published + emailed + repurposed" />
```

---

## PHASE 5: Repository Quality Depth

### 5A — Surface readability alongside SEO

**Backend — File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

The `computeReadability()` function already exists (from earlier fixes). Make sure it's called during content save and the result is stored:

```ts
// After saving content, also save readability:
const readability = computeReadability(content);
await supabase.from('content_items')
  .update({
    metadata: {
      ...existingMetadata,
      readability_grade: readability.grade,
      avg_sentence_length: readability.avgSentenceLength
    }
  })
  .eq('id', contentId);
```

**Frontend:** Show readability badge on content cards next to SEO score:

```tsx
{item.metadata?.readability_grade && (
  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
    {item.metadata.readability_grade}
  </span>
)}
```

### 5B — Approval workflow enforces publish gate

**Backend — File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`

In `publish_to_website`, check approval status:

```ts
// Before publishing, check approval:
if (content.approval_status === 'rejected') {
  return JSON.stringify({
    success: false,
    message: 'This content was rejected and cannot be published. Edit it and resubmit for review.'
  });
}
```

**Cost for all of Phase 5:** Zero API calls.

---

## API COST SUMMARY

| Phase | SERP API Calls | AI Calls | DB Queries |
|-------|:--------------:|:--------:|:----------:|
| 1 — Keywords | 0 extra (uses existing) | 0 | ~5 per keyword update |
| 2 — Analytics | 0 | 0 | ~8 per page load |
| 3 — Proposals | 0 (uses Phase 1 cache) | 0 | ~3 per proposal |
| 4 — Campaigns | 0 | 0 | ~5 per campaign |
| 5 — Repository | 0 | 0 | ~2 per content save |

**Total extra API cost: ZERO.** All improvements use data we already have or compute locally.

---

## EXPECTED SCORES AFTER ALL PHASES

| Module | Now | After | What changed |
|--------|:---:|:-----:|-------------|
| Keywords + SERP | 3/3 | **7/6** | Volume estimates, difficulty, opportunity scores from SERP signals |
| Analytics | 3/2 | **7/6** | Internal metrics dashboard (creation rate, SEO trends, word count, type distribution) |
| Proposals | 5/4 | **7/6** | SERP-backed impression estimates with confidence labels |
| Campaigns | 6/5 | **7/6** | Real distribution metrics from performance signals |
| Repository | 6/6 | **7/7** | Readability scoring, approval enforces publish gate |

**Overall tool score: 8.6 → 9.0+** (all modules at 7+)

---

## IMPLEMENTATION ORDER

| Phase | Who | Time | Dependencies |
|-------|-----|------|-------------|
| 1 — Keywords | Claude (backend) + frontend | 45 min | None |
| 2 — Analytics | Claude (frontend) | 30 min | None |
| 3 — Proposals | Claude (backend + frontend) | 20 min | Phase 1 (needs SERP estimates) |
| 4 — Campaigns | Claude (backend + frontend) | 20 min | None |
| 5 — Repository | Claude (backend + frontend) | 15 min | None |

**Total: ~2.5 hours. Zero extra API cost.**

Phases 1 and 2 can run in parallel. Phase 3 depends on Phase 1. Phases 4 and 5 are independent.

---

## AFTER THESE 5 PHASES

**Every module is at 7+/10.** The remaining gaps are:
- Real Google Analytics integration (needs user credentials — can't force)
- Social platform posting (needs Twitter/LinkedIn OAuth — large project)
- Team features (needs auth/permissions overhaul — large project)
- Billing (needs Stripe — business decision)

These are business features, not technical fixes. They come when the product needs them.
