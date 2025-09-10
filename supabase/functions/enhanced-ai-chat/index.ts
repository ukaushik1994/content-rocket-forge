
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface EnhancedRequest {
  messages: ChatMessage[];
  userId: string;
  conversationId?: string;
  solutions?: any[];
  analytics?: any;
  workflowContext?: any;
  apiKeys?: {
    openrouter?: string;
    anthropic?: string;
    openai?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📨 Received request body:', JSON.stringify(body, null, 2));
    
    const { 
      messages, 
      userId, 
      conversationId, 
      solutions, 
      analytics, 
      workflowContext,
      context,
      apiKeys 
    }: EnhancedRequest & { context?: any } = body;
    
    // Handle nested context data from frontend
    const contextData = context || {};
    const finalSolutions = solutions || contextData.solutions || [];
    const finalAnalytics = analytics || contextData.analytics || {};
    const finalWorkflowContext = workflowContext || contextData.workflowContext || {};
    
    console.log('🚀 Processing enhanced AI chat request');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use API keys passed from frontend (already decrypted)
    console.log('🔑 Processing API keys from request:', Object.keys(apiKeys || {}));
    
    let openrouterKey = null;
    let anthropicKey = null; 
    let openaiKey = null;

    if (apiKeys?.openrouter) {
      openrouterKey = { api_key: apiKeys.openrouter, service: 'openrouter', model: 'openai/gpt-4o-mini' };
      console.log('✅ OpenRouter key available');
    }
    
    if (apiKeys?.anthropic) {
      anthropicKey = { api_key: apiKeys.anthropic, service: 'anthropic', model: 'claude-3-haiku-20240307' };
      console.log('✅ Anthropic key available');
    }
    
    if (apiKeys?.openai) {
      openaiKey = { api_key: apiKeys.openai, service: 'openai', model: 'gpt-4o-mini' };
      console.log('✅ OpenAI key available');
    }

    console.log(`🎯 OpenRouter key found: ${!!openrouterKey}, model: ${openrouterKey?.model}`);
    console.log(`🧠 Anthropic key found: ${!!anthropicKey}, model: ${anthropicKey?.model}`);
    console.log(`🤖 OpenAI key found: ${!!openaiKey}, model: ${openaiKey?.model}`);

    // Build enhanced context for AI
    let contextPrompt = `You are an intelligent content marketing assistant for a comprehensive content platform. 
    
IMPORTANT GUIDELINES:
- Never suggest navigation to other pages - handle everything in the chat
- Always provide actionable buttons and workflows
- Use real data when available, provide specific insights
- Create visual elements and interactive experiences
- Focus on helping users optimize their content strategy

AVAILABLE USER CONTEXT:`;

    if (finalSolutions && finalSolutions.length > 0) {
      contextPrompt += `\n\nUSER'S SOLUTIONS:`;
      finalSolutions.forEach(solution => {
        contextPrompt += `\n- ${solution.name}: ${solution.features?.join(', ') || 'No features listed'}`;
        if (solution.painPoints?.length > 0) {
          contextPrompt += `\n  Pain Points: ${solution.painPoints.join(', ')}`;
        }
        if (solution.targetAudience?.length > 0) {
          contextPrompt += `\n  Target Audience: ${solution.targetAudience.join(', ')}`;
        }
      });
    }

    if (finalAnalytics && typeof finalAnalytics === 'object' && Object.keys(finalAnalytics).length > 0) {
      contextPrompt += `\n\nCURRENT ANALYTICS:`;
      contextPrompt += `\n- Content pieces: ${finalAnalytics?.totalContent || 0}`;
      contextPrompt += `\n- Published: ${finalAnalytics?.published || 0}`;
      contextPrompt += `\n- In review: ${finalAnalytics?.inReview || 0}`;
      contextPrompt += `\n- Average SEO Score: ${finalAnalytics?.avgSeoScore || 0}%`;
      contextPrompt += `\n- Weekly performance data available: ${finalAnalytics?.weeklyData ? 'Yes' : 'No'}`;
      
      // Safe JSON stringification with fallbacks
      try {
        contextPrompt += `\n- Content by type: ${JSON.stringify(finalAnalytics?.contentByType || {})}`;
      } catch (e) {
        contextPrompt += `\n- Content by type: Not available`;
      }
      
      try {
        contextPrompt += `\n- Pipeline by stage: ${JSON.stringify(finalAnalytics?.pipelineByStage || {})}`;
      } catch (e) {
        contextPrompt += `\n- Pipeline by stage: Not available`;
      }
    }

    if (finalWorkflowContext && Object.keys(finalWorkflowContext).length > 0) {
      try {
        contextPrompt += `\n\nWORKFLOW CONTEXT: ${JSON.stringify(finalWorkflowContext)}`;
      } catch (e) {
        contextPrompt += `\n\nWORKFLOW CONTEXT: Context available but not serializable`;
      }
    }

    contextPrompt += `\n\nWhen responding:
1. Always include specific action buttons using this JSON format in your response
2. For data visualizations, include chart specifications when relevant
3. For workflows, provide step-by-step guidance with interactive elements
4. Make recommendations based on the user's actual solutions and data

IMPORTANT: When user requests performance analysis, keyword optimization, or content insights, you must generate real visualizations and action buttons.

CRITICAL: For performance analysis requests, ALWAYS generate visual data using the provided analytics.

EXAMPLE FOR PERFORMANCE ANALYSIS:
\`\`\`json
{
  "actions": [
    {
      "id": "deep-dive-analysis",
      "label": "Deep Dive Analysis",
      "type": "workflow",
      "data": { "workflow": "performance-deep-dive" }
    },
    {
      "id": "optimize-content",
      "label": "Optimize Low Performers",
      "type": "workflow", 
      "data": { "workflow": "content-optimization" }
    }
  ],
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "line",
      "data": [/* use analytics.weeklyData */],
      "categories": ["content", "published", "seoScore"],
      "colors": ["#8b5cf6", "#06b6d4", "#10b981"],
      "height": 300
    }
  }
}
\`\`\`

EXAMPLE FOR METRICS DISPLAY:
\`\`\`json
{
  "visualData": {
    "type": "metrics",
    "metrics": [
      {
        "id": "total-content",
        "title": "Total Content",
        "value": "${analytics.totalContent || 0}",
        "icon": "filetext"
      },
      {
        "id": "seo-score",
        "title": "Avg SEO Score", 
        "value": "${analytics.avgSeoScore || 0}%",
        "change": { "value": 5, "type": "increase", "period": "vs last month" }
      }
    ]
  }
}
\`\`\`

Response guidelines:
- Always generate contextual action buttons based on user's data
- Include visual data (metrics, charts) for performance requests  
- Create specific workflows for optimization tasks
- Reference actual user solutions and content data`;

    let aiResponse, modelUsed, provider, usage;

    // Try OpenRouter first (recommended)
    if (openrouterKey?.api_key) {
      const modelToUse = openrouterKey.model || 'openai/gpt-4o-mini';
      console.log(`🎯 Using OpenRouter with model: ${modelToUse}`);
      console.log(`🔑 API key format check: ${openrouterKey.api_key.substring(0, 10)}...${openrouterKey.api_key.substring(openrouterKey.api_key.length - 4)}`);
      try {
        const result = await callOpenRouter(openrouterKey.api_key, modelToUse, messages, contextPrompt);
        aiResponse = result.response;
        modelUsed = result.model;
        provider = 'openrouter';
        usage = result.usage;
        console.log('✅ OpenRouter request successful');
      } catch (error) {
        console.error('❌ OpenRouter failed:', error.message);
        console.error('📋 OpenRouter error details:', error);
      }
    } else {
      console.log('⚠️ No OpenRouter API key found or key is empty');
    }

    // Fallback to Anthropic
    if (!aiResponse && anthropicKey?.api_key) {
      console.log('🔄 Falling back to Anthropic');
      try {
        const result = await callAnthropic(anthropicKey.api_key, anthropicKey.model || 'claude-3-haiku-20240307', messages, contextPrompt);
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
        const result = await callOpenAI(apiKey, openaiKey?.model || 'gpt-4o-mini', messages, contextPrompt);
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
        request_type: 'enhanced_chat',
        success: true
      });
    }

    // Parse final response for structured elements
    const parsedResponse = parseAIResponse(aiResponse);
    parsedResponse.model = modelUsed;
    parsedResponse.provider = provider;
    parsedResponse.usage = usage;
    
    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced-ai-chat:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callOpenRouter(apiKey: string, model: string, messages: any[], systemPrompt: string) {
  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  console.log(`🔗 Making OpenRouter API call with model: ${model}`);
  console.log(`📨 Message count: ${chatMessages.length}`);
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://iqiundzzcepmuykcnfbc.supabase.co',
      'X-Title': 'Enhanced AI Content Assistant'
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  console.log(`📊 OpenRouter response status: ${response.status}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ OpenRouter API error response: ${errorText}`);
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: { message: errorText } };
    }
    throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  console.log(`✅ OpenRouter API response received, model: ${data.model || model}`);
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    console.error('❌ Invalid OpenRouter response structure:', data);
    throw new Error('Invalid response structure from OpenRouter API');
  }

  return {
    response: data.choices[0].message.content,
    model: data.model || model,
    usage: data.usage
  };
}

async function callAnthropic(apiKey: string, model: string, messages: any[], systemPrompt: string) {
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

async function callOpenAI(apiKey: string, model: string, messages: any[], systemPrompt: string) {
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

function calculateCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
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

function parseAIResponse(message: string) {
  // Extract JSON blocks from AI response for actions and visual data
  const actionRegex = /```json\n(.*?)\n```/gs;
  const matches = [...message.matchAll(actionRegex)];
  
  let actions = [];
  let visualData = null;
  let cleanMessage = message;

  matches.forEach(match => {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.actions) {
        actions = parsed.actions;
      }
      if (parsed.visualData) {
        visualData = parsed.visualData;
      }
      // Remove the JSON block from the message
      cleanMessage = cleanMessage.replace(match[0], '');
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
    }
  });

  return {
    message: cleanMessage.trim(),
    actions,
    visualData,
    workflowContext: null // Will be populated by workflow engine
  };
}
