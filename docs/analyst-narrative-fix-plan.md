# Analyst Narrative Timeline — Fix Plan

> 10 problems found. Each section needs to go from presentation shell to data-driven intelligence.
> Every fix has exact file, exact code, frontend + backend.

---

## FIX 1: Connect PreviousSessionSection to actual data

**Problem:** Component exists, imported, but never rendered in the timeline.

### Frontend

**File:** `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx` — line 81-82

Find:
```tsx
      {/* 10. Previous Session — placeholder, shows when session context exists */}
      {/* Future: check for persisted session context */}
```

Replace with:
```tsx
      {/* 10. Previous Session */}
      {analystState && analystState.insightsFeed.some(i => i.source === 'memory') && (
        <PreviousSessionSection onSendMessage={onSendMessage} />
      )}
```

### Backend

No changes — the `useAnalystEngine` already loads previous session insights from localStorage and tags them with `source: 'memory'`. The rendering condition just needs to check for that source.

---

## FIX 2: Make ContentIntelligenceSection data-driven

**Problem:** Static headline "active", only shows count cards, no article names or SEO specifics.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — inside `fetchPlatformData`, add content-specific data points:

After the existing content count queries, add:

```ts
if (coveredCategories.has('content') || coveredCategories.has('analytics')) {
  fetches.push((async () => {
    // Avg SEO score
    const { data: seoData } = await supabase
      .from('content_items')
      .select('seo_score')
      .eq('user_id', userId)
      .eq('status', 'published')
      .not('seo_score', 'is', null);

    if (seoData && seoData.length > 0) {
      const avg = Math.round(seoData.reduce((s, c) => s + (c.seo_score || 0), 0) / seoData.length);
      newData.push({ label: 'Avg SEO Score', value: avg, category: 'content', fetchedAt: now });
    }
  })());

  fetches.push((async () => {
    // Top article by SEO
    const { data: topArticle } = await supabase
      .from('content_items')
      .select('title, seo_score')
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('seo_score', { ascending: false })
      .limit(1)
      .single();

    if (topArticle) {
      newData.push({ label: `Best: "${topArticle.title}"`, value: topArticle.seo_score || 0, category: 'content_detail', fetchedAt: now });
    }
  })());

  fetches.push((async () => {
    // Draft count
    const { count: draftCount } = await supabase
      .from('content_items')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'draft');

    if (draftCount !== null) {
      newData.push({ label: 'Drafts', value: draftCount, category: 'content', fetchedAt: now });
    }
  })());
}
```

### Frontend

**File:** `src/components/ai-chat/analyst-sections/ContentIntelligenceSection.tsx`

Replace the entire component:

```tsx
import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { AnalystDataCard } from './AnalystDataCard';
import { NarrativePromptCard } from './NarrativePromptCard';
import { PlatformDataPoint } from '@/hooks/useAnalystEngine';

interface Props {
  platformData: PlatformDataPoint[];
  onSendMessage: (message: string) => void;
}

export const ContentIntelligenceSection: React.FC<Props> = ({ platformData, onSendMessage }) => {
  const contentMetrics = platformData.filter(d => d.category === 'content');
  const contentDetails = platformData.filter(d => d.category === 'content_detail');
  if (contentMetrics.length === 0) return null;

  const published = contentMetrics.find(m => m.label === 'Published')?.value || 0;
  const total = contentMetrics.find(m => m.label === 'Total Content')?.value || 0;
  const avgSeo = contentMetrics.find(m => m.label === 'Avg SEO Score')?.value || 0;
  const drafts = contentMetrics.find(m => m.label === 'Drafts')?.value || 0;
  const topArticle = contentDetails.find(m => m.label.startsWith('Best:'));

  const publishRate = total > 0 ? Math.round((published / total) * 100) : 0;

  const getHeadline = () => {
    if (avgSeo >= 60 && publishRate >= 40) return <>Your content engine has <span className="text-emerald-400/80">clear winners</span> worth replicating</>;
    if (avgSeo < 40) return <>Content quality needs <span className="text-rose-300">systematic improvement</span></>;
    if (drafts > published * 2) return <><span className="text-amber-300">{drafts} drafts</span> are waiting — your pipeline is loaded but stuck</>;
    return <>Content shows <span className="text-amber-300">mixed signals</span> — some strong, some weak</>;
  };

  return (
    <AnalystSectionWrapper number="04" label="Content Intelligence" headline={getHeadline()} delay={0.18}>
      <div className="grid grid-cols-2 gap-3">
        <AnalystDataCard label="Published" value={published} subtitle={`${publishRate}% of ${total} total`} />
        <AnalystDataCard label="Avg SEO" value={`${avgSeo}/100`} color={avgSeo >= 60 ? 'green' : avgSeo >= 40 ? 'amber' : 'red'} />
      </div>

      {topArticle && (
        <div className="glass-card p-4">
          <p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1">Top Performer</p>
          <p className="text-sm font-medium text-foreground truncate">{topArticle.label.replace('Best: ', '')}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">SEO Score: {topArticle.value}/100</p>
        </div>
      )}

      {drafts > 5 && (
        <NarrativePromptCard
          question={`You have ${drafts} drafts — ${drafts > published ? 'more than your published count' : 'a healthy pipeline'}. Ready to review the best ones?`}
          primaryLabel="Review Top Drafts"
          primaryAction="Show my top drafts sorted by SEO score — which ones should I publish?"
          secondaryLabel="Keep Drafting"
          secondaryAction=""
          onSendMessage={onSendMessage}
        />
      )}
    </AnalystSectionWrapper>
  );
};
```

---

## FIX 3: Make all remaining static-headline sections data-driven

Same pattern for each. I'll provide the headline logic — the data cards can stay as-is since they already render platformData.

### KeywordLandscapeSection

**File:** `src/components/ai-chat/analyst-sections/KeywordLandscapeSection.tsx`

Replace static headline with:
```tsx
const getHeadline = () => {
  const kwCount = platformData.find(d => d.label.includes('Keyword'))?.value || 0;
  const hasTopics = topics.some(t => t.category === 'keywords');
  if (kwCount === 0) return <>Operating without <span className="text-rose-300">keyword intelligence</span></>;
  if (kwCount < 10) return <>Your keyword base is <span className="text-amber-300">emerging</span> — room to expand</>;
  return <>Keyword portfolio has <span className="text-emerald-400/80">{kwCount} targets</span> tracked</>;
};
```

### CampaignPulseSection

**File:** `src/components/ai-chat/analyst-sections/CampaignPulseSection.tsx`

```tsx
const getHeadline = () => {
  const campaigns = platformData.find(d => d.label.includes('Campaign'))?.value || 0;
  const queueFailed = platformData.find(d => d.label.includes('Failed'))?.value || 0;
  if (campaigns === 0) return <>Campaign engine is <span className="text-rose-300">idle</span></>;
  if (queueFailed > 0) return <>Pipeline has <span className="text-rose-300">{queueFailed} failures</span> needing intervention</>;
  return <>Campaigns are <span className="text-emerald-400/80">operational</span></>;
};
```

### EngagementMetricsSection

**File:** `src/components/ai-chat/analyst-sections/EngagementMetricsSection.tsx`

```tsx
const getHeadline = () => {
  const contacts = platformData.find(d => d.label.includes('Contact'))?.value || 0;
  const emails = platformData.find(d => d.label.includes('Email') || d.label.includes('Campaign'))?.value || 0;
  if (contacts === 0 && emails === 0) return <>Marketing channels are <span className="text-rose-300">dormant</span></>;
  if (contacts > 0 && emails > 0) return <>Audience reach is <span className="text-emerald-400/80">active</span> across channels</>;
  return <>Engagement is <span className="text-amber-300">partially online</span></>;
};
```

### CompetitivePositionSection

**File:** `src/components/ai-chat/analyst-sections/CompetitivePositionSection.tsx`

```tsx
const getHeadline = () => {
  const competitorCount = topics.filter(t => t.category === 'competitors').length;
  if (competitorCount === 0) return <>Operating in a <span className="text-rose-300">blind spot</span> — no rivals tracked</>;
  return <><span className="text-amber-300">{competitorCount}</span> competitive signals detected</>;
};
```

### Backend for all of the above

Add competitor count, campaign queue stats, and engage stats to `fetchPlatformData` in `useAnalystEngine.ts`:

```ts
if (coveredCategories.has('campaigns')) {
  fetches.push((async () => {
    const { data: queueItems } = await supabase
      .from('content_generation_queue')
      .select('status')
      .eq('user_id', userId);

    if (queueItems) {
      const failed = queueItems.filter(q => q.status === 'failed').length;
      const pending = queueItems.filter(q => q.status === 'pending').length;
      if (failed > 0) newData.push({ label: 'Queue Failed', value: failed, category: 'campaigns', fetchedAt: now });
      if (pending > 0) newData.push({ label: 'Queue Pending', value: pending, category: 'campaigns', fetchedAt: now });
    }
  })());
}

if (coveredCategories.has('email') || coveredCategories.has('engage')) {
  // Get workspace first
  const { data: ws } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
  if (ws?.workspace_id) {
    fetches.push((async () => {
      const { count } = await supabase.from('engage_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspace_id);
      if (count !== null) newData.push({ label: 'Contacts', value: count, category: 'engage', fetchedAt: now });
    })());
    fetches.push((async () => {
      const { count } = await supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspace_id);
      if (count !== null) newData.push({ label: 'Email Campaigns', value: count, category: 'email', fetchedAt: now });
    })());
  }
}
```

---

## FIX 4: Fix "Global Reach Growth" hardcoded label in PerformanceTrajectorySection

**File:** `src/components/ai-chat/analyst-sections/PerformanceTrajectorySection.tsx` — line 43

Find:
```tsx
<p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1">Global Reach Growth</p>
```

Replace with:
```tsx
<p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 mb-1">
  {dataKeys[0]?.replace(/_/g, ' ').toUpperCase() || 'PERFORMANCE METRIC'}
</p>
```

**Frontend only.**

---

## FIX 5: Support multiple data keys in PerformanceTrajectorySection chart

**File:** `src/components/ai-chat/analyst-sections/PerformanceTrajectorySection.tsx` — line 69

Find:
```tsx
{dataKeys.slice(0, 1).map((key) => (
  <Area key={key} type="natural" dataKey={key} stroke="#06b6d4" strokeWidth={2} fill="url(#perfGradCyan)" dot={false} />
))}
```

Replace with:
```tsx
{dataKeys.slice(0, 3).map((key, idx) => {
  const colors = ['#06b6d4', '#a855f7', '#22c55e'];
  return (
    <Area key={key} type="natural" dataKey={key} stroke={colors[idx % colors.length]} strokeWidth={2}
      fill={idx === 0 ? 'url(#perfGradCyan)' : 'none'} dot={false} opacity={idx === 0 ? 1 : 0.6} />
  );
})}
```

Also fix the delta calculation to handle multiple keys:
```tsx
// Show delta for the primary key but mention others
const summaryKeys = dataKeys.slice(0, 3).map(key => {
  const first = chartData.length > 1 ? (chartData[0][key] || 0) : 0;
  const last = chartData.length > 1 ? (chartData[chartData.length - 1][key] || 0) : 0;
  return { key, delta: last - first, pct: first > 0 ? Math.round(((last - first) / first) * 100) : 0 };
});
```

**Frontend only.**

---

## FIX 6: Make NarrativePromptCard questions specific to actual data

**Problem:** Generic questions like "Want me to create a recovery plan?" don't reference specific numbers.

### Frontend

**File:** `src/components/ai-chat/analyst-sections/HealthAssessmentSection.tsx` — line 64-73

Replace:
```tsx
{health.total < 50 && (
  <NarrativePromptCard
    question="Your health score suggests significant gaps. Want me to create a recovery plan?"
```

With:
```tsx
{health.total < 50 && health.topCritical && (
  <NarrativePromptCard
    question={`Your health score is ${health.total}/100. The biggest issue: "${health.topCritical}". Should I focus on fixing this first?`}
    primaryLabel={`Fix: ${health.topCritical}`}
    primaryAction={`Create a step-by-step plan to fix "${health.topCritical}" and improve my health score from ${health.total}`}
```

**File:** `src/components/ai-chat/analyst-sections/StrategicDivergenceSection.tsx` — line 44-53

Replace:
```tsx
question="These anomalies may impact your strategy. Want me to prioritize fixes?"
```

With:
```tsx
question={`${anomalies.length} signal${anomalies.length > 1 ? 's' : ''} detected — "${anomalies[0].content.slice(0, 60)}..." Want me to triage?`}
primaryAction={`Analyze and prioritize fixes for: ${anomalies.slice(0, 3).map(a => a.content.slice(0, 40)).join('; ')}`}
```

**Frontend only.**

---

## FIX 7: Add NarrativePromptCards to sections that lack them

Sections 04-08 have no decision prompts. Each should have a contextual question when the data warrants it.

### Frontend

**KeywordLandscapeSection** — add after the data cards:
```tsx
{kwCount === 0 && (
  <NarrativePromptCard
    question="Without tracked keywords, your SEO strategy is blind. Want me to auto-detect keywords from your published content?"
    primaryLabel="Auto-Detect Keywords"
    primaryAction="Extract keywords from my published content and add them to tracking"
    secondaryLabel="I'll Add Manually"
    secondaryAction=""
    onSendMessage={onSendMessage}
  />
)}
```

**CampaignPulseSection** — when queue has failures:
```tsx
{queueFailed > 0 && (
  <NarrativePromptCard
    question={`${queueFailed} content item${queueFailed > 1 ? 's' : ''} failed to generate. Retry them?`}
    primaryLabel="Retry Failed Items"
    primaryAction="Retry all failed content generation items"
    secondaryLabel="Show Details"
    secondaryAction="Show me the failed content generation items and why they failed"
    onSendMessage={onSendMessage}
  />
)}
```

**CompetitivePositionSection** — when no competitors:
```tsx
{topics.filter(t => t.category === 'competitors').length === 0 && (
  <NarrativePromptCard
    question="You're not tracking any competitors. Want me to help identify and analyze your main rivals?"
    primaryLabel="Find Competitors"
    primaryAction="Help me identify my top 3 competitors and analyze their strategies"
    secondaryLabel="Skip"
    secondaryAction=""
    onSendMessage={onSendMessage}
  />
)}
```

**Frontend only** — data for conditions already exists in platformData/topics.

---

## FIX 8: Add null safety to WebIntelligenceSection

**File:** `src/components/ai-chat/analyst-sections/WebIntelligenceSection.tsx`

Find every `ws.results.map` and add null guard:

```tsx
{(ws.results || []).map((result, rIdx) => (
```

Also guard `ws.relatedSearches`:
```tsx
{(ws.relatedSearches || []).length > 0 && (
```

**Frontend only.**

---

## FIX 9: ExploreSection should include cross-signal insights as prompts

**File:** `src/components/ai-chat/analyst-sections/ExploreSection.tsx`

After the existing topic-based prompts (line 26-33), add:

```tsx
// Add prompts from cross-signal warnings
if (analystState) {
  const warnings = analystState.insightsFeed.filter(i => i.source === 'cross-signal' && i.type === 'warning').slice(0, 2);
  for (const warning of warnings) {
    if (!prompts.some(p => p.label.includes(warning.content.slice(0, 20)))) {
      prompts.push({
        label: `Investigate: ${warning.content.slice(0, 40)}...`,
        action: `Investigate this issue: ${warning.content}`
      });
    }
  }
}
```

**Frontend only.**

---

## FIX 10: Dismiss action for secondary buttons that do nothing

Several `NarrativePromptCard` instances have secondary buttons with empty `secondaryAction=""`. When clicked, these call `onSendMessage("")` which sends an empty message.

**File:** `src/components/ai-chat/analyst-sections/NarrativePromptCard.tsx`

Add a guard:

```tsx
{secondaryLabel && secondaryAction && secondaryAction.trim() !== '' && (
  <button
    onClick={() => onSendMessage(secondaryAction)}
    ...
  >
    {secondaryLabel}
  </button>
)}

{secondaryLabel && (!secondaryAction || secondaryAction.trim() === '') && (
  <button
    onClick={() => {/* dismiss - do nothing */}}
    className="w-full px-4 py-2.5 rounded-full text-xs font-medium border border-white/15 text-foreground/60 hover:text-foreground hover:border-white/25 transition-colors"
  >
    {secondaryLabel}
  </button>
)}
```

**Frontend only.**

---

## IMPLEMENTATION ORDER

### Sprint 1: Quick fixes (all frontend, no backend) — ~45 min

| # | Fix | Effort |
|---|-----|--------|
| 1 | Connect PreviousSessionSection | 2 min |
| 4 | Fix "Global Reach Growth" label | 2 min |
| 8 | Null safety on WebIntelligence | 5 min |
| 9 | Cross-signal prompts in Explore | 5 min |
| 10 | Dismiss for empty secondary actions | 5 min |
| 5 | Multi data key support in chart | 10 min |
| 6 | Data-specific narrative prompts | 15 min |

### Sprint 2: Data-driven headlines + narrative prompts — ~1 hour

| # | Fix | Effort |
|---|-----|--------|
| 3 | Dynamic headlines for 5 sections (Keyword, Campaign, Engagement, Competitive, Content) | 30 min (frontend) |
| 7 | Add NarrativePromptCards to sections 04-08 | 20 min (frontend) |

### Sprint 3: Richer data for Content section — ~30 min

| # | Fix | Effort |
|---|-----|--------|
| 2 | ContentIntelligence with article names, avg SEO, drafts, top performer | 15 min backend + 15 min frontend |

**Total: ~2.5 hours → every section becomes genuinely data-driven.**

---

## BEFORE / AFTER

| Section | Before | After |
|---------|--------|-------|
| Previous Session | Never shown | Shows when memory insights exist |
| Health Assessment | Data-driven ✓ | + Specific narrative prompt referencing actual top critical factor |
| Performance Trajectory | Chart works ✓ | + Dynamic label from data key, multi-series support |
| Strategic Divergence | Data-driven ✓ | + Specific narrative prompt citing actual anomalies |
| Content Intelligence | Static "active" | Dynamic headline, top article by name, draft count, avg SEO, publish rate |
| Keyword Landscape | Static "evolving" | Dynamic: "no keywords" / "emerging" / "{N} targets tracked" |
| Campaign Pulse | Static "in motion" | Dynamic: "idle" / "{N} failures" / "operational" |
| Engagement Metrics | Static "measurable" | Dynamic: "dormant" / "active" / "partially online" |
| Competitive Position | Static "shifting" | Dynamic: "blind spot" / "{N} signals detected" |
| Web Intelligence | Works ✓ | + Null safety for missing fields |
| Explore | Misses cross-signals | + Warning-based prompts from cross-signal insights |
| Goal Progress | Data-driven ✓ | No changes needed |
