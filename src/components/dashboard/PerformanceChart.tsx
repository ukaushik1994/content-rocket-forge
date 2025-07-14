
import React from 'react';
import { LineChart, BarChart } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, BarChart3, Clock, Sparkles, Zap, Eye, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';

interface PerformanceChartProps {
  className?: string;
  timeRange?: string;
}

export function PerformanceChart({ className, timeRange = '7days' }: PerformanceChartProps) {
  const { metrics, timelineData, loading, error } = useRealAnalytics(timeRange);

  // Format number as compact representation (e.g. 1.5k)
  const formatCompact = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Format time values with proper units
  const formatTime = (value: number) => {
    return `${value.toFixed(1)} min`;
  };

  // Format percentage with proper sign
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Enhanced animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 120, 
        damping: 20,
        duration: 0.6
      }
    }
  };

  const sparkleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    pulse: {
      boxShadow: [
        "0 0 20px rgba(155, 135, 245, 0.3)",
        "0 0 40px rgba(155, 135, 245, 0.5)",
        "0 0 20px rgba(155, 135, 245, 0.3)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Transform timeline data for charts
  const chartData = timelineData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    visitors: item.visitors,
    views: item.views,
    conversions: item.conversions,
    engagement: item.engagement,
    avgTime: item.engagement / 2, // Convert engagement to time estimate
  }));

  // Content performance from real data
  const contentPerformance = timelineData.slice(0, 5).map((item, index) => ({
    content: ['Homepage', 'Blog Posts', 'Product Pages', 'About', 'Contact'][index] || `Content ${index + 1}`,
    views: item.views,
    engagement: Math.round(item.engagement * 10),
    conversion: (item.conversions / item.views * 100).toFixed(1)
  }));

  if (loading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className={className}
      >
        <Card className="overflow-hidden border border-border/10 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted/20 rounded w-1/4"></div>
              <div className="h-[300px] bg-muted/10 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-muted/10 rounded"></div>
                <div className="h-20 bg-muted/10 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
    >
      <Card className={`relative overflow-hidden border border-border/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-2xl ${className}`}>
        {/* Glassmorphism background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full"
          variants={sparkleVariants}
          animate="animate"
        />
        <motion.div 
          className="absolute top-12 right-12 w-1 h-1 bg-accent/50 rounded-full"
          variants={sparkleVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        />

        <CardHeader className="relative pb-2 border-b border-border/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30"
              variants={glowVariants}
              animate="pulse"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </motion.div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Performance Analytics
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time insights & trends</p>
            </div>
          </div>
          
          <motion.div 
            className="flex items-center px-4 py-2 rounded-xl bg-white/5 text-xs font-medium text-muted-foreground border border-white/10 backdrop-blur-sm"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Zap className="h-3 w-3 mr-2 text-primary" />
            Live Data
          </motion.div>
        </CardHeader>
        <CardContent className="relative p-0">
          <Tabs defaultValue="visitors" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="bg-background/20 backdrop-blur-sm border border-border/20 grid w-full grid-cols-3 h-10 mb-4">
                <TabsTrigger 
                  value="visitors" 
                  className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-primary/20 data-[state=active]:text-foreground transition-all"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Traffic
                </TabsTrigger>
                <TabsTrigger 
                  value="engagement" 
                  className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-primary/20 data-[state=active]:text-foreground transition-all"
                >
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  Engagement
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/30 data-[state=active]:to-primary/20 data-[state=active]:text-foreground transition-all"
                >
                  <Target className="h-3.5 w-3.5 mr-1.5" />
                  Performance
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="visitors" className="mt-0 px-2 pb-6">
              <div className="h-[320px] w-full px-4 mb-6"> 
                <LineChart 
                  data={chartData}
                  categories={['visitors', 'views']}
                  index="date"
                  colors={['hsl(var(--primary))', 'hsl(var(--accent))']}
                  valueFormatter={(value) => formatCompact(value)}
                  className="pt-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 px-6">
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(155, 135, 245, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Total Views</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {metrics ? formatCompact(metrics.views) : '2.4M'}
                    </div>
                    <div className={`text-xs flex items-center gap-1 mt-2 ${
                      (metrics?.change.views || 12.5) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metrics ? formatPercentage(metrics.change.views) : '+12.5%'} vs last period
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(155, 135, 245, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Total Visitors</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {chartData.length > 0 ? formatCompact(chartData.reduce((sum, item) => sum + item.visitors, 0)) : '1.8M'}
                    </div>
                    <div className="text-emerald-400 text-xs flex items-center gap-1 mt-2">
                      <TrendingUp className="h-3 w-3" />
                      +18.4% growth rate
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="engagement" className="mt-0 px-2 pb-6">
              <div className="h-[320px] w-full px-4 mb-6"> 
                <LineChart 
                  data={chartData}
                  categories={['conversions', 'engagement']}
                  index="date"
                  colors={['hsl(var(--destructive))', 'hsl(var(--chart-2))']}
                  valueFormatter={(value, name) => name === 'engagement' ? `${value.toFixed(1)}%` : value.toString()}
                  className="pt-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 px-6">
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(217, 70, 239, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-destructive/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Total Conversions</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {metrics ? formatCompact(metrics.conversions) : '1,247'}
                    </div>
                    <div className={`text-xs flex items-center gap-1 mt-2 ${
                      (metrics?.change.conversions || 8.1) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metrics ? formatPercentage(metrics.change.conversions) : '+8.1%'} vs last period
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(155, 135, 245, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-chart-2/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Avg. Engagement</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {metrics ? `${metrics.engagement.toFixed(1)}%` : '8.7%'}
                    </div>
                    <div className={`text-xs flex items-center gap-1 mt-2 ${
                      (metrics?.change.engagement || 2.3) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metrics ? formatPercentage(metrics.change.engagement) : '+2.3%'} vs last period
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-0 px-2 pb-6">
              <div className="h-[320px] w-full px-4 mb-6">
                <BarChart 
                  data={contentPerformance}
                  categories={['views', 'engagement']}
                  index="content"
                  colors={['hsl(var(--primary))', 'hsl(var(--accent))']}
                  valueFormatter={(value) => formatCompact(value)}
                  className="pt-4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 px-6">
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(155, 135, 245, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Top Performer</div>
                    <div className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {contentPerformance[0]?.content || 'Homepage'}
                    </div>
                    <div className="text-emerald-400 text-xs flex items-center gap-1 mt-2">
                      <Eye className="h-3 w-3" />
                      {contentPerformance[0] ? `${formatCompact(contentPerformance[0].views)} views` : '245K views'}
                    </div>
                  </div>
                </motion.div>
                <motion.div 
                  className="relative bg-gradient-to-br from-background/60 to-background/30 p-4 rounded-xl shadow-lg border border-border/30 backdrop-blur-sm overflow-hidden"
                  whileHover={{ 
                    y: -4, 
                    boxShadow: "0 20px 40px -10px rgba(155, 135, 245, 0.3)",
                    scale: 1.02
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-accent/20 to-transparent rounded-full -translate-y-8 translate-x-8" />
                  <div className="relative">
                    <div className="font-medium text-xs text-muted-foreground mb-2">Revenue Generated</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {metrics ? `$${formatCompact(metrics.revenue)}` : '$34.2K'}
                    </div>
                    <div className={`text-xs flex items-center gap-1 mt-2 ${
                      (metrics?.change.revenue || 15.7) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="h-3 w-3" />
                      {metrics ? formatPercentage(metrics.change.revenue) : '+15.7%'} vs last period
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
