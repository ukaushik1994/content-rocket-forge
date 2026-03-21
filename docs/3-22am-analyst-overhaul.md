# Analyst Overhaul — 3:22am March 20

> 30 problems consolidated into 12 actionable fixes. Each fix addresses multiple problems.

---

## CONSOLIDATION: 30 Problems → 12 Fixes

| Fix | Problems it solves |
|-----|-------------------|
| 1. Cross-data pattern engine | #1 (mirrors chat), #6 (can't explain why), #13 (cannibalization), #27 (content↔contacts) |
| 2. Opinionated recommendations with stance | #4 (never says stop), #7 (binary choices), #14 (never kills content), #30 (no opinion) |
| 3. Benchmarks and goal tracking | #5 (no benchmark), #18 (pace vs goals), #10 (treats all users same) |
| 4. Predictive intelligence | #8 (reactive not predictive), #16 (no lifecycle stage), #26 (diminishing returns) |
| 5. Temporal and seasonal awareness | #12 (no competitor timing), #17 (no seasonal), #16 (content age) |
| 6. Content-to-business attribution | #11 (no revenue connection), #27 (content↔contacts), #28 (proposals not ranked) |
| 7. Accountability loop | #15 (no follow-up), #23 (stuck in loop detection) |
| 8. Contextual narrative depth | #9 (trends without meaning), #24 (no data vs bad data), #29 (same for all expertise) |
| 9. Adaptive section ordering | #22 (shows unused modules), #25 (doesn't learn what user reads) |
| 10. Positive reinforcement | #20 (never says good job) |
| 11. Urgency scoring | #19 (equal weight to all insights) |
| 12. Real traffic intelligence proxy | #21 (no traffic data without GA), #3 (just counts) |

---

## FIX 1: Cross-Data Pattern Engine

**Problems solved:** Mirrors chat (#1), can't explain why (#6), misses cannibalization (#13), doesn't connect content to contacts (#27)

**What it does:** Instead of showing data the AI already returned, the Analyst independently analyzes patterns ACROSS tables that no single query reveals.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — expand the cross-signal analysis (currently only checks 5 signals)

Add these new cross-data analyses after the existing `analyzeCrossSignals`:

```ts
// Signal: Keyword cannibalization detection
const { data: allContent } = await supabase
  .from('content_items')
  .select('id, title, main_keyword, status')
  .eq('user_id', userId)
  .neq('status', 'archived');

if (allContent && allContent.length >= 3) {
  const keywordMap: Record<string, string[]> = {};
  for (const c of allContent) {
    const kw = (c.main_keyword || '').toLowerCase().trim();
    if (kw.length > 2) {
      if (!keywordMap[kw]) keywordMap[kw] = [];
      keywordMap[kw].push(c.title);
    }
  }
  for (const [keyword, titles] of Object.entries(keywordMap)) {
    if (titles.length >= 2) {
      signals.push({
        id: `cross-cannibal-${keyword}-${now.getTime()}`,
        content: `🔄 Keyword cannibalization: ${titles.length} articles target "${keyword}" — "${titles[0]}" and "${titles[1]}"${titles.length > 2 ? ` (+${titles.length - 2} more)` : ''}. They compete against each other in search. Consider consolidating into one comprehensive piece.`,
        type: 'warning', source: 'cross-signal', timestamp: now
      });
    }
  }
}

// Signal: Content-to-contact correlation
try {
  const { data: ws } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
  if (ws?.workspace_id) {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const [recentContent, recentContacts] = await Promise.all([
      supabase.from('content_items').select('id').eq('user_id', userId).eq('status', 'published').gte('created_at', twoWeeksAgo),
      supabase.from('engage_contacts').select('id').eq('workspace_id', ws.workspace_id).gte('created_at', twoWeeksAgo)
    ]);
    const pubCount = recentContent.data?.length || 0;
    const contactCount = recentContacts.data?.length || 0;
    if (pubCount > 0 && contactCount > 0) {
      signals.push({
        id: `cross-content-contacts-${now.getTime()}`,
        content: `📈 In the last 2 weeks: ${pubCount} articles published → ${contactCount} new contact${contactCount > 1 ? 's' : ''} gained. Publishing is driving audience growth.`,
        type: 'opportunity', source: 'cross-signal', timestamp: now
      });
    } else if (pubCount > 0 && contactCount === 0) {
      signals.push({
        id: `cross-no-conversion-${now.getTime()}`,
        content: `⚠️ ${pubCount} articles published in 2 weeks but 0 new contacts. Content isn't converting — check CTAs, email capture, or landing pages.`,
        type: 'warning', source: 'cross-signal', timestamp: now
      });
    }
  }
} catch (_) {}

// Signal: WHY SEO is declining (heading/FAQ/keyword analysis)
if (recentContent && recentContent.length >= 3) {
  const scores = recentContent.map(c => c.seo_score || 0);
  const isDecreasing = scores[0] < scores[1] && scores[1] < scores[2];
  if (isDecreasing) {
    // Analyze what changed in recent articles
    const { data: recentArticles } = await supabase
      .from('content_items')
      .select('title, content, seo_score')
      .eq('user_id', userId)
      .not('seo_score', 'is', null)
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentArticles) {
      const issues: string[] = [];
      for (const a of recentArticles) {
        const content = a.content || '';
        if (!/(##.*FAQ|Frequently Asked)/i.test(content)) issues.push('missing FAQ section');
        if ((content.match(/<h2/gi) || []).length < 3) issues.push('too few headings');
        if (content.length < 2000) issues.push('too short');
      }
      const uniqueIssues = [...new Set(issues)];
      if (uniqueIssues.length > 0) {
        signals.push({
          id: `cross-seo-why-${now.getTime()}`,
          content: `🔍 WHY SEO is declining: your recent articles have ${uniqueIssues.join(', ')}. These structural issues reduce search ranking potential.`,
          type: 'warning', source: 'cross-signal', timestamp: now
        });
      }
    }
  }
}
```

### Frontend

No new components needed — these insights flow into the existing `insightsFeed` and appear in the Strategic Divergence section with existing rendering.

---

## FIX 2: Opinionated Recommendations

**Problems solved:** Never says stop (#4), binary choices (#7), never kills content (#14), no opinion (#30)

**What it does:** The Analyst takes a stance. Instead of "what do you want to do?" it says "here's what I think you should do and why."

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add a new computed property: `strategicRecommendation`

```ts
export interface StrategicRecommendation {
  stance: string;           // "Stop creating new content for 2 weeks"
  reasoning: string;        // "Because your 15 drafts need attention before adding more"
  actions: Array<{
    label: string;
    action: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
  }>;
  urgency: 'now' | 'this_week' | 'this_month';
}

// Compute strategic recommendation
const strategicRecommendation = useMemo<StrategicRecommendation | null>(() => {
  if (!isActive || !healthScore) return null;

  const published = platformData.find(d => d.label === 'Published')?.value || 0;
  const total = platformData.find(d => d.label === 'Total Content')?.value || 0;
  const drafts = platformData.find(d => d.label === 'Drafts')?.value || 0;
  const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
  const warnings = insightsFeed.filter(i => i.type === 'warning').length;

  // Rule 1: Way too many drafts vs published
  if (drafts > published * 3 && drafts > 5) {
    return {
      stance: `Stop creating. Publish or kill your ${drafts} drafts first.`,
      reasoning: `You have ${drafts} drafts and only ${published} published. New content won't help until you clear this backlog. Each unpublished draft is wasted effort.`,
      actions: [
        { label: 'Show my best drafts to publish', action: 'Show my top 5 drafts by SEO score — which should I publish right now?', effort: 'low', impact: 'high' },
        { label: 'Archive stale drafts', action: 'Archive all drafts not updated in 30+ days', effort: 'low', impact: 'medium' },
        { label: 'Batch publish top 3', action: 'Publish my 3 highest-SEO drafts right now', effort: 'low', impact: 'high' },
      ],
      urgency: 'now'
    };
  }

  // Rule 2: Published content has terrible SEO
  if (avgSeo > 0 && avgSeo < 35 && published >= 3) {
    return {
      stance: `Your published content isn't ranking. Fix quality before creating more.`,
      reasoning: `Average SEO score is ${avgSeo}/100 across ${published} articles. Publishing more low-quality content dilutes your domain authority. Optimize what you have.`,
      actions: [
        { label: 'Optimize worst article', action: 'Show my lowest-SEO published article and rewrite it with proper structure', effort: 'medium', impact: 'high' },
        { label: 'Add FAQ sections to all', action: 'Which of my published articles are missing FAQ sections? Add them.', effort: 'medium', impact: 'medium' },
        { label: 'Run keyword audit', action: 'Check if my published articles have their keywords in the first paragraph', effort: 'low', impact: 'medium' },
      ],
      urgency: 'this_week'
    };
  }

  // Rule 3: Everything is going well — push harder
  if (healthScore.total >= 70 && published >= 5 && avgSeo >= 50) {
    return {
      stance: `You're in a strong position. Now is the time to accelerate.`,
      reasoning: `Health score ${healthScore.total}/100, ${published} published articles averaging ${avgSeo} SEO. Your foundation is solid — scaling now has the highest ROI.`,
      actions: [
        { label: 'Generate content plan', action: 'Create a 2-week content plan targeting my unused high-potential proposals', effort: 'medium', impact: 'high' },
        { label: 'Repurpose best content', action: 'Repurpose my top 3 articles for social media and email', effort: 'low', impact: 'medium' },
        { label: 'Analyze competitors', action: 'What are my competitors publishing that I'm not covering?', effort: 'low', impact: 'high' },
      ],
      urgency: 'this_week'
    };
  }

  // Rule 4: Just getting started
  if (total < 5) {
    return {
      stance: `Focus on your first 5 articles. Nothing else matters yet.`,
      reasoning: `With only ${total} content item${total !== 1 ? 's' : ''}, SEO authority can't build. Search engines need volume to trust your domain. Get to 5 published articles before worrying about anything else.`,
      actions: [
        { label: 'Write your next article', action: 'Help me write a blog post about my top solution', effort: 'medium', impact: 'high' },
        { label: 'Use AI proposals', action: 'Show my top 3 AI proposals with the highest impression potential', effort: 'low', impact: 'high' },
      ],
      urgency: 'now'
    };
  }

  return null;
}, [isActive, healthScore, platformData, insightsFeed]);
```

Add `strategicRecommendation` to `AnalystState` interface and return.

### Frontend

**New file:** `src/components/ai-chat/analyst-sections/StrategicStanceSection.tsx`

```tsx
import React from 'react';
import { AnalystSectionWrapper } from './AnalystSectionWrapper';
import { StrategicRecommendation } from '@/hooks/useAnalystEngine';
import { Badge } from '@/components/ui/badge';

interface Props {
  recommendation: StrategicRecommendation;
  onSendMessage: (message: string) => void;
}

export const StrategicStanceSection: React.FC<Props> = ({ recommendation, onSendMessage }) => {
  const urgencyColor = recommendation.urgency === 'now' ? 'text-rose-300' : recommendation.urgency === 'this_week' ? 'text-amber-300' : 'text-emerald-400/80';

  return (
    <AnalystSectionWrapper
      number="00"
      label="Strategic Stance"
      headline={<>{recommendation.stance.split(/(\b(?:Stop|Fix|Focus|accelerate|Push)\b)/i).map((part, i) =>
        /^(Stop|Fix|Focus|accelerate|Push)$/i.test(part)
          ? <span key={i} className={urgencyColor}>{part}</span>
          : part
      )}</>}
      delay={0.02}
    >
      <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{recommendation.reasoning}</p>

      <div className="space-y-2">
        {recommendation.actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(action.action)}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-left"
          >
            <div>
              <p className="text-xs font-medium text-foreground">{action.label}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-border/20 text-muted-foreground/40">
                  {action.effort} effort
                </Badge>
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 border-border/20 text-muted-foreground/40">
                  {action.impact} impact
                </Badge>
              </div>
            </div>
            <span className="text-muted-foreground/30">→</span>
          </button>
        ))}
      </div>
    </AnalystSectionWrapper>
  );
};
```

Add to `AnalystNarrativeTimeline.tsx` as the FIRST section (before Health Assessment):
```tsx
{analystState?.strategicRecommendation && (
  <StrategicStanceSection recommendation={analystState.strategicRecommendation} onSendMessage={onSendMessage} />
)}
```

---

## FIX 3: Benchmarks and Goal Tracking

**Problems solved:** No benchmark (#5), pace vs goals (#18), treats all users same (#10)

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — enhance health score computation

Add user-stage detection and benchmarks:

```ts
// Determine user stage
type UserStage = 'starter' | 'growing' | 'established' | 'scaling';
const getUserStage = (total: number, published: number): UserStage => {
  if (total < 5) return 'starter';
  if (published < 10) return 'growing';
  if (published < 30) return 'established';
  return 'scaling';
};

// Stage-aware benchmarks
const BENCHMARKS: Record<UserStage, { publishRate: number; avgSeo: number; weeklyArticles: number }> = {
  starter: { publishRate: 50, avgSeo: 30, weeklyArticles: 1 },
  growing: { publishRate: 40, avgSeo: 45, weeklyArticles: 1.5 },
  established: { publishRate: 50, avgSeo: 55, weeklyArticles: 2 },
  scaling: { publishRate: 60, avgSeo: 65, weeklyArticles: 3 },
};
```

Inject stage and benchmarks into the health score factors:
```ts
const stage = getUserStage(total, published);
const benchmark = BENCHMARKS[stage];

// Replace raw scoring with benchmark-relative scoring
if (publishRate < benchmark.publishRate) {
  factors.push({
    name: 'Publish rate',
    score: Math.round((publishRate / benchmark.publishRate) * 25),
    maxScore: 25,
    status: publishRate < benchmark.publishRate * 0.5 ? 'critical' : 'warning',
    detail: `${publishRate}% vs ${benchmark.publishRate}% benchmark for ${stage} stage`
  });
}
```

Add `userStage` and `benchmarks` to `AnalystState`.

### Frontend

In `HealthAssessmentSection.tsx`, show the benchmark comparison:
```tsx
<p className="text-[9px] text-muted-foreground/40">
  Stage: {analystState.userStage} · Benchmark: {analystState.benchmarks.avgSeo} SEO, {analystState.benchmarks.weeklyArticles} articles/week
</p>
```

---

## FIX 4: Predictive Intelligence

**Problems solved:** Reactive not predictive (#8), no lifecycle stage (#16), diminishing returns (#26)

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add predictions to cross-signal analysis

```ts
// Prediction: Draft depletion forecast
if (drafts > 0 && published > 0) {
  const { data: recentPublished } = await supabase
    .from('content_items')
    .select('created_at')
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentPublished && recentPublished.length >= 2) {
    const gaps = [];
    for (let i = 1; i < recentPublished.length; i++) {
      gaps.push((new Date(recentPublished[i-1].created_at).getTime() - new Date(recentPublished[i].created_at).getTime()) / 86400000);
    }
    const avgPublishDays = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const daysUntilDepleted = drafts * avgPublishDays;

    if (daysUntilDepleted < 14) {
      signals.push({
        id: `predict-draft-depletion-${now.getTime()}`,
        content: `⏳ At your current pace (1 article every ${Math.round(avgPublishDays)} days), you'll run out of drafts in ~${Math.round(daysUntilDepleted)} days. Start creating now to avoid a content gap.`,
        type: 'warning', source: 'cross-signal', timestamp: now
      });
    }
  }
}

// Prediction: Topic saturation
if (allContent && allContent.length >= 5) {
  const topicCounts: Record<string, number> = {};
  for (const c of allContent) {
    const topic = (c.main_keyword || '').split(/\s+/).slice(0, 2).join(' ').toLowerCase();
    if (topic.length >= 3) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }
  for (const [topic, count] of Object.entries(topicCounts)) {
    if (count >= 4) {
      signals.push({
        id: `predict-saturation-${topic}-${now.getTime()}`,
        content: `📊 Diminishing returns: you have ${count} articles about "${topic}". Each new article on this topic will compete with your own content. Diversify to a new topic for better ROI.`,
        type: 'opportunity', source: 'cross-signal', timestamp: now
      });
    }
  }
}
```

### Frontend

No new components — predictions appear as insights in the Strategic Divergence section.

---

## FIX 5: Temporal and Seasonal Awareness

**Problems solved:** No competitor timing (#12), no seasonal (#17), content age (#16)

### Backend

**File:** `src/hooks/useAnalystEngine.ts`

```ts
// Seasonal awareness
const month = new Date().getMonth();
const seasonalTopics: Record<number, string[]> = {
  0: ['new year', 'planning', 'goals', 'predictions', 'trends'],
  1: ['valentine', 'love', 'relationships'],
  2: ['spring', 'march madness', 'quarter review'],
  3: ['tax', 'spring cleaning', 'earth day'],
  4: ['mothers day', 'memorial day'],
  5: ['summer', 'fathers day', 'mid-year review'],
  6: ['independence day', 'back to school prep'],
  7: ['back to school', 'summer wrap'],
  8: ['fall', 'labor day', 'quarter review'],
  9: ['halloween', 'planning season', 'q4 push'],
  10: ['black friday', 'cyber monday', 'holiday', 'thanksgiving', 'giving'],
  11: ['christmas', 'holiday', 'year in review', 'predictions', 'new year prep'],
};

const seasonalNow = seasonalTopics[month] || [];
const hasSeasonalContent = allContent?.some(c =>
  seasonalNow.some(topic => (c.main_keyword || '').toLowerCase().includes(topic))
);

if (seasonalNow.length > 0 && !hasSeasonalContent && (allContent?.length || 0) >= 5) {
  signals.push({
    id: `seasonal-gap-${now.getTime()}`,
    content: `📅 Seasonal opportunity: it's ${new Date().toLocaleString('default', { month: 'long' })}. Topics trending now: ${seasonalNow.slice(0, 3).join(', ')}. Your competitors may already be publishing seasonal content.`,
    type: 'opportunity', source: 'cross-signal', timestamp: now
  });
}

// Content age alerting
const { data: oldPublished } = await supabase
  .from('content_items')
  .select('title, created_at, main_keyword')
  .eq('user_id', userId)
  .eq('status', 'published')
  .lt('created_at', new Date(Date.now() - 180 * 86400000).toISOString())
  .order('created_at', { ascending: true })
  .limit(3);

if (oldPublished && oldPublished.length > 0) {
  const ageMonths = Math.round((Date.now() - new Date(oldPublished[0].created_at).getTime()) / (30 * 86400000));
  signals.push({
    id: `content-aging-${now.getTime()}`,
    content: `🕰️ "${oldPublished[0].title}" is ${ageMonths} months old. Search engines prefer fresh content — consider updating it with current data and examples.`,
    type: 'opportunity', source: 'cross-signal', timestamp: now
  });
}
```

### Frontend

No new components — flows into existing insights feed.

---

## FIX 6: Content-to-Business Attribution

**Problems solved:** No revenue connection (#11), content↔contacts (#27), proposals not ranked (#28)

### Backend

**File:** `src/hooks/useAnalystEngine.ts`

```ts
// Pareto analysis on proposals
const { data: proposals } = await supabase
  .from('ai_strategy_proposals')
  .select('title, primary_keyword, estimated_impressions, status')
  .eq('user_id', userId)
  .eq('status', 'available')
  .order('estimated_impressions', { ascending: false })
  .limit(20);

if (proposals && proposals.length >= 5) {
  const topThree = proposals.slice(0, 3);
  const topThreeImpressions = topThree.reduce((s, p) => s + (p.estimated_impressions || 0), 0);
  const totalImpressions = proposals.reduce((s, p) => s + (p.estimated_impressions || 0), 0);
  const pct = totalImpressions > 0 ? Math.round((topThreeImpressions / totalImpressions) * 100) : 0;

  if (pct >= 50) {
    signals.push({
      id: `pareto-proposals-${now.getTime()}`,
      content: `🎯 Pareto insight: your top 3 proposals capture ${pct}% of total impression potential. Focus on: "${topThree[0].title}", "${topThree[1].title}", "${topThree[2].title}". Ignore the rest for now.`,
      type: 'opportunity', source: 'cross-signal', timestamp: now
    });
  }
}

// Solution-content coverage
const { data: solutions } = await supabase
  .from('solutions')
  .select('name')
  .eq('user_id', userId);

if (solutions && allContent && solutions.length > 0) {
  for (const sol of solutions) {
    const contentForSol = allContent.filter(c =>
      (c.main_keyword || '').toLowerCase().includes(sol.name.toLowerCase().split(' ')[0])
    );
    if (contentForSol.length === 0) {
      signals.push({
        id: `sol-gap-${sol.name}-${now.getTime()}`,
        content: `💼 Business gap: your offering "${sol.name}" has 0 articles targeting it. Content about your products drives revenue — create at least one.`,
        type: 'warning', source: 'cross-signal', timestamp: now
      });
    }
  }
}
```

### Frontend

No new components.

---

## FIX 7: Accountability Loop

**Problems solved:** No follow-up (#15), stuck in loop (#23)

### Backend

**File:** `src/hooks/useAnalystEngine.ts`

```ts
// Track action patterns in messages
const userQueries = messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase());
const assistantActions = messages.filter(m => m.role === 'assistant' && m.actions?.length);

// Detect repeated queries without action
const querySet = new Map<string, number>();
for (const q of userQueries) {
  const simplified = q.replace(/[^a-z\s]/g, '').trim().split(/\s+/).slice(0, 4).join(' ');
  querySet.set(simplified, (querySet.get(simplified) || 0) + 1);
}

for (const [query, count] of querySet.entries()) {
  if (count >= 3) {
    signals.push({
      id: `loop-detected-${query.slice(0, 20)}-${now.getTime()}`,
      content: `🔄 You've asked about "${query}" ${count} times this session without taking action. Ready to act on it? I can help you execute, not just explore.`,
      type: 'trend', source: 'cross-signal', timestamp: now
    });
    break; // Only one loop alert per session
  }
}
```

### Frontend

No new components.

---

## FIX 8: Contextual Narrative Depth

**Problems solved:** Trends without meaning (#9), no data vs bad data (#24), same for all expertise (#29)

### Backend

Already partially addressed by `getMetricContext()` in the engine. Enhance it:

**File:** `src/hooks/useAnalystEngine.ts` — expand `getMetricContext`

```ts
export function getMetricContext(label: string, value: number, allData: PlatformDataPoint[], userStage: UserStage): string {
  const benchmark = BENCHMARKS[userStage];
  const get = (l: string) => allData.find(d => d.label === l)?.value || 0;

  switch (label) {
    case 'Total Content':
      if (userStage === 'starter') return `${value} articles — aim for 5 to build foundation`;
      if (userStage === 'growing') return `${value} articles — growing library, ${benchmark.weeklyArticles}/week target`;
      return `${value} articles — established library`;
    case 'Published': {
      const total = get('Total Content');
      const rate = total > 0 ? Math.round(value / total * 100) : 0;
      return `${rate}% published (${userStage} benchmark: ${benchmark.publishRate}%)`;
    }
    case 'Avg SEO Score':
      return `${value}/100 (${userStage} benchmark: ${benchmark.avgSeo})${value < benchmark.avgSeo ? ' — below target' : ' — on track'}`;
    default:
      return '';
  }
}
```

### Frontend

Update calls to `getMetricContext` to pass `userStage`.

---

## FIX 9: Adaptive Section Ordering

**Problems solved:** Shows unused modules (#22), doesn't learn what user reads (#25)

### Frontend

**File:** `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`

Track which sections the user interacts with (clicks inside) and reorder:

```tsx
// Track section interactions in localStorage
const getSectionPriority = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('analyst_section_priority') || '[]');
  } catch { return []; }
};

const recordSectionInteraction = (sectionId: string) => {
  const priority = getSectionPriority();
  const idx = priority.indexOf(sectionId);
  if (idx > -1) priority.splice(idx, 1);
  priority.unshift(sectionId);
  localStorage.setItem('analyst_section_priority', JSON.stringify(priority.slice(0, 12)));
};
```

Before rendering sections, sort by priority:
```tsx
const sectionOrder = getSectionPriority();
// Sections the user hasn't interacted with go to the end
// Sections with no data are hidden entirely (already done)
```

### Backend

No changes.

---

## FIX 10: Positive Reinforcement

**Problems solved:** Never says good job (#20)

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add win detection to cross-signals

```ts
// Detect wins
if (published >= 3) {
  const thisWeek = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: weekPublished } = await supabase
    .from('content_items')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'published')
    .gte('created_at', thisWeek);

  if (weekPublished && weekPublished.length >= 2) {
    signals.push({
      id: `win-publishing-${now.getTime()}`,
      content: `🎉 ${weekPublished.length} articles published this week! That's strong momentum — keep it going.`,
      type: 'opportunity', source: 'cross-signal', timestamp: now
    });
  }
}

// SEO improvement celebration
if (recentContent && recentContent.length >= 3) {
  const scores = recentContent.map(c => c.seo_score || 0);
  if (scores[0] > scores[2] && scores[0] >= 60) {
    signals.push({
      id: `win-seo-${now.getTime()}`,
      content: `📈 Your SEO quality is improving — latest article scored ${scores[0]}/100, up from ${scores[2]}/100 three articles ago. The optimizations are working.`,
      type: 'opportunity', source: 'cross-signal', timestamp: now
    });
  }
}
```

### Frontend

No new components — celebrations appear as green `opportunity` insights in the feed.

---

## FIX 11: Urgency Scoring

**Problems solved:** Equal weight to all insights (#19)

### Backend

**File:** `src/hooks/useAnalystEngine.ts`

Add urgency to `InsightItem`:
```ts
export interface InsightItem {
  ...existing,
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}
```

When creating insights, assign urgency:
```ts
// SEO declining → critical
// Empty calendar → high
// Stale drafts → medium
// Topic concentration → low
// Publishing streak → low (positive)
```

Sort `insightsFeed` by urgency:
```ts
const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
feed.sort((a, b) => (urgencyOrder[a.urgency || 'low'] || 3) - (urgencyOrder[b.urgency || 'low'] || 3));
```

### Frontend

In `AnalystInsightCard`, show urgency indicator:
```tsx
{insight.urgency === 'critical' && <span className="text-[8px] text-rose-400 uppercase tracking-wider">Urgent</span>}
```

---

## FIX 12: Real Traffic Intelligence Proxy

**Problems solved:** No traffic data (#21), just counts (#3)

### Backend

**File:** `src/hooks/useAnalystEngine.ts`

Use content signals (repurposes, email conversions, social shares) as a traffic proxy:

```ts
// Count actions per content item as engagement proxy
const { data: signals } = await supabase
  .from('content_performance_signals')
  .select('content_id, signal_type')
  .eq('user_id', userId);

if (signals && signals.length > 0) {
  const contentEngagement: Record<string, number> = {};
  for (const s of signals) {
    contentEngagement[s.content_id] = (contentEngagement[s.content_id] || 0) + 1;
  }

  const topEngaged = Object.entries(contentEngagement)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (topEngaged.length > 0) {
    const { data: topContent } = await supabase
      .from('content_items')
      .select('title')
      .in('id', topEngaged.map(([id]) => id));

    if (topContent) {
      newData.push({
        label: `Most engaged: "${topContent[0]?.title}"`,
        value: topEngaged[0][1],
        category: 'content_detail',
        fetchedAt: now
      });
    }
  }
}
```

### Frontend

Render engagement proxy in ContentIntelligenceSection alongside SEO scores.

---

## IMPLEMENTATION ORDER

| Sprint | Fixes | Backend | Frontend | Effort |
|--------|-------|:-------:|:--------:|--------|
| 1 | Fix 2 (Opinionated stance) + Fix 10 (Positive reinforcement) + Fix 11 (Urgency scoring) | Engine logic | New StrategicStanceSection + urgency badges | 2 hrs |
| 2 | Fix 1 (Cross-data patterns) + Fix 4 (Predictions) + Fix 5 (Temporal/seasonal) | Engine cross-signal expansion | No new components needed | 2 hrs |
| 3 | Fix 3 (Benchmarks) + Fix 6 (Business attribution) + Fix 8 (Narrative depth) | Engine stage detection + Pareto + getMetricContext | Update metric rendering | 1.5 hrs |
| 4 | Fix 7 (Accountability) + Fix 9 (Adaptive ordering) + Fix 12 (Traffic proxy) | Loop detection + signal counting | Section reordering | 1.5 hrs |

**Total: ~7 hours → Analyst goes from "dashboard with labels" to "opinionated strategist with predictions, benchmarks, and accountability."**
