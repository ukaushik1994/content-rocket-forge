import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedStatCard } from './EnhancedStatCard';
import { PerformanceChart } from './PerformanceChart';
import { Activity, Clock, FileText, Search, BarChart3, Fingerprint, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
export const EnhancedPerformanceSection: React.FC = () => {
  const {loading, error } = useAnalyticsData();
  // Temp: Using placeholder metrics until dashboard refactor
  const metrics = { views: 0, engagement: 0, conversions: 0, revenue: 0, change: { views: 0, engagement: 0, conversions: 0, revenue: 0 } };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  const headerVariants = {
    hidden: {
      opacity: 0,
      x: -30
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };
  if (loading) {
    return (
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/10 rounded-lg w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-lg border border-white/10"></div>
            ))}
          </div>
          <div className="h-80 bg-white/5 rounded-lg border border-white/10"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="text-center p-8 border border-red-500/20 bg-red-500/10 rounded-lg">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Analytics Error</h3>
          <p className="text-white/60">Unable to load performance data. Please try again.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      {/* Section Header */}
      <motion.div 
        className="text-center space-y-4"
        variants={headerVariants}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-neon-purple/30 to-neon-blue/30 flex items-center justify-center backdrop-blur-xl border border-white/10">
            <BarChart3 className="h-5 w-5 text-neon-purple" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
            Performance Insights
          </h2>
        </div>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Track your content performance and optimize your strategy with real-time analytics
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Total Content"
            value={metrics?.views ? Math.floor(metrics.views / 1000) : 0}
            trend={{ value: metrics?.change.views || 0, positive: (metrics?.change.views || 0) >= 0 }}
            icon="FileText"
            description="Published articles"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Search Volume"
            value={metrics?.engagement ? `${(metrics.engagement * 1000).toFixed(1)}K` : "0"}
            trend={{ value: metrics?.change.engagement || 0, positive: (metrics?.change.engagement || 0) >= 0 }}
            icon="Search"
            description="Monthly searches"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Total Sessions"
            value={metrics?.conversions ? (metrics.conversions * 100).toLocaleString() : "0"}
            trend={{ value: metrics?.change.conversions || 0, positive: (metrics?.change.conversions || 0) >= 0 }}
            icon="Users"
            description="Total sessions"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <EnhancedStatCard
            title="Revenue"
            value={metrics?.revenue ? `$${(metrics.revenue / 1000).toFixed(1)}K` : "$0"}
            trend={{ value: metrics?.change.revenue || 0, positive: (metrics?.change.revenue || 0) >= 0 }}
            icon="TrendingUp"
            description="Total revenue"
          />
        </motion.div>
      </motion.div>

      {/* Performance Chart */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon-blue" />
              Content Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};