
/**
 * DataForSEO API request implementations
 */
import { decodeDataForSeoCredentials } from './ApiKeyTester';
import { SerpApiError, SerpErrorType } from '../../error-handling/ErrorTypes';
import { ErrorHandler } from '../../error-handling/ErrorHandler';

/**
 * Base function to make authenticated requests to DataForSEO
 */
async function makeDataForSEORequest(endpoint: string, data: any, apiKey: string): Promise<any> {
  try {
    const credentials = decodeDataForSeoCredentials(apiKey);
    if (!credentials) {
      throw new SerpApiError({
        type: SerpErrorType.INVALID_API_KEY,
        message: 'Invalid DataForSEO API key format',
        provider: 'dataforseo',
        timestamp: new Date(),
        recoverable: false
      });
    }

    const auth = Buffer.from(`${credentials.login}:${credentials.password}`).toString('base64');
    const response = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Process the response
    const result = await response.json();
    
    // Check for API errors
    if (result.status_code >= 40000) {
      throw new SerpApiError({
        type: SerpErrorType.PROVIDER_ERROR,
        message: result.status_message || 'DataForSEO API error',
        provider: 'dataforseo',
        timestamp: new Date(),
        recoverable: false,
        details: result
      });
    }
    
    return result;
  } catch (error) {
    // Let the error handler deal with it
    if (error instanceof SerpApiError) {
      throw error;
    }
    
    // Convert other errors to SerpApiError
    throw ErrorHandler.handleProviderError(error, 'dataforseo');
  }
}

/**
 * Fetch analysis data for a keyword
 */
export const fetchAnalysis = async (options: { 
  keyword: string; 
  location?: string; 
  language?: string;
  apiKey: string;
}): Promise<any> => {
  try {
    const { keyword, location = 'United States', language = 'en', apiKey } = options;
    
    // Prepare the API payload
    const data = {
      "keyword": keyword,
      "location_name": location,
      "language_name": language,
      "depth": 100
    };
    
    // Make the API request
    const result = await makeDataForSEORequest(
      'serp/google/organic/live/advanced', 
      [data], 
      apiKey
    );
    
    // Process and transform the result for our application
    if (result && result.tasks && result.tasks.length > 0) {
      const firstTask = result.tasks[0];
      
      // Check if we have results
      if (firstTask.result && firstTask.result.length > 0) {
        const searchResult = firstTask.result[0];
        
        // Transform to our app's format
        return {
          keyword,
          searchVolume: searchResult.search_volume || 0,
          keywordDifficulty: searchResult.keyword_difficulty || 0,
          competitionScore: searchResult.competition || 0,
          provider: 'dataforseo',
          relatedSearches: searchResult.related_searches || [],
          questions: searchResult.people_also_ask || [],
          topResults: searchResult.items || [],
          entities: searchResult.knowledge_graph || [],
          headings: extractHeadings(searchResult.items),
          contentGaps: [],
          keywords: [],
          recommendations: [],
          timestamp: new Date().toISOString(),
        };
      }
    }
    
    // Return empty result if no data
    return {
      keyword,
      provider: 'dataforseo',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching analysis from DataForSEO:', error);
    throw error;
  }
};

// Helper function to extract headings from results
const extractHeadings = (items: any[] = []): string[] => {
  const headings: string[] = [];
  items.forEach(item => {
    if (item.title) {
      const title = item.title.split(' - ')[0].split(' | ')[0];
      if (title && !headings.includes(title)) {
        headings.push(title);
      }
    }
  });
  return headings;
};

/**
 * Fetch keywords related to a search query
 */
export const fetchKeywords = async (options: {
  keyword: string;
  limit?: number;
  apiKey: string;
}): Promise<any[]> => {
  try {
    const { keyword, limit = 10, apiKey } = options;
    
    // Prepare the API payload
    const data = {
      "keyword": keyword,
      "limit": limit
    };
    
    // Make the API request
    const result = await makeDataForSEORequest(
      'keywords_data/google/keywords_for_keywords/live', 
      [data], 
      apiKey
    );
    
    // Process the result
    if (result && result.tasks && result.tasks.length > 0) {
      const firstTask = result.tasks[0];
      
      // Check if we have results
      if (firstTask.result && firstTask.result.length > 0) {
        return firstTask.result[0].keywords || [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching keywords from DataForSEO:', error);
    throw error;
  }
};

/**
 * Fetch related keywords for a search query
 */
export const fetchRelatedKeywords = async (options: {
  keyword: string;
  limit?: number;
  apiKey: string;
}): Promise<any[]> => {
  try {
    const { keyword, limit = 20, apiKey } = options;
    
    // Prepare the API payload
    const data = {
      "keyword": keyword,
      "limit": limit
    };
    
    // Make the API request
    const result = await makeDataForSEORequest(
      'keywords_data/google/related_searches/live', 
      [data], 
      apiKey
    );
    
    // Process the result
    if (result && result.tasks && result.tasks.length > 0) {
      const firstTask = result.tasks[0];
      
      // Check if we have results
      if (firstTask.result && firstTask.result.length > 0) {
        return firstTask.result[0].related_searches || [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching related keywords from DataForSEO:', error);
    throw error;
  }
};
