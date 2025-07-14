/**
 * Step validation utilities for Content Builder
 */

import { ContentBuilderState } from '../types/state-types';

export interface StepValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates if a step can be completed based on its requirements
 */
export const validateStep = (stepId: number, state: ContentBuilderState): StepValidationResult => {
  const result: StepValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  switch (stepId) {
    case 0: // Keyword Selection
      if (!state.mainKeyword.trim()) {
        result.isValid = false;
        result.errors.push('Main keyword is required');
      }
      if (state.selectedKeywords.length === 0) {
        result.warnings.push('Consider adding additional keywords for better content coverage');
      }
      break;

    case 1: // Content Type & Outline
      if (!state.contentType) {
        result.isValid = false;
        result.errors.push('Content type must be selected');
      }
      if (!state.contentFormat) {
        result.isValid = false;
        result.errors.push('Content format must be selected');
      }
      if (!state.contentIntent) {
        result.isValid = false;
        result.errors.push('Content intent must be selected');
      }
      if (!state.contentTitle.trim()) {
        result.isValid = false;
        result.errors.push('Content title is required');
      }
      if (state.outlineSections.length === 0) {
        result.warnings.push('Consider creating an outline for better content structure');
      }
      break;

    case 2: // SERP Analysis (optional)
      // This step is optional, so no validation errors
      if (state.serpSelections.length === 0) {
        result.warnings.push('SERP analysis can help improve content quality');
      }
      break;

    case 3: // Content Writing
      if (!state.content.trim()) {
        result.isValid = false;
        result.errors.push('Content cannot be empty');
      }
      if (state.content.trim().length < 300) {
        result.warnings.push('Content might be too short for SEO effectiveness');
      }
      break;

    case 4: // Optimize & Review
      if (!state.content.trim()) {
        result.isValid = false;
        result.errors.push('Content is required for optimization');
      }
      if (!state.metaTitle) {
        result.warnings.push('Meta title should be set for better SEO');
      }
      if (!state.metaDescription) {
        result.warnings.push('Meta description should be set for better SEO');
      }
      break;
  }

  return result;
};

/**
 * Validates if navigation to a specific step is allowed
 */
export const canNavigateToStep = (targetStepId: number, state: ContentBuilderState): boolean => {
  // Can always navigate backward
  if (targetStepId <= state.activeStep) {
    return true;
  }

  // Check if all previous required steps are completed
  for (let i = 0; i < targetStepId; i++) {
    const step = state.steps[i];
    if (!step) continue;

    // Skip SERP Analysis (step 2) as it's optional
    if (step.id === 2) continue;

    const validation = validateStep(step.id, state);
    if (!validation.isValid) {
      return false;
    }

    // Also check if step is marked as completed
    if (!step.completed) {
      return false;
    }
  }

  return true;
};

/**
 * Gets all validation issues for the current state
 */
export const getAllValidationIssues = (state: ContentBuilderState): {
  [stepId: number]: StepValidationResult;
} => {
  const issues: { [stepId: number]: StepValidationResult } = {};

  state.steps.forEach(step => {
    issues[step.id] = validateStep(step.id, state);
  });

  return issues;
};