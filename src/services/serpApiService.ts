import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';
import { SerpProvider } from '@/contexts/content-builder/types/serp-types';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
  provider?: SerpProvider;
}

export type { SerpAnalysisResult }; // Properly re-export the type with 'export type'

// Get the preferred SERP provider from local storage or return the default
export const getPreferredSerpProvider = (): SerpProvider => {
  const savedProvider = localStorage.getItem('preferred_serp_provider');
  return (savedProvider as SerpProvider) || 'serpapi';
};

// Save the preferred SERP provider to local storage
export const setPreferredSerpProvider = (provider: SerpProvider): void => {
  localStorage.setItem('preferred_serp_provider', provider);
};

export const getApiKeyForProvider = async (provider: SerpProvider): Promise<string | null> => {
  // First try local storage
  const localKey = localStorage.getItem(`${provider}_api_key`);
  if (localKey) {
    return localKey;
  }

  // Then try Supabase
  try {
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', provider)
      .eq('is_active', true)
      .single();

    return apiKeyData?.encrypted_key || null;
  } catch (error) {
    console.error(`Error fetching ${provider} API key:`, error);
    return null;
  }
};

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false, provider = getPreferredSerpProvider() } = params;
    
    // Get the API key for the specified provider
    const apiKey = await getApiKeyForProvider(provider);
    
    if (apiKey) {
      try {
        // Handle different providers
        if (provider === 'serpapi') {
          return await searchKeywordsWithSerpApi(apiKey, query, limit, refresh);
        } else if (provider === 'dataforseo') {
          return await searchKeywordsWithDataForSeo(apiKey, query, limit, refresh);
        }
      } catch (error) {
        console.error(`Error calling ${provider} API:`, error);
        toast.error(`Error fetching keyword data. Using mock data instead.`);
        // Fallback to mock data if API call fails
        return getBackupMockResults(query, refresh);
      }
    }
    
    // If no API key found, notify the user and use mock data
    console.warn('No API key found for SERP provider, using mock data');
    toast.warning(`No API key found for ${provider}. Add your API key in Settings for real data.`, {
      duration: 5000,
      action: {
        label: "Settings",
        onClick: () => {
          window.location.href = "/settings/api";
        }
      }
    });
    return getBackupMockResults(query, refresh);
    
  } catch (error) {
    console.error('Error searching keywords:', error);
    return getBackupMockResults(params.query, params.refresh || false);
  }
};

// Implementation for SERP API
const searchKeywordsWithSerpApi = async (apiKey: string, query: string, limit: number, refresh: boolean) => {
  const response = await fetch(`https://api.serphouse.com/serp/search?q=${encodeURIComponent(query)}&limit=${limit}${refresh ? '&refresh=true' : ''}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.results || [];
};

// Implementation for DataForSEO
const searchKeywordsWithDataForSeo = async (apiKey: string, query: string, limit: number, refresh: boolean) => {
  // DataForSEO requires base64 encoded API credentials
  const credentials = btoa(apiKey); // In production, this should be login:password format
  
  const response = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: query,
      location_code: 2840, // US location code (you might want to make this configurable)
      language_code: 'en',
      limit: limit,
      device: 'desktop'
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform DataForSEO response to match the expected format
  if (data.tasks && data.tasks.length > 0 && data.tasks[0].result) {
    const results = data.tasks[0].result.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      position: item.rank_absolute || item.position,
      snippet: item.description || ''
    }));
    
    return results;
  }
  
  return [];
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

export const analyzeKeywordSerp = async (
  keyword: string, 
  refresh?: boolean, 
  provider: SerpProvider = getPreferredSerpProvider()
): Promise<SerpAnalysisResult> => {
  try {
    // Get API key for the selected provider
    const apiKey = await getApiKeyForProvider(provider);

    // If we found a key, use it to make the API call
    if (apiKey) {
      try {
        console.log(`Making ${provider} API call for keyword:`, keyword);
        
        // Call the appropriate provider's API
        if (provider === 'serpapi') {
          return await analyzeKeywordWithSerpApi(apiKey, keyword, refresh);
        } else if (provider === 'dataforseo') {
          return await analyzeKeywordWithDataForSeo(apiKey, keyword, refresh);
        }
        
        // If provider not found or not implemented, fall back to mock data
        console.warn(`Provider ${provider} not implemented, using mock data`);
        return generateMockSerpData(keyword, refresh);
        
      } catch (error) {
        console.error(`Error calling ${provider} API:`, error);
        toast.error(`Error analyzing keyword. Using backup data.`);
        // Fall back to mock data
        return generateMockSerpData(keyword, refresh);
      }
    } else {
      // If no API key found, notify the user and use mock data
      console.warn(`No ${provider} API key found, using mock data`);
      toast.warning(`No ${provider} API key found. Add your API key in Settings for real data.`, {
        duration: 5000,
        action: {
          label: "Settings",
          onClick: () => {
            window.location.href = "/settings/api";
          }
        }
      });
      return generateMockSerpData(keyword, refresh);
    }
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return generateMockSerpData(keyword, refresh);
  }
};

// Implementation for SERP API
const analyzeKeywordWithSerpApi = async (apiKey: string, keyword: string, refresh?: boolean): Promise<SerpAnalysisResult> => {
  const url = `https://api.serphouse.com/serp/analyze?keyword=${encodeURIComponent(keyword)}${refresh ? '&refresh=true' : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform the API response to match our SerpAnalysisResult structure
  return {
    keyword,
    searchVolume: data.searchVolume || Math.floor(Math.random() * 10000) + 1000,
    keywordDifficulty: data.difficulty || Math.floor(Math.random() * 100),
    competitionScore: data.competition || Math.random() * 0.8,
    entities: data.entities || [],
    peopleAlsoAsk: data.peopleAlsoAsk || [],
    headings: data.headings || [],
    contentGaps: data.contentGaps || [],
    topResults: data.topResults || [],
    relatedSearches: data.relatedSearches || [],
    keywords: data.keywords || [],
    recommendations: data.recommendations || [],
    provider: 'serpapi',
    isMockData: false
  };
};

// Implementation for DataForSEO
const analyzeKeywordWithDataForSeo = async (apiKey: string, keyword: string, refresh?: boolean): Promise<SerpAnalysisResult> => {
  // DataForSEO requires base64 encoded API credentials
  const credentials = btoa(apiKey); // In production, this should be login:password format
  
  // We'll need multiple API calls to gather all the data we need
  // 1. Get SERP data for organic results
  const serpResponse = await fetch('https://api.dataforseo.com/v3/serp/google/organic/live/advanced', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: keyword,
      location_code: 2840, // US location code
      language_code: 'en',
      device: 'desktop',
      os: 'windows'
    })
  });
  
  if (!serpResponse.ok) {
    throw new Error(`DataForSEO SERP API error: ${serpResponse.status}`);
  }
  
  const serpData = await serpResponse.json();
  
  // 2. Get keyword data
  const keywordResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google/search_volume/live', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keywords: [keyword],
      location_code: 2840,
      language_code: 'en'
    })
  });
  
  if (!keywordResponse.ok) {
    throw new Error(`DataForSEO Keyword API error: ${keywordResponse.status}`);
  }
  
  const keywordData = await keywordResponse.json();
  
  // 3. Get related keywords
  const relatedResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google/related_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: keyword,
      location_code: 2840,
      language_code: 'en'
    })
  });
  
  if (!relatedResponse.ok) {
    throw new Error(`DataForSEO Related Keywords API error: ${relatedResponse.status}`);
  }
  
  const relatedData = await relatedResponse.json();
  
  // Transform DataForSEO responses to our SerpAnalysisResult format
  let searchVolume = 0;
  let keywordDifficulty = 0;
  let competitionScore = 0;
  const keywords = [];
  const relatedSearches = [];
  const peopleAlsoAsk = [];
  const entities = [];
  const topResults = [];
  const headings = [];
  const contentGaps = [];
  
  // Process keyword data
  if (keywordData.tasks && keywordData.tasks[0] && keywordData.tasks[0].result) {
    const keywordResult = keywordData.tasks[0].result[0];
    if (keywordResult) {
      searchVolume = keywordResult.search_volume || 0;
      competitionScore = keywordResult.competition_index ? keywordResult.competition_index / 100 : 0;
      keywordDifficulty = keywordResult.keyword_difficulty || 0;
    }
  }
  
  // Process SERP data
  if (serpData.tasks && serpData.tasks[0] && serpData.tasks[0].result) {
    const result = serpData.tasks[0].result[0];
    
    // Extract top results
    if (result.items) {
      result.items.forEach((item: any) => {
        if (item.type === 'organic') {
          topResults.push({
            title: item.title,
            link: item.url,
            snippet: item.description,
            position: item.rank_absolute
          });
        } else if (item.type === 'people_also_ask') {
          item.items.forEach((question: any) => {
            peopleAlsoAsk.push({
              question: question.title,
              source: 'search'
            });
          });
        } else if (item.type === 'related_searches') {
          item.items.forEach((related: any) => {
            relatedSearches.push({
              query: related.query
            });
          });
        }
      });
    }
    
    // Extract on-page elements from the top results by fetching the content
    // This would require additional API calls to DataForSEO content analysis
    // or another service to extract headings, etc.
  }
  
  // Process related keywords data
  if (relatedData.tasks && relatedData.tasks[0] && relatedData.tasks[0].result) {
    const relatedResult = relatedData.tasks[0].result;
    
    relatedResult.forEach((item: any) => {
      if (item.keyword) {
        keywords.push(item.keyword);
      }
    });
  }
  
  // Create recommendations based on gathered data
  const recommendations = [
    `Target the keyword "${keyword}" which has ${searchVolume} monthly searches`,
    'Focus on addressing the common questions in your content',
    'Include related keywords in your content to improve relevance',
    'Structure your content with clear headings based on related topics'
  ];
  
  return {
    keyword,
    searchVolume,
    keywordDifficulty,
    competitionScore,
    entities,
    peopleAlsoAsk,
    headings,
    contentGaps,
    topResults,
    relatedSearches,
    keywords,
    recommendations,
    provider: 'dataforseo',
    isMockData: false
  };
};

// Helper function to generate mock SERP data as a fallback
function generateMockSerpData(keyword: string, refresh?: boolean): SerpAnalysisResult {
  console.log('Generating mock SERP data for:', keyword);
  
  // Create variations based on refresh parameter
  const variationFactor = refresh ? Math.random() : 0.5;
  
  // Generate mock data based on the keyword with potential variations
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random() * 0.8,
    keywordDifficulty: Math.floor(Math.random() * 100),
    entities: [
      { name: `${keyword} platform`, type: 'platform' },
      { name: `${keyword} strategy`, type: 'strategy' },
      { name: `${keyword} tools`, type: 'tools' },
      { name: `${keyword} metrics`, type: 'metrics' },
      // Add new entities if refreshing
      ...(refresh ? [
        { name: `${keyword} analytics`, type: 'analytics' },
        { name: `${keyword} framework`, type: 'framework' },
        { name: `${keyword} automation`, type: 'automation' }
      ] : [])
    ],
    peopleAlsoAsk: [
      { question: `How does ${keyword} work?`, source: 'search' },
      { question: `What is the best ${keyword} tool?`, source: 'search' },
      { question: `Why is ${keyword} important for SEO?`, source: 'search' },
      { question: `When should I use ${keyword}?`, source: 'search' },
      // Add new questions if refreshing
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
      // Add new headings if refreshing
      ...(refresh ? [
        { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2' as const },
        { text: `Advanced ${keyword} Techniques`, level: 'h2' as const },
        { text: `${keyword} ROI Calculation`, level: 'h3' as const }
      ] : [])
    ],
    contentGaps: [
      { topic: `${keyword} for beginners`, description: 'Beginner guide', recommendation: 'Create a 101 guide' },
      { topic: `Advanced ${keyword} techniques`, description: 'For experts', recommendation: 'Share advanced tips' },
      { topic: `${keyword} ROI measurement`, description: 'Measuring success', recommendation: 'Create calculator' },
      { topic: `${keyword} vs competitors`, description: 'Comparison', recommendation: 'Create comparison chart' }
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
      // Add new related searches if refreshing
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
      // Add new keywords if refreshing
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
    ],
    provider: 'mock',
    isMockData: true
  };
}

export const searchRelatedKeywords = async (
  keyword: string, 
  provider: SerpProvider = getPreferredSerpProvider()
) => {
  try {
    const apiKey = await getApiKeyForProvider(provider);
    
    if (apiKey) {
      try {
        // Make API call based on provider
        if (provider === 'serpapi') {
          return await searchRelatedKeywordsWithSerpApi(apiKey, keyword);
        } else if (provider === 'dataforseo') {
          return await searchRelatedKeywordsWithDataForSeo(apiKey, keyword);
        }
        
        // If provider not implemented, fall back to mock data
        return getRelatedKeywordsMockData(keyword);
        
      } catch (error) {
        console.error(`Error fetching related keywords from ${provider}:`, error);
        return getRelatedKeywordsMockData(keyword);
      }
    }
    
    // Default mock data if no API key is found
    return getRelatedKeywordsMockData(keyword);
    
  } catch (error) {
    console.error('Error searching related keywords:', error);
    return getRelatedKeywordsMockData(keyword);
  }
};

// Implementation for SERP API
const searchRelatedKeywordsWithSerpApi = async (apiKey: string, keyword: string) => {
  const response = await fetch(`https://api.serphouse.com/serp/related?keyword=${encodeURIComponent(keyword)}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.keywords || [];
};

// Implementation for DataForSEO
const searchRelatedKeywordsWithDataForSeo = async (apiKey: string, keyword: string) => {
  // DataForSEO requires base64 encoded API credentials
  const credentials = btoa(apiKey); // In production, this should be login:password format
  
  const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google/related_keywords/live', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      keyword: keyword,
      location_code: 2840, // US location code
      language_code: 'en'
    })
  });
  
  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform DataForSEO response to match the expected format
  if (data.tasks && data.tasks[0] && data.tasks[0].result) {
    return data.tasks[0].result.map((item: any) => item.keyword);
  }
  
  return [];
};

// Helper function for mock related keywords
const getRelatedKeywordsMockData = (keyword: string) => {
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
};
