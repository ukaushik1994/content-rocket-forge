
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpHeadingsSection } from '../serp-analysis';

interface SerpHeadingsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpHeadingsTab: React.FC<SerpHeadingsTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpHeadingsSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
