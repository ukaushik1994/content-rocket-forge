
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
  // If API key is missing, return mock data instead of error
  if (!SERP_API_KEY) {
    console.log('SERP API key not configured, returning mock data');
    
    if (endpoint === 'search') {
      const mockResponse = getMockSerpData(params.keyword);
      return new Response(
        JSON.stringify(mockResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'keywords') {
      const mockKeywords = getMockKeywordResults(params.query);
      return new Response(
        JSON.stringify({ results: mockKeywords }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'analyze') {
      const mockAnalysis = getMockContentAnalysis(params.content, params.keywords);
      return new Response(
        JSON.stringify(mockAnalysis),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: "Mock data not available for this endpoint" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
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
    console.log('OpenAI API key not configured, returning mock data');
    return new Response(
      JSON.stringify({ 
        choices: [{ 
          message: { 
            content: "This is a mock response because the OpenAI API key is not configured. Please add your API key in the settings."
          }
        }]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
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
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    topResults: [
      {
        title: `${keyword} - Complete Guide`,
        link: 'https://example.com/complete-guide',
        snippet: `This complete guide covers everything you need to know about ${keyword}. Learn practical tips and strategies.`,
        position: 1
      },
      {
        title: `${keyword} Explained in Simple Terms`,
        link: 'https://example.com/explained',
        snippet: `Understanding ${keyword} doesn't have to be complicated. Here's a simplified explanation.`,
        position: 2
      },
      {
        title: `How to Master ${keyword} in 2025`,
        link: 'https://example.com/mastering',
        snippet: `Learn how to master ${keyword} with our step-by-step guide. Perfect for beginners and experts alike.`,
        position: 3
      }
    ],
    relatedSearches: [
      { query: `best ${keyword} tools`, volume: 1200 },
      { query: `${keyword} vs competition`, volume: 950 },
      { query: `how to learn ${keyword}`, volume: 1500 },
      { query: `${keyword} for beginners`, volume: 2200 },
      { query: `advanced ${keyword} techniques`, volume: 800 }
    ],
    peopleAlsoAsk: [
      { question: `What is ${keyword}?`, source: 'https://example.com/what-is', answer: `${keyword} is a powerful tool for improving SEO.` },
      { question: `Why is ${keyword} important?`, source: 'https://example.com/importance', answer: `${keyword} is crucial because it helps businesses reach their target audience.` },
      { question: `How to get started with ${keyword}?`, source: 'https://example.com/getting-started', answer: `To get started with ${keyword}, first research your target audience and competitors.` },
      { question: `What are the best practices for ${keyword}?`, source: 'https://example.com/best-practices', answer: `Best practices for ${keyword} include regular content updates and keyword research.` }
    ],
    featuredSnippets: [
      {
        content: `${keyword} is an essential aspect of modern business strategy. It involves analyzing data patterns to predict market trends and consumer behavior.`,
        source: 'https://example.com/featured',
        type: 'definition'
      }
    ]
  };
}

/**
 * Generate mock keyword search results
 */
function getMockKeywordResults(query: string): any[] {
  return [
    { title: `Best ${query} in 2025`, searchVolume: 3200, volume: 3200 },
    { title: `Top 10 ${query} tools`, searchVolume: 2800, volume: 2800 },
    { title: `How to use ${query} effectively`, searchVolume: 1900, volume: 1900 },
    { title: `${query} for beginners`, searchVolume: 2100, volume: 2100 },
    { title: `${query} advanced techniques`, searchVolume: 1500, volume: 1500 },
    { title: `${query} vs alternatives`, searchVolume: 1700, volume: 1700 },
    { title: `Why ${query} matters`, searchVolume: 1200, volume: 1200 },
    { title: `${query} best practices`, searchVolume: 2400, volume: 2400 }
  ];
}

/**
 * Generate mock content analysis
 */
function getMockContentAnalysis(content: string, keywords: string[] = []) {
  const mainKeyword = keywords && keywords.length > 0 ? keywords[0] : "content";
  
  return {
    keyword: mainKeyword,
    searchVolume: Math.floor(Math.random() * 5000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    keywords: keywords || [mainKeyword, `${mainKeyword} strategy`, `${mainKeyword} tips`],
    recommendations: [
      'Include more specific details about the main topic',
      'Add more related keywords throughout the content',
      'Improve the readability with shorter paragraphs',
      'Include statistics or data to support your claims',
      'Add images or media to enhance engagement'
    ]
  };
}
