
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
        <Helmet>
          <title>Content Strategy — Plan, Calendar, Pipeline</title>
          <meta name="description" content="Content strategy workspace to plan, track, and optimize: strategies, dashboard, calendar, pipeline, opportunities, performance, gaps, progress." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        
        <Navbar />
        
        {/* Service Status Indicators */}
        <div className="relative z-20 flex justify-end pr-6 pt-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 bg-card/95 backdrop-blur-md border border-border/40 rounded-xl px-4 py-2 shadow-lg"
          >
            <SimpleAIServiceIndicator size="sm" />
            <SimpleSerpServiceIndicator size="sm" />
          </motion.div>
        </div>
        
        {/* Modern Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-primary/4 rounded-full filter blur-3xl opacity-60" />
          <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-accent/3 rounded-full filter blur-3xl opacity-40" />
          <div className="absolute top-3/4 left-1/2 w-48 h-48 bg-secondary/5 rounded-full filter blur-2xl opacity-50" />
        </div>
        
        <main className="flex-1 container py-12 z-10 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-12"
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
