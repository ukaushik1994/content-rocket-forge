import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock SERP API service for development
const mockSerpService = {
  search: (params: any) => {
    const query = params.query || 'default query';
    return {
      results: [
        { 
          title: `Search results for: ${query}`, 
          link: 'https://example.com/1',
          snippet: `This is a search result for ${query}. It contains relevant information about the topic you're looking for.`,
          position: 1
        },
        { 
          title: `More about: ${query}`, 
          link: 'https://example.com/2',
          snippet: `Another result with different content about ${query} including details, examples, and use cases.`,
          position: 2
        },
        {
          title: `${query} guide for beginners`, 
          link: 'https://example.com/3',
          snippet: `A comprehensive guide to understanding and mastering ${query} with step-by-step instructions.`,
          position: 3
        },
        {
          title: `${query} best practices in 2025`, 
          link: 'https://example.com/4',
          snippet: `Learn the latest best practices and techniques for ${query} that experts recommend for 2025.`,
          position: 4
        }
      ],
      timestamp: new Date().toISOString()
    };
  },
  analyze: (params: any) => {
    return {
      keywords: params.keywords || ['content', 'marketing', 'seo'],
      searchVolume: 1200,
      competitionScore: 0.65,
      recommendations: [
        'Add more specific details about your target audience',
        'Include more statistics to back up your claims',
        'Consider adding a section about recent trends',
        'Your content readability score is good, keep paragraphs short'
      ],
      timestamp: new Date().toISOString()
    };
  },
  'analyze-keyword': (params: any) => {
    const keyword = params.keyword || 'default keyword';
    return {
      keywords: [keyword, `${keyword} best practices`, `how to use ${keyword}`, `${keyword} examples`, `${keyword} alternatives`, `${keyword} for beginners`],
      searchVolume: Math.floor(Math.random() * 10000) + 1000,
      competitionScore: (Math.random() * 0.9 + 0.1).toFixed(2),
      keywordDifficulty: Math.floor(Math.random() * 100),
      recommendations: [
        'Create comprehensive guides with step-by-step instructions',
        'Include real-world case studies and examples',
        'Add expert quotes or interviews for credibility',
        'Use data visualization to explain complex concepts'
      ],
      peopleAlsoAsk: [
        {
          question: `What is the best ${keyword}?`,
          answer: `The best ${keyword} depends on your specific needs and goals. Many experts recommend starting with...`,
          source: 'https://example.com/best-options'
        },
        {
          question: `How much does ${keyword} cost?`,
          answer: `Pricing for ${keyword} typically ranges from $50-500 per month depending on features and scale...`,
          source: 'https://example.com/pricing'
        },
        {
          question: `Is ${keyword} worth it for small businesses?`,
          answer: `Small businesses can benefit from ${keyword} by focusing on core features that drive ROI...`,
          source: 'https://example.com/small-business'
        },
        {
          question: `What are alternatives to ${keyword}?`,
          answer: `Popular alternatives include ProductX, ServiceY, and PlatformZ, each with unique strengths...`,
          source: 'https://example.com/alternatives'
        },
        {
          question: `How to get started with ${keyword}?`,
          answer: `Getting started with ${keyword} involves setting up your account, configuring basic settings...`,
          source: 'https://example.com/getting-started'
        }
      ],
      relatedSearches: [
        { query: `best ${keyword} tools`, volume: 850 },
        { query: `${keyword} vs competition`, volume: 720 },
        { query: `${keyword} tutorial`, volume: 1500 },
        { query: `free ${keyword} alternatives`, volume: 950 },
        { query: `${keyword} pricing comparison`, volume: 600 },
        { query: `${keyword} for beginners`, volume: 1200 }
      ],
      topResults: [
        { 
          title: `10 Best ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Tools in 2025`, 
          link: 'https://example.com/best-tools',
          snippet: `Looking for the best ${keyword} options? Our expert team has tested over 30 different solutions to bring you the definitive ranking...`,
          position: 1
        },
        { 
          title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}: The Complete Guide (Updated for 2025)`, 
          link: 'https://example.com/complete-guide',
          snippet: `Everything you need to know about ${keyword}, from basic concepts to advanced techniques. Updated with the latest trends and tools for 2025.`,
          position: 2
        },
        { 
          title: `How to Choose the Right ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} for Your Business`, 
          link: 'https://example.com/how-to-choose',
          snippet: `Confused about which ${keyword} solution is right for you? This step-by-step guide will help you make the perfect choice based on your specific needs.`,
          position: 3
        }
      ],
      featuredSnippets: [
        {
          type: 'definition',
          content: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} is a systematic process that helps businesses optimize their online content to improve visibility, drive traffic, and increase conversions.`,
          source: 'https://example.com/definition'
        },
        {
          type: 'list',
          content: `1. Research your audience and competitors\n2. Analyze keyword opportunities\n3. Create high-quality content\n4. Optimize for search engines\n5. Build quality backlinks\n6. Monitor and adjust your strategy`,
          source: 'https://example.com/steps'
        }
      ],
      imagePacks: [
        {
          title: `${keyword} infographic`,
          url: 'https://example.com/images/infographic',
          thumbnailUrl: 'https://example.com/thumbnails/infographic.jpg'
        },
        {
          title: `${keyword} comparison chart`,
          url: 'https://example.com/images/chart',
          thumbnailUrl: 'https://example.com/thumbnails/chart.jpg'
        }
      ],
      knowledgeGraph: {
        title: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        description: `A systematic approach to improving online visibility and reaching a target audience through search engines.`,
        entityType: 'Concept',
        attributes: {
          'Key components': 'Keywords, Content, Technical SEO, Link building',
          'Related fields': 'Digital marketing, Content marketing, Web development'
        }
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Mock OpenAI service for development
const mockOpenAIService = {
  complete: (params: any) => {
    return {
      completion: `This is a mock completion for your prompt: ${params.prompt.substring(0, 50)}...`,
      usage: {
        prompt_tokens: 10,
        completion_tokens: 50,
        total_tokens: 60
      },
      timestamp: new Date().toISOString()
    };
  },
  analyze: (params: any) => {
    return {
      analysis: `Content analysis: This is a well-structured piece of content with good keyword usage. Consider adding more specific examples to support your main points. The target audience seems to be business professionals.`,
      score: 8.5,
      timestamp: new Date().toISOString()
    };
  }
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request data
    const { service, endpoint, params } = await req.json();
    
    if (!service || !endpoint) {
      throw new Error('Missing required parameters: service and endpoint');
    }
    
    let responseData;
    
    // Handle different service types
    switch(service.toLowerCase()) {
      case 'serp':
        console.log(`Processing SERP API request: ${endpoint}`);
        // Use mock SERP service in development
        if (endpoint === 'search') {
          responseData = mockSerpService.search(params);
        } else if (endpoint === 'analyze') {
          responseData = mockSerpService.analyze(params);
        } else if (endpoint === 'analyze-keyword') {
          responseData = mockSerpService['analyze-keyword'](params);
        } else {
          throw new Error(`Unknown SERP endpoint: ${endpoint}`);
        }
        break;
        
      case 'openai':
        // Use mock OpenAI service in development
        if (endpoint === 'complete') {
          responseData = mockOpenAIService.complete(params);
        } else if (endpoint === 'analyze') {
          responseData = mockOpenAIService.analyze(params);
        } else {
          throw new Error(`Unknown OpenAI endpoint: ${endpoint}`);
        }
        break;
        
      default:
        throw new Error(`Unsupported service: ${service}`);
    }
    
    // Add random delay to simulate API latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
