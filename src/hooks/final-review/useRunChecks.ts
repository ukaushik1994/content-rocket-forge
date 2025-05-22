
import { useState } from 'react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContentAnalysis } from './useContentAnalysis';
import { useMetaGenerator } from './useMetaGenerator';
import { useSolutionAnalysis } from './useSolutionAnalysis';
import { useStepCompletion } from './useStepCompletion';
import { useTitleSuggestions } from './useTitleSuggestions';
import { useDocumentAnalysis } from './useDocumentAnalysis';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true },
  info: { duration: 4000, closeButton: true }
};

/**
 * Custom hook for running all review checks
 */
export const useRunChecks = () => {
  const { state, dispatch } = useContentBuilder();
  const { 
    metaTitle, 
    metaDescription, 
    selectedSolution, 
    content,
    serpSelections,
    mainKeyword,
    selectedKeywords
  } = state;
  
  const [isRunningAllChecks, setIsRunningAllChecks] = useState(false);
  
  const { analyzeContent } = useContentAnalysis();
  const { generateTitleSuggestions, titleSuggestions } = useTitleSuggestions();
  const { generateMeta } = useMetaGenerator(generateTitleSuggestions);
  const { analyzeSolutionUsage } = useSolutionAnalysis({});
  const { checkStepCompletion } = useStepCompletion();
  const { analyzeDocumentStructure } = useDocumentAnalysis();
  
  // Run all checks at once
  const runAllChecks = async () => {
    console.log("[useRunChecks] Running all checks");
    setIsRunningAllChecks(true);
    toast.info("Running comprehensive content checks...", toastConfig.info);
    
    try {
      // Run document structure analysis
      await analyzeDocumentStructure(content);

      // Analyze keyword usage
      await analyzeContent(content, mainKeyword, selectedKeywords);
      
      // Run meta generation if needed
      if (!metaTitle || !metaDescription) {
        await generateMeta();
        toast.success("Meta information generated", { id: "meta-generated" });
      }
      
      // Run solution integration analysis if needed
      if (selectedSolution && (!state.solutionIntegrationMetrics || 
          state.solutionIntegrationMetrics.featureIncorporation === 0)) {
        await analyzeSolutionUsage();
        toast.success("Solution integration analyzed", { id: "solution-analyzed" });
      }
      
      // Generate title suggestions if needed
      if (titleSuggestions.length === 0) {
        await generateTitleSuggestions();
        toast.success("Title suggestions generated", { id: "titles-generated" });
      }
      
      // Check if all checks pass
      const allPassed = checkStepCompletion();
      
      if (allPassed) {
        toast.success("All checks completed successfully!", {
          id: "all-checks-passed",
          duration: 5000,
        });
      } else {
        toast.info("Checks completed. Some items need attention.", {
          id: "checks-with-issues",
        });
      }
    } catch (error) {
      console.error("[useRunChecks] Error running checks:", error);
      toast.error("Some checks failed to complete. Please try again.", toastConfig.error);
    } finally {
      setIsRunningAllChecks(false);
    }
  };

  return {
    isRunningAllChecks,
    runAllChecks
  };
};
