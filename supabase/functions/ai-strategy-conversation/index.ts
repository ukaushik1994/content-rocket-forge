import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders, createErrorResponse, createSuccessResponse } from '../shared/errors.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const serpApiKey = Deno.env.get('SERP_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CONVERSATION_STEPS = [
  { step: 1, name: 'Context Setting', description: 'Understanding Your Business' },
  { step: 2, name: 'Goal Analysis', description: 'Analyzing Your Content Goals' },
  { step: 3, name: 'Keyword Discovery', description: 'Discovering Keyword Opportunities' },
  { step: 4, name: 'SERP Analysis', description: 'Analyzing Search Competition' },
  { step: 5, name: 'Solution Integration', description: 'Aligning with Your Solutions' },
  { step: 6, name: 'Strategy Assembly', description: 'Building Your Content Strategy' }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('No authorization header', 401, 'ai-strategy-conversation');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401, 'ai-strategy-conversation');
    }

    const { action, conversationId, stepData, goals, companyContext, solutionsContext } = await req.json();

    console.log(`AI Strategy Conversation action: ${action}`);

    switch (action) {
      case 'start_conversation':
        return await startConversation(user.id, goals, companyContext, solutionsContext);
      
      case 'process_step':
        return await processConversationStep(conversationId, stepData);
      
      case 'get_conversation':
        return await getConversation(conversationId, user.id);
      
      default:
        return createErrorResponse('Invalid action', 400, 'ai-strategy-conversation');
    }
  } catch (error) {
    console.error('Error in ai-strategy-conversation:', error);
    return createErrorResponse(error.message, 500, 'ai-strategy-conversation');
  }
});

async function startConversation(userId: string, goals: any, companyContext: any, solutionsContext: any) {
  console.log('🚀 Starting new AI strategy conversation...');
  
  // Create conversation record
  const { data: conversation, error: conversationError } = await supabase
    .from('ai_strategy_conversations')
    .insert({
      user_id: userId,
      goals,
      company_context: companyContext,
      solutions_context: solutionsContext,
      status: 'in_progress',
      current_step: 1
    })
    .select()
    .single();

  if (conversationError) {
    throw new Error(`Failed to create conversation: ${conversationError.message}`);
  }

  // Start Step 1: Context Setting
  const step1Result = await processStep1ContextSetting(conversation.id, companyContext, solutionsContext);
  
  return createSuccessResponse({
    conversation,
    currentStep: step1Result,
    nextStep: CONVERSATION_STEPS[1]
  });
}

async function processConversationStep(conversationId: string, stepData: any) {
  console.log(`🔄 Processing conversation step for: ${conversationId}`);
  
  // Get current conversation
  const { data: conversation, error: convError } = await supabase
    .from('ai_strategy_conversations')
    .select('*')
    .eq('id', conversationId)
    .single();

  if (convError || !conversation) {
    throw new Error('Conversation not found');
  }

  const currentStep = conversation.current_step;
  let stepResult;

  switch (currentStep) {
    case 2:
      stepResult = await processStep2GoalAnalysis(conversationId, conversation.goals, stepData.businessContext);
      break;
    case 3:
      stepResult = await processStep3KeywordDiscovery(conversationId, stepData.refinedGoals, stepData.businessContext);
      break;
    case 4:
      stepResult = await processStep4SERPAnalysis(conversationId, stepData.keywords);
      break;
    case 5:
      stepResult = await processStep5SolutionIntegration(conversationId, conversation.solutions_context, stepData.serpAnalysis);
      break;
    case 6:
      stepResult = await processStep6StrategyAssembly(conversationId, stepData.allPreviousSteps, conversation.goals);
      break;
    default:
      throw new Error('Invalid step number');
  }

  // Update conversation step
  await supabase
    .from('ai_strategy_conversations')
    .update({ 
      current_step: currentStep + 1,
      status: currentStep >= 6 ? 'completed' : 'in_progress',
      completed_at: currentStep >= 6 ? new Date().toISOString() : null
    })
    .eq('id', conversationId);

  return createSuccessResponse({
    stepResult,
    nextStep: CONVERSATION_STEPS[currentStep] || null,
    isComplete: currentStep >= 6
  });
}

async function processStep1ContextSetting(conversationId: string, companyContext: any, solutionsContext: any) {
  console.log('🎯 Step 1: Context Setting');
  
  const startTime = Date.now();
  
  const prompt = `You are a content strategy expert. Analyze this business context and provide insights.

Company Context: ${JSON.stringify(companyContext, null, 2)}
Solutions Context: ${JSON.stringify(solutionsContext, null, 2)}

Please provide:
1. A business understanding summary (2-3 sentences)
2. Key content opportunities you identify
3. 2-3 strategic questions to ask for better context
4. Content type recommendations based on business model

Format as JSON with keys: businessSummary, opportunities, questions, contentRecommendations`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  // Save step result
  const { data: stepRecord } = await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 1,
      step_name: 'Context Setting',
      ai_input: { companyContext, solutionsContext },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .select()
    .single();

  return stepRecord;
}

async function processStep2GoalAnalysis(conversationId: string, goals: any, businessContext: any) {
  console.log('📊 Step 2: Goal Analysis');
  
  const startTime = Date.now();
  
  const prompt = `Analyze these content goals in the context of the business:

Goals: ${JSON.stringify(goals, null, 2)}
Business Context: ${JSON.stringify(businessContext, null, 2)}

Provide:
1. Goal feasibility assessment 
2. Refined goal recommendations
3. Content piece target optimization
4. Timeline and resource suggestions

Format as JSON with keys: feasibilityAssessment, refinedGoals, targetOptimization, resourceSuggestions`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 2,
      step_name: 'Goal Analysis',
      ai_input: { goals, businessContext },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    });

  return aiResponse;
}

async function processStep3KeywordDiscovery(conversationId: string, refinedGoals: any, businessContext: any) {
  console.log('🔍 Step 3: Keyword Discovery');
  
  const startTime = Date.now();
  
  const prompt = `Suggest strategic keywords based on business model and refined goals.

Refined Goals: ${JSON.stringify(refinedGoals, null, 2)}
Business Context: ${JSON.stringify(businessContext, null, 2)}

Generate 15-20 strategic keywords that align with:
1. Business model and target audience
2. Content goals and objectives  
3. Competitive opportunities
4. Search volume potential

Format as JSON with keys: primaryKeywords, secondaryKeywords, longTailKeywords, rationale`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 3,
      step_name: 'Keyword Discovery',
      ai_input: { refinedGoals, businessContext },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    });

  return aiResponse;
}

async function processStep4SERPAnalysis(conversationId: string, keywords: string[]) {
  console.log('🔎 Step 4: SERP Analysis');
  
  const startTime = Date.now();
  
  // Get SERP data for top keywords (limit to 5 to avoid token limits)
  const topKeywords = keywords.slice(0, 5);
  const serpData = [];
  
  for (const keyword of topKeywords) {
    try {
      const data = await getSERPData(keyword);
      serpData.push({ keyword, data });
    } catch (error) {
      console.error(`SERP error for ${keyword}:`, error);
      serpData.push({ keyword, error: error.message });
    }
  }

  const prompt = `Analyze SERP competition data for these keywords:

SERP Data: ${JSON.stringify(serpData, null, 2)}

Provide:
1. Keyword difficulty assessment
2. Content gap opportunities  
3. Competitor analysis summary
4. Recommended keyword priorities

Format as JSON with keys: difficultyScores, contentGaps, competitorInsights, priorities`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 4,
      step_name: 'SERP Analysis',
      ai_input: { keywords: topKeywords, serpData },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    });

  return aiResponse;
}

async function processStep5SolutionIntegration(conversationId: string, solutionsContext: any, serpAnalysis: any) {
  console.log('🔗 Step 5: Solution Integration');
  
  const startTime = Date.now();
  
  const prompt = `Map solutions to keywords and identify integration opportunities:

Solutions: ${JSON.stringify(solutionsContext, null, 2)}
SERP Analysis: ${JSON.stringify(serpAnalysis, null, 2)}

Provide:
1. Solution-keyword mapping
2. Integration strategies for each solution
3. Content positioning recommendations
4. CTA optimization suggestions

Format as JSON with keys: solutionMapping, integrationStrategies, positioning, ctaOptimization`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 5,
      step_name: 'Solution Integration',
      ai_input: { solutionsContext, serpAnalysis },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    });

  return aiResponse;
}

async function processStep6StrategyAssembly(conversationId: string, previousSteps: any, originalGoals: any) {
  console.log('🏗️ Step 6: Strategy Assembly');
  
  const startTime = Date.now();
  
  const prompt = `Create final content strategy proposals based on all previous analysis:

Previous Analysis: ${JSON.stringify(previousSteps, null, 2)}
Original Goals: ${JSON.stringify(originalGoals, null, 2)}

Generate 8-12 content proposals that:
1. Match the user's content piece targets exactly
2. Align with business goals and solution integration
3. Target discovered keywords with realistic difficulty
4. Include clear success metrics and timelines

Format as JSON with keys: proposals, strategyOverview, successMetrics, timeline`;

  const aiResponse = await callOpenAI(prompt, 'gpt-4o-mini');
  const processingTime = Date.now() - startTime;

  await supabase
    .from('conversation_steps')
    .insert({
      conversation_id: conversationId,
      step_number: 6,
      step_name: 'Strategy Assembly',
      ai_input: { previousSteps, originalGoals },
      ai_output: aiResponse,
      processing_time_ms: processingTime,
      status: 'completed',
      completed_at: new Date().toISOString()
    });

  // Create final strategy record
  const { data: finalStrategy } = await supabase
    .from('ai_strategies')
    .insert({
      user_id: previousSteps.userId,
      title: `AI Strategy - ${new Date().toLocaleDateString()}`,
      description: 'Multi-step conversational AI strategy',
      goals: originalGoals,
      proposals: aiResponse.proposals || [],
      keywords: extractKeywordsFromSteps(previousSteps),
      serp_data: previousSteps.serpData || {},
      session_metadata: {
        conversation_id: conversationId,
        generation_method: 'conversation',
        steps_completed: 6
      }
    })
    .select()
    .single();

  // Update conversation with final strategy
  await supabase
    .from('ai_strategy_conversations')
    .update({ final_strategy_id: finalStrategy.id })
    .eq('id', conversationId);

  return { aiResponse, finalStrategy };
}

async function getConversation(conversationId: string, userId: string) {
  const { data: conversation, error: convError } = await supabase
    .from('ai_strategy_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError) {
    throw new Error('Conversation not found');
  }

  const { data: steps } = await supabase
    .from('conversation_steps')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('step_number');

  return createSuccessResponse({
    conversation,
    steps: steps || [],
    allSteps: CONVERSATION_STEPS
  });
}

async function callOpenAI(prompt: string, model: string = 'gpt-4o-mini') {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist. Always provide responses in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse OpenAI JSON response:', content);
    return { error: 'Invalid JSON response', rawContent: content };
  }
}

async function getSERPData(keyword: string) {
  if (!serpApiKey) {
    console.warn('SERP API key not configured, skipping SERP data');
    return { error: 'SERP API not configured' };
  }

  const response = await fetch(`https://api.serpapi.com/search?engine=google&q=${encodeURIComponent(keyword)}&api_key=${serpApiKey}&num=10`);
  
  if (!response.ok) {
    throw new Error(`SERP API error: ${response.statusText}`);
  }

  return await response.json();
}

function extractKeywordsFromSteps(steps: any): string[] {
  const keywords = [];
  if (steps.keywordDiscovery) {
    keywords.push(...(steps.keywordDiscovery.primaryKeywords || []));
    keywords.push(...(steps.keywordDiscovery.secondaryKeywords || []));
  }
  return keywords;
}