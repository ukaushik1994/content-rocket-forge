
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

export const useContentBuilderValidation = () => {
  const { state } = useContentBuilder();
  
  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Keyword Selection
        return !!(state.mainKeyword && state.selectedKeywords.length > 0);
      case 1: // Topic Selection
        return !!(state.selectedTopic || state.customTopic);
      case 2: // SERP Analysis
        return !!(state.serpData && state.serpSelections.some(item => item.selected));
      case 3: // Outline
        return !!(state.outline && state.outline.length > 0);
      case 4: // Content Generation
        return !!(state.generatedContent && state.generatedContent.trim().length > 0);
      case 5: // Final Review
        return !!(state.generatedContent && state.isContentApproved);
      default:
        return false;
    }
  };
  
  const canProceedToStep = (stepIndex: number): boolean => {
    // Can always go to the first step
    if (stepIndex === 0) return true;
    
    // For other steps, check if all previous steps are valid
    for (let i = 0; i < stepIndex; i++) {
      if (!validateStep(i)) return false;
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
