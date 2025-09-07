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
            {/* Enhanced Hero Section */}
            <motion.div 
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
                  Research Hub
                </h1>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Search className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              >
                Your unified research command center. Discover keywords, analyze content gaps, understand audience questions, and create content—all in one place.
              </motion.p>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex items-center justify-center gap-6 text-sm text-white/60 flex-wrap"
              >
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <Search className="h-4 w-4 text-blue-400" />
                  <span>Keyword Intelligence</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <FileSearch className="h-4 w-4 text-purple-400" />
                  <span>Content Gaps</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <Users className="h-4 w-4 text-green-400" />
                  <span>People Questions</span>
                </motion.div>
                <motion.div 
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <BarChart3 className="h-4 w-4 text-orange-400" />
                  <span>Research Insights</span>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Main Tabs Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <GlassCard className="border-white/20 bg-card/40 backdrop-blur-2xl shadow-2xl ring-1 ring-white/10">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl p-1 shadow-lg">
                  <TabsTrigger 
                    value="keyword-intelligence" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/10"
                  >
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Keyword Intelligence</span>
                    <span className="sm:hidden">Keywords</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-gaps" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/10"
                  >
                    <FileSearch className="h-4 w-4" />
                    <span className="hidden sm:inline">Content Gaps</span>
                    <span className="sm:hidden">Gaps</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="people-questions" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/10"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">People Questions</span>
                    <span className="sm:hidden">Questions</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="research-insights" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/10"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Research Insights</span>
                    <span className="sm:hidden">Insights</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="content-pipeline" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Content Pipeline</span>
                    <span className="sm:hidden">Pipeline</span>
                  </TabsTrigger>
                </TabsList>

                <motion.div 
                  className="mt-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <TabsContent value="keyword-intelligence" className="space-y-6 m-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <KeywordIntelligenceTab />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="content-gaps" className="space-y-6 m-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContentGapsTab goals={{ monthlyTraffic: '', contentPieces: '', timeline: '3 months', mainKeyword: '' }} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="people-questions" className="space-y-6 m-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PeopleQuestionsTab />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="research-insights" className="space-y-6 m-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ResearchInsightsTab />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="content-pipeline" className="space-y-6 m-0">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContentPipelineTab />
                    </motion.div>
                  </TabsContent>
                </motion.div>
              </Tabs>
              </GlassCard>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default ResearchHub;