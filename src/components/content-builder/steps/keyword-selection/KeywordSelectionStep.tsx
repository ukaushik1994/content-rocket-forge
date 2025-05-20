
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useKeywordSelectionStep } from './useKeywordSelectionStep';
import { KeywordSelectionContent } from './KeywordSelectionContent';
import { StepIntroduction } from '../StepIntroduction';
import { Loader2 } from 'lucide-react';

export const KeywordSelectionStep = () => {
  const { state } = useContentBuilder();
  const { 
    mainKeyword, 
    selectedKeywords, 
    isAnalyzing,
    serpData
  } = state;
  
  const {
    suggestions,
    hasSearched,
    handleKeywordSearch,
    handleAddKeyword,
    handleRemoveKeyword,
    handleReanalyze
  } = useKeywordSelectionStep();
  
  // Track if keyword data is loading
  const isLoadingKeywordData = isAnalyzing;
  
  // Get related keywords from SERP data if available
  const relatedKeywords = serpData?.relatedSearches?.map((item: any) => item.query) || [];
  
  // If in loading state, show loading indicator
  if (isLoadingKeywordData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 size={48} className="animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Analyzing keyword data...</p>
        <p className="text-muted-foreground">This may take a few moments</p>
      </div>
    );
  }
  
  return (
    <>
      {/* Introduction for first-time users */}
      {!mainKeyword && !hasSearched && (
        <StepIntroduction
          title="Keyword Selection"
          description="Start by searching for a primary keyword that you want to create content about. This will be the main focus of your content."
          icon="keyword"
        />
      )}
      
      <KeywordSelectionContent 
        mainKeyword={mainKeyword || ''}
        keywordSuggestions={suggestions}
        selectedKeyword={mainKeyword}
        relatedKeywords={relatedKeywords}
        isLoadingKeywordData={isLoadingKeywordData}
        isAnalyzing={isAnalyzing}
        onKeywordSearch={handleKeywordSearch}
        onKeywordSelect={handleAddKeyword}
        onContinue={handleReanalyze}
      />
    </>
  );
};
