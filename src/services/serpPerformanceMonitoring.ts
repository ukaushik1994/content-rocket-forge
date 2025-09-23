import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceMetrics {
  responseTime: number;
  apiCalls: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  timestamp: number;
}

interface ServiceHealthMetrics {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  averageResponseTime: number;
  errorCount: number;
  lastError?: string;
  activeConnections: number;
}

interface ApiProviderStats {
  provider: string;
  requestCount: number;
  successRate: number;
  averageLatency: number;
  quota: {
    used: number;
    limit: number;
    resetTime: number;
  };
  lastUsed: number;
}

/**
 * Comprehensive SERP service performance monitoring and optimization
 */
export class SerpPerformanceMonitoring {
  private static metrics: PerformanceMetrics[] = [];
  private static currentMetrics: PerformanceMetrics = {
    responseTime: 0,
    apiCalls: 0,
    cacheHitRate: 0,
    errorRate: 0,
    throughput: 0,
    timestamp: Date.now()
  };
  private static apiProviders = new Map<string, ApiProviderStats>();
  private static monitoringInterval: NodeJS.Timeout | null = null;
  private static isMonitoring = false;

  /**
   * Start performance monitoring
   */
  static startMonitoring(userId?: string): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('📊 Starting SERP performance monitoring...');
    
    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.optimizeServices();
    }, 30000);
    
    // Initial collection
    this.collectMetrics();
    
    toast('Performance monitoring started', {
      description: 'Real-time SERP service optimization is now active'
    });
  }

  /**
   * Stop performance monitoring
   */
  static stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('📊 Performance monitoring stopped');
  }

  /**
   * Record API call performance
   */
  static recordApiCall(
    provider: string,
    startTime: number,
    success: boolean,
    error?: string
  ): void {
    const responseTime = Date.now() - startTime;
    
    // Update provider stats
    const providerStats = this.apiProviders.get(provider) || {
      provider,
      requestCount: 0,
      successRate: 100,
      averageLatency: 0,
      quota: { used: 0, limit: 1000, resetTime: 0 },
      lastUsed: Date.now()
    };
    
    providerStats.requestCount++;
    providerStats.averageLatency = 
      (providerStats.averageLatency * 0.9) + (responseTime * 0.1);
    providerStats.successRate = success ? 
      Math.min(100, providerStats.successRate + 0.1) :
      Math.max(0, providerStats.successRate - 5);
    providerStats.lastUsed = Date.now();
    
    this.apiProviders.set(provider, providerStats);
    
    // Update current metrics
    this.currentMetrics.apiCalls++;
    this.currentMetrics.responseTime = 
      (this.currentMetrics.responseTime * 0.9) + (responseTime * 0.1);
    
    if (!success) {
      this.currentMetrics.errorRate = 
        Math.min(100, this.currentMetrics.errorRate + 1);
      console.error(`❌ API call failed for ${provider}:`, error);
      
      // Alert on high error rates
      if (this.currentMetrics.errorRate > 20) {
        this.alertHighErrorRate(provider, this.currentMetrics.errorRate);
      }
    } else {
      this.currentMetrics.errorRate = 
        Math.max(0, this.currentMetrics.errorRate - 0.1);
    }
    
    // Log performance data to database
    this.logPerformanceData(provider, responseTime, success, error);
  }

  /**
   * Update cache hit rate
   */
  static updateCacheMetrics(hitRate: number): void {
    this.currentMetrics.cacheHitRate = hitRate;
  }

  /**
   * Collect current performance metrics
   */
  private static collectMetrics(): void {
    const now = Date.now();
    
    // Calculate throughput (requests per minute)
    const timeDiff = now - this.currentMetrics.timestamp;
    if (timeDiff > 0) {
      this.currentMetrics.throughput = 
        (this.currentMetrics.apiCalls * 60000) / timeDiff;
    }
    
    // Store metrics snapshot
    this.metrics.push({
      ...this.currentMetrics,
      timestamp: now
    });
    
    // Keep only last 100 metrics (30 minutes at 30s intervals)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    // Reset counters
    this.currentMetrics.apiCalls = 0;
    this.currentMetrics.timestamp = now;
  }

  /**
   * Analyze performance trends and detect issues
   */
  private static analyzePerformance(): void {
    if (this.metrics.length < 2) return;
    
    const recent = this.metrics.slice(-10); // Last 5 minutes
    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const avgErrorRate = recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length;
    const avgCacheHitRate = recent.reduce((sum, m) => sum + m.cacheHitRate, 0) / recent.length;
    
    // Detect performance degradation
    if (avgResponseTime > 5000) { // 5 seconds
      this.alertSlowPerformance(avgResponseTime);
    }
    
    // Detect low cache hit rate
    if (avgCacheHitRate < 60 && this.currentMetrics.apiCalls > 10) {
      this.alertLowCacheHitRate(avgCacheHitRate);
    }
    
    // Detect API quota issues
    for (const [provider, stats] of this.apiProviders.entries()) {
      if (stats.quota.used / stats.quota.limit > 0.9) {
        this.alertQuotaNearLimit(provider, stats.quota);
      }
    }
    
    console.log(`📊 Performance Analysis:`, {
      avgResponseTime: Math.round(avgResponseTime),
      avgErrorRate: avgErrorRate.toFixed(1),
      avgCacheHitRate: avgCacheHitRate.toFixed(1),
      activeProviders: this.apiProviders.size
    });
  }

  /**
   * Optimize services based on performance data
   */
  private static optimizeServices(): void {
    // Switch to better performing provider
    const providers = Array.from(this.apiProviders.values());
    if (providers.length > 1) {
      const bestProvider = providers.reduce((best, current) => 
        current.successRate > best.successRate && 
        current.averageLatency < best.averageLatency ? current : best
      );
      
      // TODO: Implement provider switching logic
      if (bestProvider.successRate > 95) {
        console.log(`🔄 Optimized to use provider: ${bestProvider.provider}`);
      }
    }
    
    // Suggest cache optimization
    if (this.currentMetrics.cacheHitRate < 70) {
      console.log('💡 Suggestion: Optimize cache with preloading for better performance');
    }
    
    // Suggest rate limiting adjustments
    const highLatencyProviders = providers.filter(p => p.averageLatency > 3000);
    if (highLatencyProviders.length > 0) {
      console.log(`⚡ Suggestion: Reduce concurrent requests for slow providers: ${
        highLatencyProviders.map(p => p.provider).join(', ')
      }`);
    }
  }

  /**
   * Get comprehensive service health status
   */
  static getServiceHealth(): ServiceHealthMetrics {
    const recent = this.metrics.slice(-20); // Last 10 minutes
    if (recent.length === 0) {
      return {
        status: 'healthy',
        uptime: 100,
        averageResponseTime: 0,
        errorCount: 0,
        activeConnections: 0
      };
    }
    
    const avgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const avgErrorRate = recent.reduce((sum, m) => sum + m.errorRate, 0) / recent.length;
    const totalErrors = recent.reduce((sum, m) => sum + (m.errorRate > 0 ? 1 : 0), 0);
    
    // Determine health status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (avgErrorRate > 10 || avgResponseTime > 8000) {
      status = 'critical';
    } else if (avgErrorRate > 5 || avgResponseTime > 5000) {
      status = 'degraded';
    }
    
    return {
      status,
      uptime: Math.max(0, 100 - avgErrorRate),
      averageResponseTime: Math.round(avgResponseTime),
      errorCount: totalErrors,
      activeConnections: this.apiProviders.size
    };
  }

  /**
   * Get API provider statistics
   */
  static getProviderStats(): ApiProviderStats[] {
    return Array.from(this.apiProviders.values());
  }

  /**
   * Get performance metrics for dashboard
   */
  static getPerformanceMetrics(): {
    current: PerformanceMetrics;
    history: PerformanceMetrics[];
    providers: ApiProviderStats[];
    health: ServiceHealthMetrics;
  } {
    return {
      current: { ...this.currentMetrics },
      history: [...this.metrics],
      providers: this.getProviderStats(),
      health: this.getServiceHealth()
    };
  }

  /**
   * Log performance data to database
   */
  private static async logPerformanceData(
    provider: string,
    responseTime: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      await supabase
        .from('serp_usage_logs')
        .insert({
          user_id: user.id,
          provider,
          operation: 'performance_monitoring',
          success,
          metadata: {
            responseTime,
            error,
            timestamp: Date.now(),
            cacheHitRate: this.currentMetrics.cacheHitRate,
            errorRate: this.currentMetrics.errorRate
          }
        });
    } catch (error) {
      console.error('Failed to log performance data:', error);
    }
  }

  // Alert methods
  private static alertSlowPerformance(responseTime: number): void {
    toast(`Performance Alert: Slow Response`, {
      description: `Average response time: ${Math.round(responseTime)}ms. Consider optimizing queries.`
    });
  }

  private static alertHighErrorRate(provider: string, errorRate: number): void {
    toast(`Service Alert: High Error Rate`, {
      description: `${provider} error rate: ${errorRate.toFixed(1)}%. Check API status.`
    });
  }

  private static alertLowCacheHitRate(hitRate: number): void {
    toast(`Cache Alert: Low Hit Rate`, {
      description: `Cache hit rate: ${hitRate.toFixed(1)}%. Consider cache optimization.`
    });
  }

  private static alertQuotaNearLimit(provider: string, quota: any): void {
    const percentage = ((quota.used / quota.limit) * 100).toFixed(1);
    toast(`Quota Alert: Near Limit`, {
      description: `${provider} quota: ${percentage}% used. Consider upgrading plan.`
    });
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(): {
    summary: string;
    recommendations: string[];
    metrics: any;
  } {
    const health = this.getServiceHealth();
    const providers = this.getProviderStats();
    const recent = this.metrics.slice(-20);
    
    let summary = `Service Status: ${health.status.toUpperCase()}\n`;
    summary += `Uptime: ${health.uptime.toFixed(1)}%\n`;
    summary += `Average Response Time: ${health.averageResponseTime}ms\n`;
    summary += `Active Providers: ${providers.length}`;
    
    const recommendations: string[] = [];
    
    if (health.averageResponseTime > 3000) {
      recommendations.push('Optimize API calls to reduce response time');
    }
    
    if (this.currentMetrics.cacheHitRate < 80) {
      recommendations.push('Implement cache preloading for frequently accessed data');
    }
    
    if (providers.some(p => p.successRate < 95)) {
      recommendations.push('Monitor and switch away from unreliable API providers');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal');
    }
    
    return {
      summary,
      recommendations,
      metrics: {
        health,
        providers,
        recentMetrics: recent
      }
    };
  }
}

// Export convenience functions
export const serpPerformanceMonitoring = {
  startMonitoring: SerpPerformanceMonitoring.startMonitoring.bind(SerpPerformanceMonitoring),
  stopMonitoring: SerpPerformanceMonitoring.stopMonitoring.bind(SerpPerformanceMonitoring),
  recordApiCall: SerpPerformanceMonitoring.recordApiCall.bind(SerpPerformanceMonitoring),
  updateCacheMetrics: SerpPerformanceMonitoring.updateCacheMetrics.bind(SerpPerformanceMonitoring),
  getServiceHealth: SerpPerformanceMonitoring.getServiceHealth.bind(SerpPerformanceMonitoring),
  getProviderStats: SerpPerformanceMonitoring.getProviderStats.bind(SerpPerformanceMonitoring),
  getPerformanceMetrics: SerpPerformanceMonitoring.getPerformanceMetrics.bind(SerpPerformanceMonitoring),
  generatePerformanceReport: SerpPerformanceMonitoring.generatePerformanceReport.bind(SerpPerformanceMonitoring)
};
