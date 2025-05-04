
import { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { extractDocumentStructure } from '@/utils/seo/document/extractDocumentStructure';
import { toast } from 'sonner';

import { useContentAnalysis } from './final-review/useContentAnalysis';
import { useMetaGenerator } from './final-review/useMetaGenerator';
import { useSolutionAnalysis } from './final-review/useSolutionAnalysis';
import { useStepCompletion } from './final-review/useStepCompletion';
import { useTitleSuggestions } from './final-review/useTitleSuggestions';
import { useConfetti } from './final-review/useConfetti';

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
  const { triggerConfetti } = useConfetti();
  
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
    if (checkStepCompletion()) {
      toast.success("Content fully optimized! You can proceed to the next step.", {
        id: "content-optimized",
      });
    }
  }, [metaTitle, state.metaDescription, state.documentStructure, checkStepCompletion]);
  
  // Run all checks at once
  const runAllChecks = async () => {
    console.log("[useFinalReview] Running all checks");
    setIsRunningAllChecks(true);
    toast.info("Running comprehensive content checks...");
    
    try {
      // Run meta generation if needed
      if (!metaTitle || !state.metaDescription) {
        await generateMeta();
        toast.success("Meta information generated", { id: "meta-generated" });
      }
      
      // Run solution integration analysis if needed
      if (!state.solutionIntegrationMetrics && state.selectedSolution) {
        await analyzeSolutionUsage();
        toast.success("Solution integration analyzed", { id: "solution-analyzed" });
      }
      
      // Generate title suggestions if needed
      if (titleSuggestions.length === 0) {
        await generateTitleSuggestions();
        toast.success("Title suggestions generated", { id: "titles-generated" });
      }
      
      // Check if all checks pass to trigger confetti
      const allPassed = checkStepCompletion();
      
      if (allPassed) {
        toast.success("All checks completed successfully!", {
          id: "all-checks-passed",
          duration: 5000,
        });
        
        // Show confetti for a delightful experience
        setTimeout(() => triggerConfetti(), 500);
      } else {
        toast.info("Checks completed. Some items need attention.", {
          id: "checks-with-issues",
        });
      }
    } catch (error) {
      console.error("[useFinalReview] Error running checks:", error);
      toast.error("Some checks failed to complete. Please try again.");
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
