
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { KeywordSuggestions } from '../keyword/KeywordSuggestions';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { ContentCluster } from '@/contexts/content-builder/types';
import { Loader2, Search, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

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
  const [serpOptionsVisible, setSerpOptionsVisible] = useState(false);
  
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
      
      // Show SERP options after keyword is analyzed
      if (serpData) {
        setSerpOptionsVisible(true);
      }
    }
  }, [mainKeyword, selectedKeywords, dispatch, serpData]);
  
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
  
  const handleContinue = () => {
    if (serpSelections && serpSelections.filter(s => s.selected).length > 0) {
      generateOutlineFromSelections();
    } else {
      // Still allow continue even without selections
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
      });
      
      dispatch({
        type: 'SET_ACTIVE_STEP',
        payload: 1
      });
    }
  };
  
  // Get count of selected items
  const getSelectedCount = () => {
    return serpSelections ? serpSelections.filter(s => s.selected).length : 0;
  };
  
  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <div className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5 
        bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <motion.div 
          className="absolute bottom-0 left-0 w-24 h-24 bg-neon-purple/10 blur-2xl rounded-full"
          animate={{ x: ['-10%', '10%'], opacity: [0.5, 0.8] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
        />
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
      
      <Tabs defaultValue="research" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="research" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue">
            <Search className="h-4 w-4 mr-2" /> Keyword Research
          </TabsTrigger>
          <TabsTrigger value="serp" disabled={!serpData} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue">
            <ChevronRight className="h-4 w-4 mr-2" /> SERP Analysis {getSelectedCount() > 0 && `(${getSelectedCount()})`}
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="research" className="mt-0">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {/* Suggestions */}
                <motion.div 
                  className="animate-fade-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <KeywordSuggestions suggestions={suggestions} onAddKeyword={handleAddKeyword} />
                </motion.div>
                
                {/* Selected Keywords */}
                <motion.div 
                  className="animate-fade-in"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <SelectedKeywords keywords={selectedKeywords} onRemoveKeyword={handleRemoveKeyword} />
                </motion.div>
              </div>
              
              {/* Right column for strategy tips */}
              <div className="space-y-4">
                <motion.div 
                  className="glass-panel border border-white/10 rounded-lg p-4 shadow-lg animate-fade-in px-[16px] py-[30px]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
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
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* SERP preview and continue button */}
          {serpOptionsVisible && !isAnalyzing && serpData && (
            <motion.div 
              className="mt-8 p-4 border border-neon-blue/20 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-neon-blue" />
                  SERP Analysis Results
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('serp')}
                  className="text-neon-blue hover:text-neon-purple transition-colors"
                >
                  See details
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              
              {/* SERP preview metrics */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Search Volume</div>
                  <div className="text-lg font-medium text-neon-purple">
                    {serpData.searchVolume?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Keyword Difficulty</div>
                  <div className="text-lg font-medium text-neon-blue">
                    {serpData.keywordDifficulty || 'N/A'}%
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Related Keywords</div>
                  <div className="text-lg font-medium text-neon-green">
                    {serpData.relatedSearches?.length || 0}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
              >
                Continue to Content Type
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
          
          {/* Loading state */}
          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-primary animate-spin mr-2" />
              <p>Analyzing your keyword...</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="serp" className="mt-0">
          {serpData ? (
            <div className="space-y-6">
              <div className="p-4 border border-white/10 bg-white/5 rounded-lg">
                <h3 className="text-base font-medium mb-4">Selected SERP Items: {getSelectedCount()}</h3>
                
                <div className="space-y-4">
                  {serpSelections && serpSelections.some(s => s.selected) ? (
                    <div className="space-y-2">
                      {serpSelections
                        .filter(s => s.selected)
                        .map((selection, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-start justify-between bg-white/5 p-3 rounded-lg border border-white/10"
                          >
                            <div className="flex items-start gap-2">
                              <span className="bg-neon-purple/20 text-neon-purple px-2 py-0.5 rounded text-xs">
                                {selection.type}
                              </span>
                              <span className="text-sm">{selection.content}</span>
                            </div>
                            <Button
                              variant="ghost" 
                              size="sm"
                              className="text-muted-foreground hover:text-white"
                              onClick={() => addContentFromSerp(selection.content, selection.type)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No SERP items selected yet</p>
                      <p className="text-sm mt-2">
                        Switch back to the SERP Analysis tab to select items for your content
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => generateOutlineFromSelections()} 
                    disabled={getSelectedCount() === 0}
                    className={`px-6 ${
                      getSelectedCount() > 0 
                        ? "bg-gradient-to-r from-neon-purple to-neon-blue" 
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Generate Outline with Selected Items
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
              <p>No SERP data available. Please analyze a keyword first.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
