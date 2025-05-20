
import React from 'react';
import { Sparkles, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { KeywordSearch } from '../../keyword/KeywordSearch';
import { SelectedKeywords } from '../../keyword/SelectedKeywords';
import { useKeywordSelectionStep } from './useKeywordSelectionStep';
import { InitialStateView } from './InitialStateView';
import { KeywordSelectionContent } from './KeywordSelectionContent';

export const KeywordSelectionStep = () => {
  const {
    state,
    handleKeywordSearch,
    handleRemoveKeyword,
    handleAddToContent,
    handleToggleSelection,
    hasSearched
  } = useKeywordSelectionStep();

  return (
    <div className="space-y-8">
      {/* Header with animation */}
      <motion.div 
        className="relative overflow-hidden rounded-lg glass-panel border border-white/10 p-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="text-lg font-semibold">Selection & Analysis</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your main keyword below to analyze search trends and discover content opportunities
          </p>
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
            <KeywordSearch initialKeyword={state.mainKeyword} onKeywordSearch={handleKeywordSearch} />
          </div>
        </div>

        <AnimatePresence>
          {!hasSearched && <InitialStateView />}
          
          {hasSearched && (
            <KeywordSelectionContent 
              state={state}
              handleRemoveKeyword={handleRemoveKeyword}
              handleAddToContent={handleAddToContent}
              handleToggleSelection={handleToggleSelection}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
