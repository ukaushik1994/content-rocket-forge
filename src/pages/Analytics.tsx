import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { AnalyticsHero } from '@/components/analytics/AnalyticsHero';
import { ContentAnalyticsTab } from '@/components/analytics/ContentAnalyticsTab';
import { CampaignAnalyticsTab } from '@/components/analytics/CampaignAnalyticsTab';
import { DrilldownChart } from '@/components/analytics/DrilldownChart';
import { ContentDetailModal } from '@/components/analytics/ContentDetailModal';
import { CustomDateRangePicker } from '@/components/analytics/CustomDateRangePicker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { DateRange } from 'react-day-picker';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { 
  BarChart3, 
  CalendarRange, 
  RefreshCcw, 
  Download, 
  FileText, 
  Activity,
  TrendingUp,
  Eye,
  Clock,
  Users,
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Globe,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [drilldownData, setDrilldownData] = useState<{
    isOpen: boolean;
    metric: string;
    title: string;
  }>({ isOpen: false, metric: '', title: '' });
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [timeRange, setTimeRange] = useState('7days');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [useCustomRange, setUseCustomRange] = useState(false);
  const { openSettings } = useSettings();

  // Use real analytics data
  const { metrics: realMetrics, loading, error, refreshAnalytics } = useAnalyticsData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  // Convert real metrics to display format (8 metrics from GA4 + Search Console)
  const metricsDisplay = realMetrics ? [
    { 
      id: 'pageViews', 
      label: 'Page Views', 
      value: realMetrics.totalAnalytics.pageViews.toLocaleString(), 
      icon: Eye,
      source: 'Google Analytics'
    },
    { 
      id: 'sessions', 
      label: 'Sessions', 
      value: realMetrics.totalAnalytics.sessions.toLocaleString(), 
      icon: Users,
      source: 'Google Analytics'
    },
    { 
      id: 'impressions', 
      label: 'Search Impressions', 
      value: realMetrics.totalSearchConsole.impressions.toLocaleString(), 
      icon: TrendingUp,
      source: 'Search Console'
    },
    { 
      id: 'clicks', 
      label: 'Search Clicks', 
      value: realMetrics.totalSearchConsole.clicks.toLocaleString(), 
      icon: MousePointer,
      source: 'Search Console'
    },
    { 
      id: 'bounceRate', 
      label: 'Avg. Bounce Rate', 
      value: `${(realMetrics.avgBounceRate * 100).toFixed(1)}%`, 
      icon: Activity,
      source: 'Google Analytics'
    },
    { 
      id: 'sessionDuration', 
      label: 'Avg. Session', 
      value: `${Math.floor(realMetrics.avgSessionDuration / 60)}:${(realMetrics.avgSessionDuration % 60).toFixed(0).padStart(2, '0')}`, 
      icon: Clock,
      source: 'Google Analytics'
    },
    { 
      id: 'ctr', 
      label: 'Avg. CTR', 
      value: `${(realMetrics.avgCTR * 100).toFixed(1)}%`, 
      icon: Target,
      source: 'Search Console'
    },
    { 
      id: 'position', 
      label: 'Avg. Position', 
      value: realMetrics.avgPosition.toFixed(1), 
      icon: Zap,
      source: 'Search Console'
    }
  ] : [];

  const handleMetricClick = (metric: any) => {
    setDrilldownData({
      isOpen: true,
      metric: metric.id,
      title: metric.label
    });
  };

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    setUseCustomRange(false);
    setCustomDateRange(undefined);
  };

  const handleCustomDateRangeChange = (dateRange: DateRange | undefined) => {
    setCustomDateRange(dateRange);
    if (dateRange?.from && dateRange?.to) {
      setUseCustomRange(true);
    }
  };

  const handleExport = () => {
    if (!realMetrics) {
      toast.error('No data available to export');
      return;
    }

    const exportData = {
      overview: {
        pageViews: realMetrics.totalAnalytics.pageViews,
        sessions: realMetrics.totalAnalytics.sessions,
        bounceRate: realMetrics.avgBounceRate,
        sessionDuration: realMetrics.avgSessionDuration,
        impressions: realMetrics.totalSearchConsole.impressions,
        clicks: realMetrics.totalSearchConsole.clicks,
        ctr: realMetrics.avgCTR,
        position: realMetrics.avgPosition,
      },
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported successfully');
  };

  const timeRangeLabels = {
    '24h': 'Last 24 hours',
    '7days': 'Last 7 days', 
    '30days': 'Last 30 days',
    '90days': 'Last 90 days'
  };

  const getTimeRangeDisplay = () => {
    if (useCustomRange && customDateRange?.from && customDateRange?.to) {
      return `${customDateRange.from.toLocaleDateString()} - ${customDateRange.to.toLocaleDateString()}`;
    }
    return timeRangeLabels[timeRange as keyof typeof timeRangeLabels];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 container py-8">
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="p-6 text-center">
              <p className="text-destructive mb-4">Error loading analytics: {error}</p>
              <Button onClick={refreshAnalytics} variant="outline">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen w-full bg-background relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedBackground intensity="medium" />
      
      <Navbar />
      
      <main className="flex-1 container px-6 pt-24 pb-12 relative z-10">
        {/* Empty State Banner */}
        {realMetrics && realMetrics.totalAnalytics.pageViews === 0 && realMetrics.totalSearchConsole.impressions === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border border-border/10 bg-background/90 backdrop-blur-md flex items-center gap-3"
          >
            <Activity className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Publish content and connect Google Analytics to see real performance data here.
            </p>
          </motion.div>
        )}
        {/* Hero Section */}
        <motion.div 
          className="min-h-[5vh] w-full relative mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative z-10 w-full px-6 pt-16 pb-8">
            <motion.div 
              className="text-center mb-16 relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <motion.div 
                  className="inline-flex items-center gap-3 px-6 py-3 bg-background/90 backdrop-blur-md rounded-full border border-border/10 mb-8"
                >
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Real-time Performance Tracking</span>
                </motion.div>
                
                <motion.h1 
                  className="text-4xl md:text-6xl font-bold mb-6 text-foreground"
                >
                  Analytics Hub
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                  Track content performance, discover insights, and optimize your strategy 
                  with real-time Google Analytics and Search Console data
                </motion.p>

                <motion.div className="flex gap-4 justify-center mb-12">
                  <Button
                    onClick={refreshAnalytics}
                    disabled={loading}
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg font-semibold"
                  >
                    <RefreshCcw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                    <TrendingUp className="h-5 w-5 ml-2" />
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={!realMetrics}
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-border/20 px-8 py-4 text-lg font-semibold"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export Report
                  </Button>
                </motion.div>

                <motion.div 
                  className="flex justify-center gap-8 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {[
                    { icon: Eye, label: "Page Views", value: realMetrics?.totalAnalytics.pageViews.toLocaleString() || '0' },
                    { icon: Users, label: "Sessions", value: realMetrics?.totalAnalytics.sessions.toLocaleString() || '0' },
                    { icon: TrendingUp, label: "Impressions", value: realMetrics?.totalSearchConsole.impressions.toLocaleString() || '0' }
                  ].map((stat) => (
                    <div 
                      key={stat.label}
                      className="text-center"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-transparent border border-border/20 rounded-xl mb-2">
                        <stat.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-sm font-bold text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex gap-3 p-2 bg-background/90 backdrop-blur-md rounded-2xl border border-border/10">
                {[
                  { key: '24h', label: '24 Hours' },
                  { key: '7days', label: '7 Days' },
                  { key: '30days', label: '30 Days' },
                  { key: '90days', label: '90 Days' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleTimeRangeChange(filter.key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      timeRange === filter.key 
                        ? 'bg-foreground text-background' 
                        : 'hover:bg-muted/20'
                    }`}
                  >
                    <CalendarRange className="h-4 w-4" />
                    <span className="font-medium">{filter.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

              {/* Key Metrics Cards - 8 Real Metrics */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <Card key={`loading-${index}`} className="bg-background/90 backdrop-blur-md border-border/10">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="w-12 h-12 bg-muted rounded-xl" />
                          <div className="w-20 h-8 bg-muted rounded" />
                          <div className="w-24 h-4 bg-muted rounded" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  metricsDisplay.map((metric, index) => (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Card className="relative overflow-hidden bg-background/90 backdrop-blur-md border-border/10 transition-colors duration-300 h-full">
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-transparent border border-border/20">
                              <metric.icon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {metric.source}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-foreground">{metric.value}</h3>
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* Search and Filters */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-background/90 backdrop-blur-md border-border/10">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search analytics data..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-transparent border-border/20"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-40 bg-transparent border-border/20">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="views">Most Views</SelectItem>
                            <SelectItem value="engagement">Engagement</SelectItem>
                            <SelectItem value="recency">Most Recent</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          onClick={refreshAnalytics}
                          className="bg-transparent border-border/20 hover:bg-muted/20"
                        >
                          <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <Card className="bg-background/90 backdrop-blur-md border-border/10">
                  <CardContent className="p-2">
                    <TabsList className="w-full grid grid-cols-4 gap-1 bg-transparent">
                      <TabsTrigger 
                        value="overview" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="content" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Content</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="campaigns" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
                      >
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Campaigns</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="performance" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-foreground data-[state=active]:text-background transition-all duration-200"
                      >
                        <Activity className="h-4 w-4" />
                        <span className="font-medium">Performance</span>
                      </TabsTrigger>
                    </TabsList>
                  </CardContent>
                </Card>
                  
                <TabsContent value="overview">
                  <AnalyticsOverview />
                </TabsContent>
                
                <TabsContent value="content">
                  <ContentAnalyticsTab />
                </TabsContent>
                
                <TabsContent value="campaigns">
                  <CampaignAnalyticsTab />
                </TabsContent>
                    
                <TabsContent value="performance">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-background/90 backdrop-blur-md border-border/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-transparent border border-border/20">
                                <Activity className="h-5 w-5 text-muted-foreground" />
                              </div>
                              User Engagement
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {[
                              { label: "Avg. Session Duration", value: "4:32", icon: Clock },
                              { label: "Bounce Rate", value: "24.3%", icon: TrendingUp },
                              { label: "Page Views/Session", value: "3.2", icon: Eye },
                              { label: "Return Visitors", value: "68.7%", icon: Users },
                            ].map((metric, index) => (
                              <motion.div 
                                key={metric.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <metric.icon className="h-5 w-5 text-muted-foreground" />
                                  <span className="text-muted-foreground">{metric.label}</span>
                                </div>
                                <span className="text-xl font-bold text-foreground">{metric.value}</span>
                              </motion.div>
                            ))}
                          </CardContent>
                        </Card>

                    <Card className="bg-background/90 backdrop-blur-md border-border/10">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-transparent border border-border/20">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                              </div>
                              Top Performing Links
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {[
                              { source: "Project Management Tools", clicks: 2450, ctr: "12.8%" },
                              { source: "Email Marketing Guide", clicks: 1890, ctr: "9.6%" },
                              { source: "CRM Solutions", clicks: 1650, ctr: "8.4%" },
                              { source: "Analytics Platform", clicks: 1420, ctr: "7.2%" },
                            ].map((link, index) => (
                              <motion.div 
                                key={link.source}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-foreground">{link.source}</h4>
                                  <Badge variant="outline">
                                    {link.ctr}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MousePointer className="h-4 w-4" />
                                  <span>{link.clicks.toLocaleString()} clicks</span>
                                </div>
                              </motion.div>
                            ))}
                          </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
        <ContentDetailModal
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          content={selectedContent}
        />
      </main>
    </motion.div>
  );
};

export default Analytics;
