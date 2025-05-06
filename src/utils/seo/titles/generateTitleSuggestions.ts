
/**
 * Utility for generating title suggestions
 */

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
