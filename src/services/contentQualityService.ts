
import { ContentItemType } from '@/contexts/content/types';
import { sendChatRequest } from '@/services/aiService';
import { AiProvider } from '@/services/aiService/types';
import { EATAnalyzer, EATAnalysisResult } from '@/services/eatOptimization/EATAnalyzer';

export interface ContentQualityMetrics {
  overallScore: number; // 0-100
  readabilityScore: number;
  engagementScore: number;
  seoScore: number;
  structureScore: number;
  brandVoiceScore: number;
  eatScore: number; // New E-A-T score
  recommendations: QualityRecommendation[];
  eatAnalysis?: EATAnalysisResult; // Detailed E-A-T analysis
}

export interface QualityRecommendation {
  id: string;
  type: 'critical' | 'major' | 'minor';
  category: 'readability' | 'engagement' | 'seo' | 'structure' | 'brand' | 'eat'; // Added E-A-T category
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  autoFixable: boolean;
}

export interface WritingStyle {
  name: string;
  description: string;
  tone: string;
  vocabulary: string;
  sentenceLength: string;
  perspective: string;
}

export interface ExpertiseLevel {
  level: string;
  description: string;
  vocabularyComplexity: string;
  explanationDepth: string;
  technicalDetails: string;
}

export const WRITING_STYLES: WritingStyle[] = [
  {
    name: 'Professional',
    description: 'Formal, authoritative tone suitable for business and technical content',
    tone: 'Formal and authoritative',
    vocabulary: 'Industry-specific terminology',
    sentenceLength: 'Medium to long sentences',
    perspective: 'Third-person'
  },
  {
    name: 'Conversational',
    description: 'Friendly, approachable tone that builds connection with readers',
    tone: 'Warm and approachable',
    vocabulary: 'Accessible language with occasional technical terms',
    sentenceLength: 'Short to medium sentences',
    perspective: 'Second-person (you/your)'
  },
  {
    name: 'Technical',
    description: 'Precise, detail-oriented writing for expert audiences',
    tone: 'Precise and objective',
    vocabulary: 'Heavy technical terminology',
    sentenceLength: 'Varied length for clarity',
    perspective: 'Third-person'
  },
  {
    name: 'Casual',
    description: 'Relaxed, informal tone for easy reading',
    tone: 'Relaxed and friendly',
    vocabulary: 'Simple, everyday language',
    sentenceLength: 'Short sentences',
    perspective: 'First or second-person'
  }
];

export const EXPERTISE_LEVELS: ExpertiseLevel[] = [
  {
    level: 'Novice',
    description: 'Complete beginners with no prior knowledge',
    vocabularyComplexity: 'Simple, everyday terms with definitions',
    explanationDepth: 'Step-by-step with foundational context',
    technicalDetails: 'Minimal, with analogies and examples'
  },
  {
    level: 'Beginner',
    description: 'Basic understanding with some exposure to the topic',
    vocabularyComplexity: 'Basic terminology with explanations',
    explanationDepth: 'Clear explanations with some background',
    technicalDetails: 'Basic concepts with practical examples'
  },
  {
    level: 'Competent',
    description: 'Working knowledge and practical experience',
    vocabularyComplexity: 'Industry terms with minimal explanation',
    explanationDepth: 'Focused on application and best practices',
    technicalDetails: 'Moderate detail with implementation focus'
  },
  {
    level: 'Proficient',
    description: 'Advanced knowledge with deep understanding',
    vocabularyComplexity: 'Advanced terminology assumed knowledge',
    explanationDepth: 'Strategic insights and optimization',
    technicalDetails: 'High detail with advanced techniques'
  },
  {
    level: 'Expert',
    description: 'Comprehensive mastery and innovative thinking',
    vocabularyComplexity: 'Specialized jargon and cutting-edge terms',
    explanationDepth: 'Theoretical foundations and innovation',
    technicalDetails: 'Maximum detail with research and trends'
  }
];

/**
 * Enhanced content quality analysis with E-A-T integration
 */
export async function analyzeContentQuality(
  content: string,
  title: string,
  targetStyle: string,
  expertiseLevel: string,
  includeEAT: boolean = true,
  provider: AiProvider = 'openai'
): Promise<ContentQualityMetrics | null> {
  try {
    const analysisPrompt = createQualityAnalysisPrompt(content, title, targetStyle, expertiseLevel, includeEAT);
    
    const response = await sendChatRequest(provider, {
      messages: [
        {
          role: 'system',
          content: `You are an expert content quality analyst with deep knowledge of Google's E-A-T guidelines. Analyze content for readability, engagement, SEO, structure, brand voice compliance, and expertise/authority/trustworthiness. Provide detailed, actionable feedback in JSON format.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: 3000
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI service');
    }

    const baseMetrics = parseQualityAnalysisResponse(response.choices[0].message.content);
    
    // Add detailed E-A-T analysis if requested
    if (includeEAT) {
      try {
        const eatAnalysis = await EATAnalyzer.analyzeContent(content, title, title.split(' ')[0] || 'general');
        baseMetrics.eatAnalysis = eatAnalysis;
        baseMetrics.eatScore = eatAnalysis.score.overall;
        
        // Add E-A-T recommendations to the main recommendations
        const eatRecommendations: QualityRecommendation[] = eatAnalysis.overallRecommendations.map((rec, index) => ({
          id: `eat_${index}`,
          type: 'major' as const,
          category: 'eat' as const,
          title: rec,
          description: `E-A-T improvement: ${rec}`,
          impact: 'high' as const,
          effort: 'medium' as const,
          autoFixable: false
        }));
        
        baseMetrics.recommendations = [...baseMetrics.recommendations, ...eatRecommendations];
      } catch (eatError) {
        console.error('E-A-T analysis failed:', eatError);
        baseMetrics.eatScore = 50; // Default score if E-A-T analysis fails
      }
    } else {
      baseMetrics.eatScore = 50; // Default score when E-A-T is not analyzed
    }
    
    // Recalculate overall score to include E-A-T
    if (includeEAT) {
      baseMetrics.overallScore = Math.round(
        (baseMetrics.readabilityScore * 0.15 +
         baseMetrics.engagementScore * 0.2 +
         baseMetrics.seoScore * 0.2 +
         baseMetrics.structureScore * 0.15 +
         baseMetrics.brandVoiceScore * 0.1 +
         baseMetrics.eatScore * 0.2) // E-A-T gets 20% weight
      );
    }

    return baseMetrics;
    
  } catch (error) {
    console.error('Error in content quality analysis:', error);
    return null;
  }
}

function createQualityAnalysisPrompt(
  content: string, 
  title: string, 
  targetStyle: string, 
  expertiseLevel: string,
  includeEAT: boolean
): string {
  const wordCount = content.split(/\s+/).length;
  
  return `Analyze this content for quality metrics. Provide scores (0-100) and specific recommendations.

CONTENT TO ANALYZE:
Title: ${title}
Content: ${content}
Target Style: ${targetStyle}
Target Expertise: ${expertiseLevel}
Word Count: ${wordCount}
Include E-A-T Analysis: ${includeEAT}

ANALYSIS CRITERIA:

1. READABILITY (0-100):
   - Sentence length and complexity
   - Paragraph structure
   - Transition flow
   - Vocabulary appropriateness for target level

2. ENGAGEMENT (0-100):
   - Hook effectiveness
   - Storytelling elements
   - Call-to-action strength
   - Visual content suggestions

3. SEO OPTIMIZATION (0-100):
   - Heading structure (H1, H2, H3)
   - Keyword usage and density
   - Meta description potential
   - Internal linking opportunities

4. STRUCTURE (0-100):
   - Logical flow and organization
   - Introduction-body-conclusion balance
   - Use of lists and formatting
   - Content hierarchy

5. BRAND VOICE (0-100):
   - Consistency with target style
   - Tone appropriateness
   - Professional quality
   - Audience alignment

${includeEAT ? `
6. E-A-T PRELIMINARY ASSESSMENT (0-100):
   - Expertise demonstration
   - Authority signals present
   - Trustworthiness indicators
   - Source quality and citations
` : ''}

Respond in this JSON format:
{
  "overallScore": 85,
  "readabilityScore": 80,
  "engagementScore": 90,
  "seoScore": 75,
  "structureScore": 85,
  "brandVoiceScore": 88,
  ${includeEAT ? '"eatScore": 75,' : '"eatScore": 50,'}
  "recommendations": [
    {
      "id": "readability_1",
      "type": "minor",
      "category": "readability",
      "title": "Simplify complex sentences",
      "description": "Several sentences exceed 25 words. Break them down for better flow.",
      "impact": "medium",
      "effort": "low",
      "autoFixable": true
    }
  ]
}`;
}

function parseQualityAnalysisResponse(analysisText: string): ContentQualityMetrics {
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      overallScore: Math.max(0, Math.min(100, parsed.overallScore || 50)),
      readabilityScore: Math.max(0, Math.min(100, parsed.readabilityScore || 50)),
      engagementScore: Math.max(0, Math.min(100, parsed.engagementScore || 50)),
      seoScore: Math.max(0, Math.min(100, parsed.seoScore || 50)),
      structureScore: Math.max(0, Math.min(100, parsed.structureScore || 50)),
      brandVoiceScore: Math.max(0, Math.min(100, parsed.brandVoiceScore || 50)),
      eatScore: Math.max(0, Math.min(100, parsed.eatScore || 50)),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map((rec: any, index: number) => ({
        id: rec.id || `rec_${index}`,
        type: ['critical', 'major', 'minor'].includes(rec.type) ? rec.type : 'minor',
        category: ['readability', 'engagement', 'seo', 'structure', 'brand', 'eat'].includes(rec.category) ? rec.category : 'readability',
        title: rec.title || 'Improvement needed',
        description: rec.description || 'No description provided',
        impact: ['high', 'medium', 'low'].includes(rec.impact) ? rec.impact : 'medium',
        effort: ['low', 'medium', 'high'].includes(rec.effort) ? rec.effort : 'medium',
        autoFixable: Boolean(rec.autoFixable)
      })) : []
    };
  } catch (error) {
    console.error('Error parsing quality analysis:', error);
    return {
      overallScore: 50,
      readabilityScore: 50,
      engagementScore: 50,
      seoScore: 50,
      structureScore: 50,
      brandVoiceScore: 50,
      eatScore: 50,
      recommendations: []
    };
  }
}
