
/**
 * Solution related type definitions
 */

export interface SolutionResource {
  title: string;
  url: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category: string; // This property is required and defined
  logoUrl: string | null;
  externalUrl: string | null;
  resources: SolutionResource[];
}

export interface SolutionIntegrationMetrics {
  featureIncorporation: number;
  positioningScore: number;
  painPointsAddressed: string[];
  ctaEffectiveness: number;
  overallScore: number;
  mentions: number | string;
  audienceAlignment: number;
  nameMentions: number;
  ctaMentions: number;
  mentionedFeatures: string[];
  
  // Enhanced metrics for comprehensive solution data
  competitorMentions: number;
  technicalSpecsIntegration: number;
  caseStudyReferences: number;
  pricingModelAlignment: number;
  valuePropositionCoverage: number;
  marketDataIntegration: number;
  useCasesCovered: string[];
  differentiatorsMentioned: string[];

  // Context-aware AI metrics
  contextualRelevance: number; // 0-100: how well content context aligns with solution
  naturalIntegration: number; // 0-100: how naturally the solution is woven into narrative
  narrativeCohesion: number; // 0-100: cohesion of mentions across sections
  coverageDepth: number; // 0-100: depth of coverage (features, specs, VPs)

  // AI evidence and recommendations
  evidence?: Array<{
    excerpt: string; // short quote from content
    rationale: string; // why this supports/harms integration
    metric?: string; // metric the evidence relates to
  }>;
  suggestions?: string[]; // actionable improvements from AI
  missingElements?: string[]; // important gaps AI detected
  references?: {
    caseStudies?: string[];
    competitors?: string[];
    technicalSpecs?: string[];
  };
  confidence?: number; // 0-100 confidence score from AI
}

