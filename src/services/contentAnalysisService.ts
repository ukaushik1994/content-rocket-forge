
import { analyzeSerpKeyword } from './serpApiService';
import { callApiProxy } from './apiProxyService';
import { toast } from 'sonner';
import { SerpAnalysisResult } from '@/types/serp';

export interface ContentAnalysis {
  seoScore: number;
  keywords: string[];
  recommendations: string[];
  readabilityScore?: number;
  competitionScore?: number;
  serp?: any; // Full SERP data
  searchVolume?: number;
  keywordDifficulty?: number;
}

export async function analyzeContent(content: string, targetKeywords: string[] = []): Promise<ContentAnalysis> {
  try {
    // For now, we'll just use the keyword analysis since the actual content analysis is missing
    // This is a placeholder that matches the expected return type
    const serpAnalysis = await analyzeSerpKeyword(targetKeywords[0] || '');
    
    // Then get AI analysis for readability and quality score
    const aiAnalysis = await callApiProxy<{
      analysis: string;
      score: number;
    }>({
      service: 'openai',
      endpoint: 'analyze',
      params: { content }
    });
    
    return {
      seoScore: Math.round((serpAnalysis?.competitionScore || 0.5) * 100),
      keywords: serpAnalysis?.keywords || [],
      recommendations: serpAnalysis?.recommendations || [],
      readabilityScore: aiAnalysis?.score ? Math.round(aiAnalysis.score * 10) : undefined,
      competitionScore: serpAnalysis?.competitionScore,
      serp: serpAnalysis,
      searchVolume: serpAnalysis?.searchVolume,
      keywordDifficulty: serpAnalysis?.keywordDifficulty
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    toast.error('Content analysis failed. Please try again.');
    return {
      seoScore: 0,
      keywords: [],
      recommendations: [],
    };
  }
}

export async function analyzeKeyword(keyword: string, refresh?: boolean): Promise<ContentAnalysis> {
  try {
    console.log(`Analyzing keyword: ${keyword}`);
    
    // Get comprehensive SERP data for the keyword
    const serpData = await analyzeSerpKeyword(keyword, refresh);
    
    console.log('SERP data received:', serpData);
    
    // Ensure we return all the expected data
    return {
      seoScore: Math.round((serpData?.competitionScore || 0.5) * 100),
      keywords: serpData?.keywords || [],
      recommendations: serpData?.recommendations || [],
      competitionScore: serpData?.competitionScore,
      serp: serpData,
      searchVolume: serpData?.searchVolume,
      keywordDifficulty: serpData?.keywordDifficulty
    };
  } catch (error) {
    console.error('Keyword analysis error:', error);
    toast.error(`Failed to analyze keyword: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      seoScore: 0,
      keywords: [],
      recommendations: [],
    };
  }
}
