import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, BarChart } from '@/components/ui/chart';
import { Loader2, TrendingUp, Eye, MousePointerClick, Share2, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsAggregator, AggregatedAnalytics } from '@/services/analytics/analyticsAggregator';

interface CampaignAnalyticsProps {
  campaignId: string;
}

export function CampaignAnalytics({ campaignId }: CampaignAnalyticsProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AggregatedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);

  useEffect(() => {
    if (user && campaignId) {
      fetchAnalytics();
    }
  }, [campaignId, user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Trigger analytics fetch from edge function
      await supabase.functions.invoke('fetch-campaign-analytics', {
        body: { campaignId, userId: user?.id }
      });

      // Fetch aggregated analytics
      const aggregated = await analyticsAggregator.aggregateCampaignAnalytics(campaignId);
      setAnalytics(aggregated);

      // Fetch time series data for charts
      const { data: timeSeriesRecords } = await supabase
        .from('campaign_analytics')
        .select('date, views, engagement_count, conversions')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: true });

      if (timeSeriesRecords) {
        const groupedByDate = timeSeriesRecords.reduce((acc: any, record) => {
          const date = record.date;
          if (!acc[date]) {
            acc[date] = { date, views: 0, engagement: 0, conversions: 0 };
          }
          acc[date].views += record.views || 0;
          acc[date].engagement += record.engagement_count || 0;
          acc[date].conversions += record.conversions || 0;
          return acc;
        }, {});

        setTimeSeriesData(Object.values(groupedByDate));
      }
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No analytics data available yet. Analytics will appear once content is published.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.avgEngagementRate.toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">CTA interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.avgConversionRate.toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Attributed value</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time */}
      {timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Over Time</CardTitle>
            <CardDescription>Daily metrics for this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart
              data={timeSeriesData}
              categories={['views', 'engagement', 'conversions']}
              index="date"
              className="h-80"
              valueFormatter={(value) => value.toLocaleString()}
            />
          </CardContent>
        </Card>
      )}

      {/* Performance by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.keys(analytics.bySource).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Source</CardTitle>
              <CardDescription>Traffic breakdown by origin</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(analytics.bySource).map(([source, data]) => ({
                  name: source,
                  views: data.views,
                  engagement: data.engagement,
                  conversions: data.conversions
                }))}
                categories={['views', 'engagement', 'conversions']}
                index="name"
                className="h-64"
                valueFormatter={(value) => value.toLocaleString()}
              />
            </CardContent>
          </Card>
        )}

        {Object.keys(analytics.byPlatform).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance by Platform</CardTitle>
              <CardDescription>Distribution across publishing channels</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(analytics.byPlatform).map(([platform, data]) => ({
                  name: platform,
                  views: data.views,
                  engagement: data.engagement
                }))}
                categories={['views', 'engagement']}
                index="name"
                className="h-64"
                valueFormatter={(value) => value.toLocaleString()}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Performers */}
      {analytics.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
            <CardDescription>Best performing pieces in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topPerformers.map((performer, index) => (
                <div
                  key={performer.contentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{performer.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {performer.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {performer.engagement.toLocaleString()} engagements
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
