/**
 * Advanced SERP Analysis type definitions
 */

export interface SerpFeature {
  type: 'featured_snippet' | 'people_also_ask' | 'local_pack' | 'image_pack' | 'video' | 'shopping' | 'news';
  content: string;
  source?: string;
  position: number;
  metadata?: Record<string, any>;
}

export interface CompetitorContent {
  url: string;
  title: string;
  domain: string;
  position: number;
  snippet: string;
  wordCount?: number;
  headingStructure?: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  entities?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  readabilityScore?: number;
  topicalRelevance?: number;
  authorityScore?: number;
}

export interface AdvancedContentGap {
  id: string;
  type: 'topic' | 'keyword' | 'format' | 'depth';
  description: string;
  opportunity: string;
  difficulty: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  recommendedAction: string;
  relatedKeywords: string[];
  competitorExample?: string;
}

export interface QuestionCluster {
  id: string;
  mainQuestion: string;
  relatedQuestions: string[];
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  difficulty: number;
  searchVolume?: number;
  currentRanking?: number;
  contentRequirement: {
    format: string;
    depth: 'basic' | 'comprehensive' | 'expert';
    wordCount: number;
    mediaNeeded: boolean;
  };
}

export interface TrendAnalysis {
  keyword: string;
  trend: 'rising' | 'stable' | 'declining';
  seasonality?: {
    months: number[];
    pattern: string;
  };
  relatedTrends: string[];
  opportunityScore: number;
  competitionLevel: 'low' | 'medium' | 'high';
  recommendedTiming: string;
}

export interface AdvancedSerpAnalysis {
  id: string;
  keyword: string;
  analyzedAt: string;
  
  // SERP Overview
  totalResults: number;
  serpFeatures: SerpFeature[];
  competitorContent: CompetitorContent[];
  
  // Content Intelligence
  contentGaps: AdvancedContentGap[];
  questionClusters: QuestionCluster[];
  topicalCoverage: {
    topic: string;
    coverage: number; // percentage
    competitorCoverage: number;
    opportunity: number;
  }[];
  
  // Trend & Opportunity Analysis
  trendAnalysis: TrendAnalysis;
  seasonalityData?: {
    month: string;
    searchVolume: number;
    competition: number;
  }[];
  
  // Entity Analysis
  entities: {
    name: string;
    type: 'person' | 'organization' | 'location' | 'concept';
    relevance: number;
    mentions: number;
  }[];
  
  // Optimization Recommendations
  recommendations: {
    type: 'content' | 'technical' | 'strategy';
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
  
  // Performance Prediction
  predictedPerformance: {
    trafficPotential: number;
    rankingProbability: number;
    timeToRank: string;
    competitionLevel: number;
  };
}