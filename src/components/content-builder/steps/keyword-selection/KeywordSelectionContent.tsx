
import React from 'react';
import { motion } from 'framer-motion';
import { ContentBuilderState } from '@/contexts/content-builder/types';
import { SelectedKeywords } from '../../keyword/SelectedKeywords';
import { SelectedItemsSidebar } from '../serp-analysis/SelectedItemsSidebar';
import { SerpAnalysisPanel } from '../../serp/SerpAnalysisPanel';
import { SerpSelectionStats } from '../serp-analysis/SerpSelectionStats';

interface KeywordSelectionContentProps {
  state: ContentBuilderState;
  handleRemoveKeyword: (kw: string) => void;
  handleAddToContent: (content: string, type: string) => void;
  handleToggleSelection: (type: string, content: string) => void;
}

export const KeywordSelectionContent: React.FC<KeywordSelectionContentProps> = ({
  state,
  handleRemoveKeyword,
  handleAddToContent,
  handleToggleSelection
}) => {
  const {
    mainKeyword,
    selectedKeywords,
    serpData,
    serpSelections,
    isAnalyzing
  } = state;
  
  // Get selection statistics for the SERP data
  const { selectedCounts, totalSelected } = SerpSelectionStats({ serpSelections });
  
  return (
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
  );
};
