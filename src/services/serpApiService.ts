
import { callApiProxy } from './apiProxyService';

export interface SerpSearchParams {
  query: string;
  gl?: string;
  hl?: string;
  num?: number;
}

export interface SerpSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerpFeaturedSnippet {
  type: 'paragraph' | 'list' | 'table' | 'definition';
  content: string;
  source: string;
}

export interface SerpPeopleAlsoAsk {
  question: string;
  answer?: string;
  source?: string;
}

export interface SerpRelatedSearch {
  query: string;
  volume?: number;
}

export interface SerpImagePack {
  title: string;
  url: string;
  thumbnailUrl: string;
}

export interface SerpAnalysisResult {
  keywords: string[];
  searchVolume?: number;
  competitionScore?: number;
  keywordDifficulty?: number;
  recommendations: string[];
  peopleAlsoAsk?: SerpPeopleAlsoAsk[];
  relatedSearches?: SerpRelatedSearch[];
  topResults?: SerpSearchResult[];
  featuredSnippets?: SerpFeaturedSnippet[];
  imagePacks?: SerpImagePack[];
  knowledgeGraph?: {
    title?: string;
    description?: string;
    entityType?: string;
    attributes?: Record<string, string>;
  };
  localPack?: {
    businesses: { name: string; rating: number; address: string }[];
  };
}

export async function searchKeywords(params: SerpSearchParams): Promise<SerpSearchResult[]> {
  try {
    const data = await callApiProxy<{ results: SerpSearchResult[] }>({
      service: 'serp',
      endpoint: 'search',
      params
    });
    
    return data?.results || [];
  } catch (error) {
    console.error('SERP search error:', error);
    return [];
  }
}

export async function analyzeContent(content: string, keywords: string[]): Promise<SerpAnalysisResult> {
  try {
    const data = await callApiProxy<SerpAnalysisResult>({
      service: 'serp',
      endpoint: 'analyze',
      params: { content, keywords }
    });
    
    return data || {
      keywords: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('SERP analysis error:', error);
    return {
      keywords: [],
      recommendations: [],
    };
  }
}

export async function analyzeKeywordSerp(keyword: string): Promise<SerpAnalysisResult> {
  try {
    const data = await callApiProxy<SerpAnalysisResult>({
      service: 'serp',
      endpoint: 'analyze-keyword',
      params: { keyword }
    });
    
    return data || {
      keywords: [],
      recommendations: [],
    };
  } catch (error) {
    console.error('SERP keyword analysis error:', error);
    return {
      keywords: [],
      recommendations: [],
    };
  }
}
