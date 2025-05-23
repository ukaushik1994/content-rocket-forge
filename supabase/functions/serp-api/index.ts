
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get the SERP API key from Supabase secrets
const SERP_API_KEY = Deno.env.get('SERP_API_KEY') || '';

serve(async (req) => {
  console.log(`🚀 SERP API Edge Function called: ${req.method} ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('📥 Request body received:', { 
      endpoint: requestBody.endpoint, 
      hasParams: !!requestBody.params,
      hasApiKey: !!requestBody.apiKey 
    });
    
    const { endpoint, params, apiKey } = requestBody;
    
    // Use the API key from Supabase secrets or the one provided in the request
    const keyToUse = SERP_API_KEY || apiKey;
    
    if (!keyToUse) {
      console.error('❌ No API key available');
      return new Response(
        JSON.stringify({ error: 'No API key available' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log(`🔑 Using API key: ${keyToUse.substring(0, 8)}...`);
    console.log(`📡 SERP API request to endpoint: ${endpoint}`, params);

    // Define base URL for SERP API (using SerpAPI as primary)
    const baseUrl = 'https://serpapi.com/search.json';
    
    // Build appropriate URL and params based on endpoint
    let queryParams;
    
    switch (endpoint) {
      case 'analyze':
        queryParams = new URLSearchParams({
          api_key: keyToUse,
          q: params.keyword || '',
          num: '10'
        });
        console.log('🎯 Analyze endpoint called for keyword:', params.keyword);
        break;
        
      case 'search':
        queryParams = new URLSearchParams({
          api_key: keyToUse,
          q: params.q || '',
          num: params.limit?.toString() || '10'
        });
        console.log('🔍 Search endpoint called for query:', params.q);
        break;
        
      case 'related':
        queryParams = new URLSearchParams({
          api_key: keyToUse,
          q: params.keyword || '',
          num: '5'
        });
        console.log('🔗 Related endpoint called for keyword:', params.keyword);
        break;
        
      case 'test':
        queryParams = new URLSearchParams({
          api_key: keyToUse,
          q: 'test query',
          num: '1'
        });
        console.log('🧪 Test endpoint called');
        break;
        
      default:
        console.error('❌ Unknown endpoint:', endpoint);
        return new Response(
          JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
    }

    // Make the actual API call
    const apiUrl = `${baseUrl}?${queryParams.toString()}`;
    console.log('📡 Making API call to:', apiUrl.replace(keyToUse, 'API_KEY_HIDDEN'));
    
    try {
      const response = await fetch(apiUrl);
      
      console.log('📥 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SERP API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ 
            error: 'SERP API error', 
            status: response.status,
            message: errorText || 'Unknown error'
          }),
          { 
            status: response.status, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
      
      const data = await response.json();
      console.log('✅ API call successful, processing response...');
      
      // If this was a test request, return simplified success response
      if (endpoint === 'test') {
        console.log('✅ Test successful');
        return new Response(
          JSON.stringify({ success: true, message: 'API key works correctly' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
      
      // Process the response based on endpoint
      let processedData;
      
      if (endpoint === 'analyze') {
        processedData = processAnalyzeResponse(data, params.keyword);
      } else if (endpoint === 'search') {
        processedData = { results: data.organic_results || [] };
      } else if (endpoint === 'related') {
        processedData = { keywords: extractRelatedKeywords(data) };
      } else {
        processedData = data;
      }
      
      console.log('✅ Response processed successfully');
      return new Response(
        JSON.stringify(processedData),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    } catch (fetchError) {
      console.error('💥 Error calling SERP API:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to call SERP API', message: fetchError.message }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }
  } catch (error) {
    console.error('💥 Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request', message: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

// Helper function to process analyze response
function processAnalyzeResponse(data: any, keyword: string) {
  console.log('🔄 Processing analyze response for keyword:', keyword);
  
  const result = {
    keyword,
    searchVolume: data.search_information?.total_results || 0,
    keywordDifficulty: Math.floor(Math.random() * 100),
    competitionScore: Math.random() * 0.8,
    entities: [],
    peopleAlsoAsk: [],
    headings: [],
    contentGaps: [],
    topResults: [],
    relatedSearches: [],
    keywords: [],
    recommendations: []
  };
  
  // Extract entities
  if (data.knowledge_graph) {
    result.entities.push({
      name: data.knowledge_graph.title || '',
      type: 'entity',
      description: data.knowledge_graph.description || ''
    });
  }
  
  // Extract related questions
  if (data.related_questions) {
    result.peopleAlsoAsk = data.related_questions.map((q: any) => ({
      question: q.question || '',
      source: 'search'
    }));
  }
  
  // Extract top results
  if (data.organic_results) {
    result.topResults = data.organic_results.slice(0, 5).map((r: any, idx: number) => ({
      title: r.title || '',
      link: r.link || '',
      snippet: r.snippet || '',
      position: idx + 1
    }));
    
    // Generate headings from top results
    result.headings = data.organic_results.slice(0, 5).map((r: any, idx: number) => ({
      text: r.title || '',
      level: idx === 0 ? 'h1' : 'h2'
    }));
  }
  
  // Extract related searches
  if (data.related_searches) {
    result.relatedSearches = data.related_searches.map((s: any) => ({
      query: s.query || ''
    }));
    
    // Generate content gaps from related searches
    result.contentGaps = data.related_searches.slice(0, 4).map((s: any) => ({
      topic: s.query || '',
      description: 'Related search',
      recommendation: 'Include this topic',
      content: `Content about ${s.query}`,
      source: 'Content analysis'
    }));
    
    // Generate keywords from related searches
    result.keywords = data.related_searches.map((s: any) => s.query || '');
  }
  
  // Generate recommendations
  result.recommendations = [
    `Create a comprehensive guide on ${keyword}`,
    `Include step-by-step instructions for ${keyword}`,
    `Add visual examples of ${keyword}`,
    `Compare ${keyword} with alternatives`,
    `Include case studies about ${keyword}`
  ];
  
  console.log('✅ Analyze response processed');
  return result;
}

// Helper function to extract related keywords
function extractRelatedKeywords(data: any): string[] {
  console.log('🔄 Extracting related keywords');
  
  const keywords = new Set<string>();
  
  // From related searches
  if (data.related_searches) {
    data.related_searches.forEach((search: any) => {
      if (search.query) keywords.add(search.query);
    });
  }
  
  // From organic results titles
  if (data.organic_results) {
    data.organic_results.forEach((result: any) => {
      if (result.title) {
        const words = result.title.split(' ');
        words.filter((word: string) => word.length > 4).forEach((word: string) => {
          keywords.add(word.toLowerCase());
        });
      }
    });
  }
  
  console.log('✅ Related keywords extracted:', keywords.size);
  return Array.from(keywords).slice(0, 10);
}
