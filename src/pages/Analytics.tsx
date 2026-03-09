import React, { useState } from 'react';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
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
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      } 
    }
  };

  const cardHoverVariants = {
    hover: { 
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  // Convert real metrics to display format (8 metrics from GA4 + Search Console)
  const metricsDisplay = realMetrics ? [
    { 
      id: 'pageViews', 
      label: 'Page Views', 
      value: realMetrics.totalAnalytics.pageViews.toLocaleString(), 
      icon: Eye,
      color: 'from-blue-500 to-cyan-400',
      bgPattern: 'from-blue-500/5 to-cyan-400/10',
      source: 'Google Analytics'
    },
    { 
      id: 'sessions', 
      label: 'Sessions', 
      value: realMetrics.totalAnalytics.sessions.toLocaleString(), 
      icon: Users,
      color: 'from-emerald-500 to-teal-400',
      bgPattern: 'from-emerald-500/5 to-teal-400/10',
      source: 'Google Analytics'
    },
    { 
      id: 'impressions', 
      label: 'Search Impressions', 
      value: realMetrics.totalSearchConsole.impressions.toLocaleString(), 
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-400',
      bgPattern: 'from-violet-500/5 to-purple-400/10',
      source: 'Search Console'
    },
    { 
      id: 'clicks', 
      label: 'Search Clicks', 
      value: realMetrics.totalSearchConsole.clicks.toLocaleString(), 
      icon: MousePointer,
      color: 'from-orange-500 to-pink-400',
      bgPattern: 'from-orange-500/5 to-pink-400/10',
      source: 'Search Console'
    },
    { 
      id: 'bounceRate', 
      label: 'Avg. Bounce Rate', 
      value: `${(realMetrics.avgBounceRate * 100).toFixed(1)}%`, 
      icon: Activity,
      color: 'from-red-500 to-rose-400',
      bgPattern: 'from-red-500/5 to-rose-400/10',
      source: 'Google Analytics'
    },
    { 
      id: 'sessionDuration', 
      label: 'Avg. Session', 
      value: `${Math.floor(realMetrics.avgSessionDuration / 60)}:${(realMetrics.avgSessionDuration % 60).toFixed(0).padStart(2, '0')}`, 
      icon: Clock,
      color: 'from-yellow-500 to-amber-400',
      bgPattern: 'from-yellow-500/5 to-amber-400/10',
      source: 'Google Analytics'
    },
    { 
      id: 'ctr', 
      label: 'Avg. CTR', 
      value: `${(realMetrics.avgCTR * 100).toFixed(1)}%`, 
      icon: Target,
      color: 'from-green-500 to-emerald-400',
      bgPattern: 'from-green-500/5 to-emerald-400/10',
      source: 'Search Console'
    },
    { 
      id: 'position', 
      label: 'Avg. Position', 
      value: realMetrics.avgPosition.toFixed(1), 
      icon: Zap,
      color: 'from-indigo-500 to-blue-400',
      bgPattern: 'from-indigo-500/5 to-blue-400/10',
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

  const handleExportCSV = () => {
    if (!realMetrics) {
      toast.error('No data available to export');
      return;
    }
    const rows = [
      ['Metric', 'Value', 'Source'],
      ['Page Views', String(realMetrics.totalAnalytics.pageViews), 'Google Analytics'],
      ['Sessions', String(realMetrics.totalAnalytics.sessions), 'Google Analytics'],
      ['Bounce Rate', `${(realMetrics.avgBounceRate * 100).toFixed(1)}%`, 'Google Analytics'],
      ['Avg Session Duration (s)', String(realMetrics.avgSessionDuration), 'Google Analytics'],
      ['Search Impressions', String(realMetrics.totalSearchConsole.impressions), 'Search Console'],
      ['Search Clicks', String(realMetrics.totalSearchConsole.clicks), 'Search Console'],
      ['CTR', `${(realMetrics.avgCTR * 100).toFixed(1)}%`, 'Search Console'],
      ['Avg Position', realMetrics.avgPosition.toFixed(1), 'Search Console'],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const handleExportPDF = async () => {
    const el = document.getElementById('analytics-dashboard');
    if (!el) { toast.error('Nothing to export'); return; }
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 2 });
      const link = document.createElement('a');
      link.download = `analytics-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success('Dashboard image exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleExport = () => {
    handleExportCSV();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <main className="pt-20 container py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
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
      
      
      
      <main className="flex-1 container px-6 pt-24 pb-12 relative z-10">
        {/* Empty State Banner */}
        {realMetrics && realMetrics.totalAnalytics.pageViews === 0 && realMetrics.totalSearchConsole.impressions === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border border-border/50 bg-background/60 backdrop-blur-xl flex items-center gap-3"
          >
            <Activity className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Publish content and connect Google Analytics to see real performance data here.
            </p>
          </motion.div>
        )}
        <CompactPageHeader
          icon={BarChart3}
          title="Analytics"
          subtitle="Track content performance with Google Analytics & Search Console"
          stats={realMetrics ? [
            { icon: Eye, label: 'Views', value: realMetrics.totalAnalytics.pageViews.toLocaleString() },
            { icon: Users, label: 'Sessions', value: realMetrics.totalAnalytics.sessions.toLocaleString() },
            { icon: TrendingUp, label: 'Impressions', value: realMetrics.totalSearchConsole.impressions.toLocaleString() },
          ] : undefined}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refreshAnalytics} disabled={loading}>
                <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!realMetrics}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!realMetrics}>
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Image
              </Button>
            </div>
          }
          quickFilters={[
            { key: '24h', label: '24h', icon: CalendarRange },
            { key: '7days', label: '7 Days', icon: CalendarRange },
            { key: '30days', label: '30 Days', icon: CalendarRange },
            { key: '90days', label: '90 Days', icon: CalendarRange },
          ]}
          activeFilter={timeRange}
          onFilterChange={handleTimeRangeChange}
        />

              {/* Key Metrics Cards - 8 Real Metrics */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {loading ? (
                  Array.from({ length: 8 }).map((_, index) => (
                    <Card key={`loading-${index}`} className="bg-background/60 backdrop-blur-xl border-border/50">
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
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="h-full"
                    >
                      <Card className="relative overflow-hidden bg-background/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all duration-300 group h-full">
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                        />
                        
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                              <metric.icon className="w-6 h-6 text-white" />
                            </div>
                            <Badge variant="outline" className="text-xs bg-background/40">
                              {metric.source}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-foreground">{metric.value}</h3>
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                          </div>
                        </CardContent>

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        />
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
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search analytics data..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-background/40 border-border/50"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-40 bg-background/40 border-border/50">
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
                          className="bg-background/40 border-border/50 hover:bg-background/60"
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
                <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                  <CardContent className="p-2">
                    <TabsList className="w-full grid grid-cols-4 gap-1 bg-transparent">
                      <TabsTrigger 
                        value="overview" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="font-medium">Overview</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="content" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">Content</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="campaigns" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
                      >
                        <Target className="h-4 w-4" />
                        <span className="font-medium">Campaigns</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="performance" 
                        className="gap-2 py-3 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-200"
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
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500">
                                <Activity className="h-5 w-5 text-white" />
                              </div>
                              User Engagement
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {[
                              { label: "Avg. Session Duration", value: "4:32", icon: Clock, color: "text-blue-400" },
                              { label: "Bounce Rate", value: "24.3%", icon: TrendingUp, color: "text-emerald-400" },
                              { label: "Page Views/Session", value: "3.2", icon: Eye, color: "text-purple-400" },
                              { label: "Return Visitors", value: "68.7%", icon: Users, color: "text-orange-400" },
                            ].map((metric, index) => (
                              <motion.div 
                                key={metric.label}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300"
                              >
                                <div className="flex items-center gap-3">
                                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                                  <span className="text-slate-300">{metric.label}</span>
                                </div>
                                <span className="text-xl font-bold text-white">{metric.value}</span>
                              </motion.div>
                            ))}
                          </CardContent>
                        </Card>

                    <Card className="bg-background/60 backdrop-blur-xl border-border/50">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                                <Globe className="h-5 w-5 text-white" />
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
                                className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 group"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-white group-hover:text-blue-300 transition-colors">{link.source}</h4>
                                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    {link.ctr}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400">
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
