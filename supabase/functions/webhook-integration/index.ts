import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequest {
  action: 'create' | 'update' | 'delete' | 'trigger';
  webhookId?: string;
  url?: string;
  events?: string[];
  secret?: string;
  payload?: any;
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
      const request: WebhookRequest = await req.json();
      
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

      console.log(`Webhook ${request.action} request from user:`, user.id);

      switch (request.action) {
        case 'create':
          if (!request.url || !request.events) {
            return new Response(
              JSON.stringify({ error: 'URL and events are required for webhook creation' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const { data: webhook, error: createError } = await supabaseClient
            .from('webhooks')
            .insert({
              user_id: user.id,
              url: request.url,
              events: request.events,
              secret: request.secret || crypto.randomUUID(),
              status: 'active',
              success_count: 0,
              failure_count: 0
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating webhook:', createError);
            return new Response(
              JSON.stringify({ error: 'Failed to create webhook' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, webhook }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );

        case 'trigger':
          if (!request.payload || !request.webhookId) {
            return new Response(
              JSON.stringify({ error: 'Payload and webhookId are required for triggering' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Get webhook details
          const { data: webhookDetails, error: webhookError } = await supabaseClient
            .from('webhooks')
            .select('*')
            .eq('id', request.webhookId)
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

          if (webhookError || !webhookDetails) {
            return new Response(
              JSON.stringify({ error: 'Webhook not found or inactive' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Trigger the webhook
          try {
            const response = await fetch(webhookDetails.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': webhookDetails.secret,
                'User-Agent': 'Creaiter-Webhook/1.0'
              },
              body: JSON.stringify({
                ...request.payload,
                timestamp: new Date().toISOString(),
                webhook_id: webhookDetails.id
              })
            });

            // Update webhook stats
            if (response.ok) {
              await supabaseClient
                .from('webhooks')
                .update({ 
                  success_count: webhookDetails.success_count + 1,
                  last_triggered: new Date().toISOString()
                })
                .eq('id', webhookDetails.id);
            } else {
              await supabaseClient
                .from('webhooks')
                .update({ 
                  failure_count: webhookDetails.failure_count + 1,
                  last_triggered: new Date().toISOString()
                })
                .eq('id', webhookDetails.id);
            }

            return new Response(
              JSON.stringify({
                success: response.ok,
                status: response.status,
                webhook_id: webhookDetails.id
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          } catch (error) {
            console.error('Webhook trigger error:', error);
            
            // Update failure count
            await supabaseClient
              .from('webhooks')
              .update({ 
                failure_count: webhookDetails.failure_count + 1,
                last_triggered: new Date().toISOString()
              })
              .eq('id', webhookDetails.id);

            return new Response(
              JSON.stringify({ error: 'Failed to trigger webhook', success: false }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook integration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});