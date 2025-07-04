
import { useState, useCallback } from 'react';
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
 * based on main keyword and SERP selected items
 */
export const useTitleSuggestions = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    mainKeyword, 
    selectedKeywords, 
    metaTitle, 
    contentTitle,
    serpSelections,
    outline
  } = state;
  
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  
  // Generate title suggestions
  const generateTitleSuggestionsAsync = useCallback(async () => {
    if (!mainKeyword) {
      toast.error('Main keyword not available for generating titles', toastConfig.error);
      return;
    }
    
    setIsGeneratingTitles(true);
    
    try {
      // Extract content from SERP selections to enhance context for title generation
      const serpSelectedContent = serpSelections
        .filter(item => item.selected)
        .map(item => item.content)
        .join("\n");
      
      // Combine SERP selections with existing content for better context
      const contextContent = serpSelectedContent 
        ? `${content || ''}\n\n${serpSelectedContent}`
        : content || "Your content will be about " + mainKeyword;
      
      // Convert outline to string array for title generation
      const outlineStrings = Array.isArray(outline) 
        ? outline.map(item => typeof item === 'string' ? item : (item as any).title || String(item))
        : [];
      
      // Call the generateTitleSuggestions function from utils with enhanced context
      const suggestions = await generateTitleSuggestions(
        contextContent, 
        mainKeyword, 
        selectedKeywords,
        outlineStrings
      );
      
      // Shuffle the suggestions to ensure different ordering each time
      const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5);
      
      setTitleSuggestions(shuffledSuggestions);
      console.log("[useTitleSuggestions] Generated title suggestions:", shuffledSuggestions);
      
      if (shuffledSuggestions.length > 0) {
        toast.success('Generated title suggestions', toastConfig.success);
        
        // Only set a title automatically if there's no existing title
        if (!metaTitle && !contentTitle && shuffledSuggestions.length > 0) {
          // Use a random title from the first five suggestions
          const randomIndex = Math.floor(Math.random() * Math.min(5, shuffledSuggestions.length));
          const initialTitle = shuffledSuggestions[randomIndex];
          console.log("[useTitleSuggestions] Setting initial title:", initialTitle);
          dispatch({ type: 'SET_META_TITLE', payload: initialTitle });
          dispatch({ type: 'SET_CONTENT_TITLE', payload: initialTitle });
        }
      } else {
        toast.error('No title suggestions could be generated', toastConfig.error);
      }
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      toast.error('Failed to generate title suggestions', toastConfig.error);
    } finally {
      setIsGeneratingTitles(false);
    }
  }, [content, mainKeyword, selectedKeywords, metaTitle, contentTitle, dispatch, serpSelections]);

  // Apply a specific title from suggestions
  const applyTitle = useCallback((title: string) => {
    if (!title) return;
    
    dispatch({ type: 'SET_META_TITLE', payload: title });
    dispatch({ type: 'SET_CONTENT_TITLE', payload: title });
    toast.success('Title applied successfully', toastConfig.success);
    console.log("[useTitleSuggestions] Applied title:", title);
  }, [dispatch]);

  return {
    isGeneratingTitles,
    titleSuggestions,
    generateTitleSuggestions: generateTitleSuggestionsAsync,
    applyTitle,
    currentTitle: contentTitle || metaTitle
  };
};
