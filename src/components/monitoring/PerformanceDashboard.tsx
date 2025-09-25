import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Clock, Zap, Download, RefreshCw } from 'lucide-react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useToast } from '@/hooks/use-toast';

export const PerformanceDashboard: React.FC = () => {
  const { metrics, errors, generateReport, clearErrors, getMemoryUsage } = usePerformanceMonitoring();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate refresh
    getMemoryUsage();
    setIsRefreshing(false);
    toast({
      title: "Performance Data Refreshed",
      description: "Latest metrics have been updated"
    });
  };

  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Performance report has been saved to your downloads"
    });
  };

  const getPerformanceStatus = () => {
    const { pageLoadTime, errorCount, coreWebVitals } = metrics;
    
    if (errorCount > 5) return { status: 'critical', color: 'destructive' };
    if (pageLoadTime > 3000 || (coreWebVitals.lcp && coreWebVitals.lcp > 2500)) {
      return { status: 'warning', color: 'warning' };
    }
    return { status: 'good', color: 'success' };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor application performance and errors in real-time</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.pageLoadTime ? `${Math.round(metrics.pageLoadTime)}ms` : '--'}
            </div>
            <Badge 
              variant={metrics.pageLoadTime > 3000 ? 'destructive' : 'secondary'}
              className="mt-1"
            >
              {metrics.pageLoadTime > 3000 ? 'Slow' : 'Good'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorCount}</div>
            <Badge 
              variant={metrics.errorCount > 0 ? 'destructive' : 'secondary'}
              className="mt-1"
            >
              {metrics.errorCount > 0 ? 'Issues Found' : 'No Errors'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.networkRequests}</div>
            <p className="text-xs text-muted-foreground">Total requests made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.memoryUsage ? `${Math.round(metrics.memoryUsage * 100)}%` : '--'}
            </div>
            <Progress 
              value={metrics.memoryUsage ? metrics.memoryUsage * 100 : 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Largest Contentful Paint</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.coreWebVitals.lcp ? `${Math.round(metrics.coreWebVitals.lcp)}ms` : '--'}
                </div>
                <Badge 
                  variant={
                    !metrics.coreWebVitals.lcp ? 'secondary' :
                    metrics.coreWebVitals.lcp > 2500 ? 'destructive' : 'secondary'
                  }
                  className="mt-1"
                >
                  {!metrics.coreWebVitals.lcp ? 'Loading...' :
                   metrics.coreWebVitals.lcp > 2500 ? 'Needs Improvement' : 'Good'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">First Input Delay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.coreWebVitals.fid ? `${Math.round(metrics.coreWebVitals.fid)}ms` : '--'}
                </div>
                <Badge variant="secondary" className="mt-1">
                  {!metrics.coreWebVitals.fid ? 'No Interactions' : 'Good'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cumulative Layout Shift</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.coreWebVitals.cls ? metrics.coreWebVitals.cls.toFixed(3) : '--'}
                </div>
                <Badge 
                  variant={
                    !metrics.coreWebVitals.cls ? 'secondary' :
                    metrics.coreWebVitals.cls > 0.1 ? 'destructive' : 'secondary'
                  }
                  className="mt-1"
                >
                  {!metrics.coreWebVitals.cls ? 'Measuring...' :
                   metrics.coreWebVitals.cls > 0.1 ? 'Needs Improvement' : 'Good'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Response Times</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics.apiResponseTimes).length === 0 ? (
                <p className="text-muted-foreground">No API calls recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(metrics.apiResponseTimes).map(([apiName, time]) => (
                    <div key={apiName} className="flex items-center justify-between">
                      <span className="font-medium">{apiName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{Math.round(time)}ms</span>
                        <Badge 
                          variant={time > 2000 ? 'destructive' : 'secondary'}
                        >
                          {time > 2000 ? 'Slow' : 'Fast'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Errors</CardTitle>
              {errors.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearErrors}>
                  Clear Errors
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {errors.length === 0 ? (
                <p className="text-muted-foreground">No errors recorded</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {errors.slice(-10).reverse().map((error, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-destructive">{error.message}</span>
                        <span className="text-xs text-muted-foreground">
                          {error.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {error.stack && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer">Stack trace</summary>
                          <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};