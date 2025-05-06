
/**
 * SEO related type definitions
 */

export interface SeoImprovement {
  id: string;
  type: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  applied: boolean;
}
