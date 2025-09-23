import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Settings, 
  LogIn, 
  RefreshCw,
  Activity,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useSerpMonitoring } from '@/hooks/useSerpMonitoring';
import { useSettings } from '@/contexts/SettingsContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SerpMetricsOverview = () => {
  const { metrics, recentCalls, isLoading, error, refreshMetrics } = useSerpMonitoring();
  const { openSettings } = useSettings();

  const handleOpenApiSettings = () => {
    openSettings('api');
  };

  const handleRetry = () => {
    refreshMetrics();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (error) {
    const getErrorContent = () => {
      switch (error.type) {
        case 'no-auth':
          return {
            icon: <LogIn className="h-12 w-12 text-primary" />,
            title: 'Authentication Required',
            description: error.message,
            action: (
              <Button onClick={() => window.location.href = '/login'}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )
          };
        case 'no-api-keys':
          return {
            icon: <Settings className="h-12 w-12 text-warning" />,
            title: 'API Configuration Required',
            description: error.message,
            action: (
              <Button onClick={handleOpenApiSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Configure API Keys
              </Button>
            )
          };
        case 'database-error':
        case 'api-error':
          return {
            icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
            title: 'Service Error',
            description: error.message,
            action: (
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )
          };
        case 'no-data':
          return {
            icon: <Activity className="h-12 w-12 text-muted-foreground" />,
            title: 'No Data Available',
            description: error.message,
            action: null
          };
        default:
          return {
            icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
            title: 'Unknown Error',
            description: 'An unexpected error occurred',
            action: (
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )
          };
      }
    };

    const errorContent = getErrorContent();

    return (
      <div className="space-y-6">
        <Card className="border-muted">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center py-8">
              {errorContent.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{errorContent.title}</h3>
              <p className="text-muted-foreground mb-6 max-w-md">{errorContent.description}</p>
              {errorContent.action}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">SERP API Metrics</h2>
          <p className="text-muted-foreground">Real-time monitoring of SERP API usage and performance</p>
        </div>
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-semibold text-foreground">{metrics.totalRequests}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-semibold text-foreground">
                  {metrics.totalRequests > 0 ? Math.round(((metrics.successfulRequests / metrics.totalRequests) * 100)) : 0}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-semibold text-foreground">{metrics.averageResponseTime}ms</p>
              </div>
              <Clock className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-semibold text-foreground">{metrics.errorRate.toFixed(1)}%</p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${metrics.errorRate > 10 ? 'text-destructive' : 'text-warning'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provider Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Performance</CardTitle>
            <CardDescription>API performance by provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">SERP API</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.providerStats.serp.requests} requests • {metrics.providerStats.serp.avgTime}ms avg
                  </p>
                </div>
                <Badge variant={metrics.providerStats.serp.errors > 0 ? 'destructive' : 'default'}>
                  {metrics.providerStats.serp.errors} errors
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">SerpStack</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.providerStats.serpstack.requests} requests • {metrics.providerStats.serpstack.avgTime}ms avg
                  </p>
                </div>
                <Badge variant={metrics.providerStats.serpstack.errors > 0 ? 'destructive' : 'default'}>
                  {metrics.providerStats.serpstack.errors} errors
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>Request volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.dailyUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={metrics.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Requests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Errors"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No usage data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent API Calls */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Calls</CardTitle>
          <CardDescription>Latest SERP API requests and responses</CardDescription>
        </CardHeader>
        <CardContent>
          {recentCalls.length > 0 ? (
            <div className="space-y-2">
              {recentCalls.slice(0, 10).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={call.status === 'success' ? 'default' : 'destructive'}>
                      {call.provider}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{call.keyword}</p>
                      <p className="text-xs text-muted-foreground">
                        {call.endpoint} • {call.responseTime}ms
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(call.timestamp).toLocaleString()}
                    </p>
                    {call.error && (
                      <p className="text-xs text-destructive">{call.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent API calls</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};