
import React from 'react';
import { KeywordSelectionContent } from './KeywordSelectionContent';
import { useKeywordSelectionStep } from './useKeywordSelectionStep';

export const KeywordSelectionStep = () => {
  const {
    state,
    suggestions,
    hasSearched,
    handleKeywordSearch,
    handleAddKeyword,
    handleRemoveKeyword,
    handleToggleSelection,
    handleAddToContent,
    handleReanalyze
  } = useKeywordSelectionStep();
  
  return (
    <KeywordSelectionContent
      mainKeyword={state.mainKeyword}
      selectedKeywords={state.selectedKeywords}
      suggestions={suggestions}
      hasSearched={hasSearched}
      serpData={state.serpData}
      isAnalyzing={state.isAnalyzing}
      onSearch={handleKeywordSearch}
      onAddKeyword={handleAddKeyword}
      onRemoveKeyword={handleRemoveKeyword}
      onAddToContent={handleAddToContent}
      onReanalyze={handleReanalyze}
    />
  );
};
