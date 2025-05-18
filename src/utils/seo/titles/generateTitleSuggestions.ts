
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
    `The Ultimate Guide to ${mainKeyword} in ${currentYear}`,
    
    // List format
    `Top ${Math.floor(Math.random() * 10) + 5} ${mainKeyword} Strategies That Actually Work`,
    `${Math.floor(Math.random() * 7) + 3} Proven ${mainKeyword} Methods for Better Results`,
    `${Math.floor(Math.random() * 12) + 7} Ways to Improve Your ${mainKeyword} Approach`,
    
    // Question format
    `Why is ${mainKeyword} Essential for Your ${['Strategy', 'Business', 'Success', 'Growth'][Math.floor(Math.random() * 4)]}?`,
    `How Can ${mainKeyword} Transform Your ${['Results', 'Performance', 'Business', 'Approach'][Math.floor(Math.random() * 4)]}?`,
    `What Makes ${mainKeyword} So Important in Today's ${['Market', 'Industry', 'Environment', 'World'][Math.floor(Math.random() * 4)]}?`,
    
    // Benefit-driven format
    `Boost Your ${['Results', 'Performance', 'ROI', 'Success'][Math.floor(Math.random() * 4)]} with These ${mainKeyword} Techniques`,
    `Unlock New ${['Opportunities', 'Possibilities', 'Potentials', 'Growth'][Math.floor(Math.random() * 4)]} with ${mainKeyword}`,
    `How ${mainKeyword} Can Revolutionize Your ${['Business', 'Strategy', 'Approach', 'Results'][Math.floor(Math.random() * 4)]}`,
    
    // Problem-solving format
    `Solving Common ${mainKeyword} Problems: Expert ${['Tips', 'Advice', 'Solutions', 'Guidance'][Math.floor(Math.random() * 4)]}`,
    `Overcome ${mainKeyword} Challenges with These ${['Proven', 'Tested', 'Effective', 'Simple'][Math.floor(Math.random() * 4)]} Methods`,
    `Troubleshooting Your ${mainKeyword}: A Step-by-Step ${['Guide', 'Approach', 'Manual', 'Handbook'][Math.floor(Math.random() * 4)]}`,
    
    // Data-driven format
    `${mainKeyword} Analysis: Key Insights and ${['Implementation', 'Strategy', 'Tactics', 'Application'][Math.floor(Math.random() * 4)]}`,
    `The Data Behind Successful ${mainKeyword}: What You Need to Know`,
    `${mainKeyword} Analytics: Understanding the ${['Numbers', 'Metrics', 'Statistics', 'Patterns'][Math.floor(Math.random() * 4)]}`,
    
    // Tutorial format
    `${['Step-by-Step', 'Comprehensive', 'Complete', 'Ultimate'][Math.floor(Math.random() * 4)]} ${mainKeyword} Implementation Guide`,
    `Learn ${mainKeyword} in ${Math.floor(Math.random() * 10) + 5} ${['Simple', 'Easy', 'Straightforward', 'Quick'][Math.floor(Math.random() * 4)]} Steps`,
    `Mastering ${mainKeyword}: From ${['Beginner', 'Novice', 'Amateur', 'Rookie'][Math.floor(Math.random() * 4)]} to ${['Expert', 'Pro', 'Master', 'Guru'][Math.floor(Math.random() * 4)]}`,
    
    // Strategic format
    `${mainKeyword} Strategy: A Framework for ${['Success', 'Growth', 'Excellence', 'Innovation'][Math.floor(Math.random() * 4)]}`,
    `Strategic Approach to ${mainKeyword}: What Works in ${currentYear}`,
    `Building a Winning ${mainKeyword} Strategy for Your ${['Business', 'Organization', 'Team', 'Brand'][Math.floor(Math.random() * 4)]}`,
    
    // Comprehensive guide
    `The ${['Ultimate', 'Definitive', 'Complete', 'Comprehensive'][Math.floor(Math.random() * 4)]} ${mainKeyword} Guide for ${currentYear}`,
    `Everything You Need to Know About ${mainKeyword} in ${currentYear}`,
    `${mainKeyword} ${['101', 'Essentials', 'Basics', 'Fundamentals'][Math.floor(Math.random() * 4)]}: A Complete ${['Overview', 'Introduction', 'Guide', 'Primer'][Math.floor(Math.random() * 4)]}`,
    
    // Current year relevance
    `${mainKeyword}: ${['Best', 'Essential', 'Proven', 'Effective'][Math.floor(Math.random() * 4)]} Practices for ${currentYear}`,
    `${mainKeyword} Trends to Watch in ${currentYear}-${nextYear}`,
    `The Future of ${mainKeyword}: Predictions for ${nextYear}`,
    
    // Insider knowledge
    `${mainKeyword} ${['Secrets', 'Insights', 'Tactics', 'Strategies'][Math.floor(Math.random() * 4)]} From Industry Experts`,
    `What ${['Experts', 'Professionals', 'Leaders', 'Insiders'][Math.floor(Math.random() * 4)]} Know About ${mainKeyword} That You Don't`,
    `Hidden ${['Aspects', 'Elements', 'Factors', 'Components'][Math.floor(Math.random() * 4)]} of Successful ${mainKeyword} Implementation`,
    
    // Comparison and contrast
    `${mainKeyword} vs. Traditional ${['Methods', 'Approaches', 'Techniques', 'Strategies'][Math.floor(Math.random() * 4)]}: Which is Better?`,
    `${['Comparing', 'Contrasting', 'Evaluating', 'Analyzing'][Math.floor(Math.random() * 4)]} ${mainKeyword} Approaches: What Really Works?`,
    `${mainKeyword}: ${['Old', 'Traditional', 'Conventional', 'Classic'][Math.floor(Math.random() * 4)]} vs. ${['New', 'Modern', 'Contemporary', 'Innovative'][Math.floor(Math.random() * 4)]} Methods`
  ];
  
  // Add variety with different sentence structures 
  const prefixes = [
    "Mastering", "Understanding", "Exploring", "Demystifying", 
    "Unlocking", "Maximizing", "Implementing", "Discovering",
    "Leveraging", "Harnessing", "Perfecting", "Optimizing",
    "Decoding", "Navigating", "Unleashing", "Advancing"
  ];
  
  const suffixes = [
    "A Comprehensive Guide", "What You Need to Know", 
    "Essential Insights", "Expert Strategies", 
    "Practical Approaches", "Key Principles",
    "Best Practices", "The Complete Handbook",
    "Advanced Techniques", "Industry Perspectives",
    "Critical Factors", "Latest Developments",
    "Professional Tips", "Strategic Framework"
  ];
  
  // Add some randomized structured titles
  for (let i = 0; i < 5; i++) {
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    titleFormats.push(`${randomPrefix} ${mainKeyword}: ${randomSuffix}`);
  }
  
  // Add some content-based titles using the first 100 words
  const contentWords = firstWords.split(/\s+/).filter(word => word.length > 4);
  if (contentWords.length > 10) {
    // Pick 3 random significant words from content
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * contentWords.length);
      const significantWord = contentWords[randomIndex];
      if (significantWord && significantWord.length > 4) {
        titleFormats.push(`${mainKeyword} and ${significantWord}: A Perfect ${['Combination', 'Match', 'Pairing', 'Alliance'][Math.floor(Math.random() * 4)]}`);
      }
    }
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
        
        // Add more creative combinations
        enhancedTitles.push(`The Relationship Between ${mainKeyword} and ${secondaryKeyword}: ${['Key Insights', 'Important Connections', 'Critical Links', 'Essential Bonds'][Math.floor(Math.random() * 4)]}`);
        enhancedTitles.push(`${secondaryKeyword}: The Missing Piece in Your ${mainKeyword} Strategy`);
      }
    });
    
    // Add multi-keyword titles
    if (keywordsToUse.length >= 2) {
      const kw1 = keywordsToUse[0];
      const kw2 = keywordsToUse[1];
      enhancedTitles.push(`${mainKeyword}: Integrating ${kw1} and ${kw2} for Maximum Results`);
      
      if (keywordsToUse.length >= 3) {
        const kw3 = keywordsToUse[2];
        enhancedTitles.push(`The ${mainKeyword} Trifecta: ${kw1}, ${kw2}, and ${kw3}`);
      }
    }
  }
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  enhancedTitles.push(`${currentYear} ${mainKeyword} Guide: Updated Insights (Edition ${timestamp})`);
  
  // Shuffle the final title list to introduce more randomness
  const shuffledTitles = enhancedTitles
    .filter(Boolean) // Remove any potential undefined entries
    .sort(() => Math.random() - 0.5);
  
  console.log("[documentAnalysis] Generated title suggestions:", shuffledTitles);
  return shuffledTitles;
};
