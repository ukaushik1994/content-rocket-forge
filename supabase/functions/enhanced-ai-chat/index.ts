
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

// PHASE 2: Intelligent Search & Understanding Utilities
interface SolutionMatch {
  solution: any;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'partial' | 'keyword';
}

/**
 * PHASE 2: Fuzzy search for solution names - handles GLConnect -> GL Connect
 */
function findSolutionByName(query: string, solutions: any[]): SolutionMatch[] {
  if (!solutions || solutions.length === 0) return [];
  
  const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matches: SolutionMatch[] = [];
  
  for (const solution of solutions) {
    const solutionName = (solution.name || '').toLowerCase();
    const normalizedName = solutionName.replace(/[^a-z0-9]/g, '');
    
    // Exact match
    if (solutionName === query.toLowerCase()) {
      matches.push({ solution, score: 100, matchType: 'exact' });
      continue;
    }
    
    // Fuzzy match (handles GLConnect -> GL Connect)
    if (normalizedName === normalizedQuery) {
      matches.push({ solution, score: 95, matchType: 'fuzzy' });
      continue;
    }
    
    // Partial match
    if (solutionName.includes(query.toLowerCase()) || normalizedName.includes(normalizedQuery)) {
      matches.push({ solution, score: 80, matchType: 'partial' });
      continue;
    }
    
    // Keyword match in description or features
    const description = (solution.description || '').toLowerCase();
    const features = Array.isArray(solution.features) ? solution.features.join(' ').toLowerCase() : '';
    
    if (description.includes(query.toLowerCase()) || features.includes(query.toLowerCase())) {
      matches.push({ solution, score: 60, matchType: 'keyword' });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score);
}

/**
 * PHASE 2: Detect solution-specific queries
 */
function detectSolutionQuery(message: string, solutions: any[]): { matches: SolutionMatch[]; queryType: string } {
  const lowerMessage = message.toLowerCase();
  
  // Direct solution name queries
  const directQueries = [
    /what is ([a-z0-9\s]+)\??/i,
    /tell me about ([a-z0-9\s]+)/i,
    /describe ([a-z0-9\s]+)/i,
    /explain ([a-z0-9\s]+)/i,
    /how does ([a-z0-9\s]+) work/i,
    /([a-z0-9\s]+) features/i,
    /([a-z0-9\s]+) capabilities/i
  ];
  
  for (const pattern of directQueries) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const matches = findSolutionByName(match[1].trim(), solutions);
      if (matches.length > 0) {
        return { matches, queryType: 'solution_inquiry' };
      }
    }
  }
  
  // General solution queries
  if (lowerMessage.includes('solution') || lowerMessage.includes('product') || lowerMessage.includes('tool')) {
    const allMatches: SolutionMatch[] = [];
    for (const solution of solutions) {
      allMatches.push({ solution, score: 50, matchType: 'keyword' });
    }
    return { matches: allMatches, queryType: 'general_solutions' };
  }
  
  return { matches: [], queryType: 'none' };
}

/**
 * PHASE 2: Generate enhanced solution context
 */
function generateSolutionContext(solutions: any[], solutionMatches: SolutionMatch[]): string {
  let context = '\n\nSOLUTION INTELLIGENCE:';
  
  if (solutionMatches.length > 0) {
    context += '\n\nRELEVANT SOLUTIONS (High Priority):';
    for (const match of solutionMatches.slice(0, 3)) {
      const solution = match.solution;
      context += `\n\n**${solution.name}** (Match: ${match.matchType}, Score: ${match.score}%)`;
      context += `\n- Description: ${solution.description || 'No description available'}`;
      
      if (solution.features && Array.isArray(solution.features)) {
        context += `\n- Key Features: ${solution.features.slice(0, 5).join(', ')}`;
      }
      
      if (solution.painPoints && Array.isArray(solution.painPoints)) {
        context += `\n- Addresses: ${solution.painPoints.slice(0, 3).join(', ')}`;
      }
      
      if (solution.targetAudience && Array.isArray(solution.targetAudience)) {
        context += `\n- Target Audience: ${solution.targetAudience.slice(0, 3).join(', ')}`;
      }
      
      if (solution.category) {
        context += `\n- Category: ${solution.category}`;
      }
      
      if (solution.useCases && Array.isArray(solution.useCases)) {
        context += `\n- Use Cases: ${solution.useCases.slice(0, 3).join(', ')}`;
      }
    }
  }
  
  // Add comprehensive solution portfolio context
  if (solutions.length > 0) {
    context += '\n\nCOMPLETE SOLUTION PORTFOLIO:';
    
    // Group by category
    const categories = solutions.reduce((acc: any, solution: any) => {
      const category = solution.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(solution);
      return acc;
    }, {});
    
    for (const [category, categorySolutions] of Object.entries(categories)) {
      context += `\n\n${category} Solutions:`;
      for (const solution of (categorySolutions as any[]).slice(0, 5)) {
        context += `\n  • ${solution.name}: ${(solution.description || '').substring(0, 100)}${solution.description && solution.description.length > 100 ? '...' : ''}`;
      }
    }
  }
  
  return context;
}

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
    
    console.log('🚀 Processing enhanced AI chat request');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // PHASE 2: AI Context Integration - Get comprehensive context first
    console.log('📊 Fetching comprehensive user context...');
    let comprehensiveContext: any = {};
    try {
      const { data: contextData, error: contextError } = await supabase.functions.invoke('ai-context-manager', {
        body: { userId, contextType: 'enhanced_chat' }
      });
      
      if (contextError) {
        console.error('❌ Context manager error:', contextError);
      } else {
        comprehensiveContext = contextData || {};
        console.log('✅ Comprehensive context fetched:', {
          solutions: comprehensiveContext.solutions?.length || 0,
          contentItems: comprehensiveContext.contentItems?.length || 0,
          strategies: comprehensiveContext.aiStrategies?.length || 0,
          companyInfo: comprehensiveContext.companyInfo?.length || 0,
          brandGuidelines: comprehensiveContext.brandGuidelines?.length || 0,
          competitors: comprehensiveContext.competitors?.length || 0
        });
      }
    } catch (error) {
      console.error('❌ Failed to fetch comprehensive context:', error);
    }

    // PHASE 2: Merge comprehensive context with frontend context
    const contextData = context || {};
    const finalSolutions = comprehensiveContext.solutions || solutions || contextData.solutions || [];
    const finalAnalytics = comprehensiveContext.analytics || analytics || contextData.analytics || {};
    const finalWorkflowContext = workflowContext || contextData.workflowContext || {};
    
    // PHASE 2: Add comprehensive context data
    const comprehensiveData = {
      contentItems: comprehensiveContext.contentItems || [],
      calendarItems: comprehensiveContext.calendarItems || [],
      pipelineItems: comprehensiveContext.pipelineItems || [],
      contentApprovals: comprehensiveContext.contentApprovals || [],
      aiStrategies: comprehensiveContext.aiStrategies || [],
      strategyProposals: comprehensiveContext.strategyProposals || [],
      companyInfo: comprehensiveContext.companyInfo || [],
      brandGuidelines: comprehensiveContext.brandGuidelines || [],
      competitors: comprehensiveContext.competitors || [],
      contentAnalyses: comprehensiveContext.contentAnalyses || [],
      workflowStates: comprehensiveContext.workflowStates || [],
      contextSnapshots: comprehensiveContext.contextSnapshots || [],
      conversations: comprehensiveContext.conversations || []
    };

    // PHASE 2: Intelligent Solution Detection & Search
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    let solutionMatches: SolutionMatch[] = [];
    let queryType = 'none';
    
    if (latestUserMessage?.content) {
      const detection = detectSolutionQuery(latestUserMessage.content, finalSolutions);
      solutionMatches = detection.matches;
      queryType = detection.queryType;
      
      console.log('🔍 Solution Query Detection:', {
        query: latestUserMessage.content,
        queryType,
        matches: solutionMatches.length,
        topMatch: solutionMatches[0]?.solution?.name
      });
    }

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
    let contextPrompt = `You are an intelligent content marketing assistant for a comprehensive content platform with deep knowledge of the user's complete business ecosystem.

CRITICAL PHASE 2 CAPABILITIES:
- You have access to ALL user data: solutions, content, strategies, company info, brand guidelines, competitors
- You can intelligently search and understand solution relationships (e.g., GLConnect = GL Connect)
- You provide context-aware responses with specific solution insights
- You generate actionable workflows based on comprehensive user context

IMPORTANT GUIDELINES:
- Never suggest navigation to other pages - handle everything in the chat
- Always provide actionable buttons and workflows
- Use real data when available, provide specific insights
- Create visual elements and interactive experiences
- Focus on helping users optimize their content strategy

COMPREHENSIVE USER CONTEXT:`;

    // PHASE 2: Enhanced Solution Context with Intelligent Search
    if (finalSolutions && finalSolutions.length > 0) {
      contextPrompt += generateSolutionContext(finalSolutions, solutionMatches);
      
      if (solutionMatches.length > 0) {
        contextPrompt += `\n\nSOLUTION QUERY CONTEXT:`;
        contextPrompt += `\n- Query Type: ${queryType}`;
        contextPrompt += `\n- Top Match: ${solutionMatches[0].solution.name} (${solutionMatches[0].score}% confidence)`;
        contextPrompt += `\n- When user asks about solutions, provide comprehensive details including features, use cases, integrations, and strategic value`;
      }
    }

    // PHASE 2: Comprehensive Data Context
    if (comprehensiveData.companyInfo && comprehensiveData.companyInfo.length > 0) {
      contextPrompt += `\n\nCOMPANY PROFILE:`;
      for (const company of comprehensiveData.companyInfo.slice(0, 2)) {
        contextPrompt += `\n- ${company.name || 'Company'}: ${company.description || 'No description'}`;
        if (company.industry) contextPrompt += `\n  Industry: ${company.industry}`;
        if (company.mission) contextPrompt += `\n  Mission: ${company.mission}`;
        if (company.values && Array.isArray(company.values)) {
          contextPrompt += `\n  Values: ${company.values.slice(0, 3).join(', ')}`;
        }
      }
    }

    if (comprehensiveData.brandGuidelines && comprehensiveData.brandGuidelines.length > 0) {
      contextPrompt += `\n\nBRAND GUIDELINES:`;
      for (const brand of comprehensiveData.brandGuidelines.slice(0, 1)) {
        if (brand.tone && Array.isArray(brand.tone)) {
          contextPrompt += `\n- Brand Tone: ${brand.tone.slice(0, 3).join(', ')}`;
        }
        if (brand.targetAudience) contextPrompt += `\n- Target Audience: ${brand.targetAudience}`;
        if (brand.brandPersonality) contextPrompt += `\n- Brand Personality: ${brand.brandPersonality}`;
        if (brand.keywords && Array.isArray(brand.keywords)) {
          contextPrompt += `\n- Brand Keywords: ${brand.keywords.slice(0, 5).join(', ')}`;
        }
      }
    }

    if (comprehensiveData.competitors && comprehensiveData.competitors.length > 0) {
      contextPrompt += `\n\nCOMPETITIVE LANDSCAPE:`;
      for (const competitor of comprehensiveData.competitors.slice(0, 3)) {
        contextPrompt += `\n- ${competitor.name}: ${competitor.description || 'No description'}`;
        if (competitor.marketPosition) contextPrompt += ` (${competitor.marketPosition})`;
        if (competitor.strengths && Array.isArray(competitor.strengths)) {
          contextPrompt += `\n  Strengths: ${competitor.strengths.slice(0, 2).join(', ')}`;
        }
      }
    }

    if (comprehensiveData.aiStrategies && comprehensiveData.aiStrategies.length > 0) {
      contextPrompt += `\n\nACTIVE CONTENT STRATEGIES:`;
      for (const strategy of comprehensiveData.aiStrategies.slice(0, 3)) {
        contextPrompt += `\n- ${strategy.title || 'Strategy'}: ${strategy.description || 'No description'}`;
        if (strategy.keywords && Array.isArray(strategy.keywords)) {
          contextPrompt += `\n  Keywords: ${strategy.keywords.slice(0, 5).join(', ')}`;
        }
      }
    }

    if (comprehensiveData.strategyProposals && comprehensiveData.strategyProposals.length > 0) {
      const availableProposals = comprehensiveData.strategyProposals.filter((p: any) => p.status === 'available');
      if (availableProposals.length > 0) {
        contextPrompt += `\n\nCONTENT OPPORTUNITIES:`;
        for (const proposal of availableProposals.slice(0, 5)) {
          contextPrompt += `\n- ${proposal.title}: ${proposal.primaryKeyword || 'No keyword'} (Priority: ${proposal.priorityTag || 'medium'})`;
          if (proposal.estimatedImpressions) {
            contextPrompt += ` [Est. ${proposal.estimatedImpressions} impressions]`;
          }
        }
      }
    }

    if (finalAnalytics && typeof finalAnalytics === 'object' && Object.keys(finalAnalytics).length > 0) {
      contextPrompt += `\n\nPERFORMANCE ANALYTICS:`;
      contextPrompt += `\n- Content Portfolio: ${finalAnalytics?.totalContent || 0} pieces (${finalAnalytics?.published || 0} published, ${finalAnalytics?.inReview || 0} in review)`;
      contextPrompt += `\n- SEO Performance: ${finalAnalytics?.avgSeoScore || 0}% average score`;
      contextPrompt += `\n- Strategy Performance: ${finalAnalytics?.totalStrategies || 0} strategies, ${finalAnalytics?.totalProposals || 0} proposals, ${finalAnalytics?.totalApprovals || 0} approvals`;
      
      if (finalAnalytics?.weeklyData && Array.isArray(finalAnalytics.weeklyData)) {
        const recentWeek = finalAnalytics.weeklyData[finalAnalytics.weeklyData.length - 1];
        if (recentWeek) {
          contextPrompt += `\n- Recent Week: ${recentWeek.content || 0} content, ${recentWeek.published || 0} published, ${recentWeek.seoScore || 0}% SEO`;
        }
      }
      
      try {
        if (finalAnalytics?.contentByType && Object.keys(finalAnalytics.contentByType).length > 0) {
          contextPrompt += `\n- Content Distribution: ${JSON.stringify(finalAnalytics.contentByType)}`;
        }
      } catch (e) {
        // Ignore JSON errors
      }
    }

    if (comprehensiveData.contentItems && comprehensiveData.contentItems.length > 0) {
      contextPrompt += `\n\nCONTENT LIBRARY: ${comprehensiveData.contentItems.length} items available`;
      const recentContent = comprehensiveData.contentItems.slice(0, 3);
      for (const item of recentContent) {
        contextPrompt += `\n- ${item.title || 'Untitled'} (${item.contentType || 'unknown'}) - ${item.status || 'draft'}`;
      }
    }

    if (finalWorkflowContext && Object.keys(finalWorkflowContext).length > 0) {
      try {
        contextPrompt += `\n\nWORKFLOW CONTEXT: ${JSON.stringify(finalWorkflowContext)}`;
      } catch (e) {
        contextPrompt += `\n\nWORKFLOW CONTEXT: Active workflow state available`;
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ OpenRouter failed:', errorMessage);
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
        const result = await callOpenAI(apiKey || '', openaiKey?.model || 'gpt-4o-mini', messages, contextPrompt);
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
        cost_estimate: calculateCost(provider || 'unknown', modelUsed || 'unknown', usage.prompt_tokens || 0, usage.completion_tokens || 0),
        request_type: 'enhanced_chat',
        success: true
      });
    }

    // Parse final response for structured elements
    const parsedResponse: any = parseAIResponse(aiResponse);
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
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
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
  let actions: any[] = [];
  let visualData: any = null;
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
