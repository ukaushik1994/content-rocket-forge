import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpSelection } from '@/contexts/content-builder/types';
import { 
  KeywordOverviewCard,
  ContentRecommendationsCard,
  SelectedItemsCard
} from './overview';

export interface SerpAnalysisOverviewProps {
  serpData: SerpAnalysisResult;
  selections?: SerpSelection[];
  serpSelections?: SerpSelection[]; // For backwards compatibility
  maxItemsToShow?: number;
  selectedCounts?: {
    question: number;
    keyword: number;
    snippet: number;
    competitor: number;
  };
  totalSelected?: number;
  getItemsByType?: (type: string) => SerpSelection[];
  handleToggleSelection?: (type: string, content: string) => void;
}

export const SerpAnalysisOverview: React.FC<SerpAnalysisOverviewProps> = ({
  serpData,
  selectedCounts,
  totalSelected,
  getItemsByType,
  handleToggleSelection,
  selections,
  serpSelections, // Support both for backwards compatibility
  maxItemsToShow
}) => {
  // Use either selections or serpSelections
  const allSelections = selections || serpSelections || [];
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Helper functions to make component work with both old and new prop formats
  const getSelectedCount = (type: string) => {
    if (selectedCounts) {
      return selectedCounts[type as keyof typeof selectedCounts] || 0;
    }
    
    if (allSelections && allSelections.length > 0) {
      return allSelections.filter(s => s.type === type && s.selected).length;
    }
    
    return 0;
  };
  
  const getTotalSelected = () => {
    if (totalSelected !== undefined) return totalSelected;
    if (allSelections && allSelections.length > 0) return allSelections.filter(s => s.selected).length;
    return 0;
  };
  
  const getItemsOfType = (type: string) => {
    if (getItemsByType) return getItemsByType(type);
    if (allSelections && allSelections.length > 0) return allSelections.filter(s => s.type === type);
    return [];
  };
  
  const toggleSelection = (type: string, content: string) => {
    if (handleToggleSelection) handleToggleSelection(type, content);
  };

  return (
    <div className="space-y-6">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <KeywordOverviewCard serpData={serpData} />
        <ContentRecommendationsCard serpData={serpData} />
      </motion.div>
      
      <SelectedItemsCard
        totalSelected={getTotalSelected()}
        selectedCounts={{
          question: getSelectedCount('question'),
          keyword: getSelectedCount('keyword'),
          snippet: getSelectedCount('snippet'),
          competitor: getSelectedCount('competitor')
        }}
        getItemsByType={getItemsOfType}
        handleToggleSelection={toggleSelection}
      />
    </div>
  );
};
