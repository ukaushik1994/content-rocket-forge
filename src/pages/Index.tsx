
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { EnhancedStatCard } from '@/components/dashboard/EnhancedStatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { EnhancedQuickActionsGrid } from '@/components/dashboard/EnhancedQuickActionsGrid';
import { EnhancedPerformanceChart } from '@/components/dashboard/EnhancedPerformanceChart';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { metrics, loading, error, refreshData } = useDashboardData();
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    refreshData();
    toast.success('Dashboard data refreshed');
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  const performanceVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.12,
        delayChildren: 0.3
      }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 80, 
        delay: 0.5 + (custom * 0.1)
      }
    })
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading dashboard: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background elements with proper z-index */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neon-purple/10 to-transparent opacity-30" />
        <div className="absolute top-[150px] left-[10%] w-[500px] h-[500px] rounded-full bg-neon-blue opacity-[0.03] blur-[120px]" />
        <div className="absolute top-[300px] right-[15%] w-[400px] h-[400px] rounded-full bg-neon-purple opacity-[0.03] blur-[120px]" />
      </div>
      
      <Navbar />
      
      <main className="flex-1 py-8 relative z-0">
        <Container className="mb-8">
          <motion.div 
            className="space-y-12" 
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {/* Welcome Section */}
            <motion.div variants={itemVariants}>
              <WelcomeSection setFeedbackOpen={setFeedbackOpen} navigate={navigate} />
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="pt-2"> 
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Quick Actions</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-8 px-2"
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <EnhancedQuickActionsGrid />
            </motion.div>
            
            {/* Performance Overview */}
            <motion.div 
              variants={performanceVariants} 
              className="relative"
            >
              <motion.div 
                variants={fadeInVariants}
                className="mb-5 flex items-center justify-between"
              >
                <motion.h2 
                  className="text-xl font-medium flex items-center gap-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.div 
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(155, 135, 245, 0.3)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Activity className="h-4 w-4 text-primary" />
                  </motion.div>
                  Performance Overview
                </motion.h2>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center px-3 py-1.5 rounded-full bg-white/5 text-xs font-medium text-muted-foreground border border-white/10"
                >
                  <Clock className="h-3 w-3 mr-1.5 text-primary" />
                  Last 7 days
                </motion.div>
              </motion.div>
              
              {/* Stat cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div variants={statCardVariants} custom={0}>
                  <EnhancedStatCard 
                    title="Total Projects" 
                    value={metrics.totalProjects} 
                    description="2 active workflows" 
                    icon="FileText"
                    trend={metrics.trends.projects}
                    loading={loading}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={1}>
                  <EnhancedStatCard 
                    title="Keywords Analyzed" 
                    value={metrics.keywordsAnalyzed} 
                    description="Last 30 days" 
                    icon="Search"
                    trend={metrics.trends.keywords}
                    loading={loading}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={2}>
                  <EnhancedStatCard 
                    title="Average SEO Score" 
                    value={`${metrics.averageSeoScore}/100`} 
                    description="Across all content" 
                    icon="BarChart3"
                    trend={metrics.trends.seoScore}
                    loading={loading}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={3}>
                  <EnhancedStatCard 
                    title="Conversions" 
                    value={`${metrics.conversions}%`} 
                    description="From content links" 
                    icon="Fingerprint"
                    trend={metrics.trends.conversions}
                    loading={loading}
                  />
                </motion.div>
              </div>
              
              {/* Performance chart */}
              <EnhancedPerformanceChart />
              
              {/* Additional stat cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <motion.div variants={statCardVariants} custom={4}>
                  <EnhancedStatCard 
                    title="Content Created" 
                    value={metrics.contentCreated} 
                    description="8 published this month" 
                    icon="FileText"
                    trend={metrics.trends.content}
                    loading={loading}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={5}>
                  <EnhancedStatCard 
                    title="Audience Growth" 
                    value={`${metrics.audienceGrowth}%`} 
                    description="New visitors" 
                    icon="Users"
                    trend={metrics.trends.audience}
                    loading={loading}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </main>
      
      {/* Feedback dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default Index;
