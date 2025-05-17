
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OptimizeHeader } from './optimize/OptimizeHeader';
import { ContentPreview } from './optimize/ContentPreview';
import { SeoSuggestionsList } from './optimize/SeoSuggestionsList';
import { SerpSelectedItemsSidebar } from '../serp/SerpSelectedItemsSidebar';

export const OptimizeAndReviewStep = () => {
  const { state, analyzeSeo, applySeoImprovement, skipOptimizationStep } = useContentBuilder();
  const { content, seoImprovements, seoScore, mainKeyword, isAnalyzing, optimizationSkipped, serpSelections } = state;
  
  // Handle analyze SEO action
  const handleAnalyzeSeo = () => {
    analyzeSeo(content);
  };
  
  // Handle improvement click
  const handleImprovementClick = (id: string) => {
    applySeoImprovement(id);
  };
  
  // Handle skip optimization
  const handleSkipOptimization = () => {
    skipOptimizationStep();
  };
  
  return (
    <div className="space-y-6">
      <OptimizeHeader 
        seoScore={seoScore}
        isAnalyzing={isAnalyzing}
        optimizationSkipped={optimizationSkipped}
        onAnalyze={handleAnalyzeSeo}
        onSkip={handleSkipOptimization}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SERP Selected Items Sidebar - Left */}
        <div className="lg:col-span-1">
          <SerpSelectedItemsSidebar serpSelections={serpSelections} />
        </div>
        
        {/* Main content preview area */}
        <div className="lg:col-span-2">
          <ContentPreview content={content} mainKeyword={mainKeyword} />
        </div>
        
        {/* SEO Suggestions list */}
        <div className="lg:col-span-1">
          <SeoSuggestionsList 
            improvements={seoImprovements} 
            onImprovementClick={handleImprovementClick}
            isAnalyzing={isAnalyzing}
          />
        </div>
      </div>
    </div>
  );
};
