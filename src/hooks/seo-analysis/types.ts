
import { Dispatch, SetStateAction } from 'react';

export type KeywordUsage = {
  keyword: string;
  count: number;
  density: string;
  isPrimary: boolean;
  isOptimalDensity?: boolean;
};

export type SeoAnalysisScores = {
  keywordUsage: number;
  contentLength: number;
  readability: number;
};

export interface UseSeoAnalysisReturn {
  isAnalyzing: boolean;
  keywordUsage: KeywordUsage[];
  recommendations: string[];
  recommendationIds: string[];
  scores: SeoAnalysisScores;
  improvements: any[];
  analysisError: string | null;
  runSeoAnalysis: () => void;
  analyzeContent: () => void;
  getScoreColor: (score: number) => string;
  forceSkipAnalysis: () => void;
  handleApplyRecommendation: (id: string) => void;
  isRecommendationApplied: (id: string) => boolean;
}

export type SkipWarningProps = {
  onSkip: () => void;
  onCancel: () => void;
};

export type SeoAnalysisHeaderProps = {
  seoScore: number;
  isAnalyzing: boolean;
  runSeoAnalysis: () => void;
  hasRunAnalysis: boolean;
  skipOptimizationStep: () => void;
  content: string;
  analysisError?: string | null;
  onAnalyze: () => void;
};
