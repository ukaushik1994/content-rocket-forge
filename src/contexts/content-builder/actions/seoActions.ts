
import { ContentBuilderState, ContentBuilderAction } from '../types';

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
  };
  
  const applySeoImprovement = (id: string) => {
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
  };
  
  const skipOptimizationStep = () => {
    dispatch({ type: 'SKIP_OPTIMIZATION_STEP' });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
  };
  
  return {
    analyzeSeo,
    applySeoImprovement,
    skipOptimizationStep
  };
};
