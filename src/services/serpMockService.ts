
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Generate mock SERP data for development/demo purposes
 */
export function getMockSerpData(keyword: string): SerpAnalysisResult {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true, // Flag to identify this as mock data
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
