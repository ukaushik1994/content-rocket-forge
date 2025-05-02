
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

export interface SerpAnalysisResult {
  keywords: string[];
  searchVolume?: number;
  competitionScore?: number;
  recommendations: string[];
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
