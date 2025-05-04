
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { 
  FileText, 
  Search, 
  BarChart3, 
  Fingerprint, 
  Activity, 
  Target, 
  Clock, 
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';

const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
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

  // Enhanced animation variants for performance section
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

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 70,
        damping: 15,
        delay: 0.4
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
            
            {/* Quick Actions - Moved Above Performance Overview */}
            <motion.div variants={itemVariants} className="pt-2"> 
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <QuickActionsGrid navigate={navigate} />
            </motion.div>
            
            {/* Performance Overview - With stat cards MOVED ABOVE the chart */}
            <motion.div 
              variants={performanceVariants} 
              className="relative"
            >
              {/* Section header with enhanced styling */}
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
              
              {/* Stat cards grid MOVED ABOVE the chart with staggered animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <motion.div variants={statCardVariants} custom={0}>
                  <StatCard 
                    title="Total Projects" 
                    value="12" 
                    description="2 active workflows" 
                    icon="FileText"
                    trend={{
                      value: 33,
                      positive: true
                    }}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={1}>
                  <StatCard 
                    title="Keywords Analyzed" 
                    value="284" 
                    description="Last 30 days" 
                    icon="Search"
                    trend={{
                      value: 12,
                      positive: true
                    }}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={2}>
                  <StatCard 
                    title="Average SEO Score" 
                    value="78/100" 
                    description="Across all content" 
                    icon="BarChart3"
                    trend={{
                      value: 5,
                      positive: true
                    }}
                  />
                </motion.div>
                
                <motion.div variants={statCardVariants} custom={3}>
                  <StatCard 
                    title="Conversions" 
                    value="5.4%" 
                    description="From content links" 
                    icon="Fingerprint"
                    trend={{
                      value: 2,
                      positive: false
                    }}
                  />
                </motion.div>
              </div>
              
              {/* Enhanced grid layout with performance chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  className="col-span-1 lg:col-span-2"
                  variants={chartVariants}
                >
                  <PerformanceChart />
                </motion.div>
                
                <div className="col-span-1 space-y-6">
                  <motion.div variants={statCardVariants} custom={4}>
                    <StatCard 
                      title="Content Created" 
                      value="37" 
                      description="8 published this month" 
                      icon="FileText"
                      trend={{
                        value: 18,
                        positive: true
                      }}
                    />
                  </motion.div>
                  
                  <motion.div variants={statCardVariants} custom={5}>
                    <StatCard 
                      title="Audience Growth" 
                      value="14.2%" 
                      description="New visitors" 
                      icon="Users"
                      trend={{
                        value: 3.5,
                        positive: true
                      }}
                    />
                  </motion.div>
                </div>
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
