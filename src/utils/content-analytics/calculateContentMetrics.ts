
import { ReadabilityMetrics, TechnicalSeoMetrics, ContentQualityMetrics } from '@/contexts/content-builder/types/analytics-types';

/**
 * Calculate readability metrics from content
 */
export const calculateReadabilityMetrics = (content: string): ReadabilityMetrics => {
  if (!content || content.trim().length === 0) {
    return {
      wordCount: 0,
      sentenceCount: 0,
      avgWordsPerSentence: 0,
      grade: 'N/A',
      score: 0
    };
  }

  // Count words (split by whitespace, filter empty)
  const words = content.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Count sentences (split by sentence endings)
  const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  const sentenceCount = sentences.length;

  // Calculate average words per sentence
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Simple readability score calculation (Flesch Reading Ease approximation)
  let score = 0;
  let grade = 'N/A';

  if (sentenceCount > 0 && wordCount > 0) {
    // Simplified calculation: longer sentences and longer words = harder to read
    const avgSentenceLength = avgWordsPerSentence;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
    
    // Score between 0-100, higher = easier to read
    score = Math.max(0, Math.min(100, 100 - (avgSentenceLength * 2) - (avgWordLength * 5)));
    
    if (score >= 90) grade = 'Very Easy';
    else if (score >= 80) grade = 'Easy';
    else if (score >= 70) grade = 'Fairly Easy';
    else if (score >= 60) grade = 'Standard';
    else if (score >= 50) grade = 'Fairly Difficult';
    else if (score >= 30) grade = 'Difficult';
    else grade = 'Very Difficult';
  }

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    grade,
    score: Math.round(score)
  };
};

/**
 * Calculate technical SEO metrics from content
 */
export const calculateTechnicalSeoMetrics = (
  content: string,
  metaTitle?: string | null,
  metaDescription?: string | null
): TechnicalSeoMetrics => {
  if (!content) {
    return {
      contentLength: 0,
      headingCount: 0,
      linkCount: 0,
      imageCount: 0,
      metaTitleLength: 0,
      metaDescriptionLength: 0,
      hasMetaTitle: false,
      hasMetaDescription: false
    };
  }

  // Count headings (markdown format)
  const headingMatches = content.match(/^#{1,6}\s+.+$/gm) || [];
  const headingCount = headingMatches.length;

  // Count links (markdown format)
  const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const linkCount = linkMatches.length;

  // Count images (markdown format)
  const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const imageCount = imageMatches.length;

  return {
    contentLength: content.length,
    headingCount,
    linkCount,
    imageCount,
    metaTitleLength: metaTitle?.length || 0,
    metaDescriptionLength: metaDescription?.length || 0,
    hasMetaTitle: !!(metaTitle && metaTitle.trim().length > 0),
    hasMetaDescription: !!(metaDescription && metaDescription.trim().length > 0)
  };
};

/**
 * Calculate overall content quality metrics
 */
export const calculateContentQualityMetrics = (
  readabilityMetrics: ReadabilityMetrics,
  technicalMetrics: TechnicalSeoMetrics,
  keywordUsage: any[]
): ContentQualityMetrics => {
  // Structure score (headings, length, etc.)
  let structureScore = 0;
  if (technicalMetrics.headingCount > 0) structureScore += 25;
  if (technicalMetrics.contentLength > 300) structureScore += 25;
  if (technicalMetrics.contentLength > 1000) structureScore += 25;
  if (technicalMetrics.linkCount > 0) structureScore += 25;

  // Keyword optimization score
  let keywordOptimizationScore = 0;
  if (keywordUsage.length > 0) {
    const mainKeywordUsage = keywordUsage[0];
    if (mainKeywordUsage && mainKeywordUsage.count > 0) {
      keywordOptimizationScore = Math.min(100, mainKeywordUsage.count * 20);
    }
  }

  // Meta optimization score
  let metaOptimizationScore = 0;
  if (technicalMetrics.hasMetaTitle) metaOptimizationScore += 50;
  if (technicalMetrics.hasMetaDescription) metaOptimizationScore += 50;

  // Overall score (weighted average)
  const overallScore = Math.round(
    (structureScore * 0.3) +
    (keywordOptimizationScore * 0.3) +
    (metaOptimizationScore * 0.2) +
    (readabilityMetrics.score * 0.2)
  );

  return {
    overallScore,
    structureScore,
    keywordOptimizationScore,
    metaOptimizationScore,
    readabilityScore: readabilityMetrics.score
  };
};
