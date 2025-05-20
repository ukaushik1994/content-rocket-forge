
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { InitialStateView } from './InitialStateView';
import { KeywordSelectionContent } from './KeywordSelectionContent';

export const KeywordSelectionStep: React.FC = () => {
  const { state, dispatch, analyzeKeyword } = useContentBuilder();
  const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);
  const [isLoadingKeywordData, setIsLoadingKeywordData] = useState<boolean>(false);
  
  // Get relevant data from content builder state
  const { mainKeyword, isAnalyzing } = state;
  
  // Handle keyword search
  const handleKeywordSearch = (keyword: string, suggestions: string[]) => {
    // Set the main keyword in state
    dispatch({ type: 'SET_MAIN_KEYWORD', payload: keyword });
    
    // Update suggestions
    setKeywordSuggestions(suggestions);
    
    // Auto-select the first suggestion if available
    if (suggestions.length > 0) {
      dispatch({ type: 'SET_SELECTED_KEYWORD', payload: suggestions[0] });
    } else {
      // If no suggestions, use the main keyword
      dispatch({ type: 'SET_SELECTED_KEYWORD', payload: keyword });
    }
    
    // Generate some mock related keywords based on the selected keyword
    generateRelatedKeywords(keyword);
  };
  
  // Handle keyword selection
  const handleKeywordSelect = (keyword: string) => {
    dispatch({ type: 'SET_SELECTED_KEYWORD', payload: keyword });
    
    // Generate related keywords based on the selected keyword
    generateRelatedKeywords(keyword);
  };
  
  // Generate mock related keywords
  const generateRelatedKeywords = (keyword: string) => {
    setIsLoadingKeywordData(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const related = [
        `best ${keyword}`,
        `${keyword} guide`,
        `how to use ${keyword}`,
        `${keyword} tutorial`,
        `${keyword} alternatives`,
        `${keyword} vs competition`,
        `affordable ${keyword}`,
        `${keyword} for beginners`
      ];
      
      setRelatedKeywords(related);
      setIsLoadingKeywordData(false);
    }, 1000);
  };
  
  // Handle continuing to the next step
  const handleContinue = async () => {
    if (!state.selectedKeyword) return;
    
    // Mark the step as completed
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 1 });
    
    // Analyze the selected keyword
    await analyzeKeyword(state.selectedKeyword);
    
    // Advance to the next step
    dispatch({ type: 'SET_ACTIVE_STEP', payload: 2 });
  };
  
  // Determine which view to show
  const showInitialState = !mainKeyword && keywordSuggestions.length === 0;
  
  return (
    <div className="space-y-6">
      {showInitialState ? (
        <InitialStateView />
      ) : (
        <KeywordSelectionContent
          mainKeyword={mainKeyword}
          keywordSuggestions={keywordSuggestions}
          selectedKeyword={state.selectedKeyword || ''}
          relatedKeywords={relatedKeywords}
          isLoadingKeywordData={isLoadingKeywordData}
          isAnalyzing={isAnalyzing}
          onKeywordSearch={handleKeywordSearch}
          onKeywordSelect={handleKeywordSelect}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
};
