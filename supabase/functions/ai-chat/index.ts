
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, context, userId } = await req.json();
    
    console.log('🚀 Processing AI chat request with', messages.length, 'messages');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's AI provider configuration
    const { data: userKeys, error: keysError } = await supabase
      .from('user_llm_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (keysError) {
      console.error('Error fetching user keys:', keysError);
    }

    // Priority: OpenRouter > Anthropic > OpenAI > others
    const openrouterKey = userKeys?.find(k => k.provider === 'openrouter');
    const anthropicKey = userKeys?.find(k => k.provider === 'anthropic');
    const openaiKey = userKeys?.find(k => k.provider === 'openai');

    let aiResponse, modelUsed, provider, usage;

    // Try OpenRouter first (recommended)
    if (openrouterKey?.api_key) {
      console.log('🎯 Using OpenRouter for AI chat');
      try {
        const result = await callOpenRouter(openrouterKey.api_key, openrouterKey.model || 'openai/gpt-4o-mini', messages);
        aiResponse = result.response;
        modelUsed = result.model;
        provider = 'openrouter';
        usage = result.usage;
      } catch (error) {
        console.error('OpenRouter failed, trying fallback:', error);
      }
    }

    // Fallback to Anthropic
    if (!aiResponse && anthropicKey?.api_key) {
      console.log('🔄 Falling back to Anthropic');
      try {
        const result = await callAnthropic(anthropicKey.api_key, anthropicKey.model || 'claude-3-haiku-20240307', messages);
        aiResponse = result.response;
        modelUsed = result.model;
        provider = 'anthropic';
        usage = result.usage;
      } catch (error) {
        console.error('Anthropic failed, trying OpenAI:', error);
      }
    }

    // Fallback to OpenAI
    if (!aiResponse && (openaiKey?.api_key || Deno.env.get('OPENAI_API_KEY'))) {
      console.log('🔄 Falling back to OpenAI');
      try {
        const apiKey = openaiKey?.api_key || Deno.env.get('OPENAI_API_KEY');
        const result = await callOpenAI(apiKey, openaiKey?.model || 'gpt-4o-mini', messages);
        aiResponse = result.response;
        modelUsed = result.model;
        provider = 'openai';
        usage = result.usage;
      } catch (error) {
        console.error('All providers failed:', error);
      }
    }

    if (!aiResponse) {
      throw new Error('No AI provider configured or available. Please configure OpenRouter, Anthropic, or OpenAI in Settings.');
    }

    // Log usage to database
    if (usage && userId) {
      await supabase.from('llm_usage_logs').insert({
        user_id: userId,
        provider,
        model: modelUsed,
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0,
        cost_estimate: calculateCost(provider, modelUsed, usage.prompt_tokens || 0, usage.completion_tokens || 0),
        request_type: 'chat',
        success: true
      });
    }

    return new Response(
      JSON.stringify({ 
        message: aiResponse,
        model: modelUsed,
        provider,
        usage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ AI Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function callOpenRouter(apiKey: string, model: string, messages: any[]) {
  const systemPrompt = buildSystemPrompt();
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-app.com',
      'X-Title': 'AI Content Assistant'
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0]?.message?.content,
    model: data.model || model,
    usage: data.usage
  };
}

async function callAnthropic(apiKey: string, model: string, messages: any[]) {
  const systemPrompt = buildSystemPrompt();
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.filter(m => m.role !== 'system')
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Anthropic API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.content[0]?.text,
    model: data.model || model,
    usage: data.usage
  };
}

async function callOpenAI(apiKey: string, model: string, messages: any[]) {
  const systemPrompt = buildSystemPrompt();
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return {
    response: data.choices[0]?.message?.content,
    model: data.model || model,
    usage: data.usage
  };
}

function buildSystemPrompt(): string {
  return `You are an AI Content Creation Assistant that helps users with all aspects of content marketing, SEO, and strategy.

Your capabilities include:
- Content strategy and planning
- SEO optimization and keyword research
- Blog post and article writing
- Content repurposing across formats
- Marketing copy and social media content
- Analytics insights and recommendations

Always provide helpful, actionable advice. When appropriate, suggest next steps or tools the user can use. Be conversational but professional, and focus on practical, implementable solutions.

If users ask about content creation, SEO, keywords, or marketing strategy, provide comprehensive guidance and suggest they use the platform's tools for implementation.`;
}

function calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
  // Simplified cost calculation - you can enhance this based on actual pricing
  const costs: Record<string, Record<string, { input: number; output: number }>> = {
    openrouter: {
      'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'openai/gpt-4o': { input: 0.005, output: 0.015 },
      'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 }
    },
    anthropic: {
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
    },
    openai: {
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4o': { input: 0.005, output: 0.015 }
    }
  };

  const modelCosts = costs[provider]?.[model];
  if (!modelCosts) return 0;

  return (promptTokens * modelCosts.input / 1000) + (completionTokens * modelCosts.output / 1000);
}
