
import { callApiProxy } from '@/services/apiProxyService';
import { toast } from 'sonner';

const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour
const serpCache: Record<string, { data: any; timestamp: number }> = {};

// Define the SerpAnalysisResult type
export interface SerpAnalysisResult {
  keyword: string;
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  topResults?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  relatedSearches?: Array<{
    query: string;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source: string;
  }>;
  featuredSnippets?: Array<{
    content: string;
    source: string;
  }>;
  keywords?: string[];
  recommendations?: string[];
}

// Define the SerpSearchParams type
export interface SerpSearchParams {
  query: string;
  country?: string;
  num?: number;
}

/**
 * Analyze a keyword using the SERP API with caching
 */
export async function analyzeKeywordSerp(keyword: string): Promise<SerpAnalysisResult> {
  const cacheKey = `serp_${keyword.toLowerCase().trim()}`;
  
  // Check cache first
  const cachedResult = serpCache[cacheKey];
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_EXPIRY) {
    console.log(`Using cached SERP data for "${keyword}"`);
    return cachedResult.data;
  }
  
  try {
    console.log(`Fetching SERP data for "${keyword}"`);
    const response = await callApiProxy({
      service: 'serp',
      endpoint: 'search',
      params: { keyword, country: 'us' }
    });
    
    if (!response) {
      throw new Error('No response from SERP API');
    }
    
    // Process data to ensure it has the expected structure
    const processedData = processSerpResponse(response);
    
    // Cache the result
    serpCache[cacheKey] = {
      data: processedData,
      timestamp: Date.now()
    };
    
    return processedData;
  } catch (error: any) {
    console.error('Error analyzing keyword:', error);
    
    // For development/demo purposes, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock SERP data due to API error');
      const mockData = getMockSerpData(keyword);
      
      // Cache the mock result too
      serpCache[cacheKey] = {
        data: mockData,
        timestamp: Date.now()
      };
      
      return mockData;
    }
    
    toast.error(`API Error: ${error.message}`);
    throw error;
  }
}

// Add searchKeywords function
export async function searchKeywords(params: SerpSearchParams): Promise<any[]> {
  try {
    const response = await callApiProxy({
      service: 'serp',
      endpoint: 'keywords',
      params
    });
    
    return response?.results || [];
  } catch (error: any) {
    console.error('Error searching keywords:', error);
    toast.error(`API Error: ${error.message}`);
    
    // Return mock data for development
    return getMockKeywordResults(params.query);
  }
}

// Add analyzeContent function
export async function analyzeContent(content: string, keywords: string[] = []): Promise<SerpAnalysisResult> {
  try {
    const response = await callApiProxy({
      service: 'serp',
      endpoint: 'analyze',
      params: { content, keywords }
    });
    
    if (!response) {
      throw new Error('No response from content analysis API');
    }
    
    return response;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    toast.error(`API Error: ${error.message}`);
    
    // Return mock analysis data
    return {
      keyword: keywords[0] || '',
      searchVolume: 0,
      competitionScore: 0.5,
      keywordDifficulty: 50,
      keywords: keywords,
      recommendations: [
        'Add more specific details about the topic.',
        'Include more related keywords.',
        'Structure content with proper headings and subheadings.'
      ]
    };
  }
}

// Function to process and normalize API response
function processSerpResponse(response: any): SerpAnalysisResult {
  // Ensure response has expected structure
  const processedData = {
    keyword: response.keyword || '',
    searchVolume: response.searchVolume || 0,
    competitionScore: response.competitionScore || 0,
    topResults: response.topResults || [],
    relatedSearches: response.relatedSearches || [],
    peopleAlsoAsk: response.peopleAlsoAsk || [],
    featuredSnippets: response.featuredSnippets || []
  };
  
  return processedData;
}

// Mock SERP data for development/demo purposes
function getMockSerpData(keyword: string): SerpAnalysisResult {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.floor(Math.random() * 100),
    topResults: [
      {
        title: `${keyword} - Complete Guide`,
        link: 'https://example.com/complete-guide',
        snippet: `This complete guide covers everything you need to know about ${keyword}. Learn practical tips and strategies.`
      },
      {
        title: `${keyword} Explained in Simple Terms`,
        link: 'https://example.com/explained',
        snippet: `Understanding ${keyword} doesn't have to be complicated. Here's a simplified explanation.`
      },
      {
        title: `How to Master ${keyword} in 2025`,
        link: 'https://example.com/mastering',
        snippet: `Learn how to master ${keyword} with our step-by-step guide. Perfect for beginners and experts alike.`
      }
    ],
    relatedSearches: [
      { query: `best ${keyword} tools` },
      { query: `${keyword} vs competition` },
      { query: `how to learn ${keyword}` },
      { query: `${keyword} for beginners` },
      { query: `advanced ${keyword} techniques` }
    ],
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, source: 'https://example.com/what-is' },
      { question: `Why is ${keyword} important?`, source: 'https://example.com/importance' },
      { question: `How to get started with ${keyword}?`, source: 'https://example.com/getting-started' },
      { question: `What are the best practices for ${keyword}?`, source: 'https://example.com/best-practices' }
    ],
    featuredSnippets: [
      {
        content: `${keyword} is an essential aspect of modern business strategy. It involves analyzing data patterns to predict market trends and consumer behavior.`,
        source: 'https://example.com/featured'
      }
    ]
  };
}

// Mock keyword search results for development
function getMockKeywordResults(query: string): any[] {
  return [
    { title: `Best ${query} in 2025`, searchVolume: 3200 },
    { title: `Top 10 ${query} tools`, searchVolume: 2800 },
    { title: `How to use ${query} effectively`, searchVolume: 1900 },
    { title: `${query} for beginners`, searchVolume: 2100 },
    { title: `${query} advanced techniques`, searchVolume: 1500 },
    { title: `${query} vs alternatives`, searchVolume: 1700 },
    { title: `Why ${query} matters`, searchVolume: 1200 },
    { title: `${query} best practices`, searchVolume: 2400 }
  ];
}
