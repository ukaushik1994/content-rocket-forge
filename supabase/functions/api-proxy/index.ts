
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

    // Call the real SerpAPI service
    try {
      console.log(`Calling SerpAPI search for keyword "${keyword}" in country "${country}"`);
      const url = new URL('https://serpapi.com/search');
      url.searchParams.append('q', keyword);
      url.searchParams.append('engine', 'google');
      url.searchParams.append('google_domain', 'google.com');
      url.searchParams.append('gl', country);
      url.searchParams.append('hl', 'en');
      url.searchParams.append('api_key', SERP_API_KEY);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
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
      url.searchParams.append('api_key', SERP_API_KEY);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
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
      url.searchParams.append('api_key', SERP_API_KEY);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SerpAPI error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Use the SERP data to create content analysis
      const contentAnalysis = {
        keyword: mainKeyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000, // Random as SerpAPI doesn't provide this
        competitionScore: Math.random(), // Random score between 0-1
        keywordDifficulty: Math.floor(Math.random() * 100), // Random score between 0-100
        
        // Extract real data from SERP results
        topResults: (data.organic_results || []).slice(0, 5).map((result: any, index: number) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet || '',
          position: index + 1
        })),
        
        relatedSearches: (data.related_searches || []).map((search: any) => ({
          query: search.query,
          volume: Math.floor(Math.random() * 5000) + 500 // Random as SerpAPI doesn't provide volume
        })),
        
        peopleAlsoAsk: (data.related_questions || []).map((question: any) => ({
          question: question.question,
          source: question.source || 'Google Search',
          answer: question.answer || 'No answer available'
        })),
        
        // Add recommendations based on the content and keywords
        recommendations: generateContentRecommendations(content, keywords, data),
        
        // Use keywords from the parameters
        keywords: keywords,
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
      `Create content addressing common questions about ${keyword}`,
      `Use related keywords throughout your content naturally`,
      `Include visual elements to explain ${keyword} concepts`,
      `Add case studies or examples showing successful ${keyword} implementation`
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
