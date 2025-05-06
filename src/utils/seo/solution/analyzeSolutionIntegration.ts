
/**
 * Advanced utility for analyzing solution integration in content
 */

import { extractKeyPhrases } from '../nlp/textAnalysis';
import { detectMainTopics } from '../nlp/contentStructure';

interface SolutionData {
  name: string;
  features: string[];
  description?: string;
  useСases?: string[];
  painPoints?: string[];
  targetAudience?: string[];
}

interface SolutionMetrics {
  featureIncorporation: number;
  positioningScore: number;
  nameMentions: number;
  painPointsAddressed: string[];
  audienceAlignment: number;
  ctaMentions: number;
  ctaEffectiveness: number;
  overallScore: number;
}

/**
 * Analyze solution integration within the content using advanced text analysis
 */
export const analyzeSolutionIntegration = (content: string, solution: SolutionData): SolutionMetrics => {
  if (!content || !solution || !solution.name) {
    return createDefaultMetrics();
  }
  
  const { name, features = [], painPoints = [], targetAudience = [] } = solution;
  
  // Split content into sections for better analysis
  const paragraphs = content.split(/\n\n+/);
  const sentences = content.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
  
  // Extract key phrases from content
  const keyPhrases = extractKeyPhrases(content);
  
  // Extract main topics from content
  const mainTopics = detectMainTopics(content);
  
  // Calculate how many solution features are incorporated
  let featureMatches = 0;
  const featureContext: Record<string, boolean> = {};
  
  features.forEach(feature => {
    // For each feature, check if it's mentioned in the content
    const featureWords = feature.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    // Check if the feature or its keywords are mentioned
    let matched = false;
    
    // First check for the exact feature match
    if (content.toLowerCase().includes(feature.toLowerCase())) {
      featureMatches++;
      featureContext[feature] = true;
      matched = true;
    } 
    
    // If not matched exactly, check for keywords from the feature
    if (!matched && featureWords.length > 1) {
      // For multi-word features, count it as a match if most of the significant words appear
      const matchCount = featureWords.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      ).length;
      
      if (matchCount >= Math.ceil(featureWords.length * 0.7)) {
        featureMatches += 0.6; // Partial match
        featureContext[feature] = true;
        matched = true;
      }
    }
  });
  
  const featureIncorporationPercentage = features.length > 0 ? 
    Math.round((featureMatches / features.length) * 100) : 0;
  
  // Calculate name mentions
  const nameLower = name.toLowerCase();
  const nameRegex = new RegExp(`\\b${nameLower}\\b`, 'gi');
  const nameMentions = (content.match(nameRegex) || []).length;
  
  // Calculate positioning score based on multiple factors
  let positioningScore = calculatePositioningScore(content, name, nameMentions, paragraphs);
  
  // Identify addressed pain points
  const addressedPainPoints = identifyAddressedPainPoints(content, painPoints, sentences);
  
  // Calculate audience alignment score
  const audienceAlignment = calculateAudienceAlignment(content, targetAudience, keyPhrases, mainTopics);
  
  // Calculate CTA effectiveness
  const ctaInfo = analyzeCTAs(content, name);
  
  // Calculate overall score - weighted average of all metrics
  const overallScore = calculateOverallScore({
    featureIncorporation: featureIncorporationPercentage,
    positioning: positioningScore,
    nameMentions,
    painPoints: addressedPainPoints.length,
    maxPainPoints: painPoints.length,
    audience: audienceAlignment,
    cta: ctaInfo.effectiveness
  });
  
  return {
    featureIncorporation: featureIncorporationPercentage,
    positioningScore,
    nameMentions,
    painPointsAddressed: addressedPainPoints,
    audienceAlignment,
    ctaMentions: ctaInfo.count,
    ctaEffectiveness: ctaInfo.effectiveness,
    overallScore
  };
};

/**
 * Calculate positioning score based on how the solution is presented in the content
 */
const calculatePositioningScore = (
  content: string, 
  solutionName: string, 
  nameMentions: number,
  paragraphs: string[]
): number => {
  let score = 50; // Base score
  
  // Check if solution is mentioned in the first third of the content
  const firstThird = Math.ceil(content.length / 3);
  if (content.toLowerCase().indexOf(solutionName.toLowerCase()) < firstThird) {
    score += 15; // Mentioned early in content
  }
  
  // Check mention frequency
  if (nameMentions >= 3) {
    score += 10;
  } else if (nameMentions >= 2) {
    score += 5;
  }
  
  // Check if solution appears in heading (approximate check)
  const possibleHeadings = content.match(/\*\*.*?\*\*|\n#+\s|^#+\s/g) || [];
  const inHeading = possibleHeadings.some(h => 
    h.toLowerCase().includes(solutionName.toLowerCase())
  );
  
  if (inHeading) {
    score += 15;
  }
  
  // Check for solution in conclusion (last paragraph)
  if (paragraphs.length > 2) {
    const lastParagraph = paragraphs[paragraphs.length - 1].toLowerCase();
    if (lastParagraph.includes(solutionName.toLowerCase())) {
      score += 10;
    }
  }
  
  // Check positioning in positive contexts
  const positiveContextScore = checkPositiveContext(content, solutionName);
  score += positiveContextScore;
  
  return Math.min(100, score);
};

/**
 * Check if solution is mentioned in positive contexts
 */
const checkPositiveContext = (content: string, solutionName: string): number => {
  const sentences = content.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
  
  // Positive words that indicate good context
  const positiveWords = [
    'best', 'great', 'excellent', 'solution', 'recommended', 'powerful', 
    'effective', 'efficient', 'innovative', 'leading', 'top', 'premium',
    'superior', 'advanced', 'beneficial', 'valuable', 'reliable'
  ];
  
  let positiveContexts = 0;
  const nameLower = solutionName.toLowerCase();
  
  // Check if solution is mentioned in a positive context
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    if (sentenceLower.includes(nameLower)) {
      for (const word of positiveWords) {
        if (sentenceLower.includes(word)) {
          positiveContexts++;
          break;
        }
      }
    }
  });
  
  // Calculate score boost based on positive contexts
  if (positiveContexts >= 3) {
    return 15;
  } else if (positiveContexts >= 2) {
    return 10;
  } else if (positiveContexts >= 1) {
    return 5;
  }
  
  return 0;
};

/**
 * Identify pain points addressed in the content
 */
const identifyAddressedPainPoints = (
  content: string, 
  painPoints: string[] = [], 
  sentences: string[]
): string[] => {
  const contentLower = content.toLowerCase();
  const addressedPoints: string[] = [];
  
  // If no pain points are provided, return empty array
  if (painPoints.length === 0) {
    return [];
  }
  
  painPoints.forEach(painPoint => {
    // Check for direct matches
    if (contentLower.includes(painPoint.toLowerCase())) {
      addressedPoints.push(painPoint);
      return;
    }
    
    // Check for semantic matches using keywords from the pain point
    const painPointWords = painPoint.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !isStopWord(w));
    
    if (painPointWords.length > 0) {
      // Count how many key words from the pain point appear in the content
      const matchCount = painPointWords.filter(word => 
        contentLower.includes(word)
      ).length;
      
      // If most of the key words appear, consider it addressed
      if (matchCount >= Math.ceil(painPointWords.length * 0.6)) {
        addressedPoints.push(painPoint);
      }
    }
  });
  
  return addressedPoints;
};

/**
 * Simple check if a word is a common stopword
 */
const isStopWord = (word: string): boolean => {
  const stopwords = [
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what', 
    'when', 'where', 'how', 'who', 'which', 'this', 'that', 'these', 'those'
  ];
  
  return stopwords.includes(word.toLowerCase().trim());
};

/**
 * Calculate audience alignment score
 */
const calculateAudienceAlignment = (
  content: string,
  targetAudience: string[] = [],
  keyPhrases: string[] = [],
  mainTopics: string[] = []
): number => {
  if (targetAudience.length === 0) {
    return 50; // Neutral score if no target audience defined
  }
  
  let alignmentScore = 50;
  const contentLower = content.toLowerCase();
  
  // Check for direct mentions of target audiences
  const audienceMentions = targetAudience.filter(audience => 
    contentLower.includes(audience.toLowerCase())
  ).length;
  
  // Calculate percentage of directly mentioned audiences
  const directMentionPercentage = (audienceMentions / targetAudience.length) * 100;
  
  // Add points based on direct mentions
  if (directMentionPercentage >= 75) {
    alignmentScore += 25;
  } else if (directMentionPercentage >= 50) {
    alignmentScore += 15;
  } else if (directMentionPercentage >= 25) {
    alignmentScore += 10;
  } else if (audienceMentions > 0) {
    alignmentScore += 5;
  }
  
  // Check for audience terms in key phrases and main topics
  let topicAlignmentCount = 0;
  
  targetAudience.forEach(audience => {
    const audienceWords = audience.toLowerCase().split(/\s+/);
    
    // Check if any audience terms appear in key phrases
    const inKeyPhrases = keyPhrases.some(phrase => 
      audienceWords.some(word => phrase.includes(word))
    );
    
    // Check if any audience terms appear in main topics
    const inTopics = mainTopics.some(topic => 
      audienceWords.some(word => topic.toLowerCase().includes(word))
    );
    
    if (inKeyPhrases || inTopics) {
      topicAlignmentCount++;
    }
  });
  
  // Add points based on topic alignment
  if (targetAudience.length > 0) {
    const topicAlignmentPercentage = (topicAlignmentCount / targetAudience.length) * 100;
    
    if (topicAlignmentPercentage >= 50) {
      alignmentScore += 20;
    } else if (topicAlignmentPercentage >= 25) {
      alignmentScore += 10;
    } else if (topicAlignmentCount > 0) {
      alignmentScore += 5;
    }
  }
  
  // Cap the final score at 100
  return Math.min(100, alignmentScore);
};

/**
 * Analyze CTAs in the content
 */
const analyzeCTAs = (content: string, solutionName: string): { count: number; effectiveness: number } => {
  const contentLower = content.toLowerCase();
  const nameLower = solutionName.toLowerCase();
  
  // CTA phrases to look for
  const ctaPhrases = [
    'sign up', 'register', 'get started', 'try', 'download', 'contact', 
    'learn more', 'find out more', 'discover', 'visit', 'check out',
    'click here', 'start now', 'get', 'buy', 'purchase'
  ];
  
  let ctaCount = 0;
  let solutionRelatedCtas = 0;
  
  // Split content into sentences
  const sentences = content.split(/[.!?]+/).filter(Boolean).map(s => s.trim());
  
  // Analyze each sentence for CTAs
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    // Check for CTA phrases
    for (const phrase of ctaPhrases) {
      if (sentenceLower.includes(phrase)) {
        ctaCount++;
        
        // Check if the CTA is related to the solution
        if (sentenceLower.includes(nameLower)) {
          solutionRelatedCtas++;
        }
        
        break; // Only count one CTA per sentence
      }
    }
  });
  
  // Calculate CTA effectiveness
  let effectiveness = 0;
  
  if (ctaCount === 0) {
    effectiveness = 0; // No CTAs
  } else {
    // Base score for having CTAs
    effectiveness = 40;
    
    // Bonus for having solution-related CTAs
    if (solutionRelatedCtas > 0) {
      effectiveness += Math.min(40, solutionRelatedCtas * 15);
    }
    
    // Bonus for appropriate number of CTAs
    if (ctaCount >= 2 && ctaCount <= 5) {
      effectiveness += 20; // Optimal number of CTAs
    } else if (ctaCount > 5) {
      effectiveness -= Math.min(20, (ctaCount - 5) * 5); // Penalty for too many CTAs
    }
  }
  
  return {
    count: ctaCount,
    effectiveness: Math.min(100, Math.max(0, effectiveness))
  };
};

/**
 * Calculate overall solution integration score
 */
const calculateOverallScore = (metrics: {
  featureIncorporation: number;
  positioning: number;
  nameMentions: number;
  painPoints: number;
  maxPainPoints: number;
  audience: number;
  cta: number;
}): number => {
  // Define weights for each metric
  const weights = {
    featureIncorporation: 0.25,
    positioning: 0.20,
    painPoints: 0.20,
    audience: 0.15,
    cta: 0.20
  };
  
  // Calculate pain points score (0-100)
  let painPointsScore = metrics.maxPainPoints > 0 ? 
    (metrics.painPoints / metrics.maxPainPoints) * 100 : 50;
  
  // Calculate weighted score
  const weightedScore = 
    (metrics.featureIncorporation * weights.featureIncorporation) +
    (metrics.positioning * weights.positioning) +
    (painPointsScore * weights.painPoints) +
    (metrics.audience * weights.audience) +
    (metrics.cta * weights.cta);
  
  return Math.round(weightedScore);
};

/**
 * Create default metrics when analysis can't be performed
 */
const createDefaultMetrics = (): SolutionMetrics => {
  return {
    featureIncorporation: 0,
    positioningScore: 0,
    nameMentions: 0,
    painPointsAddressed: [],
    audienceAlignment: 0,
    ctaMentions: 0,
    ctaEffectiveness: 0,
    overallScore: 0
  };
};
