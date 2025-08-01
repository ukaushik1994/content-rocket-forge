
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Clean Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold">Keyword Research</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enter your target keyword to analyze search results and discover content opportunities
        </p>
        <EnhancedSerpStatus onStatusChange={handleStatusChange} />
      </div>
      
      {/* Keyword search section */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="main-keyword" className="text-base font-medium">
            Primary Keyword
          </Label>
          <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
        </div>

        <AnimatePresence>
          {!hasSearched && (
            <div className="text-center py-16 space-y-4">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-primary/10 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Start Your Keyword Analysis
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a keyword above to analyze search results and discover content opportunities
              </p>
            </div>
          )}
          
          {hasSearched && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Keywords and Selections */}
              <div className="space-y-4">
                <Card>
                  <SelectedKeywords 
                    keywords={selectedKeywords} 
                    onRemoveKeyword={handleRemoveKeyword} 
                  />
                </Card>
                
                <Card>
                  <SelectionSummaryCard
                    serpSelections={serpSelections}
                    onOpenSelectionManager={() => setShowSelectionManagerModal(true)}
                    onGenerateOutline={handleGenerateOutline}
                    isGenerating={isGeneratingOutline}
                  />
                </Card>
              </div>
              
              {/* Main Content - SERP Analysis */}
              <div className="lg:col-span-3">
                {isAnalyzing ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            Analyzing Keyword
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Extracting SERP data and competitor insights...
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : serpData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <BarChart3 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-lg">SERP Analysis</span>
                            <p className="text-sm text-muted-foreground font-normal">
                              Search results insights for "{mainKeyword}"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSerpAnalysisModal(true)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {selectedCount > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowSelectionManagerModal(true)}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Manage ({selectedCount})
                            </Button>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            icon: TrendingUp
                          },
                          {
                            label: 'Difficulty',
                            value: serpData.keywordDifficulty || 0,
                            icon: BarChart3
                          },
                          {
                            label: 'Questions',
                            value: serpData.peopleAlsoAsk?.length || 0,
                            icon: Sparkles
                          },
                          {
                            label: 'Opportunities',
                            value: serpData.contentGaps?.length || 0,
                            icon: Zap
                          }
                        ].map((metric) => (
                          <div 
                            key={metric.label}
                            className="text-center p-4 bg-muted/50 rounded-lg"
                          >
                            <div className="flex justify-center mb-2">
                              <metric.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {metric.value}
                            </div>
                            <div className="text-xs text-muted-foreground">{metric.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Call to Action */}
                      <div className="text-center py-8 space-y-4">
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                            <BarChart3 className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold">
                          Analysis Complete
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto text-sm">
                          Explore detailed insights including competitor questions, proven headings, 
                          content gaps, and strategic keywords
                        </p>
                        <Button 
                          onClick={() => setShowSerpAnalysisModal(true)}
                          className="mt-4"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Explore Full Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <NoDataAvailable 
                    keyword={mainKeyword || ''}
                    onManualInput={() => {
                      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
                      dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
                    }}
                  />
                )}
              </div>
            </div>
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
  );
};
