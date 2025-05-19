
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Generate mock SERP data for testing or when API isn't available
 */
export function generateMockSerpData(keyword: string): SerpAnalysisResult {
  // Create a timestamp for the mock data
  const timestamp = new Date().toISOString();
  
  return {
    keyword: keyword,
    provider: 'mock',
    searchVolume: Math.floor(Math.random() * 10000),
    keywordDifficulty: Math.floor(Math.random() * 100),
    competitionScore: Math.random().toFixed(2),
    timestamp: timestamp,
    
    // Mock top results
    topResults: [
      { position: 1, title: `Best Guide to ${keyword}`, url: `https://example.com/${keyword.replace(/\s+/g, '-')}`, snippet: `Comprehensive guide about ${keyword} with tips and examples.` },
      { position: 2, title: `${keyword} Tutorial for Beginners`, url: `https://tutorial.com/${keyword.replace(/\s+/g, '-')}`, snippet: `Learn ${keyword} from scratch with our easy to follow step-by-step tutorial.` },
      { position: 3, title: `${keyword} Advanced Techniques`, url: `https://advanced.com/${keyword.replace(/\s+/g, '-')}`, snippet: `Take your ${keyword} skills to the next level with these advanced techniques.` }
    ],
    
    // Mock related searches
    relatedSearches: [
      { query: `${keyword} tutorial`, volume: Math.floor(Math.random() * 5000) },
      { query: `${keyword} examples`, volume: Math.floor(Math.random() * 3000) },
      { query: `${keyword} vs alternative`, volume: Math.floor(Math.random() * 2000) }
    ],
    
    // Mock questions
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, answer: `${keyword} is a popular topic that many people are interested in learning about.` },
      { question: `How to learn ${keyword}?`, answer: `The best way to learn ${keyword} is through practice and following tutorials.` },
      { question: `Is ${keyword} worth it?`, answer: `Yes, learning ${keyword} can provide many benefits and career opportunities.` }
    ],
    
    // Headings based on the keyword
    headings: [
      { text: `Introduction to ${keyword}`, level: 'h1', subtext: 'Getting started with the basics' },
      { text: `Benefits of ${keyword}`, level: 'h2', subtext: 'Why you should learn this' },
      { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2', subtext: 'Learning from others\' errors' },
      { text: `Advanced ${keyword} Techniques`, level: 'h2', subtext: 'Taking your skills to the next level' },
      { text: `${keyword} Tools and Resources`, level: 'h2', subtext: 'Essential tools for success' }
    ],
    
    // Mock entities
    entities: [
      { name: keyword, type: 'main_topic', importance: 10, description: `The primary topic of interest.` },
      { name: `${keyword} tools`, type: 'related_topic', importance: 7, description: `Software and resources related to ${keyword}.` },
      { name: `${keyword} techniques`, type: 'concept', importance: 6, description: `Methods and approaches for ${keyword}.` }
    ],
    
    // Mock content gaps
    contentGaps: [
      { topic: `${keyword} for beginners`, description: `Content tailored specifically for newcomers to ${keyword}.`, opportunity: 'high' },
      { topic: `${keyword} case studies`, description: `Real-world examples of ${keyword} in action.`, opportunity: 'medium' },
      { topic: `${keyword} vs alternatives`, description: `Comparative analysis of ${keyword} against similar options.`, opportunity: 'high' }
    ],
    
    // Mock featured snippets
    featuredSnippets: [
      { content: `${keyword} is a powerful technique that can help improve your results by up to 50% when applied correctly.`, type: 'paragraph', source: 'example.com' },
      { content: `Steps to master ${keyword}:\n1. Understand the basics\n2. Practice regularly\n3. Learn advanced techniques\n4. Apply to real projects`, type: 'list', source: 'tutorial.com' }
    ],
    
    // Mock keywords
    keywords: [
      { keyword: `${keyword} tutorial`, volume: 5000, difficulty: 30 },
      { keyword: `${keyword} examples`, volume: 3000, difficulty: 25 },
      { keyword: `${keyword} best practices`, volume: 2000, difficulty: 40 }
    ],
    
    // Mock recommendations
    recommendations: [
      `Include a comprehensive definition of ${keyword} in your content`,
      `Address the most common questions about ${keyword}`,
      `Provide practical examples of ${keyword} in action`,
      `Compare ${keyword} with alternatives`
    ]
  };
}
