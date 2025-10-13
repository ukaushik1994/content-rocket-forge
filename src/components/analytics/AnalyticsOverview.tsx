
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
import { motion } from 'framer-motion';
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
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl">
              <CardContent className="pt-8 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-5 bg-muted/30 rounded w-3/4"></div>
                  <div className="h-10 bg-muted/30 rounded w-1/2"></div>
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
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-xl"
              >
                <AlertCircle className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-amber-100">Analytics Setup Required</CardTitle>
                <CardDescription className="text-amber-200/70 mt-2">
                  Configure your Google Analytics and Search Console API keys to view analytics data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 hover:from-amber-500 hover:to-orange-500 shadow-lg" 
                onClick={() => openSettings('api')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure API Keys
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-500/10">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
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
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 backdrop-blur-xl rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-xl"
              >
                <BarChart3 className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-blue-100">No Analytics Data Available</CardTitle>
                <CardDescription className="text-blue-200/70 mt-2">
                  Publish your content and add published URLs to start tracking analytics data.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-8 p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Total Page Views</p>
                  <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {totalAnalytics.pageViews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                Google Analytics
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-8 p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Total Sessions</p>
                  <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {totalAnalytics.sessions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-400 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                Google Analytics
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-8 p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Search Impressions</p>
                  <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {totalSearchConsole.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                Search Console
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="pt-8 p-8 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2">Search Clicks</p>
                  <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {totalSearchConsole.clicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-400 shadow-lg">
                  <MousePointer className="h-7 w-7 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                Search Console
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300">
            <CardContent className="pt-8 p-8">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Avg. Bounce Rate</p>
              <p className="text-3xl font-bold text-foreground">{(avgBounceRate * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300">
            <CardContent className="pt-8 p-8">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Avg. Session Duration</p>
              <p className="text-3xl font-bold text-foreground">
                {Math.floor(avgSessionDuration / 60)}:{(avgSessionDuration % 60).toFixed(0).padStart(2, '0')}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300">
            <CardContent className="pt-8 p-8">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Avg. Click-through Rate</p>
              <p className="text-3xl font-bold text-foreground">{(avgCTR * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} whileHover={{ y: -8, scale: 1.02 }}>
          <Card className="bg-background/60 backdrop-blur-xl border-border/50 rounded-2xl hover:border-primary/40 transition-all duration-300">
            <CardContent className="pt-8 p-8">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Avg. Search Position</p>
              <p className="text-3xl font-bold text-foreground">{avgPosition.toFixed(1)}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};
