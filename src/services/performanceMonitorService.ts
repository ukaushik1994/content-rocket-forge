import { supabase } from '@/integrations/supabase/client';

export interface PerformanceData {
  ga4: {
    pageViews: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    engagementRate: number;
    newUsers: number;
    totalUsers: number;
  } | null;
  gsc: {
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
    topQueries: Array<{ query: string; clicks: number; impressions: number }>;
  } | null;
  psi: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    coreWebVitals: {
      LCP: { value: number; score: string };
      FID: { value: number; score: string };
      CLS: { value: number; score: string };
      TTFB: { value: number; score: string };
    };
    opportunities: Array<{ id: string; title: string; description: string; savings: number }>;
  } | null;
  heatmap: {
    scrollDepth: number;
    avgTimeOnPage: number;
    deadClicks: Array<{ selector: string; count: number }>;
    rageClicks: Array<{ selector: string; count: number }>;
    insights: Array<{ type: string; message: string; severity: string }>;
  } | null;
}

export interface ContentWithPerformance {
  id: string;
  title: string;
  publishedUrl: string;
  performanceData: PerformanceData;
  lastFetched: string | null;
  needsOptimization: boolean;
  optimizationPriority: 'high' | 'medium' | 'low' | null;
}

class PerformanceMonitorService {
  /**
   * Fetch all performance data for a specific content item
   */
  async fetchAllPerformanceData(
    contentId: string, 
    publishedUrl: string,
    userId: string
  ): Promise<PerformanceData> {
    const [ga4Result, gscResult, psiResult, heatmapResult] = await Promise.allSettled([
      this.fetchGA4Data(contentId, publishedUrl, userId),
      this.fetchGSCData(contentId, publishedUrl),
      this.fetchPageSpeedData(contentId, publishedUrl, userId),
      this.fetchHeatmapData(contentId, publishedUrl, userId)
    ]);

    return {
      ga4: ga4Result.status === 'fulfilled' ? ga4Result.value : null,
      gsc: gscResult.status === 'fulfilled' ? gscResult.value : null,
      psi: psiResult.status === 'fulfilled' ? psiResult.value : null,
      heatmap: heatmapResult.status === 'fulfilled' ? heatmapResult.value : null
    };
  }

  /**
   * Fetch Google Analytics 4 data
   */
  private async fetchGA4Data(contentId: string, publishedUrl: string, userId: string) {
    const { data, error } = await supabase.functions.invoke('google-analytics-fetch', {
      body: { contentId, publishedUrl, userId }
    });

    if (error) throw error;
    return data?.data || null;
  }

  /**
   * Fetch Google Search Console data
   */
  private async fetchGSCData(contentId: string, publishedUrl: string) {
    const { data, error } = await supabase.functions.invoke('search-console-fetch', {
      body: { contentId, publishedUrl }
    });

    if (error) throw error;
    return data?.data || null;
  }

  /**
   * Fetch PageSpeed Insights data
   */
  private async fetchPageSpeedData(contentId: string, publishedUrl: string, userId: string) {
    const { data, error } = await supabase.functions.invoke('pagespeed-insights', {
      body: { url: publishedUrl, contentId, userId }
    });

    if (error) throw error;
    return data?.data || null;
  }

  /**
   * Fetch heatmap data from Clarity/Hotjar
   */
  private async fetchHeatmapData(contentId: string, publishedUrl: string, userId: string) {
    const { data, error } = await supabase.functions.invoke('clarity-fetch', {
      body: { url: publishedUrl, userId }
    });

    if (error) throw error;
    return data?.data || null;
  }

  /**
   * Analyze performance data and determine if optimization is needed
   */
  analyzePerformance(data: PerformanceData): {
    needsOptimization: boolean;
    priority: 'high' | 'medium' | 'low' | null;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 0;

    // Check GA4 metrics
    if (data.ga4) {
      if (data.ga4.bounceRate > 0.7) {
        issues.push('High bounce rate (>70%)');
        score += 3;
      } else if (data.ga4.bounceRate > 0.5) {
        issues.push('Moderate bounce rate (>50%)');
        score += 1;
      }

      if (data.ga4.avgSessionDuration < 60) {
        issues.push('Low session duration (<1 min)');
        score += 2;
      }

      if (data.ga4.engagementRate < 0.4) {
        issues.push('Low engagement rate (<40%)');
        score += 2;
      }
    }

    // Check GSC metrics
    if (data.gsc) {
      if (data.gsc.averagePosition > 20) {
        issues.push('Poor search ranking (position >20)');
        score += 3;
      } else if (data.gsc.averagePosition > 10) {
        issues.push('Not on first page (position >10)');
        score += 1;
      }

      if (data.gsc.ctr < 0.02) {
        issues.push('Low CTR (<2%)');
        score += 2;
      }
    }

    // Check PageSpeed metrics
    if (data.psi) {
      if (data.psi.performance < 50) {
        issues.push('Poor performance score (<50)');
        score += 3;
      } else if (data.psi.performance < 90) {
        issues.push('Performance needs improvement');
        score += 1;
      }

      if (data.psi.coreWebVitals?.LCP?.score === 'poor') {
        issues.push('Poor LCP (slow loading)');
        score += 2;
      }

      if (data.psi.coreWebVitals?.CLS?.score === 'poor') {
        issues.push('Poor CLS (layout shifts)');
        score += 2;
      }
    }

    // Check heatmap metrics
    if (data.heatmap) {
      if (data.heatmap.scrollDepth < 0.3) {
        issues.push('Very low scroll depth (<30%)');
        score += 2;
      }

      if (data.heatmap.rageClicks && data.heatmap.rageClicks.length > 0) {
        issues.push(`${data.heatmap.rageClicks.length} rage click locations`);
        score += 2;
      }
    }

    // Determine priority
    let priority: 'high' | 'medium' | 'low' | null = null;
    if (score >= 6) priority = 'high';
    else if (score >= 3) priority = 'medium';
    else if (score >= 1) priority = 'low';

    return {
      needsOptimization: issues.length > 0,
      priority,
      issues
    };
  }

  /**
   * Request AI optimization for content based on performance data
   */
  async requestOptimization(
    contentId: string,
    currentContent: string,
    performanceData: PerformanceData,
    contentType: string = 'blog',
    targetKeywords: string[] = []
  ) {
    const { data, error } = await supabase.functions.invoke('content-optimizer', {
      body: {
        contentId,
        currentContent,
        performanceData: {
          ga4: performanceData.ga4 ? {
            bounceRate: performanceData.ga4.bounceRate,
            avgSessionDuration: performanceData.ga4.avgSessionDuration,
            engagementRate: performanceData.ga4.engagementRate,
            pageViews: performanceData.ga4.pageViews
          } : undefined,
          gsc: performanceData.gsc ? {
            avgPosition: performanceData.gsc.averagePosition,
            ctr: performanceData.gsc.ctr,
            impressions: performanceData.gsc.impressions,
            clicks: performanceData.gsc.clicks
          } : undefined,
          psi: performanceData.psi ? {
            performance: performanceData.psi.performance,
            lcp: performanceData.psi.coreWebVitals?.LCP?.value,
            cls: performanceData.psi.coreWebVitals?.CLS?.value,
            opportunities: performanceData.psi.opportunities
          } : undefined,
          heatmap: performanceData.heatmap ? {
            scrollDepth: performanceData.heatmap.scrollDepth,
            rageClicks: performanceData.heatmap.rageClicks,
            deadClicks: performanceData.heatmap.deadClicks,
            insights: performanceData.heatmap.insights
          } : undefined
        },
        contentType,
        targetKeywords
      }
    });

    if (error) throw error;
    return data?.data;
  }

  /**
   * Get historical performance data for a content item
   */
  async getPerformanceHistory(contentId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('page_performance_metrics')
      .select('*')
      .eq('content_id', contentId)
      .gte('measured_at', startDate.toISOString())
      .order('measured_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Get optimization history for a content item
   */
  async getOptimizationHistory(contentId: string) {
    const { data, error } = await supabase
      .from('content_optimization_history')
      .select('*')
      .eq('content_id', contentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Apply an optimization suggestion
   */
  async applyOptimization(optimizationId: string) {
    const { error } = await supabase
      .from('content_optimization_history')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString()
      })
      .eq('id', optimizationId);

    if (error) throw error;
  }

  /**
   * Reject an optimization suggestion
   */
  async rejectOptimization(optimizationId: string, reason?: string) {
    const { error } = await supabase
      .from('content_optimization_history')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', optimizationId);

    if (error) throw error;
  }
}

export const performanceMonitorService = new PerformanceMonitorService();
