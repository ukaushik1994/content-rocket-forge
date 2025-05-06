
/**
 * Comprehensive SEO analyzer that combines all analysis tools
 */

import { calculateKeywordUsage, calculateKeywordUsageScore, calculateOverallSeoScore } from './keywordAnalysis';
import { calculateReadability } from './nlp/textAnalysis';
import { analyzeContentStructure, detectMainTopics } from './nlp/contentStructure';
import { analyzeSolutionIntegration } from './solution/analyzeSolutionIntegration';
import { SeoImprovement } from '@/contexts/content-builder/types/seo-types';

export interface SeoAnalysisResult {
  seoScore: number;
  keywordScore: number;
  readabilityScore: number;
  contentLengthScore: number;
  structureScore: number;
  keywordUsage: any[];
  recommendations: string[];
  improvementIds: string[];
  improvements: SeoImprovement[];
}

/**
 * Analyze content for SEO performance and generate recommendations
 */
export const analyzeSeo = (
  content: string, 
  mainKeyword: string,
  selectedKeywords: string[] = []
): SeoAnalysisResult => {
  if (!content || !mainKeyword) {
    return getEmptySeoAnalysisResult();
  }
  
  // Get total word count
  const wordCount = content.split(/\s+/).length;
  
  // 1. Keyword usage analysis
  const keywordUsage = calculateKeywordUsage(content, mainKeyword, selectedKeywords);
  const keywordScore = calculateKeywordUsageScore(keywordUsage, mainKeyword);
  
  // 2. Readability analysis
  const readabilityScore = calculateReadability(content);
  
  // 3. Content length analysis
  const contentLengthScore = calculateContentLengthScore(wordCount);
  
  // 4. Content structure analysis
  const contentStructure = analyzeContentStructure(content);
  const structureScore = calculateStructureScore(contentStructure);
  
  // 5. Generate recommendations
  const { recommendations, improvementIds, improvements } = generateSeoRecommendations(
    content,
    mainKeyword,
    selectedKeywords,
    {
      keywordScore,
      readabilityScore,
      contentLengthScore,
      structureScore,
      wordCount,
      keywordUsage,
      contentStructure
    }
  );
  
  // 6. Calculate overall SEO score
  const seoScore = calculateOverallSeoScore(
    keywordScore,
    readabilityScore,
    contentLengthScore,
    60, // Default link score
    structureScore
  );
  
  return {
    seoScore,
    keywordScore,
    readabilityScore,
    contentLengthScore,
    structureScore,
    keywordUsage,
    recommendations,
    improvementIds,
    improvements
  };
};

/**
 * Calculate content length score based on word count
 */
const calculateContentLengthScore = (wordCount: number): number => {
  if (wordCount < 300) return 30; // Too short
  if (wordCount < 600) return 60; // Acceptable but short
  if (wordCount < 1200) return 90; // Good length
  if (wordCount < 2000) return 100; // Ideal length
  return 90; // Very long, slightly reduced score
};

/**
 * Calculate structure score based on content structure analysis
 */
const calculateStructureScore = (structure: any): number => {
  let score = 50; // Base score
  
  // Check for headings
  if (structure.headingCount >= 4) {
    score += 20;
  } else if (structure.headingCount >= 2) {
    score += 10;
  }
  
  // Check for lists
  if (structure.hasList) {
    score += 15;
  }
  
  // Check for balanced content
  if (structure.isInstructional && structure.isAnalytical) {
    score += 15; // Great mix of content types
  } else if (structure.isInstructional || structure.isAnalytical) {
    score += 10; // At least one good content type
  }
  
  return Math.min(100, score);
};

/**
 * Generate SEO recommendations based on content analysis
 */
const generateSeoRecommendations = (
  content: string,
  mainKeyword: string,
  selectedKeywords: string[] = [],
  metrics: any
): { 
  recommendations: string[]; 
  improvementIds: string[];
  improvements: SeoImprovement[];
} => {
  const recommendations: string[] = [];
  const improvementIds: string[] = [];
  const improvements: SeoImprovement[] = [];
  
  // Helper function to add recommendation
  const addRecommendation = (
    recommendation: string, 
    impact: 'high' | 'medium' | 'low' = 'medium',
    type: string = 'content'
  ) => {
    const id = `seo_${type}_${improvementIds.length + 1}`;
    recommendations.push(recommendation);
    improvementIds.push(id);
    
    improvements.push({
      id,
      type,
      recommendation,
      impact,
      applied: false
    });
  };
  
  // 1. Keyword usage recommendations
  const mainKeywordInfo = metrics.keywordUsage.find((k: any) => 
    k.keyword.toLowerCase() === mainKeyword.toLowerCase()
  );
  
  if (mainKeywordInfo) {
    const density = parseFloat(mainKeywordInfo.density);
    
    // Check keyword density
    if (density < 0.5) {
      addRecommendation(
        `Increase the usage of your main keyword "${mainKeyword}" throughout your content. The current density is too low at ${mainKeywordInfo.density}.`,
        'high',
        'keyword'
      );
    } else if (density > 3.5) {
      addRecommendation(
        `Reduce the usage of your main keyword "${mainKeyword}" to avoid keyword stuffing. The current density is high at ${mainKeywordInfo.density}.`,
        'medium',
        'keyword'
      );
    }
    
    // Check keyword prominence
    if (mainKeywordInfo.prominence < 70) {
      addRecommendation(
        `Include your main keyword "${mainKeyword}" earlier in your content and in headings to improve its prominence.`,
        'medium',
        'keyword'
      );
    }
  }
  
  // 2. Secondary keywords recommendations
  const secondaryKeywordsPresent = metrics.keywordUsage.filter((k: any) => 
    k.keyword.toLowerCase() !== mainKeyword.toLowerCase() && k.count > 0
  );
  
  if (selectedKeywords.length > 0 && secondaryKeywordsPresent.length < selectedKeywords.length) {
    const missingKeywords = selectedKeywords.filter(kw => 
      !metrics.keywordUsage.some((k: any) => k.keyword.toLowerCase() === kw.toLowerCase() && k.count > 0)
    );
    
    if (missingKeywords.length === 1) {
      addRecommendation(
        `Include your secondary keyword "${missingKeywords[0]}" in your content to improve topical relevance.`,
        'medium',
        'keyword'
      );
    } else if (missingKeywords.length > 1) {
      addRecommendation(
        `Include your secondary keywords (${missingKeywords.slice(0, 2).join(', ')}${missingKeywords.length > 2 ? ', etc.' : ''}) in your content for better topical coverage.`,
        'medium',
        'keyword'
      );
    }
  }
  
  // 3. Content length recommendations
  if (metrics.wordCount < 300) {
    addRecommendation(
      'Expand your content to at least 600 words for better search engine visibility. Current length is too short.',
      'high',
      'content'
    );
  } else if (metrics.wordCount < 600) {
    addRecommendation(
      'Consider adding more depth to your content by expanding it to at least 800-1000 words.',
      'medium',
      'content'
    );
  }
  
  // 4. Readability recommendations
  if (metrics.readabilityScore < 40) {
    addRecommendation(
      'Improve readability by using simpler sentences, shorter paragraphs, and more common words.',
      'high',
      'readability'
    );
  } else if (metrics.readabilityScore < 60) {
    addRecommendation(
      'Enhance readability by breaking up long paragraphs and simplifying some complex sentences.',
      'medium',
      'readability'
    );
  }
  
  // 5. Structure recommendations
  if (metrics.contentStructure.headingCount < 2) {
    addRecommendation(
      'Add more headings (H2, H3) to structure your content and make it easier to read.',
      'high',
      'structure'
    );
  }
  
  if (!metrics.contentStructure.hasList && metrics.contentStructure.isInstructional) {
    addRecommendation(
      'Add bullet points or numbered lists to break up text and highlight important points.',
      'medium',
      'structure'
    );
  }
  
  // Limit to max 5 recommendations to avoid overwhelming
  return { 
    recommendations: recommendations.slice(0, 5), 
    improvementIds: improvementIds.slice(0, 5),
    improvements: improvements.slice(0, 5)
  };
};

/**
 * Return empty result when analysis can't be performed
 */
const getEmptySeoAnalysisResult = (): SeoAnalysisResult => {
  return {
    seoScore: 0,
    keywordScore: 0,
    readabilityScore: 0,
    contentLengthScore: 0,
    structureScore: 0,
    keywordUsage: [],
    recommendations: [],
    improvementIds: [],
    improvements: []
  };
};
