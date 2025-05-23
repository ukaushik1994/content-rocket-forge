
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { useContentBuilderValidation } from './useContentBuilderValidation';
import { toast } from 'sonner';

export const useContentBuilderNavigation = () => {
  const { state, dispatch } = useContentBuilder();
  const { canProceedToStep } = useContentBuilderValidation();
  
  const goToStep = (stepIndex: number) => {
    if (!canProceedToStep(stepIndex)) {
      toast.error('Please complete the previous steps before proceeding');
      return false;
    }
    
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepIndex });
    return true;
  };
  
  const nextStep = () => {
    const nextStepIndex = state.currentStep + 1;
    if (nextStepIndex < 6) {
      return goToStep(nextStepIndex);
    }
    return false;
  };
  
  const previousStep = () => {
    const prevStepIndex = state.currentStep - 1;
    if (prevStepIndex >= 0) {
      return goToStep(prevStepIndex);
    }
    return false;
  };
  
  return {
    goToStep,
    nextStep,
    previousStep,
    currentStep: state.currentStep
  };
};
