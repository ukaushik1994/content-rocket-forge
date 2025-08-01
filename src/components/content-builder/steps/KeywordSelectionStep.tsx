
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings, Zap, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSerpStatus } from '@/components/content-builder/serp/EnhancedSerpStatus';
import { NoDataAvailable } from './NoDataAvailable';
import { SerpAnalysisModal } from './keyword-analysis/SerpAnalysisModal';
import { SelectionManagerModal } from './keyword-analysis/SelectionManagerModal';
import { SelectionSummaryCard } from './keyword-analysis/SelectionSummaryCard';

interface ApiKeysStatus {
  serpApi: {
    configured: boolean;
    working: boolean;
  };
  serpstack: {
    configured: boolean;
    working: boolean;
  };
}

export const KeywordSelectionStep = () => {
  const {
    state,
    dispatch,
    analyzeKeyword,
    generateOutlineFromSelections
  } = useContentBuilder();
  
  const {
    mainKeyword,
    selectedKeywords,
    serpData,
    serpSelections,
    isAnalyzing
  } = state;
  
  const [hasSearched, setHasSearched] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<ApiKeysStatus>({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [showSerpAnalysisModal, setShowSerpAnalysisModal] = useState(false);
  const [showSelectionManagerModal, setShowSelectionManagerModal] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  
  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
      });

      // Also mark SERP analysis step as completed
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 2
      });
    }
  }, [mainKeyword, selectedKeywords, dispatch]);
  
  // Handle status updates from the EnhancedSerpStatus component
  const handleStatusChange = (status: ApiKeysStatus) => {
    setApiKeysStatus(status);
  };
  
  const handleKeywordSearch = async (keyword: string, searchSuggestions: string[]) => {
    // Set the main keyword
    dispatch({
      type: 'SET_MAIN_KEYWORD',
      payload: keyword
    });

    // Add it to selected keywords if not already there
    if (!selectedKeywords.includes(keyword)) {
      dispatch({
        type: 'ADD_KEYWORD',
        payload: keyword
      });
    }

    // Automatically start SERP analysis when a keyword is entered
    setHasSearched(true);
    await analyzeKeyword(keyword);
  };
  
  const handleRemoveKeyword = (kw: string) => {
    dispatch({
      type: 'REMOVE_KEYWORD',
      payload: kw
    });
  };
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Handle generating outline from selections
  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      await generateOutlineFromSelections();
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  // Handle clearing all selections
  const handleClearAllSelections = () => {
    const selectedItems = serpSelections.filter(item => item.selected);
    selectedItems.forEach(item => {
      handleToggleSelection(item.type, item.content);
    });
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };
  
  const selectedCount = serpSelections.filter(item => item.selected).length;
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.4, 0.2, 0.4],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-12">
          {/* Enhanced Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl glass-panel p-8 holographic-border"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 animate-gradient-shift bg-300%" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-3 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl backdrop-blur-sm border border-white/20 neon-glow">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-holographic">
                  AI-Powered Keyword Research
                </h2>
                <p className="text-gray-400 font-medium">
                  Discover content opportunities with advanced SERP analysis
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30"
            >
              <Rocket className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-300">Next-Gen Analysis</span>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EnhancedSerpStatus onStatusChange={handleStatusChange} />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Keyword search section */}
      <div className="space-y-8">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <Label htmlFor="main-keyword" className="text-lg font-semibold flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <span className="text-holographic">Primary Keyword</span>
            </Label>
            <motion.div 
              className="px-4 py-2 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-white/20 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-sm text-gray-300 font-medium">🚀 Powered by AI</span>
            </motion.div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-50" />
            <div className="relative glass-card rounded-2xl p-1 border-2 border-white/20">
              <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {!hasSearched && (
            <motion.div 
              className="flex flex-col items-center justify-center py-24 text-center relative"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="initial-state"
            >
              {/* Floating elements */}
              <div className="absolute inset-0 floating-particles" />
              
              <motion.div 
                className="relative mb-8"
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-2xl" />
                <div className="relative p-8 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full backdrop-blur-sm border border-white/20">
                  <TrendingUp className="h-16 w-16 text-primary" />
                </div>
              </motion.div>
              
              <motion.h3 
                className="text-3xl font-bold mb-4 text-holographic"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Begin Your SEO Journey
              </motion.h3>
              
              <motion.p 
                className="text-gray-400 max-w-2xl text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Enter your target keyword to unlock comprehensive SERP intelligence, 
                competitor insights, and AI-powered content opportunities that will dominate search results
              </motion.p>
              
              <motion.div 
                className="mt-8 flex items-center gap-2 text-sm text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Zap className="h-4 w-4" />
                <span>Real-time analysis • Competitor intelligence • Content gaps</span>
              </motion.div>
            </motion.div>
          )}
          
          {hasSearched && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              key="results-state"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Keywords and Selection Summary */}
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="card-3d">
                    <SelectedKeywords 
                      keywords={selectedKeywords} 
                      onRemoveKeyword={handleRemoveKeyword} 
                    />
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card-3d"
                  >
                    <SelectionSummaryCard
                      serpSelections={serpSelections}
                      onOpenSelectionManager={() => setShowSelectionManagerModal(true)}
                      onGenerateOutline={handleGenerateOutline}
                      isGenerating={isGeneratingOutline}
                    />
                  </motion.div>
                </motion.div>
                
                {/* Right column - SERP Analysis Results */}
                <motion.div 
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isAnalyzing ? (
                    <Card className="glass-card card-3d overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10 animate-gradient-shift bg-300%" />
                      <CardContent className="flex items-center justify-center py-20 relative z-10">
                        <div className="text-center space-y-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="mx-auto"
                          >
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                              <Loader2 className="h-12 w-12 text-primary relative z-10" />
                            </div>
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-bold text-holographic mb-2">
                              Analyzing Keyword Intelligence
                            </h3>
                            <p className="text-gray-400">
                              Extracting SERP data, competitor insights, and content opportunities...
                            </p>
                          </div>
                          <motion.div 
                            className="flex justify-center space-x-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : serpData ? (
                    <Card className="glass-card card-3d overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
                      
                      <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center justify-between">
                          <motion.div 
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-white/20 neon-glow">
                              <BarChart3 className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                              <span className="text-xl text-holographic">SERP Intelligence</span>
                              <p className="text-sm text-gray-400 font-normal">Advanced competitive analysis</p>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex gap-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSerpAnalysisModal(true)}
                              className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Explore Data
                            </Button>
                            {selectedCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSelectionManagerModal(true)}
                                className="bg-gradient-to-r from-primary/20 to-blue-500/20 hover:from-primary/30 hover:to-blue-500/30 border-primary/30 text-primary"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage ({selectedCount})
                              </Button>
                            )}
                          </motion.div>
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="relative z-10">
                        {/* Enhanced metrics grid */}
                        <motion.div 
                          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {[
                            {
                              label: 'Search Volume',
                              value: serpData.searchVolume ? (
                                serpData.searchVolume >= 1000000 ? 
                                  `${(serpData.searchVolume / 1000000).toFixed(1)}M` :
                                serpData.searchVolume >= 1000 ? 
                                  `${(serpData.searchVolume / 1000).toFixed(1)}K` :
                                  serpData.searchVolume
                              ) : '0',
                              color: 'from-blue-500 to-cyan-500',
                              icon: TrendingUp
                            },
                            {
                              label: 'Difficulty',
                              value: serpData.keywordDifficulty || 0,
                              color: 'from-orange-500 to-red-500',
                              icon: BarChart3
                            },
                            {
                              label: 'Questions',
                              value: serpData.peopleAlsoAsk?.length || 0,
                              color: 'from-purple-500 to-pink-500',
                              icon: Sparkles
                            },
                            {
                              label: 'Opportunities',
                              value: serpData.contentGaps?.length || 0,
                              color: 'from-green-500 to-emerald-500',
                              icon: Zap
                            }
                          ].map((metric, index) => (
                            <motion.div 
                              key={metric.label}
                              className="relative group"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.1 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="relative text-center p-4 glass-card rounded-xl border border-white/20 group-hover:border-white/30 transition-all duration-300">
                                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${metric.color} bg-opacity-20 mb-2`}>
                                  <metric.icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-white font-mono mb-1">
                                  {metric.value}
                                </div>
                                <div className="text-xs text-gray-400">{metric.label}</div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>

                        <motion.div 
                          className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-xl" />
                            <div className="relative p-6 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full backdrop-blur-sm border border-white/20">
                              <BarChart3 className="h-12 w-12 text-primary" />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold text-holographic mb-3">
                              Comprehensive Analysis Ready
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md">
                              Explore detailed insights including competitor questions, proven headings, 
                              content gaps, and strategic keywords from your SERP analysis
                            </p>
                            <Button 
                              onClick={() => setShowSerpAnalysisModal(true)}
                              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-500/80 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Eye className="h-5 w-5 mr-2" />
                              Explore Intelligence Data
                            </Button>
                          </div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <NoDataAvailable 
                        keyword={mainKeyword || ''}
                        onManualInput={() => {
                          // Allow user to continue without SERP data
                          dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
                          dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
                        }}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Modals */}
      <SerpAnalysisModal
        isOpen={showSerpAnalysisModal}
        onClose={() => setShowSerpAnalysisModal(false)}
        serpData={serpData}
        serpSelections={serpSelections}
        onToggleSelection={handleToggleSelection}
        keyword={mainKeyword || ''}
      />

      <SelectionManagerModal
        isOpen={showSelectionManagerModal}
        onClose={() => setShowSelectionManagerModal(false)}
        serpSelections={serpSelections}
        onToggleSelection={handleToggleSelection}
        onClearAll={handleClearAllSelections}
        onGenerateOutline={handleGenerateOutline}
      />
        </div>
      </motion.div>
  );
};
