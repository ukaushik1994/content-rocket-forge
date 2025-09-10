import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const payload: WebhookPayload = await req.json();
      
      // Get user authentication from headers
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Verify JWT and get user
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Get user's webhooks
      const { data: webhooks, error: webhooksError } = await supabaseClient
        .from('webhooks')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (webhooksError) {
        console.error('Error fetching webhooks:', webhooksError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch webhooks' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Process webhooks that match the event
      const results = await Promise.allSettled(
        webhooks
          .filter(webhook => {
            const events = Array.isArray(webhook.events) ? webhook.events : [];
            return events.includes(payload.event) || events.includes('*');
          })
          .map(async (webhook) => {
            try {
              const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Webhook-Secret': webhook.secret,
                  'User-Agent': 'Creaiter-Webhook/1.0'
                },
                body: JSON.stringify(payload)
              });

              // Update webhook stats
              if (response.ok) {
                await supabaseClient
                  .from('webhooks')
                  .update({ 
                    success_count: webhook.success_count + 1,
                    last_triggered: new Date().toISOString()
                  })
                  .eq('id', webhook.id);
              } else {
                await supabaseClient
                  .from('webhooks')
                  .update({ 
                    failure_count: webhook.failure_count + 1,
                    last_triggered: new Date().toISOString()
                  })
                  .eq('id', webhook.id);
              }

              return {
                webhook_id: webhook.id,
                url: webhook.url,
                status: response.status,
                success: response.ok
              };
            } catch (error) {
              console.error(`Webhook ${webhook.id} failed:`, error);
              
              // Update failure count
              await supabaseClient
                .from('webhooks')
                .update({ 
                  failure_count: webhook.failure_count + 1,
                  last_triggered: new Date().toISOString()
                })
                .eq('id', webhook.id);

              return {
                webhook_id: webhook.id,
                url: webhook.url,
                error: error.message,
                success: false
              };
            }
          })
      );

      return new Response(
        JSON.stringify({
          success: true,
          processed: results.length,
          results: results.map(result => 
            result.status === 'fulfilled' ? result.value : { error: result.reason }
          )
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});