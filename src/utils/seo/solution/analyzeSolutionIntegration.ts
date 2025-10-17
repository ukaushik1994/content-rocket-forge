
/**
 * Utility for analyzing solution integration in content
 */

import { SolutionIntegrationMetrics, EnhancedSolution } from "@/contexts/content-builder/types";

interface SolutionData {
  name: string;
  features: string[];
  painPoints?: string[];
  targetAudience?: string[];
}

/**
 * Analyze solution integration within the content
 */
export const analyzeSolutionIntegration = (content: string, selectedSolution: SolutionData): any => {
  if (!content || !selectedSolution) {
    return {
      featureIncorporation: 0,
      positioningScore: 0,
      nameMentions: 0,
      painPointsAddressed: 0,
      audienceAlignment: 0,
      mentionedFeatures: []
    };
  }
  
  const { name, features, painPoints = [], targetAudience = [] } = selectedSolution;
  const contentLower = content.toLowerCase();
  
  // Calculate how many solution features are incorporated with flexible matching
  const featureIncorporation = features.reduce((count, feature) => {
    const featureLower = feature.toLowerCase();
    const featureWords = featureLower.split(/\s+/).filter(w => w.length > 3);
    
    // Check if feature name is directly mentioned
    if (contentLower.includes(featureLower)) {
      return count + 1;
    }
    
    // Check if majority of feature keywords appear (semantic matching)
    const matchCount = featureWords.filter(word => contentLower.includes(word)).length;
    if (matchCount >= Math.ceil(featureWords.length * 0.7)) {
      return count + 1;
    }
    
    return count;
  }, 0);
  
  // Track which features are mentioned
  const mentionedFeatures = features.filter(feature => {
    const featureLower = feature.toLowerCase();
    const featureWords = featureLower.split(/\s+/).filter(w => w.length > 3);
    
    if (contentLower.includes(featureLower)) return true;
    
    const matchCount = featureWords.filter(word => contentLower.includes(word)).length;
    return matchCount >= Math.ceil(featureWords.length * 0.7);
  });
  
  const featureIncorporationPercentage = features.length > 0 ? 
    (featureIncorporation / features.length) * 100 : 0;
  
  // Calculate pain points addressed
  const painPointsAddressed = painPoints.reduce((count, painPoint) => {
    if (contentLower.includes(painPoint.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const painPointsAddressedPercentage = painPoints.length > 0 ?
    (painPointsAddressed / painPoints.length) * 100 : 0;
    
  // Calculate audience targeting alignment
  const audienceAlignmentCount = targetAudience.reduce((count, audience) => {
    if (contentLower.includes(audience.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const audienceAlignmentPercentage = targetAudience.length > 0 ?
    (audienceAlignmentCount / targetAudience.length) * 100 : 0;
  
  // Calculate how well the solution is positioned
  let positioningScore = 50; // Default middle score
  
  // Check if solution is mentioned early in the content
  if (contentLower.indexOf(name.toLowerCase()) < content.length / 3) {
    positioningScore += 20; // Mentioned early in content
  }
  
  // Count name mentions
  const nameMentionMatches = contentLower.match(new RegExp(name.toLowerCase(), 'g'));
  const nameMentions = nameMentionMatches ? nameMentionMatches.length : 0;
  
  if (nameMentions >= 3) {
    positioningScore += 15; // Mentioned multiple times
  }
  
  // Create positive word mapping to check context
  const positiveWords = ['best', 'great', 'excellent', 'solution', 'recommended', 'powerful', 'effective'];
  let positiveContexts = 0;
  
  // Check if solution is mentioned in a positive context
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes(name.toLowerCase())) {
      for (const word of positiveWords) {
        if (sentence.toLowerCase().includes(word)) {
          positiveContexts++;
          break;
        }
      }
    }
  }
  
  if (positiveContexts >= 2) {
    positioningScore += 15; // Mentioned in positive contexts
  }
  
  // Calculate overall metrics with caps to ensure values are within 0-100 range
  return {
    featureIncorporation: Math.min(100, Math.round(featureIncorporationPercentage)),
    positioningScore: Math.min(100, positioningScore),
    nameMentions,
    painPointsAddressed: Math.min(100, Math.round(painPointsAddressedPercentage)),
    audienceAlignment: Math.min(100, Math.round((positioningScore + audienceAlignmentPercentage) / 2)),
    mentionedFeatures
  };
};

/**
 * Enhanced analyzer for comprehensive solution integration
 */
export const analyzeEnhancedSolutionIntegration = (content: string, solution: EnhancedSolution): SolutionIntegrationMetrics => {
  if (!content || !solution) {
    return createEmptyMetrics();
  }

  const contentLower = content.toLowerCase();
  const basicMetrics = analyzeSolutionIntegration(content, solution);

  // Analyze competitor mentions
  const competitorMentions = solution.competitors?.reduce((count, competitor) => {
    return count + (contentLower.includes(competitor.name.toLowerCase()) ? 1 : 0);
  }, 0) || 0;

  // Analyze technical specs integration
  const technicalSpecsIntegration = analyzeTechnicalSpecsIntegration(content, solution.technicalSpecs);

  // Analyze case study references
  const caseStudyReferences = solution.caseStudies?.reduce((count, caseStudy) => {
    const mentionsCompany = contentLower.includes(caseStudy.company.toLowerCase());
    const mentionsIndustry = contentLower.includes(caseStudy.industry.toLowerCase());
    return count + (mentionsCompany || mentionsIndustry ? 1 : 0);
  }, 0) || 0;

  // Analyze pricing model alignment
  const pricingModelAlignment = analyzePricingAlignment(content, solution.pricing);

  // Analyze value proposition coverage
  const valuePropositionCoverage = analyzeValuePropositionCoverage(content, solution.uniqueValuePropositions);

  // Analyze market data integration
  const marketDataIntegration = analyzeMarketDataIntegration(content, solution.marketData);

  // Track covered use cases
  const useCasesCovered = solution.useCases.filter(useCase => 
    contentLower.includes(useCase.toLowerCase())
  );

  // Track mentioned differentiators
  const differentiatorsMentioned = solution.keyDifferentiators?.filter(diff => 
    contentLower.includes(diff.toLowerCase())
  ) || [];

  return {
    ...basicMetrics,
    competitorMentions,
    technicalSpecsIntegration,
    caseStudyReferences,
    pricingModelAlignment,
    valuePropositionCoverage,
    marketDataIntegration,
    useCasesCovered,
    differentiatorsMentioned,
    // Context-aware heuristics (fallback when AI unavailable)
    contextualRelevance: Math.round(((basicMetrics.audienceAlignment || 0) + (basicMetrics.featureIncorporation || 0) + (valuePropositionCoverage || 0)) / 3),
    naturalIntegration: (() => {
      const nm = basicMetrics.nameMentions || 0;
      if (nm === 0) return 40; // mentioned implicitly or not at all
      if (nm <= 3) return 85;  // natural frequency
      if (nm <= 6) return 70;  // borderline promotional
      return 55;               // likely over-mentioned
    })(),
    narrativeCohesion: Math.round(((basicMetrics.positioningScore || 0) + (useCasesCovered.length > 0 ? 70 : 40) + (caseStudyReferences > 0 ? 60 : 40)) / 3),
    coverageDepth: Math.round(((basicMetrics.featureIncorporation || 0) + (technicalSpecsIntegration || 0) + (valuePropositionCoverage || 0)) / 3),
    evidence: [],
    suggestions: [],
    missingElements: [],
    references: { caseStudies: [], competitors: [], technicalSpecs: [] },
    confidence: Math.round((((basicMetrics.audienceAlignment || 0) + (basicMetrics.featureIncorporation || 0) + (valuePropositionCoverage || 0) + (technicalSpecsIntegration || 0)) / 4)),
    // Enhanced overall score calculation
    overallScore: calculateEnhancedOverallScore({
      ...basicMetrics,
      competitorMentions,
      technicalSpecsIntegration,
      caseStudyReferences,
      pricingModelAlignment,
      valuePropositionCoverage,
      marketDataIntegration
    })
  };
};

// Helper functions for enhanced analysis
const analyzeTechnicalSpecsIntegration = (content: string, technicalSpecs?: any): number => {
  if (!technicalSpecs) return 0;
  
  const contentLower = content.toLowerCase();
  let score = 0;
  let totalSpecs = 0;

  if (technicalSpecs.systemRequirements) {
    totalSpecs += technicalSpecs.systemRequirements.length;
    score += technicalSpecs.systemRequirements.filter((spec: string) => 
      contentLower.includes(spec.toLowerCase())
    ).length;
  }

  if (technicalSpecs.supportedPlatforms) {
    totalSpecs += technicalSpecs.supportedPlatforms.length;
    score += technicalSpecs.supportedPlatforms.filter((platform: string) => 
      contentLower.includes(platform.toLowerCase())
    ).length;
  }

  if (technicalSpecs.apiCapabilities) {
    totalSpecs += technicalSpecs.apiCapabilities.length;
    score += technicalSpecs.apiCapabilities.filter((api: string) => 
      contentLower.includes(api.toLowerCase())
    ).length;
  }

  return totalSpecs > 0 ? Math.round((score / totalSpecs) * 100) : 0;
};

const analyzePricingAlignment = (content: string, pricing?: any): number => {
  if (!pricing) return 0;
  
  const contentLower = content.toLowerCase();
  let score = 0;

  // Check for pricing model mentions
  if (contentLower.includes(pricing.model)) score += 25;
  
  // Check for tier mentions
  if (pricing.tiers) {
    const tierMentions = pricing.tiers.filter((tier: any) => 
      contentLower.includes(tier.name.toLowerCase())
    ).length;
    score += Math.min(25, (tierMentions / pricing.tiers.length) * 25);
  }

  // Check for pricing-related keywords
  const pricingKeywords = ['price', 'cost', 'pricing', 'subscription', 'plan', 'tier', 'free trial'];
  const keywordMentions = pricingKeywords.filter(keyword => 
    contentLower.includes(keyword)
  ).length;
  score += Math.min(25, (keywordMentions / pricingKeywords.length) * 25);

  // Check for starting price mention
  if (pricing.startingPrice && contentLower.includes(pricing.startingPrice.toLowerCase())) {
    score += 25;
  }

  return Math.round(score);
};

const analyzeValuePropositionCoverage = (content: string, valueProps?: string[]): number => {
  if (!valueProps || valueProps.length === 0) return 0;
  
  const contentLower = content.toLowerCase();
  const mentionedProps = valueProps.filter(prop => 
    contentLower.includes(prop.toLowerCase())
  );
  
  return Math.round((mentionedProps.length / valueProps.length) * 100);
};

const analyzeMarketDataIntegration = (content: string, marketData?: any): number => {
  if (!marketData) return 0;
  
  const contentLower = content.toLowerCase();
  let score = 0;
  let dataPoints = 0;

  if (marketData.size) {
    dataPoints++;
    if (contentLower.includes('market size') || contentLower.includes(marketData.size.toLowerCase())) {
      score++;
    }
  }

  if (marketData.growthRate) {
    dataPoints++;
    if (contentLower.includes('growth') || contentLower.includes(marketData.growthRate.toLowerCase())) {
      score++;
    }
  }

  if (marketData.geographicAvailability) {
    dataPoints++;
    const regionMentions = marketData.geographicAvailability.filter((region: string) => 
      contentLower.includes(region.toLowerCase())
    ).length;
    if (regionMentions > 0) score++;
  }

  return dataPoints > 0 ? Math.round((score / dataPoints) * 100) : 0;
};

const calculateEnhancedOverallScore = (metrics: any): number => {
  const weights = {
    featureIncorporation: 0.2,
    positioningScore: 0.15,
    painPointsAddressed: 0.15,
    audienceAlignment: 0.1,
    competitorMentions: 0.1,
    technicalSpecsIntegration: 0.1,
    caseStudyReferences: 0.05,
    pricingModelAlignment: 0.05,
    valuePropositionCoverage: 0.05,
    marketDataIntegration: 0.05
  };

  let weightedScore = 0;
  
  Object.entries(weights).forEach(([key, weight]) => {
    weightedScore += (metrics[key] || 0) * weight;
  });

  return Math.round(weightedScore);
};

const createEmptyMetrics = (): SolutionIntegrationMetrics => ({
  featureIncorporation: 0,
  positioningScore: 0,
  painPointsAddressed: [],
  ctaEffectiveness: 0,
  overallScore: 0,
  mentions: 0,
  audienceAlignment: 0,
  nameMentions: 0,
  ctaMentions: 0,
  mentionedFeatures: [],
  competitorMentions: 0,
  technicalSpecsIntegration: 0,
  caseStudyReferences: 0,
  pricingModelAlignment: 0,
  valuePropositionCoverage: 0,
  marketDataIntegration: 0,
  useCasesCovered: [],
  differentiatorsMentioned: [],
  // New context-aware defaults
  contextualRelevance: 0,
  naturalIntegration: 0,
  narrativeCohesion: 0,
  coverageDepth: 0,
  evidence: [],
  suggestions: [],
  missingElements: [],
  references: { caseStudies: [], competitors: [], technicalSpecs: [] },
  confidence: 0
});
