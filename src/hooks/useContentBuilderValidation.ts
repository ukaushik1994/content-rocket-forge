/**
 * Hook for Content Builder step validation and error handling
 */

import { useEffect, useState } from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { validateStep, canNavigateToStep, getAllValidationIssues, StepValidationResult } from '@/contexts/content-builder/utils/validation';
import { toast } from 'sonner';

export const useContentBuilderValidation = () => {
  const { state } = useContentBuilder();
  const [validationIssues, setValidationIssues] = useState<{ [stepId: number]: StepValidationResult }>({});

  // Update validation issues when state changes
  useEffect(() => {
    const issues = getAllValidationIssues(state);
    setValidationIssues(issues);
  }, [state]);

  // Show validation warnings for current step
  useEffect(() => {
    const currentStepValidation = validationIssues[state.activeStep];
    if (currentStepValidation?.warnings.length > 0) {
      currentStepValidation.warnings.forEach(warning => {
        toast.warning(warning, {
          id: `validation-warning-${state.activeStep}-${warning}`,
          duration: 5000
        });
      });
    }
  }, [validationIssues, state.activeStep]);

  /**
   * Validates the current step
   */
  const validateCurrentStep = (): StepValidationResult => {
    return validateStep(state.activeStep, state);
  };

  /**
   * Checks if navigation to a specific step is allowed
   */
  const canNavigateTo = (stepId: number): boolean => {
    return canNavigateToStep(stepId, state);
  };

  /**
   * Gets validation status for all steps
   */
  const getStepValidationStatus = () => {
    return state.steps.map(step => ({
      stepId: step.id,
      isValid: validationIssues[step.id]?.isValid ?? true,
      errors: validationIssues[step.id]?.errors ?? [],
      warnings: validationIssues[step.id]?.warnings ?? [],
      canNavigate: canNavigateToStep(step.id, state)
    }));
  };

  /**
   * Shows validation errors for a specific step
   */
  const showValidationErrors = (stepId: number) => {
    const validation = validationIssues[stepId];
    if (validation?.errors.length > 0) {
      validation.errors.forEach(error => {
        toast.error(error, {
          id: `validation-error-${stepId}-${error}`,
          duration: 7000
        });
      });
    }
  };

  /**
   * Checks if the content builder state is in a valid state overall
   */
  const isOverallValid = (): boolean => {
    return Object.values(validationIssues).every(validation => validation.isValid);
  };

  /**
   * Gets the next incomplete step
   */
  const getNextIncompleteStep = (): number | null => {
    for (let i = 0; i < state.steps.length; i++) {
      const step = state.steps[i];
      if (!step.completed && !validationIssues[step.id]?.isValid) {
        return step.id;
      }
    }
    return null;
  };

  return {
    validationIssues,
    validateCurrentStep,
    canNavigateTo,
    getStepValidationStatus,
    showValidationErrors,
    isOverallValid,
    getNextIncompleteStep
  };
};