import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from '../shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    let userId: string | undefined;

    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user && !error) {
        userId = user.id;
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('🔢 Generating embedding for text length:', text.length);

    // Get user's active AI provider from database
    const { data: provider, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (providerError || !provider) {
      console.error("No active AI provider configured");
      return new Response(JSON.stringify({ error: "No active AI provider configured. Please configure your AI service in Settings." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Using AI provider: ${provider.provider} for embeddings`);

    // Call ai-proxy edge function for embeddings
    const { data: aiProxyResult, error: aiProxyError } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'embeddings',
        apiKey: provider.api_key,
        params: {
          model: "text-embedding-3-small",
          input: text,
        }
      }
    });

    if (aiProxyError || !aiProxyResult?.success) {
      console.error("AI request failed:", aiProxyError?.message || aiProxyResult?.error);
      return new Response(JSON.stringify({ error: "Failed to generate embedding" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = aiProxyResult.data;
    const data = response;
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      console.error("Invalid embedding response:", data);
      return new Response(JSON.stringify({ error: "Invalid embedding response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('✅ Successfully generated embedding, dimensions:', embedding.length);

    return new Response(JSON.stringify({ embedding }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-embedding function:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
