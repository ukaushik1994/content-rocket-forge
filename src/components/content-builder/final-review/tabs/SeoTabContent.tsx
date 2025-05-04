
import React from 'react';
import { KeywordUsageSummaryCard } from '../KeywordUsageSummaryCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { SolutionIntegrationCard } from '../SolutionIntegrationCard';
import { TitleSuggestionsCard } from '../TitleSuggestionsCard';
import { Solution, SolutionIntegrationMetrics } from '@/contexts/content-builder/types';
import { motion } from 'framer-motion';

interface SeoTabContentProps {
  keywordUsage: { keyword: string; count: number; density: string }[];
  mainKeyword: string;
  selectedKeywords: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
  solutionIntegrationMetrics: SolutionIntegrationMetrics | null;
  selectedSolution: Solution | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  titleSuggestions: string[];
  isGeneratingTitles: boolean;
  onGenerateTitleSuggestions: () => void;
}

export const SeoTabContent = ({
  keywordUsage,
  mainKeyword,
  selectedKeywords,
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta,
  solutionIntegrationMetrics,
  selectedSolution,
  isAnalyzing,
  onAnalyze,
  titleSuggestions,
  isGeneratingTitles,
  onGenerateTitleSuggestions
}: SeoTabContentProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Main SEO area */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <KeywordUsageSummaryCard 
            keywordUsage={keywordUsage} 
            mainKeyword={mainKeyword}
            selectedKeywords={selectedKeywords}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <MetaInformationCard 
            metaTitle={metaTitle || ''} 
            metaDescription={metaDescription || ''}
            onMetaTitleChange={onMetaTitleChange}
            onMetaDescriptionChange={onMetaDescriptionChange}
            onGenerateMeta={onGenerateMeta}
          />
        </motion.div>
        
        {/* Title Suggestions Card */}
        <motion.div variants={item} className="col-span-1 md:col-span-2">
          <TitleSuggestionsCard 
            currentTitle={metaTitle}
            mainKeyword={mainKeyword}
            selectedKeywords={selectedKeywords}
            onSelectTitle={onMetaTitleChange}
            generateNewTitles={onGenerateTitleSuggestions}
            suggestions={titleSuggestions}
            isGenerating={isGeneratingTitles}
          />
        </motion.div>
      </div>
      
      {/* Side panel */}
      <motion.div variants={item} className="space-y-6">
        <SolutionIntegrationCard 
          metrics={solutionIntegrationMetrics}
          solution={selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
        />
      </motion.div>
    </motion.div>
  );
};
