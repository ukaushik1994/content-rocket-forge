
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { KeywordSuggestions } from '../keyword/KeywordSuggestions';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { ContentCluster } from '@/contexts/content-builder/types';
import { Loader2, Search, ChevronRight, Sparkles, Tabs, TabsList, TabsTrigger, TabsContent } from 'lucide-react';
import { SerpAnalysisPanel } from '../serp/SerpAnalysisPanel';
import { SelectedItemsSidebar } from './serp-analysis/SelectedItemsSidebar';
import { SerpSelectionStats } from './serp-analysis/SerpSelectionStats';
import { Button } from '@/components/ui/button';
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from '@/components/ui/tabs';

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
    isAnalyzing,
    serpSelections
  } = state;
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [clusters, setClusters] = useState<ContentCluster[]>(mockClusters);
  const [activeTab, setActiveTab] = useState('research');
  
  // Get SERP selection statistics for the Analysis tab
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
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
    await analyzeKeyword(keyword);
    
    // Switch to the analysis tab after analysis completes
    setActiveTab('analysis');
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
  
  // Helper function to toggle selection state for SERP items
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
    
    // Generate outline from selections
    generateOutlineFromSelections();
    
    // Skip to outline step (step 3)
    dispatch({ 
      type: 'SET_ACTIVE_STEP', 
      payload: 3 
    });
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      setActiveTab('research'); // Switch back to research tab
      await analyzeKeyword(mainKeyword);
      setActiveTab('analysis'); // Then switch to analysis tab
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <div className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Start Your Content Journey</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your main keyword below to analyze search trends and discover content opportunities
          </p>
        </div>
      </div>
      
      {/* Tabs for Research and Analysis */}
      <UITabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <UITabsList className="grid w-full grid-cols-2 mb-6">
          <UITabsTrigger value="research" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Keyword Research
          </UITabsTrigger>
          <UITabsTrigger value="analysis" className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            SERP Analysis
            {totalSelected > 0 && (
              <span className="ml-1.5 bg-primary/20 text-primary rounded-full px-2 py-0.5 text-xs">
                {totalSelected}
              </span>
            )}
          </UITabsTrigger>
        </UITabsList>
        
        {/* Research Tab Content */}
        <UITabsContent value="research" className="animate-fade-in">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Suggestions */}
                <div className="animate-fade-in">
                  <KeywordSuggestions suggestions={suggestions} onAddKeyword={handleAddKeyword} />
                </div>
                
                {/* Selected Keywords */}
                <div className="animate-fade-in" style={{
                animationDelay: '100ms'
              }}>
                  <SelectedKeywords keywords={selectedKeywords} onRemoveKeyword={handleRemoveKeyword} />
                </div>
              </div>
              
              {/* Right column for strategy tips */}
              <div className="space-y-4">
                <div style={{
                animationDelay: '200ms'
              }} className="glass-panel border border-white/10 rounded-lg p-4 shadow-lg animate-fade-in px-[16px] py-[30px]">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-primary" />
                    Content Strategy Tips
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">1</span>
                      <span>Choose a primary keyword with good search volume</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">2</span>
                      <span>Select related keywords to expand your content's reach</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">3</span>
                      <span>Analyze SERP data to understand what content performs best</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </UITabsContent>
        
        {/* Analysis Tab Content */}
        <UITabsContent value="analysis" className="animate-fade-in">
          <div className="space-y-6">
            {/* Analysis Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">
                  SERP Analysis: <span className="text-primary">{mainKeyword}</span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Select insights to include in your content outline
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={handleReanalyze} disabled={isAnalyzing || !mainKeyword}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Re-analyze
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleContinueWithSelections}
                  disabled={totalSelected === 0}
                  className={`gap-1 ${
                    totalSelected > 0 ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                  Continue with {totalSelected} selected
                </Button>
              </div>
            </div>
            
            {/* Analysis Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <SerpAnalysisPanel 
                  serpData={serpData}
                  isLoading={isAnalyzing}
                  mainKeyword={mainKeyword}
                  onAddToContent={handleAddToContent}
                />
              </div>
              
              <div className="lg:col-span-1">
                <SelectedItemsSidebar 
                  serpSelections={serpSelections}
                  totalSelected={totalSelected}
                  selectedCounts={selectedCounts}
                  handleToggleSelection={handleToggleSelection}
                  handleContinueWithSelections={handleContinueWithSelections}
                />
              </div>
            </div>
          </div>
        </UITabsContent>
      </UITabs>
    </div>
  );
};
