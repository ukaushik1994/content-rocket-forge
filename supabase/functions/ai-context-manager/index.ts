import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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

    // Get comprehensive user content data
    const { data: contentItems, error: contentError } = await supabase
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
      .order('created_at', { ascending: false });

    if (contentError) {
      console.error('❌ Error fetching content items:', contentError);
    } else {
      console.log(`📝 Found ${contentItems?.length || 0} content items for user ${userId}`);
    }

    // Get unified keywords linked to content via content_keywords junction table
    const { data: contentKeywords, error: keywordsError } = await supabase
      .from('content_keywords')
      .select(`
        content_id,
        keyword_id,
        unified_keywords!inner (
          id,
          keyword,
          search_volume,
          difficulty,
          competition_score,
          intent
        )
      `)
      .in('content_id', contentItems?.map(item => item.id) || []);

    if (keywordsError) {
      console.error('❌ Error fetching content keywords:', keywordsError);
    } else {
      console.log(`🔑 Found keywords for ${contentKeywords?.length || 0} content items`);
    }

    // Get AI strategy proposals (the proposals ready for content creation)
    const { data: aiProposals, error: proposalsError } = await supabase
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
      .order('estimated_impressions', { ascending: false });

    if (proposalsError) {
      console.error('❌ Error fetching AI proposals:', proposalsError);
    } else {
      console.log(`💡 Found ${aiProposals?.length || 0} AI proposals`);
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