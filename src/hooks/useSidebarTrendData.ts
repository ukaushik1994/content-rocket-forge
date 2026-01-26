import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export type TimeframeOption = '7d' | '30d' | 'custom';

interface TrendMetric {
  current: number;
  previous: number;
  changePercent: number;
  trend: 'up' | 'down' | 'neutral';
}

interface TrendData {
  [key: string]: TrendMetric;
}

interface UseSidebarTrendDataProps {
  userId: string | null;
  dataSource: string;
  timeframe: TimeframeOption;
  chartData?: any[];
  customStartDate?: Date;
  customEndDate?: Date;
}

interface UseSidebarTrendDataReturn {
  trendData: TrendData;
  isLoading: boolean;
  error: string | null;
  timeframeLabel: string;
}

// Smart auto-detect which table to query based on data source
const detectDataTable = (dataSource: string): 'campaign' | 'content' | 'serp' | 'local' => {
  const lowerSource = dataSource.toLowerCase();
  
  if (lowerSource.includes('campaign') || lowerSource.includes('analytics')) {
    return 'campaign';
  }
  if (lowerSource.includes('content') || lowerSource.includes('repository') || lowerSource.includes('article')) {
    return 'content';
  }
  if (lowerSource.includes('serp') || lowerSource.includes('market') || lowerSource.includes('keyword') || lowerSource.includes('ranking')) {
    return 'serp';
  }
  
  // Default to local calculation for AI Analysis or unknown sources
  return 'local';
};

// Calculate trend from current vs previous values
const calculateTrend = (current: number, previous: number): TrendMetric => {
  const changePercent = previous > 0 
    ? ((current - previous) / previous) * 100 
    : current > 0 ? 100 : 0;
  
  const trend: 'up' | 'down' | 'neutral' = 
    changePercent > 2 ? 'up' : 
    changePercent < -2 ? 'down' : 
    'neutral';
    
  return {
    current,
    previous,
    changePercent,
    trend
  };
};

// Calculate trends from local chart data (first half vs second half)
const calculateLocalTrends = (chartData: any[]): TrendData => {
  if (!chartData?.length) return {};
  
  const firstItem = chartData[0];
  const numericKeys = Object.keys(firstItem).filter(
    key => typeof firstItem[key] === 'number' && !['id', 'index', 'dataSource'].includes(key)
  );
  
  const midpoint = Math.floor(chartData.length / 2);
  if (midpoint === 0) return {};
  
  const trendData: TrendData = {};
  
  numericKeys.forEach(key => {
    const firstHalf = chartData.slice(0, midpoint);
    const secondHalf = chartData.slice(midpoint);
    
    const firstHalfSum = firstHalf.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    const secondHalfSum = secondHalf.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
    
    const firstHalfAvg = firstHalfSum / firstHalf.length;
    const secondHalfAvg = secondHalfSum / secondHalf.length;
    
    trendData[key] = calculateTrend(secondHalfAvg, firstHalfAvg);
  });
  
  return trendData;
};

export const useSidebarTrendData = ({
  userId,
  dataSource,
  timeframe,
  chartData = [],
  customStartDate,
  customEndDate
}: UseSidebarTrendDataProps): UseSidebarTrendDataReturn => {
  const [trendData, setTrendData] = useState<TrendData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate date ranges based on timeframe
  const { currentStart, currentEnd, previousStart, previousEnd } = useMemo(() => {
    const now = new Date();
    let days = 30;
    
    if (timeframe === '7d') {
      days = 7;
    } else if (timeframe === 'custom' && customStartDate && customEndDate) {
      const customDays = Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        currentStart: startOfDay(customStartDate),
        currentEnd: endOfDay(customEndDate),
        previousStart: startOfDay(subDays(customStartDate, customDays)),
        previousEnd: endOfDay(subDays(customStartDate, 1))
      };
    }
    
    return {
      currentStart: startOfDay(subDays(now, days)),
      currentEnd: endOfDay(now),
      previousStart: startOfDay(subDays(now, days * 2)),
      previousEnd: endOfDay(subDays(now, days + 1))
    };
  }, [timeframe, customStartDate, customEndDate]);

  // Timeframe label for display
  const timeframeLabel = useMemo(() => {
    if (timeframe === '7d') return 'vs. previous 7 days';
    if (timeframe === '30d') return 'vs. previous 30 days';
    return 'vs. previous period';
  }, [timeframe]);

  // Detect table type once
  const tableType = useMemo(() => detectDataTable(dataSource), [dataSource]);

  useEffect(() => {
    // For local data, calculate from chartData without DB query
    if (tableType === 'local' || !userId) {
      const localTrends = calculateLocalTrends(chartData);
      setTrendData(localTrends);
      setIsLoading(false);
      return;
    }

    const fetchTrendData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let currentData: TrendData = {};
        
        if (tableType === 'campaign') {
          // Fetch campaign analytics data
          const [currentResult, previousResult] = await Promise.all([
            supabase
              .from('campaign_analytics')
              .select('views, clicks, conversions, revenue, engagement_count')
              .eq('user_id', userId)
              .gte('date', currentStart.toISOString())
              .lte('date', currentEnd.toISOString()),
            supabase
              .from('campaign_analytics')
              .select('views, clicks, conversions, revenue, engagement_count')
              .eq('user_id', userId)
              .gte('date', previousStart.toISOString())
              .lte('date', previousEnd.toISOString())
          ]);

          if (currentResult.error) throw currentResult.error;
          if (previousResult.error) throw previousResult.error;

          const sumData = (data: any[], key: string) => 
            data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

          const keys = ['views', 'clicks', 'conversions', 'revenue', 'engagement_count'];
          keys.forEach(key => {
            const currentSum = sumData(currentResult.data || [], key);
            const previousSum = sumData(previousResult.data || [], key);
            currentData[key] = calculateTrend(currentSum, previousSum);
          });
          
        } else if (tableType === 'content') {
          // Fetch content items data
          const [currentResult, previousResult] = await Promise.all([
            supabase
              .from('content_items')
              .select('id, status, seo_score')
              .eq('user_id', userId)
              .gte('created_at', currentStart.toISOString())
              .lte('created_at', currentEnd.toISOString()),
            supabase
              .from('content_items')
              .select('id, status, seo_score')
              .eq('user_id', userId)
              .gte('created_at', previousStart.toISOString())
              .lte('created_at', previousEnd.toISOString())
          ]);

          if (currentResult.error) throw currentResult.error;
          if (previousResult.error) throw previousResult.error;

          const current = currentResult.data || [];
          const previous = previousResult.data || [];

          currentData['totalContent'] = calculateTrend(current.length, previous.length);
          currentData['published'] = calculateTrend(
            current.filter(c => c.status === 'published').length,
            previous.filter(c => c.status === 'published').length
          );
          currentData['avgSeoScore'] = calculateTrend(
            current.reduce((sum, c) => sum + (c.seo_score || 0), 0) / (current.length || 1),
            previous.reduce((sum, c) => sum + (c.seo_score || 0), 0) / (previous.length || 1)
          );
          
        } else if (tableType === 'serp') {
          // Fetch SERP tracking history - using correct columns
          const [currentResult, previousResult] = await Promise.all([
            supabase
              .from('serp_tracking_history')
              .select('search_volume, keyword_difficulty, competition_score')
              .gte('created_at', currentStart.toISOString())
              .lte('created_at', currentEnd.toISOString()),
            supabase
              .from('serp_tracking_history')
              .select('search_volume, keyword_difficulty, competition_score')
              .gte('created_at', previousStart.toISOString())
              .lte('created_at', previousEnd.toISOString())
          ]);

          if (currentResult.error) throw currentResult.error;
          if (previousResult.error) throw previousResult.error;

          const current = currentResult.data || [];
          const previous = previousResult.data || [];

          // Average keyword difficulty (lower is better for opportunity)
          const currentAvgDifficulty = current.reduce((sum, c) => sum + (c.keyword_difficulty || 0), 0) / (current.length || 1);
          const previousAvgDifficulty = previous.reduce((sum, c) => sum + (c.keyword_difficulty || 0), 0) / (previous.length || 1);
          
          currentData['avgDifficulty'] = calculateTrend(currentAvgDifficulty, previousAvgDifficulty);

          currentData['searchVolume'] = calculateTrend(
            current.reduce((sum, c) => sum + (c.search_volume || 0), 0),
            previous.reduce((sum, c) => sum + (c.search_volume || 0), 0)
          );
          
          currentData['keywords'] = calculateTrend(current.length, previous.length);
        }

        setTrendData(currentData);
        
      } catch (err) {
        console.error('Error fetching trend data:', err);
        setError('Failed to load trend data');
        // Fallback to local calculation
        setTrendData(calculateLocalTrends(chartData));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendData();
  }, [userId, tableType, currentStart, currentEnd, previousStart, previousEnd, chartData]);

  return {
    trendData,
    isLoading,
    error,
    timeframeLabel
  };
};
