
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
        
        {/* Service Status Indicators */}
        <div className="relative z-20 flex justify-center pt-4 pb-2">
          <div className="flex items-center gap-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-sm">
            <SimpleAIServiceIndicator size="sm" />
            <SimpleSerpServiceIndicator size="sm" />
          </div>
        </div>
        
        {/* Optimized Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-30 will-change-transform transform-gpu animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl opacity-20 will-change-transform transform-gpu animate-float" style={{ animationDelay: '2s' }} />
        </div>
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ContentStrategyHero onCreate={() => setCreatorOpen(true)} />
            
            <ContentStrategyContent />
          </motion.div>
        </main>
        
        {/* Strategy Creator Modal */}
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
