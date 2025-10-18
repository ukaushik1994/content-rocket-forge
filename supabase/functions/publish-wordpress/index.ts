import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';
import { marked } from 'https://esm.sh/marked@11.1.1';

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

    // Parse request body
    const body = await req.json();
    const { title, contentMd, slug, excerpt, tags, categories, status = 'draft' } = body;

    if (!title || !contentMd) {
      throw new Error('Title and content are required');
    }

    console.log('Publishing to WordPress:', connection.site_url);

    // Convert Markdown to HTML using marked library
    const htmlContent = marked.parse(contentMd, { 
      gfm: true, // GitHub Flavored Markdown
      breaks: true // Convert line breaks to <br>
    }) as string;

    // Create post payload
    const postPayload: any = {
      title,
      content: htmlContent,
      status,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: excerpt || ''
    };

    // Add tags if provided
    if (tags && tags.length > 0) {
      postPayload.tags = tags;
    }

    // Add categories if provided
    if (categories && categories.length > 0) {
      postPayload.categories = categories;
    }

    // Publish to WordPress
    const wpUrl = `${connection.site_url}/wp-json/wp/v2/posts`;
    const credentials = btoa(`${connection.username}:${connection.app_password}`);
    
    const response = await fetch(wpUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      throw new Error(`WordPress API returned ${response.status}: ${errorText}`);
    }

    const postData = await response.json();
    console.log('WordPress post created:', postData.id);

    return new Response(
      JSON.stringify({
        ok: true,
        postId: postData.id.toString(),
        url: postData.link
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in publish-wordpress:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
