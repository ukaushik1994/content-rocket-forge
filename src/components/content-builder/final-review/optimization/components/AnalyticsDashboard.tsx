import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Sparkles
} from 'lucide-react';
import { adaptivePromptService, FeedbackPattern } from '@/services/adaptivePromptService';
import { optimizationCache } from '@/services/optimizationCacheService';

interface AnalyticsData {
  successRates: { [category: string]: { successRate: number; totalOptimizations: number; avgRating: number } };
  feedbackPatterns: FeedbackPattern[];
  cacheStats: {
    totalEntries: number;
    memoryUsage: number;
    hitRate: number;
  };
  optimizationTrends: {
    daily: { date: string; count: number; avgRating: number }[];
    weekly: { week: string; count: number; avgRating: number }[];
  };
}

interface AnalyticsDashboardProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d';
}

export function AnalyticsDashboard({ className = '', timeRange = '30d' }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [successRates, feedbackPatterns, cacheStats] = await Promise.all([
        Promise.resolve(adaptivePromptService.getSuccessRateStats()),
        adaptivePromptService.analyzeFeedbackPatterns(),
        Promise.resolve(optimizationCache.getCacheStats())
      ]);

      // No trend data without real analytics service
      const optimizationTrends = {
        daily: [] as Array<{ date: string; count: number; avgRating: number }>,
        weekly: [] as Array<{ week: string; count: number; avgRating: number }>
      };

      setAnalyticsData({
        successRates,
        feedbackPatterns,
        cacheStats: {
          totalEntries: cacheStats.analysisEntries + cacheStats.optimizationEntries,
          memoryUsage: cacheStats.totalMemoryUsage,
          hitRate: 0 // No hit rate without real cache metrics
        },
        optimizationTrends
      });
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-500';
    if (rate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSuccessRateIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (rate >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Optimization Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Insights and performance metrics for content optimization
          </p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Brain className="h-3 w-3" />
          AI Learning Enabled
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Overall Success</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {Object.values(analyticsData.successRates).length > 0
                      ? Math.round(
                          Object.values(analyticsData.successRates).reduce((acc, curr) => acc + curr.successRate, 0) /
                          Object.values(analyticsData.successRates).length
                        )
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Average across all types</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Optimizations</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {Object.values(analyticsData.successRates).reduce((acc, curr) => acc + curr.totalOptimizations, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total this month</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Avg Rating</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {Object.values(analyticsData.successRates).length > 0
                      ? (
                          Object.values(analyticsData.successRates).reduce((acc, curr) => acc + curr.avgRating, 0) /
                          Object.values(analyticsData.successRates).length
                        ).toFixed(1)
                      : '0.0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Out of 5.0</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Cache Hit Rate</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">
                    {Math.round(analyticsData.cacheStats.hitRate * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Performance boost</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Rates by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Success Rate by Optimization Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.successRates).map(([category, stats]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getSuccessRateIcon(stats.successRate)}
                        <span className="text-sm font-medium capitalize">
                          {category.replace('_', ' ')} Optimization
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${getSuccessRateColor(stats.successRate)}`}>
                          {Math.round(stats.successRate)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stats.totalOptimizations} optimizations
                        </div>
                      </div>
                    </div>
                    <Progress value={stats.successRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimization Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Daily optimization activity over the last {timeRange}
                </div>
                
                {/* Simple trend visualization */}
                <div className="grid grid-cols-7 gap-1 h-20">
                  {analyticsData.optimizationTrends.daily.slice(-7).map((day, index) => (
                    <div key={index} className="flex flex-col justify-end">
                      <div 
                        className="bg-primary/60 rounded-sm"
                        style={{ height: `${(day.count / 25) * 100}%` }}
                        title={`${day.date}: ${day.count} optimizations, ${day.avgRating.toFixed(1)} avg rating`}
                      />
                      <div className="text-xs text-center mt-1 text-muted-foreground">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Learning Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.feedbackPatterns.length > 0 ? (
                  analyticsData.feedbackPatterns.map((pattern, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={pattern.feedbackType === 'positive' ? 'default' : 
                                        pattern.feedbackType === 'negative' ? 'destructive' : 'secondary'}>
                            {pattern.category}
                          </Badge>
                          <span className="text-sm">
                            Avg: {pattern.averageRating.toFixed(1)}/5
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {pattern.frequency} samples
                        </span>
                      </div>
                      
                      {pattern.successfulPatterns.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs font-medium text-green-600 mb-1">Success Patterns:</div>
                          <div className="text-xs text-muted-foreground">
                            {pattern.successfulPatterns.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      )}
                      
                      {pattern.commonIssues.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-red-600 mb-1">Common Issues:</div>
                          <div className="text-xs text-muted-foreground">
                            {pattern.commonIssues.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No learning data available yet. The AI will learn from user feedback.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cache Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {analyticsData.cacheStats.totalEntries}
                    </div>
                    <div className="text-xs text-muted-foreground">Cached Analyses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {(analyticsData.cacheStats.memoryUsage / 1024).toFixed(1)}KB
                    </div>
                    <div className="text-xs text-muted-foreground">Memory Used</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {Math.round(analyticsData.cacheStats.hitRate * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Hit Rate</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cache Efficiency</span>
                    <span className="text-xs text-muted-foreground">
                      Faster analysis for repeated content
                    </span>
                  </div>
                  <Progress value={analyticsData.cacheStats.hitRate * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}