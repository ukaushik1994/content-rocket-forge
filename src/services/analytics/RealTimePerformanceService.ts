import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  contentViews: number;
  engagementRate: number;
  seoScore: number;
  conversionRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface PredictiveInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: '1d' | '7d' | '30d';
  recommendation?: string;
}

interface PerformanceAlert {
  id: string;
  type: 'performance_drop' | 'opportunity' | 'trend_change' | 'goal_achieved';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  metrics: Partial<PerformanceMetrics>;
  timestamp: Date;
  actionRequired?: string;
}

interface ContentPerformanceData {
  contentId: string;
  title: string;
  publishedAt: Date;
  metrics: PerformanceMetrics;
  historicalData: Array<{
    date: Date;
    metrics: Partial<PerformanceMetrics>;
  }>;
  predictions: PredictiveInsight[];
}

export class RealTimePerformanceService {
  private userId: string | null = null;
  private performanceCache = new Map<string, ContentPerformanceData>();
  private alertsCache: PerformanceAlert[] = [];
  private subscriptions = new Map<string, any>();

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Real-time Performance Data
  async getRealtimePerformanceData(): Promise<{
    overview: PerformanceMetrics;
    topPerformers: ContentPerformanceData[];
    alerts: PerformanceAlert[];
    insights: PredictiveInsight[];
  }> {
    if (!this.userId) throw new Error('User not authenticated');

    try {
      const [overview, topPerformers, alerts] = await Promise.all([
        this.getOverviewMetrics(),
        this.getTopPerformingContent(),
        this.getPerformanceAlerts()
      ]);

      const insights = await this.generatePredictiveInsights(overview);

      return {
        overview,
        topPerformers,
        alerts,
        insights
      };
    } catch (error) {
      console.error('Error getting realtime performance data:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToPerformanceUpdates(callback: (data: any) => void) {
    if (!this.userId) return null;

    const channel = supabase
      .channel('performance-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_analytics'
        },
        async (payload) => {
          console.log('Performance update received:', payload);
          
          // Update cache and notify callback
          await this.refreshPerformanceCache();
          const data = await this.getRealtimePerformanceData();
          callback(data);
        }
      )
      .subscribe();

    this.subscriptions.set('performance', channel);
    return channel;
  }

  unsubscribeFromPerformanceUpdates() {
    const channel = this.subscriptions.get('performance');
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete('performance');
    }
  }

  // Predictive Analytics
  async generatePredictiveInsights(currentMetrics: PerformanceMetrics): Promise<PredictiveInsight[]> {
    try {
      // Get historical data for trend analysis
      const historicalData = await this.getHistoricalMetrics(30); // 30 days
      
      const insights: PredictiveInsight[] = [];

      // Predict content views trend
      const viewsTrend = this.calculateTrend(historicalData.map(d => d.metrics.contentViews || 0));
      if (viewsTrend.confidence > 0.6) {
        insights.push({
          metric: 'Content Views',
          currentValue: currentMetrics.contentViews,
          predictedValue: viewsTrend.nextValue,
          trend: viewsTrend.direction,
          confidence: viewsTrend.confidence,
          timeframe: '7d',
          recommendation: this.getRecommendationForTrend('views', viewsTrend.direction)
        });
      }

      // Predict engagement rate
      const engagementTrend = this.calculateTrend(historicalData.map(d => d.metrics.engagementRate || 0));
      if (engagementTrend.confidence > 0.6) {
        insights.push({
          metric: 'Engagement Rate',
          currentValue: currentMetrics.engagementRate,
          predictedValue: engagementTrend.nextValue,
          trend: engagementTrend.direction,
          confidence: engagementTrend.confidence,
          timeframe: '7d',
          recommendation: this.getRecommendationForTrend('engagement', engagementTrend.direction)
        });
      }

      // SEO score prediction
      const seoTrend = this.calculateTrend(historicalData.map(d => d.metrics.seoScore || 0));
      if (seoTrend.confidence > 0.6) {
        insights.push({
          metric: 'SEO Score',
          currentValue: currentMetrics.seoScore,
          predictedValue: seoTrend.nextValue,
          trend: seoTrend.direction,
          confidence: seoTrend.confidence,
          timeframe: '7d',
          recommendation: this.getRecommendationForTrend('seo', seoTrend.direction)
        });
      }

      return insights.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  }

  // Performance Alerts
  async getPerformanceAlerts(): Promise<PerformanceAlert[]> {
    if (this.alertsCache.length > 0) {
      return this.alertsCache;
    }

    try {
      const currentMetrics = await this.getOverviewMetrics();
      const historicalData = await this.getHistoricalMetrics(7); // 7 days
      
      const alerts: PerformanceAlert[] = [];

      // Performance drop detection
      if (historicalData.length > 3) {
        const recentAvg = this.calculateAverage(historicalData.slice(-3).map(d => d.metrics.contentViews || 0));
        const previousAvg = this.calculateAverage(historicalData.slice(-7, -3).map(d => d.metrics.contentViews || 0));
        
        if (recentAvg < previousAvg * 0.8) { // 20% drop
          alerts.push({
            id: `alert-${Date.now()}`,
            type: 'performance_drop',
            title: 'Content Views Declining',
            description: `Views have dropped ${Math.round(((previousAvg - recentAvg) / previousAvg) * 100)}% in the last 3 days`,
            severity: 'medium',
            metrics: { contentViews: recentAvg },
            timestamp: new Date(),
            actionRequired: 'Consider refreshing content strategy or promoting recent posts'
          });
        }
      }

      // SEO opportunity detection
      if (currentMetrics.seoScore < 70 && currentMetrics.seoScore > 50) {
        alerts.push({
          id: `seo-opp-${Date.now()}`,
          type: 'opportunity',
          title: 'SEO Improvement Opportunity',
          description: 'Your content has good potential but needs SEO optimization',
          severity: 'low',
          metrics: { seoScore: currentMetrics.seoScore },
          timestamp: new Date(),
          actionRequired: 'Run SEO analysis and optimize meta descriptions, headers'
        });
      }

      // High performance achievement
      if (currentMetrics.engagementRate > 8) { // Above 8% engagement
        alerts.push({
          id: `achievement-${Date.now()}`,
          type: 'goal_achieved',
          title: 'Excellent Engagement Rate!',
          description: `Your content is achieving ${currentMetrics.engagementRate.toFixed(1)}% engagement`,
          severity: 'low',
          metrics: { engagementRate: currentMetrics.engagementRate },
          timestamp: new Date()
        });
      }

      this.alertsCache = alerts;
      return alerts;
    } catch (error) {
      console.error('Error getting performance alerts:', error);
      return [];
    }
  }

  // A/B Testing Suggestions
  async generateABTestingSuggestions(): Promise<Array<{
    testName: string;
    hypothesis: string;
    variants: string[];
    expectedImpact: 'low' | 'medium' | 'high';
    duration: string;
  }>> {
    try {
      const currentMetrics = await this.getOverviewMetrics();
      const suggestions = [];

      // Title optimization test
      if (currentMetrics.contentViews < 1000) {
        suggestions.push({
          testName: 'Title Optimization',
          hypothesis: 'More compelling titles will increase click-through rates',
          variants: ['Original titles', 'Emotion-driven titles', 'Question-based titles'],
          expectedImpact: 'medium' as const,
          duration: '2 weeks'
        });
      }

      // Content length test
      if (currentMetrics.avgTimeOnPage < 120) { // Less than 2 minutes
        suggestions.push({
          testName: 'Content Length Optimization',
          hypothesis: 'Optimal content length will improve time on page and engagement',
          variants: ['Short form (500-800 words)', 'Medium form (800-1500 words)', 'Long form (1500+ words)'],
          expectedImpact: 'high' as const,
          duration: '3 weeks'
        });
      }

      // CTA placement test
      if (currentMetrics.conversionRate < 2) {
        suggestions.push({
          testName: 'Call-to-Action Placement',
          hypothesis: 'Strategic CTA placement will improve conversion rates',
          variants: ['Top of content', 'Middle of content', 'Multiple CTAs'],
          expectedImpact: 'medium' as const,
          duration: '2 weeks'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error generating A/B testing suggestions:', error);
      return [];
    }
  }

  // Content Success Forecasting
  async forecastContentSuccess(contentData: {
    title: string;
    keywords: string[];
    contentType: string;
    targetAudience: string;
  }): Promise<{
    successProbability: number;
    expectedViews: number;
    estimatedEngagement: number;
    recommendations: string[];
  }> {
    try {
      // Analyze similar content performance
      const similarContent = await this.findSimilarContent(contentData);
      
      let successProbability = 0.5; // Base probability
      let expectedViews = 500; // Base expectation
      let estimatedEngagement = 3; // Base engagement rate
      const recommendations = [];

      // Factor in keyword performance
      const keywordPerformance = await this.analyzeKeywordPerformance(contentData.keywords);
      if (keywordPerformance.avgScore > 70) {
        successProbability += 0.2;
        expectedViews *= 1.5;
        recommendations.push('Strong keyword selection detected');
      } else {
        recommendations.push('Consider researching high-performing keywords');
      }

      // Factor in content type performance
      if (similarContent.length > 0) {
        const avgViews = this.calculateAverage(similarContent.map(c => c.metrics.contentViews));
        const avgEngagement = this.calculateAverage(similarContent.map(c => c.metrics.engagementRate));
        
        expectedViews = Math.max(expectedViews, avgViews * 0.8); // Conservative estimate
        estimatedEngagement = Math.max(estimatedEngagement, avgEngagement * 0.8);
        
        if (avgViews > 1000) {
          successProbability += 0.15;
          recommendations.push(`${contentData.contentType} content performs well in your niche`);
        }
      }

      // Time-based factors
      const timeOfYear = new Date().getMonth();
      if ([10, 11, 0].includes(timeOfYear)) { // Holiday season
        successProbability += 0.1;
        recommendations.push('Publishing during high-engagement holiday period');
      }

      return {
        successProbability: Math.min(successProbability, 0.95), // Cap at 95%
        expectedViews: Math.round(expectedViews),
        estimatedEngagement: Math.round(estimatedEngagement * 10) / 10,
        recommendations
      };
    } catch (error) {
      console.error('Error forecasting content success:', error);
      return {
        successProbability: 0.5,
        expectedViews: 500,
        estimatedEngagement: 3.0,
        recommendations: ['Unable to generate forecast - create more content for better predictions']
      };
    }
  }

  // Private helper methods
  private async getOverviewMetrics(): Promise<PerformanceMetrics> {
    try {
      const { data } = await supabase
        .from('content_analytics')
        .select('analytics_data')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!data || data.length === 0) {
        return {
          contentViews: 0,
          engagementRate: 0,
          seoScore: 0,
          conversionRate: 0,
          avgTimeOnPage: 0,
          bounceRate: 0
        };
      }

      // Aggregate metrics
      const metrics = data.reduce((acc, item) => {
        const analytics = item.analytics_data as any;
        return {
          contentViews: acc.contentViews + (analytics.views || 0),
          engagementRate: acc.engagementRate + (analytics.engagement || 0),
          seoScore: acc.seoScore + (analytics.seo_score || 0),
          conversionRate: acc.conversionRate + (analytics.conversion || 0),
          avgTimeOnPage: acc.avgTimeOnPage + (analytics.time_on_page || 0),
          bounceRate: acc.bounceRate + (analytics.bounce_rate || 0)
        };
      }, {
        contentViews: 0,
        engagementRate: 0,
        seoScore: 0,
        conversionRate: 0,
        avgTimeOnPage: 0,
        bounceRate: 0
      });

      const count = data.length;
      return {
        contentViews: metrics.contentViews,
        engagementRate: Math.round((metrics.engagementRate / count) * 10) / 10,
        seoScore: Math.round(metrics.seoScore / count),
        conversionRate: Math.round((metrics.conversionRate / count) * 10) / 10,
        avgTimeOnPage: Math.round(metrics.avgTimeOnPage / count),
        bounceRate: Math.round((metrics.bounceRate / count) * 10) / 10
      };
    } catch (error) {
      console.error('Error getting overview metrics:', error);
      return {
        contentViews: 0,
        engagementRate: 0,
        seoScore: 0,
        conversionRate: 0,
        avgTimeOnPage: 0,
        bounceRate: 0
      };
    }
  }

  private async getTopPerformingContent(): Promise<ContentPerformanceData[]> {
    try {
      const { data } = await supabase
        .from('content_items')
        .select(`
          id, title, created_at,
          content_analytics (analytics_data)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!data) return [];

      return data
        .filter(item => item.content_analytics && item.content_analytics.length > 0)
        .map(item => {
          const analytics = item.content_analytics[0].analytics_data as any;
          return {
            contentId: item.id,
            title: item.title,
            publishedAt: new Date(item.created_at),
            metrics: {
              contentViews: analytics.views || 0,
              engagementRate: analytics.engagement || 0,
              seoScore: analytics.seo_score || 0,
              conversionRate: analytics.conversion || 0,
              avgTimeOnPage: analytics.time_on_page || 0,
              bounceRate: analytics.bounce_rate || 0
            },
            historicalData: [],
            predictions: []
          };
        });
    } catch (error) {
      console.error('Error getting top performing content:', error);
      return [];
    }
  }

  private async getHistoricalMetrics(days: number): Promise<Array<{
    date: Date;
    metrics: PerformanceMetrics;
  }>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data } = await supabase
        .from('content_analytics')
        .select('created_at, analytics_data')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (!data) return [];

      return data.map(item => ({
        date: new Date(item.created_at),
        metrics: {
          contentViews: (item.analytics_data as any).views || 0,
          engagementRate: (item.analytics_data as any).engagement || 0,
          seoScore: (item.analytics_data as any).seo_score || 0,
          conversionRate: (item.analytics_data as any).conversion || 0,
          avgTimeOnPage: (item.analytics_data as any).time_on_page || 0,
          bounceRate: (item.analytics_data as any).bounce_rate || 0
        }
      }));
    } catch (error) {
      console.error('Error getting historical metrics:', error);
      return [];
    }
  }

  private calculateTrend(values: number[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    nextValue: number;
    confidence: number;
  } {
    if (values.length < 3) {
      return { direction: 'stable', nextValue: values[values.length - 1] || 0, confidence: 0 };
    }

    // Simple linear regression
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextValue = slope * n + intercept;
    
    // Calculate confidence based on how well the trend fits
    const predictions = x.map(xi => slope * xi + intercept);
    const errors = y.map((yi, i) => Math.abs(yi - predictions[i]));
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    const avgValue = y.reduce((a, b) => a + b, 0) / y.length;
    const confidence = Math.max(0, 1 - (avgError / avgValue));

    const direction = Math.abs(slope) < 0.1 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing';

    return {
      direction,
      nextValue: Math.max(0, nextValue),
      confidence: Math.min(1, confidence)
    };
  }

  private calculateAverage(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private getRecommendationForTrend(metric: string, trend: string): string {
    const recommendations: Record<string, Record<string, string>> = {
      views: {
        increasing: 'Great momentum! Consider increasing publishing frequency.',
        decreasing: 'Focus on content promotion and SEO optimization.',
        stable: 'Try experimenting with new content formats or topics.'
      },
      engagement: {
        increasing: 'Your audience is responding well. Continue this content style.',
        decreasing: 'Review recent content for engagement opportunities.',
        stable: 'Consider adding more interactive elements to your content.'
      },
      seo: {
        increasing: 'SEO efforts are paying off. Maintain current optimization strategy.',
        decreasing: 'Review and update meta descriptions, headers, and keywords.',
        stable: 'Consider targeting new keywords or improving page speed.'
      }
    };

    return recommendations[metric]?.[trend] || 'Monitor this metric closely for changes.';
  }

  private async findSimilarContent(contentData: any): Promise<ContentPerformanceData[]> {
    // Implementation would find content with similar keywords/type
    return []; // Simplified for now
  }

  private async analyzeKeywordPerformance(keywords: string[]): Promise<{ avgScore: number }> {
    // Implementation would analyze keyword performance
    return { avgScore: 65 }; // Simplified for now
  }

  private async refreshPerformanceCache(): Promise<void> {
    // Clear cache to force refresh on next request
    this.performanceCache.clear();
    this.alertsCache = [];
  }
}

// Export singleton instance
export const realTimePerformanceService = new RealTimePerformanceService();