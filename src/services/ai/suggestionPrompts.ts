/**
 * Specialized AI prompts for content suggestion generation
 * These prompts are designed to ensure consistent, actionable suggestions
 */

export interface SuggestionContext {
  mainKeyword?: string;
  selectedKeywords?: string[];
  contentLength: number;
  wordCount: number;
  contentType?: string;
  targetGoal?: string;
}

export interface SuggestionReplacement {
  id: string;
  originalText: string;
  replacementText: string;
  reasoning: string;
  location: {
    paragraph: number;
    sentence: number;
    startIndex: number;
    endIndex: number;
  };
  confidence: 'high' | 'medium' | 'low';
}

export interface StructuredSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning: string;
  type: 'content' | 'seo' | 'structure' | 'keywords' | 'readability';
  priority: 'high' | 'medium' | 'low';
  category: 'structure' | 'seo' | 'keywords' | 'solution' | 'content';
  autoFixable: boolean;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  replacements?: SuggestionReplacement[];
  example?: string;
}

/**
 * Creates a specialized system prompt for content suggestion generation
 */
export function createSuggestionSystemPrompt(): string {
  return `You are an expert content optimization assistant. Your job is to analyze content and provide specific, actionable suggestions for improvement.

CRITICAL RESPONSE FORMAT REQUIREMENTS:
1. You MUST respond in valid JSON format only
2. Do not include any text before or after the JSON
3. If you cannot generate suggestions, return {"suggestions": []}
4. Each suggestion must include exact text replacements with precise location information

JSON SCHEMA (follow exactly):
{
  "suggestions": [
    {
      "id": "unique_identifier",
      "title": "Clear, action-oriented title (max 60 chars)",
      "description": "What needs to be changed and why (max 150 chars)",
      "reasoning": "Detailed explanation of the improvement benefits",
      "type": "content|seo|structure|keywords|readability",
      "priority": "high|medium|low",
      "category": "structure|seo|keywords|solution|content",
      "autoFixable": true|false,
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "replacements": [
        {
          "id": "replacement_id",
          "originalText": "exact text from content to replace",
          "replacementText": "improved replacement text",
          "reasoning": "why this specific change improves the content",
          "location": {
            "paragraph": 1,
            "sentence": 2,
            "startIndex": 45,
            "endIndex": 78
          },
          "confidence": "high|medium|low"
        }
      ],
      "example": "brief example if helpful"
    }
  ]
}

FALLBACK FORMAT (if JSON parsing might fail):
SUGGESTION_START
Title: [title]
Description: [description]
Type: [type]
Priority: [priority]
Original: "[exact text]"
Replacement: "[new text]"
Reasoning: [why this improves content]
SUGGESTION_END`;
}

/**
 * Creates the user prompt for content analysis with context
 */
export function createContentAnalysisPrompt(
  content: string, 
  context: SuggestionContext
): string {
  // Preprocess content - split into numbered paragraphs and sentences
  const preprocessedContent = preprocessContentForAnalysis(content);
  
  return `Analyze this content and provide 3-7 specific optimization suggestions with exact text replacements:

CONTENT STRUCTURE:
${preprocessedContent}

OPTIMIZATION CONTEXT:
- Main Keyword: ${context.mainKeyword || 'Not specified'}
- Additional Keywords: ${context.selectedKeywords?.join(', ') || 'None'}
- Content Length: ${context.contentLength} characters
- Word Count: ${context.wordCount} words
- Content Type: ${context.contentType || 'General'}

ANALYSIS FOCUS:
1. SEO optimization (keyword usage, meta elements, structure)
2. Readability improvements (sentence flow, paragraph structure)
3. Content engagement (calls-to-action, value propositions)
4. Technical improvements (headings, formatting, links)

REQUIREMENTS FOR EACH SUGGESTION:
- Must include exact "originalText" that exists in the content
- Must provide specific "replacementText" 
- Must include precise location information (paragraph, sentence, character indices)
- Must explain the reasoning for the improvement
- Must assess impact and effort realistically

Focus on high-impact, implementable changes. Provide exact text matches and replacements.`;
}

/**
 * Preprocesses content by adding structure markers for better AI analysis
 */
export function preprocessContentForAnalysis(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Split content into paragraphs
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let processedContent = '';
  let globalCharIndex = 0;

  paragraphs.forEach((paragraph, pIndex) => {
    processedContent += `[PARAGRAPH ${pIndex + 1}]\n`;
    
    // Split paragraph into sentences
    const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    sentences.forEach((sentence, sIndex) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 0) {
        const startIndex = globalCharIndex;
        const endIndex = startIndex + trimmedSentence.length;
        
        processedContent += `[S${sIndex + 1}:${startIndex}-${endIndex}] ${trimmedSentence}.\n`;
        globalCharIndex = endIndex + 1;
      }
    });
    
    processedContent += '\n';
  });

  return processedContent;
}

/**
 * Validates a suggestion response structure
 */
export function validateSuggestionResponse(response: any): {
  isValid: boolean;
  errors: string[];
  suggestions: StructuredSuggestion[];
} {
  const errors: string[] = [];
  const suggestions: StructuredSuggestion[] = [];

  if (!response || typeof response !== 'object') {
    errors.push('Response is not a valid object');
    return { isValid: false, errors, suggestions };
  }

  if (!response.suggestions || !Array.isArray(response.suggestions)) {
    errors.push('Response must contain a suggestions array');
    return { isValid: false, errors, suggestions };
  }

  response.suggestions.forEach((suggestion: any, index: number) => {
    const suggestionErrors: string[] = [];
    
    // Validate required fields
    if (!suggestion.id || typeof suggestion.id !== 'string') {
      suggestionErrors.push(`Suggestion ${index + 1}: Missing or invalid id`);
    }
    if (!suggestion.title || typeof suggestion.title !== 'string') {
      suggestionErrors.push(`Suggestion ${index + 1}: Missing or invalid title`);
    }
    if (!suggestion.description || typeof suggestion.description !== 'string') {
      suggestionErrors.push(`Suggestion ${index + 1}: Missing or invalid description`);
    }

    // Validate enums
    const validTypes = ['content', 'seo', 'structure', 'keywords', 'readability'];
    if (!validTypes.includes(suggestion.type)) {
      suggestionErrors.push(`Suggestion ${index + 1}: Invalid type`);
    }

    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(suggestion.priority)) {
      suggestionErrors.push(`Suggestion ${index + 1}: Invalid priority`);
    }

    if (suggestionErrors.length === 0) {
      // Create validated suggestion
      suggestions.push({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        reasoning: suggestion.reasoning || '',
        type: suggestion.type,
        priority: suggestion.priority,
        category: suggestion.category || 'content',
        autoFixable: Boolean(suggestion.autoFixable),
        impact: suggestion.impact || 'medium',
        effort: suggestion.effort || 'medium',
        replacements: suggestion.replacements || [],
        example: suggestion.example || ''
      });
    }

    errors.push(...suggestionErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
    suggestions
  };
}