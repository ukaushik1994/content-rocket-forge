
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
    
    const systemPrompt = 'You are an expert in product integration for content marketing. Analyze the content and suggest improvements for better product integration.';
    const userPrompt = `
      Analyze how well this solution "${state.selectedSolution.name}" is integrated into the content.
      
      Solution details:
      - Name: ${state.selectedSolution.name}
      - Features: ${state.selectedSolution.features.join(', ')}
      - Pain points: ${state.selectedSolution.painPoints?.join(', ') || 'None'}
      - Target audience: ${state.selectedSolution.targetAudience?.join(', ') || 'None'}
      - Value propositions: ${state.selectedSolution.uniqueValuePropositions?.join(', ') || 'None'}
      - Key differentiators: ${state.selectedSolution.keyDifferentiators?.join(', ') || 'None'}
      ${state.selectedSolution.competitors ? `- Competitors: ${state.selectedSolution.competitors.map(c => c.name).join(', ')}` : ''}
      
      Enhanced integration metrics:
      - Feature incorporation: ${solutionMetrics.featureIncorporation}%
      - Name mentions: ${solutionMetrics.nameMentions}
      - Positioning score: ${solutionMetrics.positioningScore}%
      - Technical specs integration: ${solutionMetrics.technicalSpecsIntegration}%
      - Case study references: ${solutionMetrics.caseStudyReferences}
      - Value proposition coverage: ${solutionMetrics.valuePropositionCoverage}%
      - Market data integration: ${solutionMetrics.marketDataIntegration}%
      - Competitor mentions: ${solutionMetrics.competitorMentions}
      - Use cases covered: ${solutionMetrics.useCasesCovered.join(', ') || 'None'}
      - Differentiators mentioned: ${solutionMetrics.differentiatorsMentioned.join(', ') || 'None'}
      
      Content:
      ${content}
      
      Return JSON with an array of specific improvement suggestions. Each suggestion should have:
      1. id: a unique string
      2. type: always "solution"
      3. title: short title for the suggestion
      4. description: detailed description of what to improve
      5. priority: "high", "medium", or "low"
      
      Format: { "suggestions": [...] }
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
