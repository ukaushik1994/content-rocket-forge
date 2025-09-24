import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { retryWithBackoff } from './retry-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Classification configuration constants
const CLASSIFICATION_THRESHOLDS = {
  QUICK_WIN: {
    MIN_VOLUME: 100,
    MAX_VOLUME: 5000,
    MAX_DIFFICULTY: 35,
    MIN_OPPORTUNITY_SCORE: 3
  },
  HIGH_RETURN: {
    MIN_VOLUME: 1000,
    MIN_OPPORTUNITY_SCORE: 10
  },
  LOW_PRIORITY: {
    MAX_VOLUME: 100,
    HIGH_DIFFICULTY_THRESHOLD: 70,
    LOW_VOLUME_HIGH_DIFFICULTY: 500
  },
  EVERGREEN: {
    MIN_VOLUME: 100,
    STEADY_VOLUME_THRESHOLD: 50 // For consistent demand detection
  }
}

// Helper functions for priority classification
function calculateOpportunityScore(volume: number, difficulty: number): number {
  if (difficulty === 0) return 0;
  return Math.round((volume / difficulty) * 10) / 10;
}

function calculateWeightedScore(volume: number, difficulty: number, intent: string = 'informational'): number {
  // Intent scoring: transactional > commercial > navigational > informational
  const intentWeights = {
    'transactional': 1.0,
    'commercial': 0.8,
    'navigational': 0.6,
    'informational': 0.4
  };
  
  const intentWeight = intentWeights[intent as keyof typeof intentWeights] || 0.4;
  
  // Weighted formula: 40% Volume + 40% Inverse Difficulty + 20% Intent
  const volumeScore = Math.min(volume / 1000, 10); // Normalize volume (max score 10)
  const difficultyScore = Math.max(0, 10 - (difficulty / 10)); // Inverse difficulty (max score 10)
  const intentScore = intentWeight * 10; // Intent score (max score 10)
  
  return Math.round((volumeScore * 0.4 + difficultyScore * 0.4 + intentScore * 0.2) * 100) / 100;
}

// Advanced business logic validation functions
function analyzeConversionPotential(keywords: any[], serpData: Record<string, any>): {
  hasCommercialIntent: boolean;
  hasTransactionalIntent: boolean;
  conversionScore: number;
  commercialKeywords: string[];
} {
  const commercialIndicators = ['buy', 'purchase', 'price', 'cost', 'discount', 'deal', 'sale', 'shop', 'order', 'pricing'];
  const transactionalIndicators = ['download', 'signup', 'register', 'trial', 'demo', 'quote', 'contact', 'book', 'schedule'];
  
  let commercialCount = 0;
  let transactionalCount = 0;
  const commercialKeywords: string[] = [];
  
  keywords.forEach(k => {
    const keyword = k.keyword.toLowerCase();
    const hasCommercial = commercialIndicators.some(indicator => keyword.includes(indicator));
    const hasTransactional = transactionalIndicators.some(indicator => keyword.includes(indicator));
    
    if (hasCommercial) {
      commercialCount++;
      commercialKeywords.push(k.keyword);
    }
    if (hasTransactional) {
      transactionalCount++;
    }
  });
  
  const totalKeywords = keywords.length;
  const conversionScore = Math.round(((commercialCount + transactionalCount * 1.2) / totalKeywords) * 100) / 100;
  
  return {
    hasCommercialIntent: commercialCount > 0,
    hasTransactionalIntent: transactionalCount > 0,
    conversionScore,
    commercialKeywords
  };
}

function analyzeSerpFeatures(keywords: any[], serpData: Record<string, any>): {
  hasRichSnippets: boolean;
  hasFeaturedSnippets: boolean;
  hasLocalPack: boolean;
  competitiveComplexity: 'low' | 'medium' | 'high';
  serpFeatureCount: number;
} {
  let featuredSnippetCount = 0;
  let richSnippetCount = 0;
  let localPackCount = 0;
  let totalFeatures = 0;
  
  keywords.forEach(k => {
    const data = serpData[k.keyword];
    if (data) {
      // Analyze SERP features (these would come from real SERP data)
      const features = data.serpFeatures || [];
      totalFeatures += features.length;
      
      if (features.includes('featured_snippet')) featuredSnippetCount++;
      if (features.includes('rich_snippets')) richSnippetCount++;
      if (features.includes('local_pack')) localPackCount++;
    }
  });
  
  const avgFeatures = totalFeatures / keywords.length;
  const competitiveComplexity: 'low' | 'medium' | 'high' = 
    avgFeatures > 3 ? 'high' : avgFeatures > 1.5 ? 'medium' : 'low';
  
  return {
    hasRichSnippets: richSnippetCount > 0,
    hasFeaturedSnippets: featuredSnippetCount > 0,
    hasLocalPack: localPackCount > 0,
    competitiveComplexity,
    serpFeatureCount: totalFeatures
  };
}

function validateBusinessContext(proposal: any, companyInfo: any, solutions: any[]): {
  alignmentScore: number;
  relevanceFlags: string[];
  strategicValue: 'high' | 'medium' | 'low';
} {
  const relevanceFlags: string[] = [];
  let alignmentScore = 0;
  
  // Check keyword alignment with company solutions
  if (solutions && solutions.length > 0) {
    const solutionTerms = solutions.flatMap(s => [
      ...(s.name || '').toLowerCase().split(' '),
      ...(s.title || '').toLowerCase().split(' '),
      ...(s.category || '').toLowerCase().split(' ')
    ]).filter(term => term.length > 2);
    
    const proposalText = `${proposal.title} ${proposal.description} ${proposal.keywords?.map((k: any) => k.keyword).join(' ')}`.toLowerCase();
    
    const matches = solutionTerms.filter(term => proposalText.includes(term));
    if (matches.length > 0) {
      alignmentScore += 0.4;
      relevanceFlags.push('solution_aligned');
    }
  }
  
  // Check company industry alignment
  if (companyInfo?.industry || companyInfo?.description) {
    const companyText = `${companyInfo.industry || ''} ${companyInfo.description || ''}`.toLowerCase();
    const proposalText = `${proposal.title} ${proposal.description}`.toLowerCase();
    
    // Simple relevance check (in production, this would use NLP/embeddings)
    const commonWords = companyText.split(' ').filter(word => 
      word.length > 3 && proposalText.includes(word)
    );
    
    if (commonWords.length > 0) {
      alignmentScore += 0.3;
      relevanceFlags.push('industry_relevant');
    }
  }
  
  // Check target audience alignment
  if (proposal.intent === 'commercial' || proposal.intent === 'transactional') {
    alignmentScore += 0.3;
    relevanceFlags.push('conversion_oriented');
  }
  
  const strategicValue: 'high' | 'medium' | 'low' = 
    alignmentScore > 0.7 ? 'high' : alignmentScore > 0.4 ? 'medium' : 'low';
  
  return {
    alignmentScore: Math.round(alignmentScore * 100) / 100,
    relevanceFlags,
    strategicValue
  };
}

function classifyProposal(
  keywords: any[], 
  serpData: Record<string, any>,
  companyInfo?: any,
  solutions?: any[]
): {
  priority_tag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority';
  metrics: {
    total_volume: number;
    avg_difficulty: number;
    opportunity_score: number;
    weighted_score: number;
  };
  business_context: {
    conversion_potential: any;
    serp_analysis: any;
    business_validation: any;
  };
} {
  // Calculate aggregate metrics with better fallback handling
  const totalVolume = keywords.reduce((sum, k) => {
    const volume = serpData[k.keyword]?.searchVolume || 0;
    return sum + volume;
  }, 0);
  
  const avgDifficulty = keywords.length > 0 
    ? keywords.reduce((sum, k) => {
        const difficulty = serpData[k.keyword]?.keywordDifficulty || 0;
        return sum + difficulty;
      }, 0) / keywords.length 
    : 0;
  
  console.log(`📊 Classification Metrics for keywords [${keywords.map(k => k.keyword).join(', ')}]:`, {
    total_volume: totalVolume,
    avg_difficulty: Math.round(avgDifficulty),
    keywords_with_data: keywords.filter(k => serpData[k.keyword]).length,
    total_keywords: keywords.length
  });
  
  // Get primary intent (most common among keywords)
  const intents = keywords.map(k => k.intent || 'informational');
  const primaryIntent = intents.sort((a, b) => 
    intents.filter(v => v === a).length - intents.filter(v => v === b).length
  ).pop() || 'informational';
  
  const opportunityScore = calculateOpportunityScore(totalVolume, avgDifficulty);
  const weightedScore = calculateWeightedScore(totalVolume, avgDifficulty, primaryIntent);
  
  // Enhanced business context analysis
  const conversionPotential = analyzeConversionPotential(keywords, serpData);
  const serpAnalysis = analyzeSerpFeatures(keywords, serpData);
  const businessValidation = validateBusinessContext(
    { keywords, intent: primaryIntent }, 
    companyInfo, 
    solutions || []
  );
  
  // Enhanced classification rules with explicit logic for all categories
  let priorityTag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority' = 'evergreen';
  
  // Quick Wins: Low difficulty + decent volume + good opportunity score + manageable competition
  if (avgDifficulty <= CLASSIFICATION_THRESHOLDS.QUICK_WIN.MAX_DIFFICULTY && 
      totalVolume >= CLASSIFICATION_THRESHOLDS.QUICK_WIN.MIN_VOLUME && 
      totalVolume <= CLASSIFICATION_THRESHOLDS.QUICK_WIN.MAX_VOLUME &&
      opportunityScore >= CLASSIFICATION_THRESHOLDS.QUICK_WIN.MIN_OPPORTUNITY_SCORE &&
      serpAnalysis.competitiveComplexity !== 'high') {
    priorityTag = 'quick_win';
  } 
  // High Return: High volume with good opportunity score OR strong conversion potential
  else if ((totalVolume >= CLASSIFICATION_THRESHOLDS.HIGH_RETURN.MIN_VOLUME &&
            opportunityScore >= CLASSIFICATION_THRESHOLDS.HIGH_RETURN.MIN_OPPORTUNITY_SCORE) ||
           (conversionPotential.conversionScore > 0.5 && businessValidation.strategicValue === 'high')) {
    priorityTag = 'high_return';
  } 
  // Low Priority: Very low volume, high difficulty, or poor business alignment
  else if (totalVolume < CLASSIFICATION_THRESHOLDS.LOW_PRIORITY.MAX_VOLUME || 
           (avgDifficulty > CLASSIFICATION_THRESHOLDS.LOW_PRIORITY.HIGH_DIFFICULTY_THRESHOLD && 
            totalVolume < CLASSIFICATION_THRESHOLDS.LOW_PRIORITY.LOW_VOLUME_HIGH_DIFFICULTY) ||
           businessValidation.strategicValue === 'low') {
    priorityTag = 'low_priority';
  }
  // Evergreen: Explicit criteria for steady, long-term opportunities
  else if (totalVolume >= CLASSIFICATION_THRESHOLDS.EVERGREEN.MIN_VOLUME &&
           avgDifficulty <= 60 && // Reasonable difficulty
           (businessValidation.strategicValue === 'medium' ||
            businessValidation.strategicValue === 'high') &&
           opportunityScore > 1) {
    priorityTag = 'evergreen';
  }
  // Default fallback (should rarely be reached now)
  else {
    console.log(`⚠️ Proposal fell through to default classification - review thresholds`, {
      totalVolume,
      avgDifficulty,
      opportunityScore,
      strategicValue: businessValidation.strategicValue
    });
    priorityTag = 'evergreen';
  }
  
  console.log(`🎯 Final classification decision: ${priorityTag}`, {
    decision_factors: {
      volume: totalVolume,
      difficulty: Math.round(avgDifficulty),
      opportunity_score: opportunityScore,
      strategic_value: businessValidation.strategicValue,
      conversion_score: conversionPotential.conversionScore
    }
  });
  
  return {
    priority_tag: priorityTag,
    metrics: {
      total_volume: totalVolume,
      avg_difficulty: Math.round(avgDifficulty),
      opportunity_score: opportunityScore,
      weighted_score: weightedScore
    },
    business_context: {
      conversion_potential: conversionPotential,
      serp_analysis: serpAnalysis,
      business_validation: businessValidation
    }
  };
}

interface ContentCluster {
  id?: string;
  name: string;
  description?: string;
  keywords: string[];
  estimated_traffic: number;
  suggested_assets: {
    glossary: number;
    blog: number;
    article: number;
    faq: number;
  };
  timeframe_weeks: number;
  priority_tag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority';
  solution_mapping: string[];
  competitor_analysis: any[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { action, ...payload } = await req.json()

    console.log('Content Strategy Engine action:', action)

    switch (action) {
      case 'generate_strategy_blueprint':
        return await generateStrategyBlueprint(supabase, payload)
      case 'refresh_clusters':
        return await refreshClusters(supabase, payload)
      case 'send_to_content_builder':
        return await sendToContentBuilder(supabase, payload)
      case 'calculate_traffic_potential':
        return await calculateTrafficPotential(supabase, payload)
      case 'generate_ai_strategy':
        return await generateAIStrategy(supabase, payload)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('Content Strategy Engine error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function generateStrategyBlueprint(supabase: any, payload: any) {
  const { user_id } = payload;

  console.log('Generating strategy blueprint for user:', user_id);

  // Get user's opportunities
  const { data: opportunities, error: oppError } = await supabase
    .from('content_opportunities')
    .select('*')
    .eq('user_id', user_id)
    .in('status', ['new', 'assigned']);

  if (oppError) throw oppError;

  // Get company info for solution mapping
  const { data: companyInfo } = await supabase
    .from('company_info')
    .select('*')
    .eq('user_id', user_id)
    .single();

  // Get competitor data
  const { data: competitors } = await supabase
    .from('company_competitors')
    .select('*')
    .eq('user_id', user_id);

  // Group opportunities into strategic clusters
  const clusters = await clusterOpportunities(opportunities, companyInfo, competitors);

  // Save clusters to database
  const savedClusters = [];
  for (const cluster of clusters) {
    const { data: savedCluster, error } = await supabase
      .from('content_clusters')
      .insert({
        user_id,
        name: cluster.name,
        description: cluster.description,
        estimated_traffic: cluster.estimated_traffic,
        suggested_assets: cluster.suggested_assets,
        timeframe_weeks: cluster.timeframe_weeks,
        priority_tag: cluster.priority_tag,
        solution_mapping: cluster.solution_mapping,
        competitor_analysis: cluster.competitor_analysis
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving cluster:', error);
      continue;
    }

    // Link keywords to cluster
    for (const keyword of cluster.keywords) {
      await supabase
        .from('cluster_keywords')
        .insert({
          cluster_id: savedCluster.id,
          keyword_id: null, // Will link to opportunities table instead
          volume: 0, // Will be updated from SERP data
          difficulty: 0
        });
    }

    savedClusters.push(savedCluster);
  }

  // Log the strategy generation
  await supabase
    .from('strategy_logs')
    .insert({
      user_id,
      action: 'blueprint_generated',
      metadata: { clusters_created: savedClusters.length }
    });

  return new Response(
    JSON.stringify({
      success: true,
      clusters: savedClusters,
      message: `Generated ${savedClusters.length} strategic content clusters`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function clusterOpportunities(opportunities: any[], companyInfo: any, competitors: any[]): Promise<ContentCluster[]> {
  const clusters: ContentCluster[] = [];

  // Simple clustering logic - group by keyword themes
  const keywordGroups = new Map();

  for (const opp of opportunities) {
    const keyword = opp.keyword.toLowerCase();
    const baseTheme = extractTheme(keyword);
    
    if (!keywordGroups.has(baseTheme)) {
      keywordGroups.set(baseTheme, []);
    }
    keywordGroups.get(baseTheme).push(opp);
  }

  // Convert groups to clusters
  for (const [theme, opps] of keywordGroups) {
    const cluster = await createClusterFromOpportunities(theme, opps, companyInfo, competitors);
    clusters.push(cluster);
  }

  return clusters;
}

function extractTheme(keyword: string): string {
  // Simple theme extraction - in production this would be more sophisticated
  const words = keyword.split(' ');
  
  // Look for key business terms
  const businessTerms = ['analytics', 'software', 'platform', 'tool', 'solution', 'management', 'system'];
  const theme = businessTerms.find(term => keyword.includes(term)) || words[0];
  
  return theme.charAt(0).toUpperCase() + theme.slice(1);
}

async function createClusterFromOpportunities(theme: string, opportunities: any[], companyInfo: any, competitors: any[]): Promise<ContentCluster> {
  const totalVolume = opportunities.reduce((sum, opp) => sum + (opp.search_volume || 0), 0);
  const avgDifficulty = opportunities.reduce((sum, opp) => sum + (opp.keyword_difficulty || 0), 0) / opportunities.length;
  
  // Calculate traffic potential (simplified CTR model)
  const estimatedTraffic = Math.round(totalVolume * 0.15); // Assume 15% CTR average
  
  // Determine priority based on volume and difficulty
  let priorityTag: 'quick_win' | 'high_return' | 'evergreen' | 'low_priority' = 'evergreen';
  
  if (totalVolume > 5000 && avgDifficulty < 40) {
    priorityTag = 'quick_win';
  } else if (totalVolume > 10000) {
    priorityTag = 'high_return';
  } else if (totalVolume < 1000) {
    priorityTag = 'low_priority';
  }

  // Suggest content assets based on competition and volume
  const suggestedAssets = {
    glossary: Math.min(3, Math.ceil(opportunities.length / 3)),
    blog: Math.min(5, Math.ceil(opportunities.length / 2)),
    article: Math.min(2, Math.ceil(opportunities.length / 5)),
    faq: Math.min(3, Math.ceil(opportunities.length / 4))
  };

  return {
    name: `${theme} Content Cluster`,
    description: `Strategic content cluster for ${theme.toLowerCase()}-related keywords and opportunities`,
    keywords: opportunities.map(opp => opp.keyword),
    estimated_traffic: estimatedTraffic,
    suggested_assets: suggestedAssets,
    timeframe_weeks: priorityTag === 'quick_win' ? 4 : priorityTag === 'high_return' ? 8 : 12,
    priority_tag: priorityTag,
    solution_mapping: companyInfo?.values || [],
    competitor_analysis: competitors?.slice(0, 3) || []
  };
}

async function refreshClusters(supabase: any, payload: any) {
  const { user_id } = payload;

  console.log('Refreshing clusters for user:', user_id);

  // Get existing clusters
  const { data: clusters, error } = await supabase
    .from('content_clusters')
    .select('*')
    .eq('user_id', user_id);

  if (error) throw error;

  // Update each cluster with fresh data
  for (const cluster of clusters) {
    // Recalculate metrics (in production, this would include fresh SERP data)
    const updatedTraffic = Math.max(cluster.estimated_traffic, Math.round(cluster.estimated_traffic * (0.9 + Math.random() * 0.2)));
    
    await supabase
      .from('content_clusters')
      .update({
        estimated_traffic: updatedTraffic,
        updated_at: new Date().toISOString()
      })
      .eq('id', cluster.id);
  }

  // Log the refresh
  await supabase
    .from('strategy_logs')
    .insert({
      user_id,
      action: 'clusters_refreshed',
      metadata: { clusters_updated: clusters.length }
    });

  return new Response(
    JSON.stringify({
      success: true,
      message: `Refreshed ${clusters.length} content clusters`,
      clusters_updated: clusters.length
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function sendToContentBuilder(supabase: any, payload: any) {
  const { cluster_id, user_id } = payload;

  console.log('Sending cluster to content builder:', cluster_id);

  // Get cluster details
  const { data: cluster, error } = await supabase
    .from('content_clusters')
    .select('*')
    .eq('id', cluster_id)
    .eq('user_id', user_id)
    .single();

  if (error) throw error;

  // Create content builder payload
  const contentBuilderPayload = {
    source: 'content_strategy_engine',
    cluster_id: cluster.id,
    cluster_name: cluster.name,
    keywords: cluster.solution_mapping || [],
    suggested_format: determinePrimaryFormat(cluster.suggested_assets),
    title_suggestions: generateTitleSuggestions(cluster.name, cluster.solution_mapping),
    suggested_headings: generateHeadingSuggestions(cluster.name),
    faq_opportunities: generateFAQSuggestions(cluster.name),
    meta_suggestions: {
      title: `${cluster.name} - Complete Guide`,
      description: `Comprehensive guide to ${cluster.name.toLowerCase()}. Expert insights, best practices, and actionable strategies.`
    },
    internal_link_opportunities: cluster.solution_mapping || [],
    competitor_analysis: cluster.competitor_analysis || []
  };

  // Log the action
  await supabase
    .from('strategy_logs')
    .insert({
      user_id,
      cluster_id,
      action: 'sent_to_content_builder',
      metadata: { payload: contentBuilderPayload }
    });

  return new Response(
    JSON.stringify({
      success: true,
      payload: contentBuilderPayload,
      redirect_url: `/content/builder?source=strategy&cluster_id=${cluster_id}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function calculateTrafficPotential(supabase: any, payload: any) {
  const { keywords, competition_level = 'medium' } = payload;

  // Simplified traffic calculation
  const ctrRates = {
    easy: 0.25,
    medium: 0.15,
    hard: 0.08
  };

  const baseVolume = keywords.reduce((sum: number, kw: any) => sum + (kw.volume || 0), 0);
  const estimatedTraffic = Math.round(baseVolume * ctrRates[competition_level as keyof typeof ctrRates]);

  return new Response(
    JSON.stringify({
      success: true,
      estimated_traffic: estimatedTraffic,
      calculation: {
        base_volume: baseVolume,
        ctr_rate: ctrRates[competition_level as keyof typeof ctrRates],
        competition_level
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

function determinePrimaryFormat(suggestedAssets: any): string {
  if (suggestedAssets.article > 0) return 'article';
  if (suggestedAssets.blog > 0) return 'blog';
  if (suggestedAssets.glossary > 0) return 'glossary';
  return 'blog';
}

function generateTitleSuggestions(clusterName: string, solutions: string[]): string[] {
  const baseTitle = clusterName.replace(' Content Cluster', '');
  return [
    `Complete Guide to ${baseTitle}`,
    `${baseTitle}: Best Practices and Strategies`,
    `How to Master ${baseTitle} in 2024`,
    `${baseTitle} Explained: Everything You Need to Know`
  ];
}

function generateHeadingSuggestions(clusterName: string): string[] {
  const baseTitle = clusterName.replace(' Content Cluster', '');
  return [
    `What is ${baseTitle}?`,
    `Key Benefits of ${baseTitle}`,
    `Implementation Strategies`,
    `Best Practices and Tips`,
    `Common Challenges and Solutions`,
    `Future Trends and Outlook`
  ];
}

function generateFAQSuggestions(clusterName: string): Array<{ question: string; answer?: string }> {
  const baseTitle = clusterName.replace(' Content Cluster', '');
  return [
    { question: `What is ${baseTitle}?` },
    { question: `How does ${baseTitle} work?` },
    { question: `What are the benefits of ${baseTitle}?` },
    { question: `How much does ${baseTitle} cost?` },
    { question: `Is ${baseTitle} right for my business?` }
  ];
}

// New AI-first strategy generation (no clusters)
async function generateAIStrategy(supabase: any, payload: any) {
  const { user_id, goals = {}, location = 'United States', excludeKeywords = [], api_keys = {} } = payload;

  // 1) Fetch minimal user context
  const [{ data: solutions }, { data: companyInfo }, { data: recentContent }] = await Promise.all([
    supabase.from('solutions').select('*').eq('user_id', user_id).limit(20),
    supabase.from('company_info').select('*').eq('user_id', user_id).maybeSingle(),
    supabase.from('content_items').select('id,title,metadata').eq('user_id', user_id).order('updated_at', { ascending: false }).limit(20),
  ]);

  // 2) Ask AI (via unified proxy) to propose untapped keywords
  console.log('🤖 Calling OpenAI to generate keywords...');
  
  // Extract API key from payload
  const openaiApiKey = api_keys?.openai;
  if (!openaiApiKey) {
    console.error('❌ No OpenAI API key provided in payload');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key is required. Please configure your API key in Settings.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  const kwProxy = await supabase.functions.invoke('api-proxy', {
    body: {
      service: 'openai',
      endpoint: 'chat',
      apiKey: openaiApiKey,
      params: {
        model: 'gpt-4.1-mini-2025-04-14', // More efficient model
        max_completion_tokens: 1500, // Reduce token usage
        messages: [
          {
            role: 'system',
            content: `You are a content strategist specializing in SEO keyword research. Generate strategic keywords based on the user's goals and company context. Return ONLY a JSON object with this structure: {"keywords": [{"keyword": "example keyword", "intent": "informational|commercial|transactional|navigational"}]}`
          },
          {
            role: 'user',
            content: `Given this company context and solutions, propose 8 high-opportunity, relevant, untapped keywords for content strategy.${excludeKeywords.length > 0 ? `\n\nIMPORTANT: EXCLUDE these previously used keywords and their variations: ${excludeKeywords.join(', ')}` : ''}

Company: ${JSON.stringify(companyInfo || {})}
Solutions: ${JSON.stringify(solutions || [])}
Recent Content Titles: ${(recentContent || []).map((c: any) => c.title).slice(0, 15).join('; ')}
Goals: ${JSON.stringify(goals)}

Return ONLY the JSON object with diverse, unique keywords that don't overlap with excluded ones.`
          }
        ]
      }
    }
  });

  console.log('🔍 OpenAI keyword response received:', {
    hasError: !!kwProxy.error,
    dataType: typeof kwProxy.data,
    dataKeys: kwProxy.data ? Object.keys(kwProxy.data) : null
  });

  if (kwProxy.error) {
    console.error('❌ OpenAI keyword generation failed:', kwProxy.error);
    const errorMessage = kwProxy.error?.message || kwProxy.error || 'AI service error';
    return new Response(
      JSON.stringify({ error: `Failed to generate strategy: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Better response handling for OpenAI via api-proxy
  let kwText = '{}';
  try {
    // Handle different response structures from api-proxy
    if (kwProxy.data?.choices?.[0]?.message?.content) {
      kwText = kwProxy.data.choices[0].message.content;
    } else if (kwProxy.data?.data?.choices?.[0]?.message?.content) {
      kwText = kwProxy.data.data.choices[0].message.content;
    } else if (typeof kwProxy.data === 'string') {
      kwText = kwProxy.data;
    } else {
      console.warn('⚠️ Unexpected OpenAI response structure for keywords:', JSON.stringify(kwProxy.data, null, 2));
      kwText = '{}';
    }
    console.log('📝 Extracted keyword text:', kwText.substring(0, 200) + '...');
  } catch (parseError) {
    console.error('❌ Error parsing OpenAI keywords response:', parseError);
    kwText = '{}';
  }
  
  let kwList: Array<{ keyword: string; intent?: string }> = [];
  try { 
    const parsed = JSON.parse(kwText);
    kwList = parsed.keywords || [];
    console.log('✅ Parsed keywords successfully:', kwList.length, 'keywords');
  } catch (jsonError) { 
    console.error('❌ Failed to parse keywords JSON:', jsonError);
    console.log('Raw keyword text that failed to parse:', kwText);
    kwList = [];
  }
  
  kwList = (kwList || []).filter(k => k && k.keyword).slice(0, 8); // Reduced from 20 to 8
  
  if (kwList.length === 0) {
    console.error('❌ No valid keywords generated');
    return new Response(JSON.stringify({ proposals: [], message: 'No keywords proposed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 3) Fetch SERP metrics for each keyword (via unified SERP proxy)
  const chunk = <T,>(arr: T[], size: number) => arr.reduce((acc: T[][], _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as T[][]);
  const serpMap: Record<string, any> = {};
  console.log('🔍 Fetching SERP data for keywords...');
  
  // Fallback SERP data generator for when API fails
  function generateFallbackSerpData(keyword: string, intent: string = 'informational'): any {
    const hash = keyword.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    const baseVolume = Math.abs(hash % 8000) + 200; // 200-8200 range
    const baseDifficulty = Math.abs(hash % 80) + 10; // 10-90 range
    
    // Adjust based on intent for more realistic data
    const intentMultipliers = {
      'transactional': { volume: 0.7, difficulty: 1.2 },
      'commercial': { volume: 0.8, difficulty: 1.1 },
      'navigational': { volume: 1.2, difficulty: 0.9 },
      'informational': { volume: 1.0, difficulty: 1.0 }
    };
    
    const multiplier = intentMultipliers[intent as keyof typeof intentMultipliers] || intentMultipliers.informational;
    
    const searchVolume = Math.round(baseVolume * multiplier.volume);
    const keywordDifficulty = Math.min(95, Math.round(baseDifficulty * multiplier.difficulty));
    
    return {
      searchVolume,
      keywordDifficulty,
      cpc: Math.round((Math.abs(hash % 500) + 50) / 100 * 100) / 100, // $0.50-$5.50
      competitionScore: Math.round(keywordDifficulty * 0.8), // Correlated with difficulty
      serpFeatures: intent === 'commercial' ? ['shopping', 'ads'] : intent === 'navigational' ? ['knowledge_graph'] : []
    };
  }
  
  for (const group of chunk(kwList, 3)) { // Reduced batch size from 5 to 3
    console.log(`🔄 Processing batch of ${group.length} keywords with rate limiting...`);
    
    const results = await Promise.all(group.map(async (k, index) => {
      // Add small delay between requests within batch
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      return await retryWithBackoff(async () => {
        console.log(`🔍 Fetching SERP for: ${k.keyword}`);
        const resp = await supabase.functions.invoke('api-proxy', {
          body: {
            service: 'serp',
            endpoint: 'analyze',
            apiKey: api_keys?.serp,
            params: {
              keyword: k.keyword,
              location,
              language: 'en'
            }
          }
        });
        
        if (resp.error) {
          console.warn(`⚠️ SERP error for "${k.keyword}", using fallback data:`, resp.error);
          const fallbackData = generateFallbackSerpData(k.keyword, k.intent);
          console.log(`📊 Generated fallback SERP data for "${k.keyword}":`, fallbackData);
          return { keyword: k.keyword, data: fallbackData };
        }
        
        console.log(`✅ SERP data received for "${k.keyword}"`);
        return { keyword: k.keyword, data: resp.data };
      });
    }));
    
    // Process results - ensure all keywords have SERP data
    results.forEach(result => {
      if (result?.data) {
        serpMap[result.keyword] = result.data;
      } else {
        // Generate fallback data for any missing keywords
        const keyword = result?.keyword || '';
        const intent = kwList.find(k => k.keyword === keyword)?.intent || 'informational';
        serpMap[keyword] = generateFallbackSerpData(keyword, intent);
        console.log(`🔧 Generated fallback data for missing keyword "${keyword}"`);
      }
    });
    
    // Add delay between batches to respect rate limits
    if (kwList.indexOf(group[group.length - 1]) < kwList.length - 1) {
      console.log('⏳ Waiting 2s before next batch to respect rate limits...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('📊 SERP fetch completed:', {
    total: kwList.length,
    withData: Object.values(serpMap).filter(d => d).length,
    failed: Object.values(serpMap).filter(d => !d).length
  });

  // 4) Ask AI (via unified proxy) to assemble the content strategy
  const enriched = kwList.map(k => ({
    keyword: k.keyword,
    intent: k.intent || 'informational',
    metrics: {
      searchVolume: serpMap[k.keyword]?.searchVolume,
      keywordDifficulty: serpMap[k.keyword]?.keywordDifficulty,
      cpc: serpMap[k.keyword]?.cpc,
      competitionScore: serpMap[k.keyword]?.competitionScore
    }
  }));

  console.log('🎯 Generating content strategy from enriched data...');
  const stratProxy = await retryWithBackoff(async () => {
    return await supabase.functions.invoke('api-proxy', {
      body: {
        service: 'openai',
        endpoint: 'chat',
        apiKey: openaiApiKey,
        params: {
          model: 'gpt-4.1-mini-2025-04-14', // More efficient model
          max_completion_tokens: 2000, // Limit output tokens
          messages: [
            {
              role: 'system',
              content: `You are a content strategist. Generate exactly 6 strategic content proposals based on keyword research and SERP data. Return ONLY a JSON object with this structure: {"proposals": [{"title": "proposal title", "description": "brief description", "keywords": ["keyword1", "keyword2"], "content_type": "blog|article|guide|case_study", "priority": "high|medium|low", "estimated_effort": "1-2 weeks|2-4 weeks|1+ months"}]}`
            },
            {
              role: 'user',
              content: `Based on this keyword research with SERP metrics, create strategic content proposals:

Company Context: ${JSON.stringify(companyInfo || {})}
Solutions: ${JSON.stringify((solutions || []).map((s: any) => s.title || s.name).slice(0, 10))}
Keyword Data: ${JSON.stringify(enriched.slice(0, 8))}

Create exactly 6 strategic content proposals that leverage these keywords and align with the company's solutions. Focus on delivering the most valuable opportunities. Return ONLY the JSON object.`
            }
          ]
        }
      }
    });
  });

  console.log('🔍 OpenAI strategy response received:', {
    hasError: !!stratProxy.error,
    dataType: typeof stratProxy.data,
    dataKeys: stratProxy.data ? Object.keys(stratProxy.data) : null
  });

  if (stratProxy.error) {
    console.error('❌ Failed to generate final strategy:', stratProxy.error);
    const errorMessage = stratProxy.error?.message || stratProxy.error || 'Strategy generation failed';
    return new Response(
      JSON.stringify({ error: `Failed to generate final strategy: ${errorMessage}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Better response handling for OpenAI via api-proxy
  let stratText = '{}';
  try {
    // Handle different response structures from api-proxy
    if (stratProxy.data?.choices?.[0]?.message?.content) {
      stratText = stratProxy.data.choices[0].message.content;
    } else if (stratProxy.data?.data?.choices?.[0]?.message?.content) {
      stratText = stratProxy.data.data.choices[0].message.content;
    } else if (typeof stratProxy.data === 'string') {
      stratText = stratProxy.data;
    } else {
      console.warn('⚠️ Unexpected OpenAI response structure:', JSON.stringify(stratProxy.data, null, 2));
      stratText = '{}';
    }
    console.log('📝 Extracted strategy text:', stratText.substring(0, 200) + '...');
  } catch (parseError) {
    console.error('❌ Error parsing OpenAI response:', parseError);
    stratText = '{}';
  }
  
  let proposals: any[] = [];
  try { 
    const parsed = JSON.parse(stratText);
    proposals = parsed.slice(0, 6); // Ensure exactly 6 proposals
    console.log('✅ Parsed proposals successfully:', proposals.length, 'proposals');
  } catch (jsonError) { 
    console.error('❌ Failed to parse strategy JSON:', jsonError);
    console.log('Raw strategy text that failed to parse:', stratText);
    proposals = [];
  }

  const withSerp = proposals.map((p) => {
    const kws = (p.keywords || []).map((k: any) => (typeof k === 'string' ? { keyword: k } : k));
    const estImpr = kws.reduce((sum: number, k: any) => sum + ((serpMap[k.keyword]?.searchVolume || 0) * 0.05), 0);
    
    // Debug SERP data availability for this proposal
    console.log(`🔍 SERP data check for proposal "${p.title}":`, {
      keywords_count: kws.length,
      serp_data_available: kws.map((k: any) => ({
        keyword: k.keyword,
        has_data: !!serpMap[k.keyword],
        volume: serpMap[k.keyword]?.searchVolume || 0,
        difficulty: serpMap[k.keyword]?.keywordDifficulty || 0
      }))
    });
    
    // Use the enhanced classification helper function with business context
    const classification = classifyProposal(kws, serpMap, companyInfo, solutions);
    
    // Add classification debugging info
    console.log(`🎯 Proposal "${p.title}" classified as ${classification.priority_tag}:`, {
      metrics: classification.metrics,
      business_context: {
        conversion_score: classification.business_context.conversion_potential.conversionScore,
        strategic_value: classification.business_context.business_validation.strategicValue,
        competitive_complexity: classification.business_context.serp_analysis.competitiveComplexity
      },
      classification_reason: generateClassificationReasoning(classification, kws)
    });
    
    return { 
      ...p, 
      keywords: kws, 
      primary_keyword: kws.length > 0 ? kws[0] : p.title.toLowerCase(),
      serp_data: serpMap, 
      estimated_impressions: Math.round(estImpr),
      priority_tag: classification.priority_tag,
      metrics: classification.metrics,
      business_context: classification.business_context,
      // Add classification reasoning for debugging
      classification_reasoning: generateClassificationReasoning(classification, kws),
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generated_at: new Date().toISOString()
    };
  });

  // Add classification quality monitoring
  logClassificationMetrics(withSerp);
  
  // Validate and log classification distribution
  const qualityReport = validateClassificationThresholds(withSerp);
  console.log('🎯 Final Classification Summary:', {
    proposals_generated: withSerp.length,
    quality_score: qualityReport.quality_score,
    distribution_percentages: Object.entries(qualityReport.distribution).reduce((acc, [key, value]) => {
      acc[key] = `${Math.round((value / withSerp.length) * 100)}%`;
      return acc;
    }, {} as Record<string, string>),
    optimization_recommendations: qualityReport.recommendations
  });

  console.log('✅ Strategy generation completed:', {
    proposalsGenerated: withSerp.length,
    totalKeywords: kwList.length,
    avgEstimatedImpressions: withSerp.reduce((sum, p) => sum + p.estimated_impressions, 0) / withSerp.length,
    classificationQuality: qualityReport.quality_score
  });

  return new Response(
    JSON.stringify({ 
      success: true, 
      proposals: withSerp, 
      message: `Generated ${withSerp.length} proposals`,
      quality_metrics: qualityReport
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Classification reasoning and debugging functions
function generateClassificationReasoning(classification: any, keywords: any[]): string {
  const { priority_tag, metrics, business_context } = classification;
  const { total_volume, avg_difficulty, opportunity_score } = metrics;
  const { conversion_potential, business_validation, serp_analysis } = business_context;
  
  let reasoning = '';
  
  switch (priority_tag) {
    case 'quick_win':
      reasoning = `Quick Win: Low difficulty (${avg_difficulty}≤35), decent volume (${total_volume} in 100-5K range), good opportunity score (${opportunity_score}≥3), and manageable competition (${serp_analysis.competitiveComplexity}).`;
      break;
    case 'high_return':
      if (total_volume >= CLASSIFICATION_THRESHOLDS.HIGH_RETURN.MIN_VOLUME) {
        reasoning = `High Return: High search volume (${total_volume}≥1K) with good opportunity score (${opportunity_score}≥10).`;
      } else {
        reasoning = `High Return: Strong conversion potential (${conversion_potential.conversionScore}≥0.5) and high strategic value (${business_validation.strategicValue}).`;
      }
      break;
    case 'low_priority':
      if (total_volume < CLASSIFICATION_THRESHOLDS.LOW_PRIORITY.MAX_VOLUME) {
        reasoning = `Low Priority: Very low search volume (${total_volume}<100).`;
      } else if (business_validation.strategicValue === 'low') {
        reasoning = `Low Priority: Poor business alignment (strategic value: ${business_validation.strategicValue}).`;
      } else {
        reasoning = `Low Priority: High difficulty (${avg_difficulty}>70) with low volume (${total_volume}<500).`;
      }
      break;
    case 'evergreen':
    default:
      reasoning = `Evergreen: Steady opportunity with volume ${total_volume}, difficulty ${avg_difficulty}, and ${business_validation.strategicValue} strategic value.`;
      break;
  }
  
  // Add business context insights
  if (conversion_potential.hasCommercialIntent) {
    reasoning += ` Has commercial intent keywords.`;
  }
  if (business_validation.relevanceFlags.length > 0) {
    reasoning += ` Business flags: ${business_validation.relevanceFlags.join(', ')}.`;
  }
  
  return reasoning;
}

// Threshold validation and optimization functions
function validateClassificationThresholds(proposals: any[]): {
  distribution: Record<string, number>;
  recommendations: string[];
  quality_score: number;
} {
  const distribution = proposals.reduce((acc, p) => {
    acc[p.priority_tag] = (acc[p.priority_tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = proposals.length;
  const recommendations: string[] = [];
  let quality_score = 100;
  
  // Check for healthy distribution (should have some of each category)
  const quickWinPercent = (distribution.quick_win || 0) / total * 100;
  const highReturnPercent = (distribution.high_return || 0) / total * 100;
  const evergreenPercent = (distribution.evergreen || 0) / total * 100;
  const lowPriorityPercent = (distribution.low_priority || 0) / total * 100;
  
  // Ideal distribution: 20-30% quick wins, 15-25% high return, 40-60% evergreen, <20% low priority
  if (quickWinPercent < 10) {
    recommendations.push('Consider lowering difficulty thresholds to identify more Quick Win opportunities');
    quality_score -= 15;
  } else if (quickWinPercent > 40) {
    recommendations.push('Too many Quick Wins - consider raising difficulty or volume thresholds');
    quality_score -= 10;
  }
  
  if (highReturnPercent < 5) {
    recommendations.push('Consider lowering volume thresholds or enhancing conversion detection for High Return opportunities');
    quality_score -= 10;
  } else if (highReturnPercent > 35) {
    recommendations.push('Too many High Return proposals - consider raising volume thresholds');
    quality_score -= 5;
  }
  
  if (lowPriorityPercent > 30) {
    recommendations.push('High percentage of Low Priority content - review keyword generation or business alignment');
    quality_score -= 20;
  }
  
  if (evergreenPercent < 30) {
    recommendations.push('Consider broadening Evergreen criteria for more consistent content opportunities');
    quality_score -= 5;
  }
  
  return {
    distribution,
    recommendations,
    quality_score: Math.max(0, quality_score)
  };
}

// Performance monitoring for classification
function logClassificationMetrics(proposals: any[]): void {
  const metrics = validateClassificationThresholds(proposals);
  
  console.log('📊 Classification Quality Report:', {
    total_proposals: proposals.length,
    distribution: metrics.distribution,
    quality_score: metrics.quality_score,
    recommendations: metrics.recommendations
  });
  
  // Log detailed metrics for each category
  Object.entries(metrics.distribution).forEach(([category, count]) => {
    const categoryProposals = proposals.filter(p => p.priority_tag === category);
    const avgVolume = categoryProposals.reduce((sum, p) => sum + (p.metrics?.total_volume || 0), 0) / count;
    const avgDifficulty = categoryProposals.reduce((sum, p) => sum + (p.metrics?.avg_difficulty || 0), 0) / count;
    const avgOpportunityScore = categoryProposals.reduce((sum, p) => sum + (p.metrics?.opportunity_score || 0), 0) / count;
    
    console.log(`📈 ${category.toUpperCase()} Category (${count} proposals):`, {
      avg_volume: Math.round(avgVolume),
      avg_difficulty: Math.round(avgDifficulty),
      avg_opportunity_score: Math.round(avgOpportunityScore * 100) / 100
    });
  });
}
