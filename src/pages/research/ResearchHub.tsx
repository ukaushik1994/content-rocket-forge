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


const ResearchHub = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/research-hub` 
    : '/research/research-hub';

  // Get initial tab from URL hash or localStorage (updated for 4 tabs)
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['keyword-intelligence', 'content-gaps', 'people-questions', 'research-insights'].includes(hash)) {
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
        
        {/* Enhanced Premium Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-primary/20 via-blue-500/15 to-purple-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-l from-purple-500/15 via-primary/20 to-blue-600/15 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-br from-cyan-500/10 via-blue-400/15 to-primary/20 rounded-full filter blur-3xl opacity-25 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
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
              {/* Premium Icon Container */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  className="relative p-4 bg-gradient-to-br from-primary/30 via-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 235, 59, 0.1), rgba(139, 69, 255, 0.1), rgba(59, 130, 246, 0.1))',
                    boxShadow: '0 20px 40px -10px rgba(255, 235, 59, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Search className="h-10 w-10 text-white drop-shadow-lg" />
                  {/* Floating particles effect */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute top-2 right-2 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                    <div className="absolute bottom-3 left-3 w-1 h-1 bg-primary/80 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-blue-400/60 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Title */}
              <div className="space-y-4">
                <motion.h1 
                  className="text-6xl font-bold bg-gradient-to-r from-white via-primary to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Research Hub
                </motion.h1>
                
                {/* Premium subtitle with enhanced styling */}
                <motion.p 
                  className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  Your <span className="text-primary font-semibold">unified research command center</span>. 
                  Discover keywords, analyze content gaps, understand audience questions, and create content—all in one place.
                </motion.p>
              </div>

              {/* Feature highlights */}
              <motion.div 
                className="flex items-center justify-center gap-8 text-sm text-white/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>Real-time SERP Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span>Content Generation</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Premium Tabs Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <GlassCard className="border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/5 backdrop-blur-2xl shadow-2xl">
                <div className="p-6">
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    {/* Enhanced TabsList with premium styling */}
                    <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-black/20 via-black/10 to-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-inner">
                      <TabsTrigger 
                        value="keyword-intelligence" 
                        className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10"
                      >
                        <Search className="h-4 w-4" />
                        <span className="hidden lg:inline">Keyword Intelligence</span>
                        <span className="lg:hidden">Keywords</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="content-gaps" 
                        className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10"
                      >
                        <FileSearch className="h-4 w-4" />
                        <span className="hidden lg:inline">Content Gaps</span>
                        <span className="lg:hidden">Gaps</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="people-questions" 
                        className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10"
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden lg:inline">People Questions</span>
                        <span className="lg:hidden">Questions</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="research-insights" 
                        className="flex items-center gap-2 rounded-lg transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-white/10"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden lg:inline">Research Insights</span>
                        <span className="lg:hidden">Insights</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Enhanced Tab Content with premium animations */}
                    <div className="mt-8">
                      <TabsContent value="keyword-intelligence" className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <KeywordIntelligenceTab />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="content-gaps" className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <ContentGapsTab goals={{ monthlyTraffic: '', contentPieces: '', timeline: '3 months', mainKeyword: '' }} />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="people-questions" className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <PeopleQuestionsTab />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="research-insights" className="space-y-6">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <ResearchInsightsTab />
                        </motion.div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default ResearchHub;