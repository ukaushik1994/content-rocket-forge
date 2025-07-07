
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';
import { getApiKey } from './apiKeyService';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  provider?: 'serp' | 'serpstack';
}

// Constants for caching
const SERP_CACHE_PREFIX = 'serp_data_';
const SERP_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type { SerpAnalysisResult };

/**
 * Clear all contaminated cache data
 */
function clearContaminatedCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(SERP_CACHE_PREFIX)) {
        const data = localStorage.getItem(key);
        if (data && (data.includes('SerpAPI') || data.includes('serpapi') || data.includes('Serpstack'))) {
          console.log('🗑️ Removing contaminated cache:', key);
          localStorage.removeItem(key);
          localStorage.removeItem(`${key}_timestamp`);
        }
      }
    });
  } catch (error) {
    console.warn('⚠️ Error clearing contaminated cache:', error);
  }
}

/**
 * Get API key from the unified settings service
 */
async function getSerpApiKey(provider: 'serp' | 'serpstack' = 'serp'): Promise<string | null> {
  try {
    console.log(`🔑 Getting ${provider.toUpperCase()} API key...`);
    const apiKey = await getApiKey(provider);
    
    if (apiKey) {
      console.log(`✅ ${provider.toUpperCase()} API key found`);
      return apiKey;
    } else {
      console.log(`❌ No ${provider.toUpperCase()} API key found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting ${provider.toUpperCase()} API key:`, error);
    return null;
  }
}

/**
 * Check if cached data exists and is valid
 */
function getCachedSerpData(keyword: string, provider: 'serp' | 'serpstack' = 'serp'): SerpAnalysisResult | null {
  try {
    const cacheKey = `${SERP_CACHE_PREFIX}${provider}_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      // Check for contamination
      if (cachedData.includes('SerpAPI') || cachedData.includes('serpapi') || cachedData.includes('Serpstack')) {
        console.log('🗑️ Removing contaminated cached data for:', keyword);
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(`${cacheKey}_timestamp`);
        return null;
      }
      
      const parsedData = JSON.parse(cachedData);
      const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (timestamp) {
        const cachedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - cachedTime < SERP_CACHE_EXPIRY) {
          console.log(`📋 Using valid cached ${provider.toUpperCase()} data for:`, keyword);
          return parsedData;
        } else {
          console.log(`🗑️ Cached ${provider.toUpperCase()} data expired for:`, keyword);
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
          return null;
        }
      }
    }
  } catch (err) {
    console.warn(`⚠️ Error parsing cached ${provider.toUpperCase()} data:`, err);
    const cacheKey = `${SERP_CACHE_PREFIX}${provider}_${keyword}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_timestamp`);
  }
  
  return null;
}

/**
 * Cache SERP data with timestamp and provider
 */
function cacheSerpData(keyword: string, data: SerpAnalysisResult, provider: 'serp' | 'serpstack' = 'serp'): void {
  try {
    // Validate data is clean before caching
    const dataString = JSON.stringify(data);
    if (dataString.includes('SerpAPI') || dataString.includes('serpapi') || dataString.includes('Serpstack')) {
      console.warn('⚠️ Refusing to cache contaminated data for:', keyword);
      return;
    }
    
    const cacheKey = `${SERP_CACHE_PREFIX}${provider}_${keyword}`;
    localStorage.setItem(cacheKey, dataString);
    localStorage.setItem(`${cacheKey}_timestamp`, new Date().toISOString());
    console.log(`💾 Clean ${provider.toUpperCase()} data cached for:`, keyword);
  } catch (err) {
    console.warn(`⚠️ Error caching ${provider.toUpperCase()} data:`, err);
  }
}

/**
 * Call the Supabase Edge Function for SERP API requests
 */
async function callSerpEdgeFunction(endpoint: string, params: any, apiKey: string): Promise<any> {
  try {
    console.log(`🚀 Calling SERP Edge Function: ${endpoint}`, { 
      params: Object.keys(params), 
      hasApiKey: !!apiKey
    });
    
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint,
        params: {
          ...params,
          engine: 'google',
          gl: 'us',
          hl: 'en',
          device: 'desktop'
        },
        apiKey
      }
    });
    
    if (error) {
      console.error('❌ SERP Edge Function error:', error);
      throw new Error(`SERP API error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.warn('⚠️ No SERP data returned');
      return null;
    }
    
    // Validate data is clean
    const dataString = JSON.stringify(data);
    if (dataString.includes('SerpAPI') || dataString.includes('serpapi') || dataString.includes('Serpstack')) {
      console.warn('⚠️ Received contaminated data from edge function');
      // Clean the data before returning
      return cleanContaminatedData(data);
    }
    
    return data;
  } catch (error) {
    console.error('💥 Error calling SERP Edge Function:', error);
    throw error;
  }
}

/**
 * Clean contaminated data by removing provider references
 */
function cleanContaminatedData(data: any): any {
  if (!data) return data;
  
  const cleanString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/\b(serp\s*api|serpapi|serpstack)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const cleanObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(cleanObject);
    } else if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = cleanObject(value);
      }
      return cleaned;
    } else if (typeof obj === 'string') {
      return cleanString(obj);
    }
    return obj;
  };
  
  return cleanObject(data);
}

/**
 * Analyze keyword using SERP API with clean data validation
 */
export const analyzeKeywordSerp = async (
  keyword: string, 
  refresh?: boolean, 
  provider: 'serp' | 'serpstack' = 'serp'
): Promise<SerpAnalysisResult | null> => {
  try {
    console.log(`🎯 Analyzing ${provider.toUpperCase()} keyword: "${keyword}"${refresh ? ' (refresh requested)' : ''}`);
    
    // Clear any contaminated cache first
    clearContaminatedCache();
    
    // Check cache first (unless refresh is requested)
    if (!refresh) {
      const cachedData = getCachedSerpData(keyword, provider);
      if (cachedData && cachedData.isGoogleData) {
        console.log(`📋 Using cached ${provider.toUpperCase()} data`);
        return cachedData;
      }
    }
    
    const apiKey = await getSerpApiKey(provider);
    
    if (!apiKey) {
      console.warn(`⚠️ No ${provider.toUpperCase()} API key found`);
      toast.warning(`Add your ${provider.toUpperCase()} API key in Settings to get real SERP analysis.`, {
        duration: 5000,
        action: {
          label: "Add Key",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      return null;
    }

    console.log(`🔑 ${provider.toUpperCase()} API key found, making real API call...`);
    
    try {
      const data = await callSerpEdgeFunction('analyze', { 
        q: keyword,
        keyword, 
        refresh: !!refresh,
        engine: 'google',
        location: 'United States',
        language: 'en'
      }, apiKey);
      
      if (data && data.isGoogleData) {
        console.log(`✅ ${provider.toUpperCase()} returned clean verified data`);
        
        // Ensure proper typing and cache the result
        const result: SerpAnalysisResult = {
          keyword,
          searchVolume: data.searchVolume || 0,
          keywordDifficulty: data.keywordDifficulty || 0,
          competitionScore: data.competitionScore || 0,
          entities: data.entities || [],
          peopleAlsoAsk: data.peopleAlsoAsk || [],
          headings: data.headings || [],
          contentGaps: data.contentGaps || [],
          topResults: data.topResults || [],
          relatedSearches: data.relatedSearches || [],
          keywords: data.keywords || [],
          recommendations: data.recommendations || [],
          featuredSnippets: data.featuredSnippets || [],
          isMockData: false,
          isGoogleData: true,
          dataQuality: data.dataQuality || 'high',
          volumeMetadata: data.volumeMetadata,
          competitionMetadata: data.competitionMetadata
        };
        
        cacheSerpData(keyword, result, provider);
        
        toast.success(`Retrieved clean ${provider.toUpperCase()} data successfully!`);
        return result;
      } else {
        console.warn(`⚠️ ${provider.toUpperCase()} returned empty or invalid data`);
        throw new Error(`No valid data returned from ${provider.toUpperCase()}`);
      }
    } catch (apiError) {
      console.error(`❌ ${provider.toUpperCase()} API call failed:`, apiError);
      
      toast.error(`${provider.toUpperCase()} API Error: ${apiError.message}`, {
        duration: 8000,
        action: {
          label: "Check Settings",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      
      return null;
    }
  } catch (error) {
    console.error(`💥 Error analyzing ${provider.toUpperCase()} keyword:`, error);
    toast.error(`${provider.toUpperCase()} analysis failed: ${error.message}`);
    return null;
  }
};

/**
 * Search for keywords - returns null if no real data available
 */
export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false, provider = 'serp' } = params;
    console.log(`🔍 Searching ${provider.toUpperCase()} keywords for: "${query}"`);
    
    const apiKey = await getSerpApiKey(provider);
    
    if (apiKey) {
      try {
        const data = await callSerpEdgeFunction('search', { 
          q: query, 
          limit,
          engine: 'google',
          gl: 'us',
          hl: 'en'
        }, apiKey);
        
        if (data && (data.organic_results || data.success !== false)) {
          console.log(`✅ ${provider.toUpperCase()} search results retrieved successfully`);
          return data.organic_results || data;
        } else {
          console.warn(`⚠️ No ${provider.toUpperCase()} organic results found`);
          return null;
        }
      } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} search failed:`, error);
        return null;
      }
    }
    
    console.warn(`⚠️ No ${provider.toUpperCase()} API key found.`);
    toast.warning(`Add your ${provider.toUpperCase()} API key in Settings to get real keyword data.`, {
      duration: 5000,
      action: {
        label: "Go to Settings",
        onClick: () => {
          window.location.href = "/settings/api";
        }
      }
    });
    return null;
  } catch (error) {
    console.error(`💥 Error searching ${params.provider?.toUpperCase() || 'SERP'} keywords:`, error);
    return null;
  }
};

/**
 * Search related keywords - returns empty array if no real data available
 */
export const searchRelatedKeywords = async (keyword: string, provider: 'serp' | 'serpstack' = 'serp') => {
  try {
    const apiKey = await getSerpApiKey(provider);
    
    const cacheKey = `related_keywords_${provider}_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData && !cachedData.includes('SerpAPI') && !cachedData.includes('serpapi')) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log(`📋 Using cached related keywords for: ${keyword} (${provider.toUpperCase()})`);
        return parsedData;
      } catch (err) {
        console.warn('⚠️ Error parsing cached related keywords:', err);
        localStorage.removeItem(cacheKey);
      }
    }

    if (apiKey) {
      try {
        const data = await callSerpEdgeFunction('related', { keyword }, apiKey);
        const cleanKeywords = data.keywords || [];
        localStorage.setItem(cacheKey, JSON.stringify(cleanKeywords));
        return cleanKeywords;
      } catch (error) {
        console.error(`❌ Error fetching related keywords from ${provider.toUpperCase()}:`, error);
        return [];
      }
    }
    
    console.warn(`⚠️ No ${provider.toUpperCase()} API key found for related keywords`);
    return [];
  } catch (error) {
    console.error(`💥 Error searching related keywords with ${provider.toUpperCase()}:`, error);
    return [];
  }
};
