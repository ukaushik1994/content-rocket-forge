
import { callApiProxy } from './apiProxyService';
import { toast } from 'sonner';

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
    toast.error('Failed to search keywords. Please try again.');
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
    toast.error('Failed to analyze content. Please try again.');
    return {
      keywords: [],
      recommendations: [],
    };
  }
}

export async function analyzeKeywordSerp(keyword: string): Promise<SerpAnalysisResult> {
  try {
    console.log(`Calling SERP API for keyword: ${keyword}`);
    const data = await callApiProxy<SerpAnalysisResult>({
      service: 'serp',
      endpoint: 'analyze-keyword',
      params: { keyword }
    });
    
    if (!data) {
      throw new Error('No data returned from SERP API');
    }
    
    return data;
  } catch (error) {
    console.error('SERP keyword analysis error:', error);
    toast.error('Failed to analyze keyword. Please try again.');
    return {
      keywords: [],
      recommendations: [],
    };
  }
}
