
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { ContentCluster } from '@/contexts/content-builder/types/cluster-types';
import { Search, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { SerpAnalysisPanel } from '@/components/content-builder/serp/SerpAnalysisPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { EnhancedSerpStatus } from '@/components/content-builder/serp/EnhancedSerpStatus';

// Mock data for clusters until we integrate with backend
const mockClusters: ContentCluster[] = [{
  id: '1',
  name: 'SEO Optimization',
  keywords: ['seo strategy', 'keyword research', 'backlink building', 'content optimization']
}, {
  id: '2',
  name: 'Content Marketing',
  keywords: ['blog strategy', 'content planning', 'editorial calendar', 'content distribution']
}, {
  id: '3',
  name: 'Social Media',
  keywords: ['social media marketing', 'engagement strategies', 'social analytics', 'platform optimization']
}];

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
    addContentFromSerp,
    generateOutlineFromSelections
  } = useContentBuilder();
  
  const {
    mainKeyword,
    selectedKeywords,
    selectedCluster,
    serpData,
    serpSelections,
    isAnalyzing
  } = state;
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>(mockClusters);
  const [activeTab, setActiveTab] = useState('research');
  const [hasSearched, setHasSearched] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<ApiKeysStatus>({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);
  
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
    
    // Enable enhanced mode if we have working APIs
    if ((status.serpApi.working || status.serpstack.working) && mainKeyword) {
      setUseEnhancedMode(true);
    }
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

    // Automatically start SERP analysis when a keyword is entered
    setHasSearched(true);
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
  
  const handleSelectCluster = (cluster: ContentCluster) => {
    dispatch({
      type: 'SELECT_CLUSTER',
      payload: cluster
    });
  };
  
  const handleClearCluster = () => {
    dispatch({
      type: 'SELECT_CLUSTER',
      payload: null
    });
  };
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Function to handle adding content from SERP items
  const handleAddToContent = (content: string, type: string) => {
    handleToggleSelection(type, content);
  };
  
  // Handle continuing with selected items
  const handleContinueWithSelections = () => {
    if (totalSelected === 0) return;
    
    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    
    // Generate outline from selections
    generateOutlineFromSelections();
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };
  
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
              <h3 className="text-lg font-semibold">Selection & Analysis</h3>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Enter your main keyword below to analyze search trends and discover content opportunities
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
                <Sparkles className="h-8 w-8 text-neon-purple" />
              </div>
              <h3 className="text-xl font-medium mb-2">Search to analyze your keyword</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Enter your main keyword above to see search insights, 
                related keywords, and content suggestions from top-ranking pages
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
                {/* Left column - Keyword selections */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Selected Keywords */}
                  <div className="animate-fade-in">
                    <SelectedKeywords 
                      keywords={selectedKeywords} 
                      onRemoveKeyword={handleRemoveKeyword} 
                    />
                  </div>
                  
                  {/* Selected Items Sidebar */}
                  <SelectedItemsSidebar 
                    serpSelections={serpSelections}
                    totalSelected={totalSelected}
                    selectedCounts={selectedCounts}
                    handleToggleSelection={handleToggleSelection}
                  />
                </div>
                
                {/* Right column - SERP Analysis */}
                <div className="lg:col-span-2">
                  <SerpAnalysisPanel 
                    serpData={serpData}
                    isLoading={isAnalyzing}
                    mainKeyword={mainKeyword}
                    onAddToContent={handleAddToContent}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
