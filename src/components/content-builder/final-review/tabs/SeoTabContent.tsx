
import React from 'react';
import { KeywordUsageSummaryCard } from '../KeywordUsageSummaryCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { SolutionIntegrationCard } from '../SolutionIntegrationCard';
import { TitleSuggestionsCard } from '../TitleSuggestionsCard';
import { Solution, SolutionIntegrationMetrics } from '@/contexts/content-builder/types';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main SEO area */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <KeywordUsageSummaryCard 
          keywordUsage={keywordUsage} 
          mainKeyword={mainKeyword}
          selectedKeywords={selectedKeywords}
        />
        <MetaInformationCard 
          metaTitle={metaTitle || ''} 
          metaDescription={metaDescription || ''}
          onMetaTitleChange={onMetaTitleChange}
          onMetaDescriptionChange={onMetaDescriptionChange}
          onGenerateMeta={onGenerateMeta}
        />
        
        {/* Title Suggestions Card */}
        <div className="col-span-1 md:col-span-2">
          <TitleSuggestionsCard 
            currentTitle={metaTitle}
            mainKeyword={mainKeyword}
            selectedKeywords={selectedKeywords}
            onSelectTitle={onMetaTitleChange}
            generateNewTitles={onGenerateTitleSuggestions}
            suggestions={titleSuggestions}
            isGenerating={isGeneratingTitles}
          />
        </div>
      </div>
      
      {/* Side panel */}
      <div className="space-y-6">
        <SolutionIntegrationCard 
          metrics={solutionIntegrationMetrics}
          solution={selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={onAnalyze}
        />
      </div>
    </div>
  );
};
