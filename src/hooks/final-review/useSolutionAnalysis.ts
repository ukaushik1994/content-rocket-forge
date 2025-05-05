
import { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { SolutionIntegrationMetrics } from '@/contexts/content-builder/types';
import { toast } from 'sonner';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true }
};

/**
 * Custom hook for analyzing solution integration in content
 */
export const useSolutionAnalysis = (ctaInfo: { hasCTA: boolean; ctaText: string[] }) => {
  const { state, dispatch } = useContentBuilder();
  const { content, selectedSolution } = state;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Analyze solution integration
  const analyzeSolutionUsage = () => {
    if (!content || !selectedSolution) {
      toast.error('Content or solution not available for analysis', toastConfig.error);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const metrics = analyzeSolutionIntegration(content, selectedSolution);
      
      // Ensure painPointsAddressed is always an array of strings
      const painPointsArray = Array.isArray(metrics.painPointsAddressed) 
        ? metrics.painPointsAddressed 
        : metrics.painPointsAddressed ? [`Pain point ${metrics.painPointsAddressed}`] : [];
      
      console.log("[useSolutionAnalysis] Raw metrics from analysis:", metrics);
      console.log("[useSolutionAnalysis] Converted painPointsAddressed:", painPointsArray);
      
      const solutionMetrics: SolutionIntegrationMetrics = {
        mentions: metrics.nameMentions || 0,
        contextualReferences: metrics.positioningScore || 0,
        naturalness: metrics.audienceAlignment || 0,
        featureIncorporation: metrics.featureIncorporation || 0,
        positioningScore: metrics.positioningScore || 0,
        overallScore: Math.round((metrics.featureIncorporation + metrics.positioningScore) / 2),
        nameMentions: metrics.nameMentions || 0,
        audienceAlignment: metrics.audienceAlignment || 0,
        painPointsAddressed: painPointsArray,
        ctaMentions: ctaInfo.ctaText.length,
        ctaEffectiveness: ctaInfo.hasCTA ? 100 : 0
      };
      
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: solutionMetrics });
      toast.success('Solution integration analysis completed', toastConfig.success);
    } catch (error) {
      console.error('Error analyzing solution integration:', error);
      toast.error('Failed to analyze solution integration', toastConfig.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analyzeSolutionUsage
  };
};
