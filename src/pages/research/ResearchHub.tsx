import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Search, FileSearch, Users, ChevronDown } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentStrategyProvider } from '@/contexts/ContentStrategyContext';
import { ResearchHubHero } from '@/components/research/research-hub/ResearchHubHero';
import { SimpleAIServiceIndicator } from '@/components/content-builder/ai/SimpleAIServiceIndicator';
import { SimpleSerpServiceIndicator } from '@/components/content-builder/ai/SimpleSerpServiceIndicator';

// Import tab components
import { EnhancedContentGapsTab } from '@/components/research/research-hub/EnhancedContentGapsTab';
import { EnhancedPeopleQuestionsTab } from '@/components/research/research-hub/EnhancedPeopleQuestionsTab';
import { KeywordSerpTab } from '@/components/research/research-hub/KeywordSerpTab';
import { ResearchDataExporter } from '@/components/research/research-hub/ResearchDataExporter';

const ResearchHub = () => {
  const canonicalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/research/research-hub` 
    : '/research/research-hub';

  const [searchMode, setSearchMode] = useState('keywords');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [researchData, setResearchData] = useState<{
    serpData?: any;
    contentGaps?: any[];
    peopleQuestions?: any[];
  }>({});

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setHasSearched(true);
  };

  const handleDataUpdate = (type: string, data: any) => {
    setResearchData(prev => ({
      ...prev,
      [type]: data
    }));
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
          {/* Enhanced Background Effects */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div 
              className="absolute top-[15%] left-[25%] w-[400px] h-[400px] rounded-full bg-gradient-to-r from-neon-purple/15 via-neon-blue/10 to-transparent blur-[120px]"
              animate={{
                x: [0, 60, 0],
                y: [0, -40, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-l from-neon-pink/12 via-neon-purple/8 to-transparent blur-[100px]"
              animate={{
                x: [0, -40, 0],
                y: [0, 30, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 8
              }}
            />
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/5 blur-sm"
                style={{
                  width: Math.random() * 80 + 30,
                  height: Math.random() * 80 + 30,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  opacity: [0.1, 0.4, 0.1]
                }}
                transition={{
                  duration: Math.random() * 15 + 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ResearchHubHero />

            {/* Enhanced Unified Search Interface */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <div className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl p-8 rounded-xl shadow-2xl relative overflow-hidden">
                {/* Card background effects */}
                <div className="absolute inset-0 futuristic-grid opacity-5" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-neon-purple/8 to-neon-blue/4"
                  animate={{
                    background: [
                      "linear-gradient(to bottom right, rgba(155, 135, 245, 0.08), rgba(51, 195, 240, 0.04))",
                      "linear-gradient(to bottom right, rgba(155, 135, 245, 0.12), rgba(51, 195, 240, 0.06))",
                      "linear-gradient(to bottom right, rgba(155, 135, 245, 0.08), rgba(51, 195, 240, 0.04))"
                    ]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
                
                <div className="relative z-10 space-y-8">
                  {/* Enhanced Search Header */}
                  <motion.div 
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                      Research & Analysis
                    </h2>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                      Discover high-impact keywords, identify untapped content opportunities, and analyze what your audience is asking
                    </p>
                  </motion.div>

                  {/* Enhanced Search Interface */}
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <Select value={searchMode} onValueChange={setSearchMode}>
                          <SelectTrigger className="w-full lg:w-64 h-14 bg-white/5 border-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/80 backdrop-blur-xl border-white/20">
                            <SelectItem value="keywords" className="hover:bg-white/10">
                              <div className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-blue to-cyan-400 flex items-center justify-center">
                                  <Search className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">Keywords</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="content-gaps" className="hover:bg-white/10">
                              <div className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-purple to-purple-400 flex items-center justify-center">
                                  <FileSearch className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">Content Gaps</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="people-questions" className="hover:bg-white/10">
                              <div className="flex items-center gap-3 py-1">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-neon-pink to-pink-400 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-medium">People Questions</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                      
                      <div className="flex-1 flex gap-3">
                        <motion.div 
                          className="flex-1 relative group"
                          whileHover={{ scale: 1.01 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <Input
                            placeholder={
                              searchMode === 'keywords' ? 'Enter keyword to research...' :
                              searchMode === 'content-gaps' ? 'Enter topic to find content gaps...' :
                              'Enter topic to find questions...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="h-14 bg-white/5 border-white/20 hover:border-white/30 focus:border-neon-blue/50 transition-all duration-300 backdrop-blur-sm text-white placeholder:text-white/40 text-lg relative z-10"
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <Button 
                            onClick={handleSearch} 
                            disabled={!searchTerm.trim()}
                            className="h-14 px-8 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/25 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                          >
                            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2 font-medium">
                              <Search className="h-5 w-5" />
                              Analyze
                            </span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Enhanced Results Section */}
                  {hasSearched && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="pt-8 border-t border-white/10 relative"
                    >
                      {/* Results background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-purple/5 to-transparent blur-xl" />
                      
                      <div className="relative z-10">
                        {searchMode === 'keywords' && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-blue to-cyan-400 flex items-center justify-center">
                                <Search className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">Keyword Research Results</h3>
                                <p className="text-white/60">for "{searchTerm}"</p>
                              </div>
                            </div>
                            <KeywordSerpTab 
                              searchTerm={searchTerm} 
                              onDataUpdate={(data) => handleDataUpdate('serpData', data)}
                            />
                          </motion.div>
                        )}
                        
                        {searchMode === 'content-gaps' && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-purple to-purple-400 flex items-center justify-center">
                                <FileSearch className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">Content Gap Analysis</h3>
                                <p className="text-white/60">for "{searchTerm}"</p>
                              </div>
                            </div>
                            <EnhancedContentGapsTab 
                              searchTerm={searchTerm} 
                              onDataUpdate={(data) => handleDataUpdate('contentGaps', data)}
                            />
                          </motion.div>
                        )}
                        
                        {searchMode === 'people-questions' && (
                          <motion.div 
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-neon-pink to-pink-400 flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">People Questions</h3>
                                <p className="text-white/60">for "{searchTerm}"</p>
                              </div>
                            </div>
                            <EnhancedPeopleQuestionsTab 
                              searchTerm={searchTerm} 
                              onDataUpdate={(data) => handleDataUpdate('peopleQuestions', data)}
                            />
                          </motion.div>
                          )}
                        </div>

                        {/* Research Data Export Panel */}
                        {hasSearched && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="pt-6"
                          >
                            <ResearchDataExporter
                              searchTerm={searchTerm}
                              serpData={null}
                              contentGaps={[]}
                              peopleQuestions={[]}
                            />
                          </motion.div>
                        )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </ContentStrategyProvider>
  );
};

export default ResearchHub;