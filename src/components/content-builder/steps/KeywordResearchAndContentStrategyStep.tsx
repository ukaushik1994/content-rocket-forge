
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { ContentTypeStep } from './ContentTypeStep';
import { AIOutlineGenerator } from '../outline/AIOutlineGenerator';
import { OutlineTable } from '../outline/OutlineTable';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings, Zap, Rocket, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedSerpStatus } from '@/components/content-builder/serp/EnhancedSerpStatus';
import { NoDataAvailable } from './NoDataAvailable';
import { SerpAnalysisModal } from './keyword-analysis/SerpAnalysisModal';
import { Separator } from '@/components/ui/separator';

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

export const KeywordResearchAndContentStrategyStep = () => {
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
    isAnalyzing,
    outline,
    contentType,
    contentFormat,
    contentIntent
  } = state;
  
  const [hasSearched, setHasSearched] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<ApiKeysStatus>({
    serpApi: { configured: false, working: false },
    serpstack: { configured: false, working: false }
  });
  const [showSerpAnalysisModal, setShowSerpAnalysisModal] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  
  useEffect(() => {
    // Mark as complete if we have all requirements
    if (mainKeyword && selectedKeywords.length > 0 && contentType && outline.length >= 3) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
      // Also mark SERP analysis step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    }
  }, [mainKeyword, selectedKeywords, contentType, outline, dispatch]);
  
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
  
  // Handle generating outline from selections
  const handleGenerateOutline = async () => {
    setIsGeneratingOutline(true);
    try {
      await generateOutlineFromSelections();
    } finally {
      setIsGeneratingOutline(false);
    }
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };

  const handleSaveOutline = (updatedOutline: string[]) => {
    dispatch({ type: 'SET_OUTLINE', payload: updatedOutline });
  };
  
  const selectedCount = serpSelections.filter(item => item.selected).length;
  const hasSerpSelections = serpSelections.some(item => item.selected);
  
  return (
    <div className="space-y-8 relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

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
                  Keyword Research & Content Strategy
                </h2>
                <p className="text-gray-400 font-medium">
                  Research keywords, configure content, and create outlines
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

      {/* Main Content - Two Column Layout with Professional Alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column - Keyword Research & Content Config */}
        <div className="space-y-6">
          {/* Column Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-holographic">Research & Configuration</h3>
          </div>

          {/* Keyword Search Section */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <Label htmlFor="main-keyword" className="text-base font-medium flex items-center gap-2">
                <span className="text-holographic">Primary Keyword</span>
              </Label>
              <motion.div 
                className="px-3 py-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-white/20 backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-xs text-gray-300 font-medium">🚀 AI Powered</span>
              </motion.div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-50" />
              <div className="relative glass-card rounded-2xl p-1 border-2 border-white/20">
                <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
              </div>
            </div>
          </motion.div>

          {/* Selected Keywords */}
          {selectedKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card-3d"
            >
              <SelectedKeywords 
                keywords={selectedKeywords} 
                onRemoveKeyword={handleRemoveKeyword} 
              />
            </motion.div>
          )}

          {/* SERP Analysis Summary */}
          {hasSearched && serpData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card card-3d overflow-hidden min-h-[140px]">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5" />
                
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg backdrop-blur-sm border border-white/20 neon-glow">
                        <BarChart3 className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <span className="text-lg text-holographic">SERP Intelligence</span>
                        <p className="text-xs text-gray-400 font-normal">Advanced competitive analysis</p>
                      </div>
                    </motion.div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSerpAnalysisModal(true)}
                      className="bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30 backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Explore Data
                    </Button>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 pt-0">
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-400 mb-3">
                      {selectedCount > 0 
                        ? `${selectedCount} items selected for outline generation`
                        : "Click 'Explore Data' to select SERP insights"
                      }
                    </p>
                    {selectedCount > 0 && (
                      <Button
                        onClick={handleGenerateOutline}
                        disabled={isGeneratingOutline}
                        size="sm"
                        className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/80 hover:to-blue-500/80"
                      >
                        {isGeneratingOutline ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Outline
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Content Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card min-h-[200px]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-holographic">Content Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ContentTypeStep />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Outline Creation */}
        <div className="space-y-6">
          {/* Column Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-holographic">Content Outline</h3>
            <p className="text-sm text-muted-foreground ml-auto">
              Create and edit your content structure
            </p>
          </div>

          {/* AI Outline Generator */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="min-h-[140px]"
          >
            <AIOutlineGenerator />
          </motion.div>

          {/* Outline Table */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="min-h-[200px]"
          >
            <Card className="glass-card">
              <CardContent className="pt-6">
                <OutlineTable 
                  outline={outline} 
                  onSave={handleSaveOutline} 
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Initial State - Before Search */}
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
              Begin Your Content Strategy
            </motion.h3>
            
            <motion.p 
              className="text-gray-400 max-w-2xl text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Enter your target keyword to unlock comprehensive SERP intelligence, 
              configure your content type, and create AI-powered outlines
            </motion.p>
            
            <motion.div 
              className="mt-8 flex items-center gap-2 text-sm text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Zap className="h-4 w-4" />
              <span>Real-time analysis • Content configuration • Smart outlines</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SERP Analysis Modal */}
      <SerpAnalysisModal
        isOpen={showSerpAnalysisModal}
        onClose={() => setShowSerpAnalysisModal(false)}
        keyword={mainKeyword}
        serpData={serpData}
        serpSelections={serpSelections}
        onToggleSelection={(type: string, content: string) => {
          dispatch({
            type: 'TOGGLE_SERP_SELECTION',
            payload: { type, content }
          });
        }}
      />
    </div>
  );
};
