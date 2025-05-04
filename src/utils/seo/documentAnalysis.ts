
/**
 * Utility functions for analyzing document structure, headings, and content
 */

/**
 * Extract document structure from HTML content
 */
export const extractDocumentStructure = (htmlContent: string) => {
  // Create a temporary DOM parser in the browser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Check for single H1 tag
  const h1Tags = doc.querySelectorAll('h1');
  const hasSingleH1 = h1Tags.length === 1;
  
  // Check for logical heading hierarchy (e.g., H2 follows H1, H3 follows H2)
  let hasLogicalHierarchy = true;
  let lastHeadingLevel = 0;
  
  const headingTags = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  
  // Count headings by level
  const headingCounts = {
    h1: h1Tags.length,
    h2: doc.querySelectorAll('h2').length,
    h3: doc.querySelectorAll('h3').length,
    h4: doc.querySelectorAll('h4').length,
    h5: doc.querySelectorAll('h5').length,
    h6: doc.querySelectorAll('h6').length
  };
  
  for (const tag of headingTags) {
    const level = parseInt(tag.tagName.substring(1));
    
    if (level > lastHeadingLevel + 1 && lastHeadingLevel !== 0) {
      hasLogicalHierarchy = false;
      break;
    }
    
    lastHeadingLevel = level;
  }
  
  return {
    h1: headingCounts.h1,
    h2: headingCounts.h2,
    h3: headingCounts.h3,
    h4: headingCounts.h4,
    h5: headingCounts.h5,
    h6: headingCounts.h6,
    hasSingleH1,
    hasLogicalHierarchy
  };
};

/**
 * Generate meta title and description suggestions based on content
 */
export const generateMetaSuggestions = (content: string, mainKeyword: string, contentTitle: string) => {
  // Generate a meta title (50-60 characters)
  const metaTitle = contentTitle
    ? `${contentTitle} | ${mainKeyword}`
    : `Your SEO Optimized Title | ${mainKeyword}`;
    
  // Generate a meta description (150-160 characters)
  const metaDescription = `Learn about ${mainKeyword} in this comprehensive guide. Get expert tips, strategies, and insights to improve your SEO.`;
  
  return {
    metaTitle,
    metaDescription
  };
};

/**
 * Analyze solution integration within the content
 */
export const analyzeSolutionIntegration = (content: string, selectedSolution: { name: string; features: string[] }) => {
  const { name, features } = selectedSolution;
  
  // Calculate how many solution features are incorporated
  const featureIncorporation = features.reduce((count, feature) => {
    if (content.toLowerCase().includes(feature.toLowerCase())) {
      return count + 1;
    }
    return count;
  }, 0);
  
  const featureIncorporationPercentage = (featureIncorporation / features.length) * 100;
  
  // Calculate how well the solution is positioned (e.g., mentioned early, often, and in a positive context)
  let positioningScore = 50;
  
  if (content.toLowerCase().indexOf(name.toLowerCase()) < content.length / 3) {
    positioningScore += 20;
  }
  
  const nameOccurrences = (content.match(new RegExp(name, 'gi')) || []).length;
  if (nameOccurrences > 3) {
    positioningScore += 15;
  }
  
  return {
    featureIncorporation: featureIncorporationPercentage,
    positioningScore: Math.min(positioningScore, 100),
    nameMentions: nameOccurrences,
    painPointsAddressed: [] as string[],
    audienceAlignment: 0
  };
};

/**
 * Detect call-to-actions in the content
 */
export const detectCTAs = (content: string) => {
  const ctaKeywords = ['Sign up', 'Subscribe', 'Learn more', 'Get started', 'Contact us'];
  const ctaText: string[] = [];
  
  let hasCTA = false;
  
  for (const keyword of ctaKeywords) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      hasCTA = true;
      ctaText.push(keyword);
    }
  }
  
  return {
    hasCTA,
    ctaText
  };
};

/**
 * Generate title suggestions based on content and keywords
 */
export const generateTitleSuggestions = async (
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[]
): Promise<string[]> => {
  // Generate 5 different title suggestions
  const suggestions: string[] = [
    `Ultimate Guide to ${mainKeyword}: Everything You Need to Know`,
    `The Complete ${mainKeyword} Guide: Tips, Strategies, and Best Practices`,
    `${mainKeyword} Made Simple: A Comprehensive Guide`,
    `How to Master ${mainKeyword}: Expert Tips & Advice`,
    `${mainKeyword} 101: The Essential Guide for Beginners`
  ];

  // Add some titles with secondary keywords if available
  if (secondaryKeywords.length > 0) {
    const relevantSecondaryKeywords = secondaryKeywords.slice(0, 3);
    
    relevantSecondaryKeywords.forEach((keyword) => {
      suggestions.push(`${mainKeyword} and ${keyword}: A Complete Guide`);
    });
    
    if (relevantSecondaryKeywords.length >= 2) {
      suggestions.push(
        `Ultimate ${mainKeyword} Guide: Including ${relevantSecondaryKeywords[0]} and ${relevantSecondaryKeywords[1]}`
      );
    }
  }

  // Return the array of suggestions
  return suggestions;
};
