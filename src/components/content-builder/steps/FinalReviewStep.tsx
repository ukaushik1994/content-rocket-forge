
import React, { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useFinalReview } from '@/hooks/useFinalReview';
import { DocumentStructureCard } from '../final-review/DocumentStructureCard';
import { MetaInformationCard } from '../final-review/MetaInformationCard';
import { SolutionIntegrationCard } from '../final-review/SolutionIntegrationCard';
import { KeywordUsageSummaryCard } from '../final-review/KeywordUsageSummaryCard';
import { FinalChecklistCard } from '../final-review/FinalChecklistCard';
import { ContentReviewCard } from '../final-review/ContentReviewCard';

export const FinalReviewStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    metaTitle, 
    metaDescription, 
    documentStructure, 
    selectedSolution,
    solutionIntegrationMetrics,
    selectedKeywords 
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
    },
    {
      title: 'Secondary keywords are included in content',
      passed: selectedKeywords.filter(k => k !== mainKeyword).some(k => 
        keywordUsage.some(usage => usage.keyword === k && usage.count > 0)
      )
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
      
      {/* Updated layout with content review */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Content review - takes up 4/7 of space on large screens */}
        <div className="lg:col-span-4 space-y-4">
          <ContentReviewCard content={content} />
        </div>
        
        {/* Sidebar with meta and keyword information - takes up 3/7 of space */}
        <div className="lg:col-span-3 space-y-4">
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
            selectedKeywords={selectedKeywords}
          />
        </div>
      </div>
      
      {/* Second row - document structure, checklist, and solution integration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DocumentStructureCard documentStructure={documentStructure} />
        <FinalChecklistCard checks={checklistItems} />
        <SolutionIntegrationCard 
          metrics={solutionIntegrationMetrics}
          solution={selectedSolution}
          isAnalyzing={isAnalyzing}
          onAnalyze={analyzeSolutionUsage}
        />
      </div>
    </div>
  );
};
