
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { generateTitleSuggestions } from '@/utils/seo/titles/generateTitleSuggestions';
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
  const { content, mainKeyword, selectedKeywords, metaTitle, contentTitle } = state;
  
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
      
      // Shuffle the suggestions to ensure different ordering each time
      const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5);
      
      setTitleSuggestions(shuffledSuggestions);
      console.log("[useTitleSuggestions] Generated title suggestions:", shuffledSuggestions);
      toast.success('Generated title suggestions', toastConfig.success);
      
      // Only set a title automatically if there's no existing title
      if (shuffledSuggestions.length > 0 && !metaTitle && !contentTitle) {
        // Use a random title from the first three suggestions instead of always the first one
        const randomIndex = Math.floor(Math.random() * Math.min(3, shuffledSuggestions.length));
        const initialTitle = shuffledSuggestions[randomIndex];
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
