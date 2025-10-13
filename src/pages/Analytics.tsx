import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { AnalyticsHero } from '@/components/analytics/AnalyticsHero';
import { ContentAnalyticsTab } from '@/components/analytics/ContentAnalyticsTab';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated background - matching Repository design */}
      <AnimatedBackground intensity="medium" />
      
      <Navbar />
      
      <main className="relative z-10 pt-20 container py-8 space-y-8">
        <AnimatePresence mode="wait">
          {!drilldownData.isOpen ? (
            <motion.div 
              key="overview"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariants}
              className="space-y-8"
            >
              {/* Hero Section */}
              <motion.div variants={itemVariants}>
                <AnalyticsHero 
                  loading={loading}
                  hasData={realMetrics !== null}
                  totalViews={realMetrics?.totalAnalytics.pageViews || 0}
                  totalContent={0}
                  avgPerformance={0}
                  onRefresh={refreshAnalytics}
                  onExport={handleExport}
                  onConfigure={() => openSettings('api')}
                />
              </motion.div>

              {/* Key Metrics Cards - 8 Real Metrics */}
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, index) => (
                    <Card key={`loading-${index}`} className="bg-card/50 backdrop-blur-xl border-border/30">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-start justify-between mb-4">
                             <div className="w-12 h-12 bg-muted rounded-xl" />
                             <div className="w-16 h-6 bg-muted rounded-full" />
                           </div>
                           <div className="space-y-2">
                             <div className="w-20 h-8 bg-muted rounded" />
                             <div className="w-24 h-4 bg-muted rounded" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  metricsDisplay.map((metric, index) => (
                    <motion.div
                      key={metric.id}
                      variants={{
                        hover: { 
                          y: -8,
                          scale: 1.02,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                          transition: { duration: 0.3, ease: "easeOut" }
                        }
                      }}
                      whileHover="hover"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${metric.bgPattern} backdrop-blur-xl transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                              <metric.icon className="w-6 h-6 text-primary-foreground" />
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

              {/* Enhanced Control Panel with Custom Date Range */}
              <motion.div 
                variants={itemVariants}
               className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/30"
             >
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/30">
                   <CalendarRange className="w-4 h-4 text-muted-foreground" />
                    <Select 
                      value={useCustomRange ? "custom" : timeRange} 
                      onValueChange={(value) => value === "custom" ? null : handleTimeRangeChange(value)}
                    >
                      <SelectTrigger className="border-0 bg-transparent text-foreground min-w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                     <SelectContent className="bg-card border-border">
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <CustomDateRangePicker
                    onDateRangeChange={handleCustomDateRangeChange}
                    className="min-w-[200px]"
                  />
                  
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                        {getTimeRangeDisplay()}
                      </>
                    )}
                  </Badge>
                </div>

                <div className="flex gap-3">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="bg-card/50 border-border/30 text-foreground hover:bg-card/70"
                     onClick={refreshAnalytics}
                     disabled={loading}
                   >
                     <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                     Refresh
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="bg-card/50 border-border/30 text-foreground hover:bg-card/70"
                     onClick={handleExport}
                     disabled={!realMetrics}
                   >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </motion.div>
              
              {/* Tabs Section */}
              <motion.div variants={itemVariants}>
                   <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-card/50 backdrop-blur-xl border border-border/30 p-2 h-auto grid grid-cols-3 gap-2">
                    <TabsTrigger 
                      value="overview" 
                       className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-300"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                       className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-300"
                    >
                      <FileText className="h-4 w-4" />
                      Content
                    </TabsTrigger>
                     <TabsTrigger 
                       value="performance" 
                       className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground transition-all duration-300"
                     >
                       <Activity className="h-4 w-4" />
                       Performance
                     </TabsTrigger>
                  </TabsList>
                  
                  <AnimatePresence mode="wait">
                    <TabsContent value="overview" className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AnalyticsOverview />
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="content" className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ContentAnalyticsTab />
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                      >
                        {/* Performance Metrics */}
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
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

                        {/* Top Links */}
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
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
                      </motion.div>
                    </TabsContent>

                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="drilldown"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <DrilldownChart
                title={drilldownData.title}
                data={[]}
                metric={drilldownData.metric}
                timeRange={getTimeRangeDisplay()}
                onBack={() => setDrilldownData({ isOpen: false, metric: '', title: '' })}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Detail Modal */}
        <ContentDetailModal
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          content={selectedContent}
        />
      </main>
    </div>
  );
};

export default Analytics;
