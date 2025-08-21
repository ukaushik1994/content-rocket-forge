import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings, Zap, Rocket, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSerpStatus } from '@/components/content-builder/serp/EnhancedSerpStatus';
import { EnhancedAiStatus } from '@/components/content-builder/ai/EnhancedAiStatus';
import { InlineSerpAnalysis } from './keyword-analysis/InlineSerpAnalysis';
import { SerpAnalysisModal } from './keyword-analysis/SerpAnalysisModal';
import { SelectionManagerModal } from './keyword-analysis/SelectionManagerModal';
import { SelectionSummaryCard } from './keyword-analysis/SelectionSummaryCard';
import { DataSourceIndicator } from './keyword-analysis/DataSourceIndicator';
import { CollapsibleRightSidebar } from './keyword-analysis/CollapsibleRightSidebar';
import { ContentBuilderKeywordLibrary } from '@/components/content-builder/keyword/ContentBuilderKeywordLibrary';
import { KeywordIntelligencePanel } from '@/components/content-builder/keyword/KeywordIntelligencePanel';
import { toast } from 'sonner';

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
      className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Interactive Background Effects */}
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
        
        {/* Interactive floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full min-h-screen px-0">
        {/* Hero Search Section */}
        <motion.div 
          className="text-center mb-16 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <div className="relative">
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered SERP Intelligence</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Discover Content
              <br />
              <span className="text-primary">Opportunities</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Advanced SERP analysis that reveals competitor insights, content gaps, 
              and optimization opportunities to dominate search results
            </motion.p>

            {/* Enhanced Search Input */}
            <motion.div 
              className="max-w-2xl mx-auto relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-60" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-2 shadow-2xl">
                <EnhancedSerpStatus onStatusChange={handleStatusChange} />
                <EnhancedAiStatus />
                <div className="mt-4">
                  <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              className="flex justify-center gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {[
                { icon: TrendingUp, label: "SERP Features", value: "15+" },
                { icon: BarChart3, label: "Data Points", value: "200+" },
                { icon: Zap, label: "Analysis Time", value: "< 30s" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div 
              key="welcome-state"
              className="text-center py-24"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="relative inline-block mb-8"
                animate={{ 
                  rotateY: [0, 5, 0, -5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-2xl" />
                <div className="relative p-8 bg-background/60 backdrop-blur-xl rounded-full border border-border/50">
                  <Search className="h-16 w-16 text-primary" />
                </div>
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-4 text-foreground">Ready to Analyze</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter your target keyword above to begin comprehensive SERP analysis and content intelligence
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="results-state"
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
            >
              {/* Data Source Indicator */}
              {serpData && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DataSourceIndicator
                    isRealData={serpData.isGoogleData || false}
                    isMockData={serpData.isMockData || false}
                  />
                </motion.div>
              )}

              {/* Main Content Area - Full Width */}
              <motion.div 
                className="w-full"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isAnalyzing ? (
                  <motion.div 
                    className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="relative p-12 text-center">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-blue-500/10"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      <div className="relative z-10 space-y-8">
                        <motion.div
                          className="relative inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
                          <div className="relative p-6 bg-background/80 rounded-full">
                            <Loader2 className="h-12 w-12 text-primary" />
                          </div>
                        </motion.div>
                        
                        <div>
                          <h3 className="text-2xl font-bold mb-3 text-foreground">
                            Analyzing SERP Intelligence
                          </h3>
                          <p className="text-muted-foreground text-lg">
                            Extracting competitor insights, content gaps, and optimization opportunities...
                          </p>
                        </div>
                        
                        <motion.div 
                          className="flex justify-center space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="w-3 h-3 bg-primary rounded-full"
                              animate={{ 
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3]
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ) : serpData ? (
                  <motion.div 
                    className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div className="relative p-8">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                          <motion.div 
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl backdrop-blur-sm border border-green-500/30">
                              <BarChart3 className="h-8 w-8 text-green-400" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-foreground">SERP Intelligence</h2>
                              <p className="text-muted-foreground">Advanced competitive analysis for "{mainKeyword}"</p>
                            </div>
                          </motion.div>
                          
                          <motion.div 
                            className="flex gap-3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            <Button
                              variant="outline"
                              onClick={() => {
                                console.log('🔥 Explore Data button clicked!');
                                setShowSerpAnalysisModal(true);
                              }}
                              className="bg-background/60 hover:bg-background/80 border-border/50 hover:border-border"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Explore Data
                            </Button>
                            {selectedCount > 0 && (
                              <Button
                                onClick={() => setShowSelectionManagerModal(true)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Manage ({selectedCount})
                              </Button>
                            )}
                          </motion.div>
                        </div>
                        
                        <InlineSerpAnalysis
                          serpData={serpData}
                          keyword={mainKeyword}
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-12 text-center"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="space-y-6">
                      <div className="p-6 bg-muted/50 rounded-full inline-block">
                        <Search className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">No Data Available</h3>
                        <p className="text-muted-foreground">
                          Enter a keyword to start SERP analysis and discover content opportunities
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapsible Right Sidebar */}
      {hasSearched && (
        <CollapsibleRightSidebar
          selectedKeywords={selectedKeywords}
          serpSelections={serpSelections}
          onRemoveKeyword={handleRemoveKeyword}
          onOpenSelectionManager={() => setShowSelectionManagerModal(true)}
          onGenerateOutline={handleGenerateOutline}
          isGeneratingOutline={isGeneratingOutline}
        />
      )}

      {/* Modals */}
      <SerpAnalysisModal
        isOpen={showSerpAnalysisModal}
        onClose={() => {
          console.log('🔥 Modal closing');
          setShowSerpAnalysisModal(false);
        }}
        serpData={serpData}
        serpSelections={serpSelections}
        onToggleSelection={handleToggleSelection}
        keyword={mainKeyword || ''}
        onSerpDataUpdate={(data) => {
          dispatch({ type: 'SET_SERP_DATA', payload: data });
        }}
      />

      <SelectionManagerModal
        isOpen={showSelectionManagerModal}
        onClose={() => setShowSelectionManagerModal(false)}
        serpSelections={serpSelections}
        onToggleSelection={handleToggleSelection}
        onClearAll={handleClearAllSelections}
        onGenerateOutline={handleGenerateOutline}
      />
    </motion.div>
  );
};
