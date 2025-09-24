import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Database,
  Key,
  User
} from 'lucide-react';
import { serpPerformanceMonitoring } from '@/services/serpPerformanceMonitoring';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useSerpServiceStatus } from '@/hooks/useSerpServiceStatus';
import { EmptyDataState } from '@/components/content-builder/serp/EmptyDataState';

type ErrorType = 'no-auth' | 'no-api-keys' | 'api-error' | 'database-error' | 'no-data';

export const SerpPerformanceAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const serpStatus = useSerpServiceStatus();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Authentication required to view performance metrics');
        setErrorType('no-auth');
        return;
      }

      // Check API keys
      if (!serpStatus.hasProviders) {
        setError('No SERP API keys configured');
        setErrorType('no-api-keys');
        return;
      }

      // Load real metrics
      const data = await serpPerformanceMonitoring.getPerformanceMetrics();
      
      if (!data || Object.keys(data).length === 0) {
        setError('No performance data available');
        setErrorType('no-data');
        return;
      }

      setMetrics(data);
    } catch (error) {
      console.error('Error loading performance metrics:', error);
      setError('Failed to load performance metrics');
      setErrorType('api-error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8" />
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    const getErrorAction = () => {
      switch (errorType) {
        case 'no-auth':
          return {
            label: 'Sign In',
            onClick: () => window.location.href = '/auth'
          };
        case 'no-api-keys':
          return {
            label: 'Configure API Keys',
            onClick: () => window.location.href = '/settings/api-keys'
          };
        case 'api-error':
        case 'database-error':
          return {
            label: 'Retry',
            onClick: loadMetrics
          };
        default:
          return {
            label: 'Refresh',
            onClick: loadMetrics
          };
      }
    };

    const action = getErrorAction();

    return (
      <EmptyDataState
        variant={errorType === 'no-auth' ? 'api-error' : errorType === 'no-api-keys' ? 'api-error' : 'api-error'}
        title="Performance Analytics Unavailable"
        description={error}
        actionLabel={action.label}
        onAction={action.onClick}
      />
    );
  }

    return (
      <EmptyDataState
        variant="no-data"
        title="No Performance Data"
        description="No performance metrics available to display"
        actionLabel="Refresh"
        onAction={loadMetrics}
      />
    );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-bold">Performance Analytics</h2>
          <p className="text-muted-foreground">Real-time SERP service performance monitoring</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgResponseTime || 0}ms</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              {metrics.responseTimeTrend || 'No trend data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {metrics.cacheHitTrend || 'No trend data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls Today</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.apiCallsToday || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
              {metrics.apiCallsTrend || 'No trend data'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate || 0}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              {metrics.successRate >= 95 ? 'Excellent' : metrics.successRate >= 85 ? 'Good' : 'Needs attention'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <Tabs defaultValue="response-time" className="space-y-4">
        <TabsList>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="cache-performance">Cache Performance</TabsTrigger>
          <TabsTrigger value="api-usage">API Usage</TabsTrigger>
          <TabsTrigger value="health-status">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="response-time">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trends</CardTitle>
              <CardDescription>Average response time over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.performanceData && metrics.performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache-performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cache Hit Rate Distribution</CardTitle>
                <CardDescription>Current cache performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.cacheDistribution && metrics.cacheDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={metrics.cacheDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {metrics.cacheDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No cache data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Performance Trends</CardTitle>
                <CardDescription>Cache hit rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.performanceData && metrics.performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={metrics.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="cacheHits" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    No cache trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api-usage">
          <Card>
            <CardHeader>
              <CardTitle>API Usage Statistics</CardTitle>
              <CardDescription>API calls and error rates over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.apiUsageData && metrics.apiUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.apiUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calls" fill="hsl(var(--primary))" />
                    <Bar dataKey="errors" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No API usage data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health-status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health Status</CardTitle>
                <CardDescription>Current system performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response Health</span>
                      <Badge variant="secondary" className={
                        metrics.apiHealth >= 95 ? "bg-green-100 text-green-800" : 
                        metrics.apiHealth >= 85 ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {metrics.apiHealth >= 95 ? 'Excellent' : metrics.apiHealth >= 85 ? 'Good' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={metrics.apiHealth || 0} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cache Efficiency</span>
                      <Badge variant="secondary" className={
                        metrics.cacheEfficiency >= 90 ? "bg-green-100 text-green-800" : 
                        metrics.cacheEfficiency >= 70 ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {metrics.cacheEfficiency >= 90 ? 'Optimal' : metrics.cacheEfficiency >= 70 ? 'Good' : 'Poor'}
                      </Badge>
                    </div>
                    <Progress value={metrics.cacheEfficiency || 0} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Data Freshness</span>
                      <Badge variant="secondary" className={
                        metrics.dataFreshness >= 90 ? "bg-green-100 text-green-800" : 
                        metrics.dataFreshness >= 70 ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"
                      }>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {metrics.dataFreshness >= 90 ? 'Excellent' : metrics.dataFreshness >= 70 ? 'Good' : 'Stale'}
                      </Badge>
                    </div>
                    <Progress value={metrics.dataFreshness || 0} className="h-2" />
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>AI-powered optimization suggestions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.recommendations && metrics.recommendations.length > 0 ? (
                  metrics.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">No recommendations available</p>
                    <p className="text-xs">Performance metrics look good!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};