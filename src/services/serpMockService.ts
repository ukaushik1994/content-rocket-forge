
import { SerpAnalysisResult } from './serpApiService';

// Mock SERP API service for development and testing
export const serpMockService = {
  analyzeKeyword: async (keyword: string, regions?: string[]): Promise<SerpAnalysisResult> => {
    console.log(`[Mock] Analyzing keyword: ${keyword}, regions: ${regions ? regions.join(',') : 'default'}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data
    return {
      keyword,
      searchResults: [
        {
          title: `Ultimate Guide to ${keyword}`,
          url: "https://example.com/guide",
          link: "https://example.com/guide", // Added link property
          snippet: `This comprehensive guide covers everything you need to know about ${keyword}, including best practices, tips, and examples.`,
          position: 1,
          domain: "example.com",
          featured: true
        },
        {
          title: `${keyword} for Beginners`,
          url: "https://example.com/beginners",
          link: "https://example.com/beginners", // Added link property
          snippet: `New to ${keyword}? Start here with our beginner-friendly introduction to the core concepts and methodology.`,
          position: 2,
          domain: "beginners-guide.com",
          featured: false
        },
        {
          title: `Advanced ${keyword} Techniques`,
          url: "https://example.com/advanced",
          link: "https://example.com/advanced", // Added link property
          snippet: `Take your ${keyword} skills to the next level with these advanced techniques used by professionals.`,
          position: 3,
          domain: "pro-tips.com",
          featured: false
        }
      ],
      relatedKeywords: [
        `best ${keyword} tools`,
        `${keyword} examples`,
        `${keyword} for beginners`,
        `advanced ${keyword} techniques`,
        `${keyword} vs traditional methods`,
        `how to learn ${keyword}`,
        `${keyword} certification`,
        `${keyword} career path`
      ],
      questions: [
        `What is ${keyword}?`,
        `How do I get started with ${keyword}?`,
        `Why is ${keyword} important for businesses?`,
        `What are common mistakes to avoid with ${keyword}?`,
        `How can I measure success with ${keyword}?`,
        `What tools are used for ${keyword}?`,
        `How long does it take to learn ${keyword}?`,
        `What industries use ${keyword} the most?`
      ],
      entities: [
        {
          name: keyword,
          type: "Topic",
          relevance: 1.0
        },
        {
          name: "Digital Marketing",
          type: "Industry",
          relevance: 0.8
        },
        {
          name: "Data Analysis",
          type: "Skill",
          relevance: 0.7
        },
        {
          name: "Strategy",
          type: "Concept",
          relevance: 0.6
        }
      ],
      searchFeatures: [
        {
          type: "Featured Snippet",
          content: `${keyword} is a methodology that helps organizations improve their online visibility and reach their target audience more effectively.`,
          position: 0
        },
        {
          type: "People Also Ask",
          content: `Common questions about ${keyword}`,
          position: 2
        },
        {
          type: "Video Carousel",
          content: `Top video tutorials for ${keyword}`,
          position: 4
        }
      ],
      competitors: [
        {
          domain: "example.com",
          title: `The Complete ${keyword} Guide`,
          url: "https://example.com/complete-guide",
          link: "https://example.com/complete-guide", // Added link property
          position: 1
        },
        {
          domain: "competitor1.com",
          title: `${keyword} Ultimate Resource`,
          url: "https://competitor1.com/resource",
          link: "https://competitor1.com/resource", // Added link property
          position: 2
        },
        {
          domain: "competitor2.com",
          title: `${keyword} Step-by-Step Tutorial`,
          url: "https://competitor2.com/tutorial",
          link: "https://competitor2.com/tutorial", // Added link property
          position: 3
        }
      ],
      statistics: {
        searchVolume: 5000,
        competition: 0.65
      },
      timestamp: new Date().toISOString()
    };
  }
};
