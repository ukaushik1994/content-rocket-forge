import { SerpAnalysisResult } from '@/types/serp';

/**
 * Validates and normalizes SERP data to ensure consistency across components
 */
export class SerpDataValidator {
  static validateAndNormalize(serpData: any): SerpAnalysisResult | null {
    if (!serpData) {
      console.warn('🔍 No SERP data provided for validation');
      return null;
    }

    console.log('🔍 Validating SERP data structure:', {
      hasKeyword: !!serpData.keyword,
      hasPeopleAlsoAsk: !!serpData.peopleAlsoAsk,
      peopleAlsoAskType: typeof serpData.peopleAlsoAsk,
      peopleAlsoAskLength: Array.isArray(serpData.peopleAlsoAsk) ? serpData.peopleAlsoAsk.length : 'not array',
      hasHeadings: !!serpData.headings,
      headingsType: typeof serpData.headings,
      headingsLength: Array.isArray(serpData.headings) ? serpData.headings.length : 'not array',
    });

    try {
      const normalized: SerpAnalysisResult = {
        keyword: serpData.keyword || '',
        searchVolume: this.normalizeNumber(serpData.searchVolume),
        keywordDifficulty: this.normalizeNumber(serpData.keywordDifficulty),
        competitionScore: this.normalizeNumber(serpData.competitionScore),
        
        // Validate and normalize questions - ensure they don't leak into headings
        peopleAlsoAsk: this.validateQuestions(serpData.peopleAlsoAsk),
        
        // Validate and normalize headings - ensure they're separate from questions
        headings: this.validateHeadings(serpData.headings),
        
        // Other arrays
        contentGaps: this.validateContentGaps(serpData.contentGaps),
        keywords: this.validateKeywords(serpData.keywords),
        relatedSearches: this.validateRelatedSearches(serpData.relatedSearches),
        topResults: this.validateTopResults(serpData.topResults),
        
        // Metadata
        volumeMetadata: serpData.volumeMetadata,
        isMockData: serpData.isMockData || false,
        dataQuality: serpData.dataQuality || 'standard'
      };

      console.log('✅ SERP data normalized successfully:', {
        questionsCount: normalized.peopleAlsoAsk?.length || 0,
        headingsCount: normalized.headings?.length || 0,
        contentGapsCount: normalized.contentGaps?.length || 0,
        keywordsCount: normalized.keywords?.length || 0
      });

      return normalized;
    } catch (error) {
      console.error('❌ Error validating SERP data:', error);
      return null;
    }
  }

  private static validateQuestions(questions: any): any[] {
    if (!Array.isArray(questions)) {
      console.warn('⚠️ Questions data is not an array:', typeof questions);
      return [];
    }

    const validQuestions = questions.filter((item, index) => {
      // Ensure it's a question object, not a heading
      if (!item || typeof item !== 'object') {
        console.warn(`⚠️ Invalid question object at index ${index}:`, item);
        return false;
      }

      // Must have a question property (not just text/title)
      if (!item.question && !item.query) {
        console.warn(`⚠️ Question missing 'question' property at index ${index}:`, item);
        return false;
      }

      // Exclude items that look like headings
      if (item.level || item.tag || (item.text && !item.question)) {
        console.warn(`⚠️ Excluding heading-like item from questions at index ${index}:`, item);
        return false;
      }

      return true;
    });

    console.log(`🔍 Questions validation: ${questions.length} total, ${validQuestions.length} valid`);
    return validQuestions;
  }

  private static validateHeadings(headings: any): any[] {
    if (!Array.isArray(headings)) {
      console.warn('⚠️ Headings data is not an array:', typeof headings);
      return [];
    }

    const validHeadings = headings.filter((item, index) => {
      if (!item) {
        console.warn(`⚠️ Invalid heading at index ${index}:`, item);
        return false;
      }

      // String headings are valid
      if (typeof item === 'string') {
        return true;
      }

      // Object headings should have text/title property, not question
      if (typeof item === 'object') {
        if (item.question) {
          console.warn(`⚠️ Excluding question-like item from headings at index ${index}:`, item);
          return false;
        }
        
        if (item.text || item.title || item.heading) {
          return true;
        }
      }

      console.warn(`⚠️ Invalid heading structure at index ${index}:`, item);
      return false;
    });

    console.log(`🔍 Headings validation: ${headings.length} total, ${validHeadings.length} valid`);
    return validHeadings;
  }

  private static validateContentGaps(contentGaps: any): any[] {
    if (!Array.isArray(contentGaps)) {
      return [];
    }
    return contentGaps.filter(gap => gap && (typeof gap === 'string' || gap.content || gap.topic));
  }

  private static validateKeywords(keywords: any): string[] {
    if (!Array.isArray(keywords)) {
      return [];
    }
    return keywords.filter(keyword => keyword && typeof keyword === 'string');
  }

  private static validateRelatedSearches(relatedSearches: any): any[] {
    if (!Array.isArray(relatedSearches)) {
      return [];
    }
    return relatedSearches.filter(search => 
      search && (typeof search === 'string' || search.query)
    );
  }

  private static validateTopResults(topResults: any): any[] {
    if (!Array.isArray(topResults)) {
      return [];
    }
    return topResults.filter(result => 
      result && result.title && result.snippet
    );
  }

  private static normalizeNumber(value: any): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
