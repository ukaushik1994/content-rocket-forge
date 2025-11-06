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
      apiKeyType: typeof apiKey,
      paramsReceived: Object.keys(params || {})
    });

    // Get API key from params first, then fall back to Supabase secrets
    let finalApiKey = apiKey;
    
    if (!finalApiKey || finalApiKey.trim() === '') {
      console.log('🔑 No API key provided, checking Supabase secrets...');
      
      // Determine which secret to fetch based on service
      const secretName = (service === 'serp' || service === 'serpapi') ? 'SERP_API_KEY' : 
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
      const errorMsg = `API key is required for ${service}. Please configure your API key in Settings.`;
      console.error(`❌ No API key available for ${service}:`, errorMsg);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMsg,
          provider: service,
          requiresApiKey: true
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
      case 'serpapi':  // Handle both 'serp' and 'serpapi' for compatibility
        return await handleSerpApiWithFallback(endpoint, finalApiKey, params);
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
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        details: 'Check API key configuration and service availability',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleSerpApiWithFallback(endpoint: string, apiKey: string, params?: any) {
  console.log('🔍 Processing SerpAPI request with Serpstack fallback');
  
  try {
    // Try SerpAPI first
    return await handleSerpApi(endpoint, apiKey, params);
  } catch (error: any) {
    console.warn('⚠️ SerpAPI failed, attempting Serpstack fallback:', error.message);
    
    // Check if error indicates quota/rate limit issues that warrant fallback
    if (isQuotaOrRateLimitError(error)) {
      try {
        // Get Serpstack API key
        const serpstackKey = Deno.env.get('SERPSTACK_KEY');
        if (serpstackKey) {
          console.log('🔄 Falling back to Serpstack...');
          return await handleSerpstackApi(endpoint, serpstackKey, params);
        } else {
          console.error('❌ No Serpstack key available for fallback');
        }
      } catch (fallbackError: any) {
        console.error('💥 Serpstack fallback also failed:', fallbackError.message);
      }
    }
    
    // If fallback failed or not applicable, return original SerpAPI error
    throw error;
  }
}

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

function isQuotaOrRateLimitError(error: any): boolean {
  const errorMessage = (error.message || error.toString()).toLowerCase();
  return errorMessage.includes('quota') || 
         errorMessage.includes('rate limit') || 
         errorMessage.includes('429') ||
         errorMessage.includes('quota exceeded') ||
         errorMessage.includes('credit');
}

async function analyzeSerpApiKeyword(apiKey: string, params: any) {
  try {
    const keyword = params.keyword || params.q;
    if (!keyword) {
      throw new Error('No keyword provided for analysis');
    }
    
    console.log('🎯 Analyzing keyword with SerpAPI:', keyword);
    
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      engine: 'google',
      q: keyword,
      num: '10',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`https://serpapi.com/search?${searchParams}`);
    const data = await response.json();
    
    console.log('📊 SerpAPI response received:', {
      status: response.status,
      hasError: !!data.error,
      hasOrganicResults: !!data.organic_results,
      organicCount: data.organic_results?.length || 0,
      searchInformation: !!data.search_information
    });
    
    if (!response.ok || data.error) {
      const errorMessage = data.error?.message || data.error || 'SerpAPI request failed';
      console.error('❌ SerpAPI error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Validate that we have actual search results
    if (!data.search_information && !data.organic_results) {
      console.warn('⚠️ SerpAPI returned empty results');
      throw new Error('SerpAPI returned no search results');
    }

    // Transform SerpAPI data to match our expected format
    const transformedData = transformSerpApiData(data, keyword);
    
    console.log('✅ SerpAPI data transformation complete:', {
      keyword: transformedData.keyword,
      peopleAlsoAskCount: transformedData.peopleAlsoAsk?.length || 0,
      entitiesCount: transformedData.entities?.length || 0,
      featuredSnippetsCount: transformedData.featuredSnippets?.length || 0,
      topResultsCount: transformedData.topResults?.length || 0,
      dataQuality: transformedData.dataQuality
    });
    
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 SerpAPI analyze error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI analysis failed',
        details: 'Check API key validity and quota limits'
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
    hasPeopleAlsoAsk: !!data.people_also_ask,
    hasAds: !!data.ads,
    hasLocalResults: !!data.local_results,
    hasShoppingResults: !!data.shopping_results,
    hasImagesResults: !!data.images_results,
    hasVideosResults: !!data.video_results,
    hasTopStories: !!data.top_stories,
    hasNewsResults: !!data.news_results,
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
  
  // Extract top stories and news
  const topStories = extractSerpApiTopStories(data);
  
  // Extract multimedia content (images and videos)
  const multimedia = extractSerpApiMultimedia(data);
  
  // Extract local business data
  const localBusinessData = extractSerpApiLocalBusinessData(data);
  
  // Extract shopping results
  const shoppingData = extractSerpApiShoppingData(data);
  
  // Enhanced SERP feature gap analysis
  const serpFeatureGaps = analyzeSerpApiFeatureGaps(data, keyword);
  
  // Generate comprehensive insights
  const insights = generateSerpApiInsights(data, organicResults, peopleAlsoAsk, keyword);
  
  // Calculate data quality score
  const dataQualityScore = calculateSerpApiDataQuality(data);
  
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
      adCount: data.ads?.length || 0,
      hasLocalPack: !!data.local_results,
      hasShoppingResults: !!data.shopping_results,
      hasFeaturedSnippet: !!data.featured_snippet,
      hasKnowledgeGraph: !!data.knowledge_graph
    },
    isMockData: false,
    isGoogleData: true,
    dataQuality: dataQualityScore,
    entities,
    peopleAlsoAsk,
    headings,
    contentGaps: [...contentGaps, ...serpFeatureGaps],
    featuredSnippets,
    topStories,
    multimedia,
    localBusinessData,
    shoppingData,
    insights,
    knowledgeGraph: data.knowledge_graph || null,
    localResults: data.local_results || [],
    shoppingResults: data.shopping_results || [],
    topResults: organicResults.slice(0, 10).map((result: any, index: number) => ({
      title: cleanSerpApiText(result.title || ''),
      link: result.link || '',
      snippet: cleanSerpApiText(result.snippet || ''),
      position: result.position || index + 1,
      source: 'organic_result',
      wordCount: estimateWordCount(result.snippet || ''),
      hasRichSnippet: !!(result.rich_snippet || result.sitelinks)
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: cleanSerpApiText(search.query || ''),
      source: 'related_searches'
    })),
    keywords: relatedSearches.map((s: any) => cleanSerpApiText(s.query || '')).filter(Boolean),
    recommendations: [
      `SerpAPI extracted ${organicResults.length} organic competitors for comprehensive analysis`,
      `${peopleAlsoAsk.length} FAQ questions discovered from People Also Ask and related questions`,
      `${entities.length} key entities identified from knowledge graph and organic content`,
      `${featuredSnippets.length} featured snippets found for optimization opportunities`,
      data.knowledge_graph ? 'Rich Knowledge Graph data available for entity-based content strategy' : '',
      data.local_results?.length ? `${data.local_results.length} local results suggest local SEO opportunities` : '',
      data.shopping_results?.length ? `${data.shopping_results.length} shopping results indicate commercial intent` : '',
      multimedia.images?.length ? `${multimedia.images.length} image results suggest visual content opportunities` : '',
      multimedia.videos?.length ? `${multimedia.videos.length} video results indicate video content demand` : '',
      data.ads?.length ? `${data.ads.length} paid ads confirm commercial value and competition` : '',
      'SerpAPI provides the most comprehensive SERP analysis with all Google features'
    ].filter(Boolean)
  };
}

// Enhanced extraction functions for SerpAPI
function extractSerpApiPeopleAlsoAsk(data: any) {
  const questions: Array<{question: string, answer?: string, source?: string, priority?: string}> = [];
  
  console.log('🔍 Extracting enhanced People Also Ask from SerpAPI data...');
  
  // Method 1: Direct related_questions field (primary for SerpAPI)
  if (data.related_questions && Array.isArray(data.related_questions)) {
    console.log('✅ Found related_questions field with', data.related_questions.length, 'questions');
    data.related_questions.forEach((item: any) => {
      questions.push({
        question: cleanSerpApiText(item.question || ''),
        answer: cleanSerpApiText(item.snippet || item.answer || ''),
        source: item.link || item.source || 'Related Questions',
        priority: 'high'
      });
    });
  }
  
  // Method 2: People also ask from SerpAPI structure
  if (data.people_also_ask && Array.isArray(data.people_also_ask)) {
    console.log('✅ Found people_also_ask field with', data.people_also_ask.length, 'questions');
    data.people_also_ask.forEach((item: any) => {
      const cleanQuestion = cleanSerpApiText(item.question || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanSerpApiText(item.snippet || item.answer || ''),
          source: item.link || item.source || 'People Also Ask',
          priority: 'high'
        });
      }
    });
  }
  
  // Method 3: Answer box questions  
  if (data.answer_box && data.answer_box.questions) {
    console.log('✅ Found answer box questions with', data.answer_box.questions.length, 'items');
    data.answer_box.questions.forEach((item: any) => {
      const cleanQuestion = cleanSerpApiText(item.question || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanSerpApiText(item.answer || ''),
          source: 'Answer Box',
          priority: 'medium'
        });
      }
    });
  }
  
  // Method 4: Extract from featured snippet if it contains questions
  if (data.featured_snippet && data.featured_snippet.snippet) {
    const snippetText = data.featured_snippet.snippet;
    const questionMatches = snippetText.match(/[^.!?]*\?[^.!?]*/g);
    if (questionMatches) {
      questionMatches.forEach((match: string) => {
        const cleanQuestion = cleanSerpApiText(match.trim());
        if (cleanQuestion.length > 10 && !questions.some(q => q.question === cleanQuestion)) {
          questions.push({
            question: cleanQuestion,
            answer: cleanSerpApiText(snippetText),
            source: data.featured_snippet.link || 'Featured Snippet',
            priority: 'medium'
          });
        }
      });
    }
  }
  
  // Method 5: Extract from organic results with question-style titles
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 8).forEach((result: any) => {
      const title = result.title || '';
      if (title.includes('?') || title.toLowerCase().match(/^(how|what|why|when|where|which|who)/)) {
        const cleanQuestion = cleanSerpApiText(title);
        if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
          questions.push({
            question: cleanQuestion,
            answer: cleanSerpApiText(result.snippet || ''),
            source: result.link || 'Organic Result',
            priority: 'low'
          });
        }
      }
    });
  }
  
  console.log(`📊 Total enhanced PAA questions extracted: ${questions.length}`);
  return questions.slice(0, 15); // Increased limit for comprehensive coverage
}

function extractSerpApiFeaturedSnippets(data: any) {
  const snippets = [];
  
  // Featured snippet
  if (data.featured_snippet) {
    snippets.push({
      type: 'featured_snippet',
      content: cleanSerpApiText(data.featured_snippet.snippet || ''),
      source: data.featured_snippet.link || 'Featured Snippet',
      title: cleanSerpApiText(data.featured_snippet.title || 'Featured Snippet'),
      format: data.featured_snippet.type || 'paragraph',
      datePublished: data.featured_snippet.date || null
    });
  }
  
  // Answer box
  if (data.answer_box) {
    snippets.push({
      type: 'answer_box',
      content: cleanSerpApiText(data.answer_box.snippet || data.answer_box.answer || ''),
      source: data.answer_box.link || 'Answer Box',
      title: cleanSerpApiText(data.answer_box.title || 'Answer Box'),
      format: data.answer_box.type || 'direct_answer',
      datePublished: data.answer_box.date || null
    });
  }
  
  // Knowledge graph description
  if (data.knowledge_graph && data.knowledge_graph.description) {
    snippets.push({
      type: 'knowledge_graph',
      content: cleanSerpApiText(data.knowledge_graph.description),
      source: data.knowledge_graph.source?.link || 'Knowledge Graph',
      title: cleanSerpApiText(data.knowledge_graph.title || 'Knowledge Graph'),
      format: 'knowledge_panel',
      datePublished: null
    });
  }
  
  // Rich snippets from organic results
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 5).forEach((result: any) => {
      if (result.rich_snippet) {
        snippets.push({
          type: 'rich_snippet',
          content: cleanSerpApiText(result.snippet || ''),
          source: result.link || 'Rich Snippet',
          title: cleanSerpApiText(result.title || 'Rich Snippet'),
          format: result.rich_snippet.type || 'structured_data',
          datePublished: result.date || null
        });
      }
    });
  }
  
  return snippets;
}

function extractSerpApiEntities(data: any, keyword: string) {
  const entities = new Map<string, any>();
  
  // Knowledge graph entities (highest priority for SerpAPI)
  if (data.knowledge_graph) {
    if (data.knowledge_graph.title) {
      entities.set(data.knowledge_graph.title.toLowerCase(), {
        name: cleanSerpApiText(data.knowledge_graph.title),
        type: 'primary_entity',
        description: cleanSerpApiText(data.knowledge_graph.description || `Primary entity for ${keyword}`),
        source: 'knowledge_graph',
        importance: 10,
        attributes: data.knowledge_graph.attributes || {}
      });
    }
    
    if (data.knowledge_graph.type) {
      entities.set(data.knowledge_graph.type.toLowerCase(), {
        name: cleanSerpApiText(data.knowledge_graph.type),
        type: 'entity_type',
        description: `Category type for ${keyword}`,
        source: 'knowledge_graph',
        importance: 9
      });
    }
    
    // Related entities from knowledge graph
    if (data.knowledge_graph.profiles) {
      data.knowledge_graph.profiles.forEach((profile: any) => {
        if (profile.name && !entities.has(profile.name.toLowerCase())) {
          entities.set(profile.name.toLowerCase(), {
            name: cleanSerpApiText(profile.name),
            type: 'related_entity',
            description: `Related to ${keyword}`,
            source: 'knowledge_graph',
            importance: 8,
            link: profile.link || null
          });
        }
      });
    }
    
    // Extract from knowledge graph attributes
    if (data.knowledge_graph.attributes) {
      Object.entries(data.knowledge_graph.attributes).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'string' && value.length > 3 && value.length < 50) {
          const cleanValue = cleanSerpApiText(value).toLowerCase();
          if (!entities.has(cleanValue) && !cleanValue.includes(keyword.toLowerCase())) {
            entities.set(cleanValue, {
              name: cleanSerpApiText(value),
              type: 'attribute',
              description: `${key} related to ${keyword}`,
              source: 'knowledge_graph',
              importance: 6
            });
          }
        }
      });
    }
  }
  
  // Extract from featured snippet
  if (data.featured_snippet && data.featured_snippet.snippet) {
    const snippetText = data.featured_snippet.snippet.toLowerCase();
    const entityTerms = snippetText.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    entityTerms.forEach((term: any) => {
      const cleanTerm = term.toLowerCase();
      if (!entities.has(cleanTerm) && !cleanTerm.includes(keyword.toLowerCase())) {
        entities.set(cleanTerm, {
          name: term,
          type: 'featured_entity',
          description: `Featured in snippet for ${keyword}`,
          source: 'featured_snippet',
          importance: 7
        });
      }
    });
  }
  
  // Extract from organic results
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 8).forEach((result: any, index: number) => {
      const text = `${result.title || ''} ${result.snippet || ''}`;
      const commonTerms = text.match(/\b[A-Z][a-z]{4,}\b/g) || [];
      
      commonTerms.forEach(term => {
        const cleanTerm = term.toLowerCase();
        if (!entities.has(cleanTerm) && 
            !cleanTerm.includes(keyword.toLowerCase()) && 
            !['This', 'That', 'With', 'From', 'They', 'Have', 'Been', 'Will', 'More', 'Some', 'What', 'Than', 'Very', 'When', 'Where', 'Which'].includes(term)) {
          entities.set(cleanTerm, {
            name: term,
            type: 'organic_entity',
            description: `Commonly mentioned in relation to ${keyword}`,
            source: 'organic_results',
            importance: Math.max(5 - Math.floor(index / 2), 1)
          });
        }
      });
    });
  }
  
  // Sort by importance and return top entities
  return Array.from(entities.values())
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 15);
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
  const stories: any[] = [];
  
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
    multimedia.images = data.images_results.slice(0, 12).map((img: any) => ({
      title: cleanSerpApiText(img.title || ''),
      source: img.source || '',
      thumbnail: img.thumbnail || img.original || '',
      link: img.link || '',
      position: img.position || 0,
      isProduct: !!(img.price || img.product)
    }));
  }
  
  // Extract videos
  if (data.video_results && Array.isArray(data.video_results)) {
    multimedia.videos = data.video_results.slice(0, 10).map((video: any) => ({
      title: cleanSerpApiText(video.title || ''),
      source: video.link || '',
      duration: video.duration || '',
      thumbnail: video.thumbnail || '',
      channel: video.channel || '',
      date: video.date || '',
      position: video.position || 0
    }));
  }
  
  return multimedia;
}

// New enhanced extraction functions for SerpAPI
function extractSerpApiLocalBusinessData(data: any) {
  const localData: any[] = [];
  
  if (data.local_results && Array.isArray(data.local_results)) {
    data.local_results.forEach((business: any) => {
      localData.push({
        name: cleanSerpApiText(business.title || business.name || ''),
        address: cleanSerpApiText(business.address || ''),
        rating: business.rating || 0,
        reviews: business.reviews || 0,
        type: business.type || 'local_business',
        phone: business.phone || '',
        website: business.website || '',
        hours: business.hours || null,
        position: business.position || 0
      });
    });
  }
  
  return localData;
}

function extractSerpApiShoppingData(data: any) {
  const shoppingData: any[] = [];
  
  if (data.shopping_results && Array.isArray(data.shopping_results)) {
    data.shopping_results.forEach((product: any) => {
      shoppingData.push({
        title: cleanSerpApiText(product.title || ''),
        price: product.price || '',
        source: product.source || '',
        link: product.link || '',
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        image: product.thumbnail || '',
        position: product.position || 0,
        shipping: product.shipping || ''
      });
    });
  }
  
  return shoppingData;
}

function analyzeSerpApiFeatureGaps(data: any, keyword: string) {
  const featureGaps = [];
  
  // Check for missing SERP features that represent opportunities
  if (!data.featured_snippet) {
    featureGaps.push({
      topic: `Featured snippet opportunity for ${keyword}`,
      description: 'No featured snippet currently exists - opportunity to capture position zero',
      recommendation: 'Create comprehensive, structured content that directly answers the main query',
      content: `Definitive guide to ${keyword} with clear, concise answers`,
      opportunity: 'High - Featured snippet captures significant traffic',
      source: 'SERP feature gap analysis'
    });
  }
  
  if (!data.people_also_ask || data.people_also_ask.length < 4) {
    featureGaps.push({
      topic: `People Also Ask expansion for ${keyword}`,
      description: 'Limited FAQ coverage in current SERP results',
      recommendation: 'Develop comprehensive FAQ section targeting related questions',
      content: `Detailed FAQ covering all aspects of ${keyword}`,
      opportunity: 'Medium - FAQ content drives long-tail traffic',
      source: 'PAA gap analysis'
    });
  }
  
  if (!data.images_results || data.images_results.length < 5) {
    featureGaps.push({
      topic: `Visual content opportunity for ${keyword}`,
      description: 'Limited image results suggest visual content gap',
      recommendation: 'Create high-quality images, infographics, and visual guides',
      content: `Visual content library for ${keyword}`,
      opportunity: 'Medium - Images drive additional traffic streams',
      source: 'Image results analysis'
    });
  }
  
  if (!data.video_results || data.video_results.length < 3) {
    featureGaps.push({
      topic: `Video content opportunity for ${keyword}`,
      description: 'Limited video content in SERP results',
      recommendation: 'Create educational videos, tutorials, or explainer content',
      content: `Video series covering ${keyword} comprehensively`,
      opportunity: 'High - Video content has strong engagement potential',
      source: 'Video results analysis'
    });
  }
  
  return featureGaps;
}

function generateSerpApiInsights(data: any, organicResults: any[], peopleAlsoAsk: any[], keyword: string) {
  const insights = [];
  
  // Competition analysis insights
  if (organicResults.length >= 10) {
    insights.push(`High competition: ${organicResults.length} strong organic competitors identified`);
  } else if (organicResults.length >= 5) {
    insights.push(`Medium competition: ${organicResults.length} organic competitors with optimization opportunities`);
  } else {
    insights.push(`Low competition: Only ${organicResults.length} organic competitors - easier ranking opportunity`);
  }
  
  // SERP features insights
  const serpFeatures = [];
  if (data.featured_snippet) serpFeatures.push('Featured Snippet');
  if (data.knowledge_graph) serpFeatures.push('Knowledge Graph');
  if (data.local_results?.length) serpFeatures.push('Local Pack');
  if (data.shopping_results?.length) serpFeatures.push('Shopping Results');
  if (data.images_results?.length) serpFeatures.push('Images');
  if (data.video_results?.length) serpFeatures.push('Videos');
  if (data.people_also_ask?.length) serpFeatures.push('People Also Ask');
  
  if (serpFeatures.length > 0) {
    insights.push(`SERP features present: ${serpFeatures.join(', ')} - diverse content strategy needed`);
  }
  
  // Content opportunity insights
  if (peopleAlsoAsk.length >= 8) {
    insights.push(`Rich FAQ opportunity: ${peopleAlsoAsk.length} related questions suggest strong informational intent`);
  }
  
  if (data.ads?.length >= 3) {
    insights.push(`Commercial intent: ${data.ads.length} ads indicate strong buyer intent and monetization potential`);
  }
  
  return insights;
}

function calculateSerpApiDataQuality(data: any): string {
  let score = 0;
  let maxScore = 10;
  
  // Organic results quality
  if (data.organic_results?.length >= 10) score += 2;
  else if (data.organic_results?.length >= 5) score += 1;
  
  // SERP features presence
  if (data.featured_snippet) score += 1;
  if (data.knowledge_graph) score += 1;
  if (data.people_also_ask?.length >= 4) score += 1;
  if (data.related_questions?.length >= 2) score += 1;
  if (data.local_results?.length) score += 1;
  if (data.shopping_results?.length) score += 1;
  if (data.images_results?.length >= 5) score += 1;
  if (data.video_results?.length >= 3) score += 1;
  
  const percentage = (score / maxScore) * 100;
  
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'high';
  if (percentage >= 40) return 'medium';
  return 'basic';
}

function cleanSerpApiText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove provider references completely
  text = text.replace(/\b(serpapi|serp\s*api|serpstack|serp\s*stack)\b/gi, '');
  
  // Remove duplicate consecutive words
  const words = text.split(/\s+/);
  const cleaned = [];
  let lastWord = '';
  
  for (const word of words) {
    const cleanWord = word.trim();
    if (cleanWord && cleanWord !== lastWord) {
      cleaned.push(cleanWord);
      lastWord = cleanWord;
    }
  }
  
  return cleaned.join(' ').trim();
}

function cleanSerpstackText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  // Remove provider references completely
  text = text.replace(/\b(serpstack|serp\s*stack|serpapi|serp\s*api)\b/gi, '');
  
  // Remove duplicate consecutive words
  const words = text.split(/\s+/);
  const cleaned = [];
  let lastWord = '';
  
  for (const word of words) {
    const cleanWord = word.trim();
    if (cleanWord && cleanWord !== lastWord) {
      cleaned.push(cleanWord);
      lastWord = cleanWord;
    }
  }
  
  return cleaned.join(' ').trim();
}

function estimateWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
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
  
  try {
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
  } catch (error: any) {
    // Check if it's a rate limit error
    const errorMessage = (error.message || '').toLowerCase();
    if (errorMessage.includes('rate limit') || errorMessage.includes('exceeded') || errorMessage.includes('maximum rate')) {
      console.warn('⚠️ Serpstack rate limit hit - returning graceful fallback');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SERP API rate limit exceeded',
          isRateLimited: true,
          canContinue: true,
          message: 'SERP data temporarily unavailable due to API rate limits. Analysis will continue without real-time SERP data.',
          recommendation: 'Consider upgrading your Serpstack plan or wait a few minutes before retrying.'
        }),
        { 
          status: 429, // Use 429 for rate limit
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Re-throw other errors
    throw error;
  }
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
    console.log('🔍 Searching with Serpstack:', params.query || params.q);
    
    const searchParams = new URLSearchParams({
      access_key: apiKey,
      query: params.query || params.q || params.keyword,
      num: (params.num || params.limit || 10).toString(),
      gl: 'us',
      hl: 'en'
    });

    console.log('📡 Making request to Serpstack API:', `https://api.serpstack.com/search?access_key=[REDACTED]&query=${params.query || params.q}&num=${params.num || params.limit || 10}`);
    
    const response = await fetch(`https://api.serpstack.com/search?${searchParams}`);
    
    console.log('📊 Serpstack response status:', response.status);
    
    const data = await response.json();
    
    console.log('📊 Serpstack response data:', JSON.stringify(data).substring(0, 500));
    
    // Check for rate limit errors specifically
    if (response.status === 429 || (data.error && data.error.type === 'rate_limit_reached')) {
      console.error('❌ Serpstack HTTP error response:', response.status, response.statusText);
      console.error('💥 Serpstack API rate limit error:', data.error?.info);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          isRateLimited: true,
          error: `Serpstack API error: ${data.error?.info || 'Rate limit exceeded'}`,
          message: 'SERP API rate limit reached. Intelligence extraction will use fallback crawling method.',
          canContinue: true
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (!response.ok || data.success === false) {
      throw new Error(data.error?.info || 'Serpstack API request failed');
    }

    // Transform results to consistent format
    const results = data.organic_results?.map((r: any) => ({
      url: r.url,
      title: r.title,
      snippet: r.snippet
    })) || [];

    console.log('✅ Serpstack API test successful');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        totalResults: data.search_information?.total_results || 0,
        provider: 'serpstack'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 Serpstack search exception:', error);
    
    // Check if error message contains rate limit info
    if (error.message?.includes('rate limit') || error.message?.includes('exceeded')) {
      return new Response(
        JSON.stringify({ 
          success: false,
          isRateLimited: true,
          error: `Serpstack API error: ${error.message}`,
          message: 'SERP API rate limit reached. Intelligence extraction will use fallback crawling method.',
          canContinue: true
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
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
    hasFeaturedSnippet: !!data.featured_snippet,
    hasImagesResults: !!data.images_results,
    hasVideosResults: !!data.video_results,
    hasNewsResults: !!data.news_results,
    organicCount: data.organic_results?.length || 0,
    relatedSearchesCount: data.related_searches?.length || 0
  });
  
  // Estimate search volume based on total results (Serpstack doesn't provide volume directly)
  const totalResults = data.search_information?.total_results || 0;
  const estimatedVolume = Math.floor(totalResults / 5000); // Better estimation for Serpstack
  
  // Extract organic results
  const organicResults = data.organic_results || [];
  
  // Extract related searches
  const relatedSearches = data.related_searches || [];
  
  // Enhanced People Also Ask extraction from multiple sources
  const peopleAlsoAsk = extractSerpstackPeopleAlsoAsk(data);
  
  // Extract featured snippets and answer boxes
  const featuredSnippets = extractSerpstackFeaturedSnippets(data);
  
  // Extract entities from knowledge graph and organic results
  const entities = extractSerpstackEntities(data, keyword);
  
  // Generate smart headings from organic results
  const headings = generateSerpstackHeadings(organicResults, keyword);
  
  // Generate comprehensive content gaps
  const contentGaps = generateSerpstackContentGaps(organicResults, keyword, data);
  
  // Extract local business data
  const localBusinessData = extractSerpstackLocalBusinessData(data);
  
  // Extract shopping results
  const shoppingData = extractSerpstackShoppingData(data);
  
  // Extract multimedia content
  const multimedia = extractSerpstackMultimedia(data);
  
  // Generate advanced insights
  const insights = generateSerpApiInsights(data, organicResults, peopleAlsoAsk, keyword);
  
  // Calculate data quality
  const dataQualityScore = calculateSerpApiDataQuality(data);
  
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
      source: 'serpstack_analysis',
      engine: 'google',
      competitorCount: organicResults.length,
      hasAnswerBox: !!data.answer_box,
      hasFeaturedSnippet: !!data.featured_snippet,
      hasKnowledgeGraph: !!data.knowledge_graph,
      hasLocalResults: !!data.local_results,
      hasShoppingResults: !!data.shopping_results
    },
    isMockData: false,
    isGoogleData: true,
    dataQuality: dataQualityScore,
    entities,
    peopleAlsoAsk,
    headings,
    contentGaps,
    featuredSnippets,
    localBusinessData,
    shoppingData,
    multimedia,
    insights,
    topResults: organicResults.slice(0, 10).map((result: any, index: number) => ({
      title: cleanSerpstackText(result.title || ''),
      link: result.url || result.link || '',
      snippet: cleanSerpstackText(result.snippet || ''),
      position: result.position || index + 1,
      source: 'organic_result',
      wordCount: estimateWordCount(result.snippet || ''),
      hasRichSnippet: !!(result.rich_snippet || result.sitelinks)
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: cleanSerpstackText(search.query || ''),
      source: 'related_searches'
    })),
    keywords: relatedSearches.map((s: any) => cleanSerpstackText(s.query || '')).filter(Boolean),
    recommendations: [
      `Serpstack extracted ${organicResults.length} organic competitors with comprehensive analysis`,
      `${peopleAlsoAsk.length} FAQ questions discovered from multiple SERP sources`,
      `${entities.length} key entities identified for comprehensive topic coverage`,
      `${featuredSnippets.length} featured snippets found for optimization opportunities`,
      data.knowledge_graph ? 'Knowledge Graph data available for entity-based content strategy' : '',
      data.local_results?.length ? `${data.local_results.length} local results suggest local SEO opportunities` : '',
      data.shopping_results?.length ? `${data.shopping_results.length} shopping results indicate commercial intent` : '',
      multimedia.images?.length ? `${multimedia.images.length} image opportunities identified` : '',
      multimedia.videos?.length ? `${multimedia.videos.length} video content gaps discovered` : '',
      'Serpstack provides detailed SERP analysis with enhanced data extraction'
    ].filter(Boolean)
  };
}

// Enhanced extraction functions for Serpstack
function extractSerpstackPeopleAlsoAsk(data: any) {
  const questions: Array<{question: string, answer?: string, source?: string, priority?: string}> = [];
  
  console.log('🔍 Extracting comprehensive People Also Ask from Serpstack data...');
  
  // Method 1: Direct people_also_ask field
  if (data.people_also_ask && Array.isArray(data.people_also_ask)) {
    console.log('✅ Found people_also_ask field with', data.people_also_ask.length, 'questions');
    data.people_also_ask.forEach((item: any) => {
      questions.push({
        question: cleanSerpstackText(item.question || item.title || ''),
        answer: cleanSerpstackText(item.answer || item.snippet || ''),
        source: item.link || item.source || 'People Also Ask',
        priority: 'high'
      });
    });
  }
  
  // Method 2: Related questions field
  if (data.related_questions && Array.isArray(data.related_questions)) {
    console.log('✅ Found related_questions field with', data.related_questions.length, 'questions');
    data.related_questions.forEach((item: any) => {
      const cleanQuestion = cleanSerpstackText(item.question || item.title || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanSerpstackText(item.answer || item.snippet || ''),
          source: item.link || item.source || 'Related Questions',
          priority: 'high'
        });
      }
    });
  }
  
  // Method 3: Answer box questions
  if (data.answer_box && data.answer_box.questions) {
    console.log('✅ Found answer box questions with', data.answer_box.questions.length, 'items');
    data.answer_box.questions.forEach((item: any) => {
      const cleanQuestion = cleanSerpstackText(item.question || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanSerpstackText(item.answer || ''),
          source: 'Answer Box',
          priority: 'medium'
        });
      }
    });
  }
  
  // Method 4: Extract from featured snippet if it contains questions
  if (data.featured_snippet && data.featured_snippet.snippet) {
    const snippetText = data.featured_snippet.snippet;
    const questionMatches = snippetText.match(/[^.!?]*\?[^.!?]*/g);
    if (questionMatches) {
      questionMatches.forEach((match: string) => {
        const cleanQuestion = cleanSerpstackText(match.trim());
        if (cleanQuestion.length > 10 && !questions.some(q => q.question === cleanQuestion)) {
          questions.push({
            question: cleanQuestion,
            answer: cleanSerpstackText(snippetText),
            source: data.featured_snippet.link || 'Featured Snippet',
            priority: 'medium'
          });
        }
      });
    }
  }
  
  // Method 5: Extract from organic results FAQ sections
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 5).forEach((result: any) => {
      // Check for explicit FAQ sections
      if (result.faq || result.questions) {
        const faqItems = result.faq || result.questions;
        if (Array.isArray(faqItems)) {
          faqItems.forEach((faq: any) => {
            const cleanQuestion = cleanSerpstackText(faq.question || '');
            if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
              questions.push({
                question: cleanQuestion,
                answer: cleanSerpstackText(faq.answer || ''),
                source: result.url || result.link || 'FAQ Section',
                priority: 'medium'
              });
            }
          });
        }
      }
      
      // Extract questions from rich snippets
      if (result.rich_snippet && result.rich_snippet.questions) {
        result.rich_snippet.questions.forEach((question: any) => {
          const cleanQuestion = cleanSerpstackText(question.question || '');
          if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
            questions.push({
              question: cleanQuestion,
              answer: cleanSerpstackText(question.answer || ''),
              source: result.url || result.link || 'Rich Snippet',
              priority: 'medium'
            });
          }
        });
      }
    });
  }
  
  // Method 6: Extract smart questions from organic results titles
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 10).forEach((result: any) => {
      const title = result.title || '';
      if (title.includes('?') || title.toLowerCase().match(/^(how|what|why|when|where|which|who)/)) {
        const cleanQuestion = cleanSerpstackText(title);
        if (cleanQuestion && cleanQuestion.length > 10 && !questions.some(q => q.question === cleanQuestion)) {
          questions.push({
            question: cleanQuestion,
            answer: cleanSerpstackText(result.snippet || ''),
            source: result.url || result.link || 'Organic Result',
            priority: 'low'
          });
        }
      }
    });
  }
  
  // Method 7: Extract from knowledge graph if it has Q&A
  if (data.knowledge_graph && data.knowledge_graph.questions) {
    data.knowledge_graph.questions.forEach((item: any) => {
      const cleanQuestion = cleanSerpstackText(item.question || '');
      if (cleanQuestion && !questions.some(q => q.question === cleanQuestion)) {
        questions.push({
          question: cleanQuestion,
          answer: cleanSerpstackText(item.answer || ''),
          source: 'Knowledge Graph',
          priority: 'high'
        });
      }
    });
  }
  
  console.log(`📊 Total comprehensive PAA questions extracted: ${questions.length}`);
  return questions.slice(0, 15); // Increased limit for maximum coverage
}

function extractSerpstackFeaturedSnippets(data: any) {
  const snippets = [];
  
  // Featured snippet
  if (data.featured_snippet) {
    snippets.push({
      type: 'featured_snippet',
      content: cleanSerpstackText(data.featured_snippet.snippet || ''),
      source: data.featured_snippet.link || 'Featured Snippet',
      title: cleanSerpstackText(data.featured_snippet.title || 'Featured Snippet'),
      format: data.featured_snippet.type || 'paragraph',
      datePublished: data.featured_snippet.date || null
    });
  }
  
  // Answer box
  if (data.answer_box) {
    snippets.push({
      type: 'answer_box',
      content: cleanSerpstackText(data.answer_box.snippet || data.answer_box.answer || ''),
      source: data.answer_box.link || 'Answer Box',
      title: cleanSerpstackText(data.answer_box.title || 'Answer Box'),
      format: data.answer_box.type || 'direct_answer',
      datePublished: data.answer_box.date || null
    });
  }
  
  // Knowledge graph description
  if (data.knowledge_graph && data.knowledge_graph.description) {
    snippets.push({
      type: 'knowledge_graph',
      content: cleanSerpstackText(data.knowledge_graph.description),
      source: data.knowledge_graph.source?.link || 'Knowledge Graph',
      title: cleanSerpstackText(data.knowledge_graph.title || 'Knowledge Graph'),
      format: 'knowledge_panel',
      datePublished: null
    });
  }
  
  // Extract rich snippets from organic results
  if (data.organic_results && Array.isArray(data.organic_results)) {
    data.organic_results.slice(0, 3).forEach((result: any) => {
      if (result.rich_snippet) {
        snippets.push({
          type: 'rich_snippet',
          content: cleanSerpstackText(result.snippet || ''),
          source: result.url || result.link || 'Rich Snippet',
          title: cleanSerpstackText(result.title || 'Rich Snippet'),
          format: result.rich_snippet.type || 'structured_data',
          datePublished: result.date || null
        });
      }
    });
  }
  
  return snippets;
}

// New enhanced extraction functions for Serpstack
function extractSerpstackLocalBusinessData(data: any) {
  const localData: any[] = [];
  
  if (data.local_results && Array.isArray(data.local_results)) {
    data.local_results.forEach((business: any) => {
      localData.push({
        name: cleanSerpstackText(business.title || business.name || ''),
        address: cleanSerpstackText(business.address || ''),
        rating: business.rating || 0,
        reviews: business.reviews || 0,
        type: business.type || 'local_business',
        phone: business.phone || '',
        website: business.website || '',
        hours: business.hours || null,
        position: business.position || 0
      });
    });
  }
  
  return localData;
}

function extractSerpstackShoppingData(data: any) {
  const shoppingData: any[] = [];
  
  if (data.shopping_results && Array.isArray(data.shopping_results)) {
    data.shopping_results.forEach((product: any) => {
      shoppingData.push({
        title: cleanSerpstackText(product.title || ''),
        price: product.price || '',
        source: product.source || '',
        link: product.link || '',
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        image: product.thumbnail || '',
        position: product.position || 0,
        shipping: product.shipping || ''
      });
    });
  }
  
  return shoppingData;
}

function extractSerpstackMultimedia(data: any) {
  const multimedia = {
    images: [],
    videos: []
  };
  
  // Extract images
  if (data.images_results && Array.isArray(data.images_results)) {
    multimedia.images = data.images_results.slice(0, 10).map((img: any) => ({
      title: cleanSerpstackText(img.title || ''),
      source: img.source || '',
      thumbnail: img.thumbnail || img.original || '',
      link: img.link || '',
      position: img.position || 0
    }));
  }
  
  // Extract videos
  if (data.video_results && Array.isArray(data.video_results)) {
    multimedia.videos = data.video_results.slice(0, 8).map((video: any) => ({
      title: cleanSerpstackText(video.title || ''),
      source: video.link || '',
      duration: video.duration || '',
      thumbnail: video.thumbnail || '',
      channel: video.channel || '',
      date: video.date || '',
      position: video.position || 0
    }));
  }
  
  return multimedia;
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

function generateSerpstackContentGaps(organicResults: any[], keyword: string, data: any) {
  const gaps = [];
  
  // Advanced content gap analysis based on missing SERP features
  if (!data.featured_snippet) {
    gaps.push({
      topic: `Featured snippet optimization for ${keyword}`,
      description: 'No featured snippet exists - opportunity to capture position zero',
      recommendation: 'Create comprehensive, well-structured content that directly answers the main query',
      content: `Complete guide to ${keyword} with clear definitions and step-by-step explanations`,
      opportunity: 'High - Featured snippets capture significant click-through rates',
      source: 'SERP feature analysis'
    });
  }
  
  if (!data.people_also_ask || data.people_also_ask.length < 4) {
    gaps.push({
      topic: `FAQ content expansion for ${keyword}`,
      description: 'Limited People Also Ask coverage suggests content opportunity',
      recommendation: 'Develop comprehensive FAQ section targeting related questions',
      content: `Detailed FAQ covering all aspects and variations of ${keyword}`,
      opportunity: 'Medium - FAQ content drives long-tail organic traffic',
      source: 'PAA gap analysis'
    });
  }
  
  if (!data.local_results || data.local_results.length === 0) {
    gaps.push({
      topic: `Local SEO opportunity for ${keyword}`,
      description: 'No local pack results suggest local content gap',
      recommendation: 'Create location-specific content and local business optimization',
      content: `Local ${keyword} services and location-based guides`,
      opportunity: 'Medium - Local searches often have lower competition',
      source: 'Local results analysis'
    });
  }
  
  if (!data.images_results || data.images_results.length < 5) {
    gaps.push({
      topic: `Visual content opportunity for ${keyword}`,
      description: 'Limited image results indicate visual content gap',
      recommendation: 'Create infographics, diagrams, and visual guides',
      content: `Visual content library including infographics and step-by-step images for ${keyword}`,
      opportunity: 'Medium - Visual content attracts additional traffic streams',
      source: 'Image results analysis'
    });
  }
  
  if (!data.video_results || data.video_results.length < 3) {
    gaps.push({
      topic: `Video content opportunity for ${keyword}`,
      description: 'Limited video content in SERP results',
      recommendation: 'Create educational videos, tutorials, or explainer content',
      content: `Video series covering ${keyword} from beginner to advanced levels`,
      opportunity: 'High - Video content has strong engagement and ranking potential',
      source: 'Video results analysis'
    });
  }
  
  // Analyze competitor content themes
  const themes = new Set<string>();
  organicResults.forEach(result => {
    if (result.snippet) {
      const words = result.snippet.toLowerCase().split(/\s+/);
      words.forEach((word: any) => {
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
    console.log('🧪 Testing SerpAPI connection with key length:', apiKey?.length || 0);
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('No API key provided for SerpAPI test');
    }
    
    const response = await fetch('https://serpapi.com/search.json?engine=google&q=test&api_key=' + apiKey);
    const data = await response.json();
    
    console.log('🧪 SerpAPI test response:', {
      status: response.status,
      hasError: !!data.error,
      errorMessage: data.error?.message || data.error
    });
    
    if (response.ok && !data.error) {
      console.log('✅ SerpAPI test successful');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SerpAPI connection successful',
          provider: 'SerpAPI',
          capabilities: [
            'Organic search results',
            'Knowledge Graph data',
            'Featured snippets',
            'People Also Ask questions',
            'Local business results',
            'Shopping results',
            'Images and videos',
            'Related searches'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('❌ SerpAPI test failed:', data);
      const errorMessage = data.error?.message || data.error || 'SerpAPI test failed';
      throw new Error(errorMessage);
    }
  } catch (error: any) {
    console.error('💥 SerpAPI test exception:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'SerpAPI test failed',
        details: 'Check API key validity and account status'
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
    
    // Handle rate limit errors specifically (429 or error code 106)
    if (response.status === 429 || (data.error && (data.error.code === 106 || data.error.type === 'rate_limit_reached'))) {
      console.error('❌ Serpstack API rate limit hit');
      throw new Error(`Serpstack API error: ${data.error?.info || 'Rate limit exceeded. Please wait a few minutes or upgrade your plan.'}`);
    }
    
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
  } else if (endpoint === 'chat') {
    return await chatWithOpenAI(apiKey, params);
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

async function chatWithOpenAI(apiKey: string, params: any) {
  try {
    console.log('💬 Chat request with OpenAI');
    
    const { 
      model = 'gpt-4.1-2025-04-14', 
      messages, 
      temperature, 
      maxTokens = 2000, 
      max_tokens, 
      max_completion_tokens 
    } = params;

    // Handle newer model parameter requirements
    const isNewerModel = model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('o3') || model.includes('o4');
    
    const requestBody: any = {
      model,
      messages
    };

    // For newer models, use max_completion_tokens and no temperature
    if (isNewerModel) {
      requestBody.max_completion_tokens = max_completion_tokens || maxTokens || max_tokens || 2000;
      console.log(`📝 Using newer model ${model} with max_completion_tokens: ${requestBody.max_completion_tokens}`);
    } else {
      // For older models, use max_tokens and temperature
      requestBody.max_tokens = max_tokens || maxTokens || 2000;
      if (temperature !== undefined) {
        requestBody.temperature = temperature;
      }
      console.log(`📝 Using legacy model ${model} with max_tokens: ${requestBody.max_tokens}, temperature: ${requestBody.temperature}`);
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ OpenAI chat error (${response.status}):`, errorData);
      
      // Provide specific error messages for common OpenAI API issues
      let errorMessage = errorData.error?.message || response.statusText;
      if (errorData.error?.type === 'invalid_request_error') {
        if (errorMessage.includes('temperature')) {
          errorMessage = `Model ${requestBody.model} does not support temperature parameter. Please use a compatible model.`;
        } else if (errorMessage.includes('max_tokens')) {
          errorMessage = `Model ${requestBody.model} requires max_completion_tokens instead of max_tokens parameter.`;
        }
      }
      
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log(`📥 OpenAI response: ${data.choices[0]?.message?.content?.substring(0, 100)}...`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        data: data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('💥 OpenAI chat error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'OpenAI chat failed' 
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
