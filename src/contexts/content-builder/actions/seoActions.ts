
import { ContentBuilderState, ContentBuilderAction } from '../types/index';

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
