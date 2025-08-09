
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { ContentStrategyHero } from '@/components/research/content-strategy/ContentStrategyHero';
import { GoalSettingCard } from '@/components/research/content-strategy/GoalSettingCard';
import { StrategyTabs } from '@/components/research/content-strategy/StrategyTabs';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { motion } from 'framer-motion';
import { StrategyCreationModal } from '@/components/research/content-strategy/StrategyCreationModal';
import { PageBackground } from '@/components/layout/PageBackground';

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
        
        {/* Background FX */}
        <PageBackground />
        
        <main className="flex-1 container py-12 z-10 relative max-w-7xl mx-auto">
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

const ContentStrategyContent = () => {
  return (
    <>
      <GoalSettingCard />
      <StrategyTabs />
    </>
  );
};

export default ContentStrategy;
