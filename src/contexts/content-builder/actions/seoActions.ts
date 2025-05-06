
import { ContentBuilderState, ContentBuilderAction } from '../types/index';
import { analyzeSeo } from '@/utils/seo/seoAnalyzer';

export const createSeoActions = (
  state: ContentBuilderState, 
  dispatch: React.Dispatch<ContentBuilderAction>
) => {
  const analyzeSeoContent = async (content: string) => {
    try {
      console.log('Analyzing SEO for content...');
      
      // Start analysis loading state
      dispatch({ type: 'SET_ANALYZING', payload: true });
      
      // Analyze content
      const result = analyzeSeo(content, state.mainKeyword, state.selectedKeywords);
      
      console.log('SEO analysis complete:', result);
      
      // Update state with analysis results
      dispatch({ type: 'SET_SEO_SCORE', payload: result.seoScore });
      
      // Store seo improvements
      dispatch({ type: 'SET_SEO_IMPROVEMENTS', payload: result.improvements });
      
      // Store detailed SEO scores
      dispatch({ 
        type: 'SET_SEO_ANALYSIS_RESULTS', 
        payload: {
          keywordScore: result.keywordScore,
          readabilityScore: result.readabilityScore,
          contentLengthScore: result.contentLengthScore,
          structureScore: result.structureScore
        }
      });
      
      // Set initial optimization metrics
      dispatch({
        type: 'SET_SEO_OPTIMIZATION_METRICS',
        payload: {
          originalScore: result.seoScore,
          currentScore: result.seoScore,
          appliedImprovements: 0,
          totalImprovements: result.improvements.length,
          lastUpdated: new Date()
        }
      });
      
      // Mark step as analyzed regardless of score
      dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
      
      // Mark as completed only if score is high enough or we have no improvements to make
      if (result.seoScore >= 80 || result.improvements.length === 0) {
        dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      // Handle error state
      return null;
    } finally {
      // End loading state
      dispatch({ type: 'SET_ANALYZING', payload: false });
    }
  };
  
  const applySeoImprovement = (id: string) => {
    // Mark the improvement as applied
    dispatch({ type: 'APPLY_SEO_IMPROVEMENT', payload: id });
    
    // Update optimization metrics
    const totalImprovements = state.seoImprovements.length;
    const appliedImprovements = state.seoImprovements.filter(imp => imp.applied || imp.id === id).length;
    
    // Increase SEO score based on applied improvements
    let scoreDelta = 0;
    const improvement = state.seoImprovements.find(imp => imp.id === id);
    
    if (improvement) {
      // Increase score based on impact
      switch (improvement.impact) {
        case 'high':
          scoreDelta = 5;
          break;
        case 'medium':
          scoreDelta = 3;
          break;
        case 'low':
          scoreDelta = 1;
          break;
        default:
          scoreDelta = 2;
      }
      
      // Apply score increase (max 100)
      const newScore = Math.min(100, state.seoScore + scoreDelta);
      
      // Update SEO score
      dispatch({ type: 'SET_SEO_SCORE', payload: newScore });
      
      // Update optimization metrics
      if (state.seoOptimizationMetrics) {
        dispatch({
          type: 'SET_SEO_OPTIMIZATION_METRICS',
          payload: {
            ...state.seoOptimizationMetrics,
            currentScore: newScore,
            appliedImprovements,
            lastUpdated: new Date()
          }
        });
      }
    }
    
    // Mark step as completed if enough improvements are applied
    const completionThreshold = Math.max(3, Math.ceil(totalImprovements * 0.6));
    
    if (appliedImprovements >= completionThreshold || state.seoScore >= 80) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    }
  };
  
  const skipOptimizationStep = () => {
    // Mark the step as skipped
    dispatch({ type: 'SKIP_OPTIMIZATION_STEP' });
    
    // Also mark the step as analyzed and completed so we can move forward
    dispatch({ type: 'MARK_STEP_ANALYZED', payload: 5 });
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: 5 });
    
    console.log('Optimization step skipped and marked as completed');
  };
  
  return {
    analyzeSeo: analyzeSeoContent,
    applySeoImprovement,
    skipOptimizationStep
  };
};
