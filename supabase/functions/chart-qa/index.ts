import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, charts, context, previousInsights, conversationHistory } = await req.json();
    
    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Get user's active AI provider
    const { data: providers, error: providerError } = await supabaseAdmin
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('priority', { ascending: true });
    
    if (providerError) {
      console.error('Error fetching AI providers:', providerError);
      throw new Error('Failed to fetch AI provider configuration');
    }
    
    const selectedProvider = providers?.[0];
    if (!selectedProvider) {
      throw new Error('No active AI provider configured. Please set up an AI provider in Settings.');
    }
    
    console.log(`✅ Using ${selectedProvider.provider} for chart Q&A`);
    
    console.log('📊 Chart Q&A Request:', {
      question,
      chartCount: charts?.length || 0,
      hasContext: !!context,
      hasInsights: !!previousInsights,
      historyLength: conversationHistory?.length || 0
    });

    // Build enriched context for AI
    const chartSummary = charts?.map((c: any, idx: number) => {
...
- If the question is unclear, ask for clarification`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-8), // Last 8 messages for context
      { role: 'user', content: question }
    ];

    console.log(`🤖 Calling ${selectedProvider.provider} with`, messages.length, 'messages');

    const { data: aiResponse, error: aiError } = await supabaseAdmin.functions.invoke('ai-proxy', {
      body: {
        service: selectedProvider.provider,
        endpoint: 'chat',
        apiKey: selectedProvider.api_key,
        params: {
          model: selectedProvider.preferred_model,
          messages,
          temperature: 0.7,
          max_tokens: 500
        }
      }
    });

    if (aiError) {
      console.error('❌ AI API error:', aiError);
      throw new Error(`AI API error: ${aiError.message || 'Unknown error'}`);
    }

    const answer = aiResponse?.choices?.[0]?.message?.content || 
                  aiResponse?.data?.choices?.[0]?.message?.content ||
                  'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

    console.log('✅ AI response generated successfully');

    return new Response(
      JSON.stringify({ answer }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in chart-qa:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to answer question',
        answer: "I'm having trouble analyzing the data right now. Please try again in a moment."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
