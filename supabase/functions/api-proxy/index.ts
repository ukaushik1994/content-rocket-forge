import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// We'll still use these as fallbacks if available
const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, endpoint, params, apiKey, hasApiKey } = await req.json();
    
    console.log(`API Proxy: ${service} - ${endpoint}`, params);

    // New endpoint for testing API keys
    if (endpoint === 'test') {
      return await handleApiKeyTest(service, apiKey);
    }

    // Route to appropriate API service
    if (service === 'serp') {
      return await handleSerpRequest(endpoint, params, apiKey, hasApiKey);
    } else if (service === 'openai') {
      return await handleOpenAIRequest(endpoint, params, apiKey, hasApiKey);
    } else if (service === 'anthropic') {
      return await handleAnthropicRequest(endpoint, params, apiKey, hasApiKey);
    } else if (service === 'gemini') {
      return await handleGeminiRequest(endpoint, params, apiKey, hasApiKey);
    } else if (service === 'mistral') {
      return await handleMistralRequest(endpoint, params, apiKey, hasApiKey);
    } else {
      throw new Error(`Unsupported service: ${service}`);
    }
  } catch (error: any) {
    console.error(`API Proxy error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Handler for API key testing
async function handleApiKeyTest(service: string, apiKey: string) {
  console.log(`Testing ${service} API key`);
  
  try {
    if (!apiKey) {
      throw new Error('API key is required for testing');
    }
    
    if (service === 'serp') {
      // For SERP API, we'll make a test call with minimal parameters
      const url = new URL('https://serpapi.com/search');
      url.searchParams.append('q', 'test');
      url.searchParams.append('engine', 'google');
      url.searchParams.append('api_key', apiKey);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (response.ok) {
        return new Response(
          JSON.stringify({ success: true, message: 'SERP API connection successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(data.error || 'Invalid SERP API key');
      }
    } else if (service === 'openai') {
      // For OpenAI, validate format and make a simple test call
      if (!apiKey.startsWith('sk-')) {
        throw new Error('Invalid OpenAI API key format - must start with "sk-"');
      }
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return new Response(
          JSON.stringify({ success: true, message: 'OpenAI API connection successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(data.error?.message || 'Invalid OpenAI API key');
      }
    } else if (service === 'anthropic') {
      // For Anthropic, we'll make a test call to validate the key
      if (!apiKey.startsWith('sk-ant-')) {
        throw new Error('Invalid Anthropic API key format - must start with "sk-ant-"');
      }
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [
            { role: 'user', content: 'Say hi in one word' }
          ]
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return new Response(
          JSON.stringify({ success: true, message: 'Anthropic API connection successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(data.error?.message || 'Invalid Anthropic API key');
      }
    } else if (service === 'gemini') {
      // For Gemini, we'll try to make a test call to validate the key
      const apiBase = 'https://generativelanguage.googleapis.com/v1beta';
      const model = 'models/gemini-1.5-flash';
      const url = `${apiBase}/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say hi in one word'
            }]
          }]
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return new Response(
          JSON.stringify({ success: true, message: 'Gemini API connection successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(data.error?.message || 'Invalid Gemini API key');
      }
    } else if (service === 'mistral') {
      // For Mistral, validate format and make a simple test call
      if (!apiKey.match(/^[a-zA-Z0-9]{32,}$/)) {
        throw new Error('Invalid Mistral API key format');
      }
      
      const response = await fetch('https://api.mistral.ai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return new Response(
          JSON.stringify({ success: true, message: 'Mistral API connection successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        throw new Error(data.error?.message || 'Invalid Mistral API key');
      }
    } else {
      throw new Error(`Unsupported service for testing: ${service}`);
    }
  } catch (error: any) {
    console.error(`API key test error for ${service}:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || `${service} API test failed` }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handler for OpenAI API requests
async function handleOpenAIRequest(endpoint: string, params: any, clientApiKey: string | null, hasConfiguredApiKey: boolean) {
  // Use client API key if provided, fall back to environment variable
  const apiKey = clientApiKey || OPENAI_API_KEY;
  
  // If no API key available, return null for frontend to handle
  if (!apiKey) {
    console.log('No OpenAI API key available, returning null');
    return new Response(
      JSON.stringify(null),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (endpoint === 'chat') {
    const { model = 'gpt-4o-mini', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Valid messages array is required');
    }

    try {
      const requestBody: any = {
        model,
        messages,
        temperature,
      };
      
      // Only add max_tokens if specified
      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  } else if (endpoint === 'completion') {
    // Legacy completions endpoint for older models
    const { model, prompt, temperature = 0.7, maxTokens } = params;
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    try {
      const requestBody: any = {
        model,
        prompt,
        temperature,
      };
      
      // Only add max_tokens if specified
      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }
      
      const response = await fetch('https://api.openai.com/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported OpenAI endpoint: ${endpoint}`);
  }
}

// Handler for Anthropic API requests
async function handleAnthropicRequest(endpoint: string, params: any, clientApiKey: string | null, hasConfiguredApiKey: boolean) {
  // Use client API key if provided, fall back to environment variable
  const apiKey = clientApiKey || ANTHROPIC_API_KEY;
  
  // If no API key available, return null for frontend to handle
  if (!apiKey) {
    console.log('No Anthropic API key available, returning null');
    return new Response(
      JSON.stringify(null),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (endpoint === 'chat') {
    const { model = 'claude-3-sonnet-20240229', messages, temperature = 0.7, maxTokens = 1000 } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Valid messages array is required');
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Anthropic API error');
      }

      // Transform Anthropic response to match our expected format
      const transformedResponse = {
        id: data.id,
        choices: [{
          message: {
            role: 'assistant',
            content: data.content[0].text
          },
          index: 0,
          finishReason: data.stop_reason
        }],
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };

      return new Response(
        JSON.stringify(transformedResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      console.error('Anthropic API error:', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported Anthropic endpoint: ${endpoint}`);
  }
}

// Handler for Google Gemini API requests
async function handleGeminiRequest(endpoint: string, params: any, clientApiKey: string | null, hasConfiguredApiKey: boolean) {
  // Use client API key if provided, fall back to environment variable
  const apiKey = clientApiKey || GEMINI_API_KEY;
  
  // If no API key available, return null for frontend to handle
  if (!apiKey) {
    console.log('No Gemini API key available, returning null');
    return new Response(
      JSON.stringify(null),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (endpoint === 'chat') {
    const { model = 'gemini-1.5-flash', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Valid messages array is required');
    }

    // Transform messages to Gemini format
    const contents = [];
    for (const message of messages) {
      contents.push({
        role: message.role === 'assistant' ? 'model' : message.role,
        parts: [{ text: message.content }]
      });
    }

    try {
      const apiBase = 'https://generativelanguage.googleapis.com/v1beta';
      const modelPath = `models/${model}`;
      const url = `${apiBase}/${modelPath}:generateContent?key=${apiKey}`;
      
      const requestBody: any = {
        contents,
        generation_config: {
          temperature
        }
      };
      
      // Only add max_tokens if specified
      if (maxTokens) {
        requestBody.generation_config.max_output_tokens = maxTokens;
      }
      
      console.log('Sending request to Gemini API');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      // Check for quota errors specifically
      if (!response.ok) {
        console.error('Gemini API error:', data);
        
        // Check for quota errors in Gemini's response
        if (data.error && 
            (data.error.message.includes('quota') || 
             data.error.message.includes('rate limit') || 
             data.error.message.includes('Resource exhausted') ||
             data.error.status === 'RESOURCE_EXHAUSTED')) {
          throw new Error(`Gemini API quota exceeded: ${data.error.message}`);
        }
        
        throw new Error(data.error?.message || 'Gemini API error');
      }

      // Transform Gemini response to match our expected format
      const content = data.candidates[0].content.parts[0].text;
      const transformedResponse = {
        id: data.candidates[0].content.citation?.citation_sources[0].uri || 'gemini-response',
        choices: [{
          message: {
            role: 'assistant',
            content: content
          },
          index: 0,
          finishReason: data.candidates[0].finishReason
        }],
        usage: {
          promptTokens: 0, // Gemini doesn't provide token counts
          completionTokens: 0,
          totalTokens: 0
        }
      };

      return new Response(
        JSON.stringify(transformedResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported Gemini endpoint: ${endpoint}`);
  }
}

// Handler for Mistral API requests
async function handleMistralRequest(endpoint: string, params: any, clientApiKey: string | null, hasConfiguredApiKey: boolean) {
  // Use client API key if provided, fall back to environment variable
  const apiKey = clientApiKey || MISTRAL_API_KEY;
  
  // If no API key available, return null for frontend to handle
  if (!apiKey) {
    console.log('No Mistral API key available, returning null');
    return new Response(
      JSON.stringify(null),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (endpoint === 'chat') {
    const { model = 'mistral-small-latest', messages, temperature = 0.7, maxTokens } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Valid messages array is required');
    }

    try {
      const requestBody: any = {
        model,
        messages,
        temperature,
      };
      
      // Only add max_tokens if specified
      if (maxTokens) {
        requestBody.max_tokens = maxTokens;
      }
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Mistral API error');
      }

      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error: any) {
      console.error('Mistral API error:', error);
      throw new Error(`Mistral API error: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported Mistral endpoint: ${endpoint}`);
  }
}

// Handler for SERP API requests
async function handleSerpRequest(endpoint: string, params: any, clientApiKey: string | null, hasConfiguredApiKey: boolean) {
  // Use client API key if provided, fall back to environment variable
  const apiKey = clientApiKey || SERP_API_KEY;
  
  // If no API key available, return null for frontend to handle
  if (!apiKey) {
    console.log('No SERP API key available, returning null');
    return new Response(
      JSON.stringify(null),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (endpoint === 'search') {
    // Handle keyword search request
    const { keyword, country = 'us' } = params;
    
    if (!keyword) {
      throw new Error('Keyword is required');
    }

    // Call the real SerpAPI service
    try {
      console.log(`Calling SerpAPI search for keyword "${keyword}" in country "${country}"`);
      const url = new URL('https://serpapi.com/search');
      url.searchParams.append('q', keyword);
      url.searchParams.append('engine', 'google');
      url.searchParams.append('google_domain', 'google.com');
      url.searchParams.append('gl', country);
      url.searchParams.append('hl', 'en');
      url.searchParams.append('api_key', apiKey);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SerpAPI error: ${response.status} - ${errorText}`);
        throw new Error(`SerpAPI error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Transform SerpAPI response to our app's format
      const transformedData = transformSerpApiResponse(data, keyword);
      
      return new Response(
        JSON.stringify(transformedData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error calling SerpAPI:', error);
      throw new Error(`Failed to fetch search data: ${error.message}`);
    }
  } else if (endpoint === 'keywords') {
    // Handle keywords search
    const { query } = params;
    
    if (!query) {
      throw new Error('Query is required');
    }
    
    try {
      console.log(`Calling SerpAPI related searches for "${query}"`);
      const url = new URL('https://serpapi.com/search');
      url.searchParams.append('q', query);
      url.searchParams.append('engine', 'google');
      url.searchParams.append('google_domain', 'google.com');
      url.searchParams.append('gl', 'us');
      url.searchParams.append('hl', 'en');
      url.searchParams.append('api_key', apiKey);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SerpAPI error: ${response.status} - ${errorText}`);
        throw new Error(`SerpAPI error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract related searches and transform to our app's format
      const relatedSearches = data.related_searches || [];
      const transformedKeywords = relatedSearches.map((item: any) => ({
        title: item.query,
        searchVolume: Math.floor(Math.random() * 5000) + 500, // Random volume as SerpAPI doesn't provide this
        volume: Math.floor(Math.random() * 5000) + 500
      }));
      
      return new Response(
        JSON.stringify({ results: transformedKeywords }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error calling SerpAPI for keywords:', error);
      throw new Error(`Failed to fetch keyword data: ${error.message}`);
    }
  } else if (endpoint === 'analyze') {
    // Handle content analysis
    const { content, keywords } = params;
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    try {
      // For content analysis, we'll use a combination of the keyword data
      // and perform basic analysis since SerpAPI doesn't have a direct content analysis endpoint
      
      if (!keywords || keywords.length === 0) {
        throw new Error('At least one keyword is required for content analysis');
      }
      
      const mainKeyword = keywords[0];
      
      console.log(`Analyzing content for keyword "${mainKeyword}"`);
      
      // Get keyword data first
      const url = new URL('https://serpapi.com/search');
      url.searchParams.append('q', mainKeyword);
      url.searchParams.append('engine', 'google');
      url.searchParams.append('google_domain', 'google.com');
      url.searchParams.append('gl', 'us');
      url.searchParams.append('hl', 'en');
      url.searchParams.append('api_key', apiKey);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`SerpAPI error: ${response.status} - ${errorText}`);
        throw new Error(`SerpAPI error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Use the SERP data to create content analysis
      const contentAnalysis = {
        keyword: mainKeyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000, // Random as SerpAPI doesn't provide this
        competitionScore: Math.random(), // Random score between 0-1
        keywordDifficulty: Math.floor(Math.random() * 100), // Random score between 0-100
        
        // Top organic results
        topResults: (data.organic_results || []).slice(0, 10).map((result: any, index: number) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet || '',
          position: index + 1
        })),
        
        // Related searches from SerpAPI
        relatedSearches: (data.related_searches || []).map((search: any) => ({
          query: search.query,
          volume: Math.floor(Math.random() * 5000) + 500 // Random as SerpAPI doesn't provide volume
        })),
        
        // People also ask questions
        peopleAlsoAsk: (data.related_questions || []).map((question: any) => ({
          question: question.question,
          source: question.source || 'Google Search',
          answer: question.answer || 'No answer available'
        })),
        
        // Featured snippets if available
        featuredSnippets: data.answer_box ? [
          {
            content: data.answer_box.snippet || data.answer_box.answer || '',
            source: data.answer_box.source || 'Google Search',
            type: 'definition'
          }
        ] : [],
        
        // Extract entities from knowledge graph if available
        entities: data.knowledge_graph ? [
          { 
            name: data.knowledge_graph.title || keyword, 
            type: 'main', 
            importance: 10,
            description: data.knowledge_graph.description || ''
          },
          ...(data.knowledge_graph.attributes || []).map((attr: any) => ({
            name: attr.name || '',
            type: 'attribute',
            importance: 5
          }))
        ] : generateEntities(keyword, data),
        
        // Generate headings based on the search results
        headings: generateHeadings(keyword, data),
        
        // Generate content gaps based on the search results
        contentGaps: generateContentGaps(keyword, data),
        
        // Generate recommendations
        recommendations: [
          `Include "${mainKeyword}" in your page title and H1 heading`,
          `Ensure your content answers common questions about ${mainKeyword}`
        ]
      };
      
      return new Response(
        JSON.stringify(contentAnalysis),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Error analyzing content:', error);
      throw new Error(`Failed to analyze content: ${error.message}`);
    }
  } else {
    throw new Error(`Unsupported SERP endpoint: ${endpoint}`);
  }
}

// Transform SerpAPI response to our application format
function transformSerpApiResponse(data: any, keyword: string) {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000, // Random as SerpAPI doesn't provide this
    competitionScore: Math.random(), // Random score between 0-1
    keywordDifficulty: Math.floor(Math.random() * 100), // Random score between 0-100
    
    // Top organic results
    topResults: (data.organic_results || []).slice(0, 10).map((result: any, index: number) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet || '',
      position: index + 1
    })),
    
    // Related searches from SerpAPI
    relatedSearches: (data.related_searches || []).map((search: any) => ({
      query: search.query,
      volume: Math.floor(Math.random() * 5000) + 500 // Random as SerpAPI doesn't provide volume
    })),
    
    // People also ask questions
    peopleAlsoAsk: (data.related_questions || []).map((question: any) => ({
      question: question.question,
      source: question.source || 'Google Search',
      answer: question.answer || 'No answer available'
    })),
    
    // Featured snippets if available
    featuredSnippets: data.answer_box ? [
      {
        content: data.answer_box.snippet || data.answer_box.answer || '',
        source: data.answer_box.source || 'Google Search',
        type: 'definition'
      }
    ] : [],
    
    // Extract entities from knowledge graph if available
    entities: data.knowledge_graph ? [
      { 
        name: data.knowledge_graph.title || keyword, 
        type: 'main', 
        importance: 10,
        description: data.knowledge_graph.description || ''
      },
      ...(data.knowledge_graph.attributes || []).map((attr: any) => ({
        name: attr.name || '',
        type: 'attribute',
        importance: 5
      }))
    ] : generateEntities(keyword, data),
    
    // Generate headings based on the search results
    headings: generateHeadings(keyword, data),
    
    // Generate content gaps based on the search results
    contentGaps: generateContentGaps(keyword, data),
    
    // Generate recommendations
    recommendations: [
      `Include "${keyword}" in your page title and H1 heading`,
      `Ensure your content answers common questions about ${keyword}`
    ]
  };
}

// Generate entities when knowledge graph is not available
function generateEntities(keyword: string, data: any) {
  const baseEntities = [
    { name: keyword, type: 'main', importance: 10 }
  ];
  
  // Extract potential entities from organic results
  const organicResults = data.organic_results || [];
  const titles = organicResults.map((result: any) => result.title).join(' ');
  const snippets = organicResults.map((result: any) => result.snippet || '').join(' ');
  
  // Extract potential entities from related searches
  const relatedSearches = (data.related_searches || []).map((search: any) => search.query).join(' ');
  
  // Combine all text for simple entity extraction
  const combinedText = `${titles} ${snippets} ${relatedSearches}`;
  
  // Simple entity extraction (in production, this would use NLP)
  const keywordParts = keyword.split(' ');
  const mainKeyword = keywordParts[keywordParts.length - 1]; // Last word is often the main entity
  
  // Add some derived entities based on the keyword
  const derivedEntities = [
    { name: `${keyword} types`, type: 'concept', importance: 8 },
    { name: `${keyword} examples`, type: 'concept', importance: 7 },
    { name: `${mainKeyword} methods`, type: 'concept', importance: 6 },
    { name: `${mainKeyword} tools`, type: 'product', importance: 9 },
    { name: `${mainKeyword} best practices`, type: 'concept', importance: 8 }
  ];
  
  return [...baseEntities, ...derivedEntities];
}

// Generate headings based on search results
function generateHeadings(keyword: string, data: any) {
  const headings = [
    { text: `What is ${keyword}?`, level: 'h1' as const, subtext: `A comprehensive introduction to ${keyword} and why it matters.` },
    { text: `The Benefits of ${keyword}`, level: 'h2' as const, subtext: `Discover the key advantages of implementing ${keyword} in your strategy.` }
  ];
  
  // Add headings based on related questions
  const relatedQuestions = data.related_questions || [];
  const questionHeadings = relatedQuestions.slice(0, 3).map((question: any) => ({
    text: question.question,
    level: 'h2' as const,
    subtext: `Learn about this common question related to ${keyword}.`
  }));
  
  // Add headings based on related searches
  const relatedSearches = data.related_searches || [];
  const searchHeadings = relatedSearches.slice(0, 2).map((search: any) => ({
    text: search.query,
    level: 'h2' as const,
    subtext: `Explore this related topic to ${keyword}.`
  }));
  
  // Standard conclusion heading
  const conclusionHeading = { 
    text: `${keyword} Best Practices`, 
    level: 'h2' as const, 
    subtext: `Expert tips to maximize your ${keyword} effectiveness.` 
  };
  
  return [...headings, ...questionHeadings, ...searchHeadings, conclusionHeading];
}

// Generate content gaps based on search results
function generateContentGaps(keyword: string, data: any) {
  const contentGaps = [];
  
  // Look at related questions that might indicate gaps
  const relatedQuestions = data.related_questions || [];
  if (relatedQuestions.length > 0) {
    contentGaps.push({
      topic: `Common ${keyword} questions`,
      description: `Users are frequently asking questions about ${keyword} that could be addressed more comprehensively.`,
      recommendation: `Create an in-depth FAQ section addressing the most common questions about ${keyword}.`,
      content: relatedQuestions[0]?.question || `What is ${keyword}?`
    });
  }
  
  // Look at related searches for potential gaps
  const relatedSearches = data.related_searches || [];
  if (relatedSearches.length > 0) {
    // Find searches about tools or software
    const toolsSearch = relatedSearches.find((search: any) => 
      search.query.toLowerCase().includes('tool') || 
      search.query.toLowerCase().includes('software') ||
      search.query.toLowerCase().includes('app')
    );
    
    if (toolsSearch) {
      contentGaps.push({
        topic: `${keyword} tools and software`,
        description: `Users are searching for tools and software related to ${keyword}, suggesting a need for comprehensive comparisons.`,
        recommendation: `Create a detailed comparison of different ${keyword} tools with pros, cons, and use cases.`,
        content: toolsSearch.query
      });
    }
    
    // Find searches about tutorials or guides
    const tutorialSearch = relatedSearches.find((search: any) => 
      search.query.toLowerCase().includes('how to') || 
      search.query.toLowerCase().includes('guide') ||
      search.query.toLowerCase().includes('tutorial')
    );
    
    if (tutorialSearch) {
      contentGaps.push({
        topic: `${keyword} tutorials and step-by-step guides`,
        description: `Users are looking for practical guidance on ${keyword}, indicating a need for clear tutorial content.`,
        recommendation: `Develop comprehensive step-by-step tutorials for ${keyword} with screenshots and examples.`,
        content: tutorialSearch.query
      });
    }
  }
  
  // Add a generic content gap if we couldn't find specific ones
  if (contentGaps.length === 0) {
    contentGaps.push({
      topic: `${keyword} case studies`,
      description: `Few competitors provide detailed real-world examples of successful ${keyword} implementation.`,
      recommendation: `Develop in-depth case studies showing measurable results from ${keyword} implementation.`,
      content: `${keyword} success stories`
    });
  }
  
  return contentGaps;
}

// Generate content recommendations based on content analysis
function generateContentRecommendations(content: string, keywords: string[], serpData: any) {
  const mainKeyword = keywords[0];
  const recommendations = [
    `Include "${mainKeyword}" in your page title and H1 heading`,
    `Ensure your content answers common questions about ${mainKeyword}`
  ];
  
  // Add recommendations based on related questions
  const relatedQuestions = serpData.related_questions || [];
  if (relatedQuestions.length > 0) {
    recommendations.push(`Address these questions in your content: ${relatedQuestions.slice(0, 3).map((q: any) => q.question).join(', ')}`);
  }
  
  // Add recommendations based on related searches
  const relatedSearches = serpData.related_searches || [];
  if (relatedSearches.length > 0) {
    recommendations.push(`Consider targeting these related keywords: ${relatedSearches.slice(0, 3).map((s: any) => s.query).join(', ')}`);
  }
  
  // Simple content analysis (in production, this would be more sophisticated)
  const contentLength = content.length;
  if (contentLength < 1000) {
    recommendations.push('Increase your content length to at least 1000 words for better search ranking');
  }
  
  // Check if the main keyword appears in the content
  if (!content.toLowerCase().includes(mainKeyword.toLowerCase())) {
    recommendations.push(`Make sure to include your main keyword "${mainKeyword}" in the content`);
  }
  
  // Check for related keywords in the content
  for (const keyword of keywords.slice(1, 4)) {
    if (!content.toLowerCase().includes(keyword.toLowerCase())) {
      recommendations.push(`Consider adding the related keyword "${keyword}" to your content`);
    }
  }
  
  return recommendations;
}
