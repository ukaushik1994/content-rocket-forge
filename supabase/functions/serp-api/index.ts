
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"
import { calculateRealMetrics, estimateSearchVolume } from "./metrics-calculator.ts"
import { 
  generateSmartHeadings, 
  generateAdvancedContentGaps, 
  extractComprehensiveEntities,
  extractFeaturedSnippets,
  extractKnowledgeGraph,
  extractTopStories,
  extractMultimedia,
  generateSerpInsights,
  generateRecommendations
} from "./serp-extractors.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Enhanced SERP API function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { endpoint, params, apiKey, analysisType = 'standard', userId } = await req.json();
    
    // Enhanced SERP analysis and caching
    const keyword = params.q || params.keyword;
    const location = params.location || 'us';

    // Check cache first (unless force refresh)
    if (!params.forceRefresh) {
      const { data: cachedData } = await supabase
        .from('raw_serp_data')
        .select('*')
        .eq('keyword', keyword)
        .eq('location', location)
        .gt('expires_at', new Date().toISOString())
        .order('cached_at', { ascending: false })
        .limit(1)
        .single();

      if (cachedData) {
        console.log(`Returning cached SERP data for keyword: ${keyword}`);
        
        // Update conversation context if userId provided
        if (userId) {
          await updateConversationContext(supabase, userId, keyword, cachedData.data);
        }
        
        return new Response(
          JSON.stringify({ 
            ...cachedData.data, 
            cached: true,
            analysisType 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Validate API key
    if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
      console.error('❌ Invalid API key provided');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid API key',
          details: 'API key must be a valid SerpAPI key'
        }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Build SerpAPI URL
    const baseUrl = 'https://serpapi.com/search';
    const searchParams = new URLSearchParams({
      ...params,
      api_key: apiKey,
      output: 'json'
    });

    const serpUrl = `${baseUrl}?${searchParams.toString()}`;
    console.log('🔍 Calling SerpAPI:', serpUrl.replace(apiKey, 'HIDDEN_KEY'));

    // Make the API call
    const response = await fetch(serpUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Lovable-Content-Builder/1.0'
      }
    });

    console.log('📊 SerpAPI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SerpAPI error response:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'SerpAPI request failed',
          status: response.status,
          details: errorText
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Enhanced SERP data received and processing...');

    // Enhanced SERP analysis based on type
    const enhancedData = await enhanceSerpData(data, keyword, analysisType);

    // Cache the enhanced results
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

    await supabase.from('raw_serp_data').insert({
      keyword,
      location,
      data: enhancedData,
      expires_at: expiresAt.toISOString(),
      user_id: userId
    });

    // Update conversation context if userId provided
    if (userId) {
      await updateConversationContext(supabase, userId, keyword, enhancedData);
    }

    console.log(`Fresh enhanced SERP data cached for keyword: ${keyword}`);

    return new Response(
      JSON.stringify({ 
        ...enhancedData, 
        cached: false,
        analysisType 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('💥 SERP API function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enhanced SERP data processing with predictive intelligence
async function enhanceSerpData(serpData: any, keyword: string, analysisType: string) {
  const enhanced = transformSerpApiData(serpData, keyword);
  
  try {
    // Add predictive intelligence
    enhanced.predictive_analysis = {
      trend_forecast: analyzeTrendForecast(serpData, keyword),
      content_performance_prediction: predictContentPerformance(serpData, keyword),
      competitive_movement: detectCompetitiveMovements(serpData),
      opportunity_scoring: calculateOpportunityScores(serpData, keyword)
    };

    // Add workflow recommendations
    enhanced.workflow_recommendations = generateWorkflowRecommendations(serpData, keyword, analysisType);

    // Add advanced metrics
    enhanced.advanced_metrics = calculateAdvancedMetrics(serpData, keyword);

  } catch (error) {
    console.error('Error enhancing SERP data:', error);
    enhanced.enhanced_analysis = { error: error instanceof Error ? error.message : 'Unknown error' };
  }

  return enhanced;
}

// Update conversation context for persistent intelligence
async function updateConversationContext(supabase: any, userId: string, keyword: string, serpData: any) {
  try {
    const contextData = {
      keywords: [keyword],
      last_serp_analysis: serpData,
      workflow_state: {
        current_analysis: keyword,
        suggested_next_steps: serpData.workflow_recommendations || []
      }
    };

    await supabase.from('serp_conversation_context').upsert({
      user_id: userId,
      context_type: 'serp_analysis',
      context_data: contextData,
      keywords: [keyword],
      last_serp_analysis: serpData
    }, {
      onConflict: 'user_id,context_type'
    });
  } catch (error) {
    console.error('Error updating conversation context:', error);
  }
}

// Predictive analysis functions
function analyzeTrendForecast(serpData: any, keyword: string) {
  const organicResults = serpData.organic_results || [];
  const recentContent = organicResults.filter((r: any) =>
    r.title?.toLowerCase().includes('2024') || 
    r.title?.toLowerCase().includes('2025') ||
    r.snippet?.toLowerCase().includes('recent') ||
    r.snippet?.toLowerCase().includes('latest')
  );

  return {
    trend_direction: recentContent.length > 3 ? 'increasing' : 'stable',
    seasonal_patterns: detectSeasonalPatterns(keyword),
    predicted_volume_change: estimateVolumeChange(serpData, keyword),
    confidence: Math.min(0.9, recentContent.length / 10 + 0.5)
  };
}

function predictContentPerformance(serpData: any, keyword: string) {
  const organicResults = serpData.organic_results || [];
  const avgTitleLength = organicResults.reduce((acc: number, r: any) => acc + (r.title?.length || 0), 0) / organicResults.length;
  const hasNumbers = organicResults.filter((r: any) => /\d/.test(r.title || '')).length;
  
  return {
    recommended_title_length: Math.round(avgTitleLength * 1.1),
    include_numbers: hasNumbers > 3,
    content_type_suggestions: [], // Removing undefined function call
    success_probability: calculateSuccessProbability(serpData, keyword)
  };
}

function detectCompetitiveMovements(serpData: any) {
  const organicResults = serpData.organic_results || [];
  const domains = organicResults.map((r: any) => {
    try {
      return new URL(r.link).hostname;
    } catch {
      return 'unknown';
    }
  });

  return {
    dominant_domains: [...new Set(domains)].slice(0, 5),
    market_concentration: calculateMarketConcentration(domains),
    new_entrants: [], // Would need historical data
    movement_patterns: 'stable' // Placeholder
  };
}

function calculateOpportunityScores(serpData: any, keyword: string) {
  const scores = [];
  
  if (!serpData.featured_snippet) {
    scores.push({
      type: 'featured_snippet',
      score: 85,
      description: 'High opportunity for featured snippet'
    });
  }
  
  if (serpData.people_also_ask && serpData.people_also_ask.length > 3) {
    scores.push({
      type: 'faq_content',
      score: 75,
      description: 'Strong FAQ content opportunity'
    });
  }

  return scores.sort((a, b) => b.score - a.score);
}

function generateWorkflowRecommendations(serpData: any, keyword: string, analysisType: string) {
  const recommendations = [];
  
  if (analysisType === 'content_planning') {
    recommendations.push({
      workflow: 'content_creation',
      priority: 'high',
      steps: ['analyze_top_content', 'identify_gaps', 'create_outline', 'write_content'],
      estimated_time: '2-4 hours'
    });
  }
  
  if (analysisType === 'competitive') {
    recommendations.push({
      workflow: 'competitive_analysis',
      priority: 'medium', 
      steps: ['map_competitors', 'analyze_strategies', 'identify_weaknesses', 'plan_counter_strategy'],
      estimated_time: '1-2 hours'
    });
  }

  return recommendations;
}

function calculateAdvancedMetrics(serpData: any, keyword: string) {
  const organicResults = serpData.organic_results || [];
  
  return {
    content_freshness_score: calculateContentFreshness(organicResults),
    authority_distribution: calculateAuthorityDistribution(organicResults),
    user_intent_alignment: calculateIntentAlignment(serpData, keyword),
    content_depth_analysis: analyzeContentDepth(organicResults)
  };
}

// Helper functions for advanced metrics
function detectSeasonalPatterns(keyword: string) {
  const seasonalKeywords = ['christmas', 'summer', 'winter', 'holiday', 'back to school'];
  return seasonalKeywords.some(sk => keyword.toLowerCase().includes(sk)) ? 'seasonal' : 'evergreen';
}

function estimateVolumeChange(serpData: any, keyword: string) {
  // Placeholder - would need historical data
  return Math.random() > 0.5 ? 'increasing' : 'stable';
}

function calculateSuccessProbability(serpData: any, keyword: string) {
  const factors = {
    competition: serpData.organic_results?.length || 10,
    brandDomination: 0, // Would calculate based on top results
    contentGapsAvailable: serpData.people_also_ask?.length || 0
  };
  
  return Math.min(0.95, 0.3 + (factors.contentGapsAvailable / 20) + (1 / (factors.competition / 10)));
}

function calculateMarketConcentration(domains: string[]) {
  const domainCounts = domains.reduce((acc, domain) => {
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxCount = Math.max(...Object.values(domainCounts));
  return maxCount / domains.length; // Higher = more concentrated
}

function calculateContentFreshness(organicResults: any[]) {
  const currentYear = new Date().getFullYear();
  const recentContent = organicResults.filter(r => 
    r.title?.includes(currentYear.toString()) || 
    r.title?.includes((currentYear - 1).toString())
  );
  
  return recentContent.length / organicResults.length;
}

function calculateAuthorityDistribution(organicResults: any[]) {
  // Simplified authority scoring based on domain patterns
  const authorityIndicators = ['wikipedia', 'gov', 'edu', 'forbes', 'harvard'];
  const highAuthority = organicResults.filter(r => 
    authorityIndicators.some(indicator => r.link?.includes(indicator))
  );
  
  return {
    high_authority_ratio: highAuthority.length / organicResults.length,
    opportunity_exists: highAuthority.length < 5
  };
}

function calculateIntentAlignment(serpData: any, keyword: string) {
  const intentSignals = {
    informational: 0,
    navigational: 0,
    transactional: 0,
    commercial: 0
  };

  if (serpData.people_also_ask) intentSignals.informational += 2;
  if (serpData.shopping_results) intentSignals.transactional += 3;
  if (serpData.local_results) intentSignals.commercial += 2;
  
  const primaryIntent = Object.entries(intentSignals)
    .sort(([,a], [,b]) => b - a)[0][0];

  return {
    primary_intent: primaryIntent,
    confidence: Math.max(...Object.values(intentSignals)) / 10,
    alignment_score: 0.8 // Placeholder
  };
}

function analyzeContentDepth(organicResults: any[]) {
  const avgSnippetLength = organicResults.reduce((acc, r) => acc + (r.snippet?.length || 0), 0) / organicResults.length;
  const longFormContent = organicResults.filter(r => (r.snippet?.length || 0) > 150);
  
  return {
    average_content_length: avgSnippetLength,
    long_form_ratio: longFormContent.length / organicResults.length,
    depth_recommendation: avgSnippetLength > 120 ? 'comprehensive' : 'concise'
  };
}

/**
 * Transform SerpAPI data to our clean format without provider contamination
 */
function transformSerpApiData(data: any, keyword: string): any {
  console.log('🔄 Enhanced SERP data transformation for keyword:', keyword);
  
  // Extract comprehensive organic results
  const organicResults = (data.organic_results || []).slice(0, 10).map((result: any, index: number) => ({
    position: index + 1,
    title: cleanText(result.title),
    link: result.link,
    snippet: cleanText(result.snippet || result.description || ''),
    displayed_link: result.displayed_link,
    rich_snippet: result.rich_snippet || null,
    sitelinks: result.sitelinks || []
  }));

  // Extract People Also Ask questions with enhanced data
  const peopleAlsoAsk = extractPeopleAlsoAsk(data);
  console.log('📋 Extracted PAA questions:', {
    paaCount: peopleAlsoAsk.length,
    questions: peopleAlsoAsk.map(q => q.question).slice(0, 3)
  });

  // Extract related searches with enhanced context
  const relatedSearches = (data.related_searches || []).map((item: any) => ({
    query: cleanText(item.query),
    volume: estimateSearchVolume(item.query, keyword), // Heuristic estimation
    link: item.link || null
  }));

  // Extract comprehensive keywords
  const keywords = extractEnhancedKeywords(data, keyword);

  // Generate smart headings from multiple sources
  const headings = generateSmartHeadings(organicResults, peopleAlsoAsk, data);

  // Generate advanced content gaps
  const contentGaps = generateAdvancedContentGaps(organicResults, peopleAlsoAsk, data, keyword);

  // Extract comprehensive entities
  const entities = extractComprehensiveEntities(data, keyword);

  // Extract featured snippets
  const featuredSnippets = extractFeaturedSnippets(data);

  // Extract knowledge graph data
  const knowledgeGraph = extractKnowledgeGraph(data);

  // Extract top stories if available
  const topStories = extractTopStories(data);

  // Extract images and videos
  const multimedia = extractMultimedia(data);

  // Calculate real metrics based on SERP analysis
  const metrics = calculateRealMetrics(data, keyword, organicResults);

  // Generate comprehensive insights
  const insights = generateSerpInsights(data, organicResults, peopleAlsoAsk, keyword);

  return {
    keyword: cleanText(keyword),
    searchVolume: metrics.searchVolume,
    keywordDifficulty: metrics.keywordDifficulty,
    competitionScore: metrics.competitionScore,
    
    // Enhanced SERP sections
    topResults: organicResults,
    peopleAlsoAsk: peopleAlsoAsk,
    relatedSearches: relatedSearches,
    keywords: keywords,
    headings: headings,
    contentGaps: contentGaps,
    entities: entities,
    featuredSnippets: featuredSnippets,
    knowledgeGraph: knowledgeGraph,
    topStories: topStories,
    multimedia: multimedia,

    // Enhanced metrics section
    metrics: {
      search_volume: metrics.searchVolume,
      seo_difficulty: metrics.keywordDifficulty,
      opportunity_score: metrics.opportunityScore,
      competition_pct: metrics.competitionScore * 100,
      result_count: data.search_metadata?.total_results || 0
    },

    // SERP blocks for compatibility
    serp_blocks: {
      organic: organicResults,
      ads: (data.ads || []).map((ad: any) => ({
        title: cleanText(ad.title),
        link: ad.link,
        description: cleanText(ad.description || ad.snippet || '')
      })),
      people_also_ask: peopleAlsoAsk,
      images: multimedia.images,
      videos: multimedia.videos,
      knowledge_graph: knowledgeGraph.title ? knowledgeGraph : undefined
    },

    // Enhanced insights and recommendations
    insights: insights,
    recommendations: generateRecommendations(data, organicResults, contentGaps),

    // Data source tracking
    data_sources: {
      is_cached: false,
      volume_api: false, // We're using heuristics
      serp_api: true
    },

    related_keywords: relatedSearches.map((rs: any) => ({
      title: rs.query,
      volume: rs.volume
    })),
    
    // Metadata
    isGoogleData: true,
    isMockData: false,
    dataQuality: metrics.dataQuality,
    volumeMetadata: {
      source: 'serp_heuristic_calculation',
      confidence: metrics.confidence,
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString(),
      calculation_method: 'serp_feature_analysis'
    }
  };
}

/**
 * Clean text by removing provider contamination and normalizing
 */
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/\b(serp\s*api|serpapi|serpstack)\b/gi, '') // Remove provider names
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Extract enhanced keywords from comprehensive SERP analysis
 */
function extractEnhancedKeywords(data: any, mainKeyword: string): string[] {
  const keywords = new Set<string>();
  
  // Add main keyword variations
  keywords.add(cleanText(mainKeyword));
  keywords.add(cleanText(mainKeyword).toLowerCase());
  
  // Extract from related searches
  (data.related_searches || []).forEach((item: any) => {
    if (item.query) {
      keywords.add(cleanText(item.query));
    }
  });
  
  // Extract from People Also Ask with semantic analysis
  (data.people_also_ask || []).forEach((item: any) => {
    if (item.question) {
      const questionKeywords = extractKeywordsFromText(item.question, mainKeyword);
      questionKeywords.forEach(kw => keywords.add(kw));
    }
  });

  // Extract from organic result titles and snippets
  (data.organic_results || []).slice(0, 5).forEach((result: any) => {
    if (result.title) {
      const titleKeywords = extractKeywordsFromText(result.title, mainKeyword);
      titleKeywords.forEach(kw => keywords.add(kw));
    }
  });

  // Extract from featured snippets
  if (data.featured_snippet?.snippet) {
    const snippetKeywords = extractKeywordsFromText(data.featured_snippet.snippet, mainKeyword);
    snippetKeywords.forEach(kw => keywords.add(kw));
  }

  // Generate intent-based keywords
  const intentKeywords = generateIntentKeywords(mainKeyword);
  intentKeywords.forEach(kw => keywords.add(kw));
  
  return Array.from(keywords).slice(0, 25);
}

/**
 * Extract keywords from text using semantic analysis
 */
function extractKeywordsFromText(text: string, mainKeyword: string): string[] {
  if (!text) return [];
  
  const cleanedText = cleanText(text).toLowerCase();
  const words = cleanedText.split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !['what', 'how', 'why', 'when', 'where', 'which', 'who', 'the', 'and', 'but', 'for', 'are', 'this', 'that', 'with', 'from', 'have', 'been', 'will', 'they', 'them', 'their', 'there', 'would', 'could', 'should'].includes(word));

  const mainKeywordLower = mainKeyword.toLowerCase();
  const relevantWords = words.filter(word => 
    word.includes(mainKeywordLower) || 
    mainKeywordLower.includes(word) ||
    word.length > 6 // Longer words are often more relevant
  );

  return relevantWords.slice(0, 8);
}

/**
 * Generate intent-based keywords
 */
function generateIntentKeywords(mainKeyword: string): string[] {
  return [
    // Informational intent
    `what is ${mainKeyword}`,
    `${mainKeyword} definition`,
    `${mainKeyword} explained`,
    `${mainKeyword} guide`,
    `${mainKeyword} tutorial`,
    `learn ${mainKeyword}`,
    
    // Navigational intent
    `${mainKeyword} website`,
    `${mainKeyword} official`,
    
    // Transactional intent
    `buy ${mainKeyword}`,
    `${mainKeyword} price`,
    `${mainKeyword} cost`,
    `${mainKeyword} free`,
    
    // Commercial intent
    `${mainKeyword} reviews`,
    `${mainKeyword} comparison`,
    `best ${mainKeyword}`,
    `${mainKeyword} vs`,
    
    // Local intent
    `${mainKeyword} near me`,
    `${mainKeyword} location`,
    
    // How-to intent
    `how to ${mainKeyword}`,
    `${mainKeyword} tips`,
    `${mainKeyword} best practices`,
    `${mainKeyword} strategies`
  ];
}

/**
 * Generate content gaps from SERP analysis
 */
function generateContentGaps(organicResults: any[], peopleAlsoAsk: any[], keyword: string): any[] {
  const gaps = [];
  
  // Analyze what's missing in top results
  const topTitles = organicResults.map(r => r.title.toLowerCase());
  const hasBeginnerGuide = topTitles.some(title => title.includes('beginner') || title.includes('start'));
  const hasAdvancedGuide = topTitles.some(title => title.includes('advanced') || title.includes('expert'));
  const hasCaseStudies = topTitles.some(title => title.includes('case study') || title.includes('example'));
  const hasComparison = topTitles.some(title => title.includes('vs') || title.includes('comparison'));
  
  if (!hasBeginnerGuide) {
    gaps.push({
      topic: `${keyword} for beginners`,
      description: `Limited beginner-friendly content found in top results`,
      recommendation: `Create a comprehensive beginner's guide to ${keyword}`,
      content: `Beginner's guide to ${keyword}`,
      source: 'serp_analysis'
    });
  }
  
  if (!hasAdvancedGuide) {
    gaps.push({
      topic: `Advanced ${keyword} techniques`,
      description: `Few advanced-level resources in top results`,
      recommendation: `Develop advanced strategies and techniques for ${keyword}`,
      content: `Advanced ${keyword} strategies`,
      source: 'serp_analysis'
    });
  }
  
  if (!hasCaseStudies) {
    gaps.push({
      topic: `${keyword} case studies`,
      description: `Lack of real-world examples and case studies`,
      recommendation: `Include detailed case studies and practical examples`,
      content: `${keyword} case studies and examples`,
      source: 'serp_analysis'
    });
  }
  
  if (!hasComparison) {
    gaps.push({
      topic: `${keyword} comparison guide`,
      description: `Missing comparative analysis content`,
      recommendation: `Create comparison guides for different ${keyword} approaches`,
      content: `${keyword} comparison and alternatives`,
      source: 'serp_analysis'
    });
  }
  
  return gaps.slice(0, 4);
}

/**
 * Enhanced People Also Ask extraction with multiple fallbacks
 */
function extractPeopleAlsoAsk(data: any): any[] {
  const questions: Array<{question: string; priority: number; source: string; answer?: string; link?: string | null; displayed_link?: string | null}> = [];
  
  // Primary source: people_also_ask
  if (data.people_also_ask && Array.isArray(data.people_also_ask)) {
    data.people_also_ask.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question),
        answer: cleanText(item.snippet || item.answer || item.text || ''),
        source: 'people_also_ask',
        priority: 1,
        link: item.link || null,
        displayed_link: item.displayed_link || null
      });
    });
  }
  
  // Fallback 1: related_questions
  if (data.related_questions && Array.isArray(data.related_questions)) {
    data.related_questions.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question || item.query),
        answer: cleanText(item.answer || item.snippet || ''),
        source: 'related_questions',
        priority: 2,
        link: item.link || null,
        displayed_link: item.displayed_link || null
      });
    });
  }
  
  // Fallback 2: answer_box (sometimes contains Q&A)
  if (data.answer_box && data.answer_box.questions) {
    data.answer_box.questions.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question),
        answer: cleanText(item.answer || ''),
        source: 'answer_box',
        priority: 3,
        link: null,
        displayed_link: null
      });
    });
  }
  
  // Fallback 3: faq section
  if (data.faq && Array.isArray(data.faq)) {
    data.faq.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question),
        answer: cleanText(item.answer || ''),
        source: 'faq_section',
        priority: 4,
        link: item.link || null,
        displayed_link: null
      });
    });
  }
  
  // Remove duplicates and return
  const uniqueQuestions: Array<{question: string; priority: number; source: string; answer?: string; link?: string | null; displayed_link?: string | null}> = [];
  const seenQuestions = new Set();
  
  questions.forEach(q => {
    const questionKey = q.question.toLowerCase().trim();
    if (!seenQuestions.has(questionKey) && q.question.length > 10) {
      seenQuestions.add(questionKey);
      uniqueQuestions.push(q);
    }
  });
  
  console.log(`📝 PAA Extraction Summary: Found ${uniqueQuestions.length} unique questions from ${questions.length} total`);
  return uniqueQuestions.slice(0, 15);
}

/**
 * Extract entities from SERP data
 */
function extractEntities(data: any, keyword: string): any[] {
  const entities = [];
  
  // Add main keyword as primary entity
  entities.push({
    name: cleanText(keyword),
    type: 'main_topic',
    importance: 10,
    description: `Primary topic: ${keyword}`,
    source: 'main_keyword'
  });
  
  // Extract from knowledge graph if available
  if (data.knowledge_graph) {
    entities.push({
      name: cleanText(data.knowledge_graph.title || ''),
      type: 'knowledge_entity',
      importance: 9,
      description: cleanText(data.knowledge_graph.description || ''),
      source: 'knowledge_graph'
    });
  }
  
  // Extract entities from organic results
  (data.organic_results || []).slice(0, 3).forEach((result: any) => {
    if (result.title) {
      const titleWords = cleanText(result.title)
        .split(' ')
        .filter(word => word.length > 4 && word.toLowerCase() !== keyword.toLowerCase());
      
      titleWords.slice(0, 2).forEach(word => {
        entities.push({
          name: word,
          type: 'topic_entity',
          importance: 5,
          description: `Related to: ${result.title}`,
          source: 'organic_results'
        });
      });
    }
  });
  
  return entities.slice(0, 8);
}
