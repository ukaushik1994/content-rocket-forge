
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { ContentStrategyHero } from '@/components/research/content-strategy/ContentStrategyHero';
import { GoalSettingCard } from '@/components/research/content-strategy/GoalSettingCard';
import { StrategyTabs } from '@/components/research/content-strategy/StrategyTabs';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { motion } from 'framer-motion';
import { StrategyCreationModal } from '@/components/research/content-strategy/StrategyCreationModal';
import { SimpleAIServiceIndicator } from '@/components/content-builder/ai/SimpleAIServiceIndicator';
import { SimpleSerpServiceIndicator } from '@/components/content-builder/ai/SimpleSerpServiceIndicator';

const ContentStrategy = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/content-strategy` 
    : '/research/content-strategy';
  const [creatorOpen, setCreatorOpen] = useState(false);
  
  return (
    <ContentStrategyProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Helmet>
          <title>Content Strategy — Plan, Calendar, Pipeline</title>
          <meta name="description" content="Content strategy workspace to plan, track, and optimize: strategies, dashboard, calendar, pipeline, opportunities, performance, gaps, progress." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        
        <Navbar />
        
        {/* Enhanced Service Status Indicators */}
        <div className="relative z-20 flex justify-center pt-4 pb-2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 glass-panel rounded-full px-6 py-3 shadow-lg"
          >
            <SimpleAIServiceIndicator size="sm" />
            <SimpleSerpServiceIndicator size="sm" />
          </motion.div>
        </div>
        
        {/* Enhanced Background with Depth */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/8 to-purple-500/6 rounded-full filter blur-3xl opacity-40 will-change-transform transform-gpu animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-l from-blue-500/6 to-cyan-500/4 rounded-full filter blur-3xl opacity-30 will-change-transform transform-gpu animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full filter blur-3xl opacity-20 will-change-transform transform-gpu animate-pulse-glow" />
          
          {/* Futuristic Grid Pattern */}
          <div className="absolute inset-0 futuristic-grid opacity-[0.02]" />
        </div>
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <ContentStrategyHero onCreate={() => setCreatorOpen(true)} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <ContentStrategyContent />
            </motion.div>
          </motion.div>
        </main>
        
        {/* Enhanced Strategy Creator Modal */}
        <StrategyCreationModal open={creatorOpen} onOpenChange={setCreatorOpen} />
      </div>
    </ContentStrategyProvider>
  );
};

const ContentStrategyContent = React.memo(() => {
  return (
    <>
      <GoalSettingCard />
      <StrategyTabs />
    </>
  );
});

ContentStrategyContent.displayName = 'ContentStrategyContent';

export default ContentStrategy;
