
import { sendChatRequest } from './aiService';
import { AiProvider } from './aiService/types';

export interface HumanizationIssue {
  id: string;
  type: 'repetitive_phrases' | 'robotic_tone' | 'unnatural_transitions' | 'formal_language' | 'lack_personality';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  textSnippet: string;
  position: { start: number; end: number };
}

export interface ContentHumanizationAnalysis {
  isAiGenerated: boolean;
  confidence: number;
  humanizationScore: number; // 0-100, higher is more human-like
  issues: HumanizationIssue[];
  overallSuggestions: string[];
}

export const analyzeContentHumanization = async (
  content: string,
  aiProvider: AiProvider = 'openai'
): Promise<ContentHumanizationAnalysis | null> => {
  if (!content || content.length < 100) {
    return null;
  }

  try {
    const prompt = `Analyze this content for AI-generated patterns and provide humanization suggestions:

Content: "${content}"

Please provide a JSON response with the following structure:
{
  "isAiGenerated": boolean,
  "confidence": number (0-100),
  "humanizationScore": number (0-100),
  "issues": [
    {
      "id": "unique_id",
      "type": "repetitive_phrases|robotic_tone|unnatural_transitions|formal_language|lack_personality",
      "severity": "low|medium|high",
      "description": "Detailed description of the issue",
      "suggestion": "Specific suggestion to fix it",
      "textSnippet": "The problematic text snippet",
      "position": {"start": number, "end": number}
    }
  ],
  "overallSuggestions": ["General suggestions for humanization"]
}

Look for:
- Repetitive phrases or sentence structures
- Overly formal or robotic tone
- Unnatural transitions between paragraphs
- Lack of personal voice or personality
- Generic conclusions or introductions
- Perfect grammar that seems too polished
- Absence of contractions or casual language where appropriate`;

    const response = await sendChatRequest(aiProvider, {
      messages: [
        { role: 'system', content: 'You are an expert content analyst specializing in detecting AI-generated content and providing humanization suggestions. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI service');
    }

    const analysisText = response.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const analysis: ContentHumanizationAnalysis = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    if (typeof analysis.isAiGenerated !== 'boolean' || 
        typeof analysis.confidence !== 'number' ||
        typeof analysis.humanizationScore !== 'number' ||
        !Array.isArray(analysis.issues)) {
      throw new Error('Invalid analysis structure');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing content humanization:', error);
    return null;
  }
};

export const humanizeContent = async (
  content: string,
  issues: HumanizationIssue[],
  aiProvider: AiProvider = 'openai'
): Promise<string | null> => {
  if (!content || issues.length === 0) {
    return null;
  }

  try {
    const issueDescriptions = issues.map(issue => 
      `- ${issue.type}: ${issue.description} (Suggestion: ${issue.suggestion})`
    ).join('\n');

    const prompt = `Please humanize this content by addressing the following issues:

${issueDescriptions}

Original Content:
"${content}"

Instructions:
1. Make the content more conversational and natural
2. Add personality and human-like elements
3. Use varied sentence structures and transitions
4. Include appropriate contractions and casual language
5. Remove overly formal or robotic phrasing
6. Maintain the core message and information
7. Keep the same general structure and length

Return only the humanized content, no explanations.`;

    const response = await sendChatRequest(aiProvider, {
      messages: [
        { role: 'system', content: 'You are an expert content writer specializing in humanizing AI-generated text while maintaining professionalism and accuracy.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    });

    if (!response?.choices?.[0]?.message?.content) {
      throw new Error('No response from AI service');
    }

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error humanizing content:', error);
    return null;
  }
};
