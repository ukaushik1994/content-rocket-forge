
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { DocumentStructureCard } from '../final-review/DocumentStructureCard';
import { MetaInformationCard } from '../final-review/MetaInformationCard';
import { SolutionIntegrationCard } from '../final-review/SolutionIntegrationCard';
import { KeywordUsageSummaryCard } from '../final-review/KeywordUsageSummaryCard';
import { FinalChecklistCard } from '../final-review/FinalChecklistCard';

export const FinalReviewStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics 
  } = state;
  
  const { 
    isAnalyzing, 
    keywordUsage, 
    ctaInfo, 
    generateMeta, 
    analyzeSolutionUsage, 
    checkStepCompletion 
  } = useFinalReview();
  
  // Set meta information when component mounts if not already set
  useEffect(() => {
    if (content && mainKeyword && !metaTitle && !metaDescription) {
      generateMeta();
    }
  }, []);
  
  // Check if step can be completed
  useEffect(() => {
    checkStepCompletion();
  }, [metaTitle, metaDescription, documentStructure]);
  
  // Update meta information
  const handleMetaTitleChange = (value: string) => {
    dispatch({ type: 'SET_META_TITLE', payload: value });
  };
  
  const handleMetaDescriptionChange = (value: string) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: value });
  };
  
  // Build checklist items
  const checklistItems = [
    {
      title: 'Document has exactly one H1 tag',
      passed: !!documentStructure?.hasSingleH1
    },
    {
      title: 'Document has logical heading hierarchy',
      passed: !!documentStructure?.hasLogicalHierarchy
    },
    {
      title: 'Meta title includes primary keyword',
      passed: !!metaTitle && mainKeyword ? metaTitle.toLowerCase().includes(mainKeyword.toLowerCase()) : false
    },
    {
      title: 'Meta description is 50-160 characters',
      passed: !!metaDescription && metaDescription.length >= 50 && metaDescription.length <= 160
    },
    {
      title: 'Content has call-to-action',
      passed: ctaInfo.hasCTA
    },
    {
      title: 'Solution features are incorporated',
      passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.featureIncorporation > 50
    },
    {
      title: 'Solution is positioned effectively',
      passed: !!solutionIntegrationMetrics && solutionIntegrationMetrics.positioningScore > 70
    },
    {
      title: 'Primary keyword has optimal density (0.5% - 3%)',
      passed: keywordUsage.some(k => k.keyword === mainKeyword && 
        parseFloat(k.density) >= 0.5 && 
        parseFloat(k.density) <= 3)
    }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-medium">Final Review</h3>
        <p className="text-sm text-muted-foreground">
          Review your content structure, meta information, and solution integration.
        </p>
      </div>
      
      {/* Responsive grid layout with consistent card heights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First column at larger screens */}
        <div className="space-y-4 md:col-span-1">
          <DocumentStructureCard documentStructure={documentStructure} />
          <FinalChecklistCard checks={checklistItems} />
        </div>
        
        {/* Second column at larger screens */}
        <div className="space-y-4 md:col-span-1">
          <MetaInformationCard 
            metaTitle={metaTitle || ''} 
            metaDescription={metaDescription || ''}
            onMetaTitleChange={handleMetaTitleChange}
            onMetaDescriptionChange={handleMetaDescriptionChange}
            onGenerateMeta={generateMeta}
          />
          <KeywordUsageSummaryCard 
            keywordUsage={keywordUsage} 
            mainKeyword={mainKeyword} 
          />
        </div>
        
        {/* Third column - Solution integration (full width on mobile) */}
        <div className="md:col-span-1">
          <SolutionIntegrationCard 
            metrics={solutionIntegrationMetrics}
            solution={selectedSolution}
            isAnalyzing={isAnalyzing}
            onAnalyze={analyzeSolutionUsage}
          />
        </div>
      </div>
    </div>
  );
};
