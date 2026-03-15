/**
 * SERP Intelligence Service for Enhanced AI Chat
 * Detects when queries need SERP data and integrates it into AI responses
 */

export interface SerpQueryPattern {
  pattern: RegExp;
  type: 'trend' | 'competitive' | 'content_gap' | 'seo' | 'market_research' | 'keyword_analysis' | 'web_search';
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
  data: any;
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
  },

  // =========================================================================
  // WEB SEARCH PATTERNS - General knowledge queries needing live web data
  // =========================================================================

  // Explicit search requests
  {
    pattern: /(?:search\s+(?:for|the\s+web\s+for)|look\s+up|google)\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 10
  },

  // "What's new/latest/happening" patterns
  {
    pattern: /(?:what'?s?\s+(?:new|latest|recent|happening|going\s+on)|latest\s+(?:news|updates?|developments?)|what\s+(?:is|are)\s+(?:happening|going\s+on))\s+(?:in|about|for|on|with|regarding)\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim().replace(/\s*(right now|today|currently|now|at the moment)\s*\??$/i, '').trim()],
    priority: 7
  },

  // "Current state / current trends" patterns
  {
    pattern: /(?:current\s+(?:state|trends?|status|landscape)|state\s+of)\s+(?:of\s+|in\s+)?(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },

  // "Best practices / how to" (external knowledge)
  {
    pattern: /(?:best\s+practices?|how\s+to|tips?\s+(?:for|on)|guide\s+(?:to|for|on))\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 6
  },

  // "Find articles/resources"
  {
    pattern: /(?:find|show|get)\s+(?:me\s+)?(?:articles?|resources?|information|info|examples?)\s+(?:about|on|for|regarding)\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },

  // "What is" / "Explain" factual queries
  {
    pattern: /(?:what\s+(?:is|are)|explain|define)\s+(.{4,})/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 5
  },

  // "News about"
  {
    pattern: /(?:news|updates?|announcements?)\s+(?:about|on|for|from|regarding)\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },

  // Compare external products/services
  {
    pattern: /(?:compare|difference\s+between|which\s+is\s+better)\s+(.+?)\s+(?:and|vs\.?|or|versus)\s+(.+)/i,
    type: 'web_search',
    extractKeywords: (match) => [`${match[1].trim()} vs ${match[2].trim()}`],
    priority: 7
  }
];

// =============================================================================
// INTERNAL DATA EXCLUSION PATTERNS (Fix: Campaign/Proposal hijacking)
// =============================================================================
// These patterns identify when users are asking about THEIR OWN data
// rather than external market research. When detected, skip SERP routing.
const INTERNAL_DATA_PATTERNS = [
  // Possessive indicators - user asking about their own data
  /\b(my|our)\s+(campaign|proposal|content|strategy|strategies|article|post)/i,
  
  // Direct internal entity references
  /\b(campaign|proposal|strategy)\s+(trend|trends|performance|status|progress|health|overview)/i,
  
  // Performance of internal items
  /\bhow\s+(is|are|did|does)\s+(my|our|the)\s+(campaign|proposal|content|strategy)/i,
  
  // Internal status queries
  /\b(campaign|proposal|content)\s+(performance|analytics|metrics|stats|statistics)/i,
  
  // AI proposals specific patterns
  /\bai\s+proposal/i,
  /\bstrategy\s+(session|proposal)/i,
  
  // Internal trend analysis (not market trends)
  /\b(trend|trending)\s+(in|of|for)\s+(my|our)\s/i,
  /\b(my|our)\s+.{0,20}\s+trend/i,
  
  // Queue and generation queries
  /\b(queue|generation|generating)\s+(status|progress)/i,
  
  // Explicit internal data requests
  /\bshow\s+(me\s+)?(my|our)\s+(campaign|proposal|content|strategy)/i,
  /\bwhat\s+(campaign|proposal|content|strategy)\s+do\s+I\s+have/i,
];

/**
 * Check if query is asking about internal/user data rather than external SERP data
 */
function isInternalDataQuery(query: string): boolean {
  const isInternal = INTERNAL_DATA_PATTERNS.some(pattern => pattern.test(query));
  if (isInternal) {
    console.log('📊 Internal data query detected - skipping SERP routing');
  }
  return isInternal;
}

/**
 * Analyze query to determine if SERP data is needed
 */
export function analyzeSerpIntent(query: string): SerpIntelligence {
  console.log('🧠 Analyzing query for SERP intent:', query);
  
  // FIX: Check for internal data queries FIRST - skip SERP for these
  if (isInternalDataQuery(query)) {
    console.log('✅ Routing to internal data tools instead of SERP');
    return {
      shouldTriggerSerp: false,
      queryType: 'internal_data',
      keywords: [],
      priority: 0,
      suggestedAnalysis: []
    };
  }
  
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

  // Check for implicit keyword mentions (SEO-specific)
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

  // TEMPORAL MARKER HEURISTIC: Queries with "right now", "today", "2025/2026",
  // "currently", "this week/month/year" likely need fresh external data
  const temporalMarkers = /\b(right now|today|currently|this (?:week|month|year)|202[4-9]|latest|recent(?:ly)?|at the moment)\b/i;
  const isQuestion = /\?/.test(query) || /^(what|how|who|where|when|why|which|is|are|do|does|can|will|should)\b/i.test(query.trim());
  
  if (temporalMarkers.test(query) && isQuestion && query.trim().split(/\s+/).length >= 4) {
    // Extract the main topic by removing temporal markers, question words, and filler
    const topic = query
      .replace(temporalMarkers, '')
      .replace(/^(what|how|who|where|when|why|which|is|are|do|does|can|will|should)\s+/i, '')
      .replace(/\b(the|a|an|in|on|of|for|with|about|right|is|are|happening|going)\b/gi, '')
      .replace(/[?\s]+/g, ' ')
      .trim();
    
    if (topic.length > 2) {
      console.log('🕐 Temporal web search detected via heuristic:', topic);
      return {
        shouldTriggerSerp: true,
        queryType: 'web_search',
        keywords: [topic],
        priority: 4,
        suggestedAnalysis: ['organic_results', 'answer_box', 'related_topics']
      };
    }
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
    'keyword_analysis': ['keyword_metrics', 'serp_features', 'competition_analysis'],
    'web_search': ['organic_results', 'answer_box', 'related_topics']
  };

  return analysisMap[queryType] || ['basic_analysis'];
}

/**
 * Execute SERP analysis for detected keywords using api-proxy with smart fallback
 */
export async function executeSerpAnalysis(
  keywords: string[],
  analysisType: string,
  location: string = 'us'
): Promise<SerpQueryResult[]> {
  console.log('🚀 Executing SERP analysis for keywords:', keywords);
  
  const results: SerpQueryResult[] = [];
  
  // Limit concurrent requests to avoid rate limiting
  const maxConcurrent = 2;
  for (let i = 0; i < keywords.length; i += maxConcurrent) {
    const batch = keywords.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (keyword) => {
      try {
        // Call api-proxy with SerpAPI (it will auto-fallback to Serpstack if needed)
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/api-proxy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            service: 'serpapi', // Primary: SerpAPI, will fallback to Serpstack
            endpoint: 'analyze',
            params: { keyword, location }
          })
        });

        const data = await response.json();
        
        // Gracefully handle rate limits
        if (response.status === 429 || data.isRateLimited) {
          console.warn(`⚠️ SERP API rate limit hit for "${keyword}" - skipping gracefully`);
          return null; // Skip this keyword without breaking the flow
        }

        if (!response.ok) {
          console.error(`❌ SERP API error for "${keyword}":`, data.error);
          return null; // Skip on other errors
        }
        
        if (data.success === false) {
          console.error(`❌ SERP API returned error for "${keyword}":`, data.error);
          return null; // Skip on API-level errors
        }

        return {
          keyword,
          data,
          analysisType
        };
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
      context += `- Top Content Gaps: ${result.data.contentGaps.slice(0, 3).map((gap: any) => gap.topic).join(', ')}\n`;
    }
    
    if (result.data.questions && result.data.questions.length > 0) {
      context += `- Popular Questions: ${result.data.questions.slice(0, 2).map((q: any) => q.question).join('; ')}\n`;
    }
    
    if (result.data.entities && result.data.entities.length > 0) {
      context += `- Key Entities: ${result.data.entities.slice(0, 3).map((e: any) => e.name).join(', ')}\n`;
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
 * Generate structured SERP data for AI chart generation
 */
export function generateStructuredSerpData(results: SerpQueryResult[]): any {
  if (results.length === 0) return null;

  const structuredData: any = {
    keywords: [],
    aggregateMetrics: {
      avgSearchVolume: 0,
      avgKeywordDifficulty: 0,
      avgCompetitionScore: 0,
      totalContentGaps: 0,
      totalQuestions: 0
    },
    chartData: {
      keywordMetrics: [],
      peopleAlsoAsk: [],
      contentGaps: [],
      topResults: [],
      entities: []
    }
  };

  let totalVolume = 0;
  let totalDifficulty = 0;
  let totalCompetition = 0;
  let volumeCount = 0;
  let difficultyCount = 0;
  let competitionCount = 0;

  results.forEach((result) => {
    const data = result.data;
    
    // Add keyword to list
    structuredData.keywords.push(result.keyword);
    
    // Aggregate metrics
    if (data.searchVolume) {
      totalVolume += data.searchVolume;
      volumeCount++;
    }
    
    if (data.keywordDifficulty) {
      totalDifficulty += data.keywordDifficulty;
      difficultyCount++;
    }
    
    if (data.competitionScore) {
      totalCompetition += data.competitionScore;
      competitionCount++;
    }
    
    // Build chart-ready data for keyword metrics
    structuredData.chartData.keywordMetrics.push({
      name: result.keyword,
      searchVolume: data.searchVolume || 0,
      keywordDifficulty: data.keywordDifficulty || 0,
      competitionScore: (data.competitionScore || 0) * 100,
      dataSource: `SERP API - ${result.keyword}`
    });
    
    // People Also Ask
    if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) {
      structuredData.aggregateMetrics.totalQuestions += data.peopleAlsoAsk.length;
      data.peopleAlsoAsk.forEach((q: any) => {
        structuredData.chartData.peopleAlsoAsk.push({
          question: q.question,
          answer: q.answer?.substring(0, 150) || '',
          source: q.source || 'Unknown'
        });
      });
    }
    
    // Content Gaps
    if (data.contentGaps && data.contentGaps.length > 0) {
      structuredData.aggregateMetrics.totalContentGaps += data.contentGaps.length;
      data.contentGaps.forEach((gap: any) => {
        structuredData.chartData.contentGaps.push({
          topic: gap.topic,
          description: gap.description,
          recommendation: gap.recommendation
        });
      });
    }
    
    // Top Results
    if (data.topResults && data.topResults.length > 0) {
      data.topResults.slice(0, 10).forEach((result: any) => {
        structuredData.chartData.topResults.push({
          position: result.position,
          title: result.title,
          snippet: result.snippet?.substring(0, 120) || '',
          link: result.link
        });
      });
    }
    
    // Entities
    if (data.entities && data.entities.length > 0) {
      data.entities.slice(0, 5).forEach((entity: any) => {
        structuredData.chartData.entities.push({
          name: entity.name,
          type: entity.type,
          description: entity.description?.substring(0, 100) || ''
        });
      });
    }
  });

  // Calculate averages
  structuredData.aggregateMetrics.avgSearchVolume = volumeCount > 0 
    ? Math.round(totalVolume / volumeCount) 
    : 0;
  structuredData.aggregateMetrics.avgKeywordDifficulty = difficultyCount > 0 
    ? Math.round(totalDifficulty / difficultyCount) 
    : 0;
  structuredData.aggregateMetrics.avgCompetitionScore = competitionCount > 0 
    ? Math.round((totalCompetition / competitionCount) * 100) 
    : 0;

  return structuredData;
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

// =============================================================================
// WEB SEARCH EXECUTION - General web search via existing api-proxy
// =============================================================================

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  position: number;
}

export interface WebSearchResponse {
  query: string;
  results: WebSearchResult[];
  answerBox?: string;
  relatedSearches?: string[];
  timestamp: string;
}

/**
 * Execute a general web search using the existing api-proxy 'search' endpoint
 */
export async function executeWebSearch(
  query: string,
  location: string = 'us'
): Promise<WebSearchResponse> {
  console.log('🌐 Executing web search for:', query);
  
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/api-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        service: 'serpapi',
        endpoint: 'search',
        params: { keyword: query, location }
      })
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      console.error('❌ Web search failed:', data.error || response.statusText);
      return { query, results: [], timestamp: new Date().toISOString() };
    }

    // Normalize results from SerpAPI/Serpstack response formats
    const organicResults: WebSearchResult[] = [];
    const rawResults = data.organic_results || data.data?.organic_results || data.results || [];
    
    for (let i = 0; i < Math.min(rawResults.length, 8); i++) {
      const r = rawResults[i];
      organicResults.push({
        title: r.title || '',
        url: r.link || r.url || '',
        snippet: r.snippet || r.description || '',
        position: r.position || i + 1
      });
    }

    // Extract answer box if present
    const answerBox = data.answer_box?.snippet || data.answer_box?.answer || 
                      data.data?.answer_box?.snippet || undefined;

    // Extract related searches
    const relatedRaw = data.related_searches || data.data?.related_searches || [];
    const relatedSearches = relatedRaw.slice(0, 5).map((r: any) => r.query || r.title || r);

    console.log(`✅ Web search returned ${organicResults.length} results`);

    return {
      query,
      results: organicResults,
      answerBox,
      relatedSearches: relatedSearches.length > 0 ? relatedSearches : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Web search error:', error);
    return { query, results: [], timestamp: new Date().toISOString() };
  }
}

/**
 * Format web search results into a context block for the AI
 */
export function generateWebSearchContext(searchResponse: WebSearchResponse): string {
  if (searchResponse.results.length === 0) return '';

  let context = `\n\n🌐 WEB SEARCH RESULTS for "${searchResponse.query}":\n`;

  if (searchResponse.answerBox) {
    context += `\n📋 QUICK ANSWER:\n${searchResponse.answerBox}\n`;
  }

  context += '\n📄 TOP RESULTS:\n';
  searchResponse.results.forEach((r, i) => {
    context += `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}\n\n`;
  });

  if (searchResponse.relatedSearches && searchResponse.relatedSearches.length > 0) {
    context += `\n🔗 RELATED SEARCHES: ${searchResponse.relatedSearches.join(' | ')}\n`;
  }

  context += '\n✨ WEB SEARCH INSTRUCTIONS:';
  context += '\n- Synthesize and summarize findings in your own words';
  context += '\n- ALWAYS cite sources with their URLs when referencing specific information';
  context += '\n- Indicate this information comes from live web search';
  context += '\n- Highlight the most relevant and recent information first';
  context += '\n- If the answer box has a direct answer, lead with that';

  return context;
}