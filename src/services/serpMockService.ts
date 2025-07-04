
import { SerpAnalysisResult } from '@/types/serp';

/**
 * Generate mock SERP data for testing and demo purposes
 */
export const getMockSerpData = (keyword: string): SerpAnalysisResult => {
  // Process the keyword to create consistent but varying mock data
  const keywordHash = simpleHash(keyword);
  const searchVolume = 500 + (keywordHash % 9500); // Range: 500-10000
  const competitionScore = (keywordHash % 100) / 100; // Range: 0-1
  const keywordDifficulty = 10 + (keywordHash % 90); // Range: 10-99
  
  // Generate mock data structure
  return {
    keyword: keyword,
    searchVolume: searchVolume,
    keywordDifficulty: keywordDifficulty,
    competitionScore: competitionScore,
    
    // Mock keywords
    keywords: generateRelatedKeywords(keyword),
    
    // Mock top results
    topResults: generateMockResults(keyword, keywordHash),
    
    // Mock related searches
    relatedSearches: generateMockRelatedSearches(keyword, keywordHash),
    
    // Mock people also ask questions
    peopleAlsoAsk: generateMockPeopleAlsoAsk(keyword, keywordHash),
    
    // Mock featured snippets
    featuredSnippets: generateMockFeaturedSnippets(keyword, keywordHash),
    
    // Mock recommendations
    recommendations: generateMockRecommendations(keyword),
    
    // NEW: Mock entities
    entities: generateMockEntities(keyword, keywordHash),
    
    // NEW: Mock headings
    headings: generateMockHeadings(keyword, keywordHash),
    
    // NEW: Mock content gaps
    contentGaps: generateMockContentGaps(keyword, keywordHash),
    
    // Flag to indicate mock data
    isMockData: true
  };
};

/**
 * Generate mock keyword results for autosuggestions
 */
export const getMockKeywordResults = (query: string): any[] => {
  const baseKeywords = generateRelatedKeywords(query);
  return baseKeywords.map(kw => ({
    query: kw,
    volume: Math.floor(Math.random() * 5000) + 100
  }));
};

// Helper functions for generating mock data

/**
 * Generate related keywords based on the input keyword
 */
function generateRelatedKeywords(keyword: string): string[] {
  const prefixes = ['best', 'top', 'how to', 'why', 'what is', 'guide to'];
  const suffixes = ['tutorial', 'examples', 'tools', 'tips', 'strategies', 'benefits'];
  
  const cleanKeyword = keyword.toLowerCase().trim();
  const results = [
    cleanKeyword,
    `${prefixes[0]} ${cleanKeyword}`,
    `${cleanKeyword} ${suffixes[0]}`,
    `${prefixes[1]} ${cleanKeyword} ${suffixes[1]}`,
    `${prefixes[2]} use ${cleanKeyword}`,
    `${cleanKeyword} vs alternative`,
    `${prefixes[3]} use ${cleanKeyword}`,
    `advanced ${cleanKeyword} techniques`
  ];
  
  // Add some variation based on the keyword
  const hash = simpleHash(keyword);
  if (hash % 2 === 0) {
    results.push(`${cleanKeyword} for beginners`);
  } else {
    results.push(`${cleanKeyword} for advanced users`);
  }
  
  if (hash % 3 === 0) {
    results.push(`${cleanKeyword} trends ${new Date().getFullYear()}`);
  }
  
  return results;
}

/**
 * Generate mock search results
 */
function generateMockResults(keyword: string, hash: number): any[] {
  const numResults = 3 + (hash % 5); // 3-7 results
  const results = [];
  
  for (let i = 0; i < numResults; i++) {
    results.push({
      position: i + 1,
      title: generateTitle(keyword, i),
      link: `https://example.com/${keyword.replace(/\s+/g, '-').toLowerCase()}/${i + 1}`,
      snippet: generateSnippet(keyword, i)
    });
  }
  
  return results;
}

/**
 * Generate a mock title for search results
 */
function generateTitle(keyword: string, index: number): string {
  const templates = [
    `The Ultimate Guide to ${keyword}`,
    `${keyword}: Everything You Need to Know`,
    `How to Master ${keyword} in 2024`,
    `${keyword} - Complete Tutorial for Beginners`,
    `${keyword} Explained Simply: A Comprehensive Guide`,
    `10 Advanced ${keyword} Strategies That Actually Work`,
    `Why ${keyword} Matters: Essential Knowledge`,
    `${keyword} Mastery: From Beginner to Pro`,
    `The Complete ${keyword} Handbook (Updated for 2024)`,
    `${keyword} 101: The Fundamentals You Need to Know`
  ];
  
  return templates[index % templates.length];
}

/**
 * Generate a mock snippet for search results
 */
function generateSnippet(keyword: string, index: number): string {
  const templates = [
    `Learn everything about ${keyword} in this comprehensive guide. We cover all aspects from basic concepts to advanced techniques.`,
    `Looking to improve your ${keyword} skills? This guide provides detailed instructions and examples to help you master ${keyword}.`,
    `${keyword} is essential for success in today's competitive landscape. Discover how to leverage ${keyword} effectively.`,
    `Our step-by-step ${keyword} tutorial breaks down complex concepts into easy-to-understand sections, perfect for beginners.`,
    `Explore the latest trends and best practices for ${keyword}. This article offers insights from industry experts.`,
    `Wondering why ${keyword} matters? We explain the importance and benefits of implementing ${keyword} correctly.`,
    `This complete guide to ${keyword} covers everything from fundamental principles to advanced strategies.`,
    `${keyword} can transform your results when done properly. Learn the techniques professionals use to maximize the impact of ${keyword}.`,
    `Master ${keyword} with our comprehensive resource. We distill years of expertise into actionable advice.`,
    `Discover how leading companies leverage ${keyword} to achieve remarkable results. This guide provides a roadmap for implementation.`
  ];
  
  return templates[index % templates.length];
}

/**
 * Generate mock related searches
 */
function generateMockRelatedSearches(keyword: string, hash: number): any[] {
  const relatedKeywords = generateRelatedKeywords(keyword);
  const numToShow = 4 + (hash % 4); // 4-7 related searches
  
  return relatedKeywords.slice(0, numToShow).map(query => ({
    query,
    volume: 100 + (hash % 900) // 100-999
  }));
}

/**
 * Generate mock "people also ask" questions
 */
function generateMockPeopleAlsoAsk(keyword: string, hash: number): any[] {
  const questions = [
    `What is ${keyword}?`,
    `How does ${keyword} work?`,
    `What are the benefits of ${keyword}?`,
    `How to implement ${keyword}?`,
    `What are the best ${keyword} tools?`,
    `Is ${keyword} worth learning?`,
    `How much does ${keyword} cost?`,
    `What are ${keyword} best practices?`,
    `How to measure ${keyword} success?`,
    `What are common ${keyword} mistakes to avoid?`,
    `How long does it take to learn ${keyword}?`,
    `Who should use ${keyword}?`
  ];
  
  const numQuestions = 3 + (hash % 5); // 3-7 questions
  const result = [];
  
  for (let i = 0; i < numQuestions; i++) {
    const questionIndex = (hash + i) % questions.length;
    result.push({
      question: questions[questionIndex],
      answer: generateAnswer(questions[questionIndex], keyword),
      source: 'people_also_ask'
    });
  }
  
  return result;
}

/**
 * Generate a mock answer for a question
 */
function generateAnswer(question: string, keyword: string): string {
  if (question.startsWith('What is')) {
    return `${keyword} is a powerful strategy/tool/technique used to achieve specific outcomes in various contexts. It involves systematic approaches to problem-solving, analytics, and implementation.`;
  } else if (question.startsWith('How does')) {
    return `${keyword} works by utilizing specialized algorithms and methodologies to process information and deliver actionable insights. The process typically involves data collection, analysis, and implementation of findings.`;
  } else if (question.includes('benefits')) {
    return `The key benefits of ${keyword} include improved efficiency, better decision-making, cost reduction, and competitive advantage. Organizations that effectively implement ${keyword} often see measurable improvements in their results.`;
  } else if (question.includes('implement')) {
    return `To implement ${keyword}, start by defining clear objectives, assessing your current capabilities, selecting appropriate tools, training your team, and establishing metrics for success. A phased approach often works best.`;
  } else if (question.includes('tools')) {
    return `Popular ${keyword} tools include specialized software platforms, analytics suites, and integration frameworks. The best choice depends on your specific needs, budget, and existing technology stack.`;
  } else if (question.includes('worth')) {
    return `${keyword} is generally considered worth the investment for organizations looking to improve their outcomes. The return on investment varies by implementation but is typically positive when properly executed.`;
  } else if (question.includes('cost')) {
    return `The cost of ${keyword} varies widely depending on the scale of implementation, choice of tools, and whether external expertise is required. Basic implementations can start at minimal cost, while enterprise-level solutions may require significant investment.`;
  } else if (question.includes('best practices')) {
    return `${keyword} best practices include establishing clear goals, ensuring data quality, maintaining consistent processes, regular monitoring and adjustment, and ongoing education for team members.`;
  } else if (question.includes('measure')) {
    return `Success in ${keyword} can be measured through KPIs like efficiency improvements, cost reduction, revenue increase, customer satisfaction scores, and market share changes. Establish baselines before implementation to accurately track progress.`;
  } else if (question.includes('mistakes')) {
    return `Common mistakes in ${keyword} implementation include unclear objectives, insufficient planning, inadequate training, poor data quality, and failure to adapt to changing conditions. Avoiding these pitfalls increases chances of success.`;
  } else if (question.includes('learn')) {
    return `The learning curve for ${keyword} varies by individual and previous experience. Basic proficiency can often be achieved in weeks, while mastery may take months or years of practical application and continued education.`;
  } else if (question.includes('who should')) {
    return `${keyword} is beneficial for organizations and professionals seeking to improve efficiency, make data-driven decisions, or gain competitive advantage. It's particularly valuable in data-intensive fields and industries undergoing digital transformation.`;
  } else {
    return `${keyword} represents an important area of focus for many organizations. Understanding its principles and applications can provide significant advantages in today's competitive environment.`;
  }
}

/**
 * Generate mock featured snippets
 */
function generateMockFeaturedSnippets(keyword: string, hash: number): any[] {
  // Only generate featured snippets sometimes to simulate real search results
  if (hash % 3 !== 0) return [];
  
  return [{
    content: `${keyword} is a methodology/tool/approach that helps organizations improve their outcomes through systematic analysis and implementation. Key components include data collection, analytics, strategic planning, and continuous improvement. Effective ${keyword} implementation can lead to significant competitive advantages.`,
    source: `https://example.com/${keyword.toLowerCase().replace(/\s+/g, '-')}/definition`,
    type: 'definition'
  }];
}

/**
 * Generate recommendations based on mock SERP analysis
 */
function generateMockRecommendations(keyword: string): string[] {
  return [
    `Include "${keyword}" in your page title and H1 heading`,
    `Create content addressing common questions about ${keyword}`,
    `Use related keywords throughout your content naturally`,
    `Include visual elements to explain ${keyword} concepts`,
    `Add case studies or examples showing successful ${keyword} implementation`,
    `Create a FAQ section addressing top questions about ${keyword}`,
    `Consider creating a step-by-step guide for ${keyword}`,
    `Include statistics and data points about ${keyword} effectiveness`
  ];
}

/**
 * NEW: Generate mock entities
 */
function generateMockEntities(keyword: string, hash: number): any[] {
  const entities = [
    { name: keyword, type: 'main', importance: 10 },
    { name: `${keyword} methodology`, type: 'concept', importance: 8 },
    { name: `${keyword} tools`, type: 'product', importance: 7 },
    { name: `${keyword} experts`, type: 'person', importance: 6 },
    { name: `${keyword} software`, type: 'product', importance: 9 },
    { name: `${keyword} certification`, type: 'credential', importance: 5 },
    { name: `${keyword} conference`, type: 'event', importance: 4 },
    { name: `${keyword} association`, type: 'organization', importance: 3 },
    { name: `${keyword} journal`, type: 'publication', importance: 6 },
    { name: `${keyword} best practices`, type: 'concept', importance: 8 },
    { name: `${keyword} research`, type: 'field', importance: 7 },
    { name: `International ${keyword} standards`, type: 'standard', importance: 5 }
  ];

  // Get a random subset
  const numEntities = 6 + (hash % 6); // 6-11 entities
  return shuffle(entities).slice(0, numEntities);
}

/**
 * NEW: Generate mock headings
 */
function generateMockHeadings(keyword: string, hash: number): any[] {
  const headings = [
    { text: `What is ${keyword}?`, level: 'h1', subtext: `A comprehensive introduction to ${keyword} and why it matters.` },
    { text: `The Benefits of ${keyword}`, level: 'h2', subtext: `Discover the key advantages of implementing ${keyword} in your strategy.` },
    { text: `How ${keyword} Works`, level: 'h2', subtext: `A step-by-step explanation of the ${keyword} process.` },
    { text: `${keyword} Best Practices`, level: 'h2', subtext: `Expert tips to maximize your ${keyword} effectiveness.` },
    { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2', subtext: `Learn from others' errors and improve your ${keyword} implementation.` },
    { text: `Tools for ${keyword}`, level: 'h2', subtext: `Essential software and resources for successful ${keyword}.` },
    { text: `${keyword} vs Alternative Approaches`, level: 'h2', subtext: `A comparative analysis of different methodologies.` },
    { text: `Case Studies: ${keyword} Success Stories`, level: 'h2', subtext: `Real-world examples of successful ${keyword} implementation.` },
    { text: `Getting Started with ${keyword}`, level: 'h3', subtext: `Your first steps toward ${keyword} mastery.` },
    { text: `Advanced ${keyword} Techniques`, level: 'h3', subtext: `Taking your ${keyword} strategy to the next level.` },
    { text: `Measuring ${keyword} Success`, level: 'h3', subtext: `Key metrics and KPIs to track your ${keyword} performance.` },
    { text: `The Future of ${keyword}`, level: 'h2', subtext: `Emerging trends and predictions for ${keyword} evolution.` },
    { text: `${keyword} FAQs`, level: 'h2', subtext: `Answers to commonly asked questions about ${keyword}.` }
  ];
  
  const numHeadings = 5 + (hash % 5); // 5-9 headings
  return shuffle(headings).slice(0, numHeadings);
}

/**
 * NEW: Generate mock content gaps
 */
function generateMockContentGaps(keyword: string, hash: number): any[] {
  const gaps = [
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
    { 
      topic: `${keyword} ROI calculation`, 
      description: `There's limited content helping users calculate the return on investment for ${keyword} implementation.`,
      recommendation: `Develop an ROI calculator or framework specifically for ${keyword} initiatives.`
    },
    { 
      topic: `Common ${keyword} mistakes`, 
      description: `Competitors rarely address the pitfalls and how to avoid them when implementing ${keyword}.`,
      recommendation: `Create content addressing the top 10 mistakes in ${keyword} implementation with solutions for each.`
    },
    { 
      topic: `${keyword} certification guide`, 
      description: `There's a lack of comprehensive guides to obtaining ${keyword} certifications.`,
      recommendation: `Develop a roadmap to certification with study resources and practice materials.`
    },
    { 
      topic: `${keyword} implementation timeline`, 
      description: `Users need realistic expectations about how long ${keyword} implementation takes.`,
      recommendation: `Create a phased timeline template for ${keyword} implementation that readers can adapt.`
    },
    { 
      topic: `${keyword} for specific industries`, 
      description: `Most content is generic rather than tailored to specific industry applications of ${keyword}.`,
      recommendation: `Develop industry-specific guides showing how ${keyword} applies in different sectors.`
    }
  ];
  
  const numGaps = 3 + (hash % 3); // 3-5 gaps
  return shuffle(gaps).slice(0, numGaps);
}

/**
 * Simple string hashing function for generating consistent but varied mock data
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
