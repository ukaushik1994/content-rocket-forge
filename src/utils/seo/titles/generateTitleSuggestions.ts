
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
  
  // Get the current year for more relevant titles
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Create different title patterns with more variety
  let titleFormats = [
    // How-to format
    `How to Master ${mainKeyword}: A Complete Guide for ${currentYear}`,
    `${Math.floor(Math.random() * 5) + 5} Essential Steps to Excel at ${mainKeyword}`,
    
    // List format
    `Top ${Math.floor(Math.random() * 10) + 5} ${mainKeyword} Strategies That Actually Work`,
    `${Math.floor(Math.random() * 7) + 3} Proven ${mainKeyword} Methods for Better Results`,
    
    // Question format
    `Why is ${mainKeyword} Essential for Your ${['Strategy', 'Business', 'Success', 'Growth'][Math.floor(Math.random() * 4)]}?`,
    `How Can ${mainKeyword} Transform Your ${['Results', 'Performance', 'Business', 'Approach'][Math.floor(Math.random() * 4)]}?`,
    
    // Benefit-driven format
    `Boost Your ${['Results', 'Performance', 'ROI', 'Success'][Math.floor(Math.random() * 4)]} with These ${mainKeyword} Techniques`,
    `Unlock New ${['Opportunities', 'Possibilities', 'Potentials', 'Growth'][Math.floor(Math.random() * 4)]} with ${mainKeyword}`,
    
    // Problem-solving format
    `Solving Common ${mainKeyword} Problems: Expert ${['Tips', 'Advice', 'Solutions', 'Guidance'][Math.floor(Math.random() * 4)]}`,
    `Overcome ${mainKeyword} Challenges with These ${['Proven', 'Tested', 'Effective', 'Simple'][Math.floor(Math.random() * 4)]} Methods`,
    
    // Data-driven format
    `${mainKeyword} Analysis: Key Insights and ${['Implementation', 'Strategy', 'Tactics', 'Application'][Math.floor(Math.random() * 4)]}`,
    `The Data Behind Successful ${mainKeyword}: What You Need to Know`,
    
    // Tutorial format
    `${['Step-by-Step', 'Comprehensive', 'Complete', 'Ultimate'][Math.floor(Math.random() * 4)]} ${mainKeyword} Implementation Guide`,
    `Learn ${mainKeyword} in ${Math.floor(Math.random() * 10) + 5} ${['Simple', 'Easy', 'Straightforward', 'Quick'][Math.floor(Math.random() * 4)]} Steps`,
    
    // Strategic format
    `${mainKeyword} Strategy: A Framework for ${['Success', 'Growth', 'Excellence', 'Innovation'][Math.floor(Math.random() * 4)]}`,
    `Strategic Approach to ${mainKeyword}: What Works in ${currentYear}`,
    
    // Comprehensive guide
    `The ${['Ultimate', 'Definitive', 'Complete', 'Comprehensive'][Math.floor(Math.random() * 4)]} ${mainKeyword} Guide for ${currentYear}`,
    `Everything You Need to Know About ${mainKeyword} in ${currentYear}`,
    
    // Current year relevance
    `${mainKeyword}: ${['Best', 'Essential', 'Proven', 'Effective'][Math.floor(Math.random() * 4)]} Practices for ${currentYear}`,
    `${mainKeyword} Trends to Watch in ${currentYear}-${nextYear}`,
    
    // Insider knowledge
    `${mainKeyword} ${['Secrets', 'Insights', 'Tactics', 'Strategies'][Math.floor(Math.random() * 4)]} From Industry Experts`,
    `What ${['Experts', 'Professionals', 'Leaders', 'Insiders'][Math.floor(Math.random() * 4)]} Know About ${mainKeyword} That You Don't`,
    
    // Comparison and contrast
    `${mainKeyword} vs. Traditional ${['Methods', 'Approaches', 'Techniques', 'Strategies'][Math.floor(Math.random() * 4)]}: Which is Better?`,
    `${['Comparing', 'Contrasting', 'Evaluating', 'Analyzing'][Math.floor(Math.random() * 4)]} ${mainKeyword} Approaches: What Really Works?`,
  ];
  
  // Add variety with different sentence structures 
  const prefixes = [
    "Mastering", "Understanding", "Exploring", "Demystifying", 
    "Unlocking", "Maximizing", "Implementing", "Discovering",
    "Leveraging", "Harnessing", "Perfecting", "Optimizing"
  ];
  
  const suffixes = [
    "A Comprehensive Guide", "What You Need to Know", 
    "Essential Insights", "Expert Strategies", 
    "Practical Approaches", "Key Principles",
    "Best Practices", "The Complete Handbook",
    "Advanced Techniques", "Industry Perspectives"
  ];
  
  // Add some randomized structured titles
  for (let i = 0; i < 3; i++) {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    titleFormats.push(`${randomPrefix} ${mainKeyword}: ${randomSuffix}`);
  }
  
  // Add secondary keywords to some titles if available
  const enhancedTitles = [...titleFormats];
  if (selectedKeywords && selectedKeywords.length > 0) {
    // Shuffle the selected keywords to introduce more variety
    const shuffledKeywords = [...selectedKeywords].sort(() => Math.random() - 0.5);
    
    // Pick 1-3 secondary keywords to use in titles
    const keywordsToUse = shuffledKeywords.slice(0, Math.min(3, shuffledKeywords.length));
    
    keywordsToUse.forEach(secondaryKeyword => {
      if (secondaryKeyword && secondaryKeyword !== mainKeyword) {
        enhancedTitles.push(`${mainKeyword} and ${secondaryKeyword}: The ${['Perfect', 'Ideal', 'Ultimate', 'Essential'][Math.floor(Math.random() * 4)]} Combination`);
        enhancedTitles.push(`How to Optimize for ${mainKeyword} and ${secondaryKeyword} in ${currentYear}`);
        enhancedTitles.push(`${['Maximize', 'Boost', 'Enhance', 'Improve'][Math.floor(Math.random() * 4)]} Your ${secondaryKeyword} with ${mainKeyword} Strategies`);
      }
    });
    
    // Add multi-keyword titles
    if (keywordsToUse.length >= 2) {
      const kw1 = keywordsToUse[0];
      const kw2 = keywordsToUse[1];
      enhancedTitles.push(`${mainKeyword}: Integrating ${kw1} and ${kw2} for Maximum Results`);
    }
  }
  
  // Shuffle the final title list to introduce more randomness
  const shuffledTitles = enhancedTitles
    .filter(Boolean) // Remove any potential undefined entries
    .sort(() => Math.random() - 0.5);
  
  console.log("[documentAnalysis] Generated title suggestions:", shuffledTitles);
  return shuffledTitles;
};
