
import { ContentBuilderState, ContentBuilderAction, SeoImprovement } from '../types';

export const createOptimizationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeSeo = async (content: string): Promise<void> => {
    dispatch({ type: 'SET_IS_ANALYZING', payload: true });
    
    try {
      // In a real implementation, this would call an AI service to analyze the content
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Example SEO improvements
      const seoScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      const improvements: SeoImprovement[] = [
        {
          id: '1',
          title: 'Add more keyword variations',
          description: 'Include more variations of your main keyword throughout the content',
          priority: 'high',
          applied: false
        },
        {
          id: '2',
          title: 'Improve readability',
          description: 'Break up long paragraphs to improve readability',
          priority: 'medium',
          applied: false
        }
      ];
      
      dispatch({ type: 'SET_SEO_SCORE', payload: seoScore });
      dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: improvements });
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    } catch (error) {
      console.error('Error analyzing SEO:', error);
    } finally {
      dispatch({ type: 'SET_IS_ANALYZING', payload: false });
    }
  };
  
  const applySeoImprovement = (id: string) => {
    if (!state.seoImprovements) return;
    
    const updatedImprovements = state.seoImprovements.map(improvement => 
      improvement.id === id 
        ? { ...improvement, applied: true } 
        : improvement
    );
    
    dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: updatedImprovements });
  };
  
  const skipOptimizationStep = () => {
    dispatch({ type: 'SET_OPTIMIZATION_SKIPPED', payload: true });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
  };
  
  return {
    analyzeSeo,
    applySeoImprovement,
    skipOptimizationStep
  };
};
