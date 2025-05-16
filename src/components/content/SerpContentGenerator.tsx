
import React from 'react';
import { SerpAnalysisResult } from '@/services/serpApiService';
import { ContentTemplatesHeader } from './templates/ContentTemplatesHeader';
import { ContentTemplatesGrid } from './templates/ContentTemplatesGrid';
import { ContentStrategyTips } from './templates/ContentStrategyTips';
import { EmptyState } from './templates/EmptyState';

interface SerpContentGeneratorProps {
  serpData: SerpAnalysisResult | null;
  onGenerateContent: (template: string) => void;
  mainKeyword: string;
}

export function SerpContentGenerator({ 
  serpData, 
  onGenerateContent,
  mainKeyword
}: SerpContentGeneratorProps) {
  if (!serpData) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8">
      <ContentTemplatesHeader />
      
      <ContentTemplatesGrid 
        serpData={serpData}
        onGenerateContent={onGenerateContent}
        mainKeyword={mainKeyword}
      />
      
      <ContentStrategyTips />
    </div>
  );
}
