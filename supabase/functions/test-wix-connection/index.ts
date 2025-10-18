import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get Wix connection
    const { data: connection, error: connectionError } = await supabase
      .from('website_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'wix')
      .single();

    if (connectionError || !connection) {
      throw new Error('Wix connection not found');
    }

    // Test Wix API with API key
    const wixApiUrl = 'https://www.wixapis.com/v2/posts';
    
    console.log('Testing Wix connection');
    
    const response = await fetch(wixApiUrl, {
      headers: {
        'Authorization': connection.api_key,
        'wix-site-id': connection.site_id
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Wix API error:', response.status, errorText);
      
      // If token expired, could implement refresh logic here
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Wix API returned ${response.status}. Token may have expired.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Wix connection successful');

    return new Response(
      JSON.stringify({
        success: true,
        siteId: connection.site_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-wix-connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});