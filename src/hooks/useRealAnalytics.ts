
import { useState, useEffect } from 'react';
import { realAnalyticsService, AnalyticsMetrics, ContentAnalytics, TimelineData } from '@/services/realAnalyticsService';

interface DateRange {
  from: Date;
  to: Date;
}

export const useRealAnalytics = (timeRange: string = '7days', customDateRange?: DateRange) => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching analytics data for:', customDateRange ? 'custom range' : `time range: ${timeRange}`);
        
        if (customDateRange) {
          // Use custom date range
          const data = await realAnalyticsService.fetchCustomRangeData(
            customDateRange.from,
            customDateRange.to
          );
          
          setMetrics(data.metrics);
          setContentAnalytics(data.contentAnalytics);
          setTimelineData(data.timelineData);
        } else {
          // Use predefined time range
          const [metricsData, contentData, timelineDataResult] = await Promise.all([
            realAnalyticsService.fetchOverviewMetrics(timeRange),
            realAnalyticsService.fetchContentAnalytics(timeRange),
            realAnalyticsService.fetchTimelineData('views', timeRange)
          ]);

          console.log('Analytics data fetched:', { metricsData, contentData, timelineDataResult });
          
          setMetrics(metricsData);
          setContentAnalytics(contentData);
          setTimelineData(timelineDataResult);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange, customDateRange]);

  const refreshAnalytics = () => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (customDateRange) {
          const data = await realAnalyticsService.fetchCustomRangeData(
            customDateRange.from,
            customDateRange.to
          );
          
          setMetrics(data.metrics);
          setContentAnalytics(data.contentAnalytics);
          setTimelineData(data.timelineData);
        } else {
          const [metricsData, contentData, timelineDataResult] = await Promise.all([
            realAnalyticsService.fetchOverviewMetrics(timeRange),
            realAnalyticsService.fetchContentAnalytics(timeRange),
            realAnalyticsService.fetchTimelineData('views', timeRange)
          ]);
          
          setMetrics(metricsData);
          setContentAnalytics(contentData);
          setTimelineData(timelineDataResult);
        }
      } catch (err) {
        console.error('Error refreshing analytics:', err);
        setError('Failed to refresh analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  };

  return {
    metrics,
    contentAnalytics,
    timelineData,
    loading,
    error,
    refreshAnalytics
  };
};
