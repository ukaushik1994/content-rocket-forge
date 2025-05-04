
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { extractDocumentStructure } from '@/utils/seo/documentAnalysis';
import { toast } from 'sonner';

import { useContentAnalysis } from './final-review/useContentAnalysis';
import { useMetaGenerator } from './final-review/useMetaGenerator';
import { useSolutionAnalysis } from './final-review/useSolutionAnalysis';
import { useStepCompletion } from './final-review/useStepCompletion';
import { useTitleSuggestions } from './final-review/useTitleSuggestions';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

export const useFinalReview = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    content, 
    metaTitle,
    contentTitle,
    serpData
  } = state;
  
  const [isRunningAllChecks, setIsRunningAllChecks] = useState(false);
  
  // Use refactored hooks
  const { keywordUsage, ctaInfo } = useContentAnalysis();
  const { titleSuggestions, isGeneratingTitles, generateTitleSuggestions } = useTitleSuggestions();
  const { generateMeta } = useMetaGenerator(generateTitleSuggestions);
  const { isAnalyzing, analyzeSolutionUsage } = useSolutionAnalysis(ctaInfo);
  const { checkStepCompletion } = useStepCompletion();
  
  // Debug logs for tracking state
  useEffect(() => {
    console.log("[useFinalReview] Meta title state:", metaTitle);
    console.log("[useFinalReview] Content title state:", contentTitle);
  }, [metaTitle, contentTitle]);
  
  // Run document structure analysis when the content changes
  useEffect(() => {
    if (content) {
      // Extract document structure
      const structure = extractDocumentStructure(content);
      
      // DocumentStructure object already has the correct structure from documentAnalysis.ts now
      dispatch({ type: 'SET_DOCUMENT_STRUCTURE', payload: structure });
    }
  }, [content, dispatch]);
  
  // Check if step can be completed
  useEffect(() => {
    checkStepCompletion();
  }, [metaTitle, state.metaDescription, state.documentStructure]);
  
  // Run all checks at once
  const runAllChecks = async () => {
    console.log("[useFinalReview] Running all checks");
    setIsRunningAllChecks(true);
    
    try {
      if (!metaTitle || !state.metaDescription) {
        await generateMeta();
      }
      
      if (!state.solutionIntegrationMetrics && state.selectedSolution) {
        await analyzeSolutionUsage();
      }
      
      if (titleSuggestions.length === 0) {
        await generateTitleSuggestions();
      }
      
      toast.success("All checks completed");
    } catch (error) {
      console.error("[useFinalReview] Error running checks:", error);
      toast.error("Some checks failed to complete");
    } finally {
      setIsRunningAllChecks(false);
    }
  };
  
  return {
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    ctaInfo,
    titleSuggestions,
    serpData,
    generateMeta,
    generateTitleSuggestions,
    analyzeSolutionUsage,
    checkStepCompletion,
    runAllChecks
  };
};
