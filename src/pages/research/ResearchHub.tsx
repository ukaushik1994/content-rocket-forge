import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Search, FileSearch, Users, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { ResearchHubHero } from '@/components/research/research-hub/ResearchHubHero';
import { SimpleAIServiceIndicator } from '@/components/content-builder/ai/SimpleAIServiceIndicator';
import { SimpleSerpServiceIndicator } from '@/components/content-builder/ai/SimpleSerpServiceIndicator';

// Import existing tab components
import { KeywordIntelligenceTab } from '@/components/research/research-hub/KeywordIntelligenceTab';
import { ContentGapsTab } from '@/components/research/content-strategy/tabs/ContentGapsTab';
import { PeopleQuestionsTab } from '@/components/research/research-hub/PeopleQuestionsTab';

const ResearchHub = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/research-hub` 
    : '/research/research-hub';

  // Get initial tab from URL hash or localStorage
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['keyword-intelligence', 'content-gaps', 'people-questions', 'serp-intelligence'].includes(hash)) {
        return hash;
      }
      return localStorage.getItem('researchHubActiveTab') || 'keyword-intelligence';
    }
    return 'keyword-intelligence';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('researchHubActiveTab', value);
      window.location.hash = value;
    }
  };

  return (
    <ContentStrategyProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <Helmet>
          <title>Research Hub — Unified Content Intelligence Platform</title>
          <meta name="description" content="Comprehensive research workspace with keyword intelligence, content gaps analysis, people questions, and content pipeline management." />
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
        
        {/* Animated Background - matching Repository design */}
        <AnimatedBackground intensity="medium" />
        
        <main className="flex-1 container py-8 z-10 relative max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ResearchHubHero />

            {/* Main Tabs Interface - Exact Content Strategy Layout */}
            <GlassCard className="p-4 sm:p-6">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="flex flex-col gap-6">
                  <div className="w-full overflow-x-auto">
                    <TabsList className="inline-flex min-w-max rounded-lg border border-border/50 bg-muted/50 p-1">
                      <TabsTrigger 
                        value="keyword-intelligence" 
                        className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                      >
                        <Search className="h-4 w-4" />
                        Keyword Intelligence
                      </TabsTrigger>
                      <TabsTrigger 
                        value="content-gaps" 
                        className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                      >
                        <FileSearch className="h-4 w-4" />
                        Content Gaps
                      </TabsTrigger>
                      <TabsTrigger 
                        value="people-questions" 
                        className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                      >
                        <Users className="h-4 w-4" />
                        People Questions
                      </TabsTrigger>
                      <TabsTrigger 
                        value="serp-intelligence" 
                        className="px-3 py-2 text-xs sm:text-sm whitespace-nowrap gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                      >
                        <Brain className="h-4 w-4" />
                        SERP Intelligence
                      </TabsTrigger>
                    </TabsList>
                  </div>

                   <div className="flex-1">
                     <TabsContent value="keyword-intelligence" className="mt-0 animate-fade-in">
                       <KeywordIntelligenceTab />
                     </TabsContent>

                     <TabsContent value="content-gaps" className="mt-0 animate-fade-in">
                       <ContentGapsTab goals={{ monthlyTraffic: '', contentPieces: '', timeline: '3 months', mainKeyword: '' }} />
                     </TabsContent>

                     <TabsContent value="people-questions" className="mt-0 animate-fade-in">
                       <PeopleQuestionsTab />
                     </TabsContent>

                     <TabsContent value="serp-intelligence" className="mt-0 animate-fade-in">
                       <div className="text-center py-8">
                         <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                         <h3 className="text-lg font-medium mb-2">SERP Intelligence Platform</h3>
                         <p className="text-muted-foreground mb-4">
                           Access advanced SERP monitoring, AI insights, and marketing integrations
                         </p>
                         <Button onClick={() => window.open('/research/serp-intelligence', '_blank')}>
                           Launch SERP Intelligence
                         </Button>
                       </div>
                     </TabsContent>
                   </div>
                 </div>
              </Tabs>
            </GlassCard>
          </motion.div>
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default ResearchHub;