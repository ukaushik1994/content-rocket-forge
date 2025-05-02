
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
    return {
      results: [
        { 
          title: `Search results for: ${params.query}`, 
          link: 'https://example.com/1',
          snippet: 'This is a mock search result for your query.',
          position: 1
        },
        { 
          title: `More about: ${params.query}`, 
          link: 'https://example.com/2',
          snippet: 'Another mock result with some different content.',
          position: 2
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }
    
    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new Error('Invalid token format');
    }
    
    // Verify the JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized: Invalid user token');
    }
    
    // Parse request data
    const { service, endpoint, params } = await req.json();
    
    if (!service || !endpoint) {
      throw new Error('Missing required parameters: service and endpoint');
    }
    
    // Get API key from database
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('service', service.toLowerCase())
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();
      
    if (apiKeyError || !apiKeyData) {
      throw new Error(`No valid API key found for ${service}`);
    }
    
    let responseData;
    
    // Handle different service types
    switch(service.toLowerCase()) {
      case 'serp':
        // Use mock SERP service in development
        if (endpoint === 'search') {
          responseData = mockSerpService.search(params);
        } else if (endpoint === 'analyze') {
          responseData = mockSerpService.analyze(params);
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
