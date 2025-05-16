
import { delay } from '@/utils/cacheUtils';

// Define the proper type for search parameters
export interface SearchKeywordParams {
  query: string;
  refresh?: boolean;
  limit?: number; // Adding limit as an optional parameter
}

export async function searchKeywordIdeas({ query, refresh = false }: SearchKeywordParams) {
  // Simulate API call
  await delay(1500);
  
  // Return mock data
  return {
    primary: query,
    related: generateRelatedKeywords(query),
    volume: Math.floor(Math.random() * 10000) + 1000,
    competition: Math.random().toFixed(2),
    cpc: (Math.random() * 5).toFixed(2),
  };
}

export async function searchKeywordQuestions({ query, refresh = false }: SearchKeywordParams) {
  // Simulate API call
  await delay(2000);
  
  return generateQuestions(query);
}

function generateRelatedKeywords(keyword: string) {
  const prefixes = ['best', 'top', 'how to', 'why', 'what is', 'guide to'];
  const suffixes = ['tutorial', 'guide', 'tips', 'examples', 'services', 'software'];
  
  const related = [];
  for (let i = 0; i < 10; i++) {
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

function generateQuestions(keyword: string) {
  const questionPrefixes = [
    'How to', 
    'What is', 
    'Why is', 
    'Where can I find', 
    'When should I use',
    'Who needs'
  ];
  
  const questions = [];
  for (let i = 0; i < 8; i++) {
    const prefix = questionPrefixes[Math.floor(Math.random() * questionPrefixes.length)];
    questions.push(`${prefix} ${keyword}?`);
  }
  
  return questions;
}
