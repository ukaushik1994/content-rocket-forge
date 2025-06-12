
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalProjects: number;
  keywordsAnalyzed: number;
  averageSeoScore: number;
  conversions: number;
  contentCreated: number;
  audienceGrowth: number;
  trends: {
    projects: { value: number; positive: boolean };
    keywords: { value: number; positive: boolean };
    seoScore: { value: number; positive: boolean };
    conversions: { value: number; positive: boolean };
    content: { value: number; positive: boolean };
    audience: { value: number; positive: boolean };
  };
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 12,
    keywordsAnalyzed: 284,
    averageSeoScore: 78,
    conversions: 5.4,
    contentCreated: 37,
    audienceGrowth: 14.2,
    trends: {
      projects: { value: 33, positive: true },
      keywords: { value: 12, positive: true },
      seoScore: { value: 5, positive: true },
      conversions: { value: 2, positive: false },
      content: { value: 18, positive: true },
      audience: { value: 3.5, positive: true },
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch real data from Supabase
        const [
          { data: contentData },
          { data: keywordData },
          { data: analyticsData }
        ] = await Promise.all([
          supabase
            .from('content_items')
            .select('id, seo_score, status, created_at')
            .eq('user_id', user.id),
          supabase
            .from('keywords')
            .select('id, created_at')
            .eq('user_id', user.id),
          supabase
            .from('content_analytics')
            .select('analytics_data, published_url')
            .limit(10)
        ]);

        // Calculate metrics from real data
        const totalProjects = contentData?.length || 0;
        const keywordsAnalyzed = keywordData?.length || 0;
        const validScores = contentData?.filter(c => c.seo_score !== null).map(c => c.seo_score!) || [];
        const averageSeoScore = validScores.length > 0 
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : 0;

        // Calculate trends (mock for now, could be enhanced with historical data)
        const currentMonth = new Date().getMonth();
        const lastMonthContent = contentData?.filter(c => 
          new Date(c.created_at).getMonth() === currentMonth - 1
        ).length || 0;
        const thisMonthContent = contentData?.filter(c => 
          new Date(c.created_at).getMonth() === currentMonth
        ).length || 0;

        const contentTrend = lastMonthContent > 0 
          ? Math.round(((thisMonthContent - lastMonthContent) / lastMonthContent) * 100)
          : 0;

        setMetrics({
          totalProjects,
          keywordsAnalyzed,
          averageSeoScore,
          conversions: 5.4, // Mock data for now
          contentCreated: totalProjects,
          audienceGrowth: 14.2, // Mock data for now
          trends: {
            projects: { value: Math.abs(contentTrend), positive: contentTrend >= 0 },
            keywords: { value: 12, positive: true },
            seoScore: { value: 5, positive: true },
            conversions: { value: 2, positive: false },
            content: { value: Math.abs(contentTrend), positive: contentTrend >= 0 },
            audience: { value: 3.5, positive: true },
          }
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const refreshData = () => {
    if (user) {
      setLoading(true);
      // Re-trigger the effect
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  };

  return {
    metrics,
    loading,
    error,
    refreshData
  };
};
