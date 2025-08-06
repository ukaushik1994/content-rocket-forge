
import { ContentItemType } from '@/contexts/content/types';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AiProvider } from '@/services/aiService/types';

export interface ContentQualityMetrics {
  overallScore: number; // 0-100
  readabilityScore: number;
  engagementScore: number;
  seoScore: number;
  structureScore: number;
  brandVoiceScore: number;
  recommendations: QualityRecommendation[];
}

export interface QualityRecommendation {
  id: string;
  type: 'critical' | 'major' | 'minor';
  category: 'readability' | 'engagement' | 'seo' | 'structure' | 'brand';
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
 * Analyze content quality using AI
 */
export async function analyzeContentQuality(
  content: string,
  title: string,
  targetStyle: string,
  expertiseLevel: string,
  provider: AiProvider = 'openai'
): Promise<ContentQualityMetrics | null> {
  try {
    const analysisPrompt = createQualityAnalysisPrompt(content, title, targetStyle, expertiseLevel);
    
    const response = await AIServiceController.generate({
      input: analysisPrompt,
      use_case: 'strategy',
      temperature: 0.3,
      max_tokens: 2000
    });

    if (!response?.content) {
      throw new Error('No response from AI service');
    }

    return parseQualityAnalysisResponse(response.content);
    
  } catch (error) {
    console.error('Error in content quality analysis:', error);
    return null;
  }
}

function createQualityAnalysisPrompt(
  content: string, 
  title: string, 
  targetStyle: string, 
  expertiseLevel: string
): string {
  const wordCount = content.split(/\s+/).length;
  
  return `Analyze this content for quality metrics. Provide scores (0-100) and specific recommendations.

CONTENT TO ANALYZE:
Title: ${title}
Content: ${content}
Target Style: ${targetStyle}
Target Expertise: ${expertiseLevel}
Word Count: ${wordCount}

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

Respond in this JSON format:
{
  "overallScore": 85,
  "readabilityScore": 80,
  "engagementScore": 90,
  "seoScore": 75,
  "structureScore": 85,
  "brandVoiceScore": 88,
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
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.map((rec: any, index: number) => ({
        id: rec.id || `rec_${index}`,
        type: ['critical', 'major', 'minor'].includes(rec.type) ? rec.type : 'minor',
        category: ['readability', 'engagement', 'seo', 'structure', 'brand'].includes(rec.category) ? rec.category : 'readability',
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
      recommendations: []
    };
  }
}
