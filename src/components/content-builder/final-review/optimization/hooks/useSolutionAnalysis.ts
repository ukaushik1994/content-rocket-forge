
import { useState, useCallback } from 'react';
import { OptimizationSuggestion } from '../types';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { sendChatRequest } from '@/services/aiService';
import { analyzeSolutionIntegration } from '@/utils/seo/solution/analyzeSolutionIntegration';

export function useSolutionAnalysis() {
  const { state } = useContentBuilder();
  const [solutionSuggestions, setSolutionSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [analyzedSolutionIntegration, setAnalyzedSolutionIntegration] = useState<any>(null);

  const analyzeSolution = useCallback(async (content: string) => {
    if (!state.selectedSolution) {
      setSolutionSuggestions([]);
      return [];
    }

    const solutionMetrics = analyzeSolutionIntegration(content, state.selectedSolution);
    setAnalyzedSolutionIntegration(solutionMetrics);
    
    const solutionResult = await sendChatRequest('openrouter', {
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert in product integration for content marketing. Analyze the content and suggest improvements for better product integration.' 
        },
        { 
          role: 'user', 
          content: `
            Analyze how well this solution "${state.selectedSolution.name}" is integrated into the content.
            
            Solution details:
            - Name: ${state.selectedSolution.name}
            - Features: ${state.selectedSolution.features.join(', ')}
            ${state.selectedSolution.painPoints ? `- Pain points: ${state.selectedSolution.painPoints.join(', ')}` : ''}
            ${state.selectedSolution.targetAudience ? `- Target audience: ${state.selectedSolution.targetAudience.join(', ')}` : ''}
            
            Current integration metrics:
            - Feature incorporation: ${solutionMetrics.featureIncorporation}%
            - Name mentions: ${solutionMetrics.nameMentions}
            - Positioning score: ${solutionMetrics.positioningScore}%
            - Pain points addressed: ${solutionMetrics.painPointsAddressed}%
            - Audience alignment: ${solutionMetrics.audienceAlignment}%
            - Mentioned features: ${solutionMetrics.mentionedFeatures.join(', ') || 'None'}
            
            Content:
            ${content}
            
            Return JSON with an array of specific improvement suggestions. Each suggestion should have:
            1. id: a unique string
            2. type: always "solution"
            3. title: short title for the suggestion
            4. description: detailed description of what to improve
            5. priority: "high", "medium", or "low"
            
            Format: { "suggestions": [...] }
          `
        }
      ]
    });
    
    const solutionAnalysisText = solutionResult?.choices?.[0]?.message?.content || '';
    let solutionAnalysisData = null;
    
    try {
      const jsonMatch = solutionAnalysisText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        solutionAnalysisData = JSON.parse(jsonMatch[0]);
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
