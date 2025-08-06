
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
import { toast } from 'sonner';
import AIServiceController from '@/services/aiService/AIServiceController';
import { SolutionIntegrationMetrics } from '@/contexts/content-builder/types';

// Standard toast configuration
const toastConfig = {
  success: { duration: 3000, closeButton: true },
  error: { duration: 5000, closeButton: true }
};

/**
 * Custom hook for analyzing solution usage in content
 */
export const useSolutionAnalysis = (ctaInfo: any) => {
  const { state, dispatch } = useContentBuilder();
  const { content, selectedSolution } = state;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Main function to analyze solution usage
  const analyzeSolutionUsage = useCallback(async () => {
    if (!content || !selectedSolution) {
      toast.error('No content or solution available for analysis', toastConfig.error);
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // First try to use AI service for advanced analysis
      const aiResponse = await AIServiceController.generate({
        input: `
              Solution Name: ${selectedSolution.name}
              Solution Features: ${selectedSolution.features.join(', ')}
              Pain Points: ${selectedSolution.painPoints.join(', ')}
              Target Audience: ${selectedSolution.targetAudience.join(', ')}
              
              Content: ${content.substring(0, 5000)}
              
              Analyze how well this solution is integrated within the content and provide the following metrics:
              1. Feature Incorporation (0-100): What percentage of solution features are incorporated in the content?
              2. Positioning Score (0-100): How well is the solution positioned in the content?
              3. Pain Points Addressed: Which pain points are addressed in the content?
              4. CTA Effectiveness (0-100): How effective are the calls to action for this solution?
              5. Overall Score (0-100): Overall effectiveness of solution integration
              6. Number of Solution Name Mentions
              7. Number of CTA Mentions
              8. Audience Alignment (0-100): How well does the content align with the target audience?
              9. Mentioned Features: List of solution features that are mentioned in the content
              
              Return your analysis as a JSON object with these metrics.`,
        use_case: 'strategy',
        temperature: 0.7,
        max_tokens: 1500
      });

      console.log("[useSolutionAnalysis] AI response:", aiResponse);
      
      let solutionMetrics: SolutionIntegrationMetrics;
      
      // Try to parse AI response if available
      if (aiResponse?.content) {
        try {
          const aiContent = aiResponse.content;
          
          // Try to extract JSON if it's wrapped in backticks or other text
          const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                            aiContent.match(/{[\s\S]*}/);
          
          if (jsonMatch) {
            const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
            solutionMetrics = JSON.parse(jsonStr);
            
            // Ensure we have all required properties
            if (!solutionMetrics.featureIncorporation || !solutionMetrics.positioningScore) {
              throw new Error('Incomplete metrics in AI response');
            }
            
            // Add empty array for mentionedFeatures if not provided
            if (!solutionMetrics.mentionedFeatures) {
              solutionMetrics.mentionedFeatures = [];
            }
          } else {
            throw new Error('Could not extract valid JSON from AI response');
          }
        } catch (parseError) {
          console.error("[useSolutionAnalysis] Error parsing AI response:", parseError);
          // Fall back to local analysis
          throw new Error('Could not parse AI response');
        }
      } else {
        // Fall back to local analysis if no AI response
        throw new Error('No AI response received');
      }
      
      // Update the state with the metrics
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: solutionMetrics });
      
      toast.success('Solution integration analysis completed using AI', toastConfig.success);
    } catch (error) {
      console.error("[useSolutionAnalysis] Error:", error);
      
      // Fallback to local analyzer
      console.log("[useSolutionAnalysis] Falling back to local analysis");
      const localMetrics = analyzeSolutionIntegration(content, selectedSolution);
      
      // Convert to the expected metrics format
      const fallbackMetrics: SolutionIntegrationMetrics = {
        featureIncorporation: localMetrics.featureIncorporation,
        positioningScore: localMetrics.positioningScore,
        painPointsAddressed: [`${localMetrics.painPointsAddressed}% of pain points addressed`],
        ctaEffectiveness: ctaInfo?.ctaCount ? 75 : 25,  // Simple heuristic based on CTA presence
        overallScore: Math.round((localMetrics.featureIncorporation + localMetrics.positioningScore + localMetrics.painPointsAddressed + localMetrics.audienceAlignment) / 4),
        mentions: localMetrics.featureIncorporation > 50 ? 'High' : 'Low',
        audienceAlignment: localMetrics.audienceAlignment,
        nameMentions: localMetrics.nameMentions,
        ctaMentions: ctaInfo?.ctaCount || 0,
        mentionedFeatures: localMetrics.mentionedFeatures || []
      };
      
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: fallbackMetrics });
      toast.success('Solution integration analysis completed using local analysis', toastConfig.success);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, selectedSolution, dispatch, ctaInfo]);

  return {
    isAnalyzing,
    analyzeSolutionUsage
  };
};
