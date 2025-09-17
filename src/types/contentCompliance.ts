/**
 * Type definitions for content compliance analysis
 */

export interface ComplianceViolation {
  id: string;
  category: ComplianceCategory;
  severity: 'critical' | 'warning' | 'minor';
  message: string;
  suggestion: string;
  location?: {
    start: number;
    end: number;
  };
}

export interface KeywordComplianceResult {
  mainKeywordDensity: {
    current: number;
    target: { min: number; max: number };
    compliant: boolean;
  };
  mainKeywordPlacement: {
    inH1: boolean;
    inIntro: boolean;
    inConclusion: boolean;
    compliant: boolean;
  };
  keywordVariations: {
    variationPercentage: number;
    target: number;
    compliant: boolean;
  };
  secondaryKeywordsCoverage: {
    covered: number;
    total: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  score: number;
  violations: ComplianceViolation[];
}

export interface SerpComplianceResult {
  headingsCoverage: {
    covered: number;
    total: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  contentGaps: {
    addressed: number;
    total: number;
    percentage: number;
    compliant: boolean;
  };
  paaQuestions: {
    answered: number;
    total: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  relatedTerms: {
    used: number;
    total: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  score: number;
  violations: ComplianceViolation[];
}

export interface SolutionComplianceResult {
  mentionFrequency: {
    mentions: number;
    wordsPerThousand: number;
    target: { min: number; max: number };
    compliant: boolean;
  };
  featurePainMapping: {
    triads: number;
    target: number;
    compliant: boolean;
  };
  naturalness: {
    forcedMentions: number;
    totalMentions: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  ctaPresence: {
    present: boolean;
    inFinalSection: boolean;
    compliant: boolean;
  };
  score: number;
  violations: ComplianceViolation[];
}

export interface StructureComplianceResult {
  outlineMatch: {
    matched: number;
    total: number;
    percentage: number;
    target: number;
    compliant: boolean;
  };
  headingHierarchy: {
    proper: boolean;
    issues: string[];
    compliant: boolean;
  };
  readability: {
    fleschScore: number;
    target: number;
    compliant: boolean;
  };
  sentenceLength: {
    average: number;
    target: number;
    compliant: boolean;
  };
  score: number;
  violations: ComplianceViolation[];
}

export type ComplianceCategory = 'keyword' | 'serp' | 'solution' | 'structure';

export interface ComplianceAnalysisResult {
  overall: {
    score: number;
    compliant: boolean;
    totalViolations: number;
    criticalViolations: number;
  };
  keyword: KeywordComplianceResult;
  serp: SerpComplianceResult;
  solution: SolutionComplianceResult;
  structure: StructureComplianceResult;
  violations: ComplianceViolation[];
  suggestions: string[];
}

export interface ComplianceAnalysisOptions {
  flexibilityPercentage?: number; // Default 15% (10-20% range)
  skipCategories?: ComplianceCategory[];
  strictMode?: boolean;
}