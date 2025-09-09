
import { callApiProxy } from './apiProxyService';
import { analyzeKeywordSerp, searchKeywords } from './serpApiService';
import { SerpSearchParams } from '@/types/serp';

export interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  cpc?: string;
  competition?: string;
  intent?: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
}

export interface KeywordResearchResult {
  mainKeyword: string;
  relatedKeywords: KeywordSuggestion[];
  questions: string[];
  competitorKeywords: string[];
  trendData?: {
    period: string;
    volume: number;
  }[];
}

export async function researchKeyword(keyword: string): Promise<KeywordResearchResult> {
  try {
    console.log('Starting keyword research for:', keyword);
    
    // Get SERP data for the keyword
    const serpResults = await searchKeywords({
      query: keyword,
      limit: 10  // Use limit instead of num to match the SearchKeywordParams interface
    });
    
    console.log('SERP results received:', serpResults.length);
    
    // Get detailed keyword analysis
    const keywordAnalysis = await analyzeKeywordSerp(keyword);
    console.log('Keyword analysis received');
    
    // Map keyword data to our format - only use real data from API
    const relatedKeywords = keywordAnalysis.keywords?.map(kw => ({
      keyword: kw,
      searchVolume: 0, // Will be populated when real API provides this data
      difficulty: 0,
      cpc: '$0.00',
      competition: 'Unknown',
      intent: 'Informational' as 'Informational' | 'Commercial' | 'Transactional' | 'Navigational'
    })) || [];
    
    // Extract questions from people also ask data
    const questions = keywordAnalysis.peopleAlsoAsk?.map(item => item.question) || [];
    
    // Extract competitor keywords from related searches
    const competitorKeywords = keywordAnalysis.relatedSearches?.map(item => item.query) || [];
    
    // No trend data - would need real trending API
    const trendData: { period: string; volume: number }[] = [];

    return {
      mainKeyword: keyword,
      relatedKeywords,
      questions,
      competitorKeywords,
      trendData
    };
  } catch (error) {
    console.error('Keyword research error:', error);
    
    // Return empty data on error - no fallback mock data
    return {
      mainKeyword: keyword,
      relatedKeywords: [],
      questions: [],
      competitorKeywords: [],
      trendData: []
    };
  }
}
