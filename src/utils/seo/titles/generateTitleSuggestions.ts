
/**
 * Utility for generating title suggestions
 */

/**
 * Generate compelling title suggestions based on content, outline, and keywords using AI
 */
export const generateTitleSuggestions = async (
  content: string, 
  mainKeyword: string, 
  selectedKeywords: string[],
  outline?: string[]
) => {
  console.log("[documentAnalysis] Generating AI-powered title suggestions for:", mainKeyword);
  
  // Use AI to generate titles if possible, otherwise fallback to template approach
  const aiTitles = await generateAITitles(content, mainKeyword, selectedKeywords, outline);
  if (aiTitles && aiTitles.length > 0) {
    return aiTitles;
  }
  
  // Fallback to template-based generation
  console.log("[documentAnalysis] Falling back to template-based title generation");
  const firstWords = content.split(/\s+/).slice(0, 500).join(' ');
  
  // Get the current year for more relevant titles
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  // Make sure the main keyword is prominently included in all title formats
  const mainKeywordProcessed = mainKeyword.trim();
  
  // Create different title patterns with more variety
  let titleFormats = [
    // How-to format
    `How to Master ${mainKeywordProcessed}: A Complete Guide for ${currentYear}`,
    `${Math.floor(Math.random() * 5) + 5} Essential Steps to Excel at ${mainKeywordProcessed}`,
    `The Ultimate Guide to ${mainKeywordProcessed} in ${currentYear}`,
    
    // List format
    `Top ${Math.floor(Math.random() * 10) + 5} ${mainKeywordProcessed} Strategies That Actually Work`,
    `${Math.floor(Math.random() * 7) + 3} Proven ${mainKeywordProcessed} Methods for Better Results`,
    `${Math.floor(Math.random() * 12) + 7} Ways to Improve Your ${mainKeywordProcessed} Approach`,
    
    // Question format
    `Why is ${mainKeywordProcessed} Essential for Your ${['Strategy', 'Business', 'Success', 'Growth'][Math.floor(Math.random() * 4)]}?`,
    `How Can ${mainKeywordProcessed} Transform Your ${['Results', 'Performance', 'Business', 'Approach'][Math.floor(Math.random() * 4)]}?`,
    `What Makes ${mainKeywordProcessed} So Important in Today's ${['Market', 'Industry', 'Environment', 'World'][Math.floor(Math.random() * 4)]}?`,
    
    // Benefit-driven format
    `Boost Your ${['Results', 'Performance', 'ROI', 'Success'][Math.floor(Math.random() * 4)]} with These ${mainKeywordProcessed} Techniques`,
    `Unlock New ${['Opportunities', 'Possibilities', 'Potentials', 'Growth'][Math.floor(Math.random() * 4)]} with ${mainKeywordProcessed}`,
    `How ${mainKeywordProcessed} Can Revolutionize Your ${['Business', 'Strategy', 'Approach', 'Results'][Math.floor(Math.random() * 4)]}`,
    
    // Problem-solving format
    `Solving Common ${mainKeywordProcessed} Problems: Expert ${['Tips', 'Advice', 'Solutions', 'Guidance'][Math.floor(Math.random() * 4)]}`,
    `Overcome ${mainKeywordProcessed} Challenges with These ${['Proven', 'Tested', 'Effective', 'Simple'][Math.floor(Math.random() * 4)]} Methods`,
    `Troubleshooting Your ${mainKeywordProcessed}: A Step-by-Step ${['Guide', 'Approach', 'Manual', 'Handbook'][Math.floor(Math.random() * 4)]}`,
    
    // Data-driven format
    `${mainKeywordProcessed} Analysis: Key Insights and ${['Implementation', 'Strategy', 'Tactics', 'Application'][Math.floor(Math.random() * 4)]}`,
    `The Data Behind Successful ${mainKeywordProcessed}: What You Need to Know`,
    `${mainKeywordProcessed} Analytics: Understanding the ${['Numbers', 'Metrics', 'Statistics', 'Patterns'][Math.floor(Math.random() * 4)]}`,
    
    // Tutorial format
    `${['Step-by-Step', 'Comprehensive', 'Complete', 'Ultimate'][Math.floor(Math.random() * 4)]} ${mainKeywordProcessed} Implementation Guide`,
    `Learn ${mainKeywordProcessed} in ${Math.floor(Math.random() * 10) + 5} ${['Simple', 'Easy', 'Straightforward', 'Quick'][Math.floor(Math.random() * 4)]} Steps`,
    `Mastering ${mainKeywordProcessed}: From ${['Beginner', 'Novice', 'Amateur', 'Rookie'][Math.floor(Math.random() * 4)]} to ${['Expert', 'Pro', 'Master', 'Guru'][Math.floor(Math.random() * 4)]}`,
    
    // Strategic format
    `${mainKeywordProcessed} Strategy: A Framework for ${['Success', 'Growth', 'Excellence', 'Innovation'][Math.floor(Math.random() * 4)]}`,
    `Strategic Approach to ${mainKeywordProcessed}: What Works in ${currentYear}`,
    `Building a Winning ${mainKeywordProcessed} Strategy for Your ${['Business', 'Organization', 'Team', 'Brand'][Math.floor(Math.random() * 4)]}`,
    
    // Comprehensive guide
    `The ${['Ultimate', 'Definitive', 'Complete', 'Comprehensive'][Math.floor(Math.random() * 4)]} ${mainKeywordProcessed} Guide for ${currentYear}`,
    `Everything You Need to Know About ${mainKeywordProcessed} in ${currentYear}`,
    `${mainKeywordProcessed} ${['101', 'Essentials', 'Basics', 'Fundamentals'][Math.floor(Math.random() * 4)]}: A Complete ${['Overview', 'Introduction', 'Guide', 'Primer'][Math.floor(Math.random() * 4)]}`,
    
    // Current year relevance
    `${mainKeywordProcessed}: ${['Best', 'Essential', 'Proven', 'Effective'][Math.floor(Math.random() * 4)]} Practices for ${currentYear}`,
    `${mainKeywordProcessed} Trends to Watch in ${currentYear}-${nextYear}`,
    `The Future of ${mainKeywordProcessed}: Predictions for ${nextYear}`,
    
    // Insider knowledge
    `${mainKeywordProcessed} ${['Secrets', 'Insights', 'Tactics', 'Strategies'][Math.floor(Math.random() * 4)]} From Industry Experts`,
    `What ${['Experts', 'Professionals', 'Leaders', 'Insiders'][Math.floor(Math.random() * 4)]} Know About ${mainKeywordProcessed} That You Don't`,
    `Hidden ${['Aspects', 'Elements', 'Factors', 'Components'][Math.floor(Math.random() * 4)]} of Successful ${mainKeywordProcessed} Implementation`,
    
    // Comparison and contrast
    `${mainKeywordProcessed} vs. Traditional ${['Methods', 'Approaches', 'Techniques', 'Strategies'][Math.floor(Math.random() * 4)]}: Which is Better?`,
    `${['Comparing', 'Contrasting', 'Evaluating', 'Analyzing'][Math.floor(Math.random() * 4)]} ${mainKeywordProcessed} Approaches: What Really Works?`,
    `${mainKeywordProcessed}: ${['Old', 'Traditional', 'Conventional', 'Classic'][Math.floor(Math.random() * 4)]} vs. ${['New', 'Modern', 'Contemporary', 'Innovative'][Math.floor(Math.random() * 4)]} Methods`
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
    titleFormats.push(`${randomPrefix} ${mainKeywordProcessed}: ${randomSuffix}`);
  }
  
  // Add some content-based titles using the first 100 words
  const contentWords = firstWords.split(/\s+/).filter(word => word.length > 4);
  if (contentWords.length > 10) {
    // Pick 3 random significant words from content
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * contentWords.length);
      const significantWord = contentWords[randomIndex];
      if (significantWord && significantWord.length > 4) {
        titleFormats.push(`${mainKeywordProcessed} and ${significantWord}: A Perfect ${['Combination', 'Match', 'Pairing', 'Alliance'][Math.floor(Math.random() * 4)]}`);
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
      if (secondaryKeyword && secondaryKeyword !== mainKeywordProcessed) {
        enhancedTitles.push(`${mainKeywordProcessed} and ${secondaryKeyword}: The ${['Perfect', 'Ideal', 'Ultimate', 'Essential'][Math.floor(Math.random() * 4)]} Combination`);
        enhancedTitles.push(`How to Optimize for ${mainKeywordProcessed} and ${secondaryKeyword} in ${currentYear}`);
        enhancedTitles.push(`${['Maximize', 'Boost', 'Enhance', 'Improve'][Math.floor(Math.random() * 4)]} Your ${secondaryKeyword} with ${mainKeywordProcessed} Strategies`);
        
        // Add more creative combinations
        enhancedTitles.push(`The Relationship Between ${mainKeywordProcessed} and ${secondaryKeyword}: ${['Key Insights', 'Important Connections', 'Critical Links', 'Essential Bonds'][Math.floor(Math.random() * 4)]}`);
        enhancedTitles.push(`${secondaryKeyword}: The Missing Piece in Your ${mainKeywordProcessed} Strategy`);
      }
    });
    
    // Add multi-keyword titles
    if (keywordsToUse.length >= 2) {
      const kw1 = keywordsToUse[0];
      const kw2 = keywordsToUse[1];
      enhancedTitles.push(`${mainKeywordProcessed}: Integrating ${kw1} and ${kw2} for Maximum Results`);
      
      if (keywordsToUse.length >= 3) {
        const kw3 = keywordsToUse[2];
        enhancedTitles.push(`The ${mainKeywordProcessed} Trifecta: ${kw1}, ${kw2}, and ${kw3}`);
      }
    }
  }
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-4);
  enhancedTitles.push(`${currentYear} ${mainKeywordProcessed} Guide: Updated Insights (Edition ${timestamp})`);
  
  // Shuffle the final title list to introduce more randomness
  const shuffledTitles = enhancedTitles
    .filter(Boolean) // Remove any potential undefined entries
    .sort(() => Math.random() - 0.5);
  
  console.log("[documentAnalysis] Generated title suggestions:", shuffledTitles);
  return shuffledTitles;
};

/**
 * Generate unique titles using AI based on content and outline
 */
async function generateAITitles(
  content: string, 
  mainKeyword: string, 
  selectedKeywords: string[],
  outline?: string[]
): Promise<string[] | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { sendChatRequest } = await import('@/services/aiService');
    
    // Create outline context
    const outlineText = outline && outline.length > 0 
      ? outline.map((item, i) => `${i + 1}. ${item}`).join('\n')
      : 'No outline provided';
    
    // Extract content themes from first 300 words
    const contentPreview = content.split(/\s+/).slice(0, 300).join(' ');
    const secondaryKeywords = selectedKeywords.filter(kw => kw !== mainKeyword).slice(0, 5);
    
    const prompt = `Generate 15 unique, compelling SEO-optimized titles for content about "${mainKeyword}".

CONTENT CONTEXT:
- Main keyword: ${mainKeyword}
- Secondary keywords: ${secondaryKeywords.join(', ') || 'None'}
- Content outline:
${outlineText}
- Content preview: ${contentPreview.substring(0, 200)}...

REQUIREMENTS:
1. Each title must be unique and creative
2. Naturally incorporate the main keyword "${mainKeyword}"
3. Make titles specific to the outline structure provided
4. Mix different title formats (how-to, listicle, guide, etc.)
5. Target 50-60 characters for SEO optimization
6. Make titles compelling and click-worthy
7. Avoid generic phrases like "Complete Guide" unless truly comprehensive
8. Base titles on the actual outline content structure

TITLE FORMATS TO USE:
- How-to guides (if outline supports it)
- Numbered lists (if outline has multiple points)
- Question-based titles (if addressing specific problems)
- Benefit-driven titles
- Year-specific titles (${new Date().getFullYear()})
- Comparison titles (if relevant)
- Problem-solving titles
- Actionable titles

Return ONLY the 15 titles, one per line, without numbering or formatting.`;

    const response = await sendChatRequest('openrouter', {
      messages: [
        { role: 'system', content: 'You are an expert SEO copywriter specializing in creating compelling, unique titles that drive clicks while maintaining search optimization.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      maxTokens: 800
    });

    if (response?.choices?.[0]?.message?.content) {
      const titles = response.choices[0].message.content
        .split('\n')
        .map(title => title.trim())
        .filter(title => title.length > 0 && !title.match(/^\d+\./)) // Remove numbered prefixes
        .slice(0, 15);
      
      console.log("[documentAnalysis] Generated AI titles:", titles);
      return titles;
    }
  } catch (error) {
    console.error("[documentAnalysis] Error generating AI titles:", error);
  }
  
  return null;
}
