
import { ContentHumanizationAnalysis, analyzeContentHumanization, humanizeContent, HumanizationSuggestion } from './contentHumanizerService';
import { SerpUsageAnalysis, analyzeSerpIntegration, enhanceContentWithSerp } from './serpIntegrationService';
import { SerpSelection } from '@/contexts/content-builder/types/serp-types';
import { AiProvider } from './aiService/types';

export interface ComprehensiveOptimization {
  humanizationAnalysis: ContentHumanizationAnalysis | null;
  serpAnalysis: SerpUsageAnalysis;
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  id: string;
  category: 'humanization' | 'serp_integration' | 'content_quality';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  autoFixable: boolean;
  selected: boolean;
}

export const analyzeComprehensiveOptimization = async (
  content: string,
  serpSelections: SerpSelection[],
  aiProvider: AiProvider = 'openai'
): Promise<ComprehensiveOptimization> => {
  try {
    // Run parallel analysis
    const [humanizationAnalysis, serpAnalysis] = await Promise.all([
      analyzeContentHumanization(content, aiProvider),
      analyzeSerpIntegration(content, serpSelections)
    ]);

    const recommendations: OptimizationRecommendation[] = [];

    // Add humanization recommendations
    if (humanizationAnalysis && humanizationAnalysis.aiLikelihoodScore > 30) {
      recommendations.push({
        id: 'humanize-content',
        category: 'humanization',
        title: 'Humanize AI-Generated Content',
        description: `Content appears ${humanizationAnalysis.aiLikelihoodScore}% AI-generated. Apply humanization techniques.`,
        impact: humanizationAnalysis.aiLikelihoodScore > 70 ? 'high' : 'medium',
        autoFixable: true,
        selected: humanizationAnalysis.aiLikelihoodScore > 50
      });

      humanizationAnalysis.humanizationSuggestions.forEach((suggestion, index) => {
        recommendations.push({
          id: `humanization-${index}`,
          category: 'humanization',
          title: suggestion.title,
          description: suggestion.description,
          impact: suggestion.impact,
          autoFixable: true,
          selected: suggestion.impact === 'high'
        });
      });
    }

    // Add SERP integration recommendations
    if (serpAnalysis.integrationScore < 80) {
      recommendations.push({
        id: 'integrate-serp-items',
        category: 'serp_integration',
        title: 'Integrate Missing SERP Elements',
        description: `Only ${serpAnalysis.integrationScore}% of SERP elements are integrated. Add ${serpAnalysis.missingItems.length} missing items.`,
        impact: serpAnalysis.missingItems.length > 3 ? 'high' : 'medium',
        autoFixable: true,
        selected: serpAnalysis.integrationScore < 60
      });

      serpAnalysis.suggestions.forEach((suggestion, index) => {
        recommendations.push({
          id: `serp-${index}`,
          category: 'serp_integration',
          title: `Integrate: ${suggestion.item.content}`,
          description: suggestion.suggestion,
          impact: suggestion.priority === 'high' ? 'high' : 'medium',
          autoFixable: true,
          selected: suggestion.priority === 'high'
        });
      });
    }

    return {
      humanizationAnalysis,
      serpAnalysis,
      recommendations
    };
  } catch (error) {
    console.error('Comprehensive optimization analysis error:', error);
    return {
      humanizationAnalysis: null,
      serpAnalysis: {
        totalSerpItems: serpSelections.length,
        integratedItems: 0,
        integrationScore: 0,
        missingItems: serpSelections,
        wellIntegratedItems: [],
        suggestions: []
      },
      recommendations: []
    };
  }
};

export const applyComprehensiveOptimization = async (
  content: string,
  selectedRecommendations: OptimizationRecommendation[],
  humanizationAnalysis: ContentHumanizationAnalysis | null,
  serpAnalysis: SerpUsageAnalysis,
  aiProvider: AiProvider = 'openai'
): Promise<string | null> => {
  try {
    let optimizedContent = content;

    // Apply humanization if selected
    const humanizationRecs = selectedRecommendations.filter(r => r.category === 'humanization');
    if (humanizationRecs.length > 0 && humanizationAnalysis) {
      const selectedSuggestions = humanizationAnalysis.humanizationSuggestions.filter(s => 
        selectedRecommendations.some(r => r.title === s.title)
      );
      
      const humanizedContent = await humanizeContent(optimizedContent, selectedSuggestions, aiProvider);
      if (humanizedContent) {
        optimizedContent = humanizedContent;
      }
    }

    // Apply SERP integration if selected
    const serpRecs = selectedRecommendations.filter(r => r.category === 'serp_integration');
    if (serpRecs.length > 0 && serpAnalysis.missingItems.length > 0) {
      const enhancedContent = await enhanceContentWithSerp(optimizedContent, serpAnalysis.missingItems, aiProvider);
      if (enhancedContent) {
        optimizedContent = enhancedContent;
      }
    }

    return optimizedContent;
  } catch (error) {
    console.error('Comprehensive optimization application error:', error);
    return null;
  }
};
