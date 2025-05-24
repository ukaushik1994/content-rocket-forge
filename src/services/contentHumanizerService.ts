
import { sendChatRequest } from './aiService';
import { AiProvider } from './aiService/types';

export interface AIContentPattern {
  type: 'repetitive_phrases' | 'formal_tone' | 'lack_personality' | 'generic_examples' | 'predictable_structure';
  description: string;
  severity: 'low' | 'medium' | 'high';
  examples: string[];
}

export interface HumanizationSuggestion {
  id: string;
  type: 'tone' | 'structure' | 'examples' | 'personality' | 'vocabulary';
  title: string;
  description: string;
  before: string;
  after: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ContentHumanizationAnalysis {
  aiLikelihoodScore: number; // 0-100, where 100 is very AI-like
  detectedPatterns: AIContentPattern[];
  humanizationSuggestions: HumanizationSuggestion[];
  overallAssessment: 'human' | 'mixed' | 'ai_generated';
  confidence: number;
}

export const analyzeContentHumanization = async (
  content: string,
  aiProvider: AiProvider = 'openai'
): Promise<ContentHumanizationAnalysis | null> => {
  try {
    if (!content || content.length < 100) {
      return null;
    }

    const response = await sendChatRequest(aiProvider, {
      messages: [
        {
          role: 'system',
          content: `You are an expert at detecting AI-generated content and providing humanization suggestions. Analyze the content for AI patterns and provide specific improvement suggestions.

Return your analysis in this exact JSON format:
{
  "aiLikelihoodScore": number (0-100),
  "detectedPatterns": [
    {
      "type": "repetitive_phrases" | "formal_tone" | "lack_personality" | "generic_examples" | "predictable_structure",
      "description": "string",
      "severity": "low" | "medium" | "high",
      "examples": ["string"]
    }
  ],
  "humanizationSuggestions": [
    {
      "id": "string",
      "type": "tone" | "structure" | "examples" | "personality" | "vocabulary",
      "title": "string",
      "description": "string",
      "before": "string",
      "after": "string",
      "impact": "low" | "medium" | "high"
    }
  ],
  "overallAssessment": "human" | "mixed" | "ai_generated",
  "confidence": number (0-100)
}`
        },
        {
          role: 'user',
          content: `Analyze this content for AI-generated patterns and provide humanization suggestions:

${content}`
        }
      ]
    });

    const analysisText = response?.choices?.[0]?.message?.content;
    if (!analysisText) return null;

    const analysis = JSON.parse(analysisText) as ContentHumanizationAnalysis;
    return analysis;
  } catch (error) {
    console.error('Content humanization analysis error:', error);
    return null;
  }
};

export const humanizeContent = async (
  content: string,
  suggestions: HumanizationSuggestion[],
  aiProvider: AiProvider = 'openai'
): Promise<string | null> => {
  try {
    const response = await sendChatRequest(aiProvider, {
      messages: [
        {
          role: 'system',
          content: 'You are an expert content humanizer. Rewrite the content to make it more natural, engaging, and human-like while preserving all key information and SEO value.'
        },
        {
          role: 'user',
          content: `Humanize this content based on these specific suggestions:

SUGGESTIONS TO APPLY:
${suggestions.map(s => `- ${s.title}: ${s.description}`).join('\n')}

CONTENT TO HUMANIZE:
${content}

Requirements:
- Keep all important keywords and SEO elements
- Make it more conversational and natural
- Add personality and unique voice
- Improve readability and engagement
- Maintain the same length approximately`
        }
      ]
    });

    return response?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error('Content humanization error:', error);
    return null;
  }
};
