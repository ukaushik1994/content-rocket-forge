
/**
 * Comprehensive SERP metrics and analysis types
 */

export interface SerpMetrics {
  keyword: string;
  searchVolume?: number;
  keywordDifficulty?: number;
  competitionScore?: number;
  cpc?: number;
  trend?: 'rising' | 'stable' | 'declining';
  seasonality?: boolean;
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export interface CompetitorAnalysis {
  topCompetitors: Array<{
    domain: string;
    title: string;
    position: number;
    snippet: string;
    wordCount?: number;
    features?: string[];
  }>;
  averageWordCount?: number;
  commonFeatures: string[];
  gapOpportunities: string[];
}

export interface RankingOpportunities {
  featuredSnippetChance: 'high' | 'medium' | 'low';
  paaOpportunities: number;
  imageOpportunities: boolean;
  videoOpportunities: boolean;
  localOpportunities: boolean;
  recommendedContentLength: number;
  missingTopics: string[];
}

export interface SerpSelectionStats {
  totalSelected: number;
  byType: {
    questions: number;
    featuredSnippets: number;
    relatedSearches: number;
    entities: number;
    headings: number;
    contentGaps: number;
  };
  selections: Array<{
    type: string;
    content: string;
    source?: string;
    priority?: 'high' | 'medium' | 'low';
  }>;
}

export interface ComprehensiveSerpData {
  serpMetrics: SerpMetrics;
  competitorAnalysis: CompetitorAnalysis;
  rankingOpportunities: RankingOpportunities;
  selectionStats: SerpSelectionStats;
  rawSerpData: any; // Keep original SERP data
  analysisTimestamp: string;
}
