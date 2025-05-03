
import { callApiProxy } from '@/services/apiProxyService';
import { toast } from 'sonner';
import { serpResultsCache } from '@/utils/cacheUtils';
import { getMockSerpData, getMockKeywordResults } from './serpMockService';
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
    const response = await withRetry(() => 
      callApiProxy({
        service: 'serp',
        endpoint: 'search',
        params: { keyword: validatedKeyword, country: 'us' }
      })
    );
    
    if (!response) {
      throw new Error('No response from SERP API');
    }
    
    // Process data to ensure it has the expected structure
    const processedData = processSerpResponse(response);
    
    // Cache the result
    serpResultsCache.set(cacheKey, processedData);
    
    return processedData;
  } catch (error: any) {
    console.error('Error analyzing keyword:', error);
    
    // For development/demo purposes, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock SERP data due to API error');
      const mockData = getMockSerpData(keyword);
      
      // Cache the mock result too
      serpResultsCache.set(`serp_${keyword.toLowerCase().trim()}`, mockData);
      
      return mockData;
    }
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Failed to analyze keyword';
    toast.error(`API Error: ${errorMessage}`);
    throw error;
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

    const response = await withRetry(() => 
      callApiProxy({
        service: 'serp',
        endpoint: 'keywords',
        params
      })
    );
    
    // Check if response exists and has results property
    const results = response && typeof response === 'object' ? (response as any).results : [];
    const processedResults = Array.isArray(results) ? results : [];
    
    // Cache results
    serpResultsCache.set(cacheKey, processedResults);
    
    return processedResults;
  } catch (error: any) {
    console.error('Error searching keywords:', error);
    
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      const mockResults = getMockKeywordResults(params.query);
      return mockResults;
    }
    
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
    
    const response = await withRetry(() => 
      callApiProxy({
        service: 'serp',
        endpoint: 'analyze',
        params: { content, keywords }
      })
    );
    
    if (!response) {
      throw new Error('No response from content analysis API');
    }
    
    const processedResult = processSerpResponse(response);
    
    // Cache the result
    serpResultsCache.set(cacheKey, processedResult);
    
    return processedResult;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    
    // Return mock analysis data with the required keyword field
    const mockResult: SerpAnalysisResult = {
      keyword: keywords[0] || 'unknown',
      searchVolume: 0,
      competitionScore: 0.5,
      keywordDifficulty: 50,
      keywords: keywords,
      recommendations: [
        'Add more specific details about the topic.',
        'Include more related keywords.',
        'Structure content with proper headings and subheadings.'
      ]
    };
    
    toast.error(`Content analysis error: ${error.message || 'Failed to analyze content'}`);
    return mockResult;
  }
}

// Re-export types for backward compatibility
export type { SerpAnalysisResult, SerpSearchParams };
