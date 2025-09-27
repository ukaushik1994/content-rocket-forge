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
      .select('name, description, features, painPoints, targetAudience')
      .eq('user_id', userId)
      .limit(10);

    // Get user content analytics
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('status, seo_score, created_at')
      .eq('user_id', userId);

    // Build comprehensive context
    const analytics = {
      totalContent: contentItems?.length || 0,
      published: contentItems?.filter(item => item.status === 'published')?.length || 0,
      avgSeoScore: contentItems?.length > 0 
        ? contentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentItems.length 
        : 0
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
      analytics,
      companyInfo: contextState?.context?.companyInfo || null,
      lastFetched: new Date().toISOString()
    };

    console.log(`✅ Context state retrieved successfully:`, {
      solutionsCount: solutions?.length || 0,
      contentCount: contentItems?.length || 0,
      hasContextState: !!contextState
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