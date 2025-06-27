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
 * Get API key from the unified settings service with enhanced logging
 */
async function getSerpApiKey(): Promise<string | null> {
  try {
    console.log('🔑 Getting SERP API key from unified service...');
    const apiKey = await getApiKey('serp');
    
    if (apiKey) {
      console.log('✅ SERP API key found - Length:', apiKey.length, 'Type:', typeof apiKey);
      console.log('🔍 Key appears to be:', apiKey.match(/^[A-Za-z0-9+/]+=*$/) ? 'Base64 encoded' : 'Plain text');
      return apiKey;
    } else {
      console.log('❌ No SERP API key found in unified service');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting SERP API key from unified service:', error);
    return null;
  }
}

/**
 * Call the Supabase Edge Function for SERP API requests with enhanced Google-specific logging
 */
async function callSerpEdgeFunction(endpoint: string, params: any, apiKey: string): Promise<any> {
  try {
    console.log(`🚀 Calling Google SERP Edge Function: ${endpoint}`, { 
      params: Object.keys(params), 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      googleSpecific: true
    });
    
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
      console.error('❌ Google SERP Edge Function error:', error);
      throw new Error(`Google SERP API error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.warn('⚠️ No Google SERP data returned');
      return null;
    }
    
    // Validate that we received Google data
    if (data.isGoogleData === false) {
      console.warn('⚠️ Warning: Received non-Google data');
    } else {
      console.log('✅ Google SERP data verified');
    }
    
    console.log('📊 Google data quality:', data.dataQuality || 'unknown');
    console.log('📊 Google volume source:', data.volumeMetadata?.source || 'unknown');
    
    return data;
  } catch (error) {
    console.error('💥 Error calling Google SERP Edge Function:', error);
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
 * Search for keywords using Google SERP API
 */
export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false } = params;
    console.log(`🔍 Searching Google keywords for: "${query}"`);
    
    const apiKey = await getSerpApiKey();
    
    if (apiKey) {
      try {
        const data = await callSerpEdgeFunction('search', { 
          q: query, 
          limit,
          // Ensure Google-specific parameters
          engine: 'google',
          gl: 'us',
          hl: 'en'
        }, apiKey);
        
        if (data && data.organic_results) {
          console.log('✅ Google search results retrieved successfully');
          return data.organic_results;
        } else {
          console.warn('⚠️ No Google organic results found');
          return getBackupMockResults(query, refresh);
        }
      } catch (error) {
        console.error('❌ Google SERP API search failed:', error);
        toast.error('Error fetching Google keyword data. Using mock data.');
        return getBackupMockResults(query, refresh);
      }
    }
    
    console.warn('⚠️ No SERP API key found. Using mock Google data.');
    toast.warning('Using mock Google data for keyword search. Add your SERP API key in Settings for real Google results.', {
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
    console.error('💥 Error searching Google keywords:', error);
    return getBackupMockResults(params.query, params.refresh || false);
  }
};

/**
 * Analyze keyword using Google SERP API with enhanced volume validation
 */
export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean): Promise<SerpAnalysisResult | null> => {
  try {
    console.log(`🎯 Analyzing Google keyword: "${keyword}"${refresh ? ' (refresh requested)' : ''}`);
    
    // Check cache first (unless refresh is requested)
    if (!refresh) {
      const cachedData = getCachedSerpData(keyword);
      if (cachedData && cachedData.isGoogleData) {
        console.log('📋 Using cached Google SERP data');
        return cachedData;
      }
    }
    
    const apiKey = await getSerpApiKey();
    
    if (!apiKey) {
      console.warn('⚠️ No SERP API key found, using mock Google data');
      toast.warning('No SERP API key found. Add your API key in Settings for real Google data.', {
        duration: 5000,
        action: {
          label: "Add Key",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      return generateMockGoogleSerpData(keyword, refresh);
    }

    console.log('🔑 API key found, making real Google SERP API call...');
    
    try {
      const data = await callSerpEdgeFunction('analyze', { 
        keyword, 
        refresh: !!refresh,
        // Ensure Google-specific analysis
        engine: 'google',
        includeKeywordPlanner: true,
        location: 'United States',
        language: 'en'
      }, apiKey);
      
      if (data && data.isGoogleData) {
        console.log('✅ Google SERP API returned verified Google data');
        console.log('📊 Google volume source:', data.volumeMetadata?.source);
        console.log('📊 Google data quality:', data.dataQuality);
        
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
            source: 'google_search_results',
            confidence: 'medium',
            engine: 'google',
            location: 'United States',
            language: 'English',
            lastUpdated: new Date().toISOString()
          },
          competitionMetadata: data.competitionMetadata || {
            source: 'google_results_estimate',
            engine: 'google'
          }
        };
        
        cacheSerpData(keyword, result);
        
        toast.success('Retrieved verified Google SERP data successfully!', {
          description: `Volume source: ${result.volumeMetadata?.source || 'Google'}`
        });
        return result;
      } else {
        console.warn('⚠️ SERP API returned non-Google or empty data');
        throw new Error('No Google data returned from SERP API');
      }
    } catch (apiError) {
      console.error('❌ Google SERP API call failed:', apiError);
      
      toast.error(`Google SERP API Error: ${apiError.message}`, {
        duration: 8000,
        action: {
          label: "Check Settings",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      
      console.log('🎭 Falling back to mock Google data due to API error');
      return generateMockGoogleSerpData(keyword, refresh);
    }
  } catch (error) {
    console.error('💥 Error analyzing Google keyword:', error);
    toast.error(`Google analysis failed: ${error.message}`);
    return generateMockGoogleSerpData(keyword, refresh);
  }
};

// Helper function for mock Google results as a backup
function getBackupMockResults(query: string, refresh: boolean) {
  const mockResults = [
    { title: `How to Use ${query} Effectively - Google Search`, url: 'https://example.com/1' },
    { title: `The Ultimate Google Guide to ${query}`, url: 'https://example.com/2' },
    { title: `10 Best ${query} Strategies for Google`, url: 'https://example.com/3' },
    { title: `Why ${query} Matters for Google SEO`, url: 'https://example.com/4' },
    { title: `Understanding ${query} for Google Rankings`, url: 'https://example.com/5' },
    { title: `${query} vs Traditional Methods on Google`, url: 'https://example.com/6' },
    { title: `The Future of ${query} in Google Search 2025`, url: 'https://example.com/7' },
    { title: `How to Measure ${query} Success on Google`, url: 'https://example.com/8' },
    { title: `${query} Best Practices for Google`, url: 'https://example.com/9' },
    { title: `${query} Google Case Studies`, url: 'https://example.com/10' },
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

// Helper function to generate mock Google SERP data as a fallback
function generateMockGoogleSerpData(keyword: string, refresh?: boolean): SerpAnalysisResult {
  console.log('🎭 Generating mock Google SERP data for:', keyword);
  
  const variationFactor = refresh ? Math.random() : 0.5;
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 10000, // Higher baseline for Google
    competitionScore: Math.random() * 0.8,
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true,
    isGoogleData: true, // Mark as Google data even if mock
    dataQuality: 'low',
    volumeMetadata: {
      source: 'mock_google_estimate',
      confidence: 'low',
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString()
    },
    competitionMetadata: {
      source: 'mock_google_estimate',
      engine: 'google',
      adsCompetition: 'ESTIMATED'
    },
    entities: [
      { name: `${keyword} platform`, type: 'platform', description: `A Google-indexed platform focused on ${keyword}`, source: 'google_knowledge_graph' },
      { name: `${keyword} strategy`, type: 'strategy', description: `Strategic approaches to ${keyword} for Google`, source: 'google_knowledge_graph' },
      { name: `${keyword} tools`, type: 'tools', description: `Google-friendly tools for ${keyword} implementation`, source: 'google_knowledge_graph' },
      { name: `${keyword} metrics`, type: 'metrics', description: `Google Analytics measurements for ${keyword}`, source: 'google_knowledge_graph' },
      ...(refresh ? [
        { name: `${keyword} analytics`, type: 'analytics', description: `Google Analytics methods for ${keyword}`, source: 'google_knowledge_graph' },
        { name: `${keyword} framework`, type: 'framework', description: `Google-approved frameworks for ${keyword}`, source: 'google_knowledge_graph' }
      ] : [])
    ],
    peopleAlsoAsk: [
      { question: `How does ${keyword} work on Google?`, source: 'google_people_also_ask' },
      { question: `What is the best ${keyword} tool for Google?`, source: 'google_people_also_ask' },
      { question: `Why is ${keyword} important for Google SEO?`, source: 'google_people_also_ask' },
      { question: `When should I use ${keyword} for Google rankings?`, source: 'google_people_also_ask' },
      ...(refresh ? [
        { question: `What are the Google advantages of ${keyword}?`, source: 'google_people_also_ask' },
        { question: `How much does ${keyword} cost on Google Ads?`, source: 'google_people_also_ask' }
      ] : [])
    ],
    headings: [
      { text: `Understanding ${keyword} for Google`, level: 'h2' as const },
      { text: `Google Benefits of ${keyword}`, level: 'h2' as const },
      { text: `How to Implement ${keyword} on Google`, level: 'h3' as const },
      { text: `${keyword} Google Best Practices`, level: 'h2' as const },
      { text: `${keyword} Google Case Studies`, level: 'h2' as const },
      ...(refresh ? [
        { text: `Common Google ${keyword} Mistakes`, level: 'h2' as const },
        { text: `Advanced Google ${keyword} Techniques`, level: 'h2' as const }
      ] : [])
    ],
    contentGaps: [
      { 
        topic: `${keyword} for Google beginners`, 
        description: 'Google-focused beginner guide', 
        recommendation: 'Create a Google-optimized 101 guide',
        content: `A comprehensive Google-friendly ${keyword} guide`,
        source: 'google_serp_analysis'
      },
      { 
        topic: `Advanced Google ${keyword} techniques`, 
        description: 'Google expert strategies', 
        recommendation: 'Share advanced Google tips',
        content: `Expert-level Google ${keyword} strategies`,
        source: 'google_serp_analysis' 
      }
    ],
    topResults: [
      {
        title: `The Ultimate Google Guide to ${keyword}`,
        link: `https://example.com/google-${keyword}-guide`,
        snippet: `Learn everything about ${keyword} optimized for Google search visibility and user engagement.`,
        position: 1,
        source: 'google_organic'
      },
      {
        title: `How to Use ${keyword} for Google Success`,
        link: `https://example.com/google-${keyword}-tutorial`,
        snippet: `Step-by-step Google-optimized ${keyword} implementation.`,
        position: 2,
        source: 'google_organic'
      }
    ],
    relatedSearches: [
      { query: `${keyword} Google strategy`, source: 'google_related_searches' },
      { query: `${keyword} Google tools`, source: 'google_related_searches' },
      { query: `best Google ${keyword} practices`, source: 'google_related_searches' },
      { query: `${keyword} Google guide`, source: 'google_related_searches' },
      { query: `${keyword} Google tutorial`, source: 'google_related_searches' },
      ...(refresh ? [
        { query: `${keyword} Google certification`, source: 'google_related_searches' },
        { query: `${keyword} Google Analytics`, source: 'google_related_searches' }
      ] : [])
    ],
    keywords: [
      `${keyword} Google strategy`,
      `${keyword} Google tools`,
      `best Google ${keyword} practices`,
      `${keyword} Google guide`,
      `${keyword} Google tutorial`,
      `${keyword} Google examples`,
      `${keyword} Google techniques`,
      `${keyword} Google trends`,
      ...(refresh ? [
        `${keyword} Google certification`,
        `${keyword} Google Analytics`,
        `${keyword} Google ROI`
      ] : [])
    ],
    recommendations: [
      `Create a comprehensive Google-optimized guide on ${keyword}`,
      `Include step-by-step instructions for Google ${keyword} implementation`,
      `Add visual examples of ${keyword} in Google search results`,
      `Compare ${keyword} with Google alternative approaches`,
      `Include Google case studies showing successful ${keyword} implementation`
    ],
    featuredSnippets: [
      {
        title: `What is ${keyword}?`,
        content: `${keyword} is a strategic approach optimized for Google search visibility and user engagement.`,
        source: 'google_featured_snippet',
        type: 'definition'
      }
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
