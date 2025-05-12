
/**
 * SEO related type definitions
 */

export interface SeoImprovement {
  id: string;
  title: string;
  description: string;
  priority: string;
  applied: boolean;
  suggestion: string;
  type: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
}
