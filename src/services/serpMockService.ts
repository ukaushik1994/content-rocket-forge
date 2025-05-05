
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Generate mock SERP data for development and testing
 */
export function getMockSerpData(keyword: string): SerpAnalysisResult {
  // Generate a simple hash of the keyword to ensure consistent but varied results
  const keywordHash = simpleHash(keyword);
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true, // Flag to identify as mock data
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
    ],
    entities: [
      { name: keyword, type: 'main', importance: 10 },
      { name: `${keyword} methodology`, type: 'concept', importance: 8 },
      { name: `${keyword} tools`, type: 'product', importance: 7 },
      { name: `${keyword} experts`, type: 'person', importance: 6 },
      { name: `${keyword} software`, type: 'product', importance: 9 },
      { name: `${keyword} certification`, type: 'credential', importance: 5 },
      { name: `${keyword} best practices`, type: 'concept', importance: 8 },
    ],
    headings: [
      { text: `What is ${keyword}?`, level: 'h1', subtext: `A comprehensive introduction to ${keyword} and why it matters.` },
      { text: `The Benefits of ${keyword}`, level: 'h2', subtext: `Discover the key advantages of implementing ${keyword} in your strategy.` },
      { text: `How ${keyword} Works`, level: 'h2', subtext: `A step-by-step explanation of the ${keyword} process.` },
      { text: `${keyword} Best Practices`, level: 'h2', subtext: `Expert tips to maximize your ${keyword} effectiveness.` },
      { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2', subtext: `Learn from others' errors and improve your ${keyword} implementation.` },
    ],
    contentGaps: [
      { 
        topic: `${keyword} for beginners`, 
        description: `Most content assumes prior knowledge of ${keyword}, creating an opportunity for truly beginner-friendly content.`,
        recommendation: `Create a step-by-step guide specifically for newcomers to ${keyword} with clear explanations of basic concepts.`
      },
      { 
        topic: `${keyword} case studies`, 
        description: `Few competitors provide detailed real-world examples of successful ${keyword} implementation.`,
        recommendation: `Develop in-depth case studies showing measurable results from ${keyword} implementation.`
      },
      { 
        topic: `${keyword} tools comparison`, 
        description: `Current content lacks comprehensive comparisons of different ${keyword} tools and platforms.`,
        recommendation: `Create a detailed comparison chart of top ${keyword} tools with pricing, features, and ideal use cases.`
      },
    ],
    recommendations: [
      `Include "${keyword}" in your page title and H1 heading`,
      `Create content addressing common questions about ${keyword}`,
      `Use related keywords throughout your content naturally`,
      `Include visual elements to explain ${keyword} concepts`,
      `Add case studies or examples showing successful ${keyword} implementation`
    ]
  };
}

/**
 * Generate mock keyword search results
 */
export function getMockKeywordResults(query: string): any[] {
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

/**
 * Simple string hashing function for generating consistent but varied mock data
 */
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
