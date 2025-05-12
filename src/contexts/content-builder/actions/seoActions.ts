
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { createSeoImprovements } from '@/utils/seo/improvement/createSeoImprovement';

export const createSeoActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeSeo = async (content: string) => {
    // In a real implementation, this would analyze the content
    console.log('Analyzing SEO for content:', content.substring(0, 100) + '...');
    
    // Simulate SEO analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set a dummy SEO score for now
    dispatch({ type: 'SET_SEO_SCORE', payload: 75 });
    
    // Create mock SEO improvements using the proper factory
    const improvements = createSeoImprovements([
      {
        id: '1',
        title: 'Add more internal links',
        description: 'Your content could benefit from additional internal links to other relevant pages.',
        priority: 'medium',
        applied: false,
        suggestion: 'Add 2-3 internal links to related articles.',
        type: 'links',
        recommendation: 'Add more internal links',
        impact: 'medium' as const
      },
      {
        id: '2',
        title: 'Improve keyword density',
        description: `The main keyword "${state.mainKeyword}" appears too infrequently.`,
        priority: 'high',
        applied: false,
        suggestion: `Try to mention "${state.mainKeyword}" a few more times naturally throughout the content.`,
        type: 'keywords',
        recommendation: 'Improve keyword density',
        impact: 'high' as const
      },
      {
        id: '3',
        title: 'Add more headings',
        description: 'Break up your content with additional subheadings for better readability.',
        priority: 'low',
        applied: false,
        suggestion: 'Add H3 subheadings to break up longer sections.',
        type: 'structure',
        recommendation: 'Add more headings',
        impact: 'low' as const
      }
    ]);
    
    dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: improvements });
    
    // Mark step as analyzed regardless of score
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    
    // Also mark step as completed if we've analyzed it
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
  };
  
  const applySeoImprovement = (id: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
    
    // Check if enough improvements have been applied to complete the step
    const totalImprovements = state.seoImprovements.length;
    const appliedImprovements = state.seoImprovements.filter(imp => imp.applied || imp.id === id).length;
    
    // Mark step as completed if more than 60% of improvements are applied or at least 3
    if (appliedImprovements >= Math.max(3, Math.ceil(totalImprovements * 0.6))) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  };
  
  const skipOptimizationStep = () => {
    // Mark the step as skipped
    dispatch({ type: 'SKIP_OPTIMIZATION_STEP' });
    
    // Also mark the step as analyzed and completed so we can move forward
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    // Force completion to ensure we can move forward
    console.log('Optimization step skipped and marked as completed');
  };
  
  return {
    analyzeSeo,
    applySeoImprovement,
    skipOptimizationStep
  };
};
