
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  MousePointer, 
  TrendingUp, 
  Settings,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';

interface AnalyticsData {
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  newUsers: number;
  returningUsers: number;
  conversionRate: number;
  demographics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  lastUpdated: string;
}

interface SearchConsoleData {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
  }>;
  lastUpdated: string;
}

export const AnalyticsOverview = () => {
  const { user } = useAuth();
  const { openSettings } = useSettings();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [searchConsoleData, setSearchConsoleData] = useState<SearchConsoleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKeys, setHasApiKeys] = useState(false);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Check if user has configured Google Analytics and Search Console API keys
        const { data: apiKeys } = await supabase
          .from('api_keys')
          .select('service')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .in('service', ['google-analytics', 'google-search-console']);

        const hasAnalytics = apiKeys?.some(key => key.service === 'google-analytics');
        const hasSearchConsole = apiKeys?.some(key => key.service === 'google-search-console');
        setHasApiKeys(hasAnalytics || hasSearchConsole);

        if (!hasAnalytics && !hasSearchConsole) {
          setIsLoading(false);
          return;
        }

        // Fetch content analytics data
        const { data: contentAnalytics, error } = await supabase
          .from('content_analytics')
          .select(`
            analytics_data,
            search_console_data,
            content_items!inner(user_id, title, published_url)
          `)
          .eq('content_items.user_id', user.id)
          .not('analytics_data', 'is', null)
          .not('search_console_data', 'is', null);

        if (error) {
          console.error('Error fetching analytics:', error);
          toast.error('Failed to load analytics data');
          return;
        }

        if (contentAnalytics && contentAnalytics.length > 0) {
          const analytics = contentAnalytics
            .map(item => item.analytics_data)
            .filter(Boolean)
            .map(data => data as unknown as AnalyticsData);
          
          const searchData = contentAnalytics
            .map(item => item.search_console_data)
            .filter(Boolean)
            .map(data => data as unknown as SearchConsoleData);

          setAnalyticsData(analytics);
          setSearchConsoleData(searchData);
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-panel">
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-white/10 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hasApiKeys) {
    return (
      <div className="space-y-6">
        <Card className="glass-panel bg-amber-950/20 border-amber-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-400" />
              <div>
                <CardTitle className="text-amber-100">Analytics Setup Required</CardTitle>
                <CardDescription className="text-amber-200/70">
                  Configure your Google Analytics and Search Console API keys to view analytics data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="border-amber-500/30 hover:bg-amber-500/10" onClick={() => openSettings('api')}>
                <Settings className="h-4 w-4 mr-2" />
                Configure API Keys
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-amber-200/70 hover:text-amber-200"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Google API Keys
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (analyticsData.length === 0 && searchConsoleData.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="glass-panel bg-blue-950/20 border-blue-500/30">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-400" />
              <div>
                <CardTitle className="text-blue-100">No Analytics Data Available</CardTitle>
                <CardDescription className="text-blue-200/70">
                  Publish your content and add published URLs to start tracking analytics data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-200/60">
              Once you publish content and provide the published URLs, we'll automatically start 
              collecting Google Analytics and Search Console data for your content.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate data from all content items
  const totalAnalytics = analyticsData.reduce((acc, data) => ({
    pageViews: acc.pageViews + data.pageViews,
    sessions: acc.sessions + data.sessions,
    bounceRate: acc.bounceRate + data.bounceRate,
    avgSessionDuration: acc.avgSessionDuration + data.avgSessionDuration,
    newUsers: acc.newUsers + data.newUsers,
    returningUsers: acc.returningUsers + data.returningUsers,
  }), {
    pageViews: 0,
    sessions: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    newUsers: 0,
    returningUsers: 0,
  });

  const totalSearchConsole = searchConsoleData.reduce((acc, data) => ({
    impressions: acc.impressions + data.impressions,
    clicks: acc.clicks + data.clicks,
    ctr: acc.ctr + data.ctr,
    averagePosition: acc.averagePosition + data.averagePosition,
  }), {
    impressions: 0,
    clicks: 0,
    ctr: 0,
    averagePosition: 0,
  });

  // Calculate averages
  const avgBounceRate = analyticsData.length > 0 ? totalAnalytics.bounceRate / analyticsData.length : 0;
  const avgSessionDuration = analyticsData.length > 0 ? totalAnalytics.avgSessionDuration / analyticsData.length : 0;
  const avgCTR = searchConsoleData.length > 0 ? totalSearchConsole.ctr / searchConsoleData.length : 0;
  const avgPosition = searchConsoleData.length > 0 ? totalSearchConsole.averagePosition / searchConsoleData.length : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Page Views</p>
                <p className="text-2xl font-bold">{totalAnalytics.pageViews.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              Google Analytics
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalAnalytics.sessions.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              Google Analytics
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Search Impressions</p>
                <p className="text-2xl font-bold">{totalSearchConsole.impressions.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              Search Console
            </Badge>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Search Clicks</p>
                <p className="text-2xl font-bold">{totalSearchConsole.clicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-orange-500" />
            </div>
            <Badge variant="outline" className="mt-2">
              Search Console
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Avg. Bounce Rate</p>
            <p className="text-2xl font-bold">{(avgBounceRate * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Avg. Session Duration</p>
            <p className="text-2xl font-bold">{Math.floor(avgSessionDuration / 60)}:{(avgSessionDuration % 60).toFixed(0).padStart(2, '0')}</p>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Avg. Click-through Rate</p>
            <p className="text-2xl font-bold">{(avgCTR * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-glass">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Avg. Search Position</p>
            <p className="text-2xl font-bold">{avgPosition.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
