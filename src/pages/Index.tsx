import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { FileText, Search, BarChart3, Fingerprint, Activity, Target, Clock, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };
  const fadeInVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };
  return <div className="min-h-screen flex flex-col bg-background">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-neon-purple/10 to-transparent opacity-30" />
        <div className="absolute top-[150px] left-[10%] w-[500px] h-[500px] rounded-full bg-neon-blue opacity-[0.03] blur-[120px]" />
        <div className="absolute top-[300px] right-[15%] w-[400px] h-[400px] rounded-full bg-neon-purple opacity-[0.03] blur-[120px]" />
      </div>
      
      <Navbar />
      
      <main className="flex-1 py-8 relative">
        <Container className="mb-8">
          <motion.div className="space-y-8" initial="hidden" animate={isLoaded ? "visible" : "hidden"} variants={containerVariants}>
            {/* Welcome Section */}
            <motion.div variants={itemVariants}>
              <WelcomeSection setFeedbackOpen={setFeedbackOpen} navigate={navigate} />
            </motion.div>
            
            {/* Performance Overview - Updated with charts */}
            <motion.div variants={itemVariants}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-medium">Performance Overview</h2>
                <motion.div variants={fadeInVariants} className="text-xs text-muted-foreground">
                  Last 7 days
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="col-span-1 lg:col-span-2">
                  <PerformanceChart />
                </div>
                <div className="col-span-1 space-y-4">
                  <StatCard title="Content Created" value="37" description="8 published this month" icon="FileText" trend={{
                  value: 18,
                  positive: true
                }} className="h-[calc(50%-0.5rem)]" />
                  
                  <StatCard title="Audience Growth" value="14.2%" description="New visitors" icon="Users" trend={{
                  value: 3.5,
                  positive: true
                }} className="h-[calc(50%-0.5rem)]" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 py-[147px] my-0 mx-[240px] px-[240px]">
                <StatCard title="Total Projects" value="12" description="2 active workflows" icon="FileText" trend={{
                value: 33,
                positive: true
              }} />
                
                <StatCard title="Keywords Analyzed" value="284" description="Last 30 days" icon="Search" trend={{
                value: 12,
                positive: true
              }} />
                
                <StatCard title="Average SEO Score" value="78/100" description="Across all content" icon="BarChart3" trend={{
                value: 5,
                positive: true
              }} />
                
                <StatCard title="Conversions" value="5.4%" description="From content links" icon="Fingerprint" trend={{
                value: 2,
                positive: false
              }} />
              </div>
            </motion.div>
            
            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
              <QuickActionsGrid navigate={navigate} />
            </motion.div>
          </motion.div>
        </Container>
      </main>
      
      {/* Feedback dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>;
};
export default Index;