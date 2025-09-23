import { analyzeKeywordEnhanced, EnhancedSerpResult } from './enhancedSerpService';

export interface SerpQueryPattern {
  pattern: RegExp;
  type: 'trend' | 'competitive' | 'content_gap' | 'seo' | 'market_research' | 'keyword_analysis';
  extractKeywords: (match: RegExpMatchArray) => string[];
  priority: number;
}

export interface SerpIntelligence {
  shouldTriggerSerp: boolean;
  queryType: string;
  keywords: string[];
  priority: number;
  suggestedAnalysis: string[];
}

export interface SerpQueryResult {
  keyword: string;
  data: EnhancedSerpResult;
  analysisType: string;
}

/**
 * Intelligent SERP query patterns for auto-detection
 */
export const SERP_QUERY_PATTERNS: SerpQueryPattern[] = [
  // Trend Analysis Patterns
  {
    pattern: /(?:what'?s trending|trend\w*|popular|hot topics?)\s+(?:with|for|in)?\s*(.+)/i,
    type: 'trend',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /trending topics?\s+(?:for|in)\s+(.+)/i,
    type: 'trend', 
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },

  // Competitive Analysis Patterns
  {
    pattern: /(?:who'?s ranking|competitors?|competition)\s+(?:for|with)\s+(.+)/i,
    type: 'competitive',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /competitor analysis\s+(?:for|of)\s+(.+)/i,
    type: 'competitive',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },

  // Content Gap Analysis Patterns
  {
    pattern: /(?:content gap|content opportunities?|missing content)\s+(?:for|in|about)\s+(.+)/i,
    type: 'content_gap',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /what content (?:is missing|should I create)\s+(?:for|about)\s+(.+)/i,
    type: 'content_gap',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },

  // SEO Analysis Patterns
  {
    pattern: /(?:keyword difficulty|search volume|seo (?:difficulty|analysis))\s+(?:for|of)\s+(.+)/i,
    type: 'seo',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /how (?:hard|difficult|easy)\s+(?:is (?:it )?to rank|to rank)\s+(?:for|with)\s+(.+)/i,
    type: 'seo',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },

  // Market Research Patterns
  {
    pattern: /(?:market insights?|audience interests?|market research)\s+(?:for|in|about)\s+(.+)/i,
    type: 'market_research',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /what are people searching\s+(?:for|about)\s+(.+)/i,
    type: 'market_research',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },

  // General Keyword Analysis Patterns
  {
    pattern: /(?:analyze|analysis of|research)\s+(?:the )?keyword\s+["\']?(.+?)["\']?(?:\s|$)/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /serp (?:data|analysis|research)\s+(?:for|about)\s+(.+)/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },

  // Multi-keyword patterns
  {
    pattern: /(?:compare|analysis between)\s+(.+?)\s+(?:and|vs\.?)\s+(.+)/i,
    type: 'competitive',
    extractKeywords: (match) => [match[1].trim(), match[2].trim()],
    priority: 8
  }
];

/**
 * Analyze query to determine if SERP data is needed
 */
export function analyzeSerpIntent(query: string): SerpIntelligence {
  console.log('🧠 Analyzing query for SERP intent:', query);
  
  let bestMatch: { pattern: SerpQueryPattern; match: RegExpMatchArray } | null = null;
  let highestPriority = 0;

  // Check all patterns and find the best match
  for (const pattern of SERP_QUERY_PATTERNS) {
    const match = query.match(pattern.pattern);
    if (match && pattern.priority > highestPriority) {
      bestMatch = { pattern, match };
      highestPriority = pattern.priority;
    }
  }

  if (bestMatch) {
    const keywords = bestMatch.pattern.extractKeywords(bestMatch.match);
    const cleanKeywords = keywords
      .filter(k => k && k.trim().length > 0)
      .map(k => k.replace(/['"]/g, '').trim())
      .filter(k => k.length > 1);

    console.log('✅ SERP intent detected:', {
      type: bestMatch.pattern.type,
      keywords: cleanKeywords,
      priority: highestPriority
    });

    return {
      shouldTriggerSerp: true,
      queryType: bestMatch.pattern.type,
      keywords: cleanKeywords,
      priority: highestPriority,
      suggestedAnalysis: getSuggestedAnalysis(bestMatch.pattern.type)
    };
  }

  // Check for implicit keyword mentions
  const implicitKeywords = extractImplicitKeywords(query);
  if (implicitKeywords.length > 0) {
    console.log('🔍 Implicit keywords detected:', implicitKeywords);
    return {
      shouldTriggerSerp: true,
      queryType: 'keyword_analysis',
      keywords: implicitKeywords,
      priority: 5,
      suggestedAnalysis: ['keyword_metrics', 'competition_analysis']
    };
  }

  console.log('❌ No SERP intent detected');
  return {
    shouldTriggerSerp: false,
    queryType: 'general',
    keywords: [],
    priority: 0,
    suggestedAnalysis: []
  };
}

/**
 * Extract implicit keywords from queries that might benefit from SERP data
 */
function extractImplicitKeywords(query: string): string[] {
  const keywordIndicators = [
    /(?:keyword|term|phrase)\s+["\']?(.+?)["\']?(?:\s|$)/gi,
    /rank(?:ing)?\s+(?:for|with)\s+["\']?(.+?)["\']?(?:\s|$)/gi,
    /optimize\s+(?:for|with)\s+["\']?(.+?)["\']?(?:\s|$)/gi,
    /target(?:ing)?\s+(?:keyword|term)?\s+["\']?(.+?)["\']?(?:\s|$)/gi
  ];

  const keywords: string[] = [];
  
  for (const pattern of keywordIndicators) {
    let match;
    while ((match = pattern.exec(query)) !== null) {
      const keyword = match[1]?.trim().replace(/['"]/g, '');
      if (keyword && keyword.length > 2) {
        keywords.push(keyword);
      }
    }
  }

  return [...new Set(keywords)];
}

/**
 * Get suggested analysis types for query type
 */
function getSuggestedAnalysis(queryType: string): string[] {
  const analysisMap: Record<string, string[]> = {
    'trend': ['search_volume', 'trending_topics', 'seasonal_patterns'],
    'competitive': ['competitor_analysis', 'ranking_positions', 'content_gaps'],
    'content_gap': ['missing_content', 'opportunity_analysis', 'topic_clusters'],
    'seo': ['keyword_difficulty', 'search_volume', 'ranking_factors'],
    'market_research': ['audience_insights', 'search_trends', 'related_topics'],
    'keyword_analysis': ['keyword_metrics', 'serp_features', 'competition_analysis']
  };

  return analysisMap[queryType] || ['basic_analysis'];
}

/**
 * Execute SERP analysis for detected keywords
 */
export async function executeSerpAnalysis(
  keywords: string[],
  analysisType: string,
  location: string = 'us'
): Promise<SerpQueryResult[]> {
  console.log('🚀 Executing SERP analysis for keywords:', keywords);
  
  const results: SerpQueryResult[] = [];
  
  // Limit concurrent requests to avoid rate limiting
  const maxConcurrent = 3;
  for (let i = 0; i < keywords.length; i += maxConcurrent) {
    const batch = keywords.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (keyword) => {
      try {
        const data = await analyzeKeywordEnhanced(keyword, location, false);
        if (data) {
          return {
            keyword,
            data,
            analysisType
          };
        }
        return null;
      } catch (error) {
        console.error(`Error analyzing keyword "${keyword}":`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r !== null) as SerpQueryResult[]);
  }

  console.log(`✅ SERP analysis complete. Retrieved data for ${results.length}/${keywords.length} keywords`);
  return results;
}

/**
 * Generate SERP-enhanced context for AI
 */
export function generateSerpContext(results: SerpQueryResult[]): string {
  if (results.length === 0) return '';

  let context = '\n\n🔍 REAL-TIME SERP DATA ANALYSIS:\n';
  
  results.forEach((result, index) => {
    context += `\n📊 KEYWORD: "${result.keyword}" (${result.analysisType})\n`;
    context += `- Search Volume: ${result.data.searchVolume?.toLocaleString() || 'N/A'}\n`;
    context += `- Keyword Difficulty: ${result.data.keywordDifficulty || 'N/A'}%\n`;
    context += `- Competition Score: ${result.data.competitionScore || 'N/A'}%\n`;
    
    if (result.data.contentGaps && result.data.contentGaps.length > 0) {
      context += `- Top Content Gaps: ${result.data.contentGaps.slice(0, 3).map(gap => gap.topic).join(', ')}\n`;
    }
    
    if (result.data.questions && result.data.questions.length > 0) {
      context += `- Popular Questions: ${result.data.questions.slice(0, 2).map(q => q.question).join('; ')}\n`;
    }
    
    if (result.data.entities && result.data.entities.length > 0) {
      context += `- Key Entities: ${result.data.entities.slice(0, 3).map(e => e.name).join(', ')}\n`;
    }
    
    if (index < results.length - 1) context += '\n';
  });

  context += '\n✨ INTEGRATION INSTRUCTIONS:';
  context += '\n- Use this REAL SERP data in your response';
  context += '\n- Generate relevant visual charts and metrics';
  context += '\n- Provide actionable insights based on this data';
  context += '\n- Create follow-up action buttons for deeper analysis';
  
  return context;
}

/**
 * Smart suggestions based on SERP analysis
 */
export function generateSmartSuggestions(results: SerpQueryResult[]): string[] {
  const suggestions: string[] = [];
  
  results.forEach(result => {
    const data = result.data;
    
    // High difficulty keywords
    if (data.keywordDifficulty && data.keywordDifficulty > 70) {
      suggestions.push(`Consider long-tail variations of "${result.keyword}" for easier ranking`);
    }
    
    // High volume opportunities
    if (data.searchVolume && data.searchVolume > 10000 && data.keywordDifficulty && data.keywordDifficulty < 50) {
      suggestions.push(`"${result.keyword}" shows high volume with moderate difficulty - great opportunity!`);
    }
    
    // Content gap opportunities
    if (data.contentGaps && data.contentGaps.length > 3) {
      suggestions.push(`Multiple content gaps found for "${result.keyword}" - create comprehensive content`);
    }
    
    // Question opportunities
    if (data.questions && data.questions.length > 5) {
      suggestions.push(`FAQ content opportunity: ${data.questions.length} popular questions about "${result.keyword}"`);
    }
  });
  
  return suggestions;
}

// Export the service
export const serpQueryIntelligence = {
  analyzeSerpIntent,
  executeSerpAnalysis,
  generateSerpContext,
  generateSmartSuggestions
};