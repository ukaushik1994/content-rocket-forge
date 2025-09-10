import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  Cpu,
  Database,
  Globe,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Users,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';
import { toast } from 'sonner';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold: {
    warning: number;
    critical: number;
  };
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface SystemHealth {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  database: {
    connections: number;
    responseTime: number;
    throughput: number;
  };
  cache: {
    hitRate: number;
    size: number;
    evictions: number;
  };
}

interface UserMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  concurrentUsers: number;
}

export const PerformanceMonitor: React.FC = () => {
  const { hasPermission, auditLog } = useEnterpriseRBAC();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (hasPermission('performance', 'read')) {
      loadPerformanceData();
    }
  }, [hasPermission]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh && hasPermission('performance', 'read')) {
      interval = setInterval(() => {
        loadPerformanceData();
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, hasPermission]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API calls to monitoring service
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock performance metrics
      const mockMetrics: PerformanceMetric[] = [
        {
          id: 'response-time',
          name: 'API Response Time',
          value: 145 + Math.random() * 50,
          unit: 'ms',
          trend: Math.random() > 0.5 ? 'up' : 'down',
          threshold: { warning: 200, critical: 500 },
          history: generateTimeSeriesData(24)
        },
        {
          id: 'throughput',
          name: 'Requests per Second',
          value: 850 + Math.random() * 200,
          unit: 'req/s',
          trend: Math.random() > 0.3 ? 'up' : 'stable',
          threshold: { warning: 1000, critical: 1200 },
          history: generateTimeSeriesData(24)
        },
        {
          id: 'error-rate',
          name: 'Error Rate',
          value: Math.random() * 2,
          unit: '%',
          trend: Math.random() > 0.7 ? 'down' : 'stable',
          threshold: { warning: 2, critical: 5 },
          history: generateTimeSeriesData(24)
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: 65 + Math.random() * 20,
          unit: '%',
          trend: Math.random() > 0.6 ? 'up' : 'stable',
          threshold: { warning: 80, critical: 90 },
          history: generateTimeSeriesData(24)
        }
      ];

      const mockSystemHealth: SystemHealth = {
        cpu: 45 + Math.random() * 30,
        memory: 62 + Math.random() * 25,
        disk: 38 + Math.random() * 20,
        network: 78 + Math.random() * 15,
        database: {
          connections: Math.floor(45 + Math.random() * 20),
          responseTime: 12 + Math.random() * 8,
          throughput: 2400 + Math.random() * 600
        },
        cache: {
          hitRate: 85 + Math.random() * 12,
          size: 156 + Math.random() * 50,
          evictions: Math.floor(Math.random() * 10)
        }
      };

      const mockUserMetrics: UserMetrics = {
        activeUsers: Math.floor(1200 + Math.random() * 300),
        totalSessions: Math.floor(5600 + Math.random() * 1000),
        averageSessionDuration: 8.5 + Math.random() * 3,
        bounceRate: 25 + Math.random() * 15,
        concurrentUsers: Math.floor(180 + Math.random() * 50)
      };

      setPerformanceMetrics(mockMetrics);
      setSystemHealth(mockSystemHealth);
      setUserMetrics(mockUserMetrics);

      await auditLog('performance_data_loaded', 'performance', { timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeSeriesData = (hours: number) => {
    const data = [];
    for (let i = hours; i >= 0; i--) {
      data.push({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: Math.random() * 100
      });
    }
    return data;
  };

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value >= metric.threshold.critical) return 'critical';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const optimizePerformance = async (action: string) => {
    if (!hasPermission('performance', 'optimize')) {
      toast.error('You do not have permission to optimize performance');
      return;
    }

    try {
      // Simulate performance optimization actions
      toast.info(`Starting ${action}...`);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await auditLog('performance_optimization', 'performance', { action, timestamp: new Date().toISOString() });
      toast.success(`${action} completed successfully`);
      
      // Refresh data after optimization
      setTimeout(() => loadPerformanceData(), 3000);
    } catch (error) {
      console.error('Error optimizing performance:', error);
      toast.error(`Failed to execute ${action}`);
    }
  };

  if (!hasPermission('performance', 'read')) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view performance monitoring.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">
            Real-time system performance and health monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50' : ''}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
          <Button onClick={loadPerformanceData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric) => {
          const status = getMetricStatus(metric);
          const StatusIcon = status === 'critical' ? AlertTriangle : status === 'warning' ? Clock : CheckCircle;
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(status)}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold">
                        {metric.value.toFixed(metric.unit === '%' || metric.unit === 'ms' ? 0 : 1)}
                        <span className="text-sm font-normal ml-1">{metric.unit}</span>
                      </p>
                    </div>
                  </div>
                  <TrendIcon className={`h-4 w-4 ${
                    metric.trend === 'up' ? 'text-red-500' : 
                    metric.trend === 'down' ? 'text-green-500' : 
                    'text-gray-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-4">
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>CPU Usage</span>
                      <span>{systemHealth.cpu.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemHealth.cpu} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Usage</span>
                      <span>{systemHealth.memory.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemHealth.memory} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disk Usage</span>
                      <span>{systemHealth.disk.toFixed(1)}%</span>
                    </div>
                    <Progress value={systemHealth.disk} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network I/O</span>
                      <span>{systemHealth.network.toFixed(1)} MB/s</span>
                    </div>
                    <Progress value={(systemHealth.network / 100) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Cache Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hit Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {systemHealth.cache.hitRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cache Size</p>
                      <p className="text-2xl font-bold">
                        {systemHealth.cache.size.toFixed(0)} MB
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Evictions (last hour)</p>
                    <p className="text-lg font-medium">{systemHealth.cache.evictions}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          {systemHealth && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Active Connections</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {systemHealth.database.connections}
                    </p>
                    <p className="text-xs text-muted-foreground">of 100 max</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-3xl font-bold text-green-600">
                      {systemHealth.database.responseTime.toFixed(1)}ms
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Throughput</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {systemHealth.database.throughput.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">queries/sec</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {userMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{userMetrics.activeUsers.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Active Users (24h)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{userMetrics.concurrentUsers}</p>
                      <p className="text-xs text-muted-foreground">Concurrent Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{userMetrics.averageSessionDuration.toFixed(1)}m</p>
                      <p className="text-xs text-muted-foreground">Avg Session Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>User Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="text-xl font-bold">{userMetrics.totalSessions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bounce Rate</p>
                      <p className="text-xl font-bold">{userMetrics.bounceRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pages per Session</p>
                      <p className="text-xl font-bold">4.7</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-xl font-bold">12.3%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Optimizations</CardTitle>
                <CardDescription>
                  Run automated performance improvements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => optimizePerformance('Cache Cleanup')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Clear Expired Cache
                </Button>
                <Button 
                  onClick={() => optimizePerformance('Database Optimization')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Optimize Database Queries
                </Button>
                <Button 
                  onClick={() => optimizePerformance('Memory Cleanup')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Cpu className="mr-2 h-4 w-4" />
                  Free Unused Memory
                </Button>
                <Button 
                  onClick={() => optimizePerformance('CDN Purge')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Purge CDN Cache
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Recommendations</CardTitle>
                <CardDescription>
                  AI-powered performance suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Database response time is within optimal range (12ms avg)
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Consider enabling gzip compression to reduce bandwidth usage
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Cache hit rate is excellent at {systemHealth?.cache.hitRate.toFixed(1)}%
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};