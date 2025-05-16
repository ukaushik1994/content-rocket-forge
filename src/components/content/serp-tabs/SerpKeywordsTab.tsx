
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpKeywordsSection } from '../serp-analysis';

interface SerpKeywordsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpKeywordsTab: React.FC<SerpKeywordsTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpKeywordsSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
