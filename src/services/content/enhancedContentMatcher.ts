/**
 * Enhanced content matching service with fuzzy text matching and smart location detection
 * Addresses the issue of rigid text matching in ContentHighlightService
 */

export interface ContentLocation {
  paragraph: number;
  sentence: number;
  startIndex: number;
  endIndex: number;
  originalText: string;
  confidence: number; // 0-1 confidence score
}

export interface TextSearchResult {
  found: boolean;
  locations: ContentLocation[];
  bestMatch?: ContentLocation;
  alternatives?: ContentLocation[];
}

export interface ContentStructure {
  paragraphs: string[];
  sentences: string[][];
  headings: { level: number; text: string; index: number }[];
  totalLength: number;
}

export class EnhancedContentMatcher {
  private static instance: EnhancedContentMatcher;
  
  static getInstance(): EnhancedContentMatcher {
    if (!EnhancedContentMatcher.instance) {
      EnhancedContentMatcher.instance = new EnhancedContentMatcher();
    }
    return EnhancedContentMatcher.instance;
  }

  /**
   * Analyzes content structure for better matching context
   */
  analyzeContentStructure(content: string): ContentStructure {
    // Split into paragraphs
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Split each paragraph into sentences
    const sentences = paragraphs.map(paragraph => 
      paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim())
    );

    // Extract headings (markdown or HTML)
    const headings: { level: number; text: string; index: number }[] = [];
    
    // Markdown headings
    const markdownHeadings = content.match(/^#{1,6}\s+(.+)$/gm);
    markdownHeadings?.forEach(heading => {
      const level = heading.match(/^#+/)?.[0].length || 1;
      const text = heading.replace(/^#+\s+/, '').trim();
      const index = content.indexOf(heading);
      headings.push({ level, text, index });
    });

    // HTML headings
    const htmlHeadings = content.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
    htmlHeadings?.forEach(heading => {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '1');
      const text = heading.replace(/<[^>]+>/g, '').trim();
      const index = content.indexOf(heading);
      headings.push({ level, text, index });
    });

    return {
      paragraphs,
      sentences,
      headings: headings.sort((a, b) => a.index - b.index),
      totalLength: content.length
    };
  }

  /**
   * Finds text in content with multiple matching strategies
   */
  findTextInContent(content: string, searchText: string, options: {
    exactMatch?: boolean;
    fuzzyThreshold?: number;
    maxResults?: number;
    includePartialMatches?: boolean;
  } = {}): TextSearchResult {
    const {
      exactMatch = false,
      fuzzyThreshold = 0.7,
      maxResults = 5,
      includePartialMatches = true
    } = options;

    const structure = this.analyzeContentStructure(content);
    const locations: ContentLocation[] = [];

    // Strategy 1: Exact text matching
    if (!exactMatch || locations.length === 0) {
      const exactMatches = this.findExactMatches(content, searchText, structure);
      locations.push(...exactMatches);
    }

    // Strategy 2: Fuzzy matching if exact matching fails or is disabled
    if (!exactMatch && locations.length === 0) {
      const fuzzyMatches = this.findFuzzyMatches(content, searchText, structure, fuzzyThreshold);
      locations.push(...fuzzyMatches);
    }

    // Strategy 3: Partial word matching
    if (includePartialMatches && locations.length === 0) {
      const partialMatches = this.findPartialMatches(content, searchText, structure);
      locations.push(...partialMatches);
    }

    // Strategy 4: Semantic matching (keywords/concepts)
    if (locations.length === 0) {
      const semanticMatches = this.findSemanticMatches(content, searchText, structure);
      locations.push(...semanticMatches);
    }

    // Sort by confidence and limit results
    const sortedLocations = locations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxResults);

    return {
      found: sortedLocations.length > 0,
      locations: sortedLocations,
      bestMatch: sortedLocations[0],
      alternatives: sortedLocations.slice(1)
    };
  }

  /**
   * Finds exact text matches
   */
  private findExactMatches(content: string, searchText: string, structure: ContentStructure): ContentLocation[] {
    const locations: ContentLocation[] = [];
    let searchIndex = 0;

    while (true) {
      const index = content.indexOf(searchText, searchIndex);
      if (index === -1) break;

      const location = this.createLocationFromIndex(index, searchText.length, content, structure);
      if (location) {
        location.confidence = 1.0; // Perfect match
        locations.push(location);
      }

      searchIndex = index + 1;
    }

    return locations;
  }

  /**
   * Finds fuzzy matches using string similarity
   */
  private findFuzzyMatches(
    content: string, 
    searchText: string, 
    structure: ContentStructure, 
    threshold: number
  ): ContentLocation[] {
    const locations: ContentLocation[] = [];
    const searchWords = this.tokenize(searchText);
    
    // Check each sentence for fuzzy matches
    structure.sentences.forEach((paragraphSentences, pIndex) => {
      paragraphSentences.forEach((sentence, sIndex) => {
        const similarity = this.calculateSimilarity(searchText, sentence);
        
        if (similarity >= threshold) {
          // Find the sentence position in the full content
          const sentenceIndex = this.findSentenceIndex(content, sentence, structure, pIndex, sIndex);
          
          if (sentenceIndex !== -1) {
            const location: ContentLocation = {
              paragraph: pIndex + 1,
              sentence: sIndex + 1,
              startIndex: sentenceIndex,
              endIndex: sentenceIndex + sentence.length,
              originalText: sentence,
              confidence: similarity
            };
            
            locations.push(location);
          }
        }
      });
    });

    return locations;
  }

  /**
   * Finds partial word matches
   */
  private findPartialMatches(content: string, searchText: string, structure: ContentStructure): ContentLocation[] {
    const locations: ContentLocation[] = [];
    const searchWords = this.tokenize(searchText);
    
    // Look for sentences containing most of the search words
    structure.sentences.forEach((paragraphSentences, pIndex) => {
      paragraphSentences.forEach((sentence, sIndex) => {
        const sentenceWords = this.tokenize(sentence);
        const matchingWords = searchWords.filter(word => 
          sentenceWords.some(sWord => 
            sWord.toLowerCase().includes(word.toLowerCase()) ||
            word.toLowerCase().includes(sWord.toLowerCase())
          )
        );

        const matchRatio = matchingWords.length / searchWords.length;
        
        if (matchRatio >= 0.5) { // At least 50% of words match
          const sentenceIndex = this.findSentenceIndex(content, sentence, structure, pIndex, sIndex);
          
          if (sentenceIndex !== -1) {
            const location: ContentLocation = {
              paragraph: pIndex + 1,
              sentence: sIndex + 1,
              startIndex: sentenceIndex,
              endIndex: sentenceIndex + sentence.length,
              originalText: sentence,
              confidence: matchRatio * 0.7 // Reduce confidence for partial matches
            };
            
            locations.push(location);
          }
        }
      });
    });

    return locations;
  }

  /**
   * Finds semantic matches based on keywords and concepts
   */
  private findSemanticMatches(content: string, searchText: string, structure: ContentStructure): ContentLocation[] {
    const locations: ContentLocation[] = [];
    const searchKeywords = this.extractKeywords(searchText);
    
    // Look for sentences with semantic similarity
    structure.sentences.forEach((paragraphSentences, pIndex) => {
      paragraphSentences.forEach((sentence, sIndex) => {
        const sentenceKeywords = this.extractKeywords(sentence);
        const commonKeywords = searchKeywords.filter(keyword => 
          sentenceKeywords.includes(keyword)
        );

        if (commonKeywords.length > 0) {
          const sentenceIndex = this.findSentenceIndex(content, sentence, structure, pIndex, sIndex);
          
          if (sentenceIndex !== -1) {
            const confidence = commonKeywords.length / searchKeywords.length * 0.5; // Lower confidence for semantic matches
            
            const location: ContentLocation = {
              paragraph: pIndex + 1,
              sentence: sIndex + 1,
              startIndex: sentenceIndex,
              endIndex: sentenceIndex + sentence.length,
              originalText: sentence,
              confidence
            };
            
            locations.push(location);
          }
        }
      });
    });

    return locations;
  }

  /**
   * Creates a location object from a character index
   */
  private createLocationFromIndex(
    index: number, 
    length: number, 
    content: string, 
    structure: ContentStructure
  ): ContentLocation | null {
    // Find which paragraph and sentence this index belongs to
    let currentIndex = 0;
    
    for (let pIndex = 0; pIndex < structure.paragraphs.length; pIndex++) {
      const paragraph = structure.paragraphs[pIndex];
      
      if (index >= currentIndex && index < currentIndex + paragraph.length) {
        // Found the paragraph, now find the sentence
        const paragraphSentences = structure.sentences[pIndex];
        let sentenceStart = currentIndex;
        
        for (let sIndex = 0; sIndex < paragraphSentences.length; sIndex++) {
          const sentence = paragraphSentences[sIndex];
          
          if (index >= sentenceStart && index < sentenceStart + sentence.length) {
            return {
              paragraph: pIndex + 1,
              sentence: sIndex + 1,
              startIndex: index,
              endIndex: index + length,
              originalText: content.substring(index, index + length),
              confidence: 1.0
            };
          }
          
          sentenceStart += sentence.length + 1; // +1 for sentence separator
        }
        
        break;
      }
      
      currentIndex += paragraph.length + 2; // +2 for paragraph separator
    }

    return null;
  }

  /**
   * Finds the index of a sentence in the full content
   */
  private findSentenceIndex(
    content: string, 
    sentence: string, 
    structure: ContentStructure, 
    pIndex: number, 
    sIndex: number
  ): number {
    // Calculate approximate position based on structure
    let approximateIndex = 0;
    
    // Add previous paragraphs
    for (let i = 0; i < pIndex; i++) {
      approximateIndex += structure.paragraphs[i].length + 2; // +2 for paragraph separator
    }
    
    // Add previous sentences in current paragraph
    for (let i = 0; i < sIndex; i++) {
      approximateIndex += structure.sentences[pIndex][i].length + 1; // +1 for sentence separator
    }
    
    // Look for the sentence around this approximate position
    const searchStart = Math.max(0, approximateIndex - 100);
    const searchEnd = Math.min(content.length, approximateIndex + sentence.length + 100);
    const searchArea = content.substring(searchStart, searchEnd);
    
    const relativeIndex = searchArea.indexOf(sentence);
    
    if (relativeIndex !== -1) {
      return searchStart + relativeIndex;
    }
    
    // Fallback: search in the entire content
    return content.indexOf(sentence);
  }

  /**
   * Calculates text similarity using a simple algorithm
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = this.tokenize(text1);
    const words2 = this.tokenize(text2);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = Math.max(words1.length, words2.length);
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  /**
   * Tokenizes text into words
   */
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out short words
  }

  /**
   * Extracts keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    return this.tokenize(text)
      .filter(word => !commonWords.has(word) && word.length > 3)
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * Applies a text replacement with smart positioning
   */
  applySmartReplacement(
    content: string, 
    originalText: string, 
    replacementText: string, 
    preferredLocation?: ContentLocation
  ): { success: boolean; newContent: string; actualLocation?: ContentLocation } {
    // Try to find the text using enhanced matching
    const searchResult = this.findTextInContent(content, originalText, {
      exactMatch: false,
      fuzzyThreshold: 0.8,
      maxResults: 3
    });

    if (!searchResult.found || !searchResult.bestMatch) {
      console.warn(`❌ Could not find text for replacement: "${originalText}"`);
      return { success: false, newContent: content };
    }

    const location = preferredLocation || searchResult.bestMatch;
    
    // Apply the replacement
    const beforeText = content.substring(0, location.startIndex);
    const afterText = content.substring(location.endIndex);
    const newContent = beforeText + replacementText + afterText;

    console.log(`✅ Applied smart replacement at paragraph ${location.paragraph}, sentence ${location.sentence}`);
    
    return {
      success: true,
      newContent,
      actualLocation: {
        ...location,
        originalText: location.originalText,
        endIndex: location.startIndex + replacementText.length
      }
    };
  }
}