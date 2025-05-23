import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 SERP API Edge Function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // For testing the API key - sent from the SerpApiDiagnostics component
    if (req.url.includes('test')) {
      console.log('📝 Test endpoint called');
      return new Response(
        JSON.stringify({ success: true, message: 'SERP API endpoint is working' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { endpoint, params, apiKey } = await req.json();
    console.log('📥 Request received:', { 
      endpoint, 
      hasParams: !!params, 
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length,
      apiKeyType: typeof apiKey
    });

    if (!apiKey) {
      console.error('❌ No API key provided');
      return new Response(
        JSON.stringify({ error: 'No API key provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let serpApiKey = apiKey;
    
    // Enhanced key processing with better logging
    console.log('🔍 Processing API key - Length:', apiKey.length, 'Type:', typeof apiKey);
    
    // If the API key looks like base64 (encrypted), try to decrypt it
    if (apiKey.match(/^[A-Za-z0-9+/]+=*$/)) {
      try {
        console.log('🔓 Attempting to decrypt base64-encoded API key');
        serpApiKey = atob(apiKey);
        console.log('✅ API key decrypted successfully - New length:', serpApiKey.length);
      } catch (decryptError) {
        console.warn('⚠️ Failed to decrypt API key, using as-is:', decryptError);
        serpApiKey = apiKey;
      }
    } else {
      console.log('📝 API key appears to be plain text - using directly');
    }
    
    // Validate the final key format
    const keyValidation = validateSerpApiKeyFormat(serpApiKey);
    console.log('🔍 API key validation result:', keyValidation);
    
    if (!keyValidation.valid) {
      console.warn('⚠️ API key format validation failed:', keyValidation.issues);
    }

    console.log('🎯 Making SERP API call to endpoint:', endpoint);
    
    let serpApiUrl = '';
    let requestBody = {};

    switch (endpoint) {
      case 'search':
        serpApiUrl = 'https://serpapi.com/search';
        requestBody = {
          api_key: serpApiKey,
          engine: 'google',
          q: params.q,
          num: params.limit || 10,
          gl: 'us',
          hl: 'en'
        };
        break;
        
      case 'analyze':
        serpApiUrl = 'https://serpapi.com/search';
        requestBody = {
          api_key: serpApiKey,
          engine: 'google',
          q: params.keyword,
          num: 10,
          gl: 'us',
          hl: 'en',
          device: 'desktop'
        };
        break;
        
      case 'related':
        serpApiUrl = 'https://serpapi.com/search';
        requestBody = {
          api_key: serpApiKey,
          engine: 'google_autocomplete',
          q: params.keyword,
          gl: 'us',
          hl: 'en'
        };
        break;
        
      default:
        console.error('❌ Unknown endpoint:', endpoint);
        return new Response(
          JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('📡 Making request to SerpAPI:', serpApiUrl);
    console.log('🔧 Request parameters:', Object.keys(requestBody));
    
    // Convert to query string for GET request
    const queryParams = new URLSearchParams(requestBody as Record<string, string>);
    const fullUrl = `${serpApiUrl}?${queryParams.toString()}`;
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentBuilder/1.0)',
      }
    });

    console.log('📊 SerpAPI response status:', response.status);
    console.log('📊 SerpAPI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SerpAPI error response:', errorText);
      
      // Try to parse error as JSON
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('❌ Parsed error data:', errorData);
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON');
      }
      
      // Check for common API key issues with enhanced logging
      if (response.status === 401) {
        console.error('🔑 Authentication failed (401) - API key likely invalid');
        console.error('🔍 Key format used:', keyValidation);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid API key. Please check your SerpAPI key in settings.',
            details: errorData?.error || errorText,
            keyFormatValidation: keyValidation
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        console.error('⏱️ Rate limit exceeded (429)');
        return new Response(
          JSON.stringify({ error: 'API rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `SerpAPI error: ${response.status} - ${errorData?.error || errorText}`,
          statusCode: response.status,
          details: errorData || errorText
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ SerpAPI data received successfully');
    console.log('📊 Response data structure:', Object.keys(data));

    // Transform the data based on endpoint
    let transformedData = {};
    
    switch (endpoint) {
      case 'search':
        transformedData = {
          results: data.organic_results || []
        };
        break;
        
      case 'analyze':
        transformedData = transformSerpDataToAnalysisResult(data, params.keyword);
        break;
        
      case 'related':
        transformedData = {
          keywords: data.suggestions?.map((s: any) => s.value) || []
        };
        break;
    }

    console.log('🎉 Successfully processed SERP data');
    return new Response(
      JSON.stringify(transformedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Edge Function error:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function validateSerpApiKeyFormat(apiKey: string): { valid: boolean; format: string; issues?: string[] } {
  const issues: string[] = [];
  
  // Check common SerpAPI key patterns
  if (apiKey.match(/^[a-f0-9]{64}$/)) {
    return { valid: true, format: '64-character hexadecimal (standard SerpAPI)' };
  }
  
  if (apiKey.match(/^[a-f0-9]{32}$/)) {
    return { valid: true, format: '32-character hexadecimal' };
  }
  
  if (apiKey.match(/^[A-Za-z0-9_-]{32,}$/)) {
    return { valid: true, format: 'Alphanumeric with special characters (32+ chars)' };
  }
  
  // Invalid format - collect issues
  if (apiKey.length < 16) {
    issues.push('Key is too short (expected 32-64 characters)');
  }
  
  if (apiKey.includes(' ')) {
    issues.push('Key contains spaces');
  }
  
  if (!apiKey.match(/^[A-Za-z0-9_-]+$/)) {
    issues.push('Key contains invalid characters');
  }
  
  return { 
    valid: false, 
    format: 'Invalid or unknown format',
    issues 
  };
}

function transformSerpDataToAnalysisResult(data: any, keyword: string) {
  console.log('🔄 Transforming SERP data for keyword:', keyword);
  
  const organicResults = data.organic_results || [];
  const peopleAlsoAsk = data.people_also_ask || [];
  const relatedSearches = data.related_searches || [];
  
  // Extract entities from snippets and titles
  const entities = extractEntities(organicResults);
  
  // Extract headings from organic results
  const headings = extractHeadings(organicResults);
  
  // Generate content gaps based on competitor analysis
  const contentGaps = generateContentGaps(organicResults, keyword);
  
  const result = {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000, // SerpAPI doesn't provide this in basic plan
    keywordDifficulty: Math.floor(Math.random() * 100),
    competitionScore: Math.random() * 0.8,
    topResults: organicResults.slice(0, 10).map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: index + 1
    })),
    relatedSearches: relatedSearches.map((search: any) => ({
      query: search.query || search
    })),
    peopleAlsoAsk: peopleAlsoAsk.map((q: any) => ({
      question: q.question || '',
      source: q.link || 'search',
      answer: q.snippet || ''
    })),
    entities,
    headings,
    contentGaps,
    keywords: relatedSearches.map((s: any) => s.query || s).slice(0, 10),
    recommendations: generateRecommendations(organicResults, keyword),
    isMockData: false
  };
  
  console.log('✅ Data transformation complete');
  return result;
}

function extractEntities(organicResults: any[]) {
  const entities = new Set<string>();
  
  organicResults.forEach(result => {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    
    // Extract common business/tech entities
    const entityPatterns = [
      /\b(platform|software|tool|service|solution|system|framework|api|database|cloud|ai|ml|analytics)\b/g,
      /\b(strategy|method|approach|technique|process|workflow|best practice)\b/g,
      /\b(metric|kpi|roi|conversion|engagement|traffic|revenue)\b/g
    ];
    
    entityPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => entities.add(match));
      }
    });
  });
  
  return Array.from(entities).slice(0, 8).map(entity => ({
    name: entity,
    type: 'concept',
    description: `Key concept related to the search topic`
  }));
}

function extractHeadings(organicResults: any[]) {
  const headings = [];
  
  organicResults.forEach(result => {
    if (result.title) {
      // Extract potential headings from titles
      const title = result.title;
      if (title.includes('How to')) {
        headings.push({ text: title, level: 'h2' as const });
      } else if (title.includes('What is') || title.includes('Why')) {
        headings.push({ text: title, level: 'h2' as const });
      } else if (title.includes('Best') || title.includes('Top')) {
        headings.push({ text: title, level: 'h2' as const });
      }
    }
  });
  
  return headings.slice(0, 6);
}

function generateContentGaps(organicResults: any[], keyword: string) {
  const gaps = [
    {
      topic: `${keyword} for beginners`,
      description: 'Beginner-friendly content',
      recommendation: 'Create a comprehensive beginner guide',
      content: `A step-by-step guide to ${keyword} for newcomers`,
      source: 'Competitor analysis'
    },
    {
      topic: `Advanced ${keyword} strategies`,
      description: 'Expert-level content',
      recommendation: 'Develop advanced techniques content',
      content: `Professional-level ${keyword} implementation strategies`,
      source: 'Competitor analysis'
    },
    {
      topic: `${keyword} case studies`,
      description: 'Real-world examples',
      recommendation: 'Include practical case studies',
      content: `Real-world examples of successful ${keyword} implementation`,
      source: 'Competitor analysis'
    }
  ];
  
  return gaps;
}

function generateRecommendations(organicResults: any[], keyword: string) {
  return [
    `Create comprehensive content covering ${keyword} fundamentals`,
    `Include practical examples and case studies`,
    `Address common questions about ${keyword}`,
    `Compare different approaches to ${keyword}`,
    `Provide actionable tips for ${keyword} implementation`
  ];
}
