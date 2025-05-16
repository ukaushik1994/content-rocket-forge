
import { SerpAnalysisResult } from './types';

/**
 * Process and normalize raw SERP API response data
 */
export function processSerpResponse(data: any): SerpAnalysisResult {
  try {
    // Extract the keyword from the search query
    const keyword = data.search_information?.query || data.keyword || '';
    
    // Extract organic results
    const organicResults = data.organic_results || [];
    const topResults = organicResults.map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: index + 1
    }));
    
    // Extract related searches
    const relatedSearches = (data.related_searches || []).map((item: any) => ({
      query: item.query || '',
      volume: Math.floor(Math.random() * 1000) + 100 // Mock volume data
    }));
    
    // Extract people also ask questions
    const peopleAlsoAsk = (data.related_questions || []).map((item: any) => ({
      question: item.question || '',
      source: item.source || ''
    }));
    
    // Use existing entities or create mock ones
    const entities = data.entities || [];
    
    // Extract headings from the results or use existing ones
    const headings = data.headings || [];
    
    // Use existing content gaps or create mock ones
    const contentGaps = data.contentGaps || [];
    
    // Extract keywords from the results
    const keywords = data.keywords || [keyword];
    
    // Use the searchCountries if provided
    const searchCountries = data.searchCountries || ['us'];
    
    // Check if this is mock data
    const isMockData = !!data.isMockData;
    
    return {
      keyword,
      searchVolume: data.search_information?.total_results || data.searchVolume || 0,
      competitionScore: data.competitionScore || 0.5,
      keywordDifficulty: data.keywordDifficulty || 50,
      topResults,
      relatedSearches,
      peopleAlsoAsk,
      entities,
      headings,
      contentGaps,
      keywords,
      searchCountries,
      isMockData
    };
  } catch (error) {
    console.error('Error processing SERP response:', error);
    // Return a minimal valid result
    return {
      keyword: data.keyword || 'unknown',
      isMockData: true,
      searchCountries: ['us']
    };
  }
}
