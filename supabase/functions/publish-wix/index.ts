import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { corsHeaders } from '../_shared/cors.ts';

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

    // Parse request body
    const body = await req.json();
    const { title, contentMd, slug, excerpt, tags } = body;

    if (!title || !contentMd) {
      throw new Error('Title and content are required');
    }

    console.log('Publishing to Wix site:', connection.site_id);

    // Convert Markdown to Wix Ricos format (inline conversion)
    const lines = contentMd.split('\n');
    const nodes: any[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        nodes.push({
          type: 'PARAGRAPH',
          nodes: [{
            type: 'TEXT',
            textData: {
              text: currentParagraph.join('\n'),
              decorations: []
            }
          }]
        });
        currentParagraph = [];
      }
    };

    for (const line of lines) {
      if (line.startsWith('# ')) {
        flushParagraph();
        nodes.push({
          type: 'HEADING',
          headingData: { level: 1 },
          nodes: [{ type: 'TEXT', textData: { text: line.substring(2).trim(), decorations: [] } }]
        });
      } else if (line.startsWith('## ')) {
        flushParagraph();
        nodes.push({
          type: 'HEADING',
          headingData: { level: 2 },
          nodes: [{ type: 'TEXT', textData: { text: line.substring(3).trim(), decorations: [] } }]
        });
      } else if (line.startsWith('### ')) {
        flushParagraph();
        nodes.push({
          type: 'HEADING',
          headingData: { level: 3 },
          nodes: [{ type: 'TEXT', textData: { text: line.substring(4).trim(), decorations: [] } }]
        });
      } else if (line.trim() === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    }
    flushParagraph();

    const richContent = { nodes, documentStyle: {} };

    // Get API key from connection configuration
    const apiKey = connection.api_key;
    if (!apiKey) {
      throw new Error('Wix API key not found in connection');
    }

    // Create draft post payload for Wix Blog v3 API
    const draftPayload = {
      draftPost: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: excerpt || '',
        richContent,
        tagNames: tags || []
      }
    };

    // Create draft post using Wix Blog v3 API
    const draftUrl = 'https://www.wixapis.com/blog/v3/draft-posts';
    const draftResponse = await fetch(draftUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'wix-site-id': connection.site_id,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(draftPayload)
    });

    if (!draftResponse.ok) {
      const errorText = await draftResponse.text();
      console.error('Wix draft API error:', draftResponse.status, errorText);
      throw new Error(`Wix API returned ${draftResponse.status}: ${errorText}`);
    }

    const draftData = await draftResponse.json();
    const draftId = draftData.draftPost?.id;
    
    if (!draftId) {
      throw new Error('Failed to get draft ID from Wix response');
    }

    console.log('Wix draft post created:', draftId);

    // Publish the draft using Wix Blog v3 API
    const publishUrl = `https://www.wixapis.com/blog/v3/draft-posts/${draftId}/publish`;
    const publishResponse = await fetch(publishUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'wix-site-id': connection.site_id,
        'Content-Type': 'application/json'
      }
    });

    if (!publishResponse.ok) {
      const errorText = await publishResponse.text();
      console.error('Wix publish API error:', publishResponse.status, errorText);
      throw new Error(`Failed to publish: ${errorText}`);
    }

    const publishData = await publishResponse.json();
    const postId = publishData.post?.id;

    if (!postId) {
      throw new Error('Failed to get post ID from publish response');
    }

    // Get post URL using Wix Blog v3 API
    const getUrl = `https://www.wixapis.com/blog/v3/posts/${postId}?fieldsets=URL`;
    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
        'wix-site-id': connection.site_id
      }
    });

    let postUrl = `https://${connection.site_name || connection.site_id}.wixsite.com/blog/${slug || ''}`;
    
    if (getResponse.ok) {
      const postData = await getResponse.json();
      postUrl = postData.post?.url || postUrl;
    }

    console.log('Wix post published:', postId);

    return new Response(
      JSON.stringify({
        ok: true,
        postId,
        url: postUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in publish-wix:', error);
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
