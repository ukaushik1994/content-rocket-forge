
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const SERP_API_KEY = Deno.env.get("SERP_API_KEY");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
    const { service, endpoint, params } = await req.json();
    
    console.log(`API Proxy: ${service} - ${endpoint}`, params);

    // Route to appropriate API service
    if (service === 'serp') {
      return await handleSerpRequest(endpoint, params);
    } else if (service === 'openai') {
      return await handleOpenAIRequest(endpoint, params);
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

// Handler for SERP API requests
async function handleSerpRequest(endpoint: string, params: any) {
  if (!SERP_API_KEY) {
    throw new Error('SERP API key not configured');
  }

  if (endpoint === 'search') {
    // Handle keyword search request
    const { keyword, country = 'us' } = params;
    
    if (!keyword) {
      throw new Error('Keyword is required');
    }

    // Use a real SERP API here, this is a mock response for now
    // In production, you would call a real SERP API such as SEMrush, Ahrefs, etc.
    // Example: const response = await fetch(`https://api.serpapi.com/search?q=${keyword}&api_key=${SERP_API_KEY}`);
    
    // Mock response
    const mockResponse = getMockSerpData(keyword);
    
    return new Response(
      JSON.stringify(mockResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } else {
    throw new Error(`Unsupported SERP endpoint: ${endpoint}`);
  }
}

// Handler for OpenAI API requests
async function handleOpenAIRequest(endpoint: string, params: any) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (endpoint === 'chat') {
    const { messages, model = 'gpt-4o-mini', temperature = 0.7 } = params;
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Valid messages array is required');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
        }),
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

// Mock SERP data generation
function getMockSerpData(keyword: string) {
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.floor(Math.random() * 100),
    topResults: [
      {
        title: `${keyword} - Complete Guide`,
        link: 'https://example.com/complete-guide',
        snippet: `This complete guide covers everything you need to know about ${keyword}. Learn practical tips and strategies.`
      },
      {
        title: `${keyword} Explained in Simple Terms`,
        link: 'https://example.com/explained',
        snippet: `Understanding ${keyword} doesn't have to be complicated. Here's a simplified explanation.`
      },
      {
        title: `How to Master ${keyword} in 2025`,
        link: 'https://example.com/mastering',
        snippet: `Learn how to master ${keyword} with our step-by-step guide. Perfect for beginners and experts alike.`
      }
    ],
    relatedSearches: [
      { query: `best ${keyword} tools` },
      { query: `${keyword} vs competition` },
      { query: `how to learn ${keyword}` },
      { query: `${keyword} for beginners` },
      { query: `advanced ${keyword} techniques` }
    ],
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, source: 'https://example.com/what-is' },
      { question: `Why is ${keyword} important?`, source: 'https://example.com/importance' },
      { question: `How to get started with ${keyword}?`, source: 'https://example.com/getting-started' },
      { question: `What are the best practices for ${keyword}?`, source: 'https://example.com/best-practices' }
    ],
    featuredSnippets: [
      {
        content: `${keyword} is an essential aspect of modern business strategy. It involves analyzing data patterns to predict market trends and consumer behavior.`,
        source: 'https://example.com/featured'
      }
    ]
  };
}
