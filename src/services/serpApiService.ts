
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
      // Return mock data if API call fails - don't rethrow the error
      console.log('Using mock SERP data due to API error');
      const mockData = getMockSerpData(keyword);
      mockData.isMockData = true; // Set flag to identify mock data
      serpResultsCache.set(`serp_${validatedKeyword}`, mockData);
      return mockData;
    }
    
    if (!response) {
      console.log('No response from SERP API, using mock data');
      const mockData = getMockSerpData(keyword);
      mockData.isMockData = true; // Set flag to identify mock data
      serpResultsCache.set(`serp_${validatedKeyword}`, mockData);
      return mockData;
    }
    
    // Check if the response indicates it's mock data
    if (response.isMockData) {
      // If it's already flagged as mock data, just pass it through
      console.log('Received mock data from the API, still using it');
      const processedData = processSerpResponse(response);
      processedData.isMockData = true;
      serpResultsCache.set(cacheKey, processedData);
      
      // Show a toast notification about using mock data
      toast.info('Using sample data for SERP analysis. Add a valid SERP API key in settings for real data.');
      
      return processedData;
    } else {
      console.log('Received real data from the SERP API');
      // We got real data, process it normally
      const processedData = processSerpResponse(response);
      processedData.isMockData = false; // Ensure it's marked as real data
      
      // Cache the real data result
      serpResultsCache.set(cacheKey, processedData);
      
      // Show success toast for real data
      toast.success('SERP analysis completed with real data');
      
      return processedData;
    }
  } catch (error: any) {
    console.error('Error analyzing keyword:', error);
    
    // Always return mock data on error to ensure UI doesn't break
    console.log('Using mock SERP data due to error');
    const mockData = getMockSerpData(keyword);
    mockData.isMockData = true; // Set flag to identify mock data
    
    // Cache the mock result too
    serpResultsCache.set(`serp_${keyword.toLowerCase().trim()}`, mockData);
    
    // Show user-friendly error message but don't break the UI flow
    const errorMessage = error.message || 'Failed to analyze keyword';
    toast.error(`API Error: ${errorMessage}`);
    
    // Return mock data instead of throwing
    return mockData;
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
      // Return mock data if API call fails
      const mockResults = getMockKeywordResults(params.query);
      serpResultsCache.set(cacheKey, mockResults);
      return mockResults;
    }
    
    // Check if response exists and has results property
    const results = response && typeof response === 'object' ? 
      (response.results || response) : [];
    
    // Check if the data is mock
    const isMockData = response && response.isMockData === true;
    
    if (isMockData) {
      toast.info('Using sample data for keyword suggestions. Add a valid SERP API key for real data.');
    }
    
    const processedResults = Array.isArray(results) ? results : [];
    
    // Cache results
    serpResultsCache.set(cacheKey, processedResults);
    
    return processedResults;
  } catch (error: any) {
    console.error('Error searching keywords:', error);
    
    // Always return mock data on error
    const mockResults = getMockKeywordResults(params.query);
    serpResultsCache.set(`keywords_${params.query.toLowerCase().trim()}_${params.country || 'us'}_${params.num || 10}`, mockResults);
    
    // Show toast but don't break UI flow
    toast.error(`API Error: ${error.message || 'Failed to search keywords'}`);
    return mockResults;
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
      // Return mock data if API call fails
      const mockResult = getMockContentAnalysis(content, keywords);
      serpResultsCache.set(cacheKey, mockResult);
      return mockResult;
    }
    
    if (!response) {
      console.log('No response from content analysis API, using mock data');
      const mockResult = getMockContentAnalysis(content, keywords);
      serpResultsCache.set(cacheKey, mockResult);
      return mockResult;
    }
    
    // Check if the response indicates it's mock data
    if (response.isMockData) {
      toast.info('Using sample data for content analysis. Add a valid SERP API key for real data.');
    } else {
      toast.success('Content analysis completed with real data');
    }
    
    const processedResult = processSerpResponse(response);
    
    // Cache the result
    serpResultsCache.set(cacheKey, processedResult);
    
    return processedResult;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    
    // Return mock analysis data with the required keyword field
    const mockResult = getMockContentAnalysis(content, keywords);
    serpResultsCache.set(`content_analysis_${btoa(content.substring(0, 50)).replace(/[^a-zA-Z0-9]/g, '')}`, mockResult);
    
    // Show toast but don't break UI flow
    toast.error(`Content analysis error: ${error.message || 'Failed to analyze content'}`);
    return mockResult;
  }
}

// Helper function for mock content analysis
function getMockContentAnalysis(content: string, keywords: string[] = []): SerpAnalysisResult {
  const mainKeyword = keywords && keywords.length > 0 ? keywords[0] : "content";
  
  return {
    keyword: mainKeyword,
    searchVolume: Math.floor(Math.random() * 5000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true,
    keywords: keywords || [mainKeyword, `${mainKeyword} strategy`, `${mainKeyword} tips`],
    recommendations: [
      'Include more specific details about the main topic',
      'Add more related keywords throughout the content',
      'Improve the readability with shorter paragraphs',
      'Include statistics or data to support your claims',
      'Add images or media to enhance engagement'
    ],
    topResults: [
      {
        title: `${mainKeyword} - Complete Guide`,
        link: 'https://example.com/complete-guide',
        snippet: `This complete guide covers everything you need to know about ${mainKeyword}.`,
        position: 1
      },
      {
        title: `${mainKeyword} Best Practices`,
        link: 'https://example.com/best-practices',
        snippet: `Learn the best practices for ${mainKeyword} in this comprehensive guide.`,
        position: 2
      }
    ],
    relatedSearches: [
      { query: `${mainKeyword} examples`, volume: 1200 },
      { query: `${mainKeyword} tools`, volume: 950 }
    ],
    peopleAlsoAsk: [
      { question: `What is ${mainKeyword}?`, source: 'https://example.com/what-is' },
      { question: `How to use ${mainKeyword}?`, source: 'https://example.com/how-to' }
    ]
  };
}

// Re-export types for backward compatibility
export type { SerpAnalysisResult, SerpSearchParams };
