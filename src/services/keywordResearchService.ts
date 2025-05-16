
import { delay } from '@/utils/cacheUtils';
import { SearchKeywordParams } from '@/contexts/content-builder/types/content-types';

export async function searchKeywordIdeas({ query, refresh = false, limit = 10 }: SearchKeywordParams) {
  // Simulate API call
  await delay(1500);
  
  // Return mock data
  return {
    primary: query,
    related: generateRelatedKeywords(query, limit),
    volume: Math.floor(Math.random() * 10000) + 1000,
    competition: Math.random().toFixed(2),
    cpc: (Math.random() * 5).toFixed(2),
  };
}

export async function searchKeywordQuestions({ query, refresh = false, limit = 8 }: SearchKeywordParams) {
  // Simulate API call
  await delay(2000);
  
  return generateQuestions(query, limit);
}

// Added optional limit parameter for flexibility
function generateRelatedKeywords(keyword: string, limit: number = 10) {
  const prefixes = ['best', 'top', 'how to', 'why', 'what is', 'guide to'];
  const suffixes = ['tutorial', 'guide', 'tips', 'examples', 'services', 'software'];
  
  const related = [];
  for (let i = 0; i < limit; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    if (i % 3 === 0) {
      related.push(`${prefix} ${keyword}`);
    } else if (i % 3 === 1) {
      related.push(`${keyword} ${suffix}`);
    } else {
      related.push(`${prefix} ${keyword} ${suffix}`);
    }
  }
  
  return related;
}

// Added optional limit parameter for flexibility
function generateQuestions(keyword: string, limit: number = 8) {
  const questionPrefixes = [
    'How to', 
    'What is', 
    'Why is', 
    'Where can I find', 
    'When should I use',
    'Who needs'
  ];
  
  const questions = [];
  for (let i = 0; i < limit; i++) {
    const prefix = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)];
    questions.push(`${prefix} ${keyword}?`);
  }
  
  return questions;
}

// Export a research keyword wrapper for compatibility with keywordService
export const researchKeyword = async (keyword: string, refresh: boolean = false) => {
  return await searchKeywordIdeas({ query: keyword, refresh });
};
