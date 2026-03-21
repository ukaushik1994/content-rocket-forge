import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  returningUsers: number;
}

interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
}

export interface InternalMetrics {
  totalContent: number;
  published: number;
  drafts: number;
  avgSeoScore: number;
  totalWords: number;
  contentCreatedThisMonth: number;
  contentCreatedTrend: number;
  contentPublishedThisMonth: number;
  contentPublishedTrend: number;
  typeDistribution: Record<string, number>;
  weeklyCreationData: Array<{ week: string; created: number }>;
}

export interface AggregatedMetrics {
  totalAnalytics: {
    pageViews: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
  };
  totalSearchConsole: {
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
  };
  avgBounceRate: number;
  avgSessionDuration: number;
  avgCTR: number;
  avgPosition: number;
}

export const useAnalyticsData = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null);
  const [internalMetrics, setInternalMetrics] = useState<InternalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: contentAnalytics, error: fetchError } = await supabase
        .from('content_analytics')
        .select(`
          analytics_data,
          search_console_data,
          content_items!inner(user_id, title, published_url)
        `)
        .eq('content_items.user_id', user.id)
        .not('analytics_data', 'is', null)
        .not('search_console_data', 'is', null);

      if (fetchError) {
        console.error('Error fetching analytics:', fetchError);
        setError('Failed to load analytics data');
        return;
      }

      if (contentAnalytics && contentAnalytics.length > 0) {
        const analyticsData = contentAnalytics
          .map(item => item.analytics_data)
          .filter(Boolean)
          .map(data => data as unknown as AnalyticsData);
        
        const searchData = contentAnalytics
          .map(item => item.search_console_data)
          .filter(Boolean)
          .map(data => data as unknown as SearchConsoleData);

        const totalAnalytics = analyticsData.reduce((acc, data) => ({
          pageViews: acc.pageViews + data.pageViews,
          sessions: acc.sessions + data.sessions,
          bounceRate: acc.bounceRate + data.bounceRate,
          avgSessionDuration: acc.avgSessionDuration + data.avgSessionDuration,
          newUsers: acc.newUsers + data.newUsers,
          returningUsers: acc.returningUsers + data.returningUsers,
        }), {
          pageViews: 0,
          sessions: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
          newUsers: 0,
          returningUsers: 0,
        });

        const totalSearchConsole = searchData.reduce((acc, data) => ({
          impressions: acc.impressions + data.impressions,
          clicks: acc.clicks + data.clicks,
          ctr: acc.ctr + data.ctr,
          averagePosition: acc.averagePosition + data.averagePosition,
        }), {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          averagePosition: 0,
        });

        const avgBounceRate = analyticsData.length > 0 ? totalAnalytics.bounceRate / analyticsData.length : 0;
        const avgSessionDuration = analyticsData.length > 0 ? totalAnalytics.avgSessionDuration / analyticsData.length : 0;
        const avgCTR = searchData.length > 0 ? totalSearchConsole.ctr / searchData.length : 0;
        const avgPosition = searchData.length > 0 ? totalSearchConsole.averagePosition / searchData.length : 0;

        setMetrics({
          totalAnalytics,
          totalSearchConsole,
          avgBounceRate,
          avgSessionDuration,
          avgCTR,
          avgPosition,
        });
      } else {
        setMetrics(null);
      }

      // Phase 2: Always compute internal metrics from content DB (zero API cost)
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const [allRes, currentRes, prevRes] = await Promise.all([
          supabase.from('content_items').select('id, status, seo_score, content_type, created_at')
            .eq('user_id', user.id).is('deleted_at' as any, null),
          supabase.from('content_items').select('id, status, seo_score')
            .eq('user_id', user.id).gte('created_at', thirtyDaysAgo).is('deleted_at' as any, null),
          supabase.from('content_items').select('id, status, seo_score')
            .eq('user_id', user.id).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo).is('deleted_at' as any, null),
        ]);

        const all = allRes.data || [];
        const current = currentRes.data || [];
        const prev = prevRes.data || [];

        const published = all.filter(c => c.status === 'published');
        const drafts = all.filter(c => c.status === 'draft');
        const avgSeo = published.length > 0
          ? Math.round(published.reduce((s, c) => s + (c.seo_score || 0), 0) / published.length)
          : 0;

        const currentCreated = current.length;
        const prevCreated = prev.length;
        const createdTrend = prevCreated > 0 ? Math.round(((currentCreated - prevCreated) / prevCreated) * 100) : 0;

        const currentPublished = current.filter(c => c.status === 'published').length;
        const prevPublished = prev.filter(c => c.status === 'published').length;
        const publishedTrend = prevPublished > 0 ? Math.round(((currentPublished - prevPublished) / prevPublished) * 100) : 0;

        const typeDistribution: Record<string, number> = {};
        all.forEach(c => {
          const t = c.content_type || 'blog';
          typeDistribution[t] = (typeDistribution[t] || 0) + 1;
        });

        const weeklyData = [];
        for (let i = 11; i >= 0; i--) {
          const wStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
          const wEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
          const count = all.filter(c => {
            const d = new Date(c.created_at);
            return d >= wStart && d < wEnd;
          }).length;
          weeklyData.push({ week: wStart.toISOString().slice(5, 10), created: count });
        }

        setInternalMetrics({
          totalContent: all.length,
          published: published.length,
          drafts: drafts.length,
          avgSeoScore: avgSeo,
          totalWords: 0, // Would need word_count column — skip for now
          contentCreatedThisMonth: currentCreated,
          contentCreatedTrend: createdTrend,
          contentPublishedThisMonth: currentPublished,
          contentPublishedTrend: publishedTrend,
          typeDistribution,
          weeklyCreationData: weeklyData,
        });
      } catch (internalErr) {
        console.warn('Internal metrics computation failed:', internalErr);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    metrics,
    internalMetrics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};
