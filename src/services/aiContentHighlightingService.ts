import { OptimizationSuggestion } from '@/components/content-builder/final-review/optimization/types';
import AIServiceController from '@/services/aiService/AIServiceController';
import { ContentHighlight, HighlightAnalysisResult } from './contentHighlightingService';
import { ComplianceAnalysisResult } from '@/types/contentCompliance';
import { analyzeContentForComplianceHighlights } from './complianceHighlightingService';

/**
 * Compliance-based content highlighting using rule-based analysis
 */
export const generateComplianceHighlights = (
  content: string,
  complianceResult: ComplianceAnalysisResult
): HighlightAnalysisResult => {
  return analyzeContentForComplianceHighlights(content, complianceResult);
};

/**
 * AI-powered content highlighting service that provides real optimization suggestions
 */
export const analyzeContentForAIHighlights = async (
  content: string,
  suggestions: OptimizationSuggestion[],
  mainKeyword: string = '',
  targetKeywords: string[] = []
): Promise<HighlightAnalysisResult> => {
  const highlights: ContentHighlight[] = [];
  
  try {
    // Use AI to analyze content and generate real highlights based on suggestions
    const systemPrompt = 'You are an expert content optimization specialist. Analyze the provided content and identify specific text segments that need improvement based on the given suggestions.';
    
    const userPrompt = `
Analyze this content and identify specific text segments that need improvement based on these optimization suggestions:

SUGGESTIONS:
${suggestions.map(s => `- ${s.title}: ${s.description} (Category: ${s.category}, Priority: ${s.priority})`).join('\n')}

TARGET KEYWORDS: ${[mainKeyword, ...targetKeywords].filter(k => k).join(', ')}

CONTENT:
${content}

Return ONLY JSON with this structure:
{
  "highlights": [
    {
      "startIndex": number,
      "endIndex": number,
      "text": "exact text from content",
      "type": "seo|structure|solution|ai-detection|serp",
      "priority": "high|medium|low",
      "suggestionTitle": "suggestion title",
      "suggestionDescription": "specific improvement description",
      "category": "suggestion category"
    }
  ]
}

Focus on identifying:
1. Specific sentences or paragraphs that could be improved
2. Exact text positions that need keyword optimization
3. Areas where solution integration could be enhanced
4. Content segments that could be more engaging
5. Structure improvements needed

Be precise with startIndex and endIndex to highlight exact text segments.
`;

    const response = await AIServiceController.generate(
      'strategy',
      systemPrompt,
      userPrompt,
      { temperature: 0.2, maxTokens: 2000 }
    );

    if (response?.content) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         response.content.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0].replace(/```json|```/g, '').trim();
          const analysisData = JSON.parse(jsonStr);
          
          if (analysisData.highlights && Array.isArray(analysisData.highlights)) {
            // Convert AI highlights to our format and validate them
            analysisData.highlights.forEach((highlight: any, index: number) => {
              const startIndex = parseInt(highlight.startIndex);
              const endIndex = parseInt(highlight.endIndex);
              
              // Validate indices
              if (startIndex >= 0 && endIndex > startIndex && endIndex <= content.length) {
                const actualText = content.substring(startIndex, endIndex);
                
                // Ensure the text matches (with some flexibility for whitespace)
                if (actualText.trim().length > 0) {
                  highlights.push({
                    id: `ai-highlight-${index}`,
                    startIndex,
                    endIndex,
                    text: actualText,
                    type: (highlight.type || 'content') as ContentHighlight['type'],
                    priority: (highlight.priority || 'medium') as ContentHighlight['priority'],
                    suggestion: {
                      title: highlight.suggestionTitle || 'Content Improvement',
                      description: highlight.suggestionDescription || 'This content segment could be improved',
                      category: highlight.category || 'content'
                    }
                  });
                }
              }
            });
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI highlight response:', parseError);
        // Fall back to rule-based highlighting
        return generateFallbackHighlights(content, suggestions, mainKeyword, targetKeywords);
      }
    }
    
    // If we got valid highlights from AI, use them
    if (highlights.length > 0) {
      console.log(`✅ Generated ${highlights.length} AI-powered highlights`);
      return {
        highlights: removeOverlappingHighlights(highlights),
        originalContent: content
      };
    }
  } catch (error) {
    console.error('AI highlighting failed:', error);
  }
  
  // Fall back to rule-based highlighting if AI fails
  return generateFallbackHighlights(content, suggestions, mainKeyword, targetKeywords);
};

/**
 * Fallback highlighting using rule-based approach
 */
const generateFallbackHighlights = (
  content: string,
  suggestions: OptimizationSuggestion[],
  mainKeyword: string,
  targetKeywords: string[]
): HighlightAnalysisResult => {
  const highlights: ContentHighlight[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  suggestions.forEach((suggestion, suggestionIndex) => {
    // Generate highlights based on suggestion category
    switch (suggestion.category) {
      case 'seo':
      case 'keywords':
        // Find sentences that could use keyword optimization
        const keywordToCheck = mainKeyword || targetKeywords[0];
        if (keywordToCheck) {
          sentences.forEach((sentence, index) => {
            if (!sentence.toLowerCase().includes(keywordToCheck.toLowerCase()) && sentence.length > 50) {
              const startIndex = content.indexOf(sentence.trim());
              if (startIndex !== -1) {
                highlights.push({
                  id: `seo-${suggestionIndex}-${index}`,
                  startIndex,
                  endIndex: startIndex + sentence.length,
                  text: sentence.trim(),
                  type: 'seo',
                  priority: suggestion.priority,
                  suggestion: {
                    title: suggestion.title,
                    description: `Consider incorporating \"${keywordToCheck}\" naturally in this sentence`,
                    category: suggestion.category
                  }
                });
              }
            }
          });
        }
        break;
        
      case 'structure':
        // Find long paragraphs that need breaking up
        const paragraphs = content.split(/\n\s*\n/);
        paragraphs.forEach((paragraph, index) => {
          if (paragraph.length > 300) {
            const startIndex = content.indexOf(paragraph);
            if (startIndex !== -1) {
              highlights.push({
                id: `structure-${suggestionIndex}-${index}`,
                startIndex,
                endIndex: startIndex + paragraph.length,
                text: paragraph,
                type: 'structure',
                priority: suggestion.priority,
                suggestion: {
                  title: suggestion.title,
                  description: 'Break this long paragraph into smaller, more digestible chunks',
                  category: suggestion.category
                }
              });
            }
          }
        });
        break;
        
      case 'solution':
        // Find areas where solution could be mentioned
        sentences.forEach((sentence, index) => {
          const hasOpportunity = ['problem', 'issue', 'challenge', 'need', 'solution', 'tool'].some(
            keyword => sentence.toLowerCase().includes(keyword)
          );
          
          if (hasOpportunity) {
            const startIndex = content.indexOf(sentence.trim());
            if (startIndex !== -1) {
              highlights.push({
                id: `solution-${suggestionIndex}-${index}`,
                startIndex,
                endIndex: startIndex + sentence.length,
                text: sentence.trim(),
                type: 'solution',
                priority: suggestion.priority,
                suggestion: {
                  title: suggestion.title,
                  description: 'Consider naturally mentioning your solution in this context',
                  category: suggestion.category
                }
              });
            }
          }
        });
        break;
        
      default:
        // Generic content improvement
        if (sentences.length > 0) {
          const firstSentence = sentences[0];
          const startIndex = content.indexOf(firstSentence.trim());
          if (startIndex !== -1) {
            highlights.push({
              id: `generic-${suggestionIndex}`,
              startIndex,
              endIndex: startIndex + firstSentence.length,
              text: firstSentence.trim(),
              type: 'serp',
              priority: suggestion.priority,
              suggestion: {
                title: suggestion.title,
                description: suggestion.description,
                category: suggestion.category
              }
            });
          }
        }
        break;
    }
  });
  
  return {
    highlights: removeOverlappingHighlights(highlights),
    originalContent: content
  };
};

/**
 * Remove overlapping highlights, keeping higher priority ones
 */
const removeOverlappingHighlights = (highlights: ContentHighlight[]): ContentHighlight[] => {
  const cleaned: ContentHighlight[] = [];
  const sortedHighlights = highlights.sort((a, b) => a.startIndex - b.startIndex);
  
  sortedHighlights.forEach(highlight => {
    const overlapping = cleaned.find(existing => 
      (highlight.startIndex >= existing.startIndex && highlight.startIndex < existing.endIndex) ||
      (highlight.endIndex > existing.startIndex && highlight.endIndex <= existing.endIndex) ||
      (highlight.startIndex <= existing.startIndex && highlight.endIndex >= existing.endIndex)
    );
    
    if (!overlapping) {
      cleaned.push(highlight);
    } else {
      // Keep the higher priority highlight
      const currentPriorityValue = getPriorityValue(highlight.priority);
      const existingPriorityValue = getPriorityValue(overlapping.priority);
      
      if (currentPriorityValue > existingPriorityValue) {
        const index = cleaned.indexOf(overlapping);
        cleaned[index] = highlight;
      }
    }
  });
  
  return cleaned;
};

const getPriorityValue = (priority: 'high' | 'medium' | 'low'): number => {
  switch (priority) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};
