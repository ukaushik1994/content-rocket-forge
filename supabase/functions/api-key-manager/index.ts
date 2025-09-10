import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApiKeyRequest {
  action: 'store' | 'retrieve' | 'test' | 'delete';
  provider: string;
  apiKey?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const request: ApiKeyRequest = await req.json();
      
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

      console.log(`API Key ${request.action} request for ${request.provider} from user:`, user.id);

      switch (request.action) {
        case 'store':
          if (!request.apiKey) {
            return new Response(
              JSON.stringify({ error: 'API key is required' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Simple encryption (in production, use proper encryption)
          const encryptedKey = btoa(request.apiKey);

          const { error: storeError } = await supabaseClient
            .from('api_keys')
            .upsert({
              user_id: user.id,
              service: request.provider,
              encrypted_key: encryptedKey,
              is_active: true,
              updated_at: new Date().toISOString()
            });

          if (storeError) {
            console.error('Error storing API key:', storeError);
            return new Response(
              JSON.stringify({ error: 'Failed to store API key' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, message: 'API key stored successfully' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );

        case 'retrieve':
          const { data: keyData, error: retrieveError } = await supabaseClient
            .from('api_keys')
            .select('encrypted_key, is_active')
            .eq('user_id', user.id)
            .eq('service', request.provider)
            .eq('is_active', true)
            .single();

          if (retrieveError || !keyData) {
            return new Response(
              JSON.stringify({ error: 'API key not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          // Decrypt the key
          const decryptedKey = atob(keyData.encrypted_key);

          return new Response(
            JSON.stringify({ apiKey: decryptedKey }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );

        case 'test':
          // Get the stored API key
          const { data: testKeyData, error: testKeyError } = await supabaseClient
            .from('api_keys')
            .select('encrypted_key')
            .eq('user_id', user.id)
            .eq('service', request.provider)
            .eq('is_active', true)
            .single();

          if (testKeyError || !testKeyData) {
            return new Response(
              JSON.stringify({ error: 'API key not found for testing' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const testKey = atob(testKeyData.encrypted_key);

          // Test the API key based on provider
          let testResult = false;
          let testMessage = 'API key test failed';

          try {
            switch (request.provider) {
              case 'openai':
                const openaiResponse = await fetch('https://api.openai.com/v1/models', {
                  headers: {
                    'Authorization': `Bearer ${testKey}`,
                    'Content-Type': 'application/json'
                  }
                });
                testResult = openaiResponse.ok;
                testMessage = testResult ? 'OpenAI API key is valid' : 'OpenAI API key is invalid';
                break;

              case 'anthropic':
                const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'x-api-key': testKey,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                  },
                  body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'test' }]
                  })
                });
                testResult = anthropicResponse.status !== 401;
                testMessage = testResult ? 'Anthropic API key is valid' : 'Anthropic API key is invalid';
                break;

              default:
                testMessage = `Testing not implemented for ${request.provider}`;
            }
          } catch (error) {
            console.error(`Error testing ${request.provider} API key:`, error);
            testMessage = `Error testing ${request.provider} API key`;
          }

          return new Response(
            JSON.stringify({ success: testResult, message: testMessage }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );

        case 'delete':
          const { error: deleteError } = await supabaseClient
            .from('api_keys')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('service', request.provider);

          if (deleteError) {
            console.error('Error deleting API key:', deleteError);
            return new Response(
              JSON.stringify({ error: 'Failed to delete API key' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, message: 'API key deleted successfully' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );

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
    console.error('API key manager error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});