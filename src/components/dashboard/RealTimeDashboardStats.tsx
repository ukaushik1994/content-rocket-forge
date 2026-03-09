import React, { useState, useEffect } from 'react';
import { EnhancedStatCard } from './EnhancedStatCard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { realTimeIntegrationService } from '@/services/realTimeIntegrationService';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  totalViews: number;
  avgEngagement: number;
  totalRevenue: number;
}

export const RealTimeDashboardStats: React.FC = () => {
  const { loading: analyticsLoading } = useAnalyticsData();
  const { user } = useAuth();
  
  // Temp: Using placeholder metrics until dashboard refactor
  const metrics = { views: 0, engagement: 0, revenue: 0, change: { views: 0, engagement: 0, revenue: 0 } };
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalViews: 0,
    avgEngagement: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const loadRealTimeStats = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch real content metrics using authenticated user ID
      const contentMetrics = await realTimeIntegrationService.fetchRealContentMetrics(userId);
      
      // Combine with analytics data
      setStats({
        totalContent: contentMetrics.totalContent,
        publishedContent: contentMetrics.published,
        draftContent: contentMetrics.drafts,
        totalViews: metrics?.views || contentMetrics.totalViews,
        avgEngagement: metrics?.engagement || contentMetrics.totalEngagement,
        totalRevenue: metrics?.revenue || 0
      });
    } catch (error) {
      console.error('Error loading real-time stats:', error);
      // Set minimal stats on error
      setStats({
        totalContent: 0,
        publishedContent: 0,
        draftContent: 0,
        totalViews: 0,
        avgEngagement: 0,
        totalRevenue: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load stats if we have an authenticated user
    if (!user?.id) {
      setLoading(false);
      return;
    }

    loadRealTimeStats(user.id);

    // Subscribe to real-time updates with actual user ID
    const subscription = realTimeIntegrationService.subscribeToContentUpdates(
      user.id,
      () => {
        // Reload stats when content changes
        loadRealTimeStats(user.id);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, metrics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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

  if (loading || analyticsLoading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {[...Array(4)].map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <div className="h-32 bg-white/5 rounded-lg border border-white/10 animate-pulse"></div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <EnhancedStatCard
          title="Total Content"
          value={stats.totalContent}
          trend={{ 
            value: metrics?.change.views || 0, 
            positive: (metrics?.change.views || 0) >= 0 
          }}
          icon="FileText"
          description="All content items"
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <EnhancedStatCard
          title="Published"
          value={stats.publishedContent}
          trend={{ 
            value: Math.round(stats.publishedContent > 0 ? (stats.publishedContent / stats.totalContent) * 100 : 0), 
            positive: true 
          }}
          icon="Globe"
          description="Live content"
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <EnhancedStatCard
          title="Total Views"
          value={stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString()}
          trend={{ 
            value: metrics?.change.views || 0, 
            positive: (metrics?.change.views || 0) >= 0 
          }}
          icon="Eye"
          description="Page views"
        />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <EnhancedStatCard
          title="Revenue"
          value={`$${stats.totalRevenue > 1000 ? `${(stats.totalRevenue / 1000).toFixed(1)}K` : stats.totalRevenue.toFixed(0)}`}
          trend={{ 
            value: metrics?.change.revenue || 0, 
            positive: (metrics?.change.revenue || 0) >= 0 
          }}
          icon="DollarSign"
          description="Total revenue"
        />
      </motion.div>
    </motion.div>
  );
};
