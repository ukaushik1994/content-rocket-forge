
import { useState, useCallback } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { analyzeEnhancedSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';
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
      const systemPrompt = 'You are an expert content strategist. Assess how well the following solution is CONTEXTUALLY integrated into the content. Consider narrative flow, audience fit, and depth – not just keyword hits.';
      
      const userPrompt = `Return ONLY valid JSON matching this schema:
{
  "featureIncorporation": number,                 // 0-100
  "positioningScore": number,                     // 0-100
  "painPointsAddressed": string[],                // list of addressed pains
  "ctaEffectiveness": number,                     // 0-100
  "overallScore": number,                         // 0-100
  "mentions": number | string,                    // count or descriptor
  "audienceAlignment": number,                    // 0-100
  "nameMentions": number,
  "ctaMentions": number,
  "mentionedFeatures": string[],
  "competitorMentions": number,
  "technicalSpecsIntegration": number,
  "caseStudyReferences": number,
  "pricingModelAlignment": number,
  "valuePropositionCoverage": number,
  "marketDataIntegration": number,
  "useCasesCovered": string[],
  "differentiatorsMentioned": string[],
  "contextualRelevance": number,                  // 0-100
  "naturalIntegration": number,                   // 0-100
  "narrativeCohesion": number,                    // 0-100
  "coverageDepth": number,                        // 0-100
  "evidence": [{"excerpt": string, "rationale": string, "metric": string}],
  "suggestions": string[],
  "missingElements": string[],
  "references": {"caseStudies": string[], "competitors": string[], "technicalSpecs": string[]},
  "confidence": number                             // 0-100
}

SOLUTION
Name: ${selectedSolution.name}
Features: ${selectedSolution.features.join(', ')}
Pain Points: ${selectedSolution.painPoints.join(', ')}
Target Audience: ${selectedSolution.targetAudience.join(', ')}
Unique Value Props: ${selectedSolution.uniqueValuePropositions?.join(', ') || 'N/A'}
Differentiators: ${selectedSolution.keyDifferentiators?.join(', ') || 'N/A'}

CONTENT (first 5k chars):\n${content.substring(0, 5000)}\n`;

      const aiResponse = await AIServiceController.generate(
        'strategy',
        systemPrompt,
        userPrompt,
        { temperature: 0.3, maxTokens: 1600 }
      );

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

            // Normalize defaults for optional fields and ensure numeric fields
            solutionMetrics.mentionedFeatures = solutionMetrics.mentionedFeatures || [];
            solutionMetrics.painPointsAddressed = solutionMetrics.painPointsAddressed || [];
            solutionMetrics.useCasesCovered = solutionMetrics.useCasesCovered || [];
            solutionMetrics.differentiatorsMentioned = solutionMetrics.differentiatorsMentioned || [];
            solutionMetrics.evidence = (solutionMetrics as any).evidence || [];
            solutionMetrics.suggestions = (solutionMetrics as any).suggestions || [];
            (solutionMetrics as any).missingElements = (solutionMetrics as any).missingElements || [];
            (solutionMetrics as any).references = (solutionMetrics as any).references || { caseStudies: [], competitors: [], technicalSpecs: [] };
            (solutionMetrics as any).contextualRelevance = Number((solutionMetrics as any).contextualRelevance || 0);
            (solutionMetrics as any).naturalIntegration = Number((solutionMetrics as any).naturalIntegration || 0);
            (solutionMetrics as any).narrativeCohesion = Number((solutionMetrics as any).narrativeCohesion || 0);
            (solutionMetrics as any).coverageDepth = Number((solutionMetrics as any).coverageDepth || 0);
            (solutionMetrics as any).confidence = Number((solutionMetrics as any).confidence || 0);

            if (solutionMetrics.overallScore == null || isNaN(Number(solutionMetrics.overallScore))) {
              solutionMetrics.overallScore = Math.round(
                (Number(solutionMetrics.featureIncorporation || 0) +
                 Number(solutionMetrics.positioningScore || 0) +
                 Number((solutionMetrics as any).contextualRelevance || 0)) / 3
              );
            }

            // Validate critical fields
            if (solutionMetrics.featureIncorporation == null || solutionMetrics.positioningScore == null) {
              throw new Error('Incomplete metrics in AI response');
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
      
      // Fallback to enhanced local analyzer
      console.log("[useSolutionAnalysis] Falling back to enhanced local analysis");
      const enhancedMetrics = analyzeEnhancedSolutionIntegration(content, selectedSolution);
      
      // Use the comprehensive enhanced metrics
      const fallbackMetrics: SolutionIntegrationMetrics = {
        ...enhancedMetrics,
        painPointsAddressed: [`${enhancedMetrics.painPointsAddressed}% of pain points addressed`],
        ctaEffectiveness: ctaInfo?.ctaCount ? 75 : 25,  // Simple heuristic based on CTA presence
        mentions: enhancedMetrics.featureIncorporation > 50 ? 'High' : 'Low',
        ctaMentions: ctaInfo?.ctaCount || 0
      };
      
      dispatch({ type: 'SET_SOLUTION_INTEGRATION_METRICS', payload: fallbackMetrics });
      toast.success('Enhanced solution integration analysis completed', toastConfig.success);
    } finally {
      setIsAnalyzing(false);
    }
  }, [content, selectedSolution, dispatch, ctaInfo]);

  return {
    isAnalyzing,
    analyzeSolutionUsage
  };
};
