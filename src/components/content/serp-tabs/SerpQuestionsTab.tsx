
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpQuestionsSection } from '../serp-analysis';

interface SerpQuestionsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpQuestionsTab: React.FC<SerpQuestionsTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpQuestionsSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
