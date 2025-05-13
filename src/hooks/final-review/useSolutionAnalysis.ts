
import { useCallback, useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { SolutionIntegrationMetrics } from '@/contexts/content-builder/types';

export const useSolutionAnalysis = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, selectedSolution } = state;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const analyzeSolutionUsage = useCallback(() => {
    setIsAnalyzing(true);
    
    try {
      if (!content || !selectedSolution) {
        const emptyMetrics: SolutionIntegrationMetrics = {
          matchScore: 0,
          keywordUsage: 0,
          contentRelevance: 0,
          potentialImpact: 0,
          recommendations: [],
          overallScore: 0,
          featureIncorporation: 0,
          positioningScore: 0,
          mentionedFeatures: [],
          keywordMatches: 0,
          nameMentions: 0,
          painPointsAddressed: 0,
          audienceAlignment: 0
        };
        
        dispatch({
          type: 'SET_SOLUTION_INTEGRATION_METRICS',
          payload: emptyMetrics
        });
        return;
      }
      
      // Ensure the selectedSolution has the required properties for the analysis
      const solutionData = {
        name: selectedSolution.name || '',
        features: selectedSolution.features || [],
        painPoints: selectedSolution.painPoints || [],
        targetAudience: selectedSolution.targetAudience || []
      };
      
      // Run the solution integration analysis
      const metrics = analyzeSolutionIntegration(content, solutionData);
      
      // Update state with the results
      dispatch({
        type: 'SET_SOLUTION_INTEGRATION_METRICS',
        payload: metrics
      });
    } catch (error) {
      console.error('Error analyzing solution usage:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, selectedSolution, dispatch]);
  
  return {
    isAnalyzing,
    analyzeSolutionUsage
  };
};
