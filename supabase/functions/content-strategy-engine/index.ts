import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    return new Response(
      JSON.stringify({ error: error.message }),
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
  const { user_id, goals = {}, location = 'United States', api_keys = {} } = payload;

  // 1) Fetch minimal user context
  const [{ data: solutions }, { data: companyInfo }, { data: recentContent }] = await Promise.all([
    supabase.from('solutions').select('*').eq('user_id', user_id).limit(20),
    supabase.from('company_info').select('*').eq('user_id', user_id).maybeSingle(),
    supabase.from('content_items').select('id,title,metadata').eq('user_id', user_id).order('updated_at', { ascending: false }).limit(20),
  ]);

  // 2) Ask AI (via unified proxy) to propose untapped keywords
  console.log('🤖 Calling OpenAI to generate keywords...');
  const kwProxy = await supabase.functions.invoke('api-proxy', {
    body: {
      service: 'openai',
      endpoint: 'chat',
      params: {
        messages: [
          {
            role: 'system',
            content: `You are a content strategist specializing in SEO keyword research. Generate strategic keywords based on the user's goals and company context. Return ONLY a JSON object with this structure: {"keywords": [{"keyword": "example keyword", "intent": "informational|commercial|transactional|navigational"}]}`
          },
          {
            role: 'user',
            content: `Given this company context and solutions, propose 20 high-opportunity, relevant, untapped keywords for content strategy.

Company: ${JSON.stringify(companyInfo || {})}
Solutions: ${JSON.stringify(solutions || [])}
Recent Content Titles: ${(recentContent || []).map((c: any) => c.title).slice(0, 15).join('; ')}
Goals: ${JSON.stringify(goals)}

Return ONLY the JSON object.`
          }
        ],
        max_completion_tokens: 1500
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
  
  kwList = (kwList || []).filter(k => k && k.keyword).slice(0, 20);
  
  if (kwList.length === 0) {
    console.error('❌ No valid keywords generated');
    return new Response(JSON.stringify({ proposals: [], message: 'No keywords proposed' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // 3) Fetch SERP metrics for each keyword (via unified SERP proxy)
  const chunk = <T,>(arr: T[], size: number) => arr.reduce((acc: T[][], _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as T[][]);
  const serpMap: Record<string, any> = {};
  console.log('🔍 Fetching SERP data for keywords...');
  
  for (const group of chunk(kwList, 5)) {
    const results = await Promise.all(group.map(async (k) => {
      try {
        console.log(`🔍 Fetching SERP for: ${k.keyword}`);
        const resp = await supabase.functions.invoke('api-proxy', {
          body: {
            service: 'serp',
            endpoint: 'analyze',
            params: {
              keyword: k.keyword,
              location,
              language: 'en'
            }
          }
        });
        
        if (resp.error) {
          console.warn(`⚠️ SERP error for "${k.keyword}":`, resp.error);
          return { keyword: k.keyword, data: null };
        }
        
        console.log(`✅ SERP data received for "${k.keyword}"`);
        return { keyword: k.keyword, data: resp.data };
      } catch (error) {
        console.error(`❌ Error fetching SERP for "${k.keyword}":`, error);
        return { keyword: k.keyword, data: null };
      }
    }));
    
    for (const r of results) { 
      serpMap[r.keyword] = r.data;
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
  const stratProxy = await supabase.functions.invoke('api-proxy', {
    body: {
      service: 'openai',
      endpoint: 'chat',
      params: {
        messages: [
          {
            role: 'system',
            content: 'You are an expert content strategist. Return ONLY a JSON object with the specified structure.'
          },
          {
            role: 'user',
            content: `Create a comprehensive content strategy from these keywords with metrics. Group into 5-8 strategic proposals. Each proposal must be: {"title":string,"primary_keyword":string,"description":string,"priority_tag":"quick_win"|"high_return"|"evergreen"|"low_priority","keywords":[{"keyword":string}]}. Use baseline CTR 0.05 to estimate impressions from searchVolume. Return {"proposals": Proposal[]}.

Goals: ${JSON.stringify(goals)}
Data: ${JSON.stringify(enriched).slice(0, 12000)}`
          }
        ],
        max_completion_tokens: 3000
      }
    }
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
    proposals = parsed.proposals || [];
    console.log('✅ Parsed proposals successfully:', proposals.length, 'proposals');
  } catch (jsonError) { 
    console.error('❌ Failed to parse strategy JSON:', jsonError);
    console.log('Raw strategy text that failed to parse:', stratText);
    proposals = [];
  }

  const withSerp = proposals.map((p) => {
    const kws = (p.keywords || []).map((k: any) => (typeof k === 'string' ? { keyword: k } : k));
    const estImpr = kws.reduce((sum: number, k: any) => sum + ((serpMap[k.keyword]?.searchVolume || 0) * 0.05), 0);
    return { 
      ...p, 
      keywords: kws, 
      serp_data: serpMap, 
      estimated_impressions: Math.round(estImpr),
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generated_at: new Date().toISOString()
    };
  });

  console.log('✅ Strategy generation completed:', {
    proposalsGenerated: withSerp.length,
    totalKeywords: kwList.length,
    avgEstimatedImpressions: withSerp.reduce((sum, p) => sum + p.estimated_impressions, 0) / withSerp.length
  });

  return new Response(
    JSON.stringify({ success: true, proposals: withSerp, message: `Generated ${withSerp.length} proposals` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
