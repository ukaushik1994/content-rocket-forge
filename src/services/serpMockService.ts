/**
 * Enhanced Mock SERP service with comprehensive demo data
 * Provides realistic SERP analysis data for development and demo purposes
 */

import { SerpAnalysisResult } from '@/types/serp';

/**
 * Generate comprehensive mock SERP data for demonstration
 */
export const getMockSerpData = (keyword: string): SerpAnalysisResult => {
  console.log(`🔄 Generating mock SERP data for keyword: "${keyword}"`);
  
  const mockData: SerpAnalysisResult = {
    keyword,
    searchVolume: Math.floor(Math.random() * 50000) + 5000,
    competitionScore: Math.floor(Math.random() * 80) + 20,
    keywordDifficulty: Math.floor(Math.random() * 70) + 30,
    isMockData: true,
    isGoogleData: false,
    dataQuality: 'medium',
    
    // Volume metadata
    volumeMetadata: {
      source: 'mock_google_estimate',
      confidence: 'medium',
      engine: 'google',
      location: 'United States',
      language: 'en',
      lastUpdated: new Date().toISOString()
    },
    
    // Competition metadata
    competitionMetadata: {
      source: 'mock_google_estimate',
      engine: 'google',
      adsCompetition: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as 'LOW' | 'MEDIUM' | 'HIGH'
    },
    
    // Entities found in SERP
    entities: [
      {
        name: keyword.split(' ')[0] || 'Topic',
        type: 'main_topic',
        description: `Primary entity related to ${keyword}`,
        source: 'organic_results'
      },
      {
        name: 'Industry Expert',
        type: 'person',
        description: 'Leading authority in this field',
        source: 'knowledge_graph'
      },
      {
        name: 'Related Technology',
        type: 'technology',
        description: 'Commonly mentioned technology',
        source: 'organic_results'
      }
    ],
    
    // People Also Ask questions
    peopleAlsoAsk: [
      {
        question: `What is ${keyword}?`,
        answer: `${keyword} is a comprehensive approach that involves multiple strategies and considerations.`,
        source: 'Featured snippet from example.com',
        position: 1
      },
      {
        question: `How does ${keyword} work?`,
        answer: `${keyword} works through a systematic process that begins with understanding the fundamentals.`,
        source: 'Expert guide from authority-site.com',
        position: 2
      },
      {
        question: `Why is ${keyword} important?`,
        answer: `${keyword} is important because it provides significant benefits for businesses and individuals.`,
        source: 'Research from industry-leader.org',
        position: 3
      },
      {
        question: `What are the benefits of ${keyword}?`,
        answer: `Key benefits include improved efficiency, better outcomes, and enhanced performance.`,
        source: 'Analysis from trusted-source.net',
        position: 4
      },
      {
        question: `How to get started with ${keyword}?`,
        answer: `Getting started involves understanding the basics, setting clear goals, and taking systematic steps.`,
        source: 'Beginner guide from helpful-resource.com',
        position: 5
      }
    ],
    
    // Content headings found in top results
    headings: [
      { text: `Understanding ${keyword}: A Complete Guide`, level: 'h1' },
      { text: 'What You Need to Know', level: 'h2', subtext: 'Essential fundamentals' },
      { text: 'Getting Started', level: 'h2', subtext: 'Step-by-step approach' },
      { text: 'Best Practices', level: 'h2', subtext: 'Proven strategies' },
      { text: 'Common Challenges', level: 'h3', subtext: 'What to avoid' },
      { text: 'Implementation Tips', level: 'h3', subtext: 'Practical advice' },
      { text: 'Advanced Techniques', level: 'h2', subtext: 'For experienced users' },
      { text: 'Case Studies', level: 'h3', subtext: 'Real-world examples' },
      { text: 'Tools and Resources', level: 'h2', subtext: 'Helpful utilities' },
      { text: 'Future Trends', level: 'h3', subtext: 'What\'s coming next' }
    ],
    
    // Content gaps identified
    contentGaps: [
      {
        topic: `Beginner's Guide to ${keyword}`,
        description: 'Comprehensive introduction missing from top results',
        recommendation: 'Create detailed beginner-friendly content',
        content: `A step-by-step guide that explains ${keyword} from the ground up`,
        source: 'Content gap analysis'
      },
      {
        topic: `${keyword} Tools Comparison`,
        description: 'No comprehensive tool comparison found',
        recommendation: 'Compare popular tools and platforms',
        content: `Side-by-side comparison of top ${keyword} tools`,
        source: 'Competitive analysis'
      },
      {
        topic: `${keyword} Case Studies`,
        description: 'Limited real-world examples in current results',
        recommendation: 'Include detailed case studies',
        content: `Success stories and lessons learned from ${keyword} implementations`,
        source: 'Market research'
      },
      {
        topic: `Common ${keyword} Mistakes`,
        description: 'Error prevention content is lacking',
        recommendation: 'Address common pitfalls',
        content: `What to avoid when implementing ${keyword} strategies`,
        source: 'Expert insights'
      }
    ],
    
    // Top organic results
    topResults: [
      {
        title: `${keyword}: Complete Guide and Best Practices`,
        link: 'https://example-authority.com/guide',
        snippet: `Learn everything about ${keyword} with this comprehensive guide covering fundamentals, implementation, and advanced strategies.`,
        position: 1,
        source: 'Organic result #1'
      },
      {
        title: `How to Master ${keyword} in 2024`,
        link: 'https://industry-expert.com/mastery',
        snippet: `Step-by-step approach to ${keyword} with practical tips, tools, and real-world examples from industry experts.`,
        position: 2,
        source: 'Organic result #2'
      },
      {
        title: `${keyword} Tools and Resources`,
        link: 'https://tools-directory.com/resources',
        snippet: `Comprehensive directory of ${keyword} tools, platforms, and resources for beginners and professionals.`,
        position: 3,
        source: 'Organic result #3'
      }
    ],
    
    // Related searches
    relatedSearches: [
      { query: `${keyword} guide`, volume: Math.floor(Math.random() * 10000) + 1000 },
      { query: `${keyword} tools`, volume: Math.floor(Math.random() * 8000) + 800 },
      { query: `${keyword} best practices`, volume: Math.floor(Math.random() * 6000) + 600 },
      { query: `${keyword} tutorial`, volume: Math.floor(Math.random() * 5000) + 500 },
      { query: `${keyword} examples`, volume: Math.floor(Math.random() * 4000) + 400 },
      { query: `how to ${keyword}`, volume: Math.floor(Math.random() * 7000) + 700 },
      { query: `${keyword} tips`, volume: Math.floor(Math.random() * 3000) + 300 }
    ],
    
    // Relevant keywords
    keywords: [
      keyword,
      `${keyword} strategy`,
      `${keyword} implementation`,
      `${keyword} benefits`,
      `${keyword} guide`,
      `${keyword} tools`,
      `${keyword} best practices`,
      `${keyword} examples`,
      `${keyword} tutorial`,
      `${keyword} tips`
    ],
    
    // Content recommendations
    recommendations: [
      `Create comprehensive ${keyword} guide for beginners`,
      `Develop tool comparison and reviews`,
      `Include real-world case studies and examples`,
      `Address common challenges and solutions`,
      `Provide actionable implementation steps`,
      `Cover advanced techniques and strategies`,
      `Include visual aids and diagrams`,
      `Add interactive elements and tools`
    ],
    
    // Featured snippets
    featuredSnippets: [
      {
        title: `What is ${keyword}?`,
        content: `${keyword} is a strategic approach that combines multiple methodologies to achieve optimal results. It involves careful planning, systematic implementation, and continuous optimization.`,
        source: 'authoritative-source.com',
        type: 'paragraph'
      }
    ],
    
    // Knowledge graph data
    knowledgeGraph: {
      title: keyword,
      type: 'Topic',
      description: `${keyword} encompasses various strategies and methodologies used to achieve specific goals and objectives.`,
      attributes: {
        'Related to': 'Strategy, Implementation, Best Practices',
        'Used for': 'Optimization, Performance, Results',
        'Key aspects': 'Planning, Execution, Analysis'
      },
      relatedEntities: [
        { name: 'Strategy Planning', link: '#planning' },
        { name: 'Implementation Guide', link: '#implementation' },
        { name: 'Best Practices', link: '#practices' }
      ]
    },
    
    // Multimedia opportunities
    multimediaOpportunities: [
      {
        type: 'images',
        count: 25,
        suggestions: [
          { title: `${keyword} process diagram`, source: 'Visual content opportunity' },
          { title: `${keyword} comparison chart`, source: 'Infographic potential' },
          { title: `${keyword} step-by-step guide`, source: 'Tutorial images' }
        ]
      },
      {
        type: 'videos',
        count: 15,
        suggestions: [
          { title: `${keyword} tutorial series`, source: 'Educational content' },
          { title: `${keyword} case study presentation`, source: 'Success stories' },
          { title: `${keyword} expert interview`, source: 'Authority content' }
        ]
      }
    ],
    
    // Commercial signals
    commercialSignals: {
      hasShoppingResults: Math.random() > 0.5,
      hasAds: Math.random() > 0.3,
      commercialIntent: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
    }
  };
  
  return mockData;
};

/**
 * Generate mock keyword results for research
 */
export const getMockKeywordResults = (query: string): Array<{
  keyword: string;
  volume: number;
  competition: number;
  difficulty: number;
}> => {
  console.log(`🔄 Generating mock keyword results for: "${query}"`);
  
  const baseKeywords = [
    query,
    `${query} guide`,
    `${query} tips`,
    `${query} tutorial`,
    `${query} best practices`,
    `how to ${query}`,
    `${query} examples`,
    `${query} tools`,
    `${query} strategy`,
    `${query} benefits`
  ];
  
  return baseKeywords.map(keyword => ({
    keyword,
    volume: Math.floor(Math.random() * 20000) + 1000,
    competition: Math.floor(Math.random() * 100),
    difficulty: Math.floor(Math.random() * 100)
  }));
};