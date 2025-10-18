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

    // Get WordPress connection
    const { data: connection, error: connectionError } = await supabase
      .from('website_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'wordpress')
      .single();

    if (connectionError || !connection) {
      throw new Error('WordPress connection not found');
    }

    // Test WordPress REST API
    const wpUrl = `${connection.site_url}/wp-json/wp/v2/users/me`;
    const credentials = btoa(`${connection.username}:${connection.app_password}`);
    
    console.log('Testing WordPress connection to:', wpUrl);
    
    const response = await fetch(wpUrl, {
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `WordPress API returned ${response.status}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userData = await response.json();
    console.log('WordPress connection successful for user:', userData.name);

    return new Response(
      JSON.stringify({
        success: true,
        username: userData.name,
        email: userData.email,
        capabilities: userData.capabilities
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in test-wordpress-connection:', error);
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