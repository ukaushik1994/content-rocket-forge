
import { useState } from 'react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { useContentAnalysis } from './useContentAnalysis';
import { useMetaGenerator } from './useMetaGenerator';
import { useSolutionAnalysis } from './useSolutionAnalysis';
import { useStepCompletion } from './useStepCompletion';
import { useTitleSuggestions } from './useTitleSuggestions';

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
  const { state } = useContentBuilder();
  const { metaTitle, metaDescription, selectedSolution } = state;
  
  const [isRunningAllChecks, setIsRunningAllChecks] = useState(false);
  
  const { ctaInfo } = useContentAnalysis();
  const { generateTitleSuggestions, titleSuggestions } = useTitleSuggestions();
  const { generateMeta } = useMetaGenerator(generateTitleSuggestions);
  const { analyzeSolutionUsage } = useSolutionAnalysis(ctaInfo);
  const { checkStepCompletion } = useStepCompletion();
  
  // Run all checks at once
  const runAllChecks = async (refreshChecklist?: () => void) => {
    console.log("[useRunChecks] Running all checks");
    setIsRunningAllChecks(true);
    toast.info("Running comprehensive content checks...");
    
    try {
      // Run meta generation if needed
      if (!metaTitle || !metaDescription) {
        await generateMeta();
        toast.success("Meta information generated", { id: "meta-generated" });
      }
      
      // Run solution integration analysis if needed
      if (!state.solutionIntegrationMetrics && selectedSolution) {
        await analyzeSolutionUsage();
        toast.success("Solution integration analyzed", { id: "solution-analyzed" });
      }
      
      // Generate title suggestions if needed
      if (titleSuggestions.length === 0) {
        await generateTitleSuggestions();
        toast.success("Title suggestions generated", { id: "titles-generated" });
      }
      
      // Refresh the checklist items if the function is provided
      if (refreshChecklist && typeof refreshChecklist === 'function') {
        refreshChecklist();
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
      toast.error("Some checks failed to complete. Please try again.");
    } finally {
      setIsRunningAllChecks(false);
    }
  };

  return {
    isRunningAllChecks,
    runAllChecks
  };
};
