import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { AnalyticsOverview } from '@/components/analytics/AnalyticsOverview';
import { DrilldownChart } from '@/components/analytics/DrilldownChart';
import { ContentDetailModal } from '@/components/analytics/ContentDetailModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
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

  // Use real analytics data
  const { metrics, contentAnalytics, timelineData, loading, error, refreshAnalytics } = useRealAnalytics(timeRange);

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

  // Convert real metrics to display format
  const metricsDisplay = metrics ? [
    { 
      id: 'views', 
      label: 'Total Views', 
      value: metrics.views > 1000000 ? `${(metrics.views / 1000000).toFixed(1)}M` : metrics.views.toLocaleString(), 
      change: `${metrics.change.views >= 0 ? '+' : ''}${metrics.change.views.toFixed(1)}%`, 
      trend: metrics.change.views >= 0 ? 'up' : 'down',
      icon: Eye,
      color: 'from-blue-500 to-cyan-400',
      bgPattern: 'from-blue-500/5 to-cyan-400/10'
    },
    { 
      id: 'engagement', 
      label: 'Engagement Rate', 
      value: `${metrics.engagement.toFixed(1)}%`, 
      change: `${metrics.change.engagement >= 0 ? '+' : ''}${metrics.change.engagement.toFixed(1)}%`, 
      trend: metrics.change.engagement >= 0 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-400',
      bgPattern: 'from-emerald-500/5 to-teal-400/10'
    },
    { 
      id: 'conversions', 
      label: 'Conversions', 
      value: metrics.conversions.toLocaleString(), 
      change: `${metrics.change.conversions >= 0 ? '+' : ''}${metrics.change.conversions.toFixed(1)}%`, 
      trend: metrics.change.conversions >= 0 ? 'up' : 'down',
      icon: Target,
      color: 'from-violet-500 to-purple-400',
      bgPattern: 'from-violet-500/5 to-purple-400/10'
    },
    { 
      id: 'revenue', 
      label: 'Revenue', 
      value: `$${(metrics.revenue / 1000).toFixed(1)}K`, 
      change: `${metrics.change.revenue >= 0 ? '+' : ''}${metrics.change.revenue.toFixed(1)}%`, 
      trend: metrics.change.revenue >= 0 ? 'up' : 'down',
      icon: Zap,
      color: 'from-orange-500 to-pink-400',
      bgPattern: 'from-orange-500/5 to-pink-400/10'
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

  const filteredContent = contentAnalytics.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'engagement') return parseFloat(b.engagement) - parseFloat(a.engagement);
    if (sortBy === 'performance') return b.performance - a.performance;
    return 0;
  });

  const timeRangeLabels = {
    '24h': 'Last 24 hours',
    '7days': 'Last 7 days', 
    '30days': 'Last 30 days',
    '90days': 'Last 90 days'
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <main className="container py-8">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
      
      <Navbar />
      
      <main className="relative z-10 container py-8 space-y-8">
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
              {/* Hero Header */}
              <motion.div 
                variants={itemVariants}
                className="text-center space-y-6 py-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
                >
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-300">Real-time Analytics</span>
                </motion.div>
                
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Analytics Hub
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Discover insights, track performance, and optimize your content strategy with real analytics data
                </p>
              </motion.div>

              {/* Key Metrics Cards - Now using real data */}
              <motion.div 
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30">
                      <CardContent className="p-6">
                        <div className="animate-pulse">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-slate-600 rounded-xl" />
                            <div className="w-16 h-6 bg-slate-600 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <div className="w-20 h-8 bg-slate-600 rounded" />
                            <div className="w-24 h-4 bg-slate-600 rounded" />
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
                      className="relative group cursor-pointer"
                      onClick={() => handleMetricClick(metric)}
                    >
                      <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${metric.bgPattern} backdrop-blur-xl transition-all duration-300`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                        
                        <CardContent className="p-6 relative z-10">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                              <metric.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              metric.trend === 'up' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {metric.change}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
                            <p className="text-sm text-slate-400">{metric.label}</p>
                          </div>
                          
                          <div className="mt-3 text-xs text-slate-500">
                            Click to drill down
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>

              {/* Control Panel */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border border-slate-600/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-600/30">
                    <CalendarRange className="w-4 h-4 text-slate-400" />
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="border-0 bg-transparent text-white min-w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="7days">Last 7 days</SelectItem>
                        <SelectItem value="30days">Last 30 days</SelectItem>
                        <SelectItem value="90days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {loading ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Live Data'
                    )}
                  </Badge>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-slate-800/50 border-slate-600/30 text-white hover:bg-slate-700/50"
                    onClick={refreshAnalytics}
                    disabled={loading}
                  >
                    <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm" className="bg-slate-800/50 border-slate-600/30 text-white hover:bg-slate-700/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </motion.div>
              
              {/* Tabs Section */}
              <motion.div variants={itemVariants}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                  <TabsList className="bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 p-2 h-auto grid grid-cols-3 gap-2">
                    <TabsTrigger 
                      value="overview" 
                      className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="content" 
                      className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
                    >
                      <FileText className="h-4 w-4" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger 
                      value="performance" 
                      className="gap-2 py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
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
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-600/30 overflow-hidden">
                          <CardHeader className="border-b border-slate-600/30 bg-gradient-to-r from-slate-700/50 to-transparent">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  Content Performance
                                </CardTitle>
                                <CardDescription className="mt-2 text-slate-400">
                                  Track how your content is performing across all platforms
                                </CardDescription>
                              </div>
                              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white border-0">
                                {loading ? 'Loading...' : 'Real-time'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-0">
                            <div className="p-6 border-b border-slate-600/20">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="relative flex-1 max-w-sm">
                                  <Input 
                                    className="pl-10 bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 transition-colors" 
                                    placeholder="Search content..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                </div>
                                <div className="flex gap-2">
                                  <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600/50 text-white min-w-[120px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-600">
                                      <SelectItem value="views">Sort by Views</SelectItem>
                                      <SelectItem value="engagement">Sort by Engagement</SelectItem>
                                      <SelectItem value="performance">Sort by Performance</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="outline" size="sm" className="bg-slate-700/50 border-slate-600/50 text-white">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="overflow-hidden">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="border-b border-slate-600/30 bg-slate-700/30">
                                      <th className="h-14 px-6 text-left align-middle font-semibold text-slate-200">Content</th>
                                      <th className="h-14 px-6 text-left align-middle font-semibold text-slate-200">Views</th>
                                      <th className="h-14 px-6 text-left align-middle font-semibold text-slate-200">Engagement</th>
                                      <th className="h-14 px-6 text-left align-middle font-semibold text-slate-200">Performance</th>
                                      <th className="h-14 px-6 text-left align-middle font-semibold text-slate-200">Revenue</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {loading ? (
                                      Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="border-b border-slate-600/20">
                                          <td className="p-6 align-middle">
                                            <div className="animate-pulse">
                                              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2" />
                                              <div className="h-3 bg-slate-700 rounded w-1/2" />
                                            </div>
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="animate-pulse h-4 bg-slate-600 rounded w-16" />
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="animate-pulse h-6 bg-slate-600 rounded w-12" />
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="animate-pulse h-2 bg-slate-600 rounded w-16" />
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="animate-pulse h-4 bg-slate-600 rounded w-14" />
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      filteredContent.map((item, i) => (
                                        <motion.tr 
                                          key={item.id} 
                                          initial={{ opacity: 0, y: 20 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: i * 0.1 }}
                                          className="border-b border-slate-600/20 hover:bg-slate-700/30 transition-all duration-300 group cursor-pointer"
                                          onClick={() => handleContentClick(item)}
                                        >
                                          <td className="p-6 align-middle">
                                            <div className="font-medium text-white group-hover:text-blue-300 transition-colors">{item.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">Updated: {item.last_updated}</div>
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="flex items-center gap-2">
                                              <Eye className="h-4 w-4 text-blue-400" />
                                              <span className="font-medium text-white">{item.views.toLocaleString()}</span>
                                            </div>
                                          </td>
                                          <td className="p-6 align-middle">
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                              {item.engagement}
                                            </Badge>
                                          </td>
                                          <td className="p-6 align-middle">
                                            <div className="flex items-center gap-2">
                                              <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                                <div 
                                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                                  style={{ width: `${item.performance}%` }}
                                                />
                                              </div>
                                              <span className="text-sm font-medium text-white">{item.performance}%</span>
                                            </div>
                                          </td>
                                          <td className="p-6 align-middle">
                                            <span className="font-medium text-emerald-400">{item.revenue}</span>
                                          </td>
                                        </motion.tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
                data={timelineData}
                metric={drilldownData.metric}
                timeRange={timeRangeLabels[timeRange as keyof typeof timeRangeLabels]}
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
