import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { estimateTokens, estimateObjectTokens } from '../shared/token-counter.ts';
import { truncateContentItem } from '../shared/content-optimizer.ts';
import { truncateProposal } from '../shared/proposal-optimizer.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, conversationId, userId, data } = await req.json();
    
    console.log(`🗂️ Context Manager: ${action} for user ${userId}`);

    switch (action) {
      case 'create_snapshot':
        return await createSnapshot(conversationId, userId, data);
      
      case 'load_snapshot':
        return await loadSnapshot(data.snapshotId, userId);
      
      case 'list_snapshots':
        return await listSnapshots(userId, conversationId);
      
      case 'update_context_state':
        return await updateContextState(userId, data);
      
      case 'get_context_state':
        return await getContextState(userId);
      
      case 'get_tiered_context':
        const intent = data.intent || { scope: 'summary', categories: ['content', 'solutions', 'proposals'] };
        return await buildTieredContext(userId, intent);
      
      case 'merge_contexts':
        return await mergeContexts(userId, data);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in context manager:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createSnapshot(conversationId: string, userId: string, data: any) {
  // Get current conversation messages
  const { data: messages, error: messagesError } = await supabase
    .rpc('get_conversation_messages', {
      conv_id: conversationId,
      limit_count: 100
    });

  if (messagesError) throw messagesError;

  // Get current workflow state
  const { data: workflowState } = await supabase
    .from('ai_workflow_states')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .single();

  // Create context snapshot
  const { data: snapshot, error: snapshotError } = await supabase
    .from('ai_context_snapshots')
    .insert({
      user_id: userId,
      title: data.title || `Snapshot ${new Date().toLocaleDateString()}`,
      messages: messages || [],
      workflow_state: workflowState?.workflow_data || {},
      conversation_type: data.conversationType || 'regular'
    })
    .select()
    .single();

  if (snapshotError) throw snapshotError;

  return new Response(JSON.stringify({ 
    snapshot,
    message: 'Context snapshot created successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function loadSnapshot(snapshotId: string, userId: string) {
  const { data: snapshot, error } = await supabase
    .from('ai_context_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    snapshot,
    message: 'Context snapshot loaded successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function listSnapshots(userId: string, conversationId?: string) {
  let query = supabase
    .from('ai_context_snapshots')
    .select('id, title, created_at, conversation_type')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: snapshots, error } = await query;

  if (error) throw error;

  return new Response(JSON.stringify({ 
    snapshots,
    count: snapshots?.length || 0
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateContextState(userId: string, data: any) {
  const { data: existingState } = await supabase
    .from('ai_context_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  const contextData = {
    ...existingState?.context || {},
    ...data.context,
    last_updated: new Date().toISOString()
  };

  const workflowData = {
    ...existingState?.workflow_state || {},
    ...data.workflowState,
    last_updated: new Date().toISOString()
  };

  const { data: updatedState, error } = await supabase
    .from('ai_context_state')
    .upsert({
      user_id: userId,
      context: contextData,
      workflow_state: workflowData
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    contextState: updatedState,
    message: 'Context state updated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function buildTieredContext(userId: string, intent: any) {
  console.log(`🎯 Building ${intent.scope} context for categories:`, intent.categories);
  
  // Get full context first
  const fullContextResponse = await getContextState(userId);
  const fullContext = await fullContextResponse.json();
  
  // Apply tiered filtering based on intent
  const filtered: any = {
    analytics: {
      ...fullContext.analytics,
      dataAvailability: fullContext.analytics.dataAvailability
    },
    contextState: fullContext.contextState
  };
  
  // Summary Scope: Top 3-5 items per category
  if (intent.scope === 'summary') {
    if (intent.categories.includes('solutions')) {
      filtered.solutions = fullContext.solutions?.slice(0, 3).map((s: any) => ({
        name: s.name,
        description: s.short_description || s.description?.substring(0, 200),
        category: s.category
      }));
      filtered.analytics.solutionsCount = fullContext.solutions?.length || 0;
    }
    
    if (intent.categories.includes('content')) {
      const contentBySolution = fullContext.analytics.contentBySolution || {};
      filtered.analytics.contentBySolution = Object.fromEntries(
        Object.entries(contentBySolution)
          .slice(0, 3)
          .map(([solution, data]: [string, any]) => [
            solution,
            {
              solution: data.solution,
              mappedContent: data.mappedContent.slice(0, 2).map((c: any) => ({
                title: c.title,
                content_type: c.content_type,
                seo_score: c.seo_score,
                created_at: c.created_at
              })),
              contentCount: data.mappedContent.length
            }
          ])
      );
    }
    
    if (intent.categories.includes('proposals')) {
      filtered.proposals = fullContext.proposals?.slice(0, 5).map((p: any) => ({
        title: p.title,
        primary_keyword: p.primary_keyword,
        content_type: p.content_type,
        priority_tag: p.priority_tag,
        estimated_impressions: p.estimated_impressions
      }));
      filtered.analytics.proposalsCount = fullContext.proposals?.length || 0;
    }
    
    console.log(`✅ Summary context built: ~5K tokens`);
    return new Response(JSON.stringify(filtered), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Detailed Scope: Top 10 items for requested categories only
  if (intent.scope === 'detailed') {
    if (intent.categories.includes('solutions')) {
      filtered.solutions = fullContext.solutions?.slice(0, 10);
    }
    
    if (intent.categories.includes('content')) {
      const contentBySolution = fullContext.analytics.contentBySolution || {};
      filtered.analytics.contentBySolution = Object.fromEntries(
        Object.entries(contentBySolution)
          .slice(0, 5)
          .map(([solution, data]: [string, any]) => [
            solution,
            {
              ...data,
              mappedContent: data.mappedContent.slice(0, 5)
            }
          ])
      );
    }
    
    if (intent.categories.includes('proposals')) {
      filtered.proposals = fullContext.proposals?.slice(0, 15);
    }
    
    if (intent.categories.includes('keywords')) {
      filtered.analytics.keywordCoverage = fullContext.analytics.keywordCoverage || 0;
    }
    
    console.log(`✅ Detailed context built: ~25K tokens`);
    return new Response(JSON.stringify(filtered), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Full Scope: Everything (use sparingly)
  if (intent.scope === 'full') {
    console.log(`⚠️ Full context requested: ~80K tokens`);
    return new Response(JSON.stringify(fullContext), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify(filtered), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Token budget configuration
const TOKEN_BUDGETS = {
  summary: {
    maxTotal: 4500,
    perContent: 200,
    perProposal: 50
  },
  detailed: {
    maxTotal: 20000,
    perContent: 500,
    perProposal: 150
  },
  full: {
    maxTotal: 28000,
    perContent: 1000,
    perProposal: 300
  }
};

async function getContextState(userId: string) {
  console.log(`🔄 Getting context state for user: ${userId}`);
  
  try {
    // Get user context state
    const { data: contextState, error: contextError } = await supabase
      .from('ai_context_state')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get user solutions
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('name, description, features, pain_points, target_audience, use_cases, benefits, category, short_description')
      .eq('user_id', userId)
      .limit(10);

    if (solutionsError) {
      console.error('❌ Error fetching solutions:', solutionsError);
    } else {
      console.log(`📋 Found ${solutions?.length || 0} solutions for user ${userId}`);
    }

    // Get comprehensive user content data with smart truncation
    const { data: rawContentItems, error: contentError } = await supabase
      .from('content_items')
      .select(`
        id,
        title,
        content,
        content_type,
        status,
        seo_score,
        created_at,
        updated_at,
        metadata,
        keywords,
        approval_status,
        solution_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to recent 50

    if (contentError) {
      console.error('❌ Error fetching content items:', contentError);
    }

    // Apply intelligent truncation IMMEDIATELY
    const budget = TOKEN_BUDGETS.summary; // Default to summary
    let contentItems = rawContentItems;

    if (rawContentItems && rawContentItems.length > 0) {
      console.log(`📝 Found ${rawContentItems.length} content items - applying truncation`);
      
      contentItems = rawContentItems.map(item => {
        const truncated = truncateContentItem(item, {
          maxContentLength: Math.floor(budget.perContent * 3.5),
          keepMetadataFields: ['mainKeyword', 'seoScore']
        });
        return truncated;
      });
      
      const totalTokens = contentItems.reduce((sum, item) => 
        sum + estimateObjectTokens(item), 0
      );
      console.log(`✅ Content optimized: ${totalTokens} total tokens (${rawContentItems.length} items)`);
    } else {
      console.log(`📝 Found ${rawContentItems?.length || 0} content items for user ${userId}`);
    }

    // Get unified keywords linked to content via content_keywords junction table
    // Step 1: Get content_keywords junction table data
    const { data: contentKeywordLinks, error: linksError } = await supabase
      .from('content_keywords')
      .select('content_id, keyword_id')
      .in('content_id', contentItems?.map(item => item.id) || []);

    if (linksError) {
      console.error('❌ Error fetching content keyword links:', linksError);
    }

    // Step 2: Get unique keyword IDs to fetch
    const keywordIds = [...new Set(contentKeywordLinks?.map(ck => ck.keyword_id) || [])];

    // Step 3: Fetch unified_keywords data separately
    const { data: unifiedKeywords, error: unifiedError } = await supabase
      .from('unified_keywords')
      .select('id, keyword, search_volume, difficulty, competition_score, intent')
      .in('id', keywordIds);

    if (unifiedError) {
      console.error('❌ Error fetching unified keywords:', unifiedError);
    }

    // Step 4: Manually join the data to match the expected structure
    const contentKeywords = contentKeywordLinks?.map(link => ({
      content_id: link.content_id,
      keyword_id: link.keyword_id,
      unified_keywords: unifiedKeywords?.find(k => k.id === link.keyword_id) || null
    })) || [];

    // Enhanced logging
    if (linksError || unifiedError) {
      console.error('❌ Error fetching keywords:', { linksError, unifiedError });
      console.log('⚠️ Continuing with empty keywords array');
    } else {
      console.log(`🔑 Successfully joined ${contentKeywords?.length || 0} content-keyword relationships`);
      console.log(`📊 Fetched ${unifiedKeywords?.length || 0} unique keywords from unified_keywords table`);
    }

    // Get AI strategy proposals with smart truncation
    const { data: rawProposals, error: proposalsError } = await supabase
      .from('ai_strategy_proposals')
      .select(`
        id,
        title,
        description,
        primary_keyword,
        related_keywords,
        content_type,
        priority_tag,
        estimated_impressions,
        status,
        created_at
      `)
      .eq('user_id', userId)
      .eq('status', 'available')
      .order('estimated_impressions', { ascending: false })
      .limit(100); // Limit to top 100

    if (proposalsError) {
      console.error('❌ Error fetching AI proposals:', proposalsError);
    }

    // Apply intelligent truncation IMMEDIATELY
    let aiProposals = rawProposals;

    if (rawProposals && rawProposals.length > 0) {
      console.log(`💡 Found ${rawProposals.length} proposals - applying truncation`);
      
      aiProposals = rawProposals.map(proposal => truncateProposal(proposal));
      
      const totalTokens = aiProposals.reduce((sum, p) => 
        sum + estimateObjectTokens(p), 0
      );
      console.log(`✅ Proposals optimized: ${totalTokens} total tokens (${rawProposals.length} items)`);
    } else {
      console.log(`💡 Found ${rawProposals?.length || 0} AI proposals`);
    }

    // Implement solution-content mapping logic
    const mapContentToSolutions = (content: any[] | null, solutions: any[] | null, keywords: any[] | null) => {
      const solutionContentMap = new Map();
      
      solutions?.forEach(solution => {
        solutionContentMap.set(solution.name, {
          solution,
          mappedContent: [],
          contentGaps: [],
          coverage: 0
        });
      });

      content?.forEach(contentItem => {
        const itemKeywords = keywords
          ?.filter(k => k.content_id === contentItem.id)
          ?.map(k => k.unified_keywords?.keyword || '') || [];
        
        let bestMatch = { solution: null, score: 0 };
        
        solutions?.forEach(solution => {
          let relevanceScore = 0;
          
          // Check title and content for solution keywords
          const solutionKeywords = [
            ...(solution.features || []),
            ...(solution.pain_points || []),
            ...(solution.use_cases || []),
            solution.name,
            solution.short_description || solution.description
          ].join(' ').toLowerCase();
          
          const mainKeywords = Array.isArray(contentItem.keywords) 
            ? contentItem.keywords 
            : (contentItem.keywords ? [contentItem.keywords] : []);
          const contentText = `${contentItem.title} ${contentItem.content || ''} ${mainKeywords.join(' ')}`.toLowerCase();
          
          // Keyword matching
          itemKeywords.forEach(keyword => {
            if (solutionKeywords.includes(keyword.toLowerCase())) {
              relevanceScore += 2;
            }
          });
          
          // Direct text matching
          if (contentText.includes(solution.name.toLowerCase())) {
            relevanceScore += 5;
          }
          
          // Metadata solution mapping
          if (contentItem.metadata?.solution_id || contentItem.metadata?.mapped_solutions?.includes(solution.name)) {
            relevanceScore += 10;
          }
          
          // Category/type matching
          if (contentItem.content_type && solution.category && 
              contentItem.content_type.toLowerCase() === solution.category.toLowerCase()) {
            relevanceScore += 3;
          }
          
          if (relevanceScore > bestMatch.score) {
            bestMatch = { solution: solution.name, score: relevanceScore };
          }
        });
        
        // Map content to best matching solution (if score > threshold)
        if (bestMatch.score >= 2 && bestMatch.solution) {
          const mapping = solutionContentMap.get(bestMatch.solution);
          mapping.mappedContent.push({
            ...contentItem,
            relevanceScore: bestMatch.score,
            mappedKeywords: itemKeywords
          });
          mapping.coverage = Math.min(100, (mapping.mappedContent.length * 25));
        }
      });
      
      return solutionContentMap;
    };

    // Create solution-content mapping
    const solutionContentMapping = mapContentToSolutions(contentItems, solutions, contentKeywords);
    
    // Analyze content gaps
    const contentGapAnalysis = Array.from(solutionContentMapping.entries()).map(([solutionName, data]: [string, any]) => {
      const gaps = [];
      
      // Check for missing content types
      const existingTypes = data.mappedContent.map((c: any) => c.content_type);
      const recommendedTypes = ['blog', 'social-twitter', 'social-linkedin', 'email'];
      
      recommendedTypes.forEach(type => {
        if (!existingTypes.includes(type)) {
          gaps.push({
            type: 'missing_content_type',
            contentType: type,
            priority: type === 'blog' ? 'high' : 'medium',
            suggestion: `Create ${type} content for ${solutionName}`
          });
        }
      });
      
      // Check content freshness
      const oldContent = data.mappedContent.filter((c: any) => {
        const contentDate = new Date(c.created_at);
        const monthsOld = (Date.now() - contentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsOld > 6;
      });
      
      if (oldContent.length > 0) {
        gaps.push({
          type: 'outdated_content',
          count: oldContent.length,
          priority: 'medium',
          suggestion: `Update ${oldContent.length} pieces of content for ${solutionName}`
        });
      }
      
      return {
        solution: solutionName,
        coverage: data.coverage,
        contentCount: data.mappedContent.length,
        gaps
      };
    });

    // Enhanced analytics with solution mapping
    const enhancedAnalytics = {
      totalContent: contentItems?.length || 0,
      published: contentItems?.filter(item => item.status === 'published')?.length || 0,
      draft: contentItems?.filter(item => item.status === 'draft')?.length || 0,
      proposals: aiProposals?.length || 0,
      avgSeoScore: (contentItems && contentItems.length > 0) 
        ? Math.round(contentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentItems.length)
        : 0,
      contentBySolution: Object.fromEntries(solutionContentMapping),
      contentGaps: contentGapAnalysis,
      recentContent: contentItems?.filter(item => {
        const itemDate = new Date(item.created_at);
        const daysOld = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysOld <= 30;
      })?.length || 0,
      keywordCoverage: contentKeywords?.length || 0,
      proposalsByPriority: {
        high: aiProposals?.filter(p => p.priority_tag === 'quick-win' || p.priority_tag === 'high-priority')?.length || 0,
        medium: aiProposals?.filter(p => p.priority_tag === 'evergreen')?.length || 0,
        low: aiProposals?.filter(p => p.priority_tag === 'long-tail')?.length || 0
      },
      
      // ✅ Comprehensive data availability tracking
      dataAvailability: {
        solutions: {
          available: (solutions?.length || 0) > 0,
          count: solutions?.length || 0,
          status: (solutions?.length || 0) > 0 
            ? `✅ ${solutions?.length} solutions tracked` 
            : "⚠️ No solutions configured. Add your products/services in Settings to enable solution-based insights."
        },
        content: {
          available: (contentItems?.length || 0) > 0,
          count: contentItems?.length || 0,
          status: (contentItems?.length || 0) > 0 
            ? `✅ ${contentItems?.length} content items tracked` 
            : "⚠️ No content created yet. Create content in Content Builder to track performance."
        },
        keywords: {
          available: (contentKeywords?.length || 0) > 0,
          count: contentKeywords?.length || 0,
          status: (contentKeywords?.length || 0) > 0 
            ? `✅ ${contentKeywords?.length} keywords linked to content` 
            : "⚠️ No keywords linked to content. Link keywords in Content Builder to unlock keyword-based insights."
        },
        proposals: {
          available: (aiProposals?.length || 0) > 0,
          count: aiProposals?.length || 0,
          status: (aiProposals?.length || 0) > 0 
            ? `✅ ${aiProposals?.length} AI proposals available` 
            : "⚠️ No AI proposals generated. Run Strategy Builder to generate content recommendations."
        },
        companyInfo: {
          available: !!contextState?.context?.companyInfo,
          status: contextState?.context?.companyInfo 
            ? "✅ Company information configured" 
            : "⚠️ Company information not set. Add company details in Settings for personalized insights."
        },
        seoData: {
          available: (contentItems?.filter(item => item.seo_score && item.seo_score > 0)?.length || 0) > 0,
          count: contentItems?.filter(item => item.seo_score && item.seo_score > 0)?.length || 0,
          status: (contentItems?.filter(item => item.seo_score && item.seo_score > 0)?.length || 0) > 0
            ? `✅ SEO scores available for ${contentItems?.filter(item => item.seo_score && item.seo_score > 0)?.length} content items`
            : "⚠️ No SEO scores available. Analyze content in SEO Optimizer to generate scores."
        }
      }
    };

    const comprehensiveContext = {
      contextState: contextState || {
        user_id: userId,
        context: {},
        workflow_state: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      solutions: solutions || [],
      proposals: aiProposals || [],
      analytics: enhancedAnalytics,
      companyInfo: contextState?.context?.companyInfo || null,
      lastFetched: new Date().toISOString()
    };

    console.log(`✅ Context state retrieved successfully:`, {
      solutionsCount: solutions?.length || 0,
      contentCount: contentItems?.length || 0,
      keywordCoverage: contentKeywords?.length || 0,
      proposalsCount: aiProposals?.length || 0,
      hasContextState: !!contextState,
      hasSeoData: contentItems?.filter(item => item.seo_score && item.seo_score > 0)?.length || 0,
      hasCompanyInfo: !!contextState?.context?.companyInfo
    });

    // Calculate and log total token usage
    const solutionsTokens = estimateObjectTokens(solutions);
    const contentTokens = contentItems?.reduce((sum, item) => sum + estimateObjectTokens(item), 0) || 0;
    const proposalsTokens = aiProposals?.reduce((sum, p) => sum + estimateObjectTokens(p), 0) || 0;
    const totalTokens = solutionsTokens + contentTokens + proposalsTokens;

    console.log(`
📊 CONTEXT MANAGER TOKEN ANALYSIS:
  - Solutions: ${solutions?.length || 0} items, ~${solutionsTokens} tokens
  - Content: ${contentItems?.length || 0} items, ~${contentTokens} tokens
  - Proposals: ${aiProposals?.length || 0} items, ~${proposalsTokens} tokens
  - Keywords: ${unifiedKeywords?.length || 0} unique keywords
  - Total Context: ~${totalTokens} tokens
  - Status: ${totalTokens < 28000 ? '✅ SAFE' : '🚨 EXCEEDS LIMIT'}
`);

    return new Response(JSON.stringify(comprehensiveContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error fetching context state:', error);
    
    // Return fallback context
    const fallbackContext = {
      contextState: {
        user_id: userId,
        context: {},
        workflow_state: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      solutions: [],
      analytics: { totalContent: 0, published: 0, avgSeoScore: 0 },
      companyInfo: null,
      lastFetched: new Date().toISOString(),
      error: 'Partial data due to fetch error'
    };

    return new Response(JSON.stringify(fallbackContext), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function mergeContexts(userId: string, data: any) {
  const { sourceSnapshotId, targetSnapshotId, mergeStrategy = 'append' } = data;

  // Get both snapshots
  const { data: sourceSnapshot } = await supabase
    .from('ai_context_snapshots')
    .select('*')
    .eq('id', sourceSnapshotId)
    .eq('user_id', userId)
    .single();

  const { data: targetSnapshot } = await supabase
    .from('ai_context_snapshots')
    .select('*')
    .eq('id', targetSnapshotId)
    .eq('user_id', userId)
    .single();

  if (!sourceSnapshot || !targetSnapshot) {
    throw new Error('One or both snapshots not found');
  }

  // Merge messages based on strategy
  let mergedMessages = [];
  if (mergeStrategy === 'append') {
    mergedMessages = [...targetSnapshot.messages, ...sourceSnapshot.messages];
  } else if (mergeStrategy === 'interleave') {
    // Sort by timestamp and interleave
    const allMessages = [...targetSnapshot.messages, ...sourceSnapshot.messages];
    mergedMessages = allMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  // Merge workflow states
  const mergedWorkflowState = {
    ...targetSnapshot.workflow_state,
    ...sourceSnapshot.workflow_state,
    merged_at: new Date().toISOString(),
    source_snapshots: [sourceSnapshotId, targetSnapshotId]
  };

  // Create new merged snapshot
  const { data: mergedSnapshot, error } = await supabase
    .from('ai_context_snapshots')
    .insert({
      user_id: userId,
      title: `Merged: ${targetSnapshot.title} + ${sourceSnapshot.title}`,
      messages: mergedMessages,
      workflow_state: mergedWorkflowState,
      conversation_type: 'merged'
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ 
    mergedSnapshot,
    message: 'Context snapshots merged successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}