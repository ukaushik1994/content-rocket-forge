
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
  
  // Extract heading text content by level
  const h1 = Array.from(doc.querySelectorAll('h1')).map(el => el.textContent || '');
  const h2 = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent || '');
  const h3 = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent || '');
  const h4 = Array.from(doc.querySelectorAll('h4')).map(el => el.textContent || '');
  const h5 = Array.from(doc.querySelectorAll('h5')).map(el => el.textContent || '');
  const h6 = Array.from(doc.querySelectorAll('h6')).map(el => el.textContent || '');
  
  for (const tag of headingTags) {
    const level = parseInt(tag.tagName.substring(1));
    
    if (level > lastHeadingLevel + 1 && lastHeadingLevel !== 0) {
      hasLogicalHierarchy = false;
      break;
    }
    
    lastHeadingLevel = level;
  }
  
  return {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hasSingleH1,
    hasLogicalHierarchy
  };
};

/**
 * Generate meta title and description suggestions based on content
 */
export const generateMetaSuggestions = (content: string, mainKeyword: string, contentTitle: string) => {
  console.log("[documentAnalysis] Generating meta suggestions for:", { mainKeyword, contentTitle });
  
  // Generate a meta title (50-60 characters)
  let metaTitle = '';
  if (contentTitle && contentTitle.length > 0 && contentTitle !== 'Untitled') {
    // Use existing content title if it's meaningful
    metaTitle = contentTitle.includes(mainKeyword) 
      ? contentTitle 
      : `${contentTitle} | ${mainKeyword}`;
  } else {
    // Create a new title
    metaTitle = `${mainKeyword} - Complete Guide`;
  }
  
  // Ensure title isn't too long
  if (metaTitle.length > 60) {
    metaTitle = metaTitle.substring(0, 57) + '...';
  }
  
  // Generate a meta description (150-160 characters)
  const metaDescription = `Learn about ${mainKeyword} in this comprehensive guide. Get expert tips, strategies, and insights to improve your SEO and boost your search engine rankings.`;
  
  console.log("[documentAnalysis] Generated:", { metaTitle, metaDescription });
  
  return {
    metaTitle,
    metaDescription
  };
};

/**
 * Generate compelling title suggestions based on content and keywords
 */
export const generateTitleSuggestions = async (content: string, mainKeyword: string, selectedKeywords: string[]) => {
  console.log("[documentAnalysis] Generating title suggestions for:", mainKeyword);
  
  // Analyse first 300 words of content to extract themes
  const firstWords = content.split(/\s+/).slice(0, 300).join(' ');
  
  // Create different title patterns
  const titleFormats = [
    // How-to format
    `How to Master ${mainKeyword}: A Complete Guide`,
    
    // List format
    `Top 10 ${mainKeyword} Strategies for Better SEO Results`,
    
    // Question format
    `Why is ${mainKeyword} Essential for Your SEO Strategy?`,
    
    // Benefit-driven format
    `Boost Your Rankings with These ${mainKeyword} Techniques`,
    
    // Problem-solving format
    `Solving Common ${mainKeyword} Problems: Expert Tips`,
    
    // SEO-focused format
    `${mainKeyword}: Best Practices for SEO Success in 2023`,
    
    // Authoritative format
    `The Ultimate Guide to ${mainKeyword} for Digital Marketers`,
    
    // Data-driven format
    `${mainKeyword} Analysis: Key Insights and Implementation`,
    
    // Tutorial format
    `Step-by-Step ${mainKeyword} Implementation for Beginners`,
    
    // Strategic format
    `${mainKeyword} Strategy: A Framework for Successful Optimization`
  ];
  
  // Add secondary keywords to some titles if available
  const enhancedTitles = [...titleFormats];
  if (selectedKeywords && selectedKeywords.length > 0) {
    const secondaryKeyword = selectedKeywords[0];
    if (secondaryKeyword && secondaryKeyword !== mainKeyword) {
      enhancedTitles.push(`${mainKeyword} and ${secondaryKeyword}: The Perfect SEO Combination`);
      enhancedTitles.push(`How to Optimize for ${mainKeyword} and ${secondaryKeyword}`);
    }
  }
  
  console.log("[documentAnalysis] Generated title suggestions:", enhancedTitles);
  return enhancedTitles;
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
    positioningScore += 20; // Mentioned early in content
  }
  
  const nameMentions = (content.toLowerCase().match(new RegExp(name.toLowerCase(), 'g')) || []).length;
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
  
  // Simple estimate for pain points addressed and audience alignment
  const painPointsAddressed = Math.min(100, Math.round(featureIncorporationPercentage * 1.2));
  const audienceAlignment = Math.min(100, Math.round((positioningScore + featureIncorporationPercentage) / 2));
  
  return {
    featureIncorporation: Math.round(featureIncorporationPercentage),
    positioningScore,
    nameMentions,
    painPointsAddressed,
    audienceAlignment
  };
};

/**
 * Detect Call-to-Action elements in content
 */
export const detectCTAs = (content: string): { hasCTA: boolean; ctaText: string[] } => {
  const ctaMarkers = [
    'click here',
    'sign up',
    'register',
    'subscribe',
    'download',
    'learn more',
    'get started',
    'try now',
    'contact us',
    'buy now',
    'order now'
  ];
  
  const foundCTAs: string[] = [];
  
  // Check each sentence for CTA markers
  const sentences = content.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    for (const marker of ctaMarkers) {
      if (lowerSentence.includes(marker)) {
        foundCTAs.push(sentence.trim());
        break;
      }
    }
  }
  
  // Remove duplicates
  const uniqueCTAs = [...new Set(foundCTAs)];
  
  return {
    hasCTA: uniqueCTAs.length > 0,
    ctaText: uniqueCTAs
  };
};
