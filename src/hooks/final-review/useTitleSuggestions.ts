
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { generateTitleSuggestions } from '@/utils/seo/documentAnalysis';
import { toast } from 'sonner';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true }
};

/**
 * Custom hook for generating and managing title suggestions
 */
export const useTitleSuggestions = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, mainKeyword, selectedKeywords, metaTitle } = state;
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  
  // Generate title suggestions
  const generateTitleSuggestionsAsync = async () => {
    if (!content || !mainKeyword) {
      toast.error('Content or main keyword not available for generating titles', toastConfig.error);
      return;
    }
    
    setIsGeneratingTitles(true);
    
    try {
      // Call the generateTitleSuggestions function from documentAnalysis
      const suggestions = await generateTitleSuggestions(content, mainKeyword, selectedKeywords);
      
      setTitleSuggestions(suggestions);
      console.log("[useTitleSuggestions] Generated title suggestions:", suggestions);
      toast.success('Generated title suggestions', toastConfig.success);
      
      // If there's at least one suggestion and no meta title set yet, automatically use the first one
      if (suggestions.length > 0 && !state.metaTitle) {
        const initialTitle = suggestions[0];
        console.log("[useTitleSuggestions] Setting initial title:", initialTitle);
        dispatch({ type: 'SET_META_TITLE', payload: initialTitle });
        dispatch({ type: 'SET_CONTENT_TITLE', payload: initialTitle });
      }
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      toast.error('Failed to generate title suggestions', toastConfig.error);
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  return {
    isGeneratingTitles,
    titleSuggestions,
    generateTitleSuggestions: generateTitleSuggestionsAsync
  };
};
