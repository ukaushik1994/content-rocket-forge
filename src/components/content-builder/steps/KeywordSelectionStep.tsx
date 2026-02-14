import React, { useState, useEffect, useRef } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings, Zap, Rocket, Target, Plus, CheckCircle2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceCheckModal } from '@/components/content-builder/ServiceCheckModal';
import { SerpAnalysisModal } from './keyword-analysis/SerpAnalysisModal';
import { SelectionManagerModal } from './keyword-analysis/SelectionManagerModal';
import { FloatingSelectionWindow } from './keyword-analysis/FloatingSelectionWindow';
import { SolutionSelectionModal } from '../SolutionSelectionModal';
import { toast } from 'sonner';
import { contentFormats } from '@/components/content-repurposing/formats';
import { ContentType } from '@/contexts/content-builder/types';
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
    isAnalyzing,
    selectedSolution,
    contentType
  } = state;
  const [hasSearched, setHasSearched] = useState(false);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [apiKeysStatus, setApiKeysStatus] = useState<ApiKeysStatus>({
    serpApi: {
      configured: false,
      working: false
    },
    serpstack: {
      configured: false,
      working: false
    }
  });
  const [showSerpAnalysisModal, setShowSerpAnalysisModal] = useState(false);
  const [showSelectionManagerModal, setShowSelectionManagerModal] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const prevSerpDataRef = useRef(serpData);

  useEffect(() => {
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 0 });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 2 });
    }
  }, [mainKeyword, selectedKeywords, dispatch]);

  // Auto-open SERP modal when serpData becomes available after search
  useEffect(() => {
    if (!prevSerpDataRef.current && serpData && hasSearched) {
      setShowSerpAnalysisModal(true);
    }
    prevSerpDataRef.current = serpData;
  }, [serpData, hasSearched]);

  // Auto-open solution modal if no selection made
  useEffect(() => {
    if (!selectedSolution || !contentType) {
      setShowSolutionModal(true);
    }
  }, []);

  // Handle status updates (kept for compatibility)
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
      payload: {
        id: `${type}-${Date.now()}`,
        type,
        content
      }
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
  return <>
      <div className="w-full px-6 pt-24 pb-12">
        {/* Hero Search Section */}
        <motion.div className="text-center mb-16 relative" initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
          <motion.div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" animate={{
          opacity: [0.5, 0.8, 0.5]
        }} transition={{
          duration: 4,
          repeat: Infinity
        }} />
          
          <div className="relative">
            <motion.div className="inline-flex items-center gap-3 px-6 py-3 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 mb-8" whileHover={{
            scale: 1.05
          }} transition={{
            type: "spring",
            stiffness: 300
          }}>
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered SERP Intelligence</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </motion.div>
            
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }}>
              Discover Content
              <br />
              <span className="text-primary">Opportunities</span>
            </motion.h1>
            
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
              Advanced SERP analysis that reveals competitor insights, content gaps, 
              and optimization opportunities to dominate search results
            </motion.p>

            {/* Quick Stats - Above Search */}
            <motion.div className="flex justify-center gap-8 mb-10" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.5
            }}>
              {[{
                icon: TrendingUp,
                label: "SERP Features",
                value: "15+"
              }, {
                icon: BarChart3,
                label: "Data Points",
                value: "200+"
              }, {
                icon: Zap,
                label: "Analysis Time",
                value: "< 30s"
              }].map((stat) => (
                <motion.div key={stat.label} className="text-center" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-background/60 backdrop-blur-xl rounded-xl border border-border/50 mb-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Search Input */}
            <motion.div className="max-w-2xl mx-auto relative" initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 0.6,
              type: "spring",
              stiffness: 200
            }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-xl opacity-60" />
              <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl border border-border/50 p-2 shadow-2xl">
                <ServiceCheckModal />
                <div className="mt-4">
                  <KeywordSearch initialKeyword={mainKeyword} onKeywordSearch={handleKeywordSearch} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Selection Chip */}
        {(selectedSolution || contentType) && (
          <motion.div 
            className="flex justify-center mt-6" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
          >
            <button
              onClick={() => setShowSolutionModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur-xl rounded-full border border-border/50 text-sm hover:border-primary/50 transition-all group"
            >
              {selectedSolution && contentType ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-foreground">{selectedSolution.name}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-primary">{contentFormats.find(f => f.id === contentType)?.name}</span>
                  <Palette className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </>
              ) : (
                <>
                  <Palette className="h-3.5 w-3.5 text-primary animate-pulse" />
                  <span className="text-muted-foreground">Select solution & content type</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Reminder chip if dismissed without selecting */}
        {!selectedSolution && !contentType && (
          <motion.div className="flex justify-center mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button
              onClick={() => setShowSolutionModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 backdrop-blur-xl rounded-full border border-primary/30 text-sm hover:bg-primary/20 transition-all"
            >
              <Palette className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-primary">Select solution & content type to begin</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Floating Selection Window */}
      <FloatingSelectionWindow selectedKeywords={selectedKeywords} serpSelections={serpSelections} onRemoveKeyword={handleRemoveKeyword} onOpenSelectionManager={() => setShowSelectionManagerModal(true)} />

      {/* Modals */}
      <SerpAnalysisModal isOpen={showSerpAnalysisModal} onClose={() => {
      console.log('🔥 Modal closing');
      setShowSerpAnalysisModal(false);
    }} serpData={serpData} serpSelections={serpSelections} onToggleSelection={handleToggleSelection} keyword={mainKeyword || ''} onSerpDataUpdate={data => {
      dispatch({
        type: 'SET_SERP_DATA',
        payload: data
      });
    }} />

      <SelectionManagerModal isOpen={showSelectionManagerModal} onClose={() => setShowSelectionManagerModal(false)} serpSelections={serpSelections} onToggleSelection={handleToggleSelection} onClearAll={handleClearAllSelections} onGenerateOutline={handleGenerateOutline} />

      <SolutionSelectionModal isOpen={showSolutionModal} onOpenChange={setShowSolutionModal} />
    </>;
};