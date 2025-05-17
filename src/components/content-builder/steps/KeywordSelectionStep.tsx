
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
  
  // Helper function to get items by type
  const getItemsByType = (type: string) => {
    return serpSelections.filter(item => item.type === type);
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header with improved animation and styling */}
      <motion.div 
        className="relative overflow-hidden rounded-xl glass-panel border border-white/10 p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-1.5 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue">
              <Sparkles className="h-5 w-5 text-white" />
            </span>
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Keyword Selection & Analysis
            </h2>
          </div>
          <p className="text-sm text-white/70 max-w-2xl">
            Start by entering your main keyword to analyze search trends, discover content opportunities, 
            and gather insights for your content strategy. The more specific your keyword, the better results you'll get.
          </p>
        </div>
      </motion.div>
      
      {/* Keyword search section with improved styling */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="main-keyword" className="text-base font-medium flex items-center gap-2 text-white/90">
              <Search className="h-4 w-4 text-primary" />
              Main Keyword
            </Label>
            <div className="text-xs text-white/60 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              Power your content with the right keywords
            </div>
          </div>
          
          {/* Keyword search input with improved styling */}
          <div className="backdrop-blur-md bg-white/5 rounded-lg p-0.5 border border-white/10 shadow-lg">
            <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
          </div>
        </div>

        <AnimatePresence>
          {!hasSearched && (
            <motion.div 
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="initial-state"
            >
              <div className="rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 p-8 mb-6">
                <Sparkles className="h-10 w-10 text-neon-purple animate-pulse" />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-white/90">Search to analyze your keyword</h3>
              <p className="text-sm text-white/60 max-w-md">
                Enter your main keyword above to see search insights, 
                related keywords, and content suggestions from top-ranking pages
              </p>
            </motion.div>
          )}
          
          {hasSearched && (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="results-state"
            >
              {/* Results layout with better spacing and organization */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Keyword selections */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Selected Keywords */}
                  <div className="animate-fade-in">
                    <SelectedKeywords 
                      keywords={selectedKeywords} 
                      onRemoveKeyword={handleRemoveKeyword} 
                    />
                  </div>
                  
                  {/* Selected Items Sidebar */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <SelectedItemsSidebar 
                      serpSelections={serpSelections}
                      totalSelected={totalSelected}
                      selectedCounts={selectedCounts}
                      handleToggleSelection={handleToggleSelection}
                    />
                  </motion.div>

                  {/* Continue button with improved styling */}
                  {totalSelected > 0 && (
                    <motion.div 
                      className="mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button 
                        onClick={handleContinueWithSelections} 
                        className="w-full bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:shadow-lg transition-all"
                      >
                        Continue with Selections
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  )}
                </div>
                
                {/* Right column - SERP Analysis with improved styling */}
                <div className="lg:col-span-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl">
                      <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 border-b border-white/10 pb-3">
                        <CardTitle className="text-lg font-medium">
                          Search Results Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <SerpAnalysisPanel 
                          serpData={serpData}
                          isLoading={isAnalyzing}
                          mainKeyword={mainKeyword}
                          onAddToContent={handleAddToContent}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
