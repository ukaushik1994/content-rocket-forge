
import { supabase } from '@/integrations/supabase/client';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
}

export const searchKeywords = async (params: SearchKeywordParams) => {
  try {
    const { query, limit = 10, refresh = false } = params;
    
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.error('No SERP API key found in settings');
      return [];
    }
    
    // Add a cache-busting parameter if refresh is true
    const cacheBuster = refresh ? `&_cb=${Date.now()}` : '';
    
    // Mock data for development - in production, this would call the actual API
    // This is just a placeholder
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
    
    // If refreshing, shuffle the results to simulate new data
    if (refresh) {
      return mockResults
        .map(item => ({ 
          ...item, 
          title: item.title.replace(query, `${query} ${['Expert', 'Professional', 'Advanced', 'Strategic'][Math.floor(Math.random() * 4)]}`)
        }))
        .sort(() => Math.random() - 0.5);
    }
    
    return mockResults;
  } catch (error) {
    console.error('Error searching keywords:', error);
    return [];
  }
};

interface AnalyzeKeywordParams {
  keyword: string;
  refresh?: boolean;
}

export const analyzeKeywordSerp = async (keyword: string) => {
  try {
    // Get the SERP API key from the user's settings
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', 'serp')
      .eq('is_active', true)
      .single();

    if (!apiKey) {
      console.warn('No SERP API key found in settings, using mock data');
      // Return mock data instead of null for testing
      return generateMockSerpData(keyword);
    }
    
    // Mock data for now - in production, this would call the actual API
    return generateMockSerpData(keyword);
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return null;
  }
};

// Helper function to generate mock SERP data
function generateMockSerpData(keyword: string) {
  // Generate mock data based on the keyword
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    difficulty: Math.floor(Math.random() * 100),
    entities: [
      `${keyword} platform`,
      `${keyword} strategy`,
      `${keyword} tools`,
      `${keyword} metrics`,
    ],
    questions: [
      `How does ${keyword} work?`,
      `What is the best ${keyword} tool?`,
      `Why is ${keyword} important for SEO?`,
      `When should I use ${keyword}?`,
    ],
    headings: [
      `Understanding ${keyword}`,
      `Benefits of ${keyword}`,
      `How to Implement ${keyword}`,
      `${keyword} Best Practices`,
      `${keyword} Case Studies`,
    ],
    contentGaps: [
      `${keyword} for beginners`,
      `Advanced ${keyword} techniques`,
      `${keyword} ROI measurement`,
      `${keyword} vs competitors`,
    ],
    topRanks: [
      {
        title: `The Ultimate Guide to ${keyword}`,
        url: `https://example.com/${keyword}-guide`,
        snippet: `Learn everything you need to know about ${keyword} with our comprehensive guide.`
      },
      {
        title: `How to Use ${keyword} Effectively`,
        url: `https://example.com/${keyword}-tutorial`,
        snippet: `Step-by-step tutorial on implementing ${keyword} for maximum results.`
      },
      {
        title: `${keyword} Tips and Tricks`,
        url: `https://example.com/${keyword}-tips`,
        snippet: `Expert advice on getting the most out of your ${keyword} strategy.`
      }
    ]
  };
}

export const searchRelatedKeywords = async (keyword: string) => {
  try {
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
  } catch (error) {
    console.error('Error searching related keywords:', error);
    return [];
  }
};
