import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { ContentAnalyticsTab } from '@/components/analytics/ContentAnalyticsTab';
import { CampaignAnalyticsTab } from '@/components/analytics/CampaignAnalyticsTab';
import { CampaignAnalyticsTab } from '@/components/analytics/CampaignAnalyticsTab';
import { DrilldownChart } from '@/components/analytics/DrilldownChart';
import { ContentDetailModal } from '@/components/analytics/ContentDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
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
  Zap,
  Target,
  Search,
} from 'lucide-react';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PageContainer } from '@/components/ui/PageContainer';
import { cn } from '@/lib/utils';

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
      source: 'Content Analytics'
    },
    { 
      id: 'sessions', 
      label: 'Sessions', 
      value: realMetrics.totalAnalytics.sessions.toLocaleString(), 
      icon: Users,
      color: 'from-emerald-500 to-teal-400',
      bgPattern: 'from-emerald-500/5 to-teal-400/10',
      source: 'Content Analytics'
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
      source: 'Content Analytics'
    },
    { 
      id: 'sessionDuration', 
      label: 'Avg. Session', 
      value: `${Math.floor(realMetrics.avgSessionDuration / 60)}:${(realMetrics.avgSessionDuration % 60).toFixed(0).padStart(2, '0')}`, 
      icon: Clock,
      color: 'from-yellow-500 to-amber-400',
      bgPattern: 'from-yellow-500/5 to-amber-400/10',
      source: 'Content Analytics'
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
      ['Page Views', String(realMetrics.totalAnalytics.pageViews), 'Content Analytics'],
      ['Sessions', String(realMetrics.totalAnalytics.sessions), 'Content Analytics'],
      ['Bounce Rate', `${(realMetrics.avgBounceRate * 100).toFixed(1)}%`, 'Content Analytics'],
      ['Avg Session Duration (s)', String(realMetrics.avgSessionDuration), 'Content Analytics'],
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
    <PageContainer className="w-full relative overflow-hidden">
      <Helmet>
        <title>Analytics | Creaiter</title>
        <meta name="description" content="Real-time performance tracking, content analytics, and campaign insights." />
      </Helmet>
      <AnimatedBackground intensity="medium" />
      
      
      
      <main className="flex-1 container px-6 pt-6 pb-12 relative z-10">
        <PageBreadcrumb section="Tools" page="Analytics" />
        {/* Empty State Banner */}
        {realMetrics && realMetrics.totalAnalytics.pageViews === 0 && realMetrics.totalSearchConsole.impressions === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg border border-border/50 bg-background/60 backdrop-blur-xl flex items-center gap-3"
          >
            <Activity className="h-5 w-5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Publish content and connect analytics integrations to see real performance data here.
            </p>
          </motion.div>
        )}
        {/* Compact Toolbar */}
        <motion.div 
          className="flex items-center justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          
          <div className="flex items-center gap-1 p-1 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50">
            {[
              { key: '24h', label: '24h' },
              { key: '7days', label: '7d' },
              { key: '30days', label: '30d' },
              { key: '90days', label: '90d' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleTimeRangeChange(filter.key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                  timeRange === filter.key 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportCSV}
              disabled={!realMetrics}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshAnalytics}
              disabled={loading}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`loading-${index}`} className="p-4 rounded-xl bg-background/60 backdrop-blur-xl border border-border/50">
                <div className="animate-pulse space-y-2">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="w-16 h-6 bg-muted rounded" />
                  <div className="w-20 h-3 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : (
            metricsDisplay.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                whileHover={{ y: -2 }}
                className="group relative p-4 rounded-xl bg-background/60 backdrop-blur-xl border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleMetricClick(metric)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                    <metric.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{metric.source}</span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{metric.value}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{metric.label}</p>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Search Row */}
        <motion.div
          className="flex items-center gap-3 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search analytics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 text-sm bg-background/40 border-border/50"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-8 text-sm bg-background/40 border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Most Views</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="recency">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
              
              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="glass-card p-1.5 rounded-2xl">
                  <div className="flex w-full">
                    {[
                      { value: 'overview', icon: BarChart3, label: 'Overview' },
                      { value: 'content', icon: FileText, label: 'Content' },
                      { value: 'campaigns', icon: Target, label: 'Campaigns' },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={cn(
                          'relative flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-medium transition-colors duration-200',
                          activeTab === tab.value
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {activeTab === tab.value && (
                          <motion.div
                            layoutId="analytics-tab-indicator"
                            className="absolute inset-0 bg-primary rounded-xl shadow-lg"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          />
                        )}
                        <tab.icon className="h-4 w-4 relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                  
                <TabsContent value="overview">
                  <AnalyticsOverview />
                </TabsContent>
                
                <TabsContent value="content">
                  <ContentAnalyticsTab />
                </TabsContent>
                
                <TabsContent value="campaigns">
                  <CampaignAnalyticsTab />
                </TabsContent>
                    
              </Tabs>
        <ContentDetailModal
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          content={selectedContent}
        />
      </main>
    </PageContainer>
  );
};

export default Analytics;
