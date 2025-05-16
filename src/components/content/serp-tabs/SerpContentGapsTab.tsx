
import React from 'react';
import { SerpAnalysisResult } from '@/types/serp';
import { SerpContentGapsSection } from '../serp-analysis';

interface SerpContentGapsTabProps {
  serpData: SerpAnalysisResult;
  onAddToContent?: (content: string, type: string) => void;
}

export const SerpContentGapsTab: React.FC<SerpContentGapsTabProps> = ({ 
  serpData,
  onAddToContent = () => {}
}) => {
  return (
    <div className="space-y-4">
      <SerpContentGapsSection 
        serpData={serpData} 
        expanded={true} 
        onAddToContent={onAddToContent}
      />
    </div>
  );
};
