
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Process and normalize API response to ensure consistent structure
 */
export function processSerpResponse(response: any): SerpAnalysisResult {
  if (!response) {
    throw new Error('Invalid SERP response data');
  }

  // Ensure response has expected structure and the required keyword field
  const processedData: SerpAnalysisResult = {
    keyword: response.keyword || '',
    searchVolume: response.searchVolume || 0,
    competitionScore: response.competitionScore || 0,
    keywordDifficulty: response.keywordDifficulty || 0,
    topResults: response.topResults ? response.topResults.map((result: any, index: number) => ({
      ...result,
      position: result.position || index + 1 // Ensure position exists
    })) : [],
    relatedSearches: response.relatedSearches ? response.relatedSearches.map((search: any) => ({
      ...search,
      volume: search.volume || 0 // Ensure volume exists
    })) : [],
    peopleAlsoAsk: response.peopleAlsoAsk ? response.peopleAlsoAsk.map((item: any) => ({
      ...item,
      answer: item.answer || 'No answer available' // Ensure answer exists
    })) : [],
    featuredSnippets: response.featuredSnippets ? response.featuredSnippets.map((snippet: any) => ({
      ...snippet,
      type: snippet.type || 'general' // Ensure type exists
    })) : []
  };
  
  return processedData;
}

/**
 * Validates keyword input
 */
export function validateKeywordInput(keyword: string): string {
  if (!keyword) {
    throw new Error('Keyword cannot be empty');
  }
  
  // Basic sanitization
  return keyword.trim().toLowerCase();
}
