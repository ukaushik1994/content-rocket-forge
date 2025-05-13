// Type definitions for SERP (Search Engine Results Page) data
import { SerpAnalysisResult, SearchResult } from '@/types/serp';

// Re-export the imported types to maintain backward compatibility
export type { SerpAnalysisResult, SearchResult };

export const analyzeKeywordSerp = async (
  keyword: string, 
  refresh: boolean = false, 
  regions?: string[]
): Promise<SerpAnalysisResult> => {
  console.log(`Analyzing keyword: ${keyword}, refresh: ${refresh}, regions: ${regions}`);
  // This would normally connect to a SERP API service
  // For now, we'll return mock data
  
  const mockResults: SearchResult[] = [
    {
      title: `Best results for ${keyword}`,
      link: "https://example.com/result1",
      url: "https://example.com/result1", // Include both link and url for compatibility
      snippet: `This is a comprehensive guide about ${keyword}.`,
      position: 1,
      domain: "example.com",
      featured: true
    },
    {
      title: `${keyword} - Ultimate Guide 2025`,
      link: "https://example.com/result2",
      url: "https://example.com/result2", // Include both link and url for compatibility
      snippet: `Learn everything about ${keyword} with our step-by-step guide.`,
      position: 2,
      domain: "guides.com",
      featured: false
    }
  ];
  
  return {
    keyword,
    searchResults: mockResults,
    topResults: mockResults, // Add topResults which is used in some components
    keywords: [
      `${keyword} guide`,
      `${keyword} tutorial`,
      `${keyword} examples`
    ],
    relatedSearches: [
      { query: `${keyword} best practices`, volume: 1200 },
      { query: `${keyword} for beginners`, volume: 890 },
      { query: `how to use ${keyword}`, volume: 760 }
    ],
    peopleAlsoAsk: [
      {
        question: `What is ${keyword}?`,
        source: "example.com",
        answer: `${keyword} is a powerful tool for...`
      },
      {
        question: `How to use ${keyword} effectively?`,
        source: "guides.com",
        answer: `To use ${keyword} effectively, you should...`
      }
    ],
    headings: [
      {
        text: `Introduction to ${keyword}`,
        level: "h1",
        type: "main"
      },
      {
        text: `Benefits of ${keyword}`,
        level: "h2",
        type: "section"
      },
      {
        text: `How to implement ${keyword}`,
        level: "h2",
        type: "section"
      },
      {
        text: `${keyword} best practices`,
        level: "h2",
        type: "section"
      }
    ],
    entities: [
      {
        name: keyword,
        type: "Concept",
        relevance: 0.95
      },
      {
        name: "Guide",
        type: "Content Type",
        relevance: 0.8
      }
    ],
    featuredSnippets: [
      {
        type: "Featured Snippet",
        content: `${keyword} is a powerful tool that helps with SEO.`,
        source: "example.com"
      }
    ],
    contentGaps: [
      {
        topic: `Detailed ${keyword} tutorials`,
        description: `Comprehensive step-by-step tutorials on ${keyword}`,
        recommendation: `Create detailed tutorials`
      },
      {
        topic: `${keyword} case studies`,
        description: `Real-world examples of ${keyword} implementation`,
        recommendation: `Add case studies`
      }
    ],
    searchFeatures: [
      {
        type: "Featured Snippet",
        content: `${keyword} is a powerful tool that helps with SEO.`,
        position: 0
      },
      {
        type: "People Also Ask",
        content: `Questions related to ${keyword}`,
        position: 3
      }
    ],
    competitors: [
      {
        domain: "example.com",
        title: `Ultimate ${keyword} Guide`,
        url: "https://example.com/guide",
        position: 1
      },
      {
        domain: "competitor.com",
        title: `${keyword} for Beginners`,
        url: "https://competitor.com/beginners",
        position: 2
      }
    ],
    statistics: {
      searchVolume: 1500,
      competition: 0.75
    },
    timestamp: new Date().toISOString(),
    searchCountries: regions || ['us', 'uk', 'global']
  };
};

export const searchKeywords = async (
  options: { query: string; refresh?: boolean } | string, 
  limit: number = 10
): Promise<Array<{ title: string }>> => {
  let query: string;
  let refresh = false;
  
  if (typeof options === 'string') {
    query = options;
  } else {
    query = options.query;
    refresh = options.refresh || false;
  }
  
  console.log(`Searching keywords for: ${query}, refresh: ${refresh}, limit: ${limit}`);
  
  // This would normally connect to a keyword suggestion API
  // For now, we'll return mock data with title property
  const mockResults = [
    { title: query },
    { title: `${query} guide` },
    { title: `${query} tutorial` },
    { title: `${query} best practices` },
    { title: `${query} examples` },
    { title: `${query} for beginners` },
    { title: `how to use ${query}` },
    { title: `why ${query} matters` },
    { title: `${query} vs alternatives` },
    { title: `${query} advanced techniques` }
  ].slice(0, limit);
  
  return mockResults;
};
