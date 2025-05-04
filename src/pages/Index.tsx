
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { RecentProjectsSection } from '@/components/dashboard/RecentProjectsSection';
import { QuickActionsGrid } from '@/components/dashboard/QuickActionsGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FeedbackDialog } from '@/components/feedback/FeedbackDialog';
import { RocketIcon, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Index = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
      }
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
  
  return (
    <div className="min-h-screen flex flex-col bg-background bg-slate-950">
      <Navbar />
      
      <main className="flex-1 container py-8 overflow-hidden">
        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <WelcomeSection setFeedbackOpen={setFeedbackOpen} navigate={navigate} />
          </motion.div>
          
          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Projects" 
                value="12" 
                description="2 active workflows" 
                icon="FileText"
                trend={{
                  value: 33,
                  positive: true
                }}
                className="transform transition-all hover:scale-[1.02] hover:shadow-neon" 
              />
              <StatCard 
                title="Keywords Analyzed" 
                value="284" 
                description="Last 30 days" 
                icon="Search"
                trend={{
                  value: 12,
                  positive: true
                }}
                className="transform transition-all hover:scale-[1.02] hover:shadow-neon" 
              />
              <StatCard 
                title="Average SEO Score" 
                value="78/100" 
                description="Across all content" 
                icon="BarChart3"
                trend={{
                  value: 5,
                  positive: true
                }}
                className="transform transition-all hover:scale-[1.02] hover:shadow-neon" 
              />
              <StatCard 
                title="Conversions" 
                value="5.4%" 
                description="From content links" 
                icon="Fingerprint"
                trend={{
                  value: 2,
                  positive: false
                }}
                className="transform transition-all hover:scale-[1.02] hover:shadow-neon" 
              />
            </div>
          </motion.div>
          
          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActionsGrid navigate={navigate} />
          </motion.div>
          
          {/* Recent Projects */}
          <motion.div variants={itemVariants}>
            <RecentProjectsSection navigate={navigate} />
          </motion.div>
        </motion.div>
      </main>
      
      {/* Feedback dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default Index;
