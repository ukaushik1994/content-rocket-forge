import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const serpApiKey = Deno.env.get('SERP_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting scheduled opportunity scan...');

    // Get active seed keywords from all users
    const { data: seeds, error: seedsError } = await supabase
      .from('opportunity_seeds')
      .select(`
        id,
        user_id,
        strategy_id,
        keyword,
        topic_cluster,
        scan_frequency,
        last_scanned
      `)
      .eq('is_active', true);

    if (seedsError) {
      console.error('Error fetching seeds:', seedsError);
      throw seedsError;
    }

    console.log(`Found ${seeds?.length || 0} active seed keywords`);

    const results = [];
    
    for (const seed of seeds || []) {
      try {
        // Check if we should scan this keyword based on frequency
        if (!shouldScanKeyword(seed.last_scanned, seed.scan_frequency)) {
          console.log(`⏭️ Skipping ${seed.keyword} - not due for scan`);
          continue;
        }

        console.log(`🔍 Scanning keyword: ${seed.keyword}`);

        // Check SERP cache first
        let serpData = await getCachedSerpData(seed.keyword);
        
        if (!serpData && serpApiKey) {
          // Fetch fresh SERP data
          serpData = await fetchSerpData(seed.keyword);
          if (serpData) {
            await cacheSerpData(seed.keyword, serpData);
          }
        }

        if (serpData) {
          // Get user's AI provider for analysis
          const aiProvider = await getUserAIProvider(seed.user_id);
          
          // Analyze with AI for content opportunities
          const opportunities = await analyzeForOpportunities(seed, serpData, aiProvider);
          
          for (const opportunity of opportunities) {
            // Check if opportunity already exists
            const { data: existing } = await supabase
              .from('content_opportunities')
              .select('id')
              .eq('user_id', seed.user_id)
              .eq('keyword', opportunity.keyword)
              .single();

            if (!existing) {
              // Create new opportunity
              const { data: newOpp, error: oppError } = await supabase
                .from('content_opportunities')
                .insert([{
                  user_id: seed.user_id,
                  strategy_id: seed.strategy_id,
                  keyword: opportunity.keyword,
                  search_volume: opportunity.search_volume,
                  keyword_difficulty: opportunity.difficulty,
                  competition_score: opportunity.competition_score,
                  opportunity_score: opportunity.opportunity_score,
                  relevance_score: opportunity.relevance_score,
                  content_format: opportunity.content_format,
                  status: 'new',
                  source: 'scheduled_scan',
                  serp_data: serpData,
                  content_gaps: opportunity.content_gaps,
                  suggested_title: opportunity.suggested_title,
                  suggested_outline: opportunity.suggested_outline,
                  internal_link_opportunities: opportunity.internal_links,
                  is_aio_friendly: opportunity.is_aio_friendly,
                  trend_direction: opportunity.trend_direction,
                  priority: opportunity.priority
                }])
                .select()
                .single();

              if (!oppError && newOpp) {
                console.log(`✅ Created opportunity: ${opportunity.keyword}`);
                
                // Create notification
                await supabase
                  .from('opportunity_notifications')
                  .insert([{
                    user_id: seed.user_id,
                    opportunity_id: newOpp.id,
                    notification_type: 'in_app',
                    status: 'pending',
                    metadata: {
                      keyword: opportunity.keyword,
                      priority: opportunity.priority,
                      opportunity_score: opportunity.opportunity_score,
                      source: 'scheduled_scan'
                    }
                  }]);

                results.push({
                  keyword: opportunity.keyword,
                  status: 'created',
                  opportunity_id: newOpp.id
                });
              }
            } else {
              console.log(`⏭️ Opportunity already exists for: ${opportunity.keyword}`);
            }
          }
        }

        // Update last_scanned timestamp
        await supabase
          .from('opportunity_seeds')
          .update({ last_scanned: new Date().toISOString() })
          .eq('id', seed.id);

      } catch (error) {
        console.error(`Error processing seed ${seed.keyword}:`, error);
        results.push({
          keyword: seed.keyword,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Clean expired SERP cache
    await supabase.rpc('clean_expired_serp_cache');

    console.log(`🎯 Scan complete. Processed ${results.length} keywords`);

    return new Response(JSON.stringify({
      success: true,
      message: `Processed ${seeds?.length || 0} seed keywords`,
      results: results,
      processed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in scheduled scan:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function getUserAIProvider(userId: string) {
  try {
    const { data: userKeys } = await supabase
      .from('user_llm_keys')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    // Priority: OpenRouter > Anthropic > Gemini > OpenAI
    const openrouter = userKeys?.find(k => k.provider === 'openrouter');
    const anthropic = userKeys?.find(k => k.provider === 'anthropic');
    const gemini = userKeys?.find(k => k.provider === 'gemini');
    const openai = userKeys?.find(k => k.provider === 'openai');

    if (openrouter?.api_key) {
      return {
        provider: 'openrouter',
        api_key: openrouter.api_key,
        model: openrouter.model || 'meta-llama/llama-3.2-3b-instruct:free'
      };
    }
    
    if (anthropic?.api_key) {
      return {
        provider: 'anthropic',
        api_key: anthropic.api_key,
        model: anthropic.model || 'claude-3-haiku-20240307'
      };
    }
    
    if (gemini?.api_key) {
      return {
        provider: 'gemini',
        api_key: gemini.api_key,
        model: gemini.model || 'gemini-pro'
      };
    }
    
    if (openai?.api_key) {
      return {
        provider: 'openai',
        api_key: openai.api_key,
        model: openai.model || 'gpt-4o-mini'
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user AI provider:', error);
    return null;
  }
}

async function callAIWithFallback(provider: any, prompt: string) {
  if (!provider) {
    throw new Error('No AI provider configured');
  }

  const messages = [{ role: 'user', content: prompt }];

  try {
    switch (provider.provider) {
      case 'openrouter':
        return await callOpenRouter(provider.api_key, provider.model, messages);
      case 'anthropic':
        return await callAnthropic(provider.api_key, provider.model, messages);
      case 'gemini':
        return await callGemini(provider.api_key, provider.model, messages);
      case 'openai':
        return await callOpenAI(provider.api_key, provider.model, messages);
      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
  } catch (error) {
    console.error(`${provider.provider} API error:`, error);
    throw error;
  }
}

async function callOpenRouter(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callGemini(apiKey: string, model: string, messages: any[]) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages.map(m => ({ parts: [{ text: m.content }] }))
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function shouldScanKeyword(lastScanned: string | null, frequency: string): boolean {
  if (!lastScanned) return true;
  
  const last = new Date(lastScanned);
  const now = new Date();
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  
  switch (frequency) {
    case 'hourly': return hoursSince >= 1;
    case 'daily': return hoursSince >= 24;
    case 'weekly': return hoursSince >= 168;
    default: return hoursSince >= 24;
  }
}

async function getCachedSerpData(keyword: string) {
  const { data } = await supabase
    .from('raw_serp_data')
    .select('serp_response, organic_results, people_also_ask, related_searches')
    .eq('keyword', keyword)
    .gt('expires_at', new Date().toISOString())
    .order('cached_at', { ascending: false })
    .limit(1)
    .single();
    
  return data?.serp_response || null;
}

async function fetchSerpData(keyword: string) {
  if (!serpApiKey) {
    console.log('⚠️ SERP API key not configured - skipping keyword, will retry on next scan');
    return null; // Return null instead of mock data - caller should skip this keyword
  }

  try {
    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(keyword)}&num=10&hl=en&gl=us&api_key=${serpApiKey}`;
    
    const response = await fetch(serpUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`SERP API error: ${data.error}`);
    }
    
    return data;
  } catch (error) {
    console.error('SERP API error:', error);
    // Return null instead of mock data - graceful degradation without fake data
    console.log('⚠️ SERP API failed - skipping keyword, will retry on next scan');
    return null;
  }
}

async function cacheSerpData(keyword: string, serpData: any) {
  await supabase
    .from('raw_serp_data')
    .insert([{
      keyword,
      serp_response: serpData,
      organic_results: serpData.organic_results || [],
      people_also_ask: serpData.people_also_ask || [],
      related_searches: serpData.related_searches || [],
      featured_snippet: serpData.answer_box || {},
      total_results: serpData.search_information?.total_results || 0
    }]);
}

async function analyzeForOpportunities(seed: any, serpData: any, aiProvider: any) {
  const opportunities = [];
  
  // Extract data from SERP
  const organicResults = serpData.organic_results || [];
  const peopleAlsoAsk = serpData.people_also_ask || [];
  const relatedSearches = serpData.related_searches || [];
  
  // Analyze main keyword
  const mainOpportunity = await classifyContent(seed.keyword, serpData, aiProvider);
  if (mainOpportunity) {
    opportunities.push(mainOpportunity);
  }
  
  // Analyze related searches for additional opportunities
  for (const related of relatedSearches.slice(0, 3)) {
    if (related.query && related.query !== seed.keyword) {
      const relatedOpportunity = await classifyContent(related.query, serpData, aiProvider);
      if (relatedOpportunity && relatedOpportunity.opportunity_score > 60) {
        opportunities.push(relatedOpportunity);
      }
    }
  }
  
  return opportunities;
}

async function classifyContent(keyword: string, serpData: any, aiProvider: any) {
  if (!aiProvider) {
    console.log('⚠️ No AI provider configured, using rule-based classification');
    return generateRuleBasedClassification(keyword, serpData);
  }

  try {
    const organicTitles = serpData.organic_results?.slice(0, 5).map((r: any) => r.title).join('\n') || '';
    const paaQuestions = serpData.people_also_ask?.slice(0, 3).map((q: any) => q.question).join('\n') || '';
    
    const prompt = `
Analyze this keyword for content opportunities: "${keyword}"

SERP Analysis:
Top 5 Titles: ${organicTitles}
People Also Ask: ${paaQuestions}

Determine:
1. Best content type: "blog", "article", "glossary", or "guide"
2. Priority level: "high", "medium", or "low"
3. Opportunity score: 0-100 (higher = better opportunity)
4. Suggested title (max 60 chars)
5. 3-5 main headings for outline
6. Is this AIO-friendly? (true/false)
7. Content gaps you identify
8. Trend direction: "growing", "stable", or "declining"

Respond in JSON format:
{
  "content_type": "blog",
  "priority": "high",
  "opportunity_score": 85,
  "suggested_title": "Complete Guide to...",
  "outline": ["Introduction", "Main Point 1", "Main Point 2", "Conclusion"],
  "is_aio_friendly": true,
  "content_gaps": ["Gap 1", "Gap 2"],
  "trend_direction": "growing",
  "reasoning": "Brief explanation"
}`;

    const content = await callAIWithFallback(aiProvider, prompt);
    
    try {
      const analysis = JSON.parse(content);
      
      return {
        keyword,
        content_format: analysis.content_type,
        priority: analysis.priority,
        opportunity_score: analysis.opportunity_score,
        relevance_score: analysis.opportunity_score / 100,
        suggested_title: analysis.suggested_title,
        suggested_outline: analysis.outline,
        is_aio_friendly: analysis.is_aio_friendly,
        content_gaps: analysis.content_gaps,
        trend_direction: analysis.trend_direction,
        search_volume: serpData.search_information?.total_results || 0,
        difficulty: calculateDifficulty(serpData),
        competition_score: calculateCompetitionScore(serpData),
        internal_links: extractPotentialLinks(serpData)
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return generateRuleBasedClassification(keyword, serpData);
    }
    
  } catch (error) {
    console.error('AI API error:', error);
    return generateRuleBasedClassification(keyword, serpData);
  }
}

function generateRuleBasedClassification(keyword: string, serpData: any) {
  const organicResults = serpData.organic_results || [];
  const paaQuestions = serpData.people_also_ask || [];
  
  // Simple rule-based classification
  let contentType = 'blog';
  let priority = 'medium';
  let opportunityScore = 50;
  
  // Determine content type based on keyword patterns
  if (keyword.includes('what is') || keyword.includes('definition')) {
    contentType = 'glossary';
    opportunityScore += 10;
  } else if (keyword.includes('how to') || keyword.includes('guide')) {
    contentType = 'guide';
    opportunityScore += 15;
  } else if (keyword.includes('best') || keyword.includes('vs') || keyword.includes('comparison')) {
    contentType = 'article';
    opportunityScore += 5;
  }
  
  // Adjust score based on competition
  if (organicResults.length < 5) {
    opportunityScore += 20;
    priority = 'high';
  } else if (organicResults.length > 8) {
    opportunityScore -= 10;
  }
  
  // Boost score if there are PAA questions
  if (paaQuestions.length > 0) {
    opportunityScore += 10;
  }
  
  return {
    keyword,
    content_format: contentType,
    priority,
    opportunity_score: Math.min(100, Math.max(0, opportunityScore)),
    relevance_score: opportunityScore / 100,
    suggested_title: `Complete Guide to ${keyword}`,
    suggested_outline: ['Introduction', 'Key Concepts', 'Best Practices', 'Conclusion'],
    is_aio_friendly: paaQuestions.length > 0,
    content_gaps: ['Detailed examples', 'Implementation guide'],
    trend_direction: 'stable',
    search_volume: serpData.search_information?.total_results || 0,
    difficulty: calculateDifficulty(serpData),
    competition_score: calculateCompetitionScore(serpData),
    internal_links: extractPotentialLinks(serpData)
  };
}

function calculateDifficulty(serpData: any): number {
  const organicResults = serpData.organic_results || [];
  // Simple difficulty calculation based on result quality
  const authorityDomains = organicResults.filter((r: any) => 
    r.link?.includes('wikipedia') || 
    r.link?.includes('hubspot') || 
    r.link?.includes('salesforce')
  ).length;
  
  return Math.min(100, (authorityDomains / organicResults.length) * 100);
}

function calculateCompetitionScore(serpData: any): number {
  const organicResults = serpData.organic_results || [];
  return Math.min(1, organicResults.length / 10);
}

function extractPotentialLinks(serpData: any): any[] {
  const organicResults = serpData.organic_results || [];
  return organicResults.slice(0, 3).map((r: any) => ({
    title: r.title,
    url: r.link,
    snippet: r.snippet
  }));
}

// REMOVED: generateMockSerpData function
// Mock data generation has been removed to ensure data integrity.
// When SERP API is unavailable, keywords are skipped and retried on next scan cycle.