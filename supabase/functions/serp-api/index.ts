
// Follow Supabase Edge Function patterns for handling SERP API requests
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client using Deno runtime environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get the SERP API key from Supabase secrets
const SERP_API_KEY = Deno.env.get('SERP_API_KEY') || '';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { endpoint, params, apiKey } = await req.json();
    
    // Use the API key from Supabase secrets or the one provided in the request
    const keyToUse = SERP_API_KEY || apiKey;
    
    if (!keyToUse) {
      return new Response(
        JSON.stringify({ error: 'No API key available' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Log the request for debugging
    console.log(`SERP API request to endpoint: ${endpoint}`, params);

    // Define base URL for SERP API
    const baseUrl = 'https://api.serphouse.com/serp';
    
    // Build appropriate URL and params based on endpoint
    let url, queryParams;
    
    switch (endpoint) {
      case 'analyze':
        url = `${baseUrl}/analyze`;
        queryParams = new URLSearchParams({
          keyword: params.keyword || '',
          ...(params.refresh ? { refresh: 'true' } : {})
        });
        break;
        
      case 'search':
        url = `${baseUrl}/search`;
        queryParams = new URLSearchParams({
          q: params.q || '',
          limit: params.limit?.toString() || '10'
        });
        break;
        
      case 'related':
        url = `${baseUrl}/related`;
        queryParams = new URLSearchParams({
          keyword: params.keyword || ''
        });
        break;
        
      case 'test':
        // Just test if the API key works with a minimal request
        url = `${baseUrl}/analyze`;
        queryParams = new URLSearchParams({
          keyword: 'test query',
          limit: '1'
        });
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
    }

    // Make the actual API call
    try {
      const response = await fetch(`${url}?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Get response data
      const data = await response.json();
      
      // Check if the response was successful
      if (!response.ok) {
        console.error('SERP API error:', response.status, data);
        return new Response(
          JSON.stringify({ 
            error: 'SERP API error', 
            status: response.status,
            message: data.message || 'Unknown error'
          }),
          { 
            status: response.status, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
      
      // If this was a test request, return simplified success response
      if (endpoint === 'test') {
        return new Response(
          JSON.stringify({ success: true, message: 'API key works correctly' }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }
      
      // Return the API response
      return new Response(
        JSON.stringify(data),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    } catch (error) {
      console.error('Error calling SERP API:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to call SERP API', message: error.message }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Invalid request', message: error.message }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
