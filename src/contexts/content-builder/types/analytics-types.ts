
/**
 * Analytics and metadata types for content builder
 */

export interface ReadabilityMetrics {
  score: number;
  grade: string;
  readingTime: number;
  sentenceComplexity: 'simple' | 'moderate' | 'complex';
  wordComplexity: 'basic' | 'intermediate' | 'advanced';
}

export interface ContentQualityMetrics {
  overallScore: number;
  structureScore: number;
  keywordOptimizationScore: number;
  readabilityScore: number;
  metaOptimizationScore: number;
}

export interface TechnicalSeoMetrics {
  metaTitleStatus: 'missing' | 'short' | 'long' | 'good';
  metaDescriptionStatus: 'missing' | 'short' | 'long' | 'good';
  headingStructure: {
    h1Count: number;
    h2Count: number;
    h3Count: number;
    totalHeadings: number;
  };
  keywordDensity: {
    primary: number;
    secondary: number[];
  };
  contentLength: number;
  imageCount: number;
  linkCount: number;
}

export interface SerpIntegrationMetrics {
  competitorsAnalyzed: number;
  contentGapsFound: number;
  questionsIntegrated: number;
  entitiesIncluded: number;
  avgCompetitorLength: number;
  serpOptimizationScore: number;
}

export interface ComprehensiveAnalytics {
  readabilityMetrics: ReadabilityMetrics;
  contentQualityMetrics: ContentQualityMetrics;
  technicalSeoMetrics: TechnicalSeoMetrics;
  serpIntegrationMetrics: SerpIntegrationMetrics;
  analysisTimestamp: string;
  contentHash: string; // To track if content changed since analysis
}
