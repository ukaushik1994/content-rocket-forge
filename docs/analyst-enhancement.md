# Analyst Enhancement Plan — From Mirror to Intelligence

> 6 enhancements that transform the Analyst from "shows you what you already saw" to "finds things you couldn't see yourself."

---

## ENHANCEMENT A: Workspace Health Score

**What:** A single 0-100 score at the top of the Analyst sidebar that answers "how is my content operation doing?" with expandable factors showing what's pulling the score up or down.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add new computation after anomaly detection

```ts
// ─── Health Score Computation ──────────────────────────────────────────────

interface HealthFactor {
  label: string;
  impact: number;
  status: 'good' | 'warning' | 'critical';
  suggestion?: string;
}

interface HealthScore {
  score: number;
  factors: HealthFactor[];
  trend: 'improving' | 'declining' | 'stable';
}

function computeHealthScore(
  platformData: PlatformDataPoint[],
  anomalies: InsightItem[],
  crossSignals: InsightItem[]
): HealthScore {
  let score = 100;
  const factors: HealthFactor[] = [];

  const get = (label: string) => platformData.find(d => d.label === label)?.value || 0;

  // 1. Publishing velocity (25 points)
  const published = get('Published');
  const total = get('Total Content');
  const publishRate = total > 0 ? published / total : 0;
  if (total === 0) {
    score -= 25;
    factors.push({ label: 'No content created', impact: -25, status: 'critical', suggestion: 'Start with "Write a blog post about..."' });
  } else if (publishRate < 0.2) {
    score -= 20;
    factors.push({ label: `Only ${Math.round(publishRate * 100)}% of content published`, impact: -20, status: 'critical', suggestion: 'Review drafts and publish or archive stale ones' });
  } else if (publishRate < 0.4) {
    score -= 10;
    factors.push({ label: `${Math.round(publishRate * 100)}% publish rate`, impact: -10, status: 'warning', suggestion: 'Aim for 50%+ to build audience consistently' });
  } else {
    factors.push({ label: `${Math.round(publishRate * 100)}% publish rate`, impact: 0, status: 'good' });
  }

  // 2. Content volume (20 points)
  if (total < 5) {
    score -= 15;
    factors.push({ label: `Only ${total} content items`, impact: -15, status: 'warning', suggestion: 'SEO authority starts building at 15-20+ articles' });
  } else if (total >= 20) {
    factors.push({ label: `${total} content items — solid library`, impact: 0, status: 'good' });
  }

  // 3. SEO quality (20 points)
  const avgSeo = get('Avg SEO Score');
  if (avgSeo > 0 && avgSeo < 30) {
    score -= 20;
    factors.push({ label: `Avg SEO: ${avgSeo}/100`, impact: -20, status: 'critical', suggestion: 'Use the Content Wizard for SERP-optimized content' });
  } else if (avgSeo >= 30 && avgSeo < 60) {
    score -= 10;
    factors.push({ label: `Avg SEO: ${avgSeo}/100`, impact: -10, status: 'warning', suggestion: 'Focus on keyword placement, headings, and FAQ sections' });
  } else if (avgSeo >= 60) {
    factors.push({ label: `Avg SEO: ${avgSeo}/100`, impact: 0, status: 'good' });
  }

  // 4. Anomaly penalties (15 points)
  const warningCount = anomalies.filter(a => a.type === 'warning').length;
  if (warningCount > 0) {
    const penalty = Math.min(warningCount * 5, 15);
    score -= penalty;
    factors.push({ label: `${warningCount} active warning(s)`, impact: -penalty, status: warningCount >= 3 ? 'critical' : 'warning' });
  }

  // 5. Strategic completeness (20 points)
  const competitors = get('Tracked Competitors');
  const proposals = get('Keyword Proposals');
  if (competitors === 0) {
    score -= 10;
    factors.push({ label: 'No competitors tracked', impact: -10, status: 'warning', suggestion: 'Add competitors for competitive intelligence' });
  }
  if (proposals === 0) {
    score -= 10;
    factors.push({ label: 'No content proposals', impact: -10, status: 'warning', suggestion: 'Generate AI proposals from your offerings' });
  }

  // Determine trend from cross-signal insights
  const improving = crossSignals.filter(s => s.type === 'opportunity').length;
  const declining = crossSignals.filter(s => s.type === 'warning').length;
  const trend = improving > declining ? 'improving' : declining > improving ? 'declining' : 'stable';

  return { score: Math.max(0, Math.min(100, score)), factors, trend };
}
```

Add to the hook's return:
```ts
// Inside useAnalystEngine, after all other computations:
const healthScore = useMemo(() => {
  if (!isActive) return null;
  return computeHealthScore(platformData, anomalyInsights, crossSignalInsights);
}, [isActive, platformData, anomalyInsights, crossSignalInsights]);
```

Add `healthScore` to the `AnalystState` interface and return object.

### Frontend

**File:** `src/components/ai-chat/VisualizationSidebar.tsx` — at the top of the Analyst content area (after the header, before Key Metrics)

```tsx
{/* Health Score Ring */}
{analystState?.healthScore && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex items-center gap-4 p-4 rounded-xl border border-border/20 bg-gradient-to-r from-muted/20 to-transparent"
  >
    {/* Circular Score */}
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-border/20" />
        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="4"
          strokeDasharray={`${(analystState.healthScore.score / 100) * 175.9} 175.9`}
          strokeLinecap="round"
          className={analystState.healthScore.score >= 70 ? 'text-green-500' : analystState.healthScore.score >= 40 ? 'text-amber-500' : 'text-red-500'}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">
        {analystState.healthScore.score}
      </span>
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">Workspace Health</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {analystState.healthScore.trend === 'improving' ? '📈 Improving' :
         analystState.healthScore.trend === 'declining' ? '📉 Declining' : '→ Stable'}
      </p>
      {/* Top critical factor */}
      {analystState.healthScore.factors.filter(f => f.status !== 'good')[0] && (
        <p className="text-[10px] text-amber-500 mt-1 truncate">
          {analystState.healthScore.factors.filter(f => f.status !== 'good')[0].label}
        </p>
      )}
    </div>
  </motion.div>
)}
```

Add an expandable section below the score ring that shows all factors with their suggestions.

---

## ENHANCEMENT B: Trend Sparklines

**What:** Every platform stat card shows a 4-week sparkline instead of a flat number. "Published: 5" becomes "Published: 5 ▁▂▃▅" showing the trend.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — extend `fetchPlatformData`

Add a `trendData` field to `PlatformDataPoint`:
```ts
export interface PlatformDataPoint {
  label: string;
  value: number;
  category: string;
  fetchedAt: Date;
  trendData?: number[]; // weekly values for sparkline [4w ago, 3w ago, 2w ago, this week]
}
```

Inside `fetchPlatformData`, after the existing content count query, add trend data:
```ts
if (coveredCategories.has('content') || coveredCategories.has('analytics')) {
  fetches.push((async () => {
    const fourWeeksAgo = new Date(Date.now() - 28 * 86400000).toISOString();
    const { data: recentItems } = await supabase
      .from('content_items')
      .select('created_at, status')
      .eq('user_id', userId)
      .gte('created_at', fourWeeksAgo);

    if (recentItems) {
      const createdByWeek = [0, 0, 0, 0];
      const publishedByWeek = [0, 0, 0, 0];
      for (const item of recentItems) {
        const weeksAgo = Math.floor((Date.now() - new Date(item.created_at).getTime()) / (7 * 86400000));
        if (weeksAgo < 4) {
          createdByWeek[3 - weeksAgo]++;
          if (item.status === 'published') publishedByWeek[3 - weeksAgo]++;
        }
      }
      newData.push({ label: 'Content Created (4w)', value: createdByWeek[3], category: 'trend', fetchedAt: now, trendData: createdByWeek });
      newData.push({ label: 'Published (4w)', value: publishedByWeek[3], category: 'trend', fetchedAt: now, trendData: publishedByWeek });
    }
  })());
}
```

### Frontend

**File:** `src/components/ai-chat/VisualizationSidebar.tsx` — in the Platform Stats grid

Add a mini sparkline component:
```tsx
const MiniSparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = 'text-primary' }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 48;
    const y = 16 - (v / max) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="48" height="16" className={`${color} opacity-60`}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
```

In the platform stat card rendering, add the sparkline:
```tsx
{analystState.platformData.map((dp, idx) => (
  <Card key={dp.label} className="p-3 bg-muted/10 border-border/20">
    <div className="flex items-center justify-between">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dp.label}</p>
      {dp.trendData && <MiniSparkline data={dp.trendData} />}
    </div>
    <p className="text-lg font-semibold text-foreground mt-0.5">{dp.value.toLocaleString()}</p>
  </Card>
))}
```

---

## ENHANCEMENT C: Cross-Signal Intelligence

**What:** Analyze patterns ACROSS data points that individual queries can't reveal. "SEO declining over last 3 articles", "50% of content is about one topic", "You publish every 5 days but it's been 14."

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add new analysis function after anomaly detection

```ts
// ─── Cross-Signal Intelligence ──────────────────────────────────────────

const [crossSignalInsights, setCrossSignalInsights] = useState<InsightItem[]>([]);

useEffect(() => {
  if (!isActive || !userId) return;

  const analyzeCrossSignals = async () => {
    const signals: InsightItem[] = [];
    const now = new Date();

    try {
      // Signal 1: SEO trend detection (last 5 articles)
      const { data: recentContent } = await supabase
        .from('content_items')
        .select('title, seo_score, created_at')
        .eq('user_id', userId)
        .not('seo_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentContent && recentContent.length >= 3) {
        const scores = recentContent.map(c => c.seo_score || 0);
        const isDecreasing = scores[0] < scores[1] && scores[1] < scores[2];
        const isIncreasing = scores[0] > scores[1] && scores[1] > scores[2];

        if (isDecreasing) {
          signals.push({
            id: `cross-seo-decline-${now.getTime()}`,
            content: `📉 SEO scores declining across your last 3 articles: ${scores.slice(0, 3).join(' → ')}. Check keyword targeting and content structure.`,
            type: 'warning', source: 'platform', timestamp: now
          });
        } else if (isIncreasing) {
          signals.push({
            id: `cross-seo-improve-${now.getTime()}`,
            content: `📈 SEO scores improving: last 3 articles scored ${scores.slice(0, 3).join(' → ')}. Your content quality is trending up.`,
            type: 'opportunity', source: 'platform', timestamp: now
          });
        }
      }

      // Signal 2: Topic concentration / diversity
      const { data: allContent } = await supabase
        .from('content_items')
        .select('main_keyword')
        .eq('user_id', userId)
        .neq('status', 'archived')
        .not('main_keyword', 'is', null);

      if (allContent && allContent.length >= 5) {
        const topicCounts: Record<string, number> = {};
        for (const c of allContent) {
          const topic = (c.main_keyword || '').split(/\s+/).slice(0, 2).join(' ').toLowerCase();
          if (topic && topic.length >= 3) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }

        const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length >= 2) {
          const topPct = Math.round(sorted[0][1] / allContent.length * 100);
          if (topPct >= 50) {
            signals.push({
              id: `cross-topic-concentration-${now.getTime()}`,
              content: `⚖️ ${topPct}% of your content covers "${sorted[0][0]}". Consider writing about ${sorted.slice(1, 3).map(s => `"${s[0]}"`).join(' or ')} for broader reach.`,
              type: 'opportunity', source: 'platform', timestamp: now
            });
          }
        }
      }

      // Signal 3: Publishing consistency gap
      const { data: publishedItems } = await supabase
        .from('content_items')
        .select('created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(10);

      if (publishedItems && publishedItems.length >= 3) {
        const gaps: number[] = [];
        for (let i = 1; i < publishedItems.length; i++) {
          const gap = (new Date(publishedItems[i - 1].created_at).getTime() - new Date(publishedItems[i].created_at).getTime()) / 86400000;
          gaps.push(gap);
        }
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const daysSinceLast = (Date.now() - new Date(publishedItems[0].created_at).getTime()) / 86400000;

        if (daysSinceLast > avgGap * 2 && avgGap > 0) {
          signals.push({
            id: `cross-publish-gap-${now.getTime()}`,
            content: `⏰ You usually publish every ${Math.round(avgGap)} days, but it's been ${Math.round(daysSinceLast)} days since your last publish. Consistency builds SEO authority.`,
            type: 'warning', source: 'platform', timestamp: now
          });
        } else if (daysSinceLast <= avgGap * 0.8 && publishedItems.length >= 5) {
          signals.push({
            id: `cross-publish-fast-${now.getTime()}`,
            content: `🔥 You're publishing faster than your usual ${Math.round(avgGap)}-day cadence. Great momentum — keep it up.`,
            type: 'opportunity', source: 'platform', timestamp: now
          });
        }
      }

      // Signal 4: Content-to-keyword ratio
      const { data: keywordCount } = await supabase
        .from('keywords')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (allContent && keywordCount?.count !== undefined) {
        const kwCount = keywordCount.count || 0;
        const contentCount = allContent.length;

        if (kwCount > 0 && contentCount > 0) {
          const ratio = contentCount / kwCount;
          if (ratio < 0.3) {
            signals.push({
              id: `cross-kw-underused-${now.getTime()}`,
              content: `🔑 You're tracking ${kwCount} keywords but only have ${contentCount} articles. ${kwCount - contentCount} keywords don't have content targeting them yet.`,
              type: 'opportunity', source: 'platform', timestamp: now
            });
          }
        } else if (kwCount === 0 && contentCount > 0) {
          signals.push({
            id: `cross-no-keywords-${now.getTime()}`,
            content: `🔍 ${contentCount} articles but 0 tracked keywords. Add keywords to monitor your search rankings and find content opportunities.`,
            type: 'warning', source: 'platform', timestamp: now
          });
        }
      }

      // Signal 5: Proposal utilization rate
      const { data: proposals } = await supabase
        .from('ai_strategy_proposals')
        .select('status')
        .eq('user_id', userId);

      if (proposals && proposals.length >= 5) {
        const available = proposals.filter(p => p.status === 'available').length;
        const total = proposals.length;
        const utilizationPct = Math.round((1 - available / total) * 100);

        if (utilizationPct < 20) {
          signals.push({
            id: `cross-proposals-unused-${now.getTime()}`,
            content: `💡 ${available} of ${total} AI proposals are still unused. These are content opportunities tailored to your offerings — accept some to build your calendar.`,
            type: 'opportunity', source: 'platform', timestamp: now
          });
        }
      }

    } catch (err) {
      console.warn('Cross-signal analysis failed:', err);
    }

    setCrossSignalInsights(signals);
  };

  analyzeCrossSignals();
}, [isActive, userId, platformData]);
```

Merge into the insights feed:
```ts
const enrichedInsightsFeed = useMemo(() => {
  return [...anomalyInsights, ...crossSignalInsights, ...insightsFeed];
}, [anomalyInsights, crossSignalInsights, insightsFeed]);
```

Add `crossSignalInsights` to the return and to `AnalystState` interface.

### Frontend

No special rendering needed — cross-signal insights flow into the existing `insightsFeed` with type-based styling (warning = red, opportunity = green, trend = blue). They'll appear at the top of the insights list because they're prepended.

---

## ENHANCEMENT D: Cross-Session Memory

**What:** When Analyst deactivates, save a summary of what it found. When reactivated (even in a new conversation), load the previous summary as initial context.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add save/load effects

Save on deactivation:
```ts
const prevActiveRef = useRef(false);

useEffect(() => {
  // Save analyst summary when deactivating
  if (prevActiveRef.current && !isActive && userId) {
    const importantInsights = [...anomalyInsights, ...crossSignalInsights]
      .filter(i => i.type === 'warning' || i.type === 'opportunity')
      .slice(0, 5)
      .map(i => i.content);

    if (importantInsights.length > 0) {
      localStorage.setItem('analyst_last_summary', JSON.stringify({
        insights: importantInsights,
        healthScore: healthScore?.score,
        savedAt: Date.now(),
        topics: topics.map(t => t.name).slice(0, 5)
      }));
    }
  }
  prevActiveRef.current = isActive;
}, [isActive, userId, anomalyInsights, crossSignalInsights, healthScore, topics]);
```

Load on activation:
```ts
const [previousSessionInsights, setPreviousSessionInsights] = useState<InsightItem[]>([]);

useEffect(() => {
  if (isActive && messages.length === 0) {
    try {
      const saved = localStorage.getItem('analyst_last_summary');
      if (saved) {
        const data = JSON.parse(saved);
        const ageHours = (Date.now() - data.savedAt) / 3600000;

        if (ageHours < 72 && data.insights?.length > 0) {
          const restored: InsightItem[] = data.insights.map((content: string, i: number) => ({
            id: `prev-session-${i}`,
            content: `📋 Previous session: ${content}`,
            type: 'trend' as const,
            source: 'platform' as const,
            timestamp: new Date(data.savedAt)
          }));
          setPreviousSessionInsights(restored);
        }
      }
    } catch (_) { /* non-blocking */ }
  }
}, [isActive, messages.length]);
```

Merge into feed:
```ts
const enrichedInsightsFeed = useMemo(() => {
  return [...previousSessionInsights, ...anomalyInsights, ...crossSignalInsights, ...insightsFeed];
}, [previousSessionInsights, anomalyInsights, crossSignalInsights, insightsFeed]);
```

### Frontend

No changes needed — previous session insights appear in the feed with a "📋 Previous session:" prefix, styled as trend items.

---

## ENHANCEMENT E: Goal Progress Tracking

**What:** The conversation has a detected `goal` (e.g., "Content Creation", "SEO Research"). Show a progress bar tracking how close the user is to completing that goal.

### Backend

**File:** `src/hooks/useAnalystEngine.ts` — add goal progress computation

```ts
interface GoalProgress {
  goal: string;
  progress: number; // 0-100
  status: string;
  nextStep: string;
}

function assessGoalProgress(goal: string | null, messages: EnhancedChatMessage[]): GoalProgress | null {
  if (!goal) return null;

  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  const allContent = assistantMsgs.map(m => m.content.toLowerCase()).join(' ');
  const hasCharts = assistantMsgs.some(m => m.visualData?.chartConfig);
  const hasActions = assistantMsgs.some(m => m.actions && m.actions.length > 0);

  switch (goal) {
    case 'Content Creation': {
      const created = allContent.includes('generated and saved') || allContent.includes('created "');
      const published = allContent.includes('published');
      if (published) return { goal, progress: 100, status: 'Published!', nextStep: 'Share on social or send as email' };
      if (created) return { goal, progress: 75, status: 'Content created', nextStep: 'Review and publish, or refine further' };
      if (allContent.includes('wizard') || allContent.includes('outline')) return { goal, progress: 40, status: 'Building content', nextStep: 'Complete the wizard steps' };
      return { goal, progress: 10, status: 'Getting started', nextStep: 'Tell me what topic to write about' };
    }
    case 'SEO Research': {
      const hasSerp = allContent.includes('serp analysis') || allContent.includes('keyword');
      const hasGaps = allContent.includes('content gap') || allContent.includes('cluster');
      if (hasSerp && hasGaps) return { goal, progress: 80, status: 'Deep research done', nextStep: 'Create content targeting your findings' };
      if (hasSerp) return { goal, progress: 50, status: 'SERP data collected', nextStep: 'Run content gap analysis' };
      return { goal, progress: 10, status: 'Starting research', nextStep: 'Ask to analyze a keyword' };
    }
    case 'Email Campaign': {
      const sent = allContent.includes('sending') || allContent.includes('sent');
      const created = allContent.includes('created email campaign');
      if (sent) return { goal, progress: 100, status: 'Campaign sent!', nextStep: 'Check open rates in a few hours' };
      if (created) return { goal, progress: 60, status: 'Campaign ready', nextStep: 'Review and send' };
      return { goal, progress: 10, status: 'Planning email', nextStep: 'Create an email campaign' };
    }
    case 'Performance Analysis': {
      if (hasCharts && assistantMsgs.length >= 3) return { goal, progress: 90, status: 'Analysis complete', nextStep: 'Act on the insights — optimize low-performing content' };
      if (hasCharts) return { goal, progress: 60, status: 'Analyzing data', nextStep: 'Ask for deeper comparisons or trends' };
      return { goal, progress: 10, status: 'Starting analysis', nextStep: 'Ask about content performance' };
    }
    case 'Competitive Analysis': {
      const hasCompetitors = allContent.includes('competitor');
      const hasSwot = allContent.includes('swot') || allContent.includes('strength') || allContent.includes('weakness');
      if (hasSwot) return { goal, progress: 85, status: 'SWOT complete', nextStep: 'Create content targeting competitor weaknesses' };
      if (hasCompetitors) return { goal, progress: 50, status: 'Competitors analyzed', nextStep: 'Run deeper SWOT analysis' };
      return { goal, progress: 10, status: 'Starting', nextStep: 'Ask about your competitors' };
    }
    case 'Strategy Planning': {
      const hasProposals = allContent.includes('proposal') || allContent.includes('strategy');
      const hasCalendar = allContent.includes('calendar') || allContent.includes('scheduled');
      if (hasCalendar) return { goal, progress: 90, status: 'Strategy scheduled', nextStep: 'Start generating content' };
      if (hasProposals) return { goal, progress: 50, status: 'Proposals reviewed', nextStep: 'Accept proposals and schedule them' };
      return { goal, progress: 10, status: 'Planning', nextStep: 'Generate AI strategy proposals' };
    }
    default:
      return { goal, progress: 0, status: 'Exploring', nextStep: 'Ask me anything' };
  }
}
```

Add to hook:
```ts
// Needs conversationGoal passed in as parameter or fetched from activeConversation
const goalProgress = useMemo(() => {
  if (!isActive) return null;
  return assessGoalProgress(conversationGoal, messages);
}, [isActive, messages, conversationGoal]);
```

Add `goalProgress` to `AnalystState` and return.

### Frontend

**File:** `src/components/ai-chat/VisualizationSidebar.tsx` — in the Analyst header, below topic tags

```tsx
{analystState?.goalProgress && (
  <div className="mt-3 p-3 rounded-lg border border-border/20 bg-muted/10">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {analystState.goalProgress.goal}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {analystState.goalProgress.progress}%
      </span>
    </div>
    <div className="h-1.5 rounded-full bg-border/20 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${analystState.goalProgress.progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
    <p className="text-[10px] text-muted-foreground mt-1.5">
      {analystState.goalProgress.status} — <span className="text-primary">{analystState.goalProgress.nextStep}</span>
    </p>
  </div>
)}
```

---

## ENHANCEMENT F: "Why This Matters" Context on Every Metric

**What:** Every platform stat and metric card gets a one-line explanation of what the number means and what to do about it.

### Backend

No changes needed — this is pure frontend rendering logic.

### Frontend

**File:** `src/components/ai-chat/VisualizationSidebar.tsx` — in the Platform Stats card rendering

```tsx
function getMetricContext(label: string, value: number, allData: PlatformDataPoint[]): string | null {
  const get = (l: string) => allData.find(d => d.label === l)?.value || 0;

  switch (label) {
    case 'Total Content':
      return value === 0 ? 'Create your first piece of content to get started'
        : value < 10 ? `${value} articles — momentum starts at 15+`
        : value < 30 ? `Growing library — consistent publishing builds authority`
        : `Strong content library`;
    case 'Published': {
      const total = get('Total Content');
      const rate = total > 0 ? Math.round(value / total * 100) : 0;
      return rate < 25 ? `Only ${rate}% published — drafts don't drive traffic`
        : rate < 50 ? `${rate}% published — move more drafts to published`
        : `${rate}% publish rate — excellent output`;
    }
    case 'Active Campaigns':
      return value === 0 ? 'Start a campaign to automate content production' : null;
    case 'Tracked Competitors':
      return value === 0 ? 'Add competitors to unlock SWOT and gap analysis'
        : value < 3 ? `Track 3+ competitors for meaningful benchmarks`
        : null;
    case 'Keyword Proposals':
      return value === 0 ? 'Generate proposals from your offerings for content ideas' : null;
    default:
      return null;
  }
}

// In the Card rendering:
{analystState.platformData.map((dp, idx) => {
  const context = getMetricContext(dp.label, dp.value, analystState.platformData);
  return (
    <Card key={dp.label} className="p-3 bg-muted/10 border-border/20">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{dp.label}</p>
      <p className="text-lg font-semibold text-foreground mt-0.5">{dp.value.toLocaleString()}</p>
      {context && <p className="text-[9px] text-muted-foreground/60 mt-1">{context}</p>}
    </Card>
  );
})}
```

---

## IMPLEMENTATION ORDER

| Sprint | Enhancement | Effort | What changes |
|--------|-----------|--------|-------------|
| 1 | **F: Metric context** | 30 min | Frontend only — `VisualizationSidebar.tsx` |
| 1 | **C: Cross-signal intelligence** | 1 hr | `useAnalystEngine.ts` — new analysis, merges into feed |
| 2 | **A: Health score** | 45 min | `useAnalystEngine.ts` + `VisualizationSidebar.tsx` |
| 2 | **B: Trend sparklines** | 45 min | `useAnalystEngine.ts` data fetch + sparkline component |
| 3 | **E: Goal progress** | 30 min | `useAnalystEngine.ts` + `VisualizationSidebar.tsx` |
| 3 | **D: Cross-session memory** | 30 min | `useAnalystEngine.ts` localStorage save/load |

**Total: ~4.5 hours → Analyst becomes the smartest thing in the product.**
