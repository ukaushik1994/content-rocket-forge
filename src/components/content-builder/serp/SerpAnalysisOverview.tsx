
import React from 'react';
import { motion } from 'framer-motion';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { SerpSelection } from '@/contexts/content-builder/types';
import { 
  KeywordOverviewCard,
  ContentRecommendationsCard,
  SelectedItemsCard
} from './overview';

interface SerpAnalysisOverviewProps {
  serpData: SerpAnalysisResult;
  selectedCounts: {
    question: number;
    keyword: number;
    snippet: number;
    competitor: number;
  };
  totalSelected: number;
  getItemsByType: (type: string) => SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
}

export const SerpAnalysisOverview: React.FC<SerpAnalysisOverviewProps> = ({
  serpData,
  selectedCounts,
  totalSelected,
  getItemsByType,
  handleToggleSelection
}) => {
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
        totalSelected={totalSelected}
        selectedCounts={selectedCounts}
        getItemsByType={getItemsByType}
        handleToggleSelection={handleToggleSelection}
      />
    </div>
  );
};
