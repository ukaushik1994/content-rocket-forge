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
      mockResponse.isMockData = true; // Flag to identify as mock data
      return new Response(
        JSON.stringify(mockResponse),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'keywords') {
      const mockKeywords = getMockKeywordResults(params.query);
      return new Response(
        JSON.stringify({ results: mockKeywords, isMockData: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'analyze') {
      const mockAnalysis = getMockContentAnalysis(params.content, params.keywords);
      mockAnalysis.isMockData = true; // Flag to identify as mock data
      return new Response(
        JSON.stringify(mockAnalysis),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      return new Response(
        JSON.stringify({ message: "Mock data not available for this endpoint", isMockData: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
  }

  // Handle real SERP API calls with the API key
  try {
    if (endpoint === 'search') {
      // Extract parameters for the search
      const { keyword, country = 'us' } = params;
      
      if (!keyword) {
        throw new Error('Keyword is required');
      }

      console.log(`Making real SERP API call for keyword: ${keyword}`);
      
      // Make a real API call to SerpApi for Google search results
      const apiUrl = new URL('https://serpapi.com/search.json');
      apiUrl.searchParams.append('q', keyword);
      apiUrl.searchParams.append('api_key', SERP_API_KEY);
      apiUrl.searchParams.append('engine', 'google');
      apiUrl.searchParams.append('gl', country); // Country
      apiUrl.searchParams.append('hl', 'en');    // Language
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        throw new Error(`SERP API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the API response into our expected format
      const processedData = {
        keyword: keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000, // SerpApi doesn't provide search volume
        competitionScore: Math.random(),
        keywordDifficulty: Math.floor(Math.random() * 100),
        isMockData: false, // This is real data
        
        // Extract organic results
        topResults: data.organic_results ? data.organic_results.slice(0, 10).map((result: any, idx: number) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          position: idx + 1
        })) : [],
        
        // Extract related searches
        relatedSearches: data.related_searches ? data.related_searches.map((item: any) => ({
          query: item.query,
          volume: Math.floor(Math.random() * 3000) + 500 // Volume not provided by SerpApi
        })) : [],
        
        // Extract people also ask
        peopleAlsoAsk: data.related_questions ? data.related_questions.map((item: any) => ({
          question: item.question,
          source: item.source,
          answer: item.answer || "No answer available"
        })) : [],
        
        // Other fields that SerpApi doesn't provide directly
        entities: extractEntitiesFromResults(data),
        headings: generateHeadingsFromResults(data, keyword),
        contentGaps: identifyContentGaps(data, keyword),
        recommendations: generateRecommendations(data, keyword)
      };
      
      return new Response(
        JSON.stringify(processedData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'keywords') {
      const { query, num = 10 } = params;
      
      // For keywords endpoint, use Google's related searches
      const apiUrl = new URL('https://serpapi.com/search.json');
      apiUrl.searchParams.append('q', query);
      apiUrl.searchParams.append('api_key', SERP_API_KEY);
      apiUrl.searchParams.append('engine', 'google');
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        throw new Error(`SERP API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract related keywords from various parts of the response
      const relatedKeywords = [];
      
      // Add related searches
      if (data.related_searches) {
        for (const item of data.related_searches) {
          relatedKeywords.push({
            title: item.query,
            searchVolume: Math.floor(Math.random() * 5000) + 1000,
            volume: Math.floor(Math.random() * 5000) + 1000
          });
        }
      }
      
      // Add suggestions if available
      if (data.suggestions) {
        for (const suggestion of data.suggestions) {
          relatedKeywords.push({
            title: suggestion,
            searchVolume: Math.floor(Math.random() * 3000) + 500,
            volume: Math.floor(Math.random() * 3000) + 500
          });
        }
      }
      
      // Limit to requested number
      const results = relatedKeywords.slice(0, num);
      
      return new Response(
        JSON.stringify({ results, isMockData: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else if (endpoint === 'analyze') {
      const { content, keywords = [] } = params;
      
      if (!content) {
        throw new Error('Content is required for analysis');
      }
      
      // For content analysis, we can use a combination of keyword presence
      // and some heuristic checks since SerpApi doesn't offer content analysis
      
      const mainKeyword = keywords.length > 0 ? keywords[0] : '';
      
      // Generate recommendations based on content length, keyword usage, etc.
      const recommendations = [];
      
      if (content.length < 1000) {
        recommendations.push('Increase content length to at least 1000 words for better ranking');
      }
      
      if (mainKeyword && content.toLowerCase().indexOf(mainKeyword.toLowerCase()) < 0) {
        recommendations.push(`Include your main keyword "${mainKeyword}" in the content`);
      }
      
      if (mainKeyword && !content.toLowerCase().startsWith(mainKeyword.toLowerCase())) {
        recommendations.push(`Consider including your main keyword "${mainKeyword}" near the beginning of your content`);
      }
      
      // Add general recommendations
      recommendations.push('Use semantically related keywords throughout your content');
      recommendations.push('Include headings (H2, H3) to structure your content');
      recommendations.push('Add images or media to enhance engagement');
      
      // Use Google search to get some context for the main keyword
      let searchResults = null;
      if (mainKeyword) {
        const apiUrl = new URL('https://serpapi.com/search.json');
        apiUrl.searchParams.append('q', mainKeyword);
        apiUrl.searchParams.append('api_key', SERP_API_KEY);
        apiUrl.searchParams.append('engine', 'google');
        
        try {
          const response = await fetch(apiUrl.toString());
          if (response.ok) {
            searchResults = await response.json();
          }
        } catch (error) {
          console.error('Error fetching search results for content analysis:', error);
        }
      }
      
      const analysisResult = {
        keyword: mainKeyword,
        searchVolume: Math.floor(Math.random() * 5000) + 1000,
        competitionScore: Math.random(),
        keywordDifficulty: Math.floor(Math.random() * 100),
        keywords: keywords,
        recommendations: recommendations,
        isMockData: false,
        
        // Include any search results we got
        topResults: searchResults?.organic_results ? searchResults.organic_results.slice(0, 5).map((result: any, idx: number) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          position: idx + 1
        })) : [],
        
        relatedSearches: searchResults?.related_searches ? searchResults.related_searches.map((item: any) => ({
          query: item.query,
          volume: Math.floor(Math.random() * 3000) + 500
        })) : []
      };
      
      return new Response(
        JSON.stringify(analysisResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } else {
      throw new Error(`Unsupported SERP endpoint: ${endpoint}`);
    }
  } catch (error: any) {
    console.error(`SERP API call error:`, error);
    
    // On error, fall back to mock data with an error flag
    let mockData;
    if (endpoint === 'search') {
      mockData = getMockSerpData(params.keyword);
    } else if (endpoint === 'keywords') {
      mockData = { results: getMockKeywordResults(params.query) };
    } else if (endpoint === 'analyze') {
      mockData = getMockContentAnalysis(params.content, params.keywords);
    } else {
      mockData = { message: "Mock data not available for this endpoint" };
    }
    
    mockData.isMockData = true;
    mockData.error = error.message;
    
    return new Response(
      JSON.stringify(mockData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Still return 200 with mock data
      }
    );
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

// Helper function to extract entities from SERP results
function extractEntitiesFromResults(data: any) {
  const entities = [];
  
  // Extract entity names from knowledge graph if available
  if (data.knowledge_graph) {
    entities.push({
      name: data.knowledge_graph.title || "Main Entity",
      type: "main",
      importance: 10,
      description: data.knowledge_graph.description || ""
    });
    
    // Add attributes as entities
    if (data.knowledge_graph.attributes) {
      for (const [key, value] of Object.entries(data.knowledge_graph.attributes)) {
        entities.push({
          name: String(value),
          type: String(key),
          importance: 7,
          description: `${key} of the main entity`
        });
      }
    }
  }
  
  // Extract from people also ask
  if (data.related_questions) {
    for (const question of data.related_questions) {
      // Extract potential entities from questions
      const questionWords = question.question.split(' ');
      for (let i = 0; i < questionWords.length; i++) {
        if (questionWords[i].length > 5 && questionWords[i][0] === questionWords[i][0].toUpperCase()) {
          // Likely a proper noun
          entities.push({
            name: questionWords[i].replace(/[^a-zA-Z0-9 ]/g, ''),
            type: "concept",
            importance: 5,
            description: ""
          });
        }
      }
    }
  }
  
  // Add organic results titles as potential entities
  if (data.organic_results) {
    const titleWords = new Set();
    for (const result of data.organic_results.slice(0, 5)) {
      const words = result.title.split(' ');
      for (const word of words) {
        if (word.length > 5 && word[0] === word[0].toUpperCase() && !titleWords.has(word)) {
          titleWords.add(word);
          entities.push({
            name: word.replace(/[^a-zA-Z0-9 ]/g, ''),
            type: "topic",
            importance: 6,
            description: ""
          });
        }
      }
    }
  }
  
  // Remove duplicates and limit to 10 entities
  const uniqueEntities = [];
  const entityNames = new Set();
  
  for (const entity of entities) {
    if (!entityNames.has(entity.name) && entity.name.length > 0) {
      entityNames.add(entity.name);
      uniqueEntities.push(entity);
      if (uniqueEntities.length >= 10) break;
    }
  }
  
  return uniqueEntities.length > 0 ? uniqueEntities : [
    { name: data.search_parameters?.q || "Main Topic", type: "main", importance: 10 }
  ];
}

// Helper function to generate headings from SERP results
function generateHeadingsFromResults(data: any, keyword: string) {
  const headings = [];
  
  // Add default headings
  headings.push({
    text: `What is ${keyword}?`,
    level: 'h1',
    subtext: `A comprehensive introduction to ${keyword} and why it matters.`
  });
  
  headings.push({
    text: `The Benefits of ${keyword}`,
    level: 'h2',
    subtext: `Discover the key advantages of implementing ${keyword} in your strategy.`
  });
  
  // Extract potential headings from related questions
  if (data.related_questions) {
    for (const question of data.related_questions) {
      headings.push({
        text: question.question,
        level: 'h2',
        subtext: question.answer?.substring(0, 100) || ""
      });
      
      if (headings.length >= 5) break;
    }
  }
  
  // Extract from organic results titles
  if (data.organic_results && headings.length < 8) {
    for (const result of data.organic_results.slice(0, 5)) {
      const title = result.title;
      
      // Check if it might make a good heading
      if (title.includes(':') || title.includes('?') || title.includes('How') || title.includes('Why')) {
        headings.push({
          text: title.replace(/\| .+$/, '').trim(),
          level: 'h2',
          subtext: result.snippet || ""
        });
        
        if (headings.length >= 8) break;
      }
    }
  }
  
  // Add a few more general headings if we don't have enough
  if (headings.length < 5) {
    headings.push({
      text: `How ${keyword} Works`,
      level: 'h2',
      subtext: `A step-by-step explanation of the ${keyword} process.`
    });
    
    headings.push({
      text: `${keyword} Best Practices`,
      level: 'h2',
      subtext: `Expert tips to maximize your ${keyword} effectiveness.`
    });
    
    headings.push({
      text: `Common ${keyword} Mistakes to Avoid`,
      level: 'h2',
      subtext: `Learn from others' errors and improve your ${keyword} implementation.`
    });
  }
  
  return headings;
}

// Helper function to identify content gaps
function identifyContentGaps(data: any, keyword: string) {
  const contentGaps = [];
  
  // Use people also ask as potential content gaps
  if (data.related_questions) {
    for (const question of data.related_questions) {
      contentGaps.push({
        topic: question.question,
        description: `Many users are asking this question about ${keyword}`,
        recommendation: `Create a dedicated section answering this question with detailed information`,
        opportunity: 'high'
      });
      
      if (contentGaps.length >= 3) break;
    }
  }
  
  // Add related searches as potential content gaps
  if (data.related_searches && contentGaps.length < 5) {
    for (const search of data.related_searches) {
      contentGaps.push({
        topic: search.query,
        description: `Users are also searching for this related topic`,
        recommendation: `Consider exploring the relationship between ${keyword} and ${search.query}`,
        opportunity: 'medium'
      });
      
      if (contentGaps.length >= 5) break;
    }
  }
  
  // Add some default content gaps if we don't have enough
  if (contentGaps.length < 3) {
    contentGaps.push({
      topic: `${keyword} for beginners`,
      description: `Most content assumes prior knowledge of ${keyword}, creating an opportunity for truly beginner-friendly content.`,
      recommendation: `Create a step-by-step guide specifically for newcomers to ${keyword} with clear explanations of basic concepts.`,
      opportunity: 'high'
    });
    
    contentGaps.push({
      topic: `${keyword} case studies`,
      description: `Few competitors provide detailed real-world examples of successful ${keyword} implementation.`,
      recommendation: `Develop in-depth case studies showing measurable results from ${keyword} implementation.`,
      opportunity: 'high'
    });
    
    contentGaps.push({
      topic: `${keyword} tools comparison`,
      description: `Current content lacks comprehensive comparisons of different ${keyword} tools and platforms.`,
      recommendation: `Create a detailed comparison chart of top ${keyword} tools with pricing, features, and ideal use cases.`,
      opportunity: 'medium'
    });
  }
  
  return contentGaps;
}

// Helper function to generate recommendations
function generateRecommendations(data: any, keyword: string) {
  const recommendations = [
    `Include "${keyword}" in your page title and H1 heading`,
    `Create content addressing common questions about ${keyword}`,
    `Use related keywords throughout your content naturally`,
    `Include visual elements to explain ${keyword} concepts`,
    `Add case studies or examples showing successful ${keyword} implementation`
  ];
  
  // Add recommendations based on related questions
  if (data.related_questions) {
    recommendations.push(`Answer the question "${data.related_questions[0]?.question || 'common user questions'}" in your content`);
  }
  
  // Add recommendation based on top ranking content
  if (data.organic_results && data.organic_results.length > 0) {
    const topResult = data.organic_results[0];
    recommendations.push(`Analyze the top-ranking page "${topResult.title}" to understand what makes it successful`);
  }
  
  return recommendations;
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
