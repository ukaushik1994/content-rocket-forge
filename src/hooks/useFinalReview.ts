
import { useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';

// Import refactored hooks
import { useContentAnalysis } from './final-review/useContentAnalysis';
import { useMetaGenerator } from './final-review/useMetaGenerator';
import { useSolutionAnalysis } from './final-review/useSolutionAnalysis';
import { useStepCompletion } from './final-review/useStepCompletion';
import { useTitleSuggestions } from './final-review/useTitleSuggestions';
import { useDocumentAnalysis } from './final-review/useDocumentAnalysis';
import { useRunChecks } from './final-review/useRunChecks';
import { useDebugLogging } from './final-review/useDebugLogging';

export const useFinalReview = () => {
  const { state } = useContentBuilder();
  const { 
    content, 
    metaTitle,
    contentTitle,
    serpData
  } = state;
  
  // Use refactored hooks
  const { keywordUsage, rawKeywordData, ctaInfo } = useContentAnalysis();
  const { titleSuggestions, isGeneratingTitles, generateTitleSuggestions } = useTitleSuggestions();
  const { generateMeta } = useMetaGenerator(generateTitleSuggestions);
  const { isAnalyzing, analyzeSolutionUsage } = useSolutionAnalysis(ctaInfo);
  const { checkStepCompletion } = useStepCompletion();
  const { documentStructure } = useDocumentAnalysis();
  const { isRunningAllChecks, runAllChecks } = useRunChecks();
  
  // Debug logging
  useDebugLogging(metaTitle, contentTitle);
  
  // Check if step can be completed
  useEffect(() => {
    if (checkStepCompletion()) {
      toast.success("Content fully optimized! You can proceed to the next step.", {
        id: "content-optimized",
      });
    }
  }, [metaTitle, state.metaDescription, state.documentStructure, checkStepCompletion]);
  
  return {
    isAnalyzing,
    isGeneratingTitles,
    isRunningAllChecks,
    keywordUsage,
    rawKeywordData,
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
