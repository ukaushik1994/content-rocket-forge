
import { callApiProxy } from '@/services/apiProxyService';
import { toast } from 'sonner';
import { serpResultsCache } from '@/utils/cacheUtils';
import { processSerpResponse, validateKeywordInput } from './serpProcessingService';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';

// Maximum number of retry attempts for API calls
const MAX_RETRY_ATTEMPTS = 3;
// Delay between retry attempts in ms (exponential backoff)
const RETRY_DELAY_BASE = 300;

/**
 * Helper function to implement retry logic for API calls
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRY_ATTEMPTS): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, MAX_RETRY_ATTEMPTS - retries);
      console.log(`API call failed, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

/**
 * Analyze a keyword using the SERP API with caching
 */
export async function analyzeKeywordSerp(keyword: string): Promise<SerpAnalysisResult> {
  try {
    const validatedKeyword = validateKeywordInput(keyword);
    const cacheKey = `serp_${validatedKeyword}`;
    
    // Check cache first
    const cachedResult = serpResultsCache.get(cacheKey);
    if (cachedResult) {
      console.log(`Using cached SERP data for "${validatedKeyword}"`);
      return cachedResult;
    }
    
    console.log(`Fetching SERP data for "${validatedKeyword}"`);
    
    // Use retry logic for API call
    let response;
    try {
      response = await withRetry(() => 
        callApiProxy({
          service: 'serp',
          endpoint: 'search',
          params: { keyword: validatedKeyword, country: 'us' }
        })
      );
    } catch (error: any) {
      console.error('Error calling SERP API:', error);
      
      // Show error toast
      if (error.message?.includes('API key not configured')) {
        toast.error('SERP API key not configured. Please add your API key in Settings.');
      } else {
        toast.error(`SERP API Error: ${error.message || 'Failed to analyze keyword'}`);
      }
      
      // Return empty result
      return {
        keyword: validatedKeyword,
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: [],
        recommendations: []
      };
    }
    
    if (!response) {
      console.log('No response from SERP API');
      toast.error('No data received from SERP API. Please check your API key.');
      
      // Return empty result
      return {
        keyword: validatedKeyword,
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: [],
        recommendations: []
      };
    }
    
    // Handle error in response
    if (response.error) {
      console.error('Error in SERP API response:', response.error);
      toast.error(`SERP API Error: ${response.error}`);
      
      // Return empty result
      return {
        keyword: validatedKeyword,
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: [],
        recommendations: []
      };
    }
    
    // Process the response data
    const processedData = processSerpResponse(response);
    
    // Cache the result
    serpResultsCache.set(cacheKey, processedData);
    
    // Show success toast
    toast.success('SERP analysis completed successfully');
    
    return processedData;
  } catch (error: any) {
    console.error('Error analyzing keyword:', error);
    
    // Show error toast with specific message
    toast.error(`API Error: ${error.message || 'Failed to analyze keyword'}`);
    
    // Return empty result
    return {
      keyword,
      searchVolume: 0,
      competitionScore: 0,
      keywordDifficulty: 0,
      topResults: [],
      relatedSearches: [],
      peopleAlsoAsk: [],
      entities: [],
      headings: [],
      contentGaps: [],
      recommendations: []
    };
  }
}

/**
 * Search for keywords related to a query
 */
export async function searchKeywords(params: SerpSearchParams): Promise<any[]> {
  try {
    const { query } = params;
    const validatedQuery = validateKeywordInput(query);
    const cacheKey = `keywords_${validatedQuery}_${params.country || 'us'}_${params.num || 10}`;

    // Check cache first
    const cachedResult = serpResultsCache.get(cacheKey);
    if (cachedResult) {
      console.log(`Using cached keyword results for "${validatedQuery}"`);
      return cachedResult;
    }

    let response;
    try {
      response = await withRetry(() => 
        callApiProxy({
          service: 'serp',
          endpoint: 'keywords',
          params
        })
      );
    } catch (error: any) {
      console.error('Error calling keywords API:', error);
      
      // Show error toast with specific message
      if (error.message?.includes('API key not configured')) {
        toast.error('SERP API key not configured. Please add your API key in Settings.');
      } else {
        toast.error(`SERP API Error: ${error.message || 'Failed to search keywords'}`);
      }
      
      return [];
    }
    
    // Check if response exists and has results property
    if (!response || !response.results) {
      console.log('No results from keywords API');
      return [];
    }
    
    const results = response.results;
    
    // Cache results
    serpResultsCache.set(cacheKey, results);
    
    return results;
  } catch (error: any) {
    console.error('Error searching keywords:', error);
    
    // Show toast but don't break UI flow
    toast.error(`API Error: ${error.message || 'Failed to search keywords'}`);
    return [];
  }
}

/**
 * Analyze content for SEO recommendations
 */
export async function analyzeContent(content: string, keywords: string[] = []): Promise<SerpAnalysisResult> {
  if (!content) {
    throw new Error('Content cannot be empty');
  }
  
  try {
    // Generate a cache key based on content hash and keywords
    const contentHash = btoa(content.substring(0, 100) + (keywords.length > 0 ? keywords[0] : '')).replace(/[^a-zA-Z0-9]/g, '');
    const cacheKey = `content_analysis_${contentHash}`;
    
    // Check cache first
    const cachedResult = serpResultsCache.get(cacheKey);
    if (cachedResult) {
      console.log('Using cached content analysis results');
      return cachedResult;
    }
    
    let response;
    try {
      response = await withRetry(() => 
        callApiProxy({
          service: 'serp',
          endpoint: 'analyze',
          params: { content, keywords }
        })
      );
    } catch (error: any) {
      console.error('Error calling content analysis API:', error);
      
      // Show error toast with specific message
      if (error.message?.includes('API key not configured')) {
        toast.error('SERP API key not configured. Please add your API key in Settings.');
      } else {
        toast.error(`API Error: ${error.message || 'Failed to analyze content'}`);
      }
      
      // Return empty result
      return {
        keyword: keywords.length > 0 ? keywords[0] : '',
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        keywords: keywords,
        recommendations: [],
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: []
      };
    }
    
    if (!response) {
      console.log('No response from content analysis API');
      toast.error('No data received from API. Please check your API key.');
      
      // Return empty result
      return {
        keyword: keywords.length > 0 ? keywords[0] : '',
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        keywords: keywords,
        recommendations: [],
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: []
      };
    }
    
    // Check if the response contains an error
    if (response.error) {
      console.error('Error in content analysis response:', response.error);
      toast.error(`API Error: ${response.error}`);
      
      // Return empty result
      return {
        keyword: keywords.length > 0 ? keywords[0] : '',
        searchVolume: 0,
        competitionScore: 0,
        keywordDifficulty: 0,
        keywords: keywords,
        recommendations: [],
        topResults: [],
        relatedSearches: [],
        peopleAlsoAsk: [],
        entities: [],
        headings: [],
        contentGaps: []
      };
    }
    
    const processedResult = processSerpResponse(response);
    
    // Cache the result
    serpResultsCache.set(cacheKey, processedResult);
    
    // Show success toast
    toast.success('Content analysis completed successfully');
    
    return processedResult;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    
    // Show toast but don't break UI flow
    toast.error(`Content analysis error: ${error.message || 'Failed to analyze content'}`);
    
    // Return empty result
    return {
      keyword: keywords.length > 0 ? keywords[0] : '',
      searchVolume: 0,
      competitionScore: 0,
      keywordDifficulty: 0,
      keywords: keywords,
      recommendations: [],
      topResults: [],
      relatedSearches: [],
      peopleAlsoAsk: [],
      entities: [],
      headings: [],
      contentGaps: []
    };
  }
}

// Re-export types for backward compatibility
export type { SerpAnalysisResult, SerpSearchParams };
