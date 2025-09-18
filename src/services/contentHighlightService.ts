import { toast } from 'sonner';

export interface ContentLocation {
  paragraph: number;
  sentence?: number;
  startIndex: number;
  endIndex: number;
  originalText: string;
}

export interface SuggestionReplacement {
  location: ContentLocation;
  replacementText: string;
  reason: string;
  before: string;
  after: string;
}

export interface EnhancedSuggestion {
  id: string;
  title: string;
  replacements: SuggestionReplacement[];
  impact: 'high' | 'medium' | 'low';
  category: 'seo' | 'readability' | 'compliance' | 'solution';
}

export class ContentHighlightService {
  /**
   * Parse AI suggestions to extract specific text replacements
   */
  static parseSuggestions(aiResponse: string): EnhancedSuggestion[] {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, parse as structured text
      return this.parseTextSuggestions(aiResponse);
    }
    
    return [];
  }

  /**
   * Parse text-based suggestions into structured format
   */
  private static parseTextSuggestions(text: string): EnhancedSuggestion[] {
    const suggestions: EnhancedSuggestion[] = [];
    const sections = text.split(/---|\n\n/).filter(s => s.trim());
    
    let suggestionId = 1;
    
    for (const section of sections) {
      const lines = section.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 3) continue;
      
      const titleMatch = lines[0].match(/(?:SUGGESTION|FIX|REPLACE):\s*(.+)/i);
      const beforeMatch = section.match(/BEFORE:\s*"([^"]+)"/i);
      const afterMatch = section.match(/AFTER:\s*"([^"]+)"/i);
      const reasonMatch = section.match(/REASON:\s*(.+)/i);
      
      if (titleMatch && beforeMatch && afterMatch) {
        suggestions.push({
          id: `suggestion-${suggestionId++}`,
          title: titleMatch[1],
          replacements: [{
            location: {
              paragraph: 0,
              startIndex: 0,
              endIndex: beforeMatch[1].length,
              originalText: beforeMatch[1]
            },
            replacementText: afterMatch[1],
            reason: reasonMatch?.[1] || 'AI suggestion',
            before: beforeMatch[1],
            after: afterMatch[1]
          }],
          impact: this.determineImpact(titleMatch[1]),
          category: this.categorizeByTitle(titleMatch[1])
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Find and highlight text in content
   */
  static findTextLocations(content: string, searchText: string): ContentLocation[] {
    const locations: ContentLocation[] = [];
    const paragraphs = content.split('\n\n');
    
    paragraphs.forEach((paragraph, pIndex) => {
      let searchIndex = 0;
      let foundIndex = paragraph.indexOf(searchText, searchIndex);
      
      while (foundIndex !== -1) {
        locations.push({
          paragraph: pIndex,
          startIndex: foundIndex,
          endIndex: foundIndex + searchText.length,
          originalText: searchText
        });
        
        searchIndex = foundIndex + 1;
        foundIndex = paragraph.indexOf(searchText, searchIndex);
      }
    });
    
    return locations;
  }

  /**
   * Apply text replacement in content
   */
  static applyReplacement(content: string, replacement: SuggestionReplacement): string {
    const { location, replacementText } = replacement;
    const paragraphs = content.split('\n\n');
    
    if (location.paragraph >= 0 && location.paragraph < paragraphs.length) {
      const paragraph = paragraphs[location.paragraph];
      const before = paragraph.substring(0, location.startIndex);
      const after = paragraph.substring(location.endIndex);
      
      paragraphs[location.paragraph] = before + replacementText + after;
      return paragraphs.join('\n\n');
    }
    
    // Fallback: simple text replacement
    return content.replace(location.originalText, replacementText);
  }

  /**
   * Apply multiple replacements to content
   */
  static applyMultipleReplacements(content: string, replacements: SuggestionReplacement[]): string {
    let updatedContent = content;
    
    // Sort by position (descending) to avoid index shifting issues
    const sortedReplacements = [...replacements].sort((a, b) => {
      if (a.location.paragraph !== b.location.paragraph) {
        return b.location.paragraph - a.location.paragraph;
      }
      return b.location.startIndex - a.location.startIndex;
    });
    
    for (const replacement of sortedReplacements) {
      updatedContent = this.applyReplacement(updatedContent, replacement);
    }
    
    return updatedContent;
  }

  /**
   * Generate highlighted HTML for preview
   */
  static generateHighlightedPreview(content: string, replacement: SuggestionReplacement): {
    before: string;
    after: string;
  } {
    const { location, replacementText } = replacement;
    const paragraphs = content.split('\n\n');
    
    if (location.paragraph >= 0 && location.paragraph < paragraphs.length) {
      const paragraph = paragraphs[location.paragraph];
      const beforeText = paragraph.substring(0, location.startIndex);
      const highlightedText = paragraph.substring(location.startIndex, location.endIndex);
      const afterText = paragraph.substring(location.endIndex);
      
      const before = beforeText + `<mark class="bg-red-200 text-red-800">${highlightedText}</mark>` + afterText;
      const after = beforeText + `<mark class="bg-green-200 text-green-800">${replacementText}</mark>` + afterText;
      
      return { before, after };
    }
    
    return {
      before: content.replace(location.originalText, `<mark class="bg-red-200 text-red-800">${location.originalText}</mark>`),
      after: content.replace(location.originalText, `<mark class="bg-green-200 text-green-800">${replacementText}</mark>`)
    };
  }

  private static determineImpact(title: string): 'high' | 'medium' | 'low' {
    const highImpactKeywords = ['critical', 'seo', 'keyword', 'meta', 'h1', 'title'];
    const mediumImpactKeywords = ['readability', 'structure', 'cta', 'solution'];
    
    const lowerTitle = title.toLowerCase();
    
    if (highImpactKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'high';
    }
    if (mediumImpactKeywords.some(keyword => lowerTitle.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private static categorizeByTitle(title: string): 'seo' | 'readability' | 'compliance' | 'solution' {
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes('seo') || lowerTitle.includes('keyword') || lowerTitle.includes('meta')) {
      return 'seo';
    }
    if (lowerTitle.includes('read') || lowerTitle.includes('structure') || lowerTitle.includes('heading')) {
      return 'readability';
    }
    if (lowerTitle.includes('solution') || lowerTitle.includes('product') || lowerTitle.includes('feature')) {
      return 'solution';
    }
    return 'compliance';
  }
}

export default ContentHighlightService;