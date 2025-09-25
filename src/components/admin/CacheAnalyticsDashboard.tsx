import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCacheStats } from '@/hooks/useAdvancedCache';
import { formatBytes, formatNumber } from '@/lib/utils';
import { 
  RefreshCw, 
  Trash2, 
  TrendingUp, 
  Database,
  Clock,
  Zap
} from 'lucide-react';

export const CacheAnalyticsDashboard: React.FC = () => {
  const { stats, supabaseStats, clearAllCache, warmCache } = useCacheStats();

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cache? This will impact performance temporarily.')) {
      await clearAllCache();
    }
  };

  const handleWarmCache = async () => {
    // In a real app, you'd get the current user ID
    const userId = 'current-user-id';
    await warmCache(userId);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getCacheHealthColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-600';
    if (hitRate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cache Analytics</h2>
          <p className="text-muted-foreground">Monitor and manage cache performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleWarmCache} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Warm Cache
          </Button>
          <Button onClick={handleClearCache} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              <span className={getCacheHealthColor(stats.hitRate)}>
                {stats.hitRate.toFixed(1)}%
              </span>
            </div>
            <Progress value={stats.hitRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(stats.hits)} hits / {formatNumber(stats.hits + stats.misses)} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(stats.totalEntries)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all cache layers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatBytes(stats.memoryUsage)}
            </div>
            <Progress value={(stats.memoryUsage / (50 * 1024 * 1024)) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              of 50MB limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Cache</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {supabaseStats.queryCacheRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatNumber(supabaseStats.queryCacheHits)} / {formatNumber(supabaseStats.queryCount)} queries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cache Hits</span>
              <Badge variant="secondary">{formatNumber(stats.hits)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cache Misses</span>
              <Badge variant="outline">{formatNumber(stats.misses)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Storage Usage</span>
              <Badge variant="secondary">{formatBytes(stats.storageUsage)}</Badge>
            </div>
            {stats.lastClearTime && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Cleared</span>
                <Badge variant="outline">
                  {formatDuration(Date.now() - stats.lastClearTime)} ago
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Query Cache</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Queries</span>
              <Badge variant="secondary">{formatNumber(supabaseStats.queryCount)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Cached Queries</span>
              <Badge variant="secondary">{formatNumber(supabaseStats.queryCacheHits)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Hit Rate</span>
              <Badge 
                variant={supabaseStats.queryCacheRate >= 70 ? "default" : "destructive"}
              >
                {supabaseStats.queryCacheRate.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Performance</span>
              <Badge 
                variant={supabaseStats.queryCacheRate >= 70 ? "default" : "secondary"}
              >
                {supabaseStats.queryCacheRate >= 70 ? "Excellent" : "Needs Optimization"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Health Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.hitRate < 60 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Low Cache Hit Rate
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    Consider increasing cache TTL or warming frequently accessed data.
                  </p>
                </div>
              </div>
            )}
            
            {stats.memoryUsage > 40 * 1024 * 1024 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    High Memory Usage
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Memory cache is getting full. Consider clearing or optimizing cache entries.
                  </p>
                </div>
              </div>
            )}
            
            {stats.hitRate >= 80 && stats.memoryUsage < 30 * 1024 * 1024 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Excellent Cache Performance
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Your cache is performing optimally with great hit rates and efficient memory usage.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};