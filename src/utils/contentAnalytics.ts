
/**
 * Advanced content analytics and quality scoring utilities
 */

interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  averageSentenceLength: number;
  averageWordsPerSentence: number;
  complexWords: number;
  readabilityScore: number;
}

interface ContentQualityMetrics {
  overallScore: number;
  structureScore: number;
  contentDepthScore: number;
  keywordOptimizationScore: number;
  readabilityScore: number;
}

export const calculateReadabilityMetrics = (content: string): ReadabilityMetrics => {
  if (!content || content.trim().length === 0) {
    return {
      fleschKincaidGrade: 0,
      averageSentenceLength: 0,
      averageWordsPerSentence: 0,
      complexWords: 0,
      readabilityScore: 0
    };
  }

  // Split into sentences (basic approach)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.length > 0);
  
  // Calculate basic metrics
  const totalSentences = sentences.length;
  const totalWords = words.length;
  const averageWordsPerSentence = totalWords / totalSentences;
  
  // Count complex words (3+ syllables - simplified approach)
  const complexWords = words.filter(word => {
    const syllables = word.toLowerCase().replace(/[^aeiou]/g, '').length;
    return syllables >= 3;
  }).length;
  
  // Flesch-Kincaid Grade Level (simplified)
  const fleschKincaidGrade = Math.max(0, 
    0.39 * averageWordsPerSentence + 11.8 * (complexWords / totalWords) - 15.59
  );
  
  // Readability score (0-100, higher is better)
  const readabilityScore = Math.max(0, Math.min(100, 
    206.835 - 1.015 * averageWordsPerSentence - 84.6 * (complexWords / totalWords)
  ));
  
  return {
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    averageSentenceLength: Math.round(averageWordsPerSentence * 10) / 10,
    averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
    complexWords,
    readabilityScore: Math.round(readabilityScore)
  };
};

export const calculateContentQuality = (
  content: string, 
  keywords: string[] = [], 
  hasStructure: boolean = false
): ContentQualityMetrics => {
  if (!content || content.trim().length === 0) {
    return {
      overallScore: 0,
      structureScore: 0,
      contentDepthScore: 0,
      keywordOptimizationScore: 0,
      readabilityScore: 0
    };
  }

  const readabilityMetrics = calculateReadabilityMetrics(content);
  const wordCount = content.split(/\s+/).length;
  
  // Structure score based on headings and organization
  const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
  const structureScore = Math.min(100, (headingCount * 15) + (hasStructure ? 40 : 0));
  
  // Content depth score based on length and complexity
  const contentDepthScore = Math.min(100, 
    Math.max(0, (wordCount / 10) + (readabilityMetrics.complexWords / 5))
  );
  
  // Keyword optimization score
  let keywordOptimizationScore = 0;
  if (keywords.length > 0) {
    const contentLower = content.toLowerCase();
    const keywordMentions = keywords.reduce((acc, keyword) => {
      const mentions = (contentLower.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      return acc + Math.min(mentions, 5); // Cap at 5 mentions per keyword
    }, 0);
    keywordOptimizationScore = Math.min(100, (keywordMentions / keywords.length) * 20);
  }
  
  // Overall score (weighted average)
  const overallScore = Math.round(
    (structureScore * 0.3) + 
    (contentDepthScore * 0.3) + 
    (keywordOptimizationScore * 0.2) + 
    (readabilityMetrics.readabilityScore * 0.2)
  );
  
  return {
    overallScore,
    structureScore: Math.round(structureScore),
    contentDepthScore: Math.round(contentDepthScore),
    keywordOptimizationScore: Math.round(keywordOptimizationScore),
    readabilityScore: readabilityMetrics.readabilityScore
  };
};

export const getContentInsights = (content: string, keywords: string[] = []) => {
  const quality = calculateContentQuality(content, keywords, true);
  const readability = calculateReadabilityMetrics(content);
  
  const insights = [];
  
  if (quality.structureScore < 60) {
    insights.push("Consider adding more headings to improve content structure");
  }
  
  if (readability.readabilityScore < 50) {
    insights.push("Content may be difficult to read - consider shorter sentences");
  }
  
  if (quality.keywordOptimizationScore < 40 && keywords.length > 0) {
    insights.push("Keywords could be better integrated into the content");
  }
  
  if (readability.averageWordsPerSentence > 25) {
    insights.push("Sentences are quite long - break them down for better readability");
  }
  
  return insights;
};
