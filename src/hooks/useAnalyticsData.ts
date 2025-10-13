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
    loading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};
