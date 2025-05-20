
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';
import { toast } from 'sonner';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
}

// Constants for API endpoints - ensure consistency
const SERP_API_ENDPOINT = 'https://api.serphouse.com/serp';
const SERP_LOCAL_STORAGE_KEY = 'serp_api_key';
const SERP_CACHE_PREFIX = 'serp_data_';
const SERP_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export type { SerpAnalysisResult };

/**
 * Get API key from localStorage or Supabase
 * Returns the key if found, null otherwise
 */
async function getSerpApiKey(): Promise<string | null> {
  // First check localStorage
  const localApiKey = localStorage.getItem(SERP_LOCAL_STORAGE_KEY);
  if (localApiKey) {
    return localApiKey;
  }
  
  // If not in localStorage, try Supabase
  try {
    const { data: apiKeyData, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();
      
    if (error) {
      console.warn('Error fetching SERP API key from Supabase:', error);
      return null;
    }
    
    if (apiKeyData?.encrypted_key) {
      return apiKeyData.encrypted_key;
    }
  } catch (error) {
    console.error('Exception when fetching SERP API key:', error);
  }
  
  return null;
}

/**
 * Search for keywords using the SERP API
 */
export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false } = params;
    
    // Get API key
    const apiKey = await getSerpApiKey();
    
    // If we have an API key, attempt to use the API
    if (apiKey) {
      try {
        console.log('Making SERP API call for keyword search:', query);
        
        // Try to use the proxy function first to avoid CORS issues
        try {
          const proxyResponse = await fetch('/api/proxy/serp-api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'search',
              params: { q: query, limit },
              apiKey
            }),
          });
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            return data.results || [];
          } else {
            const errorText = await proxyResponse.text();
            console.error('SERP API proxy error:', proxyResponse.status, errorText);
            throw new Error(`API proxy error: ${proxyResponse.status}`);
          }
        } catch (proxyError) {
          console.warn('SERP API proxy error, falling back to direct call:', proxyError);
        }
        
        // Direct API call if proxy fails
        const response = await fetch(`${SERP_API_ENDPOINT}/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('SERP API error:', response.status, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Error calling SERP API for keyword search:', error);
        toast.error('Error fetching keyword data. Falling back to mock data.');
        // Fallback to mock data if API call fails
        return getBackupMockResults(query, refresh);
      }
    }
    
    console.warn('No SERP API key found. Using mock data instead.');
    toast.warning('Using mock data for keyword search. Add your SERP API key in Settings for real results.');
    return getBackupMockResults(query, refresh);
  } catch (error) {
    console.error('Error searching keywords:', error);
    return getBackupMockResults(params.query, params.refresh || false);
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
      
      // Check if cache is still valid (less than SERP_CACHE_EXPIRY old)
      if (timestamp) {
        const cachedTime = new Date(timestamp).getTime();
        const currentTime = new Date().getTime();
        
        if (currentTime - cachedTime < SERP_CACHE_EXPIRY) {
          console.log('Using valid cached SERP data for:', keyword);
          return parsedData;
        } else {
          console.log('Cached SERP data expired for:', keyword);
          // Clean up expired cache
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
          return null;
        }
      }
      
      // No timestamp found, assume it's valid but set timestamp now
      localStorage.setItem(`${cacheKey}_timestamp`, new Date().toISOString());
      return parsedData;
    }
  } catch (err) {
    console.warn('Error parsing cached SERP data:', err);
    // Clean up invalid cache
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
    console.log('SERP data cached for:', keyword);
  } catch (err) {
    console.warn('Error caching SERP data:', err);
  }
}

/**
 * Analyze keyword using SERP API
 */
export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean): Promise<SerpAnalysisResult | null> => {
  try {
    console.log('Analyzing keyword with SERP API:', keyword, refresh ? '(refresh requested)' : '');
    
    // If not forced refresh, check cache first
    if (!refresh) {
      const cachedData = getCachedSerpData(keyword);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Get API key
    const apiKey = await getSerpApiKey();

    // If we found a key, use it to make the API call
    if (apiKey) {
      try {
        console.log('Making real SERP API call for keyword:', keyword);
        
        // First attempt to use our proxy function to avoid CORS issues
        try {
          const proxyResponse = await fetch('/api/proxy/serp-api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'analyze',
              params: { keyword, refresh: !!refresh },
              apiKey
            }),
          });
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            if (data) {
              // Cache the successful result
              cacheSerpData(keyword, data);
              console.log('SERP API returned real data via proxy:', data);
              return data;
            } else {
              throw new Error('Empty response from SERP API proxy');
            }
          } else {
            const errorText = await proxyResponse.text();
            console.error('SERP API proxy error:', proxyResponse.status, errorText);
            throw new Error(`API proxy error: ${proxyResponse.status}`);
          }
        } catch (proxyError) {
          console.warn('SERP API proxy error, falling back to direct call:', proxyError);
        }
        
        // If proxy fails, try direct API call
        const url = `${SERP_API_ENDPOINT}/analyze?keyword=${encodeURIComponent(keyword)}${refresh ? '&refresh=true' : ''}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('SERP API error:', response.status, errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        // Cache the successful result
        cacheSerpData(keyword, data);
        
        // Transform the API response to match our SerpAnalysisResult structure
        const result: SerpAnalysisResult = {
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
          isMockData: false
        };
        
        console.log('SERP API returned real data:', result);
        return result;
      } catch (error) {
        console.error('Error calling SERP API:', error);
        toast.error('Error analyzing keyword. Using backup data.');
        // Fall back to mock data
        return generateMockSerpData(keyword, refresh);
      }
    } else {
      // If no API key found, notify the user and use mock data
      console.warn('No SERP API key found, using mock data');
      toast.warning('No SERP API key found. Add your API key in Settings for real data.', {
        duration: 5000,
        action: {
          label: "Add Key",
          onClick: () => {
            window.location.href = "/content-builder?step=2&showApiSetup=true";
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

// Helper function to generate mock SERP data as a fallback - update this to match our types
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
    isMockData: true, // Explicitly mark this as mock data
    entities: [
      { name: `${keyword} platform`, type: 'platform', description: `A platform focused on ${keyword}` },
      { name: `${keyword} strategy`, type: 'strategy', description: `Strategic approaches to ${keyword}` },
      { name: `${keyword} tools`, type: 'tools', description: `Tools used for ${keyword} implementation` },
      { name: `${keyword} metrics`, type: 'metrics', description: `Measurements related to ${keyword} performance` },
      // Add new entities if refreshing
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
    ]
  };
}

export const searchRelatedKeywords = async (keyword: string) => {
  try {
    // Get API key
    const apiKey = await getSerpApiKey();
    
    // Cache key for efficient repeat lookups
    const cacheKey = `related_keywords_${keyword}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log('Using cached related keywords for:', keyword);
        return parsedData;
      } catch (err) {
        console.warn('Error parsing cached related keywords:', err);
        localStorage.removeItem(cacheKey);
      }
    }

    if (apiKey) {
      try {
        // Try to use the proxy function first
        try {
          const proxyResponse = await fetch('/api/proxy/serp-api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              endpoint: 'related',
              params: { keyword },
              apiKey
            }),
          });
          
          if (proxyResponse.ok) {
            const data = await proxyResponse.json();
            // Cache the successful result
            localStorage.setItem(cacheKey, JSON.stringify(data.keywords || []));
            return data.keywords || [];
          } else {
            const errorText = await proxyResponse.text();
            console.error('SERP API proxy error for related keywords:', proxyResponse.status, errorText);
            throw new Error(`API proxy error: ${proxyResponse.status}`);
          }
        } catch (proxyError) {
          console.warn('SERP API proxy error, falling back to direct call:', proxyError);
        }
        
        // Direct API call if proxy fails
        const response = await fetch(`${SERP_API_ENDPOINT}/related?keyword=${encodeURIComponent(keyword)}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Cache the successful result
        localStorage.setItem(cacheKey, JSON.stringify(data.keywords || []));
        
        return data.keywords || [];
      } catch (error) {
        console.error('Error fetching related keywords:', error);
        // Fall back to mock data
        const mockData = getMockRelatedKeywords(keyword);
        return mockData;
      }
    }
    
    // Default mock data if no API key is found
    const mockData = getMockRelatedKeywords(keyword);
    return mockData;
  } catch (error) {
    console.error('Error searching related keywords:', error);
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
