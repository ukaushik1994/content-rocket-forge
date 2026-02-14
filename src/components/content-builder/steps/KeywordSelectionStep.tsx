import React, { useState, useEffect, useRef } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { KeywordSearch } from '../keyword/KeywordSearch';
import { SelectedKeywords } from '../keyword/SelectedKeywords';
import { Search, ChevronRight, Sparkles, Loader2, TrendingUp, BarChart3, Eye, Settings, Zap, Rocket, Target, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceCheckModal } from '@/components/content-builder/ServiceCheckModal';
import { SerpAnalysisModal } from './keyword-analysis/SerpAnalysisModal';
import { SelectionManagerModal } from './keyword-analysis/SelectionManagerModal';
import { FloatingSelectionWindow } from './keyword-analysis/FloatingSelectionWindow';
import { ContentTypeStep } from './ContentTypeStep';
import { toast } from 'sonner';
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

        {/* Content Configuration Section */}
        <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <div className="bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
            <ContentTypeStep />
          </div>
        </motion.div>
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
    </>;
};