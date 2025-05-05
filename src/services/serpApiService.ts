
import { callApiProxy } from '@/services/apiProxyService';
import { toast } from 'sonner';
import { serpResultsCache } from '@/utils/cacheUtils';
import { validateKeywordInput } from './serpProcessingService';
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
export async function analyzeKeywordSerp(keyword: string): Promise<SerpAnalysisResult | null> {
  try {
    const validatedKeyword = validateKeywordInput(keyword);
    const cacheKey = `serp_${validatedKeyword}`;
    
    // Check cache first
    const cachedResult = serpResultsCache.get(cacheKey);
    if (cachedResult) {
      console.log(`Using cached SERP data for "${validatedKeyword}"`);
      
      // If we have cached mock data and we don't want to show it, return null
      if (cachedResult.isMockData) {
        console.log('Cached data is mock data, returning null to show "No data found"');
        return null;
      }
      
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
      console.error('Error calling serp API:', error);
      toast.error(`Failed to retrieve SERP data: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    if (!response) {
      console.log('No response from SERP API');
      toast.error('No response from SERP API');
      return null;
    }
    
    // If the response contains mock data and we don't want to show mock data,
    // return null to display the "No data found" component
    if (response.isMockData) {
      console.log('API returned mock data, returning null to show "No data found"');
      toast.warning('No API key configured. Please add your SERP API key in Settings to see real data.');
      return null;
    }
    
    // Cache the result (only if it's not mock data)
    if (!response.isMockData) {
      serpResultsCache.set(cacheKey, response);
    }
    
    return response;
  } catch (error: any) {
    console.error('Error analyzing keyword:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Failed to analyze keyword';
    toast.error(`API Error: ${errorMessage}`);
    
    return null;
  }
}

/**
 * Search for keywords related to a query
 */
export async function searchKeywords(params: SerpSearchParams): Promise<any[] | null> {
  try {
    const { query } = params;
    const validatedQuery = validateKeywordInput(query);
    const cacheKey = `keywords_${validatedQuery}_${params.country || 'us'}_${params.num || 10}`;

    // Check cache first
    const cachedResult = serpResultsCache.get(cacheKey);
    if (cachedResult) {
      console.log(`Using cached keyword results for "${validatedQuery}"`);
      
      // If we have cached mock data and we don't want to show it, return null
      if (cachedResult.isMockData) {
        console.log('Cached data is mock data, returning null');
        return null;
      }
      
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
      toast.error(`Failed to retrieve keyword data: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    // Check if response exists and has results property
    const results = response && typeof response === 'object' ? (response as any).results : [];
    
    // If the response contains mock data and we don't want to show mock data,
    // return null
    if (response && response.isMockData) {
      console.log('API returned mock data, returning null');
      toast.warning('No API key configured. Please add your SERP API key in Settings to see real data.');
      return null;
    }
    
    const processedResults = Array.isArray(results) ? results : [];
    
    // Cache results only if they're not mock data
    if (response && !response.isMockData) {
      serpResultsCache.set(cacheKey, processedResults);
    }
    
    return processedResults;
  } catch (error: any) {
    console.error('Error searching keywords:', error);
    
    // Show toast but don't return mock data
    toast.error(`API Error: ${error.message || 'Failed to search keywords'}`);
    return null;
  }
}

/**
 * Analyze content for SEO recommendations
 */
export async function analyzeContent(content: string, keywords: string[] = []): Promise<SerpAnalysisResult | null> {
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
      
      // If we have cached mock data and we don't want to show it, return null
      if (cachedResult.isMockData) {
        console.log('Cached data is mock data, returning null');
        return null;
      }
      
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
      toast.error(`Failed to analyze content: ${error.message || 'Unknown error'}`);
      return null;
    }
    
    if (!response) {
      console.log('No response from content analysis API');
      toast.error('No response from content analysis API');
      return null;
    }
    
    // If the response contains mock data and we don't want to show mock data,
    // return null
    if (response.isMockData) {
      console.log('API returned mock data, returning null');
      toast.warning('No API key configured. Please add your SERP API key in Settings to see real data.');
      return null;
    }
    
    // Cache the result only if it's not mock data
    if (!response.isMockData) {
      serpResultsCache.set(cacheKey, response);
    }
    
    return response;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    
    // Show toast but don't return mock data
    toast.error(`Content analysis error: ${error.message || 'Failed to analyze content'}`);
    return null;
  }
}

// Re-export types for backward compatibility
export type { SerpAnalysisResult, SerpSearchParams };
