import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, FileSearch, Users, BarChart3, Plus, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui/GlassCard';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';

// Import existing tab components
import { KeywordIntelligenceTab } from '@/components/research/research-hub/KeywordIntelligenceTab';
import { ContentGapsTab } from '@/components/research/content-strategy/tabs/ContentGapsTab';
import { PeopleQuestionsTab } from '@/components/research/research-hub/PeopleQuestionsTab';
import { ResearchInsightsTab } from '@/components/research/research-hub/ResearchInsightsTab';
import { ContentPipelineTab } from '@/components/research/research-hub/ContentPipelineTab';

const ResearchHub = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/research-hub` 
    : '/research/research-hub';

  // Get initial tab from URL hash or localStorage
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['keyword-intelligence', 'content-gaps', 'people-questions', 'research-insights', 'content-pipeline'].includes(hash)) {
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
            {/* Hero Section */}
            <motion.div 
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <motion.div
                  className="p-3 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="h-8 w-8 text-primary" />
                </motion.div>
              </div>
              <h1 className="text-5xl font-bold text-gradient bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Research Hub
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your unified research command center. Discover keywords, analyze content gaps, understand audience questions, and create content—all in one place.
              </p>
            </motion.div>

            {/* Main Tabs Interface */}
            <GlassCard className="border-white/10 bg-background/40 backdrop-blur-xl">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-1">
                  <TabsTrigger 
                    value="keyword-intelligence" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Keyword Intelligence</span>
                    <span className="sm:hidden">Keywords</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-gaps" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <FileSearch className="h-4 w-4" />
                    <span className="hidden sm:inline">Content Gaps</span>
                    <span className="sm:hidden">Gaps</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="people-questions" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">People Questions</span>
                    <span className="sm:hidden">Questions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="research-insights" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Research Insights</span>
                    <span className="sm:hidden">Insights</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-pipeline" 
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Content Pipeline</span>
                    <span className="sm:hidden">Pipeline</span>
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="keyword-intelligence" className="space-y-6">
                    <KeywordIntelligenceTab />
                  </TabsContent>

                  <TabsContent value="content-gaps" className="space-y-6">
                    <ContentGapsTab goals={{ monthlyTraffic: '', contentPieces: '', timeline: '3 months', mainKeyword: '' }} />
                  </TabsContent>

                  <TabsContent value="people-questions" className="space-y-6">
                    <PeopleQuestionsTab />
                  </TabsContent>

                  <TabsContent value="research-insights" className="space-y-6">
                    <ResearchInsightsTab />
                  </TabsContent>

                  <TabsContent value="content-pipeline" className="space-y-6">
                    <ContentPipelineTab />
                  </TabsContent>
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