
import React from 'react';
import { KeywordUsageSummaryCard } from '../KeywordUsageSummaryCard';
import { MetaInformationCard } from '../MetaInformationCard';
import { SolutionIntegrationCard } from '../SolutionIntegrationCard';
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
  onAnalyze
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
