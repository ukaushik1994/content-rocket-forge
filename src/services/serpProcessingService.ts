
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Process and normalize API response to ensure consistent structure
 */
export function processSerpResponse(response: any): SerpAnalysisResult {
  if (!response) {
    throw new Error('Invalid SERP response data');
  }

  console.log('Processing SERP response:', response);

  // Ensure response has expected structure and the required keyword field
  const processedData: SerpAnalysisResult = {
    keyword: response.keyword || '',
    searchVolume: response.searchVolume || 0,
    competitionScore: response.competitionScore || 0,
    keywordDifficulty: response.keywordDifficulty || 0,
    
    // Process top results
    topResults: Array.isArray(response.topResults) ? response.topResults.map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: result.position || index + 1 // Ensure position exists
    })) : [],
    
    // Process related searches
    relatedSearches: Array.isArray(response.relatedSearches) ? response.relatedSearches.map((search: any) => ({
      query: search.query || '',
      volume: search.volume || 0 // Ensure volume exists
    })) : [],
    
    // Process people also ask questions
    peopleAlsoAsk: Array.isArray(response.peopleAlsoAsk) ? response.peopleAlsoAsk.map((item: any) => ({
      question: item.question || '',
      source: item.source || '',
      answer: item.answer || 'No answer available' // Ensure answer exists
    })) : [],
    
    // Process featured snippets
    featuredSnippets: Array.isArray(response.featuredSnippets) ? response.featuredSnippets.map((snippet: any) => ({
      content: snippet.content || '',
      source: snippet.source || '',
      type: snippet.type || 'general' // Ensure type exists
    })) : [],
    
    // Process new fields - entities, headings, contentGaps
    entities: Array.isArray(response.entities) ? response.entities.map((entity: any) => ({
      name: entity.name || '',
      type: entity.type || 'unknown',
      importance: entity.importance || 5,
      description: entity.description || ''
    })) : [],
    
    headings: Array.isArray(response.headings) ? response.headings.map((heading: any) => ({
      text: heading.text || '',
      level: heading.level || 'h2',
      subtext: heading.subtext || '',
      type: heading.type || ''
    })) : [],
    
    contentGaps: Array.isArray(response.contentGaps) ? response.contentGaps.map((gap: any) => ({
      topic: gap.topic || '',
      description: gap.description || '',
      recommendation: gap.recommendation || '',
      content: gap.content || '',
      opportunity: gap.opportunity || '',
      source: gap.source || ''
    })) : [],
    
    // Include keywords - added this to fix the error
    keywords: Array.isArray(response.keywords) ? response.keywords : [],
    
    // Include recommendations if available
    recommendations: Array.isArray(response.recommendations) ? response.recommendations : []
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
