
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
      snippet: result.snippet || '', // Always provide a string, even if empty
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
      source: item.source || '', // Always provide a string, even if empty
      answer: item.answer || '' // Added answer field
    }));
    
    // Use existing entities or create mock ones
    const entities = data.entities ? data.entities.map((entity: any) => ({
      name: entity.name || '',
      type: entity.type || 'unknown',
      importance: entity.importance || 5,
      description: entity.description || ''
    })) : [];
    
    // Extract headings from the results or use existing ones, ensuring correct type for level
    const headings = data.headings ? data.headings.map((heading: any) => {
      const level = heading.level || 'h2';
      // Ensure level is one of the allowed values
      const validLevel = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2';
      return {
        text: heading.text || '',
        level: validLevel as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
        subtext: heading.subtext || '',
        type: heading.type || ''
      };
    }) : [];
    
    // Use existing content gaps or create mock ones
    const contentGaps = data.contentGaps ? data.contentGaps.map((gap: any) => ({
      topic: gap.topic || '',
      description: gap.description || ''
    })) : [];
    
    // Extract keywords from the results
    const keywords = data.keywords || [keyword];
    
    // Use the searchCountries if provided
    const searchCountries = data.searchCountries || ['us'];
    
    // Check if this is mock data
    const isMockData = !!data.isMockData;

    // Handle featured snippets if available
    const featuredSnippets = data.featuredSnippets ? data.featuredSnippets.map((snippet: any) => ({
      content: snippet.content || '',
      source: snippet.source || '',
      type: snippet.type || ''
    })) : [];
    
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
      isMockData,
      featuredSnippets,
      recommendations: data.recommendations || []
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
