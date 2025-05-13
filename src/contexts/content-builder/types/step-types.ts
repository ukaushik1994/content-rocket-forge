
/**
 * Step-related type definitions
 */

// Step Types for the content builder workflow
export interface Step {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
  analyzed?: boolean;
}

// Sub-step Types (optional for more complex workflows)
export interface SubStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  parentStepId: number;
}
