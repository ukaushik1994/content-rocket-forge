import { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { EnhancedChatMessage, MetricCard, ChartConfiguration, ActionableItem, AnalystWebSearchData } from '@/types/enhancedChat';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InsightItem {
  id: string;
  content: string;
  type: 'trend' | 'warning' | 'opportunity' | 'stat' | 'search';
  source: 'ai' | 'platform' | 'web' | 'cross-signal' | 'memory';
  timestamp: Date;
  messageId?: string;
  urgency?: 'critical' | 'high' | 'medium' | 'low';
}

// ─── Strategic Recommendation ──────────────────────────────────────────────
export type StrategicStance = 'stop-creating' | 'fix-quality' | 'accelerate' | 'build-foundation';

export interface StrategicAction {
  label: string;
  prompt: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface StrategicRecommendation {
  stance: StrategicStance;
  reasoning: string;
  promptQuestion: string;
  actions: StrategicAction[];
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
  trendData?: number[];
  metadata?: Record<string, any>;
}

// Enhancement A: Health Score
export interface HealthFactor {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'critical';
  detail: string;
}

export interface HealthScore {
  total: number;
  trend: 'improving' | 'declining' | 'stable';
  factors: HealthFactor[];
  topCritical: string | null;
}

// Enhancement E: Goal Progress
export interface GoalProgress {
  goalName: string;
  percentage: number;
  status: 'not_started' | 'in_progress' | 'nearly_done' | 'completed';
  nextStep: string;
  milestones: { label: string; done: boolean }[];
}

// ─── User Stage & Benchmarks ───────────────────────────────────────────────
export type UserStage = 'starter' | 'growing' | 'established' | 'scaling';

export interface StageBenchmarks {
  publishRate: number;
  avgSeo: number;
  weeklyArticles: number;
  minCompetitors: number;
}

const BENCHMARKS: Record<UserStage, StageBenchmarks> = {
  starter: { publishRate: 30, avgSeo: 30, weeklyArticles: 0.5, minCompetitors: 0 },
  growing: { publishRate: 50, avgSeo: 45, weeklyArticles: 1.5, minCompetitors: 2 },
  established: { publishRate: 65, avgSeo: 60, weeklyArticles: 2, minCompetitors: 3 },
  scaling: { publishRate: 75, avgSeo: 70, weeklyArticles: 3, minCompetitors: 5 },
};

function getUserStage(totalContent: number, published: number): UserStage {
  if (published >= 30) return 'scaling';
  if (published >= 10) return 'established';
  if (totalContent >= 3) return 'growing';
  return 'starter';
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
  lastRefreshError: string | null;
  messageCount: number;
  healthScore: HealthScore | null;
  crossSignalInsights: InsightItem[];
  goalProgress: GoalProgress | null;
  strategicRecommendation: StrategicRecommendation | null;
  userStage: UserStage | null;
  benchmarks: StageBenchmarks | null;
  triggerRefresh: () => void;
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

// ─── Enhancement F: Metric Context (stage-aware) ────────────────────────────
export function getMetricContext(label: string, value: number, allData: PlatformDataPoint[], stage?: UserStage | null): string {
  const totalContent = allData.find(d => d.label === 'Total Content')?.value || 0;
  const published = allData.find(d => d.label === 'Published')?.value || 0;
  const bench = stage ? BENCHMARKS[stage] : null;

  switch (label) {
    case 'Total Content': {
      if (value === 0) return 'Start creating content to build your library';
      if (value < 5) return 'Early stage — aim for 10+ pieces for SEO traction';
      if (value < 20) return 'Growing library — consistency will compound';
      return 'Strong library — focus on quality and updates';
    }
    case 'Published': {
      if (totalContent === 0) return 'No content yet to publish';
      const ratio = value / totalContent;
      if (ratio < 0.3) return `Only ${Math.round(ratio * 100)}% published — many drafts waiting`;
      if (ratio < 0.7) return 'Good publish rate — keep the pipeline flowing';
      return 'Most content is live — great execution';
    }
    case 'Active Campaigns': {
      if (value === 0) return 'No active campaigns — consider launching one';
      if (value > 5) return 'Multiple campaigns running — monitor closely';
      return `${value} campaign${value > 1 ? 's' : ''} active — track performance`;
    }
    case 'Tracked Competitors': {
      if (value === 0) return 'Add competitors to unlock market intelligence';
      if (value < 3) return 'Add more for a complete competitive picture';
      return 'Good coverage — review insights regularly';
    }
    case 'Keyword Proposals': {
      if (value === 0) return 'Generate proposals to find content opportunities';
      if (published > 0 && value > published * 3) return 'Many untargeted keywords — prioritize execution';
      return `${value} proposals ready for content creation`;
    }
    default:
      return '';
  }
}

// ─── Enhancement C: Cross-Signal Analysis ──────────────────────────────────
function computeCrossSignals(
  userId: string,
  platformData: PlatformDataPoint[],
  userMessages?: string[]
): Promise<InsightItem[]> {
  return new Promise(async (resolve) => {
    const signals: InsightItem[] = [];
    const now = new Date();
    const totalContent = platformData.find(d => d.label === 'Total Content')?.value || 0;
    const published = platformData.find(d => d.label === 'Published')?.value || 0;
    const proposals = platformData.find(d => d.label === 'Keyword Proposals')?.value || 0;

    try {
      // 1. SEO trend detection (last 5 published articles)
      const { data: recentArticles } = await supabase
        .from('content_items')
        .select('title, seo_score, created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('seo_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentArticles && recentArticles.length >= 3) {
        const scores = recentArticles.map(a => a.seo_score as number);
        const avgFirst = (scores[0] + scores[1]) / 2;
        const avgLast = (scores[scores.length - 2] + scores[scores.length - 1]) / 2;
        if (avgFirst < avgLast - 10) {
          signals.push({
            id: `cross-seo-declining`,  // Phase 5: stable anomaly ID
            content: `📉 SEO scores trending down in recent articles (avg ${Math.round(avgFirst)} vs ${Math.round(avgLast)} earlier) — review optimization checklist`,
            type: 'warning',
            source: 'cross-signal',
            timestamp: now,
            urgency: 'critical',
          });
        } else if (avgFirst > avgLast + 10) {
          signals.push({
            id: `cross-seo-improving`,  // Phase 5: stable anomaly ID
            content: `📈 SEO scores improving in recent articles (avg ${Math.round(avgFirst)} vs ${Math.round(avgLast)} earlier) — keep this momentum`,
            type: 'opportunity',
            source: 'cross-signal',
            timestamp: now,
          });
        }
      }

      // 2. Topic concentration — check if 50%+ content targets one keyword
      const { data: proposalKeywords } = await supabase
        .from('ai_strategy_proposals')
        .select('primary_keyword')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .limit(20);

      if (proposalKeywords && proposalKeywords.length >= 4) {
        const keywordCounts = new Map<string, number>();
        for (const p of proposalKeywords) {
          const kw = p.primary_keyword.toLowerCase();
          keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
        }
        for (const [kw, count] of keywordCounts) {
          if (count / proposalKeywords.length >= 0.5) {
            signals.push({
              id: `cross-topic-concentration-${kw}`,
              content: `🎯 ${Math.round((count / proposalKeywords.length) * 100)}% of completed proposals target "${kw}" — consider diversifying topics`,
              type: 'warning',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'low',
            });
            break;
          }
        }
      }

      // 3. Publishing consistency gap
      const { data: lastPublished } = await supabase
        .from('content_items')
        .select('created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(1);

      if (lastPublished && lastPublished.length > 0) {
        const daysSinceLast = Math.floor((now.getTime() - new Date(lastPublished[0].created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLast > 14) {
          signals.push({
            id: `cross-publish-gap`,
            content: `⏰ ${daysSinceLast} days since last published content — consistency drives SEO growth`,
            type: 'warning',
            source: 'cross-signal',
            timestamp: now,
            urgency: 'high',
          });
        }
      }

      // 4. Content-to-keyword ratio (untargeted proposals)
      if (proposals > 0 && published > 0 && proposals > published * 3) {
        signals.push({
          id: `cross-keyword-ratio`,
          content: `📊 ${proposals} keyword proposals but only ${published} published articles — ${proposals - published} opportunities waiting for content`,
          type: 'opportunity',
          source: 'cross-signal',
          timestamp: now,
        });
      }

      // 5. Draft-to-publish ratio
      const drafts = totalContent - published;
      if (totalContent > 3 && drafts > published * 2) {
        signals.push({
          id: `cross-draft-ratio-${now.getTime()}`,
          content: `✏️ ${drafts} drafts vs ${published} published — consider a publish sprint to clear the backlog`,
          type: 'opportunity',
          source: 'cross-signal',
          timestamp: now,
          urgency: 'medium',
        });
      }

      // 6. Positive reinforcement: Publishing streak (2+ articles this week)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: thisWeekPublished } = await supabase
        .from('content_items')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'published')
        .gte('created_at', oneWeekAgo);

      if (thisWeekPublished && thisWeekPublished.length >= 2) {
        signals.push({
          id: `cross-publish-streak-${now.getTime()}`,
          content: `🔥 ${thisWeekPublished.length} articles published this week — great momentum! Consistency compounds SEO results.`,
          type: 'opportunity',
          source: 'cross-signal',
          timestamp: now,
        });
      }

      // 7. Positive reinforcement: SEO improvement trend
      if (recentArticles && recentArticles.length >= 4) {
        const scores = recentArticles.map(a => a.seo_score as number);
        if (scores[0] > scores[2] && scores[0] >= 60) {
          signals.push({
            id: `cross-seo-win-${now.getTime()}`,
            content: `🏆 Your latest articles score ${scores[0]}/100 SEO — up from ${scores[2]} in earlier pieces. Your optimization skills are improving!`,
            type: 'opportunity',
            source: 'cross-signal',
            timestamp: now,
          });
        }
      }

      // ─── Fix 1: Cross-Data Pattern Engine ────────────────────────────────

      // 8. Keyword cannibalization: multiple articles targeting same meta_title pattern
      const { data: contentKeywords } = await supabase
        .from('content_items')
        .select('title, keywords, meta_title')
        .eq('user_id', userId)
        .eq('status', 'published')
        .limit(50);

      if (contentKeywords && contentKeywords.length >= 2) {
        const kwMap = new Map<string, string[]>();
        for (const item of contentKeywords) {
          // Extract primary keyword from keywords JSON or meta_title
          const kwArr = Array.isArray(item.keywords) ? item.keywords : [];
          const kw = (kwArr[0] as string || item.meta_title || '').toLowerCase().trim();
          if (!kw) continue;
          const existing = kwMap.get(kw) || [];
          existing.push(item.title);
          kwMap.set(kw, existing);
        }
        for (const [kw, titles] of kwMap) {
          if (titles.length >= 2) {
            signals.push({
              id: `cross-cannibalization-${kw}-${now.getTime()}`,
              content: `⚠️ Keyword cannibalization: ${titles.length} articles target "${kw}" — they may compete against each other in search. Consider consolidating or differentiating.`,
              type: 'warning',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'high',
            });
            break;
          }
        }
      }

      // 9. WHY SEO is declining — analyze recent low-score articles
      if (recentArticles && recentArticles.length >= 3) {
        const scores2 = recentArticles.map(a => a.seo_score as number);
        const avgF = (scores2[0] + scores2[1]) / 2;
        const avgL = (scores2[scores2.length - 2] + scores2[scores2.length - 1]) / 2;
        if (avgF < avgL - 10) {
          const { data: diagArticles } = await supabase
            .from('content_items')
            .select('title, seo_score, content')
            .eq('user_id', userId)
            .eq('status', 'published')
            .not('seo_score', 'is', null)
            .order('created_at', { ascending: false })
            .limit(3);

          if (diagArticles) {
            const issues: string[] = [];
            for (const article of diagArticles) {
              const contentStr = article.content || '';
              if (contentStr.length < 2000) issues.push('short content');
              if (!contentStr.includes('?')) issues.push('no FAQ section');
              const headingCount = (contentStr.match(/#{2,3}\s/g) || []).length;
              if (headingCount < 3) issues.push('too few headings');
            }
            const uniqueIssues = [...new Set(issues)];
            if (uniqueIssues.length > 0) {
              signals.push({
                id: `cross-seo-diagnosis-${now.getTime()}`,
                content: `🔍 Why SEO is declining: Recent articles show ${uniqueIssues.slice(0, 3).join(', ')}. These are the most common causes of low scores.`,
                type: 'warning',
                source: 'cross-signal',
                timestamp: now,
                urgency: 'high',
              });
            }
          }
        }
      }

      // ─── Fix 4: Predictive Intelligence ──────────────────────────────────

      // 10. Draft depletion forecast
      if (published >= 3) {
        const { data: publishDates } = await supabase
          .from('content_items')
          .select('created_at')
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10);

        if (publishDates && publishDates.length >= 2) {
          const dates = publishDates.map(d => new Date(d.created_at).getTime());
          const gaps: number[] = [];
          for (let i = 0; i < dates.length - 1; i++) {
            gaps.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
          }
          const avgDaysBetween = gaps.reduce((s, g) => s + g, 0) / gaps.length;
          const currentDrafts = totalContent - published;
          if (avgDaysBetween > 0 && currentDrafts > 0) {
            const daysOfRunway = Math.round(currentDrafts * avgDaysBetween);
            if (daysOfRunway < 14) {
              signals.push({
                id: `cross-draft-depletion-${now.getTime()}`,
                content: `⏳ At your current pace (1 article every ${Math.round(avgDaysBetween)} days), your ${currentDrafts} drafts will run out in ~${daysOfRunway} days. Start creating new content now.`,
                type: 'warning',
                source: 'cross-signal',
                timestamp: now,
                urgency: 'high',
              });
            }
          }
        }
      }

      // 11. Topic saturation: 4+ articles with same 2-word prefix
      if (contentKeywords && contentKeywords.length >= 4) {
        const prefixMap = new Map<string, number>();
        for (const item of contentKeywords) {
          const kwArr = Array.isArray(item.keywords) ? item.keywords : [];
          const kw = (kwArr[0] as string || item.meta_title || '').toLowerCase().trim();
          const words = kw.split(/\s+/);
          if (words.length >= 2) {
            const prefix = words.slice(0, 2).join(' ');
            prefixMap.set(prefix, (prefixMap.get(prefix) || 0) + 1);
          }
        }
        for (const [prefix, count] of prefixMap) {
          if (count >= 4) {
            signals.push({
              id: `cross-topic-saturation-${prefix}-${now.getTime()}`,
              content: `📊 Topic saturation: ${count} articles target "${prefix}..." — diminishing returns likely. Expand into adjacent topics for better coverage.`,
              type: 'warning',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'low',
            });
            break;
          }
        }
      }

      // ─── Fix 5: Temporal/Seasonal Awareness ─────────────────────────────

      // 12. Content aging: published articles older than 180 days
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
      const { data: oldArticles } = await supabase
        .from('content_items')
        .select('title, created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .lt('created_at', sixMonthsAgo)
        .order('created_at', { ascending: true })
        .limit(3);

      if (oldArticles && oldArticles.length > 0) {
        const oldestTitle = oldArticles[0].title;
        const daysSince = Math.floor((now.getTime() - new Date(oldArticles[0].created_at).getTime()) / (1000 * 60 * 60 * 24));
        signals.push({
          id: `cross-content-aging-${now.getTime()}`,
          content: `📅 "${oldestTitle}" is ${daysSince} days old. ${oldArticles.length > 1 ? `${oldArticles.length} articles` : 'This article'} may need refreshing to maintain rankings.`,
          type: 'opportunity',
          source: 'cross-signal',
          timestamp: now,
          urgency: 'medium',
        });
      }

      // 13. Seasonal detection removed — irrelevant for B2B users (Phase 5)

      // ─── Fix 6: Content-to-Business Attribution ─────────────────────────

      // 14. Solution-content gaps: solutions with no articles
      try {
        const { data: solutions } = await supabase
          .from('solutions')
          .select('name')
          .eq('user_id', userId)
          .limit(20);

        if (solutions && solutions.length > 0 && contentKeywords) {
          const allTitles = contentKeywords.map(c => c.title.toLowerCase());
          const uncoveredSolutions = solutions.filter(s => 
            !allTitles.some(t => t.includes(s.name.toLowerCase()))
          );
          if (uncoveredSolutions.length > 0) {
            signals.push({
              id: `cross-solution-gap-${now.getTime()}`,
              content: `🏢 ${uncoveredSolutions.length} of your ${solutions.length} solutions have no dedicated content — "${uncoveredSolutions[0].name}" could use an article to support sales.`,
              type: 'opportunity',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'medium',
            });
          }
        }
      } catch { /* solutions table may not exist */ }

      // 15. Pareto proposals: top 3 proposals capturing 50%+ estimated impressions
      try {
        const { data: topProposals } = await supabase
          .from('ai_strategy_proposals')
          .select('title, estimated_impressions')
          .eq('user_id', userId)
          .not('estimated_impressions', 'is', null)
          .order('estimated_impressions', { ascending: false })
          .limit(20);

        if (topProposals && topProposals.length >= 5) {
          const totalImpressions = topProposals.reduce((s, p) => s + (p.estimated_impressions || 0), 0);
          const top3Impressions = topProposals.slice(0, 3).reduce((s, p) => s + (p.estimated_impressions || 0), 0);
          if (totalImpressions > 0 && top3Impressions / totalImpressions >= 0.5) {
            signals.push({
              id: `cross-pareto-proposals-${now.getTime()}`,
              content: `🎯 Top 3 proposals capture ${Math.round((top3Impressions / totalImpressions) * 100)}% of estimated impressions. Focus on "${topProposals[0].title}" first for maximum impact.`,
              type: 'opportunity',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'medium',
            });
          }
        }
      } catch { /* query may fail */ }

    } catch (err) {
      console.warn('Cross-signal analysis failed:', err);
    }

    // ─── Fix 7: Accountability Loop ──────────────────────────────────────
    if (userMessages && userMessages.length >= 3) {
      try {
        const simplified = userMessages.map(m => 
          m.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).slice(0, 4).join(' ')
        );
        const queryCount = new Map<string, number>();
        for (const q of simplified) {
          if (q.length < 8) continue; // skip very short queries
          queryCount.set(q, (queryCount.get(q) || 0) + 1);
        }
        let accountabilityAdded = false;
        for (const [query, count] of queryCount) {
          if (count >= 3 && !accountabilityAdded) {
            signals.push({
              id: `cross-accountability-${now.getTime()}`,
              content: `🔄 You've asked about "${query}" ${count} times this session. Want to take action instead of analyzing further? Let me create a concrete plan.`,
              type: 'opportunity',
              source: 'cross-signal',
              timestamp: now,
              urgency: 'medium',
            });
            accountabilityAdded = true;
          }
        }
      } catch { /* fail silently */ }
    }

    resolve(signals);
  });
}

// ─── Enhancement A: Health Score Computation ────────────────────────────────
function computeHealthScore(
  platformData: PlatformDataPoint[],
  anomalyInsights: InsightItem[],
  crossSignalInsights: InsightItem[]
): HealthScore {
  const factors: HealthFactor[] = [];
  const totalContent = platformData.find(d => d.label === 'Total Content')?.value || 0;
  const published = platformData.find(d => d.label === 'Published')?.value || 0;
  const campaigns = platformData.find(d => d.label === 'Active Campaigns')?.value || 0;
  const competitors = platformData.find(d => d.label === 'Tracked Competitors')?.value || 0;
  const proposals = platformData.find(d => d.label === 'Keyword Proposals')?.value || 0;

  // 1. Content Volume (20 pts) — Phase 5: stage-aware targets
  const stage = getUserStage(totalContent, published);
  const volumeTarget = stage === 'starter' ? 5 : 15;
  const volumeScore = Math.min(20, Math.round((totalContent / volumeTarget) * 20));
  factors.push({
    name: 'Content Volume',
    score: volumeScore,
    maxScore: 20,
    status: volumeScore >= 14 ? 'good' : volumeScore >= 8 ? 'warning' : 'critical',
    detail: `${totalContent} total pieces (target: ${volumeTarget}+)`,
  });

  // 2. Publish Velocity (25 pts)
  const publishRatio = totalContent > 0 ? published / totalContent : 0;
  const velocityScore = Math.min(25, Math.round(publishRatio * 25));
  factors.push({
    name: 'Publish Rate',
    score: velocityScore,
    maxScore: 25,
    status: velocityScore >= 18 ? 'good' : velocityScore >= 10 ? 'warning' : 'critical',
    detail: `${Math.round(publishRatio * 100)}% of content published`,
  });

  // 3. SEO Quality (20 pts) — based on real avg SEO score from platformData
  const avgSeoFromData = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
  const seoWarnings = anomalyInsights.filter(i => i.content.includes('SEO score')).length;
  let seoScore: number;
  if (avgSeoFromData > 0) {
    // Scale real avg SEO (0-100) to 0-20 points, minus warning penalties
    seoScore = Math.max(0, Math.round((avgSeoFromData / 100) * 20) - seoWarnings * 3);
  } else {
    seoScore = Math.max(0, 20 - seoWarnings * 7);
  }
  factors.push({
    name: 'SEO Quality',
    score: seoScore,
    maxScore: 20,
    status: seoScore >= 14 ? 'good' : seoScore >= 8 ? 'warning' : 'critical',
    detail: avgSeoFromData > 0
      ? `Avg SEO: ${avgSeoFromData}/100${seoWarnings > 0 ? ` (${seoWarnings} warning${seoWarnings > 1 ? 's' : ''})` : ''}`
      : (seoWarnings === 0 ? 'No SEO issues detected' : `${seoWarnings} SEO warning${seoWarnings > 1 ? 's' : ''} found`),
  });

  // 4. Strategic Completeness (20 pts)
  let stratScore = 0;
  if (competitors > 0) stratScore += 5;
  if (proposals > 0) stratScore += 5;
  if (campaigns > 0) stratScore += 5;
  if (competitors >= 3 && proposals >= 5) stratScore += 5;
  factors.push({
    name: 'Strategic Setup',
    score: stratScore,
    maxScore: 20,
    status: stratScore >= 15 ? 'good' : stratScore >= 8 ? 'warning' : 'critical',
    detail: `Competitors: ${competitors}, Proposals: ${proposals}, Campaigns: ${campaigns}`,
  });

  // 5. Anomaly Penalty (15 pts — start at 15, deduct per warning)
  const totalWarnings = anomalyInsights.filter(i => i.type === 'warning').length + crossSignalInsights.filter(i => i.type === 'warning').length;
  const anomalyScore = Math.max(0, 15 - totalWarnings * 3);
  factors.push({
    name: 'Health Alerts',
    score: anomalyScore,
    maxScore: 15,
    status: anomalyScore >= 12 ? 'good' : anomalyScore >= 6 ? 'warning' : 'critical',
    detail: totalWarnings === 0 ? 'No active warnings' : `${totalWarnings} warning${totalWarnings > 1 ? 's' : ''} to address`,
  });

  const total = factors.reduce((sum, f) => sum + f.score, 0);
  const criticalFactors = factors.filter(f => f.status === 'critical');
  const warningCount = crossSignalInsights.filter(i => i.type === 'warning').length;

  return {
    total,
    trend: warningCount > 2 ? 'declining' : total >= 60 ? 'improving' : 'stable',
    factors,
    topCritical: criticalFactors.length > 0 ? criticalFactors[0].name : null,
  };
}

// ─── Enhancement E: Goal Progress ──────────────────────────────────────────
function assessGoalProgress(
  goal: string | null | undefined,
  messages: EnhancedChatMessage[]
): GoalProgress | null {
  if (!goal) return null;

  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
  const msgCount = assistantMessages.length;

  const goalLower = goal.toLowerCase();
  let goalName = goal;
  let milestones: { label: string; done: boolean }[] = [];
  let percentage = 0;

  if (/content|article|blog|writing/.test(goalLower)) {
    goalName = 'Content Creation';
    milestones = [
      { label: 'Topic discussed', done: /topic|keyword|subject|idea/.test(allContent) },
      { label: 'Outline created', done: /outline|structure|heading/.test(allContent) },
      { label: 'Draft generated', done: /draft|generated|created|written/.test(allContent) },
      { label: 'SEO optimized', done: /seo|optimiz|score|meta/.test(allContent) },
    ];
  } else if (/seo|keyword|search|ranking/.test(goalLower)) {
    goalName = 'SEO Research';
    milestones = [
      { label: 'Keywords identified', done: /keyword|term|query/.test(allContent) },
      { label: 'Competition analyzed', done: /competi|rival|serp|difficulty/.test(allContent) },
      { label: 'Opportunities found', done: /opportunit|gap|potential/.test(allContent) },
      { label: 'Strategy defined', done: /strategy|plan|proposal|recommend/.test(allContent) },
    ];
  } else if (/email|newsletter|campaign/.test(goalLower)) {
    goalName = 'Email Campaign';
    milestones = [
      { label: 'Audience defined', done: /audience|segment|target|subscriber/.test(allContent) },
      { label: 'Content planned', done: /subject|content|template|copy/.test(allContent) },
      { label: 'Campaign created', done: /created|set up|launched|configured/.test(allContent) },
    ];
  } else if (/performance|analytics|metrics|report/.test(goalLower)) {
    goalName = 'Performance Analysis';
    milestones = [
      { label: 'Metrics gathered', done: /metric|data|stat|number/.test(allContent) },
      { label: 'Trends identified', done: /trend|pattern|change|growth/.test(allContent) },
      { label: 'Recommendations made', done: /recommend|suggest|action|improve/.test(allContent) },
    ];
  } else if (/competitor|competitive|market/.test(goalLower)) {
    goalName = 'Competitive Analysis';
    milestones = [
      { label: 'Competitors listed', done: /competitor|rival|company/.test(allContent) },
      { label: 'Strengths/weaknesses', done: /strength|weakness|swot|advantage/.test(allContent) },
      { label: 'Strategy comparison', done: /compar|differentiat|position|gap/.test(allContent) },
    ];
  } else if (/strategy|plan/.test(goalLower)) {
    goalName = 'Strategy Planning';
    milestones = [
      { label: 'Goals defined', done: /goal|objective|target|kpi/.test(allContent) },
      { label: 'Research done', done: /research|analyz|data|insight/.test(allContent) },
      { label: 'Plan created', done: /plan|strategy|roadmap|timeline/.test(allContent) },
      { label: 'Actions assigned', done: /action|task|assign|next step/.test(allContent) },
    ];
  } else {
    // Generic
    milestones = [
      { label: 'Discussion started', done: msgCount >= 1 },
      { label: 'Details explored', done: msgCount >= 3 },
      { label: 'Insights gathered', done: msgCount >= 5 },
    ];
  }

  const doneMilestones = milestones.filter(m => m.done).length;
  percentage = milestones.length > 0 ? Math.round((doneMilestones / milestones.length) * 100) : 0;

  // Boost slightly based on message count
  if (msgCount > 0 && percentage === 0) percentage = Math.min(15, msgCount * 5);

  let status: GoalProgress['status'] = 'not_started';
  if (percentage >= 100) status = 'completed';
  else if (percentage >= 75) status = 'nearly_done';
  else if (percentage > 0) status = 'in_progress';

  const nextMilestone = milestones.find(m => !m.done);

  return {
    goalName,
    percentage: Math.min(100, percentage),
    status,
    nextStep: nextMilestone?.label || 'All milestones complete!',
    milestones,
  };
}

// ─── Enhancement D: Session Memory ─────────────────────────────────────────
const SESSION_MEMORY_KEY = 'analyst_last_summary';
const SESSION_MEMORY_TTL = 72 * 60 * 60 * 1000; // 72 hours

interface SessionMemory {
  timestamp: number;
  insights: InsightItem[];
  healthTotal: number | null;
  topics: string[];
}

function saveSessionMemory(
  insights: InsightItem[],
  healthTotal: number | null,
  topics: AnalystTopic[]
): void {
  try {
    const memory: SessionMemory = {
      timestamp: Date.now(),
      insights: insights
        .filter(i => i.type === 'warning' || i.type === 'opportunity')
        .slice(0, 5)
        .map(i => ({ ...i, timestamp: i.timestamp || new Date() })),
      healthTotal,
      topics: topics.slice(0, 5).map(t => t.name),
    };
    localStorage.setItem(SESSION_MEMORY_KEY, JSON.stringify(memory));
  } catch {
    // localStorage quota — fail silently
  }
}

function loadSessionMemory(): InsightItem[] {
  try {
    const raw = localStorage.getItem(SESSION_MEMORY_KEY);
    if (!raw) return [];
    const memory: SessionMemory = JSON.parse(raw);
    if (Date.now() - memory.timestamp > SESSION_MEMORY_TTL) {
      localStorage.removeItem(SESSION_MEMORY_KEY);
      return [];
    }
    const ageMs = Date.now() - memory.timestamp;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageStr = ageHours < 1 ? 'Recently' : ageHours < 24 ? `${ageHours}h ago` : `${Math.floor(ageHours / 24)}d ago`;
    return memory.insights.map(i => ({
      ...i,
      id: `prev-${i.id}`,
      content: `${ageStr}: ${i.content}`,
      source: 'memory' as const,
      timestamp: new Date(i.timestamp || memory.timestamp),
    }));
  } catch {
    return [];
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAnalystEngine(
  messages: EnhancedChatMessage[],
  userId: string | null,
  isActive: boolean,
  conversationGoal?: string | null,
  activeConversationId?: string | null
): AnalystState {
  const [platformData, setPlatformData] = useState<PlatformDataPoint[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null);
  const lastFetchedTopicsRef = useRef<string>('');
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Enhancement C: Cross-signal state
  const [crossSignalInsights, setCrossSignalInsights] = useState<InsightItem[]>([]);

  // Enhancement D: Session memory state
  const [previousSessionInsights, setPreviousSessionInsights] = useState<InsightItem[]>([]);
  const prevActiveRef = useRef(false);

  // Anomaly state (declared early so reset effect can reference it)
  const [anomalyInsights, setAnomalyInsights] = useState<InsightItem[]>([]);

  // Refs for fetch tracking (declared early so reset effect can reference them)
  const hasInitialFetchedRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  // ─── Reset state when conversation changes ──────────────────────────────
  const prevConversationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeConversationId && activeConversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = activeConversationId;
      setCrossSignalInsights([]);
      setPreviousSessionInsights([]);
      setPlatformData([]);
      setAnomalyInsights([]);
      lastFetchedTopicsRef.current = '';
      processedMessageIdsRef.current = new Set();
      hasInitialFetchedRef.current = false;
      prevMessageCountRef.current = 0;
    }
  }, [activeConversationId]);

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
        feed.push({
          id: `ws-query-${msg.id}`,
          content: `Web search: "${ws.query}" — ${ws.results.length} results found`,
          type: 'search',
          source: 'web',
          timestamp: msg.timestamp,
          messageId: msg.id,
        });
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
      if (msg.visualData?.chartConfig) charts.push(msg.visualData.chartConfig);
      if (msg.visualData?.charts) charts.push(...msg.visualData.charts);
    }

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

        // Enhancement B: Fetch trend data (last 28 days, bucketed by week)
        fetches.push((async () => {
          const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
          const { data: recentContent } = await supabase
            .from('content_items')
            .select('created_at, status')
            .eq('user_id', userId)
            .gte('created_at', fourWeeksAgo)
            .order('created_at', { ascending: true });

          if (recentContent && recentContent.length > 0) {
            const weekBuckets = [0, 0, 0, 0];
            const publishBuckets = [0, 0, 0, 0];
            const nowMs = Date.now();
            for (const item of recentContent) {
              const daysAgo = Math.floor((nowMs - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const weekIdx = Math.min(3, Math.floor(daysAgo / 7));
              const reverseIdx = 3 - weekIdx; // oldest first
              weekBuckets[reverseIdx]++;
              if (item.status === 'published') publishBuckets[reverseIdx]++;
            }
            // Attach trend data to matching platform data points
            const totalPoint = newData.find(d => d.label === 'Total Content');
            if (totalPoint) totalPoint.trendData = weekBuckets;
            const publishPoint = newData.find(d => d.label === 'Published');
            if (publishPoint) publishPoint.trendData = publishBuckets;
          }
        })());
      }

      if (coveredCategories.has('content') || coveredCategories.has('analytics')) {
        // Avg SEO Score
        fetches.push((async () => {
          const { data: seoArticles } = await supabase
            .from('content_items')
            .select('seo_score')
            .eq('user_id', userId)
            .eq('status', 'published')
            .not('seo_score', 'is', null)
            .limit(50);
          if (seoArticles && seoArticles.length > 0) {
            const avg = Math.round(seoArticles.reduce((sum, a) => sum + (a.seo_score as number), 0) / seoArticles.length);
            newData.push({ label: 'Avg SEO Score', value: avg, category: 'content', fetchedAt: now });
          }
        })());
        // Drafts count
        fetches.push((async () => {
          const { count } = await supabase
            .from('content_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'draft');
          if (count !== null) newData.push({ label: 'Drafts', value: count, category: 'content', fetchedAt: now });
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
        // Queue failed/pending
        fetches.push((async () => {
          const { count: failedCount } = await supabase
            .from('content_generation_queue')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'failed');
          if (failedCount !== null && failedCount > 0) newData.push({ label: 'Queue Failed', value: failedCount, category: 'campaigns', fetchedAt: now });
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
        // Real tracked keywords from keywords table
        fetches.push((async () => {
          const { count } = await supabase
            .from('keywords')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          if (count !== null) newData.push({ label: 'Tracked Keywords', value: count, category: 'keywords', fetchedAt: now });
        })());
      }

      if (coveredCategories.has('competitors')) {
        fetches.push((async () => {
          const { data: competitors } = await supabase
            .from('company_competitors')
            .select('id, name, market_position, strengths, weaknesses, last_analyzed_at')
            .eq('user_id', userId)
            .limit(10);
          if (competitors !== null) {
            newData.push({ label: 'Tracked Competitors', value: competitors.length, category: 'competitors', fetchedAt: now });
            // Store competitor names + metadata as individual data points for the section
            competitors.forEach((c: any) => {
              newData.push({
                label: `Competitor: ${c.name}`,
                value: 1,
                category: 'competitors',
                fetchedAt: now,
                metadata: {
                  strengths: Array.isArray(c.strengths) ? c.strengths : [],
                  weaknesses: Array.isArray(c.weaknesses) ? c.weaknesses : [],
                  lastAnalyzedAt: c.last_analyzed_at || null,
                  marketPosition: c.market_position || null,
                },
              });
            });
          }
        })());
      }

      if (coveredCategories.has('email') || coveredCategories.has('engage')) {
        fetches.push((async () => {
          try {
            // Phase 5: Add user_id filter via workspace
            const { data: tm } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
            if (!tm?.workspace_id) return;
            const { count } = await supabase
              .from('engage_contacts' as any)
              .select('id', { count: 'exact', head: true })
              .eq('workspace_id', tm.workspace_id);
            if (count !== null) newData.push({ label: 'Contacts', value: count, category: 'engage', fetchedAt: now });
          } catch { /* table may not exist */ }
        })());
        fetches.push((async () => {
          try {
            // Phase 5: Add workspace filter for email_campaigns
            const { data: tm } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
            if (!tm?.workspace_id) return;
            const { count } = await supabase
              .from('email_campaigns' as any)
              .select('id', { count: 'exact', head: true })
              .eq('workspace_id', tm.workspace_id);
            if (count !== null) newData.push({ label: 'Email Campaigns', value: count, category: 'email', fetchedAt: now });
          } catch { /* table may not exist */ }
        })());
      }

      // Fix 12: Traffic proxy — Phase 5: Add user_id filter for content_performance_signals
      fetches.push((async () => {
        try {
          const { data: perfSignals } = await supabase
            .from('content_performance_signals' as any)
            .select('content_id, signal_type')
            .eq('user_id', userId)
            .limit(100);
          if (perfSignals && perfSignals.length > 0) {
            const countMap = new Map<string, number>();
            for (const s of perfSignals as any[]) {
              countMap.set(s.content_id, (countMap.get(s.content_id) || 0) + 1);
            }
            const sorted = [...countMap.entries()].sort((a, b) => b[1] - a[1]);
            if (sorted.length > 0) {
              const [topId, topCount] = sorted[0];
              const { data: topArticle } = await supabase
                .from('content_items')
                .select('title')
                .eq('id', topId)
                .single();
              if (topArticle) {
                newData.push({ label: 'Most Engaged', value: topCount, category: 'content_detail', fetchedAt: now });
              }
            }
          }
        } catch { /* table may not exist */ }
      })());

      await Promise.all(fetches);
      if (newData.length > 0) {
        setPlatformData(prev => {
          const map = new Map(prev.map(d => [d.label, d]));
          for (const d of newData) map.set(d.label, d);
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('Analyst engine: platform data fetch failed', err);
      setLastRefreshError(err instanceof Error ? err.message : 'Refresh failed');
    } finally {
      setIsEnriching(false);
    }
  }, [userId, isActive, topics]);

  // Auto-fetch ALL platform data on activation
  useEffect(() => {
    if (isActive && !hasInitialFetchedRef.current) {
      hasInitialFetchedRef.current = true;
      fetchPlatformData(true);
    } else if (isActive && topics.length > 0) {
      fetchPlatformData();
    }
    if (!isActive) {
      hasInitialFetchedRef.current = false;
    }
  }, [isActive, topics, fetchPlatformData]);

  // Phase 1: Re-fetch when first message arrives (0 → 1)
  useEffect(() => {
    if (isActive && prevMessageCountRef.current === 0 && messages.length > 0) {
      // Force a fresh fetch so data is current for this session
      lastFetchedTopicsRef.current = '';
      fetchPlatformData(true);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, isActive, fetchPlatformData]);

  // 60-second health score refresh interval while analyst is active
  useEffect(() => {
    if (!isActive || !userId) return;
    const interval = setInterval(() => {
      // Skip refresh when tab is hidden to reduce unnecessary queries
      if (document.hidden) return;
      fetchPlatformData(true);
    }, 120000);
    return () => clearInterval(interval);
  }, [isActive, userId, fetchPlatformData]);

  // Expose triggerRefresh for external callers (e.g., after tool success)
  const triggerRefresh = useCallback(() => {
    if (isActive) {
      lastFetchedTopicsRef.current = '';
      fetchPlatformData(true);
    }
  }, [isActive, fetchPlatformData]);

  // ─── Proactive anomaly detection ────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !userId || platformData.length === 0) return;

    const detectAnomalies = async () => {
      const alerts: InsightItem[] = [];
      const now = new Date();
      
      try {
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
            id: `anomaly-low-seo`,  // Phase 5: stable anomaly ID
            content: `⚠️ ${lowSeo.length} published article${lowSeo.length > 1 ? 's' : ''} with SEO score below 40 — consider optimizing "${lowSeo[0].title}"`,
            type: 'warning',
            source: 'platform',
            timestamp: now,
          });
        }

        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const { count: staleDrafts } = await supabase
          .from('content_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('status', 'draft')
          .lt('updated_at', twoWeeksAgo);
        if (staleDrafts && staleDrafts > 0) {
          alerts.push({
            id: `anomaly-stale-drafts`,  // Phase 5: stable anomaly ID
            content: `📝 ${staleDrafts} draft${staleDrafts > 1 ? 's' : ''} haven't been updated in 2+ weeks — finish or archive them`,
            type: 'opportunity',
            source: 'platform',
            timestamp: now,
          });
        }

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
            id: `anomaly-empty-calendar`,  // Phase 5: stable anomaly ID
            content: `📅 No content scheduled for the next 7 days — consider planning ahead`,
            type: 'warning',
            source: 'platform',
            timestamp: now,
          });
        }

        // M1-18: Stale content — published articles not reviewed in 90+ days
        try {
          const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
          const { data: stalePublished } = await supabase
            .from('content_items')
            .select('id, title')
            .eq('user_id', userId)
            .eq('status', 'published')
            .lt('last_reviewed_at' as any, ninetyDaysAgo)
            .limit(3);
          if (stalePublished && stalePublished.length > 0) {
            alerts.push({
              id: `anomaly-stale-content`,  // Phase 5: stable anomaly ID
              content: `🕰️ ${stalePublished.length} published article${stalePublished.length > 1 ? 's' : ''} not reviewed in 90+ days — "${stalePublished[0].title}" may need a freshness update`,
              type: 'warning',
              source: 'platform',
              timestamp: now,
            });
          }
        } catch (_) { /* non-blocking */ }
      } catch (err) {
        console.warn('Anomaly detection failed:', err);
      }

      if (alerts.length > 0) {
        setAnomalyInsights(alerts);
      }
    };

    detectAnomalies();
  }, [isActive, userId, platformData]);

  // ─── Enhancement C: Cross-signal detection ──────────────────────────────
  useEffect(() => {
    if (!isActive || !userId || platformData.length === 0) return;

    const userMsgs = messages.filter(m => m.role === 'user').map(m => m.content);
    computeCrossSignals(userId, platformData, userMsgs).then(signals => {
      if (signals.length > 0) setCrossSignalInsights(signals);
    });
  }, [isActive, userId, platformData, messages.length]);

  // ─── Enhancement D: Load session memory on activation ───────────────────
  useEffect(() => {
    if (isActive && !prevActiveRef.current && insightsFeed.length === 0) {
      const memoryInsights = loadSessionMemory();
      if (memoryInsights.length > 0) {
        setPreviousSessionInsights(memoryInsights);
      }
    }
    prevActiveRef.current = isActive;
  }, [isActive, insightsFeed.length]);

  // ─── Enhancement D: Save session memory on deactivation ─────────────────
  useEffect(() => {
    return () => {
      // Cleanup: save when component unmounts while active
      if (prevActiveRef.current && insightsFeed.length > 0) {
        saveSessionMemory(
          [...anomalyInsights, ...crossSignalInsights, ...insightsFeed],
          healthScore?.total ?? null,
          topics
        );
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save on deactivation
  useEffect(() => {
    if (!isActive && prevActiveRef.current) {
      saveSessionMemory(
        [...anomalyInsights, ...crossSignalInsights, ...insightsFeed],
        healthScore?.total ?? null,
        topics
      );
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // ─── Merge all insights with urgency scoring + sorting ────────────────
  const enrichedInsightsFeed = useMemo(() => {
    const allInsights = [...previousSessionInsights, ...crossSignalInsights, ...anomalyInsights, ...insightsFeed];
    
    // Assign urgency based on content patterns
    for (const insight of allInsights) {
      if (insight.urgency) continue; // already assigned
      const lower = insight.content.toLowerCase();
      if (/seo.*declin|scores.*trending.*down|critical/.test(lower)) {
        insight.urgency = 'critical';
      } else if (/no.*scheduled|empty.*calendar|0 days|haven't.*updated/.test(lower)) {
        insight.urgency = 'high';
      } else if (/stale.*draft|draft.*waiting|backlog/.test(lower)) {
        insight.urgency = 'medium';
      } else if (/concentration|diversif|consider/.test(lower)) {
        insight.urgency = 'low';
      }
    }

    // Sort: critical → high → medium → low → undefined
    const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return allInsights.sort((a, b) => {
      const aOrder = a.urgency ? urgencyOrder[a.urgency] : 4;
      const bOrder = b.urgency ? urgencyOrder[b.urgency] : 4;
      return aOrder - bOrder;
    });
  }, [previousSessionInsights, crossSignalInsights, anomalyInsights, insightsFeed]);

  // ─── Enhancement A: Health score ────────────────────────────────────────
  const healthScore = useMemo<HealthScore | null>(() => {
    if (!isActive || platformData.length === 0) return null;
    return computeHealthScore(platformData, anomalyInsights, crossSignalInsights);
  }, [isActive, platformData, anomalyInsights, crossSignalInsights]);

  // ─── Enhancement E: Goal progress (8D: DB-backed) ───────────────────────
  const [dbGoalProgress, setDbGoalProgress] = useState<GoalProgress | null>(null);

  useEffect(() => {
    if (!isActive || !userId) return;
    const fetchGoals = async () => {
      try {
        const { data: goals } = await supabase
          .from('user_goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (goals && goals.length > 0) {
          const goal = goals[0];
          // Compute current_value from real data
          let currentValue = goal.current_value || 0;
          
          if (goal.goal_type === 'publish_count') {
            const since = goal.starts_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
              .from('content_items')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'published')
            // Phase 5: Use created_at to count genuinely new articles
            .gte('created_at', since);
            currentValue = count || 0;
          } else if (goal.goal_type === 'content_count') {
            const since = goal.starts_at || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
              .from('content_items')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .gte('created_at', since);
            currentValue = count || 0;
          } else if (goal.goal_type === 'avg_seo') {
            const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
            currentValue = avgSeo;
          }
          
          const percentage = goal.target_value > 0 ? Math.min(100, Math.round((currentValue / goal.target_value) * 100)) : 0; // Phase 5: division by zero guard
          const typeLabels: Record<string, string> = {
            publish_count: 'Publish Articles',
            content_count: 'Create Content',
            avg_seo: 'Avg SEO Score',
            keyword_count: 'Track Keywords',
          };
          
          setDbGoalProgress({
            goalName: typeLabels[goal.goal_type] || goal.goal_type,
            percentage,
            status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'nearly_done' : percentage > 0 ? 'in_progress' : 'not_started',
            nextStep: percentage >= 100 ? 'Goal complete!' : `${currentValue}/${goal.target_value} — keep going!`,
            milestones: [
              { label: '25% done', done: percentage >= 25 },
              { label: '50% done', done: percentage >= 50 },
              { label: '75% done', done: percentage >= 75 },
              { label: 'Complete', done: percentage >= 100 },
            ],
          });
        }
      } catch { /* fail silently */ }
    };
    fetchGoals();
  }, [isActive, userId, platformData]);

  const goalProgress = useMemo<GoalProgress | null>(() => {
    if (!isActive) return null;
    // Prefer DB goal over conversation-based assessment
    if (dbGoalProgress) return dbGoalProgress;
    return assessGoalProgress(conversationGoal, messages);
  }, [isActive, conversationGoal, messages, dbGoalProgress]);

  // ─── Strategic Recommendation ──────────────────────────────────────────
  const strategicRecommendation = useMemo<StrategicRecommendation | null>(() => {
    if (!isActive || platformData.length === 0) return null;

    const totalContent = platformData.find(d => d.label === 'Total Content')?.value || 0;
    const published = platformData.find(d => d.label === 'Published')?.value || 0;
    const drafts = platformData.find(d => d.label === 'Drafts')?.value || 0;
    const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;

    // Rule 1: Too many drafts piling up
    if (drafts > 5 && drafts > published) {
      return {
        stance: 'stop-creating',
        reasoning: `You have ${drafts} drafts sitting unpublished vs ${published} live articles. Creating more content without publishing dilutes your effort. Focus on editing and shipping what you already have.`,
        promptQuestion: `${drafts} drafts are gathering dust. Should I help you triage and publish the best ones?`,
        actions: [
          { label: 'Triage My Drafts', prompt: `I have ${drafts} unpublished drafts. Help me prioritize which to publish first based on SEO potential and topic relevance.`, effort: 'low', impact: 'high' },
          { label: 'Create Publish Plan', prompt: `Create a 2-week publishing plan to clear my ${drafts} draft backlog, prioritized by impact.`, effort: 'medium', impact: 'high' },
        ],
      };
    }

    // Rule 2: Bad SEO quality
    if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
      return {
        stance: 'fix-quality',
        reasoning: `Your average SEO score is ${avgSeo}/100 across ${published} articles. Publishing more low-quality content won't help — each article needs to compete. Fix what you have before creating more.`,
        promptQuestion: `Average SEO is ${avgSeo}. Want me to identify the quickest wins to boost your scores?`,
        actions: [
          { label: 'Find Quick Wins', prompt: `My average SEO score is ${avgSeo}. Identify the 3 published articles with the most SEO improvement potential and tell me exactly what to fix.`, effort: 'low', impact: 'high' },
          { label: 'SEO Audit All Content', prompt: `Run a full SEO audit across all my published content and create a prioritized optimization plan.`, effort: 'high', impact: 'high' },
        ],
      };
    }

    // Rule 3: Everything is working well
    if (published >= 5 && avgSeo >= 60 && drafts <= 3) {
      return {
        stance: 'accelerate',
        reasoning: `${published} articles live with ${avgSeo} avg SEO and a clean pipeline (${drafts} drafts). Your foundation is solid — this is the time to scale output and capture more keywords.`,
        promptQuestion: 'Your content engine is running well. Ready to scale up?',
        actions: [
          { label: 'Find New Keywords', prompt: 'My content pipeline is healthy. Find untapped keyword opportunities I should target next to expand my reach.', effort: 'medium', impact: 'high' },
          { label: 'Scale Content Plan', prompt: `I have ${published} articles performing well. Create an aggressive content scaling plan for the next month.`, effort: 'medium', impact: 'high' },
        ],
      };
    }

    // Rule 4: Just starting out
    return {
      stance: 'build-foundation',
      reasoning: `You're early in your content journey with ${totalContent} total pieces. Focus on creating your first ${Math.max(0, 5 - published)} articles with strong SEO fundamentals before worrying about strategy.`,
      promptQuestion: totalContent === 0 ? 'Ready to create your first piece of content?' : `You have ${totalContent} pieces started. Want help getting to 5 published articles?`,
      actions: [
        { label: 'Create First Article', prompt: 'Help me create my first high-quality SEO-optimized article. Guide me through topic selection and outline.', effort: 'medium', impact: 'high' },
        { label: 'Content Strategy 101', prompt: 'I\'m just starting out. Give me a simple content strategy to build my first 5 articles with maximum impact.', effort: 'low', impact: 'medium' },
      ],
    };
  }, [isActive, platformData]);

  // ─── User Stage & Benchmarks ────────────────────────────────────────────
  const userStage = useMemo<UserStage | null>(() => {
    if (!isActive || platformData.length === 0) return null;
    const totalContent = platformData.find(d => d.label === 'Total Content')?.value || 0;
    const published = platformData.find(d => d.label === 'Published')?.value || 0;
    return getUserStage(totalContent, published);
  }, [isActive, platformData]);

  const benchmarks = useMemo<StageBenchmarks | null>(() => {
    return userStage ? BENCHMARKS[userStage] : null;
  }, [userStage]);

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
    lastRefreshError,
    messageCount: messages.filter(m => m.role === 'assistant').length,
    healthScore,
    crossSignalInsights,
    goalProgress,
    strategicRecommendation,
    userStage,
    benchmarks,
    triggerRefresh,
  };
}
