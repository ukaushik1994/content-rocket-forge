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
    position: number; // Added position property
  }>;
  relatedSearches?: Array<{
    query: string;
    volume?: number; // Added volume property
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    source: string;
    answer?: string; // Added answer property
  }>;
  featuredSnippets?: Array<{
    content: string;
    source: string;
    type?: string; // Added type property
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
    
    // Check if response exists and has results property
    const results = response && typeof response === 'object' ? (response as any).results : [];
    return Array.isArray(results) ? results : [];
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
    
    return response as SerpAnalysisResult;
  } catch (error: any) {
    console.error('Error analyzing content:', error);
    toast.error(`API Error: ${error.message}`);
    
    // Return mock analysis data with the required keyword field
    return {
      keyword: keywords[0] || 'unknown',
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
  // Ensure response has expected structure and the required keyword field
  const processedData: SerpAnalysisResult = {
    keyword: response.keyword || '',
    searchVolume: response.searchVolume || 0,
    competitionScore: response.competitionScore || 0,
    keywordDifficulty: response.keywordDifficulty || 0,
    topResults: response.topResults ? response.topResults.map((result: any, index: number) => ({
      ...result,
      position: result.position || index + 1 // Ensure position exists
    })) : [],
    relatedSearches: response.relatedSearches ? response.relatedSearches.map((search: any) => ({
      ...search,
      volume: search.volume || 0 // Ensure volume exists
    })) : [],
    peopleAlsoAsk: response.peopleAlsoAsk ? response.peopleAlsoAsk.map((item: any) => ({
      ...item,
      answer: item.answer || 'No answer available' // Ensure answer exists
    })) : [],
    featuredSnippets: response.featuredSnippets ? response.featuredSnippets.map((snippet: any) => ({
      ...snippet,
      type: snippet.type || 'general' // Ensure type exists
    })) : []
  };
  
  return processedData;
}

// Mock SERP data for development/demo purposes
function getMockSerpData(keyword: string): SerpAnalysisResult {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    topResults: [
      {
        title: `${keyword} - Complete Guide`,
        link: 'https://example.com/complete-guide',
        snippet: `This complete guide covers everything you need to know about ${keyword}. Learn practical tips and strategies.`,
        position: 1
      },
      {
        title: `${keyword} Explained in Simple Terms`,
        link: 'https://example.com/explained',
        snippet: `Understanding ${keyword} doesn't have to be complicated. Here's a simplified explanation.`,
        position: 2
      },
      {
        title: `How to Master ${keyword} in 2025`,
        link: 'https://example.com/mastering',
        snippet: `Learn how to master ${keyword} with our step-by-step guide. Perfect for beginners and experts alike.`,
        position: 3
      }
    ],
    relatedSearches: [
      { query: `best ${keyword} tools`, volume: 1200 },
      { query: `${keyword} vs competition`, volume: 950 },
      { query: `how to learn ${keyword}`, volume: 1500 },
      { query: `${keyword} for beginners`, volume: 2200 },
      { query: `advanced ${keyword} techniques`, volume: 800 }
    ],
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, source: 'https://example.com/what-is', answer: `${keyword} is a powerful tool for improving SEO.` },
      { question: `Why is ${keyword} important?`, source: 'https://example.com/importance', answer: `${keyword} is crucial because it helps businesses reach their target audience.` },
      { question: `How to get started with ${keyword}?`, source: 'https://example.com/getting-started', answer: `To get started with ${keyword}, first research your target audience and competitors.` },
      { question: `What are the best practices for ${keyword}?`, source: 'https://example.com/best-practices', answer: `Best practices for ${keyword} include regular content updates and keyword research.` }
    ],
    featuredSnippets: [
      {
        content: `${keyword} is an essential aspect of modern business strategy. It involves analyzing data patterns to predict market trends and consumer behavior.`,
        source: 'https://example.com/featured',
        type: 'definition'
      }
    ]
  };
}

// Mock keyword search results for development
function getMockKeywordResults(query: string): any[] {
  return [
    { title: `Best ${query} in 2025`, searchVolume: 3200, volume: 3200 },
    { title: `Top 10 ${query} tools`, searchVolume: 2800, volume: 2800 },
    { title: `How to use ${query} effectively`, searchVolume: 1900, volume: 1900 },
    { title: `${query} for beginners`, searchVolume: 2100, volume: 2100 },
    { title: `${query} advanced techniques`, searchVolume: 1500, volume: 1500 },
    { title: `${query} vs alternatives`, searchVolume: 1700, volume: 1700 },
    { title: `Why ${query} matters`, searchVolume: 1200, volume: 1200 },
    { title: `${query} best practices`, searchVolume: 2400, volume: 2400 }
  ];
}
