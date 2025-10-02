import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
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

    console.log(`Using AI provider: ${provider.provider} with model: ${provider.preferred_model}`);

    // Call ai-proxy edge function
    const { data: aiProxyResult, error: aiProxyError } = await supabase.functions.invoke('ai-proxy', {
      body: {
        service: provider.provider,
        endpoint: 'chat',
        apiKey: provider.api_key,
        params: {
          model: provider.preferred_model,
          messages: [
            {
              role: "system",
              content: "You are an intelligent workflow orchestration assistant. You help users create, execute, and manage complex multi-step workflows that integrate multiple solutions and AI capabilities. You can decompose complex tasks into manageable steps, suggest optimal solution integrations, and execute workflows with real-time progress tracking. Focus on being practical, efficient, and solution-aware in your recommendations.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }
      }
    });

    if (aiProxyError || !aiProxyResult?.success) {
      console.error("AI request failed:", aiProxyError?.message || aiProxyResult?.error);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = aiProxyResult.data;
    const aiMessage = data?.choices?.[0]?.message?.content;

    if (!aiMessage) {
      console.error("No response from AI", data);
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ response: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in AI call:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
