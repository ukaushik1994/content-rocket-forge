
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

/**
 * Creates a properly typed SEO improvement object
 */
export const createSeoImprovement = (
  props: Partial<SeoImprovement> & { id: string }
): SeoImprovement => {
  return {
    id: props.id,
    title: props.title || 'SEO Improvement',
    description: props.description || 'A suggestion to improve your SEO score',
    priority: props.priority || 'medium',
    applied: props.applied || false,
    suggestion: props.suggestion || 'Apply this improvement to enhance SEO',
    type: props.type || 'general',
    recommendation: props.recommendation || 'General recommendation',
    impact: props.impact || 'medium',
  };
};

/**
 * Create multiple properly typed SEO improvements
 */
export const createSeoImprovements = (improvements: Array<Partial<SeoImprovement> & { id: string }>): SeoImprovement[] => {
  return improvements.map(improvement => createSeoImprovement(improvement));
};
