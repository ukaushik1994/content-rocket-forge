
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Header with enhanced API status */}
      <motion.div 
        className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <h3 className="text-lg font-semibold">Keyword Research & Analysis</h3>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Enter your main keyword below to analyze search trends and discover content opportunities
          </p>
          
          <EnhancedSerpStatus onStatusChange={handleStatusChange} />
        </div>
      </motion.div>
      
      {/* Keyword search section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="main-keyword" className="text-base font-medium flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              Main Keyword
            </Label>
            <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
              Power your content with the right keywords
            </div>
          </div>
          <div className="backdrop-blur-sm bg-white/5 rounded-lg p-0.5 border border-white/10 shadow-inner">
            <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
          </div>
        </div>

        <AnimatePresence>
          {!hasSearched && (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="initial-state"
            >
              <div className="rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 p-6 mb-4">
                <TrendingUp className="h-8 w-8 text-neon-purple" />
              </div>
              <h3 className="text-xl font-medium mb-2">Start your keyword analysis</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Enter your main keyword above to get comprehensive search metrics, 
                SERP analysis, and content opportunities from top-ranking pages
              </p>
            </motion.div>
          )}
          
          {hasSearched && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="results-state"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Keywords and Selection Summary */}
                <div className="space-y-6">
                  <div className="animate-fade-in">
                    <SelectedKeywords 
                      keywords={selectedKeywords} 
                      onRemoveKeyword={handleRemoveKeyword} 
                    />
                  </div>
                  
                  <SelectionSummaryCard
                    serpSelections={serpSelections}
                    onOpenSelectionManager={() => setShowSelectionManagerModal(true)}
                    onGenerateOutline={handleGenerateOutline}
                    isGenerating={isGeneratingOutline}
                  />
                </div>
                
                {/* Right column - SERP Analysis Results */}
                <div className="lg:col-span-2">
                  {isAnalyzing ? (
                    <Card className="glass-panel">
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                          <div>
                            <h3 className="font-medium">Analyzing keyword...</h3>
                            <p className="text-sm text-muted-foreground">
                              Getting SERP data and content opportunities
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : serpData ? (
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            SERP Analysis Results
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSerpAnalysisModal(true)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                            {selectedCount > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSelectionManagerModal(true)}
                              >
                                <Settings className="h-3 w-3 mr-1" />
                                Manage ({selectedCount})
                              </Button>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Quick overview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="text-lg font-bold text-blue-500">
                              {serpData.searchVolume ? (
                                serpData.searchVolume >= 1000000 ? 
                                  `${(serpData.searchVolume / 1000000).toFixed(1)}M` :
                                serpData.searchVolume >= 1000 ? 
                                  `${(serpData.searchVolume / 1000).toFixed(1)}K` :
                                  serpData.searchVolume
                              ) : '0'}
                            </div>
                            <div className="text-xs text-muted-foreground">Search Volume</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="text-lg font-bold text-orange-500">
                              {serpData.keywordDifficulty || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Difficulty</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="text-lg font-bold text-purple-500">
                              {serpData.peopleAlsoAsk?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Questions</div>
                          </div>
                          <div className="text-center p-3 bg-white/5 rounded-lg">
                            <div className="text-lg font-bold text-green-500">
                              {serpData.contentGaps?.length || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Opportunities</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                          <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full">
                            <BarChart3 className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium mb-2">Comprehensive Analysis Available</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Click "View Details" to explore questions, headings, content gaps, and keywords from your SERP analysis
                            </p>
                            <Button onClick={() => setShowSerpAnalysisModal(true)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Explore SERP Data
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <NoDataAvailable 
                      keyword={mainKeyword || ''}
                      onManualInput={() => {
                        // Allow user to continue without SERP data
                        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
                        dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
                      }}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
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
  );
};
