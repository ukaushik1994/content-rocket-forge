
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpCompetitorsSection } from '../serp-analysis';

interface SerpCompetitorsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpCompetitorsTab: React.FC<SerpCompetitorsTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpCompetitorsSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
