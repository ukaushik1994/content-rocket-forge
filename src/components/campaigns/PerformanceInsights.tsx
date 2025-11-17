import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceInsightsProps {
  campaignId: string;
}

interface Insight {
  type: 'success' | 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  action?: string;
}

export function PerformanceInsights({ campaignId }: PerformanceInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && campaignId) {
      generateInsights();
    }
  }, [campaignId, user]);

  const generateInsights = async () => {
    try {
      setLoading(true);

      // Fetch campaign analytics
      const { data: analytics } = await supabase
        .from('campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId);

      if (!analytics || analytics.length === 0) {
        setInsights([{
          type: 'info',
          title: 'No Data Yet',
          description: 'Start publishing content to see performance insights and recommendations.'
        }]);
        return;
      }

      const generatedInsights: Insight[] = [];

      // Calculate metrics
      const totalViews = analytics.reduce((sum, a) => sum + (a.views || 0), 0);
      const totalEngagement = analytics.reduce((sum, a) => sum + (a.engagement_count || 0), 0);
      const totalConversions = analytics.reduce((sum, a) => sum + (a.conversions || 0), 0);
      const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;
      const avgConversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;

      // Group by platform
      const byPlatform = analytics.reduce((acc: any, a) => {
        const platform = a.platform || 'unknown';
        if (!acc[platform]) acc[platform] = { views: 0, engagement: 0 };
        acc[platform].views += a.views || 0;
        acc[platform].engagement += a.engagement_count || 0;
        return acc;
      }, {});

      // Find best performing platform
      const platforms = Object.entries(byPlatform).map(([name, data]: [string, any]) => ({
        name,
        views: data.views,
        engagement: data.engagement,
        rate: data.views > 0 ? (data.engagement / data.views) * 100 : 0
      }));
      platforms.sort((a, b) => b.rate - a.rate);

      if (platforms.length > 1 && platforms[0].rate > platforms[1].rate * 1.3) {
        generatedInsights.push({
          type: 'success',
          title: `${platforms[0].name} is Your Top Platform`,
          description: `Content on ${platforms[0].name} gets ${(platforms[0].rate / platforms[1].rate).toFixed(1)}x better engagement. Focus more resources here.`,
          action: `Increase ${platforms[0].name} content by 30%`
        });
      }

      // Engagement rate insights
      if (avgEngagementRate > 5) {
        generatedInsights.push({
          type: 'success',
          title: 'Excellent Engagement Rate',
          description: `Your ${avgEngagementRate.toFixed(1)}% engagement rate is above industry average (3-4%). Keep up the great content!`
        });
      } else if (avgEngagementRate < 2) {
        generatedInsights.push({
          type: 'warning',
          title: 'Low Engagement Detected',
          description: `Your ${avgEngagementRate.toFixed(1)}% engagement rate is below average. Consider improving headlines, visuals, or content depth.`,
          action: 'A/B test different headline styles'
        });
      }

      // Conversion insights
      if (avgConversionRate > 2) {
        generatedInsights.push({
          type: 'success',
          title: 'Strong Conversion Performance',
          description: `Your ${avgConversionRate.toFixed(2)}% conversion rate shows effective CTAs and content alignment.`
        });
      } else if (avgConversionRate < 0.5) {
        generatedInsights.push({
          type: 'warning',
          title: 'Conversion Rate Needs Attention',
          description: `With only ${avgConversionRate.toFixed(2)}% conversion, review your CTAs, landing pages, and offer clarity.`,
          action: 'Test more prominent CTA placement'
        });
      }

      // Date-based insights (best performing days)
      const byDate = analytics.reduce((acc: any, a) => {
        const day = new Date(a.date).getDay();
        if (!acc[day]) acc[day] = { views: 0, count: 0 };
        acc[day].views += a.views || 0;
        acc[day].count += 1;
        return acc;
      }, {});

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bestDay = Object.entries(byDate)
        .map(([day, data]: [string, any]) => ({
          day: parseInt(day),
          avgViews: data.views / data.count
        }))
        .sort((a, b) => b.avgViews - a.avgViews)[0];

      if (bestDay && byDate[bestDay.day].count >= 2) {
        generatedInsights.push({
          type: 'info',
          title: `${dayNames[bestDay.day]}s Perform Best`,
          description: `Content published on ${dayNames[bestDay.day]}s gets ${bestDay.avgViews.toFixed(0)} average views. Schedule more content for this day.`,
          action: `Schedule 2-3 posts every ${dayNames[bestDay.day]}`
        });
      }

      // Check for underperforming content
      const avgViewsPerContent = totalViews / analytics.length;
      const underperforming = analytics.filter(a => (a.views || 0) < avgViewsPerContent * 0.3);
      
      if (underperforming.length > 0) {
        generatedInsights.push({
          type: 'critical',
          title: `${underperforming.length} Content Pieces Underperforming`,
          description: `These items are getting less than 30% of average views. Review and optimize or consider removing.`,
          action: 'Audit low-performing content'
        });
      }

      // General recommendation
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          type: 'info',
          title: 'Steady Performance',
          description: 'Your campaign is performing consistently. Continue monitoring and testing new approaches.',
          action: 'Experiment with new content formats'
        });
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([{
        type: 'critical',
        title: 'Unable to Generate Insights',
        description: 'There was an error analyzing your campaign data. Please try again later.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  const getVariant = (type: string): "default" | "destructive" => {
    return type === 'critical' ? 'destructive' : 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Performance Insights</CardTitle>
          <CardDescription>Analyzing your campaign data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Performance Insights
        </CardTitle>
        <CardDescription>
          Data-driven recommendations to optimize your campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <Alert key={index} variant={getVariant(insight.type)}>
            <div className="flex items-start gap-3">
              {getIcon(insight.type)}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <AlertDescription className="font-semibold text-foreground">
                    {insight.title}
                  </AlertDescription>
                  {insight.type === 'success' && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Winning
                    </Badge>
                  )}
                  {insight.type === 'warning' && (
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Needs Work
                    </Badge>
                  )}
                </div>
                <AlertDescription className="text-sm">
                  {insight.description}
                </AlertDescription>
                {insight.action && (
                  <div className="pt-2">
                    <Badge variant="secondary" className="text-xs">
                      💡 {insight.action}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
