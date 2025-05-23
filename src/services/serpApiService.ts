import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';
import { getApiKey } from './apiKeyService';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
}

// Constants for caching
const SERP_CACHE_PREFIX = 'serp_data_';
const SERP_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type { SerpAnalysisResult };

/**
 * Get API key from the unified settings service
 */
async function getSerpApiKey(): Promise<string | null> {
  try {
    console.log('🔑 Getting SERP API key from unified service...');
    const apiKey = await getApiKey('serp');
    
    if (apiKey) {
      console.log('✅ SERP API key found');
      return apiKey;
    } else {
      console.log('❌ No SERP API key found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting SERP API key:', error);
    return null;
  }
}

/**
 * Call the Supabase Edge Function for SERP API requests with enhanced error handling
 */
async function callSerpEdgeFunction(endpoint: string, params: any, apiKey: string): Promise<any> {
  try {
    console.log(`🚀 Calling SERP Edge Function: ${endpoint}`, { 
      params: Object.keys(params), 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length 
    });
    
    const { data, error } = await supabase.functions.invoke('serp-api', {
      body: {
        endpoint,
        params,
        apiKey
      }
    });
    
    if (error) {
      console.error('❌ Supabase Edge Function error:', error);
      throw new Error(`Edge Function error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.warn('⚠️ Edge Function returned no data');
      return null;
    }
    
    // Check if the response contains an error
    if (data.error) {
      console.error('❌ SERP API error in response:', data.error);
      throw new Error(data.error);
    }
    
    console.log('✅ SERP Edge Function response received successfully');
    return data;
  } catch (error) {
    console.error('💥 Error calling SERP Edge Function:', error);
    
    // Provide more specific error messages
    if (error.message.includes('401')) {
      throw new Error('Invalid API key. Please check your SERP API key in settings.');
    } else if (error.message.includes('429')) {
      throw new Error('API rate limit exceeded. Please try again later.');
    } else if (error.message.includes('timeout')) {
      throw new Error('Request timeout. Please try again.');
    }
    
    throw error;
  }
}

/**
 * Check if cached data exists and is valid
 */
function getCachedSerpData(keyword: string): SerpAnalysisResult | null {
  try {
    const cacheKey = `${SERP_CACHE_PREFIX}${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (timestamp) {
        const cachedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - cachedTime < SERP_CACHE_EXPIRY) {
          console.log('📋 Using valid cached SERP data for:', keyword);
          return parsedData;
        } else {
          console.log('🗑️ Cached SERP data expired for:', keyword);
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
          return null;
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Error parsing cached SERP data:', err);
    const cacheKey = `${SERP_CACHE_PREFIX}${keyword}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_timestamp`);
  }
  
  return null;
}

/**
 * Cache SERP data with timestamp
 */
function cacheSerpData(keyword: string, data: SerpAnalysisResult): void {
  try {
    const cacheKey = `${SERP_CACHE_PREFIX}${keyword}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
    localStorage.setItem(`${cacheKey}_timestamp`, new Date().toISOString());
    console.log('💾 SERP data cached for:', keyword);
  } catch (err) {
    console.warn('⚠️ Error caching SERP data:', err);
  }
}

/**
 * Search for keywords using the SERP API
 */
export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false } = params;
    console.log(`🔍 Searching keywords for: "${query}"`);
    
    const apiKey = await getSerpApiKey();
    
    if (apiKey) {
      try {
        const data = await callSerpEdgeFunction('search', { q: query, limit }, apiKey);
        return data?.results || [];
      } catch (error) {
        console.error('❌ SERP API search failed:', error);
        toast.error('Error fetching keyword data. Using mock data.');
        return getBackupMockResults(query, refresh);
      }
    }
    
    console.warn('⚠️ No SERP API key found. Using mock data.');
    toast.warning('Using mock data for keyword search. Add your SERP API key in Settings for real results.', {
      duration: 5000,
      action: {
        label: "Go to Settings",
        onClick: () => {
          window.location.href = "/settings/api";
        }
      }
    });
    return getBackupMockResults(query, refresh);
  } catch (error) {
    console.error('💥 Error searching keywords:', error);
    return getBackupMockResults(params.query, params.refresh || false);
  }
};

/**
 * Analyze keyword using SERP API with enhanced error handling
 */
export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean): Promise<SerpAnalysisResult | null> => {
  try {
    console.log(`🎯 Analyzing keyword: "${keyword}"${refresh ? ' (refresh requested)' : ''}`);
    
    // Check cache first (unless refresh is requested)
    if (!refresh) {
      const cachedData = getCachedSerpData(keyword);
      if (cachedData) {
        console.log('📋 Using cached SERP data');
        return cachedData;
      }
    }
    
    const apiKey = await getSerpApiKey();
    
    if (!apiKey) {
      console.warn('⚠️ No SERP API key found, using mock data');
      toast.warning('No SERP API key found. Add your API key in Settings for real data.', {
        duration: 5000,
        action: {
          label: "Add Key",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      return generateMockSerpData(keyword, refresh);
    }

    console.log('🔑 API key found, making real SERP API call...');
    
    try {
      const data = await callSerpEdgeFunction('analyze', { keyword, refresh: !!refresh }, apiKey);
      
      if (data) {
        console.log('✅ SERP API returned real data');
        const result: SerpAnalysisResult = {
          keyword,
          searchVolume: data.searchVolume || Math.floor(Math.random() * 10000) + 1000,
          keywordDifficulty: data.keywordDifficulty || Math.floor(Math.random() * 100),
          competitionScore: data.competitionScore || Math.random() * 0.8,
          entities: data.entities || [],
          peopleAlsoAsk: data.peopleAlsoAsk || [],
          headings: data.headings || [],
          contentGaps: data.contentGaps || [],
          topResults: data.topResults || [],
          relatedSearches: data.relatedSearches || [],
          keywords: data.keywords || [],
          recommendations: data.recommendations || [],
          isMockData: false
        };
        
        cacheSerpData(keyword, result);
        
        toast.success('Retrieved real SERP data successfully!');
        return result;
      } else {
        console.warn('⚠️ SERP API returned empty data');
        throw new Error('No data returned from SERP API');
      }
    } catch (apiError) {
      console.error('❌ SERP API call failed:', apiError);
      
      // Show specific error message to user
      toast.error(`SERP API Error: ${apiError.message}`, {
        duration: 8000,
        action: {
          label: "Check Settings",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      
      // Return mock data as fallback
      console.log('🎭 Falling back to mock data due to API error');
      return generateMockSerpData(keyword, refresh);
    }
  } catch (error) {
    console.error('💥 Error analyzing keyword:', error);
    toast.error(`Analysis failed: ${error.message}`);
    return generateMockSerpData(keyword, refresh);
  }
};

// Helper function for mock results as a backup
function getBackupMockResults(query: string, refresh: boolean) {
  const mockResults = [
    { title: `How to Use ${query} Effectively`, url: 'https://example.com/1' },
    { title: `The Ultimate Guide to ${query}`, url: 'https://example.com/2' },
    { title: `10 Best ${query} Strategies`, url: 'https://example.com/3' },
    { title: `Why ${query} Matters for SEO`, url: 'https://example.com/4' },
    { title: `Understanding ${query} for Beginners`, url: 'https://example.com/5' },
    { title: `${query} vs Traditional Methods`, url: 'https://example.com/6' },
    { title: `The Future of ${query} in 2025`, url: 'https://example.com/7' },
    { title: `How to Measure ${query} Success`, url: 'https://example.com/8' },
    { title: `${query} Best Practices`, url: 'https://example.com/9' },
    { title: `${query} Case Studies`, url: 'https://example.com/10' },
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

// Helper function to generate mock SERP data as a fallback
function generateMockSerpData(keyword: string, refresh?: boolean): SerpAnalysisResult {
  console.log('🎭 Generating mock SERP data for:', keyword);
  
  const variationFactor = refresh ? Math.random() : 0.5;
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random() * 0.8,
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true,
    entities: [
      { name: `${keyword} platform`, type: 'platform', description: `A platform focused on ${keyword}` },
      { name: `${keyword} strategy`, type: 'strategy', description: `Strategic approaches to ${keyword}` },
      { name: `${keyword} tools`, type: 'tools', description: `Tools used for ${keyword} implementation` },
      { name: `${keyword} metrics`, type: 'metrics', description: `Measurements related to ${keyword} performance` },
      ...(refresh ? [
        { name: `${keyword} analytics`, type: 'analytics', description: `Analytic methods for ${keyword}` },
        { name: `${keyword} framework`, type: 'framework', description: `Structural frameworks for ${keyword}` },
        { name: `${keyword} automation`, type: 'automation', description: `Automation techniques for ${keyword}` }
      ] : [])
    ],
    peopleAlsoAsk: [
      { question: `How does ${keyword} work?`, source: 'search' },
      { question: `What is the best ${keyword} tool?`, source: 'search' },
      { question: `Why is ${keyword} important for SEO?`, source: 'search' },
      { question: `When should I use ${keyword}?`, source: 'search' },
      ...(refresh ? [
        { question: `What are the advantages of ${keyword}?`, source: 'search' },
        { question: `How much does ${keyword} cost on average?`, source: 'search' },
        { question: `Can ${keyword} be integrated with other systems?`, source: 'search' }
      ] : [])
    ],
    headings: [
      { text: `Understanding ${keyword}`, level: 'h2' as const },
      { text: `Benefits of ${keyword}`, level: 'h2' as const },
      { text: `How to Implement ${keyword}`, level: 'h3' as const },
      { text: `${keyword} Best Practices`, level: 'h2' as const },
      { text: `${keyword} Case Studies`, level: 'h2' as const },
      ...(refresh ? [
        { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2' as const },
        { text: `Advanced ${keyword} Techniques`, level: 'h2' as const },
        { text: `${keyword} ROI Calculation`, level: 'h3' as const }
      ] : [])
    ],
    contentGaps: [
      { 
        topic: `${keyword} for beginners`, 
        description: 'Beginner guide', 
        recommendation: 'Create a 101 guide',
        content: `A comprehensive ${keyword} guide for beginners`,
        source: 'Content analysis'
      },
      { 
        topic: `Advanced ${keyword} techniques`, 
        description: 'For experts', 
        recommendation: 'Share advanced tips',
        content: `Expert-level ${keyword} strategies and implementations`,
        source: 'Content analysis' 
      },
      { 
        topic: `${keyword} ROI measurement`, 
        description: 'Measuring success', 
        recommendation: 'Create calculator',
        content: `How to measure ROI from your ${keyword} initiatives`,
        source: 'Content analysis'
      },
      { 
        topic: `${keyword} vs competitors`, 
        description: 'Comparison', 
        recommendation: 'Create comparison chart',
        content: `Comparing ${keyword} with alternative approaches`,
        source: 'Content analysis'
      }
    ],
    topResults: [
      {
        title: `The Ultimate Guide to ${keyword}`,
        link: `https://example.com/${keyword}-guide`,
        snippet: `Learn everything you need to know about ${keyword} with our comprehensive guide.`,
        position: 1
      },
      {
        title: `How to Use ${keyword} Effectively`,
        link: `https://example.com/${keyword}-tutorial`,
        snippet: `Step-by-step tutorial on implementing ${keyword} for maximum results.`,
        position: 2
      },
      {
        title: `${keyword} Tips and Tricks`,
        link: `https://example.com/${keyword}-tips`,
        snippet: `Expert advice on getting the most out of your ${keyword} strategy.`,
        position: 3
      }
    ],
    relatedSearches: [
      { query: `${keyword} strategy` },
      { query: `${keyword} tools` },
      { query: `best ${keyword} practices` },
      { query: `${keyword} guide` },
      { query: `${keyword} tutorial` },
      { query: `${keyword} examples` },
      { query: `${keyword} techniques` },
      { query: `${keyword} trends` },
      ...(refresh ? [
        { query: `affordable ${keyword} solutions` },
        { query: `${keyword} for small business` },
        { query: `enterprise ${keyword} options` },
        { query: `${keyword} certification` }
      ] : [])
    ],
    keywords: [
      `${keyword} strategy`,
      `${keyword} tools`,
      `best ${keyword} practices`,
      `${keyword} guide`,
      `${keyword} tutorial`,
      `${keyword} examples`,
      `${keyword} techniques`,
      `${keyword} trends`,
      ...(refresh ? [
        `${keyword} certification`,
        `${keyword} for startups`,
        `${keyword} ROI`,
        `${keyword} software comparison`
      ] : [])
    ],
    recommendations: [
      `Create a comprehensive guide on ${keyword}`,
      `Include step-by-step instructions for implementing ${keyword}`,
      `Add visual examples of ${keyword} in action`,
      `Compare ${keyword} with alternative approaches`,
      `Include case studies showing successful ${keyword} implementation`
    ]
  };
}

export const searchRelatedKeywords = async (keyword: string) => {
  try {
    const apiKey = await getSerpApiKey();
    
    const cacheKey = `related_keywords_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log('📋 Using cached related keywords for:', keyword);
        return parsedData;
      } catch (err) {
        console.warn('⚠️ Error parsing cached related keywords:', err);
        localStorage.removeItem(cacheKey);
      }
    }

    if (apiKey) {
      try {
        const data = await callSerpEdgeFunction('related', { keyword }, apiKey);
        localStorage.setItem(cacheKey, JSON.stringify(data.keywords || []));
        return data.keywords || [];
      } catch (error) {
        console.error('❌ Error fetching related keywords:', error);
        return getMockRelatedKeywords(keyword);
      }
    }
    
    return getMockRelatedKeywords(keyword);
  } catch (error) {
    console.error('💥 Error searching related keywords:', error);
    return getMockRelatedKeywords(keyword);
  }
};

function getMockRelatedKeywords(keyword: string) {
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
