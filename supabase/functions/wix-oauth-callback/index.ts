import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../shared/cors.ts';

const WIX_TOKEN_URL = 'https://www.wix.com/oauth/access';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      throw new Error('Authorization code not provided');
    }

    // Get Wix app credentials from environment
    const clientId = Deno.env.get('WIX_CLIENT_ID');
    const clientSecret = Deno.env.get('WIX_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Wix credentials not configured');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch(WIX_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const tokenData = await tokenResponse.json();
    
    // Get site information using the access token
    const siteInfoResponse = await fetch('https://www.wixapis.com/site-properties/v4/properties', {
      headers: {
        'Authorization': tokenData.access_token,
      },
    });

    let siteInfo = { displayName: 'Wix Site' };
    if (siteInfoResponse.ok) {
      siteInfo = await siteInfoResponse.json();
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

    // Save connection to database
    const { error: dbError } = await supabaseClient
      .from('website_connections')
      .upsert({
        user_id: user.id,
        provider: 'wix',
        site_id: tokenData.instance_id || 'unknown',
        refresh_token: tokenData.refresh_token,
        access_token: tokenData.access_token,
        token_expires_at: expiresAt.toISOString(),
        site_name: siteInfo.displayName || 'Wix Site',
        site_email: user.email,
        scopes: tokenData.scope?.split(',') || [],
        is_active: true,
        connection_status: 'connected',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save connection');
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Wix site connected successfully',
        site_name: siteInfo.displayName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
