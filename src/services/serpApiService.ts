
import { supabase } from '@/integrations/supabase/client';
import { SerpAnalysisResult, SerpSearchParams } from '@/types/serp';

interface SearchKeywordParams {
  query: string;
  limit?: number;
  refresh?: boolean;
}

export type { SerpAnalysisResult }; // Properly re-export the type with 'export type'

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

export const analyzeKeywordSerp = async (keyword: string, refresh?: boolean): Promise<SerpAnalysisResult> => {
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
      return generateMockSerpData(keyword, refresh);
    }
    
    // Mock data for now - in production, this would call the actual API
    return generateMockSerpData(keyword, refresh);
  } catch (error) {
    console.error('Error analyzing keyword:', error);
    return generateMockSerpData(keyword, refresh);
  }
};

// Helper function to generate mock SERP data
function generateMockSerpData(keyword: string, refresh?: boolean): SerpAnalysisResult {
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
    isMockData: true
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
