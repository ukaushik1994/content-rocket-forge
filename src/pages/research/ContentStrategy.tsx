import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentStrategyHero } from '@/components/research/content-strategy/ContentStrategyHero';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageBreadcrumb } from '@/components/shared/PageBreadcrumb';
import { StrategyCreationModal } from '@/components/research/content-strategy/StrategyCreationModal';
import { StrategyGoalsModal } from '@/components/research/content-strategy/simplified/StrategyGoalsModal';
import { ContentStrategyTabs } from '@/components/research/content-strategy/simplified/ContentStrategyTabs';
const ContentStrategy = () => {
  const canonicalUrl = typeof window !== 'undefined' ? `${window.location.origin}/research/content-strategy` : '/research/content-strategy';
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  return <ContentStrategyProvider>
      <PageContainer className="relative overflow-hidden">
        <Helmet>
          <title>Content Strategy — AI-Powered Content Planning & Production</title>
          <meta name="description" content="Complete content strategy workspace with AI proposals, production pipeline, editorial calendar, and performance analytics. Plan, create, and optimize your content strategy." />
          <link rel="canonical" href={canonicalUrl} />
        </Helmet>
        
        
        {/* Animated Background - matching Repository design */}
        <AnimatedBackground intensity="medium" />
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
          <PageBreadcrumb section="Research" page="Content Strategy" />
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="space-y-8">
            <ContentStrategyHero onCreate={() => setGoalsModalOpen(true)} />
            
            <ContentStrategyTabs onEditGoals={() => setGoalsModalOpen(true)} />
          </motion.div>
        </main>
        
        {/* Strategy Creator Modal (Legacy) - Inside Provider */}
        <StrategyCreationModal open={creatorOpen} onOpenChange={setCreatorOpen} />
        
        {/* Strategy Goals Modal (New Simplified) - Inside Provider */}
        <StrategyGoalsModal open={goalsModalOpen} onOpenChange={setGoalsModalOpen} />
      </PageContainer>
    </ContentStrategyProvider>;
};

// Removed ContentStrategyContent - now using simplified tabs approach

export default ContentStrategy;