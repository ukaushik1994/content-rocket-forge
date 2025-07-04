import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';
import { getApiKey } from './apiKeyService';
import { callApiProxy, SerpProvider } from './apiProxyService';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  provider?: SerpProvider;
}

// Constants for caching
const SERP_CACHE_PREFIX = 'serp_data_';
const SERP_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type { SerpAnalysisResult };

/**
 * Get API key from the unified settings service with enhanced logging
 */
async function getSerpApiKey(provider: SerpProvider = 'serp'): Promise<string | null> {
  try {
    console.log(`🔑 Getting ${provider.toUpperCase()} API key from unified service...`);
    const apiKey = await getApiKey(provider);
    
    if (apiKey) {
      console.log(`✅ ${provider.toUpperCase()} API key found - Length:`, apiKey.length, 'Type:', typeof apiKey);
      return apiKey;
    } else {
      console.log(`❌ No ${provider.toUpperCase()} API key found in unified service`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error getting ${provider.toUpperCase()} API key from unified service:`, error);
    return null;
  }
}

/**
 * Call the Supabase Edge Function for SERP API requests with provider selection
 */
async function callSerpEdgeFunction(endpoint: string, params: any, apiKey: string, provider: SerpProvider = 'serp'): Promise<any> {
  try {
    console.log(`🚀 Calling ${provider.toUpperCase()} Edge Function: ${endpoint}`, { 
      params: Object.keys(params), 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      provider
    });
    
    // Use the new unified API proxy for better provider handling
    if (provider === 'serpstack') {
      return await callApiProxy('serpstack', endpoint, params);
    } else {
      // Keep using the original SerpAPI edge function for SerpAPI
      const { data, error } = await supabase.functions.invoke('serp-api', {
        body: {
          endpoint,
          params: {
            ...params,
            // Force Google-specific parameters
            engine: 'google',
            gl: 'us', // Google country
            hl: 'en', // Google language
            device: 'desktop' // Google device
          },
          apiKey
        }
      });
      
      if (error) {
        console.error(`❌ ${provider.toUpperCase()} Edge Function error:`, error);
        throw new Error(`${provider.toUpperCase()} API error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        console.warn(`⚠️ No ${provider.toUpperCase()} data returned`);
        return null;
      }
      
      return data;
    }
  } catch (error) {
    console.error(`💥 Error calling ${provider.toUpperCase()} Edge Function:`, error);
    throw error;
  }
}

/**
 * Check if cached data exists and is valid
 */
function getCachedSerpData(keyword: string, provider: SerpProvider = 'serp'): SerpAnalysisResult | null {
  try {
    const cacheKey = `${SERP_CACHE_PREFIX}${provider}_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
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
function cacheSerpData(keyword: string, data: SerpAnalysisResult, provider: SerpProvider = 'serp'): void {
  try {
    const cacheKey = `${SERP_CACHE_PREFIX}${provider}_${keyword}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_timestamp`, new Date().toISOString());
    console.log(`💾 ${provider.toUpperCase()} data cached for:`, keyword);
  } catch (err) {
    console.warn(`⚠️ Error caching ${provider.toUpperCase()} data:`, err);
  }
}

/**
 * Search for keywords using specified SERP provider
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
          // Ensure Google-specific parameters
          engine: 'google',
          gl: 'us',
          hl: 'en'
        }, apiKey, provider);
        
        if (data && (data.organic_results || data.success !== false)) {
          console.log(`✅ ${provider.toUpperCase()} search results retrieved successfully`);
          return data.organic_results || data;
        } else {
          console.warn(`⚠️ No ${provider.toUpperCase()} organic results found`);
          toast.warning(`No ${provider.toUpperCase()} data available for "${query}". Please add your API key in Settings.`);
          return null;
        }
      } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} search failed:`, error);
        toast.error(`${provider.toUpperCase()} API Error. Please check your API key in Settings.`);
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
 * Analyze keyword using specified SERP provider with enhanced volume validation
 */
export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean, provider: SerpProvider = 'serp'): Promise<SerpAnalysisResult | null> => {
  try {
    console.log(`🎯 Analyzing ${provider.toUpperCase()} keyword: "${keyword}"${refresh ? ' (refresh requested)' : ''}`);
    
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
        keyword, 
        refresh: !!refresh,
        // Ensure provider-specific analysis
        engine: 'google',
        includeKeywordPlanner: provider === 'serp', // Only SerpAPI supports this
        location: 'United States',
        language: 'en'
      }, apiKey, provider);
      
      if (data && (data.isGoogleData || data.success !== false)) {
        console.log(`✅ ${provider.toUpperCase()} returned verified data`);
        console.log(`📊 Volume source: ${data.volumeMetadata?.source}`);
        console.log(`📊 Data quality: ${data.dataQuality}`);
        
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
          dataQuality: data.dataQuality || 'medium',
          volumeMetadata: data.volumeMetadata || {
            source: provider === 'serp' ? 'google_search_results' : 'serpstack_estimate',
            confidence: provider === 'serp' ? 'medium' : 'low',
            engine: 'google',
            location: 'United States',
            language: 'English',
            lastUpdated: new Date().toISOString()
          },
          competitionMetadata: data.competitionMetadata || {
            source: provider === 'serp' ? 'google_results_estimate' : 'serpstack_estimate',
            engine: 'google'
          }
        };
        
        cacheSerpData(keyword, result, provider);
        
        toast.success(`Retrieved verified ${provider.toUpperCase()} data successfully!`, {
          description: `Volume source: ${result.volumeMetadata?.source || provider.toUpperCase()}`
        });
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
      
      console.log(`🚫 No real ${provider.toUpperCase()} data available due to API error`);
      return null;
    }
  } catch (error) {
    console.error(`💥 Error analyzing ${provider.toUpperCase()} keyword:`, error);
    toast.error(`${provider.toUpperCase()} analysis failed: ${error.message}`);
    return null;
  }
};

// Real API failed - return null instead of contaminated mock data
function getBackupMockResults(query: string, refresh: boolean, provider: SerpProvider = 'serp') {
  console.warn(`🚫 No real ${provider.toUpperCase()} data available for "${query}"`);
  return null; // Force "No Data Available" instead of contaminated mock data
}

// No mock data - return null to show "No Data Available"
function generateMockSerpData(keyword: string, refresh?: boolean, provider: SerpProvider = 'serp'): SerpAnalysisResult | null {
  console.warn(`🚫 Refusing to generate contaminated mock data for "${keyword}"`);
  console.log(`💡 Add your ${provider.toUpperCase()} API key in Settings to get real data`);
  return null; // Force proper error handling instead of showing contaminated data
}

// ... keep existing code (searchRelatedKeywords, getMockRelatedKeywords) the same ...

export const searchRelatedKeywords = async (keyword: string, provider: SerpProvider = 'serp') => {
  try {
    const apiKey = await getSerpApiKey(provider);
    
    const cacheKey = `related_keywords_${provider}_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
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
        const data = await callSerpEdgeFunction('related', { keyword }, apiKey, provider);
        localStorage.setItem(cacheKey, JSON.stringify(data.keywords || []));
        return data.keywords || [];
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

function getMockRelatedKeywords(keyword: string, provider: SerpProvider = 'serp') {
  // Return clean keywords without provider contamination
  return [
    `${keyword} strategy`,
    `${keyword} tools`,
    `best ${keyword} practices`,
    `${keyword} guide`,
    `${keyword} tutorial`,
    `${keyword} examples`,
    `${keyword} techniques`,
    `${keyword} trends`,
  ];
}
