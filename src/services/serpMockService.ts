
import { SerpApiResponse } from './serpApiService';

/**
 * Mock service for SERP API to be used in development and testing
 */
export const serpMockService = {
  /**
   * Return mock SERP data for a keyword
   */
  analyzeKeyword: async (keyword: string, regions?: string[]): Promise<SerpApiResponse> => {
    console.log(`Mock SERP service analyzing keyword: ${keyword} for regions: ${regions?.join(', ') || 'default'}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      keywords: [
        keyword + " guide",
        "best " + keyword,
        keyword + " examples",
        "how to use " + keyword,
        keyword + " tutorial",
        "why " + keyword + " is important",
        keyword + " for beginners",
        keyword + " advanced techniques"
      ],
      questions: [
        "What is " + keyword + "?",
        "How does " + keyword + " work?",
        "Why should I use " + keyword + "?",
        "Is " + keyword + " worth it?",
        "How to get started with " + keyword + "?"
      ],
      competitors: [
        { name: "Alternative to " + keyword, url: "https://example.com/alt1" },
        { name: keyword + " competitor", url: "https://example.com/alt2" },
        { name: "Similar to " + keyword, url: "https://example.com/alt3" }
      ],
      snippets: [
        { 
          title: "What is " + keyword, 
          content: keyword + " is a powerful tool that helps users achieve their goals efficiently." 
        },
        { 
          title: "Benefits of " + keyword, 
          content: "Using " + keyword + " can significantly improve productivity and results." 
        }
      ]
    };
  }
};
