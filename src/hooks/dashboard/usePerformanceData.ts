
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceDataPoint {
  date: string;
  content: number;
  engagement: number;
  seoScore: number;
  conversions: number;
}

export const usePerformanceData = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch content data for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: contentData } = await supabase
          .from('content_items')
          .select('created_at, seo_score, status')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        // Generate performance data for the last 7 days
        const data: PerformanceDataPoint[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          // Count content created on this day
          const dayContent = contentData?.filter(c => 
            new Date(c.created_at).toDateString() === date.toDateString()
          ).length || 0;

          // Calculate average SEO score for this day
          const dayScores = contentData?.filter(c => 
            new Date(c.created_at).toDateString() === date.toDateString() && c.seo_score
          ).map(c => c.seo_score!) || [];
          
          const avgSeoScore = dayScores.length > 0 
            ? dayScores.reduce((a, b) => a + b, 0) / dayScores.length
            : 0;

          data.push({
            date: dateStr,
            content: dayContent,
            engagement: Math.floor(Math.random() * 100) + 50, // Mock data
            seoScore: Math.round(avgSeoScore),
            conversions: Math.floor(Math.random() * 20) + 10, // Mock data
          });
        }

        setPerformanceData(data);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        // Fallback to mock data
        const fallbackData: PerformanceDataPoint[] = [
          { date: "Dec 6", content: 2, engagement: 85, seoScore: 72, conversions: 15 },
          { date: "Dec 7", content: 1, engagement: 92, seoScore: 78, conversions: 18 },
          { date: "Dec 8", content: 3, engagement: 78, seoScore: 75, conversions: 12 },
          { date: "Dec 9", content: 0, engagement: 88, seoScore: 80, conversions: 20 },
          { date: "Dec 10", content: 2, engagement: 95, seoScore: 82, conversions: 25 },
          { date: "Dec 11", content: 1, engagement: 90, seoScore: 85, conversions: 22 },
          { date: "Dec 12", content: 4, engagement: 87, seoScore: 79, conversions: 17 }
        ];
        setPerformanceData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user]);

  return {
    performanceData,
    loading
  };
};
