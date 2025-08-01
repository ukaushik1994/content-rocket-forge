
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    console.log('🚀 SERP API function called');
    
    const { endpoint, params, apiKey } = await req.json();
    
    console.log('📝 Request details:', {
      endpoint,
      paramKeys: Object.keys(params || {}),
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0
    });

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
    console.log('✅ SerpAPI data received:', {
      hasOrganicResults: !!data.organic_results,
      organicCount: data.organic_results?.length || 0,
      hasPeopleAlsoAsk: !!data.people_also_ask,
      peopleAlsoAskCount: data.people_also_ask?.length || 0,
      hasRelatedSearches: !!data.related_searches,
      relatedSearchesCount: data.related_searches?.length || 0
    });

    // Transform the data to our format (clean, no provider contamination)
    const transformedData = transformSerpApiData(data, params.q || params.keyword);
    
    console.log('🔄 Data transformed successfully');

    return new Response(
      JSON.stringify(transformedData), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('💥 SERP API function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

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
  const peopleAlsoAsk = (data.people_also_ask || []).map((item: any) => ({
    question: cleanText(item.question),
    answer: cleanText(item.snippet || item.answer || ''),
    source: 'google_search',
    link: item.link || null,
    displayed_link: item.displayed_link || null
  }));

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

    related_keywords: relatedSearches.map(rs => ({
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
