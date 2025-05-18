
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
  
  // Create different title patterns with more variety
  let titleFormats = [
    // How-to format
    `How to Master ${mainKeyword}: A Complete Guide`,
    
    // List format
    `Top ${Math.floor(Math.random() * 10) + 5} ${mainKeyword} Strategies for Better Results`,
    
    // Question format
    `Why is ${mainKeyword} Essential for Your Strategy?`,
    
    // Benefit-driven format
    `Boost Your Results with These ${mainKeyword} Techniques`,
    
    // Problem-solving format
    `Solving Common ${mainKeyword} Problems: Expert Tips`,
    
    // Data-driven format
    `${mainKeyword} Analysis: Key Insights and Implementation`,
    
    // Tutorial format
    `Step-by-Step ${mainKeyword} Implementation Guide`,
    
    // Strategic format
    `${mainKeyword} Strategy: A Framework for Success`,
    
    // Comprehensive guide
    `The Ultimate ${mainKeyword} Guide: Everything You Need to Know`,
    
    // Current year relevance
    `${mainKeyword}: Best Practices for ${new Date().getFullYear()}`,
  ];
  
  // Add variety with different sentence structures 
  const prefixes = [
    "Mastering", "Understanding", "Exploring", "Demystifying", 
    "Unlocking", "Maximizing", "Implementing", "Discovering"
  ];
  
  const suffixes = [
    "A Comprehensive Guide", "What You Need to Know", 
    "Essential Insights", "Expert Strategies", 
    "Practical Approaches", "Key Principles"
  ];
  
  // Add some randomized structured titles
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  titleFormats.push(`${randomPrefix} ${mainKeyword}: ${randomSuffix}`);
  
  // Add secondary keywords to some titles if available
  const enhancedTitles = [...titleFormats];
  if (selectedKeywords && selectedKeywords.length > 0) {
    // Shuffle the selected keywords to introduce more variety
    const shuffledKeywords = [...selectedKeywords].sort(() => Math.random() - 0.5);
    
    // Pick 1-2 secondary keywords to use in titles
    const keywordsToUse = shuffledKeywords.slice(0, Math.min(2, shuffledKeywords.length));
    
    keywordsToUse.forEach(secondaryKeyword => {
      if (secondaryKeyword && secondaryKeyword !== mainKeyword) {
        enhancedTitles.push(`${mainKeyword} and ${secondaryKeyword}: The Perfect Combination`);
        enhancedTitles.push(`How to Optimize for ${mainKeyword} and ${secondaryKeyword}`);
      }
    });
  }
  
  // Shuffle the final title list to introduce more randomness
  const shuffledTitles = enhancedTitles.sort(() => Math.random() - 0.5);
  
  console.log("[documentAnalysis] Generated title suggestions:", shuffledTitles);
  return shuffledTitles;
};
