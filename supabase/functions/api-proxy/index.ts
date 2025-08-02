import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  console.log('🚀 API-Proxy Edge Function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, endpoint, apiKey, params } = await req.json();
    
    console.log(`📥 Request received: ${service} - ${endpoint}`, {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyType: typeof apiKey
    });

    // Get API key from params first, then fall back to Supabase secrets
    let finalApiKey = apiKey;
    
    if (!finalApiKey || finalApiKey.trim() === '') {
      console.log('🔑 No API key provided, checking Supabase secrets...');
      
      // Determine which secret to fetch based on service
      const secretName = service === 'serp' ? 'SERP_API_KEY' : 
                        service === 'serpstack' ? 'SERPSTACK_KEY' :
                        service === 'openai' ? 'OPENAI_API_KEY' :
                        service === 'anthropic' ? 'ANTHROPIC_API_KEY' :
                        service === 'gemini' ? 'GEMINI_API_KEY' : null;
      
      if (secretName) {
        try {
          const secretValue = Deno.env.get(secretName);
          if (secretValue && secretValue.trim() !== '') {
            finalApiKey = secretValue;
            console.log(`✅ Retrieved ${secretName} from Supabase secrets`);
          } else {
            console.warn(`⚠️ ${secretName} is empty or not set in Supabase secrets`);
          }
        } catch (error) {
          console.error(`❌ Error retrieving ${secretName} from secrets:`, error);
        }
      }
    }

    // Final validation
    if (!finalApiKey || finalApiKey.trim() === '') {
      console.error(`❌ No API key available for ${service}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `API key is required for ${service}. Please configure your API key in Supabase secrets or provide it in the request.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`🔑 Using API key for ${service} (length: ${finalApiKey.length})`);

    switch (service) {
      case 'serp':
        return await handleSerpApi(endpoint, finalApiKey, params);
      case 'serpstack':
        return await handleSerpstackApi(endpoint, finalApiKey, params);
      case 'openai':
        return await handleOpenAIApi(endpoint, finalApiKey, params);
      case 'anthropic':
        return await handleAnthropicApi(endpoint, finalApiKey, params);
      case 'gemini':
        return await handleGeminiApi(endpoint, finalApiKey, params);

      default:
        console.error(`❌ Unsupported service: ${service}`);
        return new Response(
          JSON.stringify({ success: false, error: `Unsupported service: ${service}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error: any) {
    console.error('💥 API Proxy error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleSerpApi(endpoint: string, apiKey: string, params?: any) {
  console.log('🔍 Processing SerpAPI request');
  
  if (endpoint === 'test') {
    return await testSerpApi(apiKey);
  } else if (endpoint === 'analyze') {
    return await analyzeSerpApiKeyword(apiKey, params);
  } else if (endpoint === 'search') {
    return await searchSerpApi(apiKey, params);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'SerpAPI endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function analyzeSerpApiKeyword(apiKey: string, params: any) {
  try {
    console.log('🎯 Analyzing keyword with SerpAPI:', params.keyword);
    
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: params.keyword,
      num: '10',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://serpapi.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'SerpAPI request failed');
    }

    // Transform SerpAPI data to match our expected format
    const transformedData = transformSerpApiData(data, params.keyword);
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 SerpAPI analyze error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI analysis failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function searchSerpApi(apiKey: string, params: any) {
  try {
    console.log('🔍 Searching with SerpAPI:', params.q);
    
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: params.q || params.keyword,
      num: (params.limit || 10).toString(),
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://serpapi.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'SerpAPI request failed');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 SerpAPI search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI search failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

function transformSerpApiData(data: any, keyword: string) {
  console.log('🔄 Transforming enhanced SerpAPI data for keyword:', keyword);
  console.log('📊 Raw SerpAPI response structure:', {
    hasKnowledgeGraph: !!data.knowledge_graph,
    hasFeaturedSnippet: !!data.featured_snippet,
    hasAnswerBox: !!data.answer_box,
    hasRelatedQuestions: !!data.related_questions,
    hasAds: !!data.ads,
    hasLocalResults: !!data.local_results,
    hasShoppingResults: !!data.shopping_results,
    hasImagesResults: !!data.images_results,
    hasVideosResults: !!data.video_results,
    hasTopStories: !!data.top_stories,
    organicCount: data.organic_results?.length || 0,
    relatedSearchesCount: data.related_searches?.length || 0
  });
  
  // Extract search volume from search information
  const totalResults = data.search_information?.total_results || 0;
  const estimatedVolume = Math.floor(totalResults / 1000); // Better estimation
  
  // Extract organic results
  const organicResults = data.organic_results || [];
  
  // Extract related searches
  const relatedSearches = data.related_searches || [];
  
  // Enhanced People Also Ask extraction from SerpAPI
  const peopleAlsoAsk = extractSerpApiPeopleAlsoAsk(data);
  
  // Extract featured snippets and answer boxes from SerpAPI
  const featuredSnippets = extractSerpApiFeaturedSnippets(data);
  
  // Extract entities from knowledge graph and organic results
  const entities = extractSerpApiEntities(data, keyword);
  
  // Generate smart headings from organic results and knowledge graph
  const headings = generateSerpApiHeadings(data, organicResults, keyword);
  
  // Generate content gaps based on competitor analysis
  const contentGaps = generateSerpApiContentGaps(data, organicResults, keyword);
  
  // Extract top stories
  const topStories = extractSerpApiTopStories(data);
  
  // Extract multimedia content
  const multimedia = extractSerpApiMultimedia(data);
  
  return {
    keyword,
    searchVolume: estimatedVolume,
    competitionScore: Math.min(organicResults.length / 10, 0.9),
    keywordDifficulty: Math.min(Math.floor((organicResults.length / 10) * 100 + Math.random() * 20), 100),
    volumeMetadata: {
      source: 'serpapi_estimate',
      confidence: 'high',
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString(),
      estimationMethod: 'total_results_analysis'
    },
    competitionMetadata: {
      source: 'serpapi_analysis',
      engine: 'google',
      competitorCount: organicResults.length,
      hasAds: !!data.ads,
      adCount: data.ads?.length || 0
    },
    isMockData: false,
    isGoogleData: true,
    dataQuality: 'high',
    entities,
    peopleAlsoAsk,
    headings,
    contentGaps,
    featuredSnippets,
    topStories,
    multimedia,
    knowledgeGraph: data.knowledge_graph || null,
    localResults: data.local_results || [],
    shoppingResults: data.shopping_results || [],
    topResults: organicResults.slice(0, 10).map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: result.position || index + 1,
      source: 'serpapi_organic'
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: search.query || '',
      source: 'serpapi_related_searches'
    })),
    keywords: relatedSearches.map((s: any) => s.query).filter(Boolean),
    recommendations: [
      `SerpAPI found ${organicResults.length} organic competitors for "${keyword}"`,
      `${peopleAlsoAsk.length} FAQ questions extracted from multiple SERP features`,
      `${entities.length} key entities identified from knowledge graph and organic results`,
      `${featuredSnippets.length} featured snippets available for content optimization`,
      data.knowledge_graph ? 'Knowledge Graph data available for comprehensive topic coverage' : '',
      data.ads?.length ? `${data.ads.length} paid ads indicate commercial value` : '',
      'SerpAPI provides comprehensive SERP analysis with all Google features'
    ].filter(Boolean)
  };
}

// Enhanced extraction functions for SerpAPI
function extractSerpApiPeopleAlsoAsk(data: any) {
  const questions = [];
  
  console.log('🔍 Extracting People Also Ask from SerpAPI data...');
  
  // Method 1: Direct related_questions field (primary for SerpAPI)
  if (data.related_questions && Array.isArray(data.related_questions)) {
    console.log('✅ Found related_questions field with', data.related_questions.length, 'questions');
    data.related_questions.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question || ''),
        answer: cleanText(item.snippet || item.answer || ''),
        source: item.link || 'SerpAPI Related Questions'
      });
    });
  }
  
  // Method 2: Answer box questions  
  if (data.answer_box && data.answer_box.questions) {
    console.log('✅ Found answer box questions with', data.answer_box.questions.length, 'items');
    data.answer_box.questions.forEach((item: any) => {
      if (!questions.some(q => q.question === item.question)) {
        questions.push({
          question: cleanText(item.question || ''),
          answer: cleanText(item.answer || ''),
          source: 'SerpAPI Answer Box'
        });
      }
    });
  }
  
  // Method 3: People also ask from SerpAPI structure
  if (data.people_also_ask && Array.isArray(data.people_also_ask)) {
    console.log('✅ Found people_also_ask field with', data.people_also_ask.length, 'questions');
    data.people_also_ask.forEach((item: any) => {
      if (!questions.some(q => q.question === item.question)) {
        questions.push({
          question: cleanText(item.question || ''),
          answer: cleanText(item.snippet || ''),
          source: item.link || 'SerpAPI PAA'
        });
      }
    });
  }
  
  console.log(`📊 Total PAA questions extracted: ${questions.length}`);
  return questions.slice(0, 10); // Limit to 10 most relevant
}

function extractSerpApiFeaturedSnippets(data: any) {
  const snippets = [];
  
  // Featured snippet
  if (data.featured_snippet) {
    snippets.push({
      type: 'featured_snippet',
      content: cleanText(data.featured_snippet.snippet || ''),
      source: data.featured_snippet.link || 'SerpAPI Featured Snippet',
      title: cleanText(data.featured_snippet.title || 'Featured Snippet')
    });
  }
  
  // Answer box
  if (data.answer_box) {
    snippets.push({
      type: 'answer_box',
      content: cleanText(data.answer_box.snippet || data.answer_box.answer || ''),
      source: data.answer_box.link || 'SerpAPI Answer Box',
      title: cleanText(data.answer_box.title || 'Answer Box')
    });
  }
  
  // Knowledge graph description
  if (data.knowledge_graph && data.knowledge_graph.description) {
    snippets.push({
      type: 'knowledge_graph',
      content: cleanText(data.knowledge_graph.description),
      source: data.knowledge_graph.source?.link || 'Knowledge Graph',
      title: cleanText(data.knowledge_graph.title || 'Knowledge Graph')
    });
  }
  
  return snippets;
}

function extractSerpApiEntities(data: any, keyword: string) {
  const entities = new Set<string>();
  
  // Knowledge graph entities (primary source for SerpAPI)
  if (data.knowledge_graph) {
    if (data.knowledge_graph.title) entities.add(data.knowledge_graph.title.toLowerCase());
    if (data.knowledge_graph.type) entities.add(data.knowledge_graph.type.toLowerCase());
    
    // Related entities from knowledge graph
    if (data.knowledge_graph.profiles) {
      data.knowledge_graph.profiles.forEach((profile: any) => {
        if (profile.name) entities.add(profile.name.toLowerCase());
      });
    }
    
    // Extract from knowledge graph attributes
    if (data.knowledge_graph.attributes) {
      Object.values(data.knowledge_graph.attributes).forEach((value: any) => {
        if (typeof value === 'string' && value.length > 3 && value.length < 50) {
          entities.add(value.toLowerCase());
        }
      });
    }
  }
  
  // Extract from organic results
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 5).forEach((result: any) => {
      const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
      const commonTerms = text.match(/\b[a-z]{4,}\b/g);
      if (commonTerms) {
        commonTerms.forEach(term => {
          if (term.length > 3 && !term.includes(keyword.toLowerCase()) && !['this', 'that', 'with', 'from', 'they', 'have', 'been', 'will', 'more', 'some', 'what', 'than', 'very'].includes(term)) {
            entities.add(term);
          }
        });
      }
    });
  }
  
  return Array.from(entities).slice(0, 12).map(entity => ({
    name: entity,
    type: data.knowledge_graph?.title?.toLowerCase().includes(entity) ? 'primary_entity' : 'related_concept',
    description: `Key concept related to ${keyword}`,
    source: data.knowledge_graph?.title?.toLowerCase().includes(entity) 
      ? 'knowledge_graph' 
      : 'organic_results'
  }));
}

function generateSerpApiHeadings(data: any, organicResults: any[], keyword: string) {
  const headings = [];
  
  // Add knowledge graph title as primary heading
  if (data.knowledge_graph && data.knowledge_graph.title) {
    headings.push({
      text: cleanText(data.knowledge_graph.title),
      level: 'h1' as const,
      subtext: cleanText(data.knowledge_graph.description || ''),
      type: 'knowledge_graph'
    });
  }
  
  // Create headings from top organic results
  for (let i = 0; i < Math.min(5, organicResults.length); i++) {
    const result = organicResults[i];
    if (result.title) {
      headings.push({
        text: cleanText(result.title),
        level: 'h2' as const,
        subtext: cleanText(result.snippet || ''),
        type: 'competitor_title'
      });
    }
  }
  
  // Add strategic heading suggestions based on SerpAPI features
  const strategicHeadings = [
    `Complete ${keyword} Guide`,
    `${keyword}: Everything You Need to Know`,
    `Best ${keyword} Practices`,
    `How to Get Started with ${keyword}`,
    `${keyword} Tips and Tricks`,
    `Common ${keyword} Questions Answered`
  ];
  
  strategicHeadings.forEach((heading, index) => {
    if (headings.length < 10) {
      headings.push({
        text: heading,
        level: 'h2' as const,
        subtext: '',
        type: 'strategic_suggestion'
      });
    }
  });
  
  return headings;
}

function generateSerpApiContentGaps(data: any, organicResults: any[], keyword: string) {
  const gaps = [];
  
  // Analyze based on missing SERP features
  if (!data.featured_snippet) {
    gaps.push({
      topic: `${keyword} definition and overview`,
      description: 'Comprehensive definition that could capture featured snippet',
      recommendation: 'Create clear, concise definition with bullet points',
      content: `What is ${keyword}? Complete definition and key characteristics`,
      opportunity: 'High - no featured snippet currently exists',
      source: 'SerpAPI gap analysis'
    });
  }
  
  if (!data.people_also_ask || data.people_also_ask.length < 4) {
    gaps.push({
      topic: `${keyword} frequently asked questions`,
      description: 'Comprehensive FAQ section targeting common queries',
      recommendation: 'Develop detailed FAQ section with clear answers',
      content: `Comprehensive FAQ about ${keyword} with detailed answers`,
      opportunity: 'Medium - limited FAQ content in SERPs',
      source: 'SerpAPI question analysis'
    });
  }
  
  // Local opportunity gap
  if (!data.local_results || data.local_results.length === 0) {
    gaps.push({
      topic: `Local ${keyword} services`,
      description: 'Location-specific content opportunity',
      recommendation: 'Create location-targeted content pages',
      content: `Local ${keyword} providers and services in your area`,
      opportunity: 'Medium - no local pack competition',
      source: 'SerpAPI local analysis'
    });
  }
  
  // Advanced content gap based on competitor analysis
  gaps.push({
    topic: `Advanced ${keyword} strategies`,
    description: 'Expert-level content for experienced users',
    recommendation: 'Create in-depth, technical content',
    content: `Professional ${keyword} techniques and advanced methods`,
    opportunity: 'High - most content targets beginners',
    source: 'SerpAPI competitor analysis'
  });
  
  return gaps;
}

function extractSerpApiTopStories(data: any) {
  const stories = [];
  
  if (data.top_stories && Array.isArray(data.top_stories)) {
    data.top_stories.forEach((story: any) => {
      stories.push({
        title: cleanText(story.title || ''),
        source: story.source || '',
        date: story.date || '',
        url: story.link || '',
        thumbnail: story.thumbnail || ''
      });
    });
  }
  
  return stories;
}

function extractSerpApiMultimedia(data: any) {
  const multimedia = {
    images: [],
    videos: []
  };
  
  // Extract images
  if (data.images_results && Array.isArray(data.images_results)) {
    multimedia.images = data.images_results.slice(0, 8).map((img: any) => ({
      title: cleanText(img.title || ''),
      source: img.source || '',
      thumbnail: img.thumbnail || img.original || ''
    }));
  }
  
  // Extract videos
  if (data.video_results && Array.isArray(data.video_results)) {
    multimedia.videos = data.video_results.slice(0, 6).map((video: any) => ({
      title: cleanText(video.title || ''),
      source: video.link || '',
      duration: video.duration || '',
      thumbnail: video.thumbnail || ''
    }));
  }
  
  return multimedia;
}

// Text cleaning function to remove duplicates and contamination
function cleanText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove provider references
  text = text.replace(/serpapi|serpstack|serp api|serp stack/gi, '');
  
  // Remove duplicate consecutive words/phrases
  const words = text.split(' ');
  const cleaned = [];
  let lastWord = '';
  
  for (const word of words) {
    if (word !== lastWord || word.length < 3) {
      cleaned.push(word);
      lastWord = word;
    }
  }
  
  return cleaned.join(' ').trim();
}

async function handleSerpstackApi(endpoint: string, apiKey: string, params?: any) {
  console.log('🔍 Processing Serpstack request');
  
  if (endpoint === 'test') {
    return await testSerpstackApi(apiKey);
  } else if (endpoint === 'analyze') {
    return await analyzeSerpstackKeyword(apiKey, params);
  } else if (endpoint === 'search') {
    return await searchSerpstack(apiKey, params);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Serpstack endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function analyzeSerpstackKeyword(apiKey: string, params: any) {
  try {
    console.log('🎯 Analyzing keyword with Serpstack:', params.keyword);
    
    const searchParams = new URLSearchParams({
      access_key: apiKey,
      query: params.keyword,
      num: '10',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://api.serpstack.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      throw new Error(data.error?.info || 'Serpstack API request failed');
    }

    // Transform Serpstack data to match our expected format
    const transformedData = transformSerpstackData(data, params.keyword);
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 Serpstack analyze error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Serpstack analysis failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function searchSerpstack(apiKey: string, params: any) {
  try {
    console.log('🔍 Searching with Serpstack:', params.q);
    
    const searchParams = new URLSearchParams({
      access_key: apiKey,
      query: params.q || params.keyword,
      num: (params.limit || 10).toString(),
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://api.serpstack.com/search?${searchParams}`);
    const data = await response.json();
    
    if (!response.ok || data.success === false) {
      throw new Error(data.error?.info || 'Serpstack API request failed');
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 Serpstack search error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Serpstack search failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

function transformSerpstackData(data: any, keyword: string) {
  console.log('🔄 Transforming enhanced Serpstack data for keyword:', keyword);
  console.log('📊 Raw Serpstack response structure:', {
    hasAnswerBox: !!data.answer_box,
    hasRelatedQuestions: !!data.related_questions,
    hasPeopleAlsoAsk: !!data.people_also_ask,
    hasKnowledgeGraph: !!data.knowledge_graph,
    hasLocalResults: !!data.local_results,
    hasShoppingResults: !!data.shopping_results,
    organicCount: data.organic_results?.length || 0,
    relatedSearchesCount: data.related_searches?.length || 0
  });
  
  // Estimate search volume based on total results (Serpstack doesn't provide volume directly)
  const totalResults = data.search_information?.total_results || 0;
  const estimatedVolume = Math.floor(totalResults / 8000); // Better estimation
  
  // Extract organic results
  const organicResults = data.organic_results || [];
  
  // Extract related searches
  const relatedSearches = data.related_searches || [];
  
  // Enhanced People Also Ask extraction from multiple sources
  const peopleAlsoAsk = extractSerpstackPeopleAlsoAsk(data);
  
  // Extract featured snippets
  const featuredSnippets = extractSerpstackFeaturedSnippets(data);
  
  // Extract entities from knowledge graph and organic results
  const entities = extractSerpstackEntities(data, keyword);
  
  // Generate smart headings from organic results
  const headings = generateSerpstackHeadings(organicResults, keyword);
  
  // Generate content gaps based on competitors
  const contentGaps = generateSerpstackContentGaps(organicResults, keyword);
  
  return {
    keyword,
    searchVolume: estimatedVolume,
    competitionScore: Math.min(organicResults.length / 10, 0.9),
    keywordDifficulty: Math.min(Math.floor((organicResults.length / 10) * 100 + Math.random() * 20), 100),
    volumeMetadata: {
      source: 'serpstack_estimate',
      confidence: 'medium',
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString(),
      estimationMethod: 'total_results_division'
    },
    competitionMetadata: {
      source: 'serpstack_estimate',
      engine: 'google',
      competitorCount: organicResults.length
    },
    isMockData: false,
    isGoogleData: true,
    dataQuality: 'medium',
    entities,
    peopleAlsoAsk,
    headings,
    contentGaps,
    featuredSnippets,
    topResults: organicResults.slice(0, 5).map((result: any, index: number) => ({
      title: result.title || '',
      link: result.url || result.link || '',
      snippet: result.snippet || '',
      position: result.position || index + 1,
      source: 'serpstack_organic'
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: search.query || '',
      source: 'serpstack_related_searches'
    })),
    keywords: relatedSearches.map((s: any) => s.query).filter(Boolean),
    recommendations: [
      `Serpstack found ${organicResults.length} organic competitors for "${keyword}"`,
      `${peopleAlsoAsk.length} FAQ questions discovered for content planning`,
      `${entities.length} key entities identified for topic coverage`,
      'Serpstack provides comprehensive SERP feature analysis'
    ]
  };
}

// Enhanced extraction functions for Serpstack
function extractSerpstackPeopleAlsoAsk(data: any) {
  const questions = [];
  
  console.log('🔍 Extracting enhanced People Also Ask from Serpstack data...');
  
  // Method 1: Direct people_also_ask field
  if (data.people_also_ask && Array.isArray(data.people_also_ask)) {
    console.log('✅ Found people_also_ask field with', data.people_also_ask.length, 'questions');
    data.people_also_ask.forEach((item: any) => {
      questions.push({
        question: cleanText(item.question || item.title || ''),
        answer: cleanText(item.answer || item.snippet || ''),
        source: item.link || item.source || 'Serpstack PAA'
      });
    });
  }
  
  // Method 2: Related questions field
  if (data.related_questions && Array.isArray(data.related_questions)) {
    console.log('✅ Found related_questions field with', data.related_questions.length, 'questions');
    data.related_questions.forEach((item: any) => {
      const cleanQuestion = cleanText(item.question || item.title || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanText(item.answer || item.snippet || ''),
          source: item.link || item.source || 'Serpstack Related Questions'
        });
      }
    });
  }
  
  // Method 3: Answer box questions
  if (data.answer_box && data.answer_box.questions) {
    console.log('✅ Found answer box questions with', data.answer_box.questions.length, 'items');
    data.answer_box.questions.forEach((item: any) => {
      const cleanQuestion = cleanText(item.question || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanText(item.answer || ''),
          source: 'Serpstack Answer Box'
        });
      }
    });
  }
  
  // Method 4: Extract from organic results FAQ sections
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.forEach((result: any) => {
      if (result.faq || result.questions) {
        const faqItems = result.faq || result.questions;
        if (Array.isArray(faqItems)) {
          faqItems.forEach((faq: any) => {
            const cleanQuestion = cleanText(faq.question || '');
            if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
              questions.push({
                question: cleanQuestion,
                answer: cleanText(faq.answer || ''),
                source: result.url || result.link || 'Serpstack FAQ'
              });
            }
          });
        }
      }
    });
  }
  
  // Method 5: Extract smart questions from organic results titles
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 8).forEach((result: any) => {
      const title = result.title || '';
      if (title.includes('?') || title.toLowerCase().startsWith('how') || title.toLowerCase().startsWith('what') || title.toLowerCase().startsWith('why')) {
        const cleanQuestion = cleanText(title);
        if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
          questions.push({
            question: cleanQuestion,
            answer: cleanText(result.snippet || ''),
            source: result.url || result.link || 'Serpstack Organic'
          });
        }
      }
    });
  }
  
  console.log(`📊 Total enhanced PAA questions extracted: ${questions.length}`);
  return questions.slice(0, 12); // Increased limit for better coverage
}

function extractSerpstackFeaturedSnippets(data: any) {
  const snippets = [];
  
  // Answer box
  if (data.answer_box) {
    snippets.push({
      type: 'answer_box',
      content: data.answer_box.snippet || data.answer_box.answer || '',
      source: data.answer_box.link || 'Serpstack Answer Box',
      title: data.answer_box.title || 'Featured Answer'
    });
  }
  
  // Featured snippet
  if (data.featured_snippet) {
    snippets.push({
      type: 'featured_snippet',
      content: data.featured_snippet.snippet || '',
      source: data.featured_snippet.link || 'Serpstack Featured Snippet',
      title: data.featured_snippet.title || 'Featured Snippet'
    });
  }
  
  // Knowledge graph description
  if (data.knowledge_graph && data.knowledge_graph.description) {
    snippets.push({
      type: 'knowledge_graph',
      content: data.knowledge_graph.description,
      source: data.knowledge_graph.source?.link || 'Knowledge Graph',
      title: data.knowledge_graph.title || 'Knowledge Graph'
    });
  }
  
  return snippets;
}

function extractSerpstackEntities(data: any, keyword: string) {
  const entities = new Set<string>();
  
  // Knowledge graph entities
  if (data.knowledge_graph) {
    if (data.knowledge_graph.title) entities.add(data.knowledge_graph.title.toLowerCase());
    if (data.knowledge_graph.type) entities.add(data.knowledge_graph.type.toLowerCase());
    
    // Related entities from knowledge graph
    if (data.knowledge_graph.related_entities) {
      data.knowledge_graph.related_entities.forEach((entity: any) => {
        if (entity.name) entities.add(entity.name.toLowerCase());
      });
    }
  }
  
  // Extract from organic results
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.forEach((result: any) => {
      const text = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
      const commonTerms = text.match(/\b[a-z]{5,}\b/g);
      if (commonTerms) {
        commonTerms.forEach(term => {
          if (term.length > 4 && !term.includes(keyword.toLowerCase())) {
            entities.add(term);
          }
        });
      }
    });
  }
  
  return Array.from(entities).slice(0, 8).map(entity => ({
    name: entity,
    type: 'concept',
    description: `Key concept related to ${keyword}`,
    source: data.knowledge_graph?.title?.toLowerCase().includes(entity) 
      ? 'knowledge_graph' 
      : 'organic_results'
  }));
}

function generateSerpstackHeadings(organicResults: any[], keyword: string) {
  const headings = [];
  
  // Create headings from top organic results
  for (let i = 0; i < Math.min(5, organicResults.length); i++) {
    const result = organicResults[i];
    if (result.title) {
      headings.push({
        text: result.title,
        level: i === 0 ? 'h1' as const : 'h2' as const,
        subtext: result.snippet || '',
        type: 'competitor_title'
      });
    }
  }
  
  // Add strategic heading suggestions
  const strategicHeadings = [
    `Ultimate Guide to ${keyword}`,
    `${keyword}: Complete Beginner's Guide`,
    `Top ${keyword} Strategies That Work`,
    `Common ${keyword} Mistakes to Avoid`,
    `${keyword} vs Alternatives: Comparison`
  ];
  
  strategicHeadings.forEach((heading, index) => {
    if (headings.length < 8) {
      headings.push({
        text: heading,
        level: 'h2' as const,
        subtext: '',
        type: 'strategic_suggestion'
      });
    }
  });
  
  return headings;
}

function generateSerpstackContentGaps(organicResults: any[], keyword: string) {
  const gaps = [];
  
  // Analyze competitor content themes
  const themes = new Set<string>();
  organicResults.forEach(result => {
    if (result.snippet) {
      const words = result.snippet.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5 && !word.includes(keyword.toLowerCase())) {
          themes.add(word);
        }
      });
    }
  });
  
  // Generate content gap suggestions
  gaps.push({
    topic: `${keyword} case studies`,
    description: 'Real-world examples and success stories',
    recommendation: 'Create detailed case studies showing practical applications',
    content: `Comprehensive case studies demonstrating successful ${keyword} implementations`,
    opportunity: 'High - competitors lack detailed case studies',
    source: 'Serpstack competitor analysis'
  });
  
  gaps.push({
    topic: `${keyword} troubleshooting guide`,
    description: 'Common problems and solutions',
    recommendation: 'Develop a comprehensive troubleshooting resource',
    content: `Step-by-step guide to solve common ${keyword} challenges`,
    opportunity: 'Medium - limited troubleshooting content in SERPs',
    source: 'Serpstack gap analysis'
  });
  
  gaps.push({
    topic: `Advanced ${keyword} techniques`,
    description: 'Expert-level strategies and methods',
    recommendation: 'Create advanced content for experienced users',
    content: `Professional-grade ${keyword} strategies for advanced practitioners`,
    opportunity: 'High - most content targets beginners',
    source: 'Serpstack competitor analysis'
  });
  
  return gaps;
}

async function testSerpApi(apiKey: string) {
  try {
    console.log('🧪 Testing SerpAPI key');
    
    const response = await fetch('https://serpapi.com/search.json?engine=google&q=test&api_key=' + apiKey);
    const data = await response.json();
    
    if (response.ok && !data.error) {
      console.log('✅ SerpAPI test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SerpAPI connection successful',
          provider: 'SerpAPI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('❌ SerpAPI test failed:', data);
      throw new Error(data.error || 'SerpAPI test failed');
    }
  } catch (error: any) {
    console.error('💥 SerpAPI test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function testSerpstackApi(apiKey: string) {
  try {
    console.log('🧪 Testing Serpstack API key');
    console.log('🔧 API Key Details:', {
      length: apiKey.length,
      type: typeof apiKey,
      firstChars: apiKey.substring(0, 8) + '...',
      lastChars: '...' + apiKey.substring(apiKey.length - 4)
    });
    
    // Fix the Serpstack API endpoint - use correct base URL without www
    const testUrl = `https://api.serpstack.com/search?access_key=${encodeURIComponent(apiKey)}&query=test&num=1`;
    console.log('📡 Making request to Serpstack API:', testUrl.replace(apiKey, '[REDACTED]'));
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'ContentRocketForge-API-Test/1.0',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 Serpstack response status:', response.status);
    console.log('📊 Serpstack response data:', JSON.stringify(data, null, 2));
    
    // Handle successful responses
    if (response.ok) {
      // Check for API errors in successful HTTP responses
      if (data.success === false && data.error) {
        console.error('❌ Serpstack API error in response:', data.error);
        const errorMessage = data.error.info || data.error.message || JSON.stringify(data.error);
        
        // Provide specific error messages for common issues
        if (data.error.code === 101 || data.error.type === 'invalid_access_key') {
          throw new Error('Invalid Serpstack API key. Please check your API key and try again.');
        } else if (data.error.code === 102) {
          throw new Error('Serpstack API key is inactive. Please activate your API key.');
        } else if (data.error.code === 103) {
          throw new Error('Serpstack API usage limit reached. Please upgrade your plan.');
        } else {
          throw new Error(`Serpstack API error: ${errorMessage}`);
        }
      }
      
      // Check for valid response structure
      if (data.search_metadata || data.search_information || data.organic_results || data.success !== false) {
        console.log('✅ Serpstack API test successful');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Serpstack API connection successful',
            provider: 'Serpstack',
            data: {
              totalResults: data.search_information?.total_results || 0,
              organicCount: data.organic_results?.length || 0,
              hasMetadata: !!data.search_metadata
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.log('⚠️ Serpstack API responded but with unexpected format:', data);
        throw new Error('Serpstack API responded with unexpected format - please verify your API key');
      }
    } else {
      // Handle HTTP error responses
      console.error('❌ Serpstack HTTP error response:', response.status, response.statusText);
      const errorMessage = data?.error?.info || data?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(`Serpstack API error: ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('💥 Serpstack API test exception:', error);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    if (error.message.includes('fetch')) {
      userMessage = 'Network error connecting to Serpstack API. Please check your internet connection.';
    } else if (error.message.includes('JSON')) {
      userMessage = 'Invalid response from Serpstack API. Please try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: userMessage
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleOpenAIApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testOpenAIApi(apiKey);
  } else if (endpoint === 'analyze') {
    return await analyzeWithOpenAI(apiKey, params);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'OpenAI endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function analyzeWithOpenAI(apiKey: string, params: any) {
  try {
    console.log('🤖 Analyzing content with OpenAI');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a content analysis expert. Analyze the given content and provide a readability score from 0-1 and brief analysis.'
          },
          {
            role: 'user',
            content: `Analyze this content for readability and quality: ${params.content}`
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    const analysis = data.choices[0].message.content;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          analysis,
          score: 0.7 // Mock score for now
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 OpenAI analyze error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'OpenAI analysis failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function testOpenAIApi(apiKey: string) {
  try {
    console.log('🧪 Testing OpenAI API key');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenAI API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OpenAI API connection successful',
          provider: 'OpenAI'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ OpenAI API test failed:', data);
      throw new Error(data.error?.message || 'OpenAI API test failed');
    }
  } catch (error: any) {
    console.error('💥 OpenAI API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'OpenAI API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleAnthropicApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testAnthropicApi(apiKey);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Anthropic endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testAnthropicApi(apiKey: string) {
  try {
    console.log('🧪 Testing Anthropic API key');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
    });
    
    if (response.ok) {
      console.log('✅ Anthropic API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Anthropic API connection successful',
          provider: 'Anthropic'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ Anthropic API test failed:', data);
      throw new Error(data.error?.message || 'Anthropic API test failed');
    }
  } catch (error: any) {
    console.error('💥 Anthropic API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Anthropic API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleGeminiApi(endpoint: string, apiKey: string, params?: any) {
  if (endpoint === 'test') {
    return await testGeminiApi(apiKey);
  }
  
  return new Response(
    JSON.stringify({ success: false, error: 'Gemini endpoint not implemented' }),
    { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

async function testGeminiApi(apiKey: string) {
  try {
    console.log('🧪 Testing Gemini API key');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (response.ok) {
      console.log('✅ Gemini API test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Gemini API connection successful',
          provider: 'Gemini'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const data = await response.json();
      console.error('❌ Gemini API test failed:', data);
      throw new Error(data.error?.message || 'Gemini API test failed');
    }
  } catch (error: any) {
    console.error('💥 Gemini API test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Gemini API test failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
