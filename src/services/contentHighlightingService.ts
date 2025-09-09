import { OptimizationSuggestion } from '@/components/content-builder/final-review/optimization/types';

export interface ContentHighlight {
  id: string;
  startIndex: number;
  endIndex: number;
  text: string;
  type: 'seo' | 'structure' | 'solution' | 'ai-detection' | 'serp';
  priority: 'high' | 'medium' | 'low';
  suggestion: {
    title: string;
    description: string;
    category: string;
  };
}

export interface HighlightAnalysisResult {
  highlights: ContentHighlight[];
  originalContent: string;
}

/**
 * Analyzes content and creates highlights based on selected optimization suggestions
 */
export const analyzeContentForHighlights = (
  content: string,
  suggestions: OptimizationSuggestion[],
  mainKeyword: string = '',
  targetKeywords: string[] = []
): HighlightAnalysisResult => {
  const highlights: ContentHighlight[] = [];
  
  suggestions.forEach((suggestion, index) => {
    const suggestionHighlights = identifyHighlightAreas(content, suggestion, mainKeyword, targetKeywords, index);
    highlights.push(...suggestionHighlights);
  });

  // Sort highlights by position to avoid overlapping
  highlights.sort((a, b) => a.startIndex - b.startIndex);
  
  // Remove overlapping highlights, keeping higher priority ones
  const cleanedHighlights = removeOverlappingHighlights(highlights);

  return {
    highlights: cleanedHighlights,
    originalContent: content
  };
};

/**
 * Identifies specific text areas that need improvement based on suggestion type
 */
const identifyHighlightAreas = (
  content: string,
  suggestion: OptimizationSuggestion,
  mainKeyword: string,
  targetKeywords: string[],
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  switch (suggestion.category) {
    case 'seo':
    case 'keywords':
      highlights.push(...findKeywordIssues(content, mainKeyword, targetKeywords, suggestion, suggestionIndex));
      break;
      
    case 'structure':
      highlights.push(...findStructureIssues(content, sentences, suggestion, suggestionIndex));
      break;
      
    case 'solution':
      highlights.push(...findSolutionIntegrationIssues(content, sentences, suggestion, suggestionIndex));
      break;
      
    case 'content':
      highlights.push(...findContentQualityIssues(content, sentences, suggestion, suggestionIndex));
      break;
      
    default:
      // Generic highlighting for other types
      highlights.push(...findGenericIssues(content, suggestion, suggestionIndex));
      break;
  }
  
  return highlights;
};

/**
 * Find keyword-related issues in content
 */
const findKeywordIssues = (
  content: string,
  mainKeyword: string,
  targetKeywords: string[],
  suggestion: OptimizationSuggestion,
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  const allKeywords = [mainKeyword, ...targetKeywords].filter(k => k.length > 0);
  
  // Check for missing keywords in important sections
  const paragraphs = content.split(/\n\s*\n/);
  
  paragraphs.forEach((paragraph, pIndex) => {
    const paragraphStart = content.indexOf(paragraph);
    
    // Highlight first paragraph if it lacks main keyword
    if (pIndex === 0 && mainKeyword && !paragraph.toLowerCase().includes(mainKeyword.toLowerCase())) {
      const endIndex = Math.min(paragraphStart + paragraph.length, paragraphStart + 150);
      highlights.push({
        id: `keyword-${suggestionIndex}-${pIndex}`,
        startIndex: paragraphStart,
        endIndex: endIndex,
        text: content.substring(paragraphStart, endIndex),
        type: 'seo',
        priority: suggestion.priority,
        suggestion: {
          title: suggestion.title,
          description: `Add main keyword \"${mainKeyword}\" to improve SEO relevance`,
          category: suggestion.category
        }
      });
    }
  });
  
  // Highlight headings without keywords
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1];
    const hasKeyword = allKeywords.some(keyword => 
      heading.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (!hasKeyword && allKeywords.length > 0) {
      highlights.push({
        id: `heading-keyword-${suggestionIndex}-${match.index}`,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        text: match[0],
        type: 'seo',
        priority: suggestion.priority,
        suggestion: {
          title: suggestion.title,
          description: 'Consider adding target keywords to this heading',
          category: suggestion.category
        }
      });
    }
  }
  
  return highlights;
};

/**
 * Find structure-related issues
 */
const findStructureIssues = (
  content: string,
  sentences: string[],
  suggestion: OptimizationSuggestion,
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  
  // Check for long paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  
  paragraphs.forEach((paragraph, index) => {
    if (paragraph.length > 300) {
      const paragraphStart = content.indexOf(paragraph);
      highlights.push({
        id: `long-paragraph-${suggestionIndex}-${index}`,
        startIndex: paragraphStart,
        endIndex: paragraphStart + paragraph.length,
        text: paragraph,
        type: 'structure',
        priority: suggestion.priority,
        suggestion: {
          title: suggestion.title,
          description: 'Consider breaking this long paragraph into smaller, more digestible chunks',
          category: suggestion.category
        }
      });
    }
  });
  
  // Check for missing subheadings in long content
  if (content.length > 1000) {
    const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
    if (headingCount < 3) {
      // Highlight middle section that could use a subheading
      const middleStart = Math.floor(content.length * 0.3);
      const middleEnd = Math.floor(content.length * 0.7);
      
      highlights.push({
        id: `missing-subheading-${suggestionIndex}`,
        startIndex: middleStart,
        endIndex: middleEnd,
        text: content.substring(middleStart, middleEnd),
        type: 'structure',
        priority: suggestion.priority,
        suggestion: {
          title: suggestion.title,
          description: 'Consider adding subheadings to improve content structure and readability',
          category: suggestion.category
        }
      });
    }
  }
  
  return highlights;
};

/**
 * Find solution integration opportunities
 */
const findSolutionIntegrationIssues = (
  content: string,
  sentences: string[],
  suggestion: OptimizationSuggestion,
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  
  // Find areas where solution could be naturally integrated
  const solutionKeywords = ['solution', 'tool', 'platform', 'service', 'software', 'app'];
  
  sentences.forEach((sentence, index) => {
    const sentenceStart = content.indexOf(sentence.trim());
    if (sentenceStart === -1) return;
    
    const hasSolutionContext = solutionKeywords.some(keyword =>
      sentence.toLowerCase().includes(keyword)
    );
    
    if (hasSolutionContext) {
      highlights.push({
        id: `solution-opportunity-${suggestionIndex}-${index}`,
        startIndex: sentenceStart,
        endIndex: sentenceStart + sentence.length,
        text: sentence.trim(),
        type: 'solution',
        priority: suggestion.priority,
        suggestion: {
          title: suggestion.title,
          description: 'Consider mentioning your solution naturally in this context',
          category: suggestion.category
        }
      });
    }
  });
  
  return highlights;
};

/**
 * Find content quality issues
 */
const findContentQualityIssues = (
  content: string,
  sentences: string[],
  suggestion: OptimizationSuggestion,
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  
  // Find overly complex sentences
  sentences.forEach((sentence, index) => {
    if (sentence.length > 150) {
      const sentenceStart = content.indexOf(sentence.trim());
      if (sentenceStart !== -1) {
        highlights.push({
          id: `complex-sentence-${suggestionIndex}-${index}`,
          startIndex: sentenceStart,
          endIndex: sentenceStart + sentence.length,
          text: sentence.trim(),
          type: 'ai-detection',
          priority: suggestion.priority,
          suggestion: {
            title: suggestion.title,
            description: 'Consider simplifying this complex sentence for better readability',
            category: suggestion.category
          }
        });
      }
    }
  });
  
  return highlights;
};

/**
 * Generic issue highlighting for other suggestion types
 */
const findGenericIssues = (
  content: string,
  suggestion: OptimizationSuggestion,
  suggestionIndex: number
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];
  
  // Highlight first paragraph as a generic improvement area
  const firstParagraph = content.split(/\n\s*\n/)[0];
  if (firstParagraph) {
    highlights.push({
      id: `generic-${suggestionIndex}`,
      startIndex: 0,
      endIndex: firstParagraph.length,
      text: firstParagraph,
      type: 'serp',
      priority: suggestion.priority,
      suggestion: {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category
      }
    });
  }
  
  return highlights;
};

/**
 * Remove overlapping highlights, keeping higher priority ones
 */
const removeOverlappingHighlights = (highlights: ContentHighlight[]): ContentHighlight[] => {
  const cleaned: ContentHighlight[] = [];
  
  highlights.forEach(highlight => {
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
