
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { ContentStrategyHero } from '@/components/research/content-strategy/ContentStrategyHero';
import { GoalSettingCard } from '@/components/research/content-strategy/GoalSettingCard';
import { StrategyTabs } from '@/components/research/content-strategy/StrategyTabs';
import { motion } from 'framer-motion';

const ContentStrategy = () => {
  const [goals, setGoals] = useState({
    monthlyTraffic: '',
    contentPieces: '',
    timeline: '3 months',
    mainKeyword: ''
  });

  const [serpMetrics, setSerpMetrics] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Helmet>
        <title>Content Strategy | Research Platform</title>
      </Helmet>
      
      <Navbar />
      
      {/* Enhanced Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full filter blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="futuristic-grid absolute inset-0 opacity-5"></div>
      </div>
      
      <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ContentStrategyHero />
          
          <GoalSettingCard 
            goals={goals}
            setGoals={setGoals}
            serpMetrics={serpMetrics}
            setSerpMetrics={setSerpMetrics}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />

          <StrategyTabs serpMetrics={serpMetrics} goals={goals} />
        </motion.div>
      </main>
    </div>
  );
};

export default ContentStrategy;
