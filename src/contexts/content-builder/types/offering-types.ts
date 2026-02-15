
/**
 * Offering related type definitions
 * (Renamed from solution-types.ts - types map to the 'solutions' DB table)
 */

export interface OfferingResource {
  title: string;
  url: string;
}

// Persona type enum
export type PersonaType = 'end_user' | 'decision_maker' | 'influencer';

// Offering persona interface
export interface OfferingPersona {
  id: string;
  solutionId: string;
  personaType: PersonaType;
  personaName: string;
  roleTitle: string;
  typicalGoals: string[];
  painPoints: string[];
  preferredTone: string;
  keyTopics: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offering {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
  category: string;
  logoUrl: string | null;
  externalUrl: string | null;
  resources: OfferingResource[];
  personas?: OfferingPersona[];
}

export interface OfferingIntegrationMetrics {
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
  
  competitorMentions: number;
  technicalSpecsIntegration: number;
  caseStudyReferences: number;
  pricingModelAlignment: number;
  valuePropositionCoverage: number;
  marketDataIntegration: number;
  useCasesCovered: string[];
  differentiatorsMentioned: string[];

  contextualRelevance: number;
  naturalIntegration: number;
  narrativeCohesion: number;
  coverageDepth: number;

  evidence?: Array<{
    excerpt: string;
    rationale: string;
    metric?: string;
  }>;
  suggestions?: string[];
  missingElements?: string[];
  references?: {
    caseStudies?: string[];
    competitors?: string[];
    technicalSpecs?: string[];
  };
  confidence?: number;
}

// Backward-compatible aliases
export type SolutionResource = OfferingResource;
export type SolutionPersona = OfferingPersona;
export type Solution = Offering;
export type SolutionIntegrationMetrics = OfferingIntegrationMetrics;
