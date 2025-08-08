
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';
import { analyzeEnhancedSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

export function useSolutionAnalysis() {
  const { state } = useContentBuilder();
  const [solutionSuggestions, setSolutionSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [analyzedSolutionIntegration, setAnalyzedSolutionIntegration] = useState<any>(null);

  const analyzeSolution = useCallback(async (content: string) => {
    if (!state.selectedSolution) {
      setSolutionSuggestions([]);
      return [];
    }

    const solutionMetrics = analyzeEnhancedSolutionIntegration(content, state.selectedSolution);
    setAnalyzedSolutionIntegration(solutionMetrics);
    
    const systemPrompt = 'You are an expert in product integration for content marketing. Evaluate contextual fit, narrative flow, and audience alignment—not just keywords. Provide actionable, specific improvements.';
    const userPrompt = `
      Analyze how well the solution "${state.selectedSolution.name}" is CONTEXTUALLY integrated into the content below. Focus on:
      - Whether the solution is introduced naturally within the narrative
      - If features map to user pains and use cases in context
      - CTA relevance and clarity given the content intent
      - Depth of coverage (features, specs, value props)

      Return ONLY JSON with this shape:
      {
        "suggestions": [
          {
            "id": string,
            "type": "solution",
            "title": string,
            "description": string,
            "priority": "high" | "medium" | "low",
            "evidenceExcerpts": string[]
          }
        ]
      }

      Solution details:
      - Name: ${state.selectedSolution.name}
      - Features: ${state.selectedSolution.features.join(', ')}
      - Pain points: ${state.selectedSolution.painPoints?.join(', ') || 'None'}
      - Target audience: ${state.selectedSolution.targetAudience?.join(', ') || 'None'}
      - Value propositions: ${state.selectedSolution.uniqueValuePropositions?.join(', ') || 'None'}
      - Key differentiators: ${state.selectedSolution.keyDifferentiators?.join(', ') || 'None'}
      ${state.selectedSolution.competitors ? `- Competitors: ${state.selectedSolution.competitors.map(c => c.name).join(', ')}` : ''}

      Content:
      ${content}
    `;

    const solutionResult = await AIServiceController.generate(
      'strategy',
      systemPrompt,
      userPrompt,
      { temperature: 0.3, maxTokens: 1500 }
    );
    
    const solutionAnalysisText = solutionResult?.content || '';
    let solutionAnalysisData = null;
    
    try {
      // Try to extract JSON if it's wrapped in backticks or other text
      const jsonMatch = solutionAnalysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        solutionAnalysisText.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
        solutionAnalysisData = JSON.parse(jsonStr);
        console.log("[useSolutionAnalysis] Parsed AI analysis:", solutionAnalysisData);
      }
    } catch (error) {
      console.error('Error parsing solution analysis result:', error);
    }
    
    if (solutionAnalysisData?.suggestions) {
      setSolutionSuggestions(solutionAnalysisData.suggestions);
      return solutionAnalysisData.suggestions;
    }
    
    return [];
  }, [state.selectedSolution]);

  return {
    solutionSuggestions,
    analyzedSolutionIntegration,
    analyzeSolution,
    setSolutionSuggestions
  };
}
