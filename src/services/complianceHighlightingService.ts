import { ContentHighlight, HighlightAnalysisResult } from './contentHighlightingService';
import { ComplianceAnalysisResult, ComplianceViolation } from '@/types/contentCompliance';

/**
 * Rule-based compliance highlighting service that generates precise highlights
 * based on compliance violations and compliant areas
 */
export const analyzeContentForComplianceHighlights = (
  content: string,
  complianceResult: ComplianceAnalysisResult
): HighlightAnalysisResult => {
  const highlights: ContentHighlight[] = [];
  
  // Generate highlights from violations
  complianceResult.violations.forEach(violation => {
    const violationHighlights = generateHighlightsFromViolation(content, violation);
    highlights.push(...violationHighlights);
  });

  // Generate compliant area highlights (green highlights for good examples)
  const compliantHighlights = generateCompliantAreaHighlights(content, complianceResult);
  highlights.push(...compliantHighlights);

  // Sort by position and remove overlaps
  const sortedHighlights = highlights.sort((a, b) => a.startIndex - b.startIndex);
  const cleanedHighlights = removeOverlappingHighlights(sortedHighlights);

  return {
    highlights: cleanedHighlights,
    originalContent: content
  };
};

/**
 * Generate highlights for specific compliance violations
 */
const generateHighlightsFromViolation = (
  content: string,
  violation: ComplianceViolation
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  switch (violation.category) {
    case 'keyword':
      highlights.push(...generateKeywordViolationHighlights(content, violation));
      break;
    case 'serp':
      highlights.push(...generateSerpViolationHighlights(content, violation));
      break;
    case 'solution':
      highlights.push(...generateSolutionViolationHighlights(content, violation));
      break;
    case 'structure':
      highlights.push(...generateStructureViolationHighlights(content, violation));
      break;
  }

  return highlights;
};

/**
 * Generate highlights for keyword compliance violations
 */
const generateKeywordViolationHighlights = (
  content: string,
  violation: ComplianceViolation
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  if (violation.id.includes('density')) {
    // Highlight paragraphs with density issues
    const paragraphs = content.split(/\n\s*\n/);
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim().length > 50) {
        const startIndex = content.indexOf(paragraph);
        highlights.push(createHighlight(
          startIndex,
          startIndex + paragraph.length,
          paragraph,
          'non-compliant',
          violation
        ));
      }
    });
  }

  if (violation.id.includes('placement')) {
    // Highlight specific placement areas (H1, first paragraph, conclusion)
    const h1Match = content.match(/^#{1}\s+(.+)$/m);
    if (h1Match && violation.message.includes('H1')) {
      highlights.push(createHighlight(
        h1Match.index!,
        h1Match.index! + h1Match[0].length,
        h1Match[0],
        'non-compliant',
        violation
      ));
    }

    const firstParagraph = content.split(/\n\s*\n/)[0];
    if (firstParagraph && violation.message.includes('first')) {
      highlights.push(createHighlight(
        0,
        firstParagraph.length,
        firstParagraph,
        'non-compliant',
        violation
      ));
    }
  }

  if (violation.id.includes('variations')) {
    // Find sentences that could use keyword variations
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    sentences.slice(0, 3).forEach(sentence => {
      const sentenceStart = content.indexOf(sentence.trim());
      if (sentenceStart !== -1) {
        highlights.push(createHighlight(
          sentenceStart,
          sentenceStart + sentence.length,
          sentence.trim(),
          'partially-compliant',
          violation
        ));
      }
    });
  }

  return highlights;
};

/**
 * Generate highlights for SERP compliance violations
 */
const generateSerpViolationHighlights = (
  content: string,
  violation: ComplianceViolation
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  if (violation.id.includes('headings')) {
    // Highlight existing headings that don't match SERP selections
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      highlights.push(createHighlight(
        match.index,
        match.index + match[0].length,
        match[0],
        'partially-compliant',
        violation
      ));
    }
  }

  if (violation.id.includes('gaps')) {
    // Highlight areas where content gaps should be filled
    const paragraphs = content.split(/\n\s*\n/);
    const shortParagraphs = paragraphs.filter(p => p.trim().length < 100);
    shortParagraphs.forEach(paragraph => {
      const startIndex = content.indexOf(paragraph);
      if (startIndex !== -1) {
        highlights.push(createHighlight(
          startIndex,
          startIndex + paragraph.length,
          paragraph,
          'non-compliant',
          violation
        ));
      }
    });
  }

  if (violation.id.includes('paa')) {
    // Highlight sections that could answer PAA questions
    const headingRegex = /^#{2,6}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      highlights.push(createHighlight(
        match.index,
        match.index + match[0].length,
        match[0],
        'non-compliant',
        violation
      ));
    }
  }

  return highlights;
};

/**
 * Generate highlights for solution integration violations
 */
const generateSolutionViolationHighlights = (
  content: string,
  violation: ComplianceViolation
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  if (violation.id.includes('frequency')) {
    // Find opportunities for solution mentions
    const solutionContexts = ['problem', 'challenge', 'difficulty', 'issue', 'solution', 'help', 'tool'];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach(sentence => {
      const hasContext = solutionContexts.some(context => 
        sentence.toLowerCase().includes(context)
      );
      
      if (hasContext) {
        const startIndex = content.indexOf(sentence.trim());
        if (startIndex !== -1) {
          highlights.push(createHighlight(
            startIndex,
            startIndex + sentence.length,
            sentence.trim(),
            'partially-compliant',
            violation
          ));
        }
      }
    });
  }

  if (violation.id.includes('cta')) {
    // Highlight the conclusion area for CTA placement
    const contentLength = content.length;
    const conclusionStart = Math.floor(contentLength * 0.85);
    const conclusionText = content.substring(conclusionStart);
    
    highlights.push(createHighlight(
      conclusionStart,
      contentLength,
      conclusionText,
      'non-compliant',
      violation
    ));
  }

  return highlights;
};

/**
 * Generate highlights for structure compliance violations
 */
const generateStructureViolationHighlights = (
  content: string,
  violation: ComplianceViolation
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  if (violation.id.includes('outline')) {
    // Highlight sections that don't match outline
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      highlights.push(createHighlight(
        match.index,
        match.index + match[0].length,
        match[0],
        'non-compliant',
        violation
      ));
    }
  }

  if (violation.id.includes('readability')) {
    // Highlight complex sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    const complexSentences = sentences.filter(s => s.split(/\s+/).length > 25);
    
    complexSentences.forEach(sentence => {
      const startIndex = content.indexOf(sentence.trim());
      if (startIndex !== -1) {
        highlights.push(createHighlight(
          startIndex,
          startIndex + sentence.length,
          sentence.trim(),
          'non-compliant',
          violation
        ));
      }
    });
  }

  return highlights;
};

/**
 * Generate highlights for compliant areas (green highlights)
 */
const generateCompliantAreaHighlights = (
  content: string,
  complianceResult: ComplianceAnalysisResult
): ContentHighlight[] => {
  const highlights: ContentHighlight[] = [];

  // Highlight good keyword usage examples
  if (complianceResult.keyword.score > 70) {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      // Check if heading contains keywords (simplified check)
      const hasKeyword = match[1].toLowerCase().includes('keyword'); // Placeholder logic
      if (hasKeyword) {
        highlights.push({
          id: `compliant-heading-${match.index}`,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          text: match[0],
          type: 'compliant',
          priority: 'low',
          complianceStatus: 'compliant',
          complianceCategory: 'keyword',
          suggestion: {
            title: 'Good Keyword Usage',
            description: 'This heading demonstrates proper keyword integration',
            category: 'keyword'
          }
        });
      }
    }
  }

  return highlights;
};

/**
 * Create a highlight object from violation data
 */
const createHighlight = (
  startIndex: number,
  endIndex: number,
  text: string,
  status: 'compliant' | 'partially-compliant' | 'non-compliant',
  violation: ComplianceViolation
): ContentHighlight => {
  const priorityMap = {
    'critical': 'high' as const,
    'major': 'high' as const,
    'minor': 'medium' as const
  };

  return {
    id: `compliance-${violation.id}-${startIndex}`,
    startIndex,
    endIndex,
    text,
    type: status,
    priority: priorityMap[violation.severity] || 'medium',
    complianceStatus: status,
    violationId: violation.id,
    complianceCategory: violation.category,
    suggestion: {
      title: violation.message,
      description: violation.suggestion,
      category: violation.category
    }
  };
};

/**
 * Remove overlapping highlights, prioritizing higher severity
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