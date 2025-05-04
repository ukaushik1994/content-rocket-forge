
import { DocumentStructure, SolutionIntegrationMetrics, Solution } from '@/contexts/content-builder/types';

/**
 * Extract headings from content and analyze document structure
 */
export const extractDocumentStructure = (content: string): DocumentStructure => {
  if (!content) {
    return {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      hasSingleH1: false,
      hasLogicalHierarchy: false,
    };
  }

  // Extract headings using regex
  const h1Matches = content.match(/^# (.+)$|^<h1>(.+)<\/h1>$/gm) || [];
  const h2Matches = content.match(/^## (.+)$|^<h2>(.+)<\/h2>$/gm) || [];
  const h3Matches = content.match(/^### (.+)$|^<h3>(.+)<\/h3>$/gm) || [];
  const h4Matches = content.match(/^#### (.+)$|^<h4>(.+)<\/h4>$/gm) || [];

  // Clean up heading text
  const h1 = h1Matches.map(h => h.replace(/^# |^<h1>|<\/h1>$/g, '').trim());
  const h2 = h2Matches.map(h => h.replace(/^## |^<h2>|<\/h2>$/g, '').trim());
  const h3 = h3Matches.map(h => h.replace(/^### |^<h3>|<\/h3>$/g, '').trim());
  const h4 = h4Matches.map(h => h.replace(/^#### |^<h4>|<\/h4>$/g, '').trim());

  // Check if document has a single H1
  const hasSingleH1 = h1.length === 1;

  // Check for logical hierarchy (no h3 without h2, etc.)
  const hasLogicalHierarchy = h1.length > 0 && 
    (h2.length === 0 || h1.length >= 1) && 
    (h3.length === 0 || h2.length >= 1) &&
    (h4.length === 0 || h3.length >= 1);

  return {
    h1,
    h2,
    h3,
    h4,
    hasSingleH1,
    hasLogicalHierarchy,
  };
};

/**
 * Generate meta title and description suggestions based on content
 */
export const generateMetaSuggestions = (
  content: string, 
  mainKeyword: string, 
  title?: string
): { metaTitle: string; metaDescription: string } => {
  // Default values
  let metaTitle = title || '';
  let metaDescription = '';

  if (!content) {
    return { metaTitle, metaDescription };
  }

  // Generate meta title if not provided
  if (!metaTitle) {
    // Extract first H1 or first sentence
    const h1Match = content.match(/^# (.+)$|^<h1>(.+)<\/h1>$/m);
    if (h1Match) {
      metaTitle = h1Match[0].replace(/^# |^<h1>|<\/h1>$/g, '');
    } else {
      const firstSentence = content.split('.')[0];
      metaTitle = firstSentence.substring(0, 60);
    }

    // Ensure keyword is in title
    if (mainKeyword && !metaTitle.toLowerCase().includes(mainKeyword.toLowerCase())) {
      metaTitle = `${mainKeyword}: ${metaTitle}`.substring(0, 60);
    }
  }

  // Generate meta description
  if (content.length > 0) {
    // Get first paragraph or first couple of sentences
    const firstParagraph = content.split('\n\n')[0].replace(/[#<>h1-6/]/g, '').trim();
    metaDescription = firstParagraph.length > 10 ? firstParagraph.substring(0, 155) : content.substring(0, 155);
    
    // Ensure it doesn't end mid-sentence
    const lastPeriodIndex = metaDescription.lastIndexOf('.');
    if (lastPeriodIndex > 50) {
      metaDescription = metaDescription.substring(0, lastPeriodIndex + 1);
    }
    
    // Add ellipsis if we're cutting the text
    if (metaDescription.length < firstParagraph.length) {
      metaDescription += '...';
    }
  }

  return { metaTitle, metaDescription };
};

/**
 * Analyze how solution information has been integrated into content
 */
export const analyzeSolutionIntegration = (
  content: string,
  solution: Solution | null
): SolutionIntegrationMetrics => {
  // Default metrics
  const metrics: SolutionIntegrationMetrics = {
    nameMentions: 0,
    featureIncorporation: 0,
    painPointsAddressed: [],
    audienceAlignment: 0,
    positioningScore: 0,
    ctaMentions: 0,
    overallScore: 0
  };

  if (!content || !solution) {
    return metrics;
  }

  const contentLower = content.toLowerCase();
  const { name, features, painPoints, targetAudience } = solution;

  // Count name mentions
  const nameLower = name.toLowerCase();
  const nameMatches = contentLower.match(new RegExp(nameLower, 'g')) || [];
  metrics.nameMentions = nameMatches.length;

  // Calculate feature incorporation
  let featuresIncorporated = 0;
  for (const feature of features) {
    const featureLower = feature.toLowerCase();
    if (contentLower.includes(featureLower)) {
      featuresIncorporated++;
    }
  }
  metrics.featureIncorporation = features.length > 0 
    ? Math.round((featuresIncorporated / features.length) * 100) 
    : 0;

  // Count pain points addressed
  for (const painPoint of painPoints) {
    const painPointLower = painPoint.toLowerCase();
    if (contentLower.includes(painPointLower)) {
      metrics.painPointsAddressed.push(painPoint);
    }
  }

  // Calculate audience alignment
  let audienceMatches = 0;
  for (const audience of targetAudience) {
    const audienceLower = audience.toLowerCase();
    if (contentLower.includes(audienceLower)) {
      audienceMatches++;
    }
  }
  metrics.audienceAlignment = targetAudience.length > 0
    ? Math.round((audienceMatches / targetAudience.length) * 100)
    : 0;

  // Check for CTAs
  const ctaPatterns = [
    'try now',
    'get started',
    'sign up',
    'learn more',
    'contact us',
    'book a demo',
    'download',
    'subscribe'
  ];
  
  let ctaCount = 0;
  for (const pattern of ctaPatterns) {
    const matches = contentLower.match(new RegExp(pattern, 'g')) || [];
    ctaCount += matches.length;
  }
  metrics.ctaMentions = ctaCount;

  // Calculate positioning score
  // Good positioning = name mentions + features + audience targeting + CTAs
  const positioningFactors = [
    metrics.nameMentions > 0 ? 25 : 0,
    metrics.featureIncorporation > 50 ? 25 : metrics.featureIncorporation / 2,
    metrics.painPointsAddressed.length > 0 ? 25 : 0,
    metrics.audienceAlignment > 50 ? 25 : metrics.audienceAlignment / 2
  ];
  metrics.positioningScore = Math.min(100, Math.round(positioningFactors.reduce((a, b) => a + b, 0)));

  // Calculate overall score
  metrics.overallScore = Math.round(
    (metrics.positioningScore * 0.5) +
    (metrics.featureIncorporation * 0.3) +
    (metrics.audienceAlignment * 0.2)
  );

  return metrics;
};

/**
 * Check for presence of CTA in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  const ctaPatterns = [
    'try now',
    'get started',
    'sign up',
    'learn more',
    'contact us',
    'book a demo',
    'download',
    'subscribe'
  ];

  const ctaText: string[] = [];
  let hasCTA = false;

  // Look for sentences containing CTA patterns
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    for (const pattern of ctaPatterns) {
      if (sentenceLower.includes(pattern)) {
        ctaText.push(sentence);
        hasCTA = true;
        break;
      }
    }
  }

  return {
    hasCTA,
    ctaText: [...new Set(ctaText)] // Remove duplicates
  };
};
