
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const useContentBuilderValidation = () => {
  const { state } = useContentBuilder();
  
  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Strategy Studio
        return !!(state.contentStrategy);
      case 1: // Keyword Selection
        return !!(state.mainKeyword && state.selectedKeywords.length > 0);
      case 2: // Content Type Selection
        return !!(state.contentType && state.contentFormat && state.contentIntent);
      case 3: // SERP Analysis
        return !!(state.serpData && state.serpSelections.some(item => item.selected));
      case 4: // Outline
        return !!(state.outline && state.outline.length > 0);
      case 5: // Content Generation
        return !!(state.content && state.content.trim().length > 0);
      case 6: // Final Review
        return !!(state.content && state.steps[5]?.completed);
      default:
        return false;
    }
  };
  
  const canProceedToStep = (stepIndex: number): boolean => {
    // Can always go to the strategy studio (step 0) or keyword selection (step 1)
    if (stepIndex === 0 || stepIndex === 1) return true;
    
    // For content creation steps (2+), both strategy and keywords must be completed
    if (stepIndex >= 2) {
      return validateStep(0) && validateStep(1);
    }
    
    return true;
  };
  
  const getStepProgress = (): number => {
    let completedSteps = 0;
    for (let i = 0; i < 6; i++) {
      if (validateStep(i)) completedSteps++;
    }
    return Math.round((completedSteps / 6) * 100);
  };
  
  return {
    validateStep,
    canProceedToStep,
    getStepProgress
  };
};
