import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { logOptimizationActivity } from '@/services/contentOptimizationService';
import { toast } from 'sonner';

export const createOptimizationActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  
  const saveOptimizationSelections = async (suggestions: string[], highlights: string[]) => {
    try {
      // Save selections to context state
      dispatch({ 
        type: 'SAVE_OPTIMIZATION_SELECTIONS', 
        payload: { suggestions, highlights } 
      });

      // Log to database for analytics
      await logOptimizationActivity(
        null, // contentId - could be enhanced later
        `optimization-${Date.now()}`, // sessionId
        state.content.length,
        [], // Will be populated when we have suggestion objects
        [], // Applied suggestions
        [], // Rejected suggestions  
        {},
        {
          tone: 'professional',
          audience: 'general', 
          seoFocus: 'moderate',
          contentLength: 'maintain',
          creativity: 0.7,
          preserveStructure: true,
          includeExamples: false,
          enhanceReadability: true,
          customInstructions: ''
        },
        true
      );

      toast.success(`Saved ${suggestions.length} suggestion(s) and ${highlights.length} highlight(s)`);
    } catch (error) {
      console.error('Error saving optimization selections:', error);
      toast.error('Failed to save optimization selections');
    }
  };

  const getOptimizationSelections = () => {
    return state.optimizationSelections;
  };

  const clearOptimizationSelections = () => {
    dispatch({ type: 'CLEAR_OPTIMIZATION_SELECTIONS' });
    toast.info('Optimization selections cleared');
  };

  const applyOptimizationChanges = async (selectedHighlights: string[], content: string): Promise<string> => {
    try {
      // For now, we'll return the original content since we're showing highlights as guidance
      // In the future, this could trigger actual content modifications based on highlights
      
      // Update the main content in the context
      dispatch({ type: 'SET_CONTENT', payload: content });
      
      // Mark the optimization step as completed
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
      
      toast.success('Optimization changes applied successfully!');
      return content;
    } catch (error) {
      console.error('Error applying optimization changes:', error);
      toast.error('Failed to apply optimization changes');
      return content;
    }
  };

  return {
    saveOptimizationSelections,
    getOptimizationSelections,
    clearOptimizationSelections,
    applyOptimizationChanges
  };
};