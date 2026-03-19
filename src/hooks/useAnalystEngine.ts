import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { EnhancedChatMessage, MetricCard, ChartConfiguration, ActionableItem, AnalystWebSearchData } from '@/types/enhancedChat';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InsightItem {
  id: string;
  content: string;
  type: 'trend' | 'warning' | 'opportunity' | 'stat' | 'search';
  source: 'ai' | 'platform' | 'web';
  timestamp: Date;
  messageId?: string;
}

export interface AnalystTopic {
  name: string;
  firstMentioned: Date;
  mentionCount: number;
  category: 'content' | 'campaigns' | 'keywords' | 'competitors' | 'email' | 'social' | 'analytics' | 'general';
}

export interface PlatformDataPoint {
  label: string;
  value: number;
  category: string;
  fetchedAt: Date;
}

export interface AnalystState {
  topics: AnalystTopic[];
  insightsFeed: InsightItem[];
  cumulativeMetrics: MetricCard[];
  suggestedActions: ActionableItem[];
  accumulatedCharts: ChartConfiguration[];
  platformData: PlatformDataPoint[];
  webSearchResults: AnalystWebSearchData[];
  lastUpdated: Date | null;
  isEnriching: boolean;
  messageCount: number;
}

// ─── Topic Detection ────────────────────────────────────────────────────────

const TOPIC_PATTERNS: Record<string, { regex: RegExp; category: AnalystTopic['category'] }> = {
  'Content': { regex: /\b(content|article|blog|post|writing|publish|draft|seo score)\b/i, category: 'content' },
  'Campaigns': { regex: /\b(campaign|generation|queue|progress|launch)\b/i, category: 'campaigns' },
  'Keywords': { regex: /\b(keyword|seo|search|rank|serp|organic|ranking)\b/i, category: 'keywords' },
  'Competitors': { regex: /\b(competitor|competition|rival|swot|versus|market)\b/i, category: 'competitors' },
  'Email': { regex: /\b(email|newsletter|subscriber|open rate|click rate|campaign email)\b/i, category: 'email' },
  'Social': { regex: /\b(social|instagram|twitter|linkedin|facebook|tiktok|post|hashtag)\b/i, category: 'social' },
  'Analytics': { regex: /\b(analytics|metrics|views|clicks|conversion|traffic|engagement|performance)\b/i, category: 'analytics' },
};

function extractTopics(text: string): Array<{ name: string; category: AnalystTopic['category'] }> {
  const found: Array<{ name: string; category: AnalystTopic['category'] }> = [];
  for (const [name, { regex, category }] of Object.entries(TOPIC_PATTERNS)) {
    if (regex.test(text)) {
      found.push({ name, category });
    }
  }
  return found;
}

function classifyInsight(content: string): InsightItem['type'] {
  const lower = content.toLowerCase();
  if (/failed|error|risk|warning|down|decrease|declining|dropped|critical/.test(lower)) return 'warning';
  if (/opportunity|potential|improve|boost|increase|growth|rising|trending up/.test(lower)) return 'opportunity';
  if (/\d+\s*(articles?|posts?|items?|contacts?|campaigns?)/.test(lower)) return 'stat';
  return 'trend';
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAnalystEngine(
  messages: EnhancedChatMessage[],
  userId: string | null,
  isActive: boolean
): AnalystState {
  const [platformData, setPlatformData] = useState<PlatformDataPoint[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const lastFetchedTopicsRef = useRef<string>('');
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // ─── Cumulative topic extraction ────────────────────────────────────────
  const topics = useMemo(() => {
    if (!isActive) return [];
    const topicMap = new Map<string, AnalystTopic>();

    for (const msg of messages) {
      const detected = extractTopics(msg.content);
      for (const { name, category } of detected) {
        const existing = topicMap.get(name);
        if (existing) {
          existing.mentionCount += 1;
        } else {
          topicMap.set(name, {
            name,
            firstMentioned: msg.timestamp,
            mentionCount: 1,
            category,
          });
        }
      }
    }
    return Array.from(topicMap.values()).sort((a, b) => b.mentionCount - a.mentionCount);
  }, [messages, isActive]);

  // ─── Cumulative insights feed ───────────────────────────────────────────
  const insightsFeed = useMemo(() => {
    if (!isActive) return [];
    const feed: InsightItem[] = [];

    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;

      // Extract from visualData insights
      if (msg.visualData?.insights) {
        const insights: any[] = Array.isArray(msg.visualData.insights) ? msg.visualData.insights : [];
        for (const insight of insights) {
          const content = typeof insight === 'string' ? insight : insight?.content || '';
          if (!content) continue;
          feed.push({
            id: `insight-${msg.id}-${feed.length}`,
            content,
            type: classifyInsight(content),
            source: 'ai',
            timestamp: msg.timestamp,
            messageId: msg.id,
          });
        }
      }

      // Extract from actionableItems
      if (msg.visualData?.actionableItems) {
        for (const item of msg.visualData.actionableItems) {
          feed.push({
            id: `action-${msg.id}-${item.id}`,
            content: `${item.title}: ${item.description}`,
            type: item.priority === 'high' ? 'warning' : 'opportunity',
            source: 'ai',
            timestamp: msg.timestamp,
            messageId: msg.id,
          });
        }
      }

      // Extract from summaryInsights
      if (msg.visualData?.summaryInsights?.bulletPoints) {
        for (const point of msg.visualData.summaryInsights.bulletPoints) {
          feed.push({
            id: `bullet-${msg.id}-${feed.length}`,
            content: point,
            type: classifyInsight(point),
            source: 'ai',
            timestamp: msg.timestamp,
            messageId: msg.id,
          });
        }
      }

      // Extract from analystContext (backend enrichment)
      if (msg.analystContext?.insights) {
        for (const insight of msg.analystContext.insights) {
          feed.push({
            id: `platform-${msg.id}-${feed.length}`,
            content: typeof insight === 'string' ? insight : insight.content,
            type: classifyInsight(typeof insight === 'string' ? insight : insight.content),
            source: 'platform',
            timestamp: msg.timestamp,
            messageId: msg.id,
          });
        }
      }

      // Extract web search results as search-type insights
      if (msg.analystContext?.webSearchResults) {
        const ws = msg.analystContext.webSearchResults;
        // Add query-level insight
        feed.push({
          id: `ws-query-${msg.id}`,
          content: `Web search: "${ws.query}" — ${ws.results.length} results found`,
          type: 'search',
          source: 'web',
          timestamp: msg.timestamp,
          messageId: msg.id,
        });
        // Add top 3 results as individual insights
        for (const result of ws.results.slice(0, 3)) {
          feed.push({
            id: `ws-${msg.id}-${feed.length}`,
            content: `${result.title}: ${result.snippet}`,
            type: 'search',
            source: 'web',
            timestamp: msg.timestamp,
            messageId: msg.id,
          });
        }
      }
    }

    // Add platform data as insights
    for (const dp of platformData) {
      feed.push({
        id: `pd-${dp.category}-${dp.label}`,
        content: `${dp.label}: ${dp.value.toLocaleString()}`,
        type: 'stat',
        source: 'platform',
        timestamp: dp.fetchedAt,
      });
    }

    return feed;
  }, [messages, isActive, platformData]);

  // ─── Cumulative metrics ─────────────────────────────────────────────────
  const cumulativeMetrics = useMemo(() => {
    if (!isActive) return [];
    const metricsMap = new Map<string, MetricCard>();

    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;

      // From visualData metricCards
      const cards: any[] = msg.visualData?.summaryInsights?.metricCards || msg.visualData?.metrics || [];
      for (const card of cards) {
        const key = card.title || card.id || card.label;
        if (key) {
          metricsMap.set(key, {
            id: card.id || key,
            title: card.title || card.label || key,
            value: card.value,
            change: card.change,
            icon: card.icon,
            color: card.color,
          });
        }
      }

      // From analystContext metrics
      if (msg.analystContext?.metrics) {
        for (const m of msg.analystContext.metrics) {
          metricsMap.set(m.title, m);
        }
      }
    }

    return Array.from(metricsMap.values()).slice(0, 8);
  }, [messages, isActive]);

  // ─── Accumulated charts ─────────────────────────────────────────────────
  const accumulatedCharts = useMemo(() => {
    if (!isActive) return [];
    const charts: ChartConfiguration[] = [];

    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;

      if (msg.visualData?.chartConfig) {
        charts.push(msg.visualData.chartConfig);
      }
      if (msg.visualData?.charts) {
        charts.push(...msg.visualData.charts);
      }
    }

    // Keep last 6 charts to avoid UI overload
    return charts.slice(-6);
  }, [messages, isActive]);

  // ─── Suggested actions ──────────────────────────────────────────────────
  const suggestedActions = useMemo(() => {
    if (!isActive || topics.length === 0) return [];
    
    const coveredCategories = new Set(topics.map(t => t.category));
    const suggestions: ActionableItem[] = [];

    if (!coveredCategories.has('content')) {
      suggestions.push({
        id: 'suggest-content',
        title: 'Explore Content',
        description: 'Ask about content performance and pipeline status',
        priority: 'medium',
        action: 'Show content performance overview',
      });
    }
    if (!coveredCategories.has('competitors')) {
      suggestions.push({
        id: 'suggest-competitors',
        title: 'Competitor Analysis',
        description: 'How do your competitors compare?',
        priority: 'medium',
        action: 'Compare my competitors',
      });
    }
    if (!coveredCategories.has('campaigns')) {
      suggestions.push({
        id: 'suggest-campaigns',
        title: 'Campaign Health',
        description: 'Check active campaign performance',
        priority: 'medium',
        action: 'Show campaign health overview',
      });
    }
    if (!coveredCategories.has('keywords')) {
      suggestions.push({
        id: 'suggest-keywords',
        title: 'Keyword Rankings',
        description: 'Explore keyword performance and opportunities',
        priority: 'medium',
        action: 'Analyze my keyword rankings',
      });
    }
    if (!coveredCategories.has('email')) {
      suggestions.push({
        id: 'suggest-email',
        title: 'Email Intelligence',
        description: 'Review email campaign performance',
        priority: 'low',
        action: 'Show email campaign analytics',
      });
    }

    return suggestions.slice(0, 3);
  }, [topics, isActive]);

  // ─── Platform data enrichment ───────────────────────────────────────────
  const fetchPlatformData = useCallback(async (forceAllCategories = false) => {
    if (!userId || !isActive) return;
    if (!forceAllCategories && topics.length === 0) return;

    const topicKey = forceAllCategories ? '__ALL__' : topics.map(t => t.name).join(',');
    if (topicKey === lastFetchedTopicsRef.current) return;
    lastFetchedTopicsRef.current = topicKey;

    setIsEnriching(true);
    const newData: PlatformDataPoint[] = [];
    const now = new Date();

    try {
      const coveredCategories = forceAllCategories 
        ? new Set<string>(['content', 'analytics', 'campaigns', 'keywords', 'competitors', 'email'])
        : new Set(topics.map(t => t.category));

      // Parallel fetch based on detected topics
      const fetches: Promise<void>[] = [];

      if (coveredCategories.has('content') || coveredCategories.has('analytics')) {
        fetches.push((async () => {
          const { count } = await supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) newData.push({ label: 'Total Content', value: count, category: 'content', fetchedAt: now });
        })());
        fetches.push((async () => {
          const { count } = await supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'published');
          if (count !== null) newData.push({ label: 'Published', value: count, category: 'content', fetchedAt: now });
        })());
      }

      if (coveredCategories.has('campaigns')) {
        fetches.push((async () => {
          const { count } = await supabase
            .from('campaigns')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) newData.push({ label: 'Active Campaigns', value: count, category: 'campaigns', fetchedAt: now });
        })());
      }

      if (coveredCategories.has('keywords')) {
        fetches.push((async () => {
          const { count } = await supabase
            .from('ai_strategy_proposals')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) newData.push({ label: 'Keyword Proposals', value: count, category: 'keywords', fetchedAt: now });
        })());
      }

      if (coveredCategories.has('competitors')) {
        fetches.push((async () => {
          const { count } = await supabase
            .from('company_competitors')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) newData.push({ label: 'Tracked Competitors', value: count, category: 'competitors', fetchedAt: now });
        })());
      }

      await Promise.all(fetches);
      if (newData.length > 0) {
        setPlatformData(prev => {
          // Merge: replace existing by label, add new
          const map = new Map(prev.map(d => [d.label, d]));
          for (const d of newData) map.set(d.label, d);
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('Analyst engine: platform data fetch failed', err);
    } finally {
      setIsEnriching(false);
    }
  }, [userId, isActive, topics]);

  // Phase 6b: Auto-fetch ALL platform data on activation (even with no topics)
  const hasInitialFetchedRef = useRef(false);
  useEffect(() => {
    if (isActive && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchPlatformData(true); // Force-fetch all categories on activation
    } else if (isActive && topics.length > 0) {
      fetchPlatformData();
    }
    if (!isActive) {
      hasInitialFetchedRef.current = false;
    }
  }, [isActive, topics, fetchPlatformData]);

  // Phase 6d: Proactive anomaly detection after platform data loads
  const [anomalyInsights, setAnomalyInsights] = useState<InsightItem[]>([]);
  useEffect(() => {
    if (!isActive || !userId || platformData.length === 0) return;

    const detectAnomalies = async () => {
      const alerts: InsightItem[] = [];
      const now = new Date();
      
      try {
        // Check for low SEO scores
        const { data: lowSeo } = await supabase
          .from('content_items')
          .select('id, title, seo_score')
          .eq('user_id', userId)
          .eq('status', 'published')
          .not('seo_score', 'is', null)
          .lt('seo_score', 40)
          .limit(3);
        if (lowSeo && lowSeo.length > 0) {
          alerts.push({
            id: `anomaly-low-seo-${now.getTime()}`,
            content: `⚠️ ${lowSeo.length} published article${lowSeo.length > 1 ? 's' : ''} with SEO score below 40 — consider optimizing "${lowSeo[0].title}"`,
            type: 'warning',
            source: 'platform',
            timestamp: now,
          });
        }

        // Check for stale drafts (>14 days)
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { count: staleDrafts } = await supabase
          .from('content_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'draft')
          .lt('updated_at', twoWeeksAgo);
        if (staleDrafts && staleDrafts > 0) {
          alerts.push({
            id: `anomaly-stale-drafts-${now.getTime()}`,
            content: `📝 ${staleDrafts} draft${staleDrafts > 1 ? 's' : ''} haven't been updated in 2+ weeks — finish or archive them`,
            type: 'opportunity',
            source: 'platform',
            timestamp: now,
          });
        }

        // Check for empty calendar (next 7 days)
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const { count: scheduledItems } = await supabase
          .from('content_calendar')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('scheduled_date', today)
          .lte('scheduled_date', nextWeek);
        if (scheduledItems === 0) {
          alerts.push({
            id: `anomaly-empty-calendar-${now.getTime()}`,
            content: `📅 No content scheduled for the next 7 days — consider planning ahead`,
            type: 'warning',
            source: 'platform',
            timestamp: now,
          });
        }
      } catch (err) {
        console.warn('Anomaly detection failed:', err);
      }

      if (alerts.length > 0) {
        setAnomalyInsights(alerts);
      }
    };

    detectAnomalies();
  }, [isActive, userId, platformData]);

  // ─── Accumulated web search results ──────────────────────────────────
  const webSearchResults = useMemo(() => {
    if (!isActive) return [];
    const results: AnalystWebSearchData[] = [];
    for (const msg of messages) {
      if (msg.role === 'assistant' && msg.analystContext?.webSearchResults) {
        results.push(msg.analystContext.webSearchResults);
      }
    }
    return results;
  }, [messages, isActive]);

  // Phase 6d: Merge anomaly insights into the feed (at top)
  const enrichedInsightsFeed = useMemo(() => {
    return [...anomalyInsights, ...insightsFeed];
  }, [anomalyInsights, insightsFeed]);

  return {
    topics,
    insightsFeed: enrichedInsightsFeed,
    cumulativeMetrics,
    suggestedActions,
    accumulatedCharts,
    platformData,
    webSearchResults,
    lastUpdated: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    isEnriching,
    messageCount: messages.filter(m => m.role === 'assistant').length,
  };
}
