/**
 * Advanced metrics calculation for SERP data
 * Provides real keyword difficulty, search volume estimation, and competition analysis
 */

/**
 * Calculate real metrics from SERP analysis
 */
export function calculateRealMetrics(data: any, keyword: string, organicResults: any[]): {
  searchVolume: number;
  keywordDifficulty: number;
  competitionScore: number;
  opportunityScore: number;
  dataQuality: string;
  confidence: string;
} {
  console.log('📊 Calculating real metrics for:', keyword);

  // Analyze SERP features for difficulty calculation
  const serpFeatures = analyzeSerpFeatures(data);
  
  // Calculate keyword difficulty based on SERP analysis
  const keywordDifficulty = calculateKeywordDifficulty(data, organicResults, serpFeatures);
  
  // Estimate search volume using heuristic methods
  const searchVolume = estimateSearchVolumeAdvanced(data, keyword, serpFeatures);
  
  // Calculate competition score
  const competitionScore = calculateCompetitionScore(organicResults, serpFeatures);
  
  // Calculate opportunity score
  const opportunityScore = calculateOpportunityScore(serpFeatures, keywordDifficulty, competitionScore);
  
  // Determine data quality and confidence
  const { dataQuality, confidence } = assessDataQuality(data, serpFeatures);

  return {
    searchVolume,
    keywordDifficulty: Math.round(keywordDifficulty),
    competitionScore: Math.round(competitionScore * 100) / 100,
    opportunityScore: Math.round(opportunityScore),
    dataQuality,
    confidence
  };
}

/**
 * Analyze SERP features to understand search landscape
 */
function analyzeSerpFeatures(data: any): {
  hasAds: boolean;
  adCount: number;
  hasFeaturedSnippet: boolean;
  hasKnowledgeGraph: boolean;
  hasLocalPack: boolean;
  hasImages: boolean;
  hasVideos: boolean;
  hasTopStories: boolean;
  hasShopping: boolean;
  totalFeatures: number;
} {
  return {
    hasAds: !!(data.ads && data.ads.length > 0),
    adCount: data.ads?.length || 0,
    hasFeaturedSnippet: !!data.featured_snippet,
    hasKnowledgeGraph: !!data.knowledge_graph,
    hasLocalPack: !!(data.local_results && data.local_results.length > 0),
    hasImages: !!(data.images_results && data.images_results.length > 0),
    hasVideos: !!(data.video_results && data.video_results.length > 0),
    hasTopStories: !!(data.top_stories && data.top_stories.length > 0),
    hasShopping: !!(data.shopping_results && data.shopping_results.length > 0),
    totalFeatures: [
      data.ads?.length > 0,
      data.featured_snippet,
      data.knowledge_graph,
      data.local_results?.length > 0,
      data.images_results?.length > 0,
      data.video_results?.length > 0,
      data.top_stories?.length > 0,
      data.shopping_results?.length > 0
    ].filter(Boolean).length
  };
}

/**
 * Calculate keyword difficulty based on comprehensive SERP analysis
 */
function calculateKeywordDifficulty(data: any, organicResults: any[], serpFeatures: any): number {
  let difficulty = 30; // Base difficulty
  
  // Analyze domain authority indicators
  const highAuthorityDomains = organicResults.filter(result => {
    const domain = extractDomain(result.link);
    return isHighAuthorityDomain(domain);
  }).length;
  
  // Increase difficulty based on high authority domains in top 10
  difficulty += (highAuthorityDomains / organicResults.length) * 40;
  
  // SERP features impact on difficulty
  if (serpFeatures.hasFeaturedSnippet) difficulty += 15;
  if (serpFeatures.hasKnowledgeGraph) difficulty += 10;
  if (serpFeatures.hasAds && serpFeatures.adCount > 3) difficulty += 10;
  if (serpFeatures.hasLocalPack) difficulty += 5;
  if (serpFeatures.totalFeatures > 4) difficulty += 10;
  
  // Analyze title competition
  const titleLength = organicResults.reduce((avg, result) => avg + (result.title?.length || 0), 0) / organicResults.length;
  if (titleLength > 60) difficulty += 5; // Longer titles suggest more competition
  
  // Analyze content depth from snippets
  const avgSnippetLength = organicResults.reduce((avg, result) => avg + (result.snippet?.length || 0), 0) / organicResults.length;
  if (avgSnippetLength > 150) difficulty += 8; // Longer snippets suggest detailed content
  
  return Math.min(Math.max(difficulty, 1), 100);
}

/**
 * Advanced search volume estimation using multiple signals
 */
function estimateSearchVolumeAdvanced(data: any, keyword: string, serpFeatures: any): number {
  // Base volume estimation from keyword characteristics
  let baseVolume = estimateVolumeFromKeyword(keyword);
  
  // Adjust based on SERP features
  if (serpFeatures.hasAds && serpFeatures.adCount > 0) {
    // More ads suggest higher commercial value and volume
    baseVolume *= (1 + (serpFeatures.adCount * 0.3));
  }
  
  if (serpFeatures.hasFeaturedSnippet) {
    baseVolume *= 1.4; // Featured snippets indicate popular queries
  }
  
  if (serpFeatures.hasTopStories) {
    baseVolume *= 1.6; // News interest suggests high volume
  }
  
  if (serpFeatures.hasLocalPack) {
    baseVolume *= 1.2; // Local searches often have steady volume
  }
  
  // Adjust based on total results count
  const totalResults = data.search_metadata?.total_results || 0;
  if (totalResults > 100000000) baseVolume *= 1.5;
  else if (totalResults > 10000000) baseVolume *= 1.2;
  else if (totalResults < 1000000) baseVolume *= 0.7;
  
  // Related searches indicate volume
  const relatedCount = data.related_searches?.length || 0;
  if (relatedCount > 8) baseVolume *= 1.3;
  else if (relatedCount > 4) baseVolume *= 1.1;
  
  return Math.round(Math.max(baseVolume, 10));
}

/**
 * Estimate volume from keyword characteristics
 */
function estimateVolumeFromKeyword(keyword: string): number {
  const words = keyword.toLowerCase().split(' ').filter(w => w.length > 0);
  let baseVolume = 1000; // Default base
  
  // Word count impact
  if (words.length === 1) baseVolume = 5000; // Single words often have higher volume
  else if (words.length === 2) baseVolume = 2000;
  else if (words.length >= 4) baseVolume = 500; // Long tail has lower volume
  
  // Common word modifiers
  const highVolumeWords = ['how', 'what', 'best', 'top', 'free', 'online'];
  const commercialWords = ['buy', 'price', 'cost', 'cheap', 'review'];
  const lowVolumeWords = ['advanced', 'professional', 'enterprise', 'complex'];
  
  if (words.some(word => highVolumeWords.includes(word))) baseVolume *= 2;
  if (words.some(word => commercialWords.includes(word))) baseVolume *= 1.5;
  if (words.some(word => lowVolumeWords.includes(word))) baseVolume *= 0.6;
  
  return baseVolume;
}

/**
 * Calculate competition score based on organic results analysis
 */
function calculateCompetitionScore(organicResults: any[], serpFeatures: any): number {
  let competition = 0.3; // Base competition
  
  // High authority domains increase competition
  const highAuthDomains = organicResults.filter(result => 
    isHighAuthorityDomain(extractDomain(result.link))
  ).length;
  competition += (highAuthDomains / organicResults.length) * 0.4;
  
  // SERP features indicate competition
  if (serpFeatures.hasAds) competition += 0.1 + (serpFeatures.adCount * 0.05);
  if (serpFeatures.hasFeaturedSnippet) competition += 0.1;
  if (serpFeatures.hasKnowledgeGraph) competition += 0.05;
  
  return Math.min(Math.max(competition, 0.1), 1.0);
}

/**
 * Calculate opportunity score based on SERP analysis
 */
function calculateOpportunityScore(serpFeatures: any, difficulty: number, competition: number): number {
  let opportunity = 70; // Base opportunity
  
  // Lower difficulty = higher opportunity
  opportunity -= (difficulty - 50) * 0.3;
  
  // Lower competition = higher opportunity
  opportunity -= (competition - 0.5) * 30;
  
  // SERP features can create opportunities
  if (!serpFeatures.hasFeaturedSnippet) opportunity += 15; // Opportunity to capture featured snippet
  if (serpFeatures.adCount < 2) opportunity += 10; // Low ad competition
  if (!serpFeatures.hasKnowledgeGraph) opportunity += 5; // No dominant knowledge result
  
  return Math.min(Math.max(Math.round(opportunity), 1), 100);
}

/**
 * Assess data quality and confidence based on available signals
 */
function assessDataQuality(data: any, serpFeatures: any): { dataQuality: string; confidence: string } {
  let qualityScore = 0;
  
  // More organic results = higher quality
  if ((data.organic_results?.length || 0) >= 10) qualityScore += 30;
  else qualityScore += (data.organic_results?.length || 0) * 3;
  
  // More SERP features = more reliable data
  qualityScore += serpFeatures.totalFeatures * 8;
  
  // Related searches indicate comprehensive data
  if ((data.related_searches?.length || 0) > 5) qualityScore += 20;
  
  // People also ask questions add value
  if ((data.people_also_ask?.length || 0) > 3) qualityScore += 15;
  
  let dataQuality: string;
  let confidence: string;
  
  if (qualityScore >= 80) {
    dataQuality = 'excellent';
    confidence = 'high';
  } else if (qualityScore >= 60) {
    dataQuality = 'good';
    confidence = 'medium-high';
  } else if (qualityScore >= 40) {
    dataQuality = 'fair';
    confidence = 'medium';
  } else {
    dataQuality = 'limited';
    confidence = 'low';
  }
  
  return { dataQuality, confidence };
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Check if domain is considered high authority
 */
function isHighAuthorityDomain(domain: string): boolean {
  const highAuthDomains = [
    'wikipedia.org', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
    'linkedin.com', 'reddit.com', 'quora.com', 'amazon.com', 'apple.com',
    'microsoft.com', 'google.com', 'github.com', 'stackoverflow.com',
    'medium.com', 'forbes.com', 'cnn.com', 'bbc.com', 'nytimes.com',
    'wsj.com', 'reuters.com', 'bloomberg.com', 'techcrunch.com',
    'wired.com', 'theverge.com', 'mashable.com', 'hubspot.com'
  ];
  
  return highAuthDomains.includes(domain.toLowerCase());
}

/**
 * Simple search volume estimation for related searches
 */
export function estimateSearchVolume(query: string, mainKeyword: string): number {
  const baseVolume = estimateVolumeFromKeyword(query);
  
  // If it's very similar to main keyword, give it higher volume
  const similarity = calculateStringSimilarity(query.toLowerCase(), mainKeyword.toLowerCase());
  
  return Math.round(baseVolume * (0.3 + similarity * 0.7));
}

/**
 * Calculate string similarity (simple Jaccard similarity)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}