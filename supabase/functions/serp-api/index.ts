
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params, apiKey } = await req.json();
    
    console.log('🚀 SERP API Edge Function called');
    console.log('📥 Request received:', {
      endpoint,
      hasParams: !!params,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyType: typeof apiKey
    });

    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Validate API key format
    console.log('🔍 Using API key directly - Length:', apiKey.length, 'Type:', typeof apiKey);
    const isValidKey = validateApiKey(apiKey);
    console.log('🔍 API key validation result:', isValidKey);

    if (!isValidKey.valid) {
      throw new Error(`Invalid API key format: ${isValidKey.format}`);
    }

    let response;
    let data;

    if (endpoint === 'analyze') {
      console.log('🎯 Making SERP API call to endpoint: analyze');
      
      // For keyword analysis, we'll make multiple calls to get comprehensive Google data
      const keyword = params.keyword;
      
      // 1. First get Google search results
      const searchParams = new URLSearchParams({
        api_key: apiKey,
        engine: 'google',
        q: keyword,
        num: '10',
        gl: 'us',
        hl: 'en',
        device: 'desktop'
      });

      console.log('🔧 Request parameters:', Object.keys(Object.fromEntries(searchParams)));
      console.log('📡 Making request to SerpAPI: https://serpapi.com/search');

      response = await fetch(`https://serpapi.com/search?${searchParams}`);
      console.log('📊 SerpAPI response status:', response.status);
      console.log('📊 SerpAPI response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
      }

      const searchData = await response.json();
      console.log('✅ SerpAPI data received successfully');
      console.log('📊 Response data structure:', Object.keys(searchData || {}));

      // 2. Try to get Google Keyword Planner volume data
      let volumeData = null;
      try {
        const volumeParams = new URLSearchParams({
          api_key: apiKey,
          engine: 'google_keyword_planner',
          keywords: keyword,
          location: 'United States',
          language: 'en'
        });

        const volumeResponse = await fetch(`https://serpapi.com/search?${volumeParams}`);
        if (volumeResponse.ok) {
          volumeData = await volumeResponse.json();
          console.log('✅ Google Keyword Planner data retrieved');
        } else {
          console.log('⚠️ Google Keyword Planner data not available, using search results');
        }
      } catch (volumeError) {
        console.log('⚠️ Google Keyword Planner API call failed:', volumeError);
      }

      // 3. Transform and enhance the data with Google-specific metrics
      data = transformSerpDataWithGoogleVolume(searchData, volumeData, keyword);
      
    } else if (endpoint === 'search') {
      console.log('🎯 Making SERP API call to endpoint: search');
      
      const searchParams = new URLSearchParams({
        api_key: apiKey,
        engine: 'google', // Explicitly force Google
        q: params.q || params.keyword,
        num: (params.limit || 10).toString(),
        gl: 'us', // Google country
        hl: 'en'  // Google language
      });

      console.log('🔧 Request parameters:', Object.keys(Object.fromEntries(searchParams)));
      console.log('📡 Making request to SerpAPI: https://serpapi.com/search');

      response = await fetch(`https://serpapi.com/search?${searchParams}`);
      console.log('📊 SerpAPI response status:', response.status);
      console.log('📊 SerpAPI response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
      console.log('✅ SerpAPI data received successfully');
      console.log('📊 Response data structure:', Object.keys(data || {}));
    } else {
      throw new Error(`Unsupported endpoint: ${endpoint}`);
    }

    // Add detailed logging for debugging
    logDetailedSerpResponse(data);

    console.log('🎉 Successfully processed SERP data');
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in SERP API function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString(),
      source: 'serp-api-edge-function'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function validateApiKey(apiKey: string): { valid: boolean; format: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, format: 'API key must be a string' };
  }
  
  // SerpAPI keys are typically 64-character hexadecimal strings
  if (apiKey.length === 64 && /^[a-f0-9]+$/i.test(apiKey)) {
    return { valid: true, format: '64-character hexadecimal (standard SerpAPI)' };
  }
  
  // Some keys might be different formats
  if (apiKey.length >= 32) {
    return { valid: true, format: 'Alternative format API key' };
  }
  
  return { valid: false, format: 'Invalid API key format' };
}

function transformSerpDataWithGoogleVolume(searchData: any, volumeData: any, keyword: string) {
  console.log('🔄 Transforming SERP data with Google volume for keyword:', keyword);
  
  // Extract Google-specific search volume
  let googleSearchVolume = 0;
  let volumeSource = 'estimated';
  let volumeConfidence = 'low';
  
  if (volumeData && volumeData.keyword_stats && volumeData.keyword_stats.length > 0) {
    // Use Google Keyword Planner data if available
    const keywordStats = volumeData.keyword_stats[0];
    googleSearchVolume = keywordStats.avg_monthly_searches || 0;
    volumeSource = 'google_keyword_planner';
    volumeConfidence = 'high';
    console.log('✅ Using Google Keyword Planner volume:', googleSearchVolume);
  } else if (searchData.search_information?.total_results) {
    // Fallback to estimated volume based on search results
    const totalResults = searchData.search_information.total_results;
    googleSearchVolume = Math.floor(totalResults / 1000); // Rough estimation
    volumeSource = 'google_search_results_estimate';
    volumeConfidence = 'medium';
    console.log('⚠️ Using estimated volume from Google search results:', googleSearchVolume);
  } else {
    // Generate a reasonable mock volume for demo purposes
    googleSearchVolume = Math.floor(Math.random() * 50000) + 5000;
    volumeSource = 'mock_google_estimate';
    volumeConfidence = 'low';
    console.log('⚠️ Using mock Google volume estimate:', googleSearchVolume);
  }

  // Extract Google-specific competition data
  let competitionScore = 0.5; // Default medium competition
  let competitionSource = 'estimated';
  
  if (volumeData && volumeData.keyword_stats && volumeData.keyword_stats.length > 0) {
    const keywordStats = volumeData.keyword_stats[0];
    // Convert Google Ads competition to score
    const competition = keywordStats.competition_level || 'MEDIUM';
    competitionScore = competition === 'LOW' ? 0.3 : competition === 'HIGH' ? 0.8 : 0.5;
    competitionSource = 'google_ads_competition';
  } else {
    // Estimate competition based on results
    const organicCount = searchData.organic_results?.length || 0;
    competitionScore = Math.min(organicCount / 10, 0.9);
    competitionSource = 'google_results_estimate';
  }

  // Extract detailed Google SERP data
  const extractedData = extractGoogleSerpFeatures(searchData);
  
  // Build comprehensive Google-focused response
  const transformedData = {
    keyword,
    searchVolume: googleSearchVolume,
    competitionScore,
    keywordDifficulty: Math.min(Math.floor(competitionScore * 100 + Math.random() * 20), 100),
    volumeMetadata: {
      source: volumeSource,
      confidence: volumeConfidence,
      engine: 'google',
      location: 'United States',
      language: 'English',
      lastUpdated: new Date().toISOString()
    },
    competitionMetadata: {
      source: competitionSource,
      engine: 'google',
      adsCompetition: volumeData?.keyword_stats?.[0]?.competition_level || 'ESTIMATED'
    },
    isMockData: volumeSource.includes('mock'),
    isGoogleData: true,
    dataQuality: volumeConfidence,
    ...extractedData
  };

  console.log('✅ Enhanced data transformation complete');
  
  return transformedData;
}

function extractGoogleSerpFeatures(data: any) {
  console.log('🔍 Extracting Google SERP features');
  
  const features = {
    entities: [],
    peopleAlsoAsk: [],
    headings: [],
    contentGaps: [],
    topResults: [],
    relatedSearches: [],
    keywords: [],
    recommendations: [],
    featuredSnippets: []
  };

  // Extract People Also Ask from Google results
  if (data.related_questions && data.related_questions.length > 0) {
    console.log('Processing Google related_questions data');
    data.related_questions.forEach((item: any, index: number) => {
      if (item.question) {
        features.peopleAlsoAsk.push({
          question: item.question,
          answer: item.snippet || '',
          source: 'google_people_also_ask',
          position: index + 1
        });
      }
    });
    console.log('✅ Extracted', features.peopleAlsoAsk.length, 'Google PAA questions');
  }

  // Extract Featured Snippets from Google
  console.log('🔍 Extracting Google Featured Snippets');
  if (data.answer_box) {
    features.featuredSnippets.push({
      title: data.answer_box.title || 'Featured Snippet',
      content: data.answer_box.snippet || data.answer_box.answer || '',
      source: data.answer_box.link || '',
      type: 'google_featured_snippet'
    });
  }
  
  if (data.knowledge_graph) {
    features.featuredSnippets.push({
      title: data.knowledge_graph.title || 'Knowledge Graph',
      content: data.knowledge_graph.description || '',
      source: 'google_knowledge_graph',
      type: 'google_knowledge_graph'
    });
  }
  console.log('✅ Extracted', features.featuredSnippets.length, 'Google featured snippets');

  // Extract organic results from Google
  if (data.organic_results && data.organic_results.length > 0) {
    features.topResults = data.organic_results.slice(0, 5).map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: result.position || index + 1,
      source: 'google_organic'
    }));
  }

  // Extract related searches from Google
  if (data.related_searches && data.related_searches.length > 0) {
    features.relatedSearches = data.related_searches.map((search: any) => ({
      query: search.query || '',
      source: 'google_related_searches'
    }));
    
    features.keywords = features.relatedSearches.map(s => s.query);
  }

  // Generate content recommendations based on Google data
  features.recommendations = [
    'Optimize for Google Featured Snippets based on current SERP layout',
    'Target Google People Also Ask questions for better visibility',
    'Focus on Google organic ranking factors for this keyword',
    'Consider Google Ads competition levels in content strategy'
  ];

  // Extract entities from Google Knowledge Graph
  if (data.knowledge_graph && data.knowledge_graph.title) {
    features.entities.push({
      name: data.knowledge_graph.title,
      type: data.knowledge_graph.type || 'entity',
      description: data.knowledge_graph.description || '',
      source: 'google_knowledge_graph'
    });
  }

  // Generate content gaps based on Google SERP analysis
  if (features.peopleAlsoAsk.length > 0) {
    features.contentGaps.push({
      topic: 'Answer Google People Also Ask questions',
      description: 'Address common questions appearing in Google SERP',
      recommendation: 'Create FAQ section targeting these questions',
      content: 'Comprehensive answers to user questions',
      source: 'google_paa_analysis'
    });
  }

  if (features.featuredSnippets.length > 0) {
    features.contentGaps.push({
      topic: 'Target Google Featured Snippet opportunity',
      description: 'Optimize content for featured snippet capture',
      recommendation: 'Structure content for snippet optimization',
      content: 'Clear, concise answers in structured format',
      source: 'google_snippet_analysis'
    });
  }

  console.log('📊 Google SERP feature extraction results:', {
    peopleAlsoAskCount: features.peopleAlsoAsk.length,
    featuredSnippetsCount: features.featuredSnippets.length,
    entitiesCount: features.entities.length,
    headingsCount: features.headings.length,
    contentGapsCount: features.contentGaps.length
  });

  return features;
}

function logDetailedSerpResponse(data: any) {
  if (!data) return;

  const analysis = {
    topLevelKeys: Object.keys(data),
    hasKnowledgeGraph: !!data.knowledge_graph,
    knowledgeGraphKeys: data.knowledge_graph ? Object.keys(data.knowledge_graph) : null,
    hasAnswerBox: !!data.answer_box,
    answerBoxKeys: data.answer_box ? Object.keys(data.answer_box) : null,
    hasPeopleAlsoAsk: !!data.people_also_ask,
    peopleAlsoAskCount: data.people_also_ask?.length || 0,
    peopleAlsoAskSample: data.people_also_ask?.[0] || null,
    hasRelatedQuestions: !!data.related_questions,
    relatedQuestionsCount: data.related_questions?.length || 0,
    relatedQuestionsSample: data.related_questions?.[0] || null,
    hasFeaturedSnippet: !!data.featured_snippet,
    featuredSnippetKeys: data.featured_snippet ? Object.keys(data.featured_snippet) : null,
    organicResultsCount: data.organic_results?.length || 0,
    organicResultSample: data.organic_results?.[0] ? {
      title: data.organic_results[0].title,
      hasSnippet: !!data.organic_results[0].snippet,
      hasSitelinks: !!data.organic_results[0].sitelinks,
      hasRichSnippet: !!data.organic_results[0].rich_snippet
    } : null,
    relatedSearchesCount: data.related_searches?.length || 0,
    relatedSearchesSample: data.related_searches?.[0] || null,
    hasLocalResults: !!data.local_results,
    localResultsType: data.local_results?.length ? 'local_pack' : null,
    hasShoppingResults: !!data.shopping_results,
    shoppingResultsCount: data.shopping_results?.length || 0,
    hasImages: !!data.images_results,
    imagesCount: data.images_results?.length || 0,
    hasVideos: !!data.inline_videos,
    videosCount: data.inline_videos?.length || 0,
    hasTopStories: !!data.top_stories,
    hasAds: !!data.ads,
    hasInlineImages: !!data.inline_images,
    hasRecipes: !!data.recipes,
    hasNews: !!data.news_results
  };

  console.log('🔍 DETAILED SERP API RESPONSE ANALYSIS:', analysis);
  
  if (data.related_questions && data.related_questions.length > 0) {
    console.log('🔍 RELATED QUESTIONS DETAILED DATA:', data.related_questions.slice(0, 2));
    const sample = data.related_questions[0];
    if (sample) {
      console.log('Sample related_questions item:', sample);
    }
  }
}
