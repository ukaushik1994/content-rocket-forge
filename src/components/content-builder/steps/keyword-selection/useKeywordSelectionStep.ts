
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';

export const useKeywordSelectionStep = () => {
  const {
    state,
    dispatch,
    analyzeKeyword,
    addContentFromSerp,
  } = useContentBuilder();
  
  const {
    mainKeyword,
    selectedKeywords,
    serpData,
    isAnalyzing
  } = state;
  
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  useEffect(() => {
    // Check if we have completed the requirements to move forward
    if (mainKeyword && selectedKeywords.length > 0) {
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 0
      });

      // Also mark SERP analysis step as completed
      dispatch({
        type: 'MARK_STEP_COMPLETED',
        payload: 2
      });
    }
  }, [mainKeyword, selectedKeywords, dispatch]);
  
  const handleKeywordSearch = async (keyword: string, searchSuggestions: string[]) => {
    setSuggestions(searchSuggestions);

    // Set the main keyword
    dispatch({
      type: 'SET_MAIN_KEYWORD',
      payload: keyword
    });

    // Add it to selected keywords if not already there
    if (!selectedKeywords.includes(keyword)) {
      dispatch({
        type: 'ADD_KEYWORD',
        payload: keyword
      });
    }

    // Automatically start SERP analysis when a keyword is entered
    setHasSearched(true);
    await analyzeKeyword(keyword);
  };
  
  const handleAddKeyword = (kw: string) => {
    dispatch({
      type: 'ADD_KEYWORD',
      payload: kw
    });
  };
  
  const handleRemoveKeyword = (kw: string) => {
    dispatch({
      type: 'REMOVE_KEYWORD',
      payload: kw
    });
  };
  
  // Helper function to toggle selection state
  const handleToggleSelection = (type: string, content: string) => {
    dispatch({
      type: 'TOGGLE_SERP_SELECTION',
      payload: { type, content }
    });
  };
  
  // Function to handle adding content from SERP items
  const handleAddToContent = (content: string, type: string) => {
    handleToggleSelection(type, content);
  };
  
  // Handle reanalyzing the current keyword
  const handleReanalyze = async () => {
    if (mainKeyword) {
      await analyzeKeyword(mainKeyword);
    }
  };

  return {
    state,
    suggestions,
    hasSearched,
    handleKeywordSearch,
    handleAddKeyword,
    handleRemoveKeyword,
    handleToggleSelection,
    handleAddToContent,
    handleReanalyze
  };
};
