
/**
 * Analytics-related type definitions
 */

export interface ReadabilityMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  grade: string;
  score: number;
}

export interface TechnicalSeoMetrics {
  contentLength: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
  metaTitleLength: number;
  metaDescriptionLength: number;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
}

export interface ContentQualityMetrics {
  overallScore: number;
  structureScore: number;
  keywordOptimizationScore: number;
  metaOptimizationScore: number;
  readabilityScore: number;
}

export interface ComprehensiveAnalytics {
  contentHash: string;
  readabilityMetrics: ReadabilityMetrics;
  technicalSeoMetrics: TechnicalSeoMetrics;
  contentQualityMetrics: ContentQualityMetrics;
  analysisTimestamp: string;
}
