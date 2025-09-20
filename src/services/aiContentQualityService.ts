/**
 * AI-powered content quality analysis service
 * Uses AI to evaluate content quality, intent matching, and SEO effectiveness
 */

import AIServiceController from '@/services/aiService/AIServiceController';
import { ContentBuilderState } from '@/contexts/content-builder/types/state-types';

export interface AIContentQualityResult {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
  };
  intentMatching: {
    score: number;
    addressesUserIntent: boolean;
    missingAspects: string[];
    recommendations: string[];
  };
  keywordIntegration: {
    score: number;
    naturalness: number;
    overOptimization: boolean;
    suggestions: string[];
  };
  contentDepth: {
    score: number;
    comprehensiveness: number;
    expertiseLevel: number;
    gaps: string[];
  };
  userEngagement: {
    score: number;
    readabilityScore: number;
    callToActionEffectiveness: number;
    improvements: string[];
  };
  seoEffectiveness: {
    score: number;
    searchIntentAlignment: number;
    competitorComparison: number;
    optimizationOpportunities: string[];
  };
}

/**
 * Analyze content quality using AI
 */
export const analyzeContentQualityWithAI = async (
  content: string,
  state: ContentBuilderState
): Promise<AIContentQualityResult> => {
  const prompt = buildContentQualityPrompt(content, state);
  
  try {
    console.log('🎯 Calling AI service for content quality analysis with use_case: strategy');
    const response = await AIServiceController.generate({
      input: prompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 2000
    });
    
    console.log('🔍 AI response received:', response ? 'Success' : 'No response');

    if (!response || !response.content) {
      throw new Error('No response from AI service');
    }

    // Parse AI response
    const analysisResult = parseAIAnalysisResponse(response.content);
    return analysisResult;
  } catch (error) {
    console.error('AI content quality analysis failed:', error);
    throw error;
  }
};

/**
 * Build prompt for AI content quality analysis
 */
const buildContentQualityPrompt = (content: string, state: ContentBuilderState): string => {
  const context = {
    mainKeyword: state.mainKeyword,
    selectedKeywords: state.selectedKeywords,
    contentType: state.contentType,
    contentIntent: state.contentIntent,
    selectedSolution: state.selectedSolution?.name || 'None',
    serpSelections: state.serpSelections?.length || 0,
    outlineSections: state.outlineSections?.length || 0
  };

  return `You are an expert content strategist and SEO analyst. Analyze the following content for quality, SEO effectiveness, and user intent alignment.

CONTENT CONTEXT:
- Main Keyword: "${context.mainKeyword}"
- Secondary Keywords: [${context.selectedKeywords.join(', ')}]
- Content Type: ${context.contentType}
- Content Intent: ${context.contentIntent}
- Solution Integration: ${context.selectedSolution}
- SERP Research Elements: ${context.serpSelections} items selected
- Outline Sections: ${context.outlineSections} sections planned

CONTENT TO ANALYZE:
${content}

Please provide a comprehensive analysis in STRICT JSON format:

{
  "overall": {
    "score": <number 0-100>,
    "grade": "<A|B|C|D|F>",
    "summary": "<2-sentence overall assessment>"
  },
  "intentMatching": {
    "score": <number 0-100>,
    "addressesUserIntent": <boolean>,
    "missingAspects": ["<aspect1>", "<aspect2>"],
    "recommendations": ["<recommendation1>", "<recommendation2>"]
  },
  "keywordIntegration": {
    "score": <number 0-100>,
    "naturalness": <number 0-100>,
    "overOptimization": <boolean>,
    "suggestions": ["<suggestion1>", "<suggestion2>"]
  },
  "contentDepth": {
    "score": <number 0-100>,
    "comprehensiveness": <number 0-100>,
    "expertiseLevel": <number 0-100>,
    "gaps": ["<gap1>", "<gap2>"]
  },
  "userEngagement": {
    "score": <number 0-100>,
    "readabilityScore": <number 0-100>,
    "callToActionEffectiveness": <number 0-100>,
    "improvements": ["<improvement1>", "<improvement2>"]
  },
  "seoEffectiveness": {
    "score": <number 0-100>,
    "searchIntentAlignment": <number 0-100>,
    "competitorComparison": <number 0-100>,
    "optimizationOpportunities": ["<opportunity1>", "<opportunity2>"]
  }
}

Focus on:
1. How well the content matches the search intent for "${context.mainKeyword}"
2. Natural keyword integration vs over-optimization
3. Content depth and expertise demonstration
4. User engagement and readability
5. SEO best practices and opportunities
6. Solution integration effectiveness (if applicable)

Return ONLY the JSON response, no additional text.`;
};

/**
 * Parse AI response into structured result
 */
const parseAIAnalysisResponse = (response: string): AIContentQualityResult => {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate required structure
    if (!parsed.overall || !parsed.intentMatching || !parsed.keywordIntegration || 
        !parsed.contentDepth || !parsed.userEngagement || !parsed.seoEffectiveness) {
      throw new Error('Invalid AI response structure');
    }

    return parsed as AIContentQualityResult;
  } catch (error) {
    console.error('Failed to parse AI analysis response:', error);
    
    // Return fallback result
    return {
      overall: {
        score: 50,
        grade: 'C',
        summary: 'AI analysis failed, using baseline assessment.'
      },
      intentMatching: {
        score: 50,
        addressesUserIntent: true,
        missingAspects: ['AI analysis unavailable'],
        recommendations: ['Complete manual review']
      },
      keywordIntegration: {
        score: 50,
        naturalness: 50,
        overOptimization: false,
        suggestions: ['Manual keyword review needed']
      },
      contentDepth: {
        score: 50,
        comprehensiveness: 50,
        expertiseLevel: 50,
        gaps: ['AI analysis unavailable']
      },
      userEngagement: {
        score: 50,
        readabilityScore: 50,
        callToActionEffectiveness: 50,
        improvements: ['Manual engagement review needed']
      },
      seoEffectiveness: {
        score: 50,
        searchIntentAlignment: 50,
        competitorComparison: 50,
        optimizationOpportunities: ['AI analysis unavailable']
      }
    };
  }
};

/**
 * Generate checklist items from AI analysis
 */
export const generateAIChecklistItems = (aiResult: AIContentQualityResult) => {
  const items = [];

  // Intent matching checks
  if (aiResult.intentMatching.addressesUserIntent) {
    items.push({
      id: 'ai-intent-match',
      label: 'Content addresses user search intent',
      description: 'AI confirmed content matches what users are looking for',
      passed: true,
      source: 'ai'
    });
  } else {
    items.push({
      id: 'ai-intent-match',
      label: 'Content addresses user search intent',
      description: `Missing aspects: ${aiResult.intentMatching.missingAspects.join(', ')}`,
      passed: false,
      source: 'ai'
    });
  }

  // Keyword integration check
  items.push({
    id: 'ai-keyword-natural',
    label: 'Keywords integrated naturally',
    description: `Naturalness score: ${aiResult.keywordIntegration.naturalness}%`,
    passed: aiResult.keywordIntegration.naturalness >= 70 && !aiResult.keywordIntegration.overOptimization,
    source: 'ai'
  });

  // Content depth check
  items.push({
    id: 'ai-content-comprehensive',
    label: 'Content is comprehensive and authoritative',
    description: `Comprehensiveness: ${aiResult.contentDepth.comprehensiveness}%, Expertise: ${aiResult.contentDepth.expertiseLevel}%`,
    passed: aiResult.contentDepth.score >= 70,
    source: 'ai'
  });

  // User engagement check
  items.push({
    id: 'ai-user-engagement',
    label: 'Content optimized for user engagement',
    description: `Readability: ${aiResult.userEngagement.readabilityScore}%, CTA effectiveness: ${aiResult.userEngagement.callToActionEffectiveness}%`,
    passed: aiResult.userEngagement.score >= 70,
    source: 'ai'
  });

  // SEO effectiveness check
  items.push({
    id: 'ai-seo-optimized',
    label: 'SEO best practices implemented',
    description: `Search intent alignment: ${aiResult.seoEffectiveness.searchIntentAlignment}%`,
    passed: aiResult.seoEffectiveness.score >= 70,
    source: 'ai'
  });

  return items;
};