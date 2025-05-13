
/**
 * Mock service for SERP analysis when real API is not available
 */
import { SerpApiResponse } from './serpApiService';

export const serpMockService = {
  /**
   * Generate mock SERP data for testing
   */
  analyzeKeyword: async (keyword: string, regions?: string[]): Promise<SerpApiResponse> => {
    // Create a delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`Generating mock SERP data for "${keyword}" in regions: ${regions?.join(', ') || 'default'}`);
    
    // Generate mock data based on the keyword
    return {
      keywords: [
        keyword,
        `best ${keyword}`,
        `${keyword} examples`,
        `how to use ${keyword}`,
        `${keyword} tutorial`,
        `${keyword} vs competition`
      ],
      questions: [
        `What is ${keyword}?`,
        `How does ${keyword} work?`,
        `Why is ${keyword} important?`,
        `When should I use ${keyword}?`,
        `Where can I learn more about ${keyword}?`
      ],
      competitors: [
        { title: `${keyword} - Competitor 1`, url: 'https://example.com/competitor1' },
        { title: `${keyword} Guide - Competitor 2`, url: 'https://example.com/competitor2' },
        { title: `How to Master ${keyword} - Competitor 3`, url: 'https://example.com/competitor3' }
      ],
      snippets: [
        { 
          title: `${keyword} Definition`,
          content: `${keyword} is a powerful tool that helps businesses improve their performance.`
        },
        { 
          title: `Benefits of ${keyword}`,
          content: `Using ${keyword} can lead to increased productivity and better results.`
        },
        { 
          title: `${keyword} Best Practices`,
          content: `When implementing ${keyword}, it's important to follow these guidelines...`
        }
      ]
    };
  }
};
