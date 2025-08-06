
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { ContentStrategyHero } from '@/components/research/content-strategy/ContentStrategyHero';
import { GoalSettingCard } from '@/components/research/content-strategy/GoalSettingCard';
import { StrategyTabs } from '@/components/research/content-strategy/StrategyTabs';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { motion } from 'framer-motion';

const ContentStrategy = () => {
  return (
    <ContentStrategyProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Helmet>
          <title>Content Strategy | Research Platform</title>
        </Helmet>
        
        <Navbar />
        
        {/* Optimized Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl opacity-30 will-change-transform transform-gpu animate-float"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl opacity-20 will-change-transform transform-gpu animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ContentStrategyHero />
            
            <ContentStrategyContent />
          </motion.div>
        </main>
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
