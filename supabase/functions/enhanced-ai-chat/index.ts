
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// SERP Intelligence Integration
interface SerpQueryPattern {
  pattern: RegExp;
  type: 'trend' | 'competitive' | 'content_gap' | 'seo' | 'market_research' | 'keyword_analysis';
  extractKeywords: (match: RegExpMatchArray) => string[];
  priority: number;
}

interface SerpIntelligence {
  shouldTriggerSerp: boolean;
  queryType: string;
  keywords: string[];
  priority: number;
  suggestedAnalysis: string[];
}

// SERP Query Intelligence Patterns - Enhanced
const SERP_QUERY_PATTERNS: SerpQueryPattern[] = [
  {
    pattern: /(?:what'?s trending|trend\w*|popular|hot topics?)\s+(?:with|for|in)?\s*(.+)/i,
    type: 'trend',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /(?:who'?s ranking|competitors?|competition)\s+(?:for|with)\s+(.+)/i,
    type: 'competitive',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /(?:content gap|content opportunities?|missing content)\s+(?:for|in|about)\s+(.+)/i,
    type: 'content_gap',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /(?:keyword difficulty|search volume|seo (?:difficulty|analysis))\s+(?:for|of)\s+(.+)/i,
    type: 'seo',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  {
    pattern: /(?:analyze|analysis of|research)\s+(?:the )?keyword\s+["\']?(.+?)["\']?(?:\s|$)/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /serp (?:data|analysis|research)\s+(?:for|about)\s+(.+)/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 9
  },
  // Enhanced patterns for better detection
  {
    pattern: /(?:analyze|research|data for|insights on)\s+["\']?([^"'\n]+?)["\']?/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 7
  },
  {
    pattern: /(?:how to rank|ranking for|optimize for)\s+["\']?([^"'\n]+?)["\']?/i,
    type: 'seo',
    extractKeywords: (match) => [match[1].trim()],
    priority: 8
  },
  {
    pattern: /(?:keyword|search term|query)\s+["\']?([^"'\n]+?)["\']?/i,
    type: 'keyword_analysis',
    extractKeywords: (match) => [match[1].trim()],
    priority: 6
  }
];

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
  serpData?: any; // Add SERP data from frontend
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
      serpData,
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

    // SERP Intelligence Integration
    let serpResults: any[] = [];
    let serpContext = '';
    
    // Check if SERP data was passed from frontend first
    if (serpData) {
      console.log('📊 Using SERP data from frontend:', Object.keys(serpData));
      serpResults = [{ data: serpData, keyword: serpData.keyword || 'unknown', analysisType: 'frontend' }];
      serpContext = generateSerpContext(serpResults);
      console.log('✅ Using frontend SERP data');
    } else {
      // Fallback to real-time SERP analysis
      const latestUserMessage = messages.filter(m => m.role === 'user').pop();
      if (latestUserMessage?.content) {
        console.log('🔍 Analyzing query for SERP intelligence...');
        const serpIntelligence = analyzeSerpIntent(latestUserMessage.content);
        
        if (serpIntelligence.shouldTriggerSerp && serpIntelligence.keywords.length > 0) {
          console.log('🚀 SERP intelligence triggered:', serpIntelligence);
          
          try {
            // Execute SERP analysis for detected keywords
            serpResults = await executeSerpAnalysis(
              serpIntelligence.keywords.slice(0, 3), // Limit to 3 keywords for performance
              serpIntelligence.queryType
            );
            
            if (serpResults.length > 0) {
              serpContext = generateSerpContext(serpResults);
              console.log('✅ SERP context generated successfully');
            }
          } catch (serpError) {
            console.error('❌ SERP analysis failed:', serpError);
            // Continue without SERP data rather than failing the entire request
          }
        }
      }
    }

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

    // Add SERP context if available
    if (serpContext) {
      contextPrompt += serpContext;
    }

    contextPrompt += `\n\nWhen responding:
1. Always include specific action buttons and visual data using delimiter format
2. For data visualizations, include chart specifications when relevant
3. For workflows, provide step-by-step guidance with interactive elements
4. Make recommendations based on the user's actual solutions and data
5. If SERP data is provided, integrate it naturally into your response and create relevant visualizations

IMPORTANT: When user requests performance analysis, keyword optimization, or content insights, you must generate real visualizations and action buttons.

CRITICAL: For performance analysis requests, ALWAYS generate visual data using the provided analytics.

SERP INTEGRATION: If real-time SERP data is provided above, use it to create actionable insights, visualizations, and strategy recommendations.

RESPONSE FORMAT EXAMPLES:

For actions, use: $$ACTIONS$$ [{"id": "action-id", "label": "Action Label", "type": "button", "action": "workflow:performance-analysis", "data": {}}] $$ACTIONS$$

For visual data with charts:
$$VISUAL_DATA$$ {"type": "chart", "chartConfig": {"type": "line", "data": [{"name": "Week 1", "content": ${finalAnalytics?.weeklyData?.[0]?.content || 10}, "published": ${finalAnalytics?.weeklyData?.[0]?.published || 5}, "seoScore": ${finalAnalytics?.weeklyData?.[0]?.seoScore || 75}}, {"name": "Week 2", "content": ${finalAnalytics?.weeklyData?.[1]?.content || 12}, "published": ${finalAnalytics?.weeklyData?.[1]?.published || 8}, "seoScore": ${finalAnalytics?.weeklyData?.[1]?.seoScore || 80}}], "categories": ["content", "published", "seoScore"], "colors": ["#8b5cf6", "#06b6d4", "#10b981"], "height": 300}} $$VISUAL_DATA$$

For metrics display:
$$VISUAL_DATA$$ {"type": "metrics", "metrics": [{"id": "total-content", "title": "Total Content", "value": "${finalAnalytics?.totalContent || 0}", "icon": "FileText"}, {"id": "seo-score", "title": "Avg SEO Score", "value": "${finalAnalytics?.avgSeoScore || 0}%", "change": {"value": 5, "type": "increase", "period": "vs last month"}}]} $$VISUAL_DATA$$

For performance analysis requests, ALWAYS include both metrics AND charts using real user data.

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
    
    // Add SERP data to response if available
    if (serpResults.length > 0) {
      parsedResponse.serpData = serpResults;
      console.log(`📊 Added SERP data for ${serpResults.length} keywords to response`);
    }
    
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
  console.log('🔍 Parsing AI response for structured data...');
  let actions = [];
  let visualData = null;
  let cleanMessage = message;

  try {
    // Extract actions using delimiter format
    const actionsMatch = message.match(/\$\$ACTIONS\$\$(.*?)\$\$ACTIONS\$\$/s);
    if (actionsMatch) {
      console.log('📋 Found actions data:', actionsMatch[1]);
      actions = JSON.parse(actionsMatch[1].trim());
      cleanMessage = cleanMessage.replace(/\$\$ACTIONS\$\$.*?\$\$ACTIONS\$\$/s, '');
    }

    // Extract visual data using delimiter format
    const visualMatch = message.match(/\$\$VISUAL_DATA\$\$(.*?)\$\$VISUAL_DATA\$\$/s);
    if (visualMatch) {
      console.log('📊 Found visual data:', visualMatch[1]);
      visualData = JSON.parse(visualMatch[1].trim());
      cleanMessage = cleanMessage.replace(/\$\$VISUAL_DATA\$\$.*?\$\$VISUAL_DATA\$\$/s, '');
    }

    // Fallback: try to extract JSON blocks for backward compatibility
    if (!actions.length && !visualData) {
      const jsonRegex = /```json\n(.*?)\n```/gs;
      const matches = [...message.matchAll(jsonRegex)];
      
      matches.forEach(match => {
        try {
          const parsed = JSON.parse(match[1]);
          if (parsed.actions && !actions.length) {
            actions = parsed.actions;
            console.log('📋 Extracted actions from JSON block:', actions);
          }
          if (parsed.visualData && !visualData) {
            visualData = parsed.visualData;
            console.log('📊 Extracted visual data from JSON block:', visualData);
          }
          cleanMessage = cleanMessage.replace(match[0], '');
        } catch (e) {
          console.warn('Failed to parse JSON block:', e);
        }
      });
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }

  console.log('✅ Parsed response:', { 
    hasActions: actions.length > 0, 
    hasVisualData: !!visualData,
    messageLength: cleanMessage.trim().length
  });

  return {
    message: cleanMessage.trim(),
    actions,
    visualData,
    workflowContext: null
  };
}

// SERP Intelligence Functions
function analyzeSerpIntent(query: string): SerpIntelligence {
  console.log('🧠 Analyzing query for SERP intent:', query);
  
  let bestMatch: { pattern: SerpQueryPattern; match: RegExpMatchArray } | null = null;
  let highestPriority = 0;

  for (const pattern of SERP_QUERY_PATTERNS) {
    const match = query.match(pattern.pattern);
    if (match && pattern.priority > highestPriority) {
      bestMatch = { pattern, match };
      highestPriority = pattern.priority;
    }
  }

  if (bestMatch) {
    const keywords = bestMatch.pattern.extractKeywords(bestMatch.match);
    const cleanKeywords = keywords
      .filter(k => k && k.trim().length > 0)
      .map(k => k.replace(/['"]/g, '').trim())
      .filter(k => k.length > 1);

    console.log('✅ SERP intent detected:', {
      type: bestMatch.pattern.type,
      keywords: cleanKeywords,
      priority: highestPriority
    });

    return {
      shouldTriggerSerp: true,
      queryType: bestMatch.pattern.type,
      keywords: cleanKeywords,
      priority: highestPriority,
      suggestedAnalysis: getSuggestedAnalysis(bestMatch.pattern.type)
    };
  }

  console.log('❌ No SERP intent detected');
  return {
    shouldTriggerSerp: false,
    queryType: 'general',
    keywords: [],
    priority: 0,
    suggestedAnalysis: []
  };
}

function getSuggestedAnalysis(queryType: string): string[] {
  const analysisMap: Record<string, string[]> = {
    'trend': ['search_volume', 'trending_topics', 'seasonal_patterns'],
    'competitive': ['competitor_analysis', 'ranking_positions', 'content_gaps'],
    'content_gap': ['missing_content', 'opportunity_analysis', 'topic_clusters'],
    'seo': ['keyword_difficulty', 'search_volume', 'ranking_factors'],
    'market_research': ['audience_insights', 'search_trends', 'related_topics'],
    'keyword_analysis': ['keyword_metrics', 'serp_features', 'competition_analysis']
  };

  return analysisMap[queryType] || ['basic_analysis'];
}

async function executeSerpAnalysis(keywords: string[], analysisType: string): Promise<any[]> {
  console.log('🚀 Executing SERP analysis for keywords:', keywords);
  
  const results: any[] = [];
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  
  // Get SERP API key from secrets
  const serpApiKey = Deno.env.get('SERP_API_KEY');
  if (!serpApiKey) {
    console.warn('⚠️ No SERP API key available');
    return [];
  }
  
  // Limit concurrent requests
  const maxConcurrent = 2;
  for (let i = 0; i < keywords.length; i += maxConcurrent) {
    const batch = keywords.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(async (keyword) => {
      try {
        // Call SERP API function
        const { data, error } = await supabase.functions.invoke('serp-api', {
          body: {
            endpoint: 'analyze',
            apiKey: serpApiKey,
            params: {
              q: keyword,
              location: 'us',
              num: 10,
              device: 'desktop',
              engine: 'google'
            }
          }
        });

        if (error) {
          console.error(`Error analyzing keyword "${keyword}":`, error);
          return null;
        }

        if (data) {
          return {
            keyword,
            data,
            analysisType
          };
        }
        return null;
      } catch (error) {
        console.error(`Error analyzing keyword "${keyword}":`, error);
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(r => r !== null));
  }

  console.log(`✅ SERP analysis complete. Retrieved data for ${results.length}/${keywords.length} keywords`);
  return results;
}

function generateSerpContext(results: any[]): string {
  if (results.length === 0) return '';

  let context = '\n\n🔍 REAL-TIME SERP DATA ANALYSIS:\n';
  
  results.forEach((result, index) => {
    const data = result.data;
    const keyword = result.keyword || data.keyword || 'unknown';
    
    context += `\n📊 KEYWORD: "${keyword}" (${result.analysisType})\n`;
    
    // Handle different data structures (frontend vs API)
    if (data.searchVolume || data.search_volume) {
      context += `- Search Volume: ${(data.searchVolume || data.search_volume)?.toLocaleString() || 'N/A'}\n`;
    }
    
    if (data.keywordDifficulty || data.keyword_difficulty || data.difficulty) {
      context += `- Keyword Difficulty: ${data.keywordDifficulty || data.keyword_difficulty || data.difficulty || 'N/A'}%\n`;
    }
    
    if (data.competitionScore || data.competition_score || data.cpc) {
      context += `- Competition Score: ${data.competitionScore || data.competition_score || data.cpc || 'N/A'}%\n`;
    }
    
    // Content gaps from different sources
    const contentGaps = data.contentGaps || data.content_gaps || data.questions || [];
    if (contentGaps && contentGaps.length > 0) {
      const gaps = Array.isArray(contentGaps) ? contentGaps : Object.values(contentGaps);
      context += `- Top Content Gaps: ${gaps.slice(0, 3).map((gap: any) => 
        gap.topic || gap.question || gap.title || gap
      ).join(', ')}\n`;
    }
    
    // Questions from People Also Ask
    const questions = data.questions || data.peopleAlsoAsk || data.people_also_ask || [];
    if (questions && questions.length > 0) {
      const qs = Array.isArray(questions) ? questions : Object.values(questions);
      context += `- Popular Questions: ${qs.slice(0, 2).map((q: any) => 
        q.question || q.title || q
      ).join('; ')}\n`;
    }
    
    // Entities and related keywords
    const entities = data.entities || data.related_keywords || data.keywords || [];
    if (entities && entities.length > 0) {
      const ents = Array.isArray(entities) ? entities : Object.values(entities);
      context += `- Key Topics: ${ents.slice(0, 3).map((e: any) => 
        e.name || e.keyword || e.query || e
      ).join(', ')}\n`;
    }
    
    // Top competitors
    const competitors = data.competitors || data.topResults || data.organic_results || [];
    if (competitors && competitors.length > 0) {
      const comps = Array.isArray(competitors) ? competitors : Object.values(competitors);
      context += `- Top Competitors: ${comps.slice(0, 3).map((c: any) => 
        c.domain || c.title || c.name || c.url || c
      ).join(', ')}\n`;
    }
    
    if (index < results.length - 1) context += '\n';
  });

  context += '\n✨ AI RESPONSE INSTRUCTIONS:';
  context += '\n- Use this REAL SERP data to create actionable insights';
  context += '\n- Generate visual charts and metrics using $$VISUAL_DATA$$ format';
  context += '\n- Include specific data points and numbers from the analysis';
  context += '\n- Create follow-up action buttons using $$ACTIONS$$ format';
  context += '\n- When displaying SERP data, use the serp_analysis visual type';
  context += '\n- Make recommendations based on the actual keyword metrics and competition';
  
  return context;
}
