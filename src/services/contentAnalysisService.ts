
import { analyzeContent as analyzeSerpContent } from './serpApiService';
import { callApiProxy } from './apiProxyService';

export interface ContentAnalysis {
  seoScore: number;
  keywords: string[];
  recommendations: string[];
  readabilityScore?: number;
  competitionScore?: number;
}

export async function analyzeContent(content: string, targetKeywords: string[] = []): Promise<ContentAnalysis> {
  try {
    // First, get keyword analysis from SERP API
    const serpAnalysis = await analyzeSerpContent(content, targetKeywords);
    
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
      seoScore: Math.round((serpAnalysis.competitionScore || 0.5) * 100),
      keywords: serpAnalysis.keywords,
      recommendations: serpAnalysis.recommendations,
      readabilityScore: aiAnalysis?.score ? Math.round(aiAnalysis.score * 10) : undefined,
      competitionScore: serpAnalysis.competitionScore
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    return {
      seoScore: 0,
      keywords: [],
      recommendations: [],
    };
  }
}
