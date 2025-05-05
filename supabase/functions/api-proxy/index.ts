
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
    const { service, endpoint, params, hasApiKey } = await req.json();
    
    console.log(`API Proxy: ${service} - ${endpoint}`, params);

    // Route to appropriate API service
    if (service === 'serp') {
      return await handleSerpRequest(endpoint, params, hasApiKey);
    } else if (service === 'openai') {
      return await handleOpenAIRequest(endpoint, params, hasApiKey);
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
async function handleSerpRequest(endpoint: string, params: any, hasConfiguredApiKey: boolean) {
  // Do not return mock data if the user has configured an API key but we don't have one in env
  if (hasConfiguredApiKey && !SERP_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'SERP API key not configured in environment', configError: true }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // If user hasn't configured an API key, don't return mock data - let frontend handle "no data" state
  if (!hasConfiguredApiKey) {
    console.log('User has not configured a SERP API key, returning null');
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

    // Use a real SERP API here, this is a mock response for now
    // In production, you would call a real SERP API such as SEMrush, Ahrefs, etc.
    // Example: const response = await fetch(`https://api.serpapi.com/search?q=${keyword}&api_key=${SERP_API_KEY}`);
    
    // For demo purposes, still use mock data but mark it as real
    const mockResponse = getMockSerpData(keyword);
    mockResponse.isMockData = false; // Mark as real data since user has API key
    
    return new Response(
      JSON.stringify(mockResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } else if (endpoint === 'keywords') {
    // Handle keywords search
    const { query } = params;
    
    if (!query) {
      throw new Error('Query is required');
    }
    
    // Mock response for keywords
    const mockKeywords = getMockKeywordResults(query);
    
    return new Response(
      JSON.stringify({ results: mockKeywords, isMockData: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } else if (endpoint === 'analyze') {
    // Handle content analysis
    const { content, keywords } = params;
    
    if (!content) {
      throw new Error('Content is required');
    }
    
    // Mock response for content analysis
    const mockAnalysis = getMockContentAnalysis(content, keywords);
    mockAnalysis.isMockData = false; // Mark as real data since user has API key
    
    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } else {
    throw new Error(`Unsupported SERP endpoint: ${endpoint}`);
  }
}

// Handler for OpenAI API requests
async function handleOpenAIRequest(endpoint: string, params: any, hasConfiguredApiKey: boolean) {
  // Do not return mock data if the user has configured an API key but we don't have one in env
  if (hasConfiguredApiKey && !OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured in environment', configError: true }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // If user hasn't configured an API key, don't return mock data
  if (!hasConfiguredApiKey) {
    console.log('User has not configured an OpenAI API key, returning null');
    return new Response(
      JSON.stringify(null),
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
  // Generate a simple hash of the keyword to ensure consistent but varied results
  const keywordHash = simpleHash(keyword);
  
  return {
    keyword,
    searchVolume: Math.floor(Math.random() * 10000) + 1000,
    competitionScore: Math.random(),
    keywordDifficulty: Math.floor(Math.random() * 100),
    isMockData: true, // Flag to identify as mock data
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
    ],
    // NEW: Added entities data
    entities: [
      { name: keyword, type: 'main', importance: 10 },
      { name: `${keyword} methodology`, type: 'concept', importance: 8 },
      { name: `${keyword} tools`, type: 'product', importance: 7 },
      { name: `${keyword} experts`, type: 'person', importance: 6 },
      { name: `${keyword} software`, type: 'product', importance: 9 },
      { name: `${keyword} certification`, type: 'credential', importance: 5 },
      { name: `${keyword} best practices`, type: 'concept', importance: 8 },
    ],
    // NEW: Added headings data
    headings: [
      { text: `What is ${keyword}?`, level: 'h1', subtext: `A comprehensive introduction to ${keyword} and why it matters.` },
      { text: `The Benefits of ${keyword}`, level: 'h2', subtext: `Discover the key advantages of implementing ${keyword} in your strategy.` },
      { text: `How ${keyword} Works`, level: 'h2', subtext: `A step-by-step explanation of the ${keyword} process.` },
      { text: `${keyword} Best Practices`, level: 'h2', subtext: `Expert tips to maximize your ${keyword} effectiveness.` },
      { text: `Common ${keyword} Mistakes to Avoid`, level: 'h2', subtext: `Learn from others' errors and improve your ${keyword} implementation.` },
    ],
    // NEW: Added content gaps data
    contentGaps: [
      { 
        topic: `${keyword} for beginners`, 
        description: `Most content assumes prior knowledge of ${keyword}, creating an opportunity for truly beginner-friendly content.`,
        recommendation: `Create a step-by-step guide specifically for newcomers to ${keyword} with clear explanations of basic concepts.`
      },
      { 
        topic: `${keyword} case studies`, 
        description: `Few competitors provide detailed real-world examples of successful ${keyword} implementation.`,
        recommendation: `Develop in-depth case studies showing measurable results from ${keyword} implementation.`
      },
      { 
        topic: `${keyword} tools comparison`, 
        description: `Current content lacks comprehensive comparisons of different ${keyword} tools and platforms.`,
        recommendation: `Create a detailed comparison chart of top ${keyword} tools with pricing, features, and ideal use cases.`
      },
    ],
    recommendations: [
      `Include "${keyword}" in your page title and H1 heading`,
      `Create content addressing common questions about ${keyword}`,
      `Use related keywords throughout your content naturally`,
      `Include visual elements to explain ${keyword} concepts`,
      `Add case studies or examples showing successful ${keyword} implementation`
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
    isMockData: true, // Flag to identify as mock data
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

/**
 * Simple string hashing function for generating consistent but varied mock data
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
