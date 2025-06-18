
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { EnhancedSerpStatus } from '@/components/content-builder/serp/EnhancedSerpStatus';
import { InteractiveAnalysisSteps } from './keyword-analysis/InteractiveAnalysisSteps';

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
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('analysis');
  const [hasSearched, setHasSearched] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<ApiKeysStatus>({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Get selection statistics for the SERP data
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
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
    setSuggestions(searchSuggestions);

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

    // Start interactive analysis
    setHasSearched(true);
    setActiveTab('analysis');
    await analyzeKeyword(keyword);
  };
  
  const handleAddKeyword = (kw: string) => {
    dispatch({
      type: 'ADD_KEYWORD',
      payload: kw
    });
  };
  
  const handleRemoveKeyword = (kw: string) => {
    dispatch({
      type: 'REMOVE_KEYWORD',
      payload: kw
    });
  };
  
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    // Switch to SERP features tab once analysis is complete
    setActiveTab('features');
  };

  const handleContinueWithSelections = () => {
    if (totalSelected === 0) return;
    
    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    
    // Generate outline from selections
    generateOutlineFromSelections();
  };

  const renderTabNavigation = () => (
    <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
      <Button
        variant={activeTab === 'analysis' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('analysis')}
        className="flex-1"
      >
        Analysis
      </Button>
      <Button
        variant={activeTab === 'features' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setActiveTab('features')}
        disabled={!analysisData && !serpData}
        className="flex-1"
      >
        SERP Features
        {totalSelected > 0 && (
          <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
            {totalSelected}
          </span>
        )}
      </Button>
    </div>
  );
  
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
              <h3 className="text-lg font-semibold">Interactive SERP Analysis</h3>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Enter your main keyword below to start the step-by-step SERP analysis process
          </p>
          
          {/* Enhanced SERP Status Display */}
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
              Start with keyword research
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
                <Sparkles className="h-8 w-8 text-neon-purple" />
              </div>
              <h3 className="text-xl font-medium mb-2">Ready for Interactive Analysis</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Enter your main keyword above to start the step-by-step SERP analysis. 
                Watch as we analyze search volume, competition, and SERP features in real-time.
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
                {/* Left column - Keywords and selections */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Selected Keywords */}
                  <div className="animate-fade-in">
                    <SelectedKeywords 
                      keywords={selectedKeywords} 
                      onRemoveKeyword={handleRemoveKeyword} 
                    />
                  </div>
                  
                  {/* Selected Items Sidebar - only show when we have selections */}
                  {totalSelected > 0 && (
                    <SelectedItemsSidebar 
                      serpSelections={serpSelections}
                      totalSelected={totalSelected}
                      selectedCounts={selectedCounts}
                      handleToggleSelection={handleToggleSelection}
                    />
                  )}
                </div>
                
                {/* Right column - Analysis content */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Tab Navigation */}
                  {renderTabNavigation()}
                  
                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'analysis' && (
                      <motion.div
                        key="analysis"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <InteractiveAnalysisSteps
                          keyword={mainKeyword}
                          onAnalysisComplete={handleAnalysisComplete}
                          serpData={serpData}
                          isAnalyzing={isAnalyzing}
                        />
                      </motion.div>
                    )}
                    
                    {activeTab === 'features' && (analysisData || serpData) && (
                      <motion.div
                        key="features"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SerpAnalysisPanel 
                          serpData={analysisData || serpData}
                          isLoading={false}
                          mainKeyword={mainKeyword}
                          onAddToContent={(content, type) => handleToggleSelection(type, content)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Continue Button */}
                  {totalSelected > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end pt-4"
                    >
                      <Button
                        onClick={handleContinueWithSelections}
                        className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all duration-300 shadow-lg"
                      >
                        Continue with {totalSelected} selections
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
