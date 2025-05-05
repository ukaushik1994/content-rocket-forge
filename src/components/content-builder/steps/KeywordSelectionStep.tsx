
import React, { useState, useEffect, useMemo } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { KeywordSuggestions } from '../keyword/KeywordSuggestions';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ClusterSelection } from '../keyword/ClusterSelection';
import { ContentCluster } from '@/contexts/content-builder/types';
import { Loader2, Search, ChevronRight, Sparkles, CheckCheck, Check, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { SerpAnalysisPanel } from '@/components/content/SerpAnalysisPanel';

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
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [shouldShowSerpPanel, setShouldShowSerpPanel] = useState(false);
  
  // Track if SERP tab has been seen by user
  const [serpTabSeen, setSerpTabSeen] = useState(false);
  
  // Calculate selected count 
  const selectedCount = useMemo(() => {
    return serpSelections?.filter(s => s.selected).length || 0;
  }, [serpSelections]);
  
  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
      });

      if (serpData && hasAnalyzed) {
        // Also mark SERP analysis step as completed
        dispatch({
          type: 'MARK_STEP_COMPLETED',
          payload: 2
        });
        
        // Show SERP panel after keyword is analyzed
        setShouldShowSerpPanel(true);
      }
    }
    
    // Auto-switch to SERP tab when analysis completes
    if (serpData && isAnalyzing === false && hasAnalyzed && !serpTabSeen) {
      const timer = setTimeout(() => {
        setActiveTab('serp');
        setSerpTabSeen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mainKeyword, selectedKeywords, dispatch, serpData, hasAnalyzed, isAnalyzing, serpTabSeen]);
  
  const handleKeywordSearch = async (keyword: string, searchSuggestions: string[]) => {
    if (!keyword) return;
    
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
    setHasAnalyzed(true);
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
    if (serpSelections && selectedCount > 0) {
      generateOutlineFromSelections();
    } else {
      // Still allow continue even without selections
      dispatch({
        type: 'SET_ACTIVE_STEP',
        payload: 1
      });
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'serp') {
      setSerpTabSeen(true);
    }
  };

  // Add SERP selection
  const handleAddToContent = (content: string, type: string) => {
    addContentFromSerp(content, type);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold">Start Your Content Journey</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your main keyword below to analyze search trends and discover content opportunities
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="research" 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger 
            value="research" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue"
          >
            <Search className="h-4 w-4 mr-2" /> Keyword Research
          </TabsTrigger>
          <TabsTrigger 
            value="serp" 
            disabled={!serpData} 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue relative"
          >
            <ChevronRight className="h-4 w-4 mr-2" /> SERP Analysis 
            {selectedCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-1.5 bg-neon-purple px-1.5 py-0.5 rounded-full text-xs"
              >
                {selectedCount}
              </motion.span>
            )}
            
            {!serpTabSeen && serpData && (
              <motion.span
                className="absolute top-0 right-1 h-2 w-2 bg-neon-blue rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </TabsTrigger>
        </TabsList>
      
        <TabsContent value="research" className="mt-0 space-y-6 focus:outline-none">
          {/* Keyword search section */}
          <div className="space-y-6">
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-2 space-y-6">
                {/* Suggestions */}
                <motion.div variants={itemVariants} className="animate-fade-in">
                  <KeywordSuggestions suggestions={suggestions} onAddKeyword={handleAddKeyword} />
                </motion.div>
                
                {/* Selected Keywords */}
                <motion.div variants={itemVariants} className="animate-fade-in">
                  <SelectedKeywords keywords={selectedKeywords} onRemoveKeyword={handleRemoveKeyword} />
                </motion.div>
              </div>
              
              {/* Right column for strategy tips */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="glass-panel border border-white/10 rounded-lg p-4 shadow-lg animate-fade-in px-[16px] py-[30px]">
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
                  
                  {/* Improved call to action when SERP data is available */}
                  {serpData && !isAnalyzing && (
                    <motion.div 
                      className="mt-4 pt-4 border-t border-white/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 hover:from-neon-purple/30 hover:to-neon-blue/30"
                        onClick={() => setActiveTab('serp')}
                      >
                        <ZoomIn className="h-3 w-3 mr-1.5" />
                        View SERP Analysis
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>
          
          {/* SERP preview and continue button */}
          <AnimatePresence>
            {shouldShowSerpPanel && !isAnalyzing && serpData && (
              <motion.div 
                className="mt-8 p-4 border border-neon-blue/20 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
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
                  <motion.div 
                    variants={itemVariants} 
                    className="bg-white/5 p-3 rounded-lg border border-white/10"
                  >
                    <div className="text-xs text-muted-foreground mb-1">Search Volume</div>
                    <div className="text-lg font-medium text-neon-purple">
                      {serpData.searchVolume?.toLocaleString() || 'N/A'}
                    </div>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants} 
                    className="bg-white/5 p-3 rounded-lg border border-white/10"
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">Keyword Difficulty</div>
                    <div className="text-lg font-medium text-neon-blue">
                      {serpData.keywordDifficulty || 'N/A'}%
                    </div>
                  </motion.div>
                  <motion.div 
                    variants={itemVariants} 
                    className="bg-white/5 p-3 rounded-lg border border-white/10"
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-xs text-muted-foreground mb-1">Related Keywords</div>
                    <div className="text-lg font-medium text-neon-green">
                      {serpData.relatedSearches?.length || 0}
                    </div>
                  </motion.div>
                </div>
                
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    onClick={handleContinue}
                    className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
                  >
                    Continue to Content Type
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Loading state */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                className="flex flex-col items-center justify-center py-8 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <Loader2 className="h-6 w-6 text-primary" />
                </motion.div>
                <p>Analyzing your keyword...</p>
                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
        
        <TabsContent value="serp" className="mt-0 focus:outline-none">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="analyzing"
              >
                <SerpAnalysisPanel 
                  serpData={null} 
                  isLoading={true} 
                  mainKeyword={mainKeyword} 
                />
              </motion.div>
            ) : serpData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                key="results"
              >
                <div className="mb-4 pb-3 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Search className="h-5 w-5 text-neon-purple" />
                      SERP Analysis for "{mainKeyword}"
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select items to include in your content outline
                    </p>
                  </div>

                  {selectedCount > 0 && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <span 
                        className="inline-flex items-center justify-center text-xs text-white/80 px-2 py-1 bg-neon-purple/20 rounded-full"
                      >
                        {selectedCount} items selected
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => generateOutlineFromSelections()}
                        className="bg-gradient-to-r from-neon-purple to-neon-blue text-xs"
                      >
                        <Check className="h-3 w-3 mr-1.5" />
                        Generate Outline
                      </Button>
                    </motion.div>
                  )}
                </div>

                <SerpAnalysisPanel 
                  serpData={serpData} 
                  isLoading={false} 
                  mainKeyword={mainKeyword} 
                  onAddToContent={handleAddToContent}
                />
                
                {/* Bottom action bar */}
                {selectedCount > 0 && (
                  <motion.div
                    className="sticky bottom-20 left-0 right-0 mt-6 p-3 bg-gradient-to-r from-neon-purple/80 to-neon-blue/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <Button 
                      onClick={() => handleContinue()} 
                      className="bg-white text-neon-purple hover:bg-white/90"
                    >
                      Continue with {selectedCount} Selected Items
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="empty"
                className="text-center py-12 bg-white/5 rounded-lg border border-white/10"
              >
                <p>No SERP data available. Please analyze a keyword first.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KeywordSelectionStep;
