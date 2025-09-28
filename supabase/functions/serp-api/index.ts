import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from '../shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../shared/errors.ts';

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, apiKey, params } = await req.json();
    
    if (!endpoint) {
      return createErrorResponse('Endpoint is required', 400, 'serp-api', 'missing-endpoint');
    }
    
    if (!apiKey) {
      return createErrorResponse('API key is required', 400, 'serp-api', 'missing-api-key');
    }
    
    if (!params?.q) {
      return createErrorResponse('Query parameter "q" is required', 400, 'serp-api', 'missing-query');
    }

    console.log(`🔍 SERP API request: ${endpoint} for query "${params.q}"`);

    // Handle different endpoints
    switch (endpoint) {
      case 'analyze':
        return await handleAnalyzeEndpoint(apiKey, params);
      case 'search':
        return await handleSearchEndpoint(apiKey, params);
      default:
        return createErrorResponse(`Unknown endpoint: ${endpoint}`, 400, 'serp-api', 'invalid-endpoint');
    }

  } catch (error) {
    console.error('SERP API error:', error);
    return createErrorResponse(
      `SERP API failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      'serp-api',
      'request-failed'
    );
  }
});

async function handleAnalyzeEndpoint(apiKey: string, params: any): Promise<Response> {
  const { q: keyword, location = 'United States', num = 10, device = 'desktop', engine = 'google' } = params;
  
  // Build SerpAPI request
  const serpApiUrl = new URL('https://serpapi.com/search');
  serpApiUrl.searchParams.set('engine', engine);
  serpApiUrl.searchParams.set('q', keyword);
  serpApiUrl.searchParams.set('location', location);
  serpApiUrl.searchParams.set('num', num.toString());
  serpApiUrl.searchParams.set('device', device);
  serpApiUrl.searchParams.set('api_key', apiKey);

  console.log(`🌐 Calling SerpAPI: ${serpApiUrl.toString()}`);

  const response = await fetch(serpApiUrl.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('SerpAPI HTTP Error:', response.status, errorText);
    
    // Throw specific errors based on status codes
    if (response.status === 401) {
      throw new Error('Invalid API key - please check your SerpAPI credentials');
    } else if (response.status === 429) {
      throw new Error('API rate limit exceeded - please try again later');
    } else if (response.status === 400) {
      throw new Error('Invalid request parameters - please check your query');
    } else {
      throw new Error(`SerpAPI error: ${response.status} - ${errorText}`);
    }
  }

  const serpData = await response.json();
  
  if (serpData.error) {
    console.error('SerpAPI returned error:', serpData.error);
    throw new Error(`SerpAPI error: ${serpData.error}`);
  }

  // Extract and structure the SERP data
  const structuredData = {
    keyword,
    searchVolume: null, // SerpAPI doesn't provide search volume in basic search
    keywordDifficulty: null,
    competitionScore: serpData.ads_results ? Math.min(serpData.ads_results.length / 10, 1) : 0,
    entities: extractEntities(serpData),
    peopleAlsoAsk: extractPeopleAlsoAsk(serpData),
    headings: extractHeadings(serpData),
    contentGaps: extractContentGaps(serpData),
    topResults: extractTopResults(serpData),
    relatedSearches: extractRelatedSearches(serpData),
    featuredSnippets: extractFeaturedSnippets(serpData),
    knowledgeGraph: serpData.knowledge_graph || null,
    multimediaOpportunities: extractMultimediaOpportunities(serpData),
    commercialSignals: {
      hasShoppingResults: !!(serpData.shopping_results && serpData.shopping_results.length > 0),
      hasAds: !!(serpData.ads && serpData.ads.length > 0),
      commercialIntent: serpData.ads && serpData.ads.length > 3 ? 'high' : serpData.ads && serpData.ads.length > 0 ? 'medium' : 'low'
    },
    rawSerpData: serpData,
    isGoogleData: true,
    dataQuality: 'high',
    timestamp: new Date().toISOString()
  };

  // Cache the result
  await cacheResult(keyword, location, structuredData);

  return createSuccessResponse(structuredData);
}

async function handleSearchEndpoint(apiKey: string, params: any): Promise<Response> {
  // For basic search functionality
  return await handleAnalyzeEndpoint(apiKey, params);
}

function extractEntities(serpData: any): any[] {
  const entities = [];
  
  // Extract from knowledge graph
  if (serpData.knowledge_graph) {
    entities.push({
      name: serpData.knowledge_graph.title || 'Unknown',
      type: serpData.knowledge_graph.type || 'entity',
      description: serpData.knowledge_graph.description,
      source: 'knowledge_graph'
    });
  }
  
  // Extract from organic results titles (basic entity extraction)
  if (serpData.organic_results) {
    serpData.organic_results.slice(0, 5).forEach((result: any, index: number) => {
      if (result.title) {
        entities.push({
          name: result.title.split(' ').slice(0, 3).join(' '), // First 3 words as entity
          type: 'topic',
          description: result.snippet,
          source: 'organic_results'
        });
      }
    });
  }
  
  return entities;
}

function extractPeopleAlsoAsk(serpData: any): any[] {
  if (!serpData.related_questions) return [];
  
  return serpData.related_questions.map((question: any) => ({
    question: question.question,
    answer: question.snippet,
    source: question.link,
    metadata: {
      source_link: question.link,
      snippet: question.snippet,
      position: question.position || 0
    }
  }));
}

function extractHeadings(serpData: any): any[] {
  const headings: any[] = [];
  
  // Extract from organic results
  if (serpData.organic_results) {
    serpData.organic_results.slice(0, 10).forEach((result: any) => {
      if (result.title) {
        headings.push({
          text: result.title,
          level: 'h1' as const,
          subtext: result.snippet
        });
      }
    });
  }
  
  return headings;
}

function extractContentGaps(serpData: any): any[] {
  const gaps: any[] = [];
  
  // Analyze missing content opportunities based on related searches and PAA
  if (serpData.related_searches) {
    serpData.related_searches.forEach((search: any) => {
      gaps.push({
        topic: search.query || search,
        description: `Missing content opportunity for "${search.query || search}"`,
        recommendation: `Create comprehensive content covering "${search.query || search}"`,
        source: 'related_searches'
      });
    });
  }
  
  return gaps.slice(0, 5); // Limit to top 5 gaps
}

function extractTopResults(serpData: any): any[] {
  if (!serpData.organic_results) return [];
  
  return serpData.organic_results.slice(0, 10).map((result: any, index: number) => ({
    title: result.title,
    link: result.link,
    snippet: result.snippet || '',
    position: index + 1,
    source: result.source
  }));
}

function extractRelatedSearches(serpData: any): any[] {
  if (!serpData.related_searches) return [];
  
  return serpData.related_searches.map((search: any) => ({
    query: search.query || search,
    source: 'serpapi'
  }));
}

function extractFeaturedSnippets(serpData: any): any[] {
  const snippets = [];
  
  if (serpData.answer_box) {
    snippets.push({
      title: serpData.answer_box.title || 'Featured Snippet',
      content: serpData.answer_box.answer || serpData.answer_box.snippet,
      source: serpData.answer_box.link,
      type: serpData.answer_box.type || 'paragraph'
    });
  }
  
  return snippets;
}

function extractMultimediaOpportunities(serpData: any): any[] {
  const opportunities = [];
  
  if (serpData.images_results && serpData.images_results.length > 0) {
    opportunities.push({
      type: 'images' as const,
      count: serpData.images_results.length,
      suggestions: serpData.images_results.slice(0, 3).map((img: any) => ({
        title: img.title || 'Image opportunity',
        source: img.source || 'unknown'
      }))
    });
  }
  
  if (serpData.videos_results && serpData.videos_results.length > 0) {
    opportunities.push({
      type: 'videos' as const,
      count: serpData.videos_results.length,
      suggestions: serpData.videos_results.slice(0, 3).map((video: any) => ({
        title: video.title || 'Video opportunity',
        source: video.source || 'unknown'
      }))
    });
  }
  
  return opportunities;
}

async function cacheResult(keyword: string, location: string, data: any): Promise<void> {
  try {
    await supabase
      .from('serp_cache')
      .upsert({
        keyword: keyword.toLowerCase(),
        geo: location,
        payload: data,
        updated_at: new Date().toISOString()
      });
    console.log(`✅ Cached SERP data for "${keyword}"`);
  } catch (error) {
    console.error('❌ Error caching SERP data:', error);
    // Don't throw - caching errors shouldn't fail the main request
  }
}