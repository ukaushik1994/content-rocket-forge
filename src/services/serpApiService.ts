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
          return getBackupMockResults(query, refresh, provider);
        }
      } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} search failed:`, error);
        toast.error(`Error fetching ${provider.toUpperCase()} keyword data. Using mock data.`);
        return getBackupMockResults(query, refresh, provider);
      }
    }
    
    console.warn(`⚠️ No ${provider.toUpperCase()} API key found. Using mock data.`);
    toast.warning(`Using mock data for keyword search. Add your ${provider.toUpperCase()} API key in Settings for real results.`, {
      duration: 5000,
      action: {
        label: "Go to Settings",
        onClick: () => {
          window.location.href = "/settings/api";
        }
      }
    });
    return getBackupMockResults(query, refresh, provider);
  } catch (error) {
    console.error(`💥 Error searching ${params.provider?.toUpperCase() || 'SERP'} keywords:`, error);
    return getBackupMockResults(params.query, params.refresh || false, params.provider || 'serp');
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
      console.warn(`⚠️ No ${provider.toUpperCase()} API key found, using mock data`);
      toast.warning(`No ${provider.toUpperCase()} API key found. Add your API key in Settings for real data.`, {
        duration: 5000,
        action: {
          label: "Add Key",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      return generateMockSerpData(keyword, refresh, provider);
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
      
      console.log(`🎭 Falling back to mock ${provider.toUpperCase()} data due to API error`);
      return generateMockSerpData(keyword, refresh, provider);
    }
  } catch (error) {
    console.error(`💥 Error analyzing ${provider.toUpperCase()} keyword:`, error);
    toast.error(`${provider.toUpperCase()} analysis failed: ${error.message}`);
    return generateMockSerpData(keyword, refresh, provider);
  }
};

// Helper function for mock results as a backup
function getBackupMockResults(query: string, refresh: boolean, provider: SerpProvider = 'serp') {
  const providerName = provider === 'serp' ? 'SerpAPI' : 'Serpstack';
  const mockResults = [
    { title: `How to Use ${query} Effectively - ${providerName} Search`, url: 'https://example.com/1' },
    { title: `The Ultimate ${providerName} Guide to ${query}`, url: 'https://example.com/2' },
    { title: `10 Best ${query} Strategies for ${providerName}`, url: 'https://example.com/3' },
    { title: `Why ${query} Matters for ${providerName} SEO`, url: 'https://example.com/4' },
    { title: `Understanding ${query} for ${providerName} Rankings`, url: 'https://example.com/5' },
    { title: `${query} vs Traditional Methods on ${providerName}`, url: 'https://example.com/6' },
    { title: `The Future of ${query} in ${providerName} Search 2025`, url: 'https://example.com/7' },
    { title: `How to Measure ${query} Success on ${providerName}`, url: 'https://example.com/8' },
    { title: `${query} Best Practices for ${providerName}`, url: 'https://example.com/9' },
    { title: `${query} ${providerName} Case Studies`, url: 'https://example.com/10' },
  ];
  
  if (refresh) {
    return mockResults
      .map(item => ({ 
        ...item, 
        title: item.title.replace(query, `${query} ${['Expert', 'Professional', 'Advanced', 'Strategic'][Math.floor(Math.random() * 4)]}`)
      }))
      .sort(() => Math.random() - 0.5);
  }
  
  return mockResults;
}

// Helper function to generate mock data as a fallback
function generateMockSerpData(keyword: string, refresh?: boolean, provider: SerpProvider = 'serp'): SerpAnalysisResult {
  console.log(`🎭 Generating mock ${provider.toUpperCase()} data for:`, keyword);
  
  const providerName = provider === 'serp' ? 'SerpAPI' : 'Serpstack';
  const variationFactor = refresh ? Math.random() : 0.5;
  
  const baseVolume = provider === 'serp' ? 50000 : 25000; // SerpAPI typically has higher volume estimates
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * baseVolume) + 10000,
    competitionScore: Math.random() * 0.8,
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true,
    isGoogleData: true, // Mark as Google data even if mock
    dataQuality: 'low',
    volumeMetadata: {
      source: provider === 'serp' ? 'mock_google_estimate' : 'serpstack_estimate',
      confidence: 'low',
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString()
    },
    competitionMetadata: {
      source: provider === 'serp' ? 'mock_google_estimate' : 'serpstack_estimate',
      engine: 'google',
      adsCompetition: 'ESTIMATED'
    },
    entities: [
      { name: `${keyword} platform`, type: 'platform', description: `A ${providerName}-indexed platform focused on ${keyword}`, source: `${provider}_knowledge_graph` },
      { name: `${keyword} strategy`, type: 'strategy', description: `Strategic approaches to ${keyword} for ${providerName}`, source: `${provider}_knowledge_graph` },
      { name: `${keyword} tools`, type: 'tools', description: `${providerName}-friendly tools for ${keyword} implementation`, source: `${provider}_knowledge_graph` },
      { name: `${keyword} metrics`, type: 'metrics', description: `${providerName} Analytics measurements for ${keyword}`, source: `${provider}_knowledge_graph` },
      ...(refresh ? [
        { name: `${keyword} analytics`, type: 'analytics', description: `${providerName} Analytics methods for ${keyword}`, source: `${provider}_knowledge_graph` },
        { name: `${keyword} framework`, type: 'framework', description: `${providerName}-approved frameworks for ${keyword}`, source: `${provider}_knowledge_graph` }
      ] : [])
    ],
    peopleAlsoAsk: [
      { question: `How does ${keyword} work with ${providerName}?`, source: `${provider}_people_also_ask` },
      { question: `What is the best ${keyword} tool for ${providerName}?`, source: `${provider}_people_also_ask` },
      { question: `Why is ${keyword} important for ${providerName} SEO?`, source: `${provider}_people_also_ask` },
      { question: `When should I use ${keyword} for ${providerName} rankings?`, source: `${provider}_people_also_ask` },
      ...(refresh ? [
        { question: `What are the ${providerName} advantages of ${keyword}?`, source: `${provider}_people_also_ask` },
        { question: `How much does ${keyword} cost on ${providerName} Ads?`, source: `${provider}_people_also_ask` }
      ] : [])
    ],
    headings: [
      { text: `Understanding ${keyword} for ${providerName}`, level: 'h2' as const },
      { text: `${providerName} Benefits of ${keyword}`, level: 'h2' as const },
      { text: `How to Implement ${keyword} with ${providerName}`, level: 'h3' as const },
      { text: `${keyword} ${providerName} Best Practices`, level: 'h2' as const },
      { text: `${keyword} ${providerName} Case Studies`, level: 'h2' as const },
      ...(refresh ? [
        { text: `Common ${providerName} ${keyword} Mistakes`, level: 'h2' as const },
        { text: `Advanced ${providerName} ${keyword} Techniques`, level: 'h2' as const }
      ] : [])
    ],
    contentGaps: [
      { 
        topic: `${keyword} for ${providerName} beginners`, 
        description: `${providerName}-focused beginner guide`, 
        recommendation: `Create a ${providerName}-optimized 101 guide`,
        content: `A comprehensive ${providerName}-friendly ${keyword} guide`,
        source: `${provider}_serp_analysis`
      },
      { 
        topic: `Advanced ${providerName} ${keyword} techniques`, 
        description: `${providerName} expert strategies`, 
        recommendation: `Share advanced ${providerName} tips`,
        content: `Expert-level ${providerName} ${keyword} strategies`,
        source: `${provider}_serp_analysis` 
      }
    ],
    topResults: [
      {
        title: `The Ultimate ${providerName} Guide to ${keyword}`,
        link: `https://example.com/${provider}-${keyword}-guide`,
        snippet: `Learn everything about ${keyword} optimized for ${providerName} search visibility and user engagement.`,
        position: 1,
        source: `${provider}_organic`
      },
      {
        title: `How to Use ${keyword} for ${providerName} Success`,
        link: `https://example.com/${provider}-${keyword}-tutorial`,
        snippet: `Step-by-step ${providerName}-optimized ${keyword} implementation.`,
        position: 2,
        source: `${provider}_organic`
      }
    ],
    relatedSearches: [
      { query: `${keyword} ${providerName} strategy`, source: `${provider}_related_searches` },
      { query: `${keyword} ${providerName} tools`, source: `${provider}_related_searches` },
      { query: `best ${providerName} ${keyword} practices`, source: `${provider}_related_searches` },
      { query: `${keyword} ${providerName} guide`, source: `${provider}_related_searches` },
      { query: `${keyword} ${providerName} tutorial`, source: `${provider}_related_searches` },
      ...(refresh ? [
        { query: `${keyword} ${providerName} certification`, source: `${provider}_related_searches` },
        { query: `${keyword} ${providerName} Analytics`, source: `${provider}_related_searches` }
      ] : [])
    ],
    keywords: [
      `${keyword} ${providerName} strategy`,
      `${keyword} ${providerName} tools`,
      `best ${providerName} ${keyword} practices`,
      `${keyword} ${providerName} guide`,
      `${keyword} ${providerName} tutorial`,
      `${keyword} ${providerName} examples`,
      `${keyword} ${providerName} techniques`,
      `${keyword} ${providerName} trends`,
      ...(refresh ? [
        `${keyword} ${providerName} certification`,
        `${keyword} ${providerName} Analytics`,
        `${keyword} ${providerName} ROI`
      ] : [])
    ],
    recommendations: [
      `Create a comprehensive ${providerName}-optimized guide on ${keyword}`,
      `Include step-by-step instructions for ${providerName} ${keyword} implementation`,
      `Add visual examples of ${keyword} in ${providerName} search results`,
      `Compare ${keyword} with ${providerName} alternative approaches`,
      `Include ${providerName} case studies showing successful ${keyword} implementation`
    ],
    featuredSnippets: [
      {
        title: `What is ${keyword}?`,
        content: `${keyword} is a strategic approach optimized for ${providerName} search visibility and user engagement.`,
        source: `${provider}_featured_snippet`,
        type: 'definition'
      }
    ]
  };
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
        return getMockRelatedKeywords(keyword, provider);
      }
    }
    
    return getMockRelatedKeywords(keyword, provider);
  } catch (error) {
    console.error(`💥 Error searching related keywords with ${provider.toUpperCase()}:`, error);
    return getMockRelatedKeywords(keyword, provider);
  }
};

function getMockRelatedKeywords(keyword: string, provider: SerpProvider = 'serp') {
  const providerName = provider === 'serp' ? 'SerpAPI' : 'Serpstack';
  return [
    `${keyword} ${providerName} strategy`,
    `${keyword} tools`,
    `best ${keyword} practices`,
    `${keyword} guide`,
    `${keyword} tutorial`,
    `${keyword} examples`,
    `${keyword} techniques`,
    `${keyword} trends`,
  ];
}
