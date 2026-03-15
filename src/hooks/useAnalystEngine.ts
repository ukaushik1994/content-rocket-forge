import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { EnhancedChatMessage, MetricCard, ChartConfiguration, ActionableItem } from '@/types/enhancedChat';
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
        const insights = Array.isArray(msg.visualData.insights) ? msg.visualData.insights : [];
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
      if ((msg as any).analystContext?.insights) {
        for (const insight of (msg as any).analystContext.insights) {
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
      const cards = msg.visualData?.summaryInsights?.metricCards || msg.visualData?.metrics || [];
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
      if ((msg as any).analystContext?.metrics) {
        for (const m of (msg as any).analystContext.metrics) {
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
  const fetchPlatformData = useCallback(async () => {
    if (!userId || !isActive || topics.length === 0) return;

    const topicKey = topics.map(t => t.name).join(',');
    if (topicKey === lastFetchedTopicsRef.current) return;
    lastFetchedTopicsRef.current = topicKey;

    setIsEnriching(true);
    const newData: PlatformDataPoint[] = [];
    const now = new Date();

    try {
      const coveredCategories = new Set(topics.map(t => t.category));

      // Parallel fetch based on detected topics
      const fetches: Promise<void>[] = [];

      if (coveredCategories.has('content') || coveredCategories.has('analytics')) {
        fetches.push(
          supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .then(({ count }) => {
              if (count !== null) newData.push({ label: 'Total Content', value: count, category: 'content', fetchedAt: now });
            })
        );
        fetches.push(
          supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'published')
            .then(({ count }) => {
              if (count !== null) newData.push({ label: 'Published', value: count, category: 'content', fetchedAt: now });
            })
        );
      }

      if (coveredCategories.has('campaigns')) {
        fetches.push(
          supabase
            .from('campaigns')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .then(({ count }) => {
              if (count !== null) newData.push({ label: 'Active Campaigns', value: count, category: 'campaigns', fetchedAt: now });
            })
        );
      }

      if (coveredCategories.has('keywords')) {
        fetches.push(
          supabase
            .from('ai_strategy_proposals')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .then(({ count }) => {
              if (count !== null) newData.push({ label: 'Keyword Proposals', value: count, category: 'keywords', fetchedAt: now });
            })
        );
      }

      if (coveredCategories.has('competitors')) {
        fetches.push(
          supabase
            .from('company_competitors')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .then(({ count }) => {
              if (count !== null) newData.push({ label: 'Tracked Competitors', value: count, category: 'competitors', fetchedAt: now });
            })
        );
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

  // Trigger platform data fetch when topics change
  useEffect(() => {
    if (isActive && topics.length > 0) {
      fetchPlatformData();
    }
  }, [isActive, topics, fetchPlatformData]);

  return {
    topics,
    insightsFeed,
    cumulativeMetrics,
    suggestedActions,
    accumulatedCharts,
    platformData,
    lastUpdated: messages.length > 0 ? messages[messages.length - 1].timestamp : null,
    isEnriching,
    messageCount: messages.filter(m => m.role === 'assistant').length,
  };
}
