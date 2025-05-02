
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
    
    // For demonstration purposes - in a real app, we would call the actual API here
    // This is a mockup response
    const mockResponse = {
      status: 'success',
      service: service,
      endpoint: endpoint,
      data: {
        results: [
          { title: 'Example result 1', snippet: 'This is an example result from the proxy API.' },
          { title: 'Example result 2', snippet: 'This would be real data from the actual API in production.' }
        ],
        timestamp: new Date().toISOString()
      }
    };
    
    return new Response(
      JSON.stringify(mockResponse),
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
