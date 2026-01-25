import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { getCorsHeaders } from '../shared/cors.ts';
import { marked } from 'https://esm.sh/marked@11.1.1';
import DOMPurify from 'https://esm.sh/isomorphic-dompurify@2.3.0';

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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
    const { title, contentMd, slug, excerpt, tags, categories, status = 'draft', scheduledAt } = body;

    if (!title || !contentMd) {
      throw new Error('Title and content are required');
    }

    console.log('Publishing to WordPress:', connection.site_url);

    // Convert Markdown to HTML using marked library
    const rawHtml = marked.parse(contentMd, { 
      gfm: true, // GitHub Flavored Markdown
      breaks: true // Convert line breaks to <br>
    }) as string;

    // SECURITY: Sanitize HTML to prevent XSS attacks
    const htmlContent = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'ul', 'ol', 'li',
        'strong', 'em', 'b', 'i', 'u', 's', 'strike',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span',
        'figure', 'figcaption',
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height',
        'colspan', 'rowspan', 'scope',
      ],
      ALLOW_DATA_ATTR: false,
    });

    // Create credentials for WordPress API
    const credentials = btoa(`${connection.username}:${connection.app_password}`);

    // Helper function to resolve taxonomy IDs
    async function resolveTaxonomyIds(taxonomy: 'tags' | 'categories', names: string[]): Promise<number[]> {
      const ids: number[] = [];
      
      for (const name of names) {
        try {
          // Try to find existing
          const searchUrl = `${connection.site_url}/wp-json/wp/v2/${taxonomy}?search=${encodeURIComponent(name)}`;
          const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Basic ${credentials}` }
          });
          
          if (searchRes.ok) {
            const results = await searchRes.json();
            const existing = results.find((t: any) => 
              t.name.toLowerCase() === name.toLowerCase()
            );
            
            if (existing) {
              ids.push(existing.id);
              continue;
            }
          }
          
          // Create new if not found
          const createUrl = `${connection.site_url}/wp-json/wp/v2/${taxonomy}`;
          const createRes = await fetch(createUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
          });
          
          if (createRes.ok) {
            const created = await createRes.json();
            ids.push(created.id);
          }
        } catch (error) {
          console.error(`Error resolving ${taxonomy} "${name}":`, error);
        }
      }
      
      return ids;
    }

    // Create post payload
    const postPayload: any = {
      title: DOMPurify.sanitize(title), // Sanitize title too
      content: htmlContent,
      status,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      excerpt: excerpt ? DOMPurify.sanitize(excerpt) : ''
    };

    // Add scheduling if future date provided
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      postPayload.status = 'future';
      postPayload.date_gmt = new Date(scheduledAt).toISOString();
    }

    // Resolve and add tags if provided
    if (tags && tags.length > 0) {
      const tagIds = await resolveTaxonomyIds('tags', tags);
      if (tagIds.length > 0) {
        postPayload.tags = tagIds;
      }
    }

    // Resolve and add categories if provided
    if (categories && categories.length > 0) {
      const categoryIds = await resolveTaxonomyIds('categories', categories);
      if (categoryIds.length > 0) {
        postPayload.categories = categoryIds;
      }
    }

    // Publish to WordPress
    const wpUrl = `${connection.site_url}/wp-json/wp/v2/posts`;
    
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
    const origin = req.headers.get('origin');
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' } 
      }
    );
  }
});
