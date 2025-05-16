
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpEntitiesSection } from '../serp-analysis';

interface SerpEntitiesTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpEntitiesTab: React.FC<SerpEntitiesTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpEntitiesSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
