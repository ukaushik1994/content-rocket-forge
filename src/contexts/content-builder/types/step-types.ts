
/**
 * Step-related type definitions
 */

export interface ContentBuilderStep {
  id: number;
  name: string;
  description: string;
  completed: boolean;
  visited: boolean;
  analyzed: boolean;
}
