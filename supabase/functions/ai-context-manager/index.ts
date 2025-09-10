import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 AI Context Manager called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, contextType } = await req.json();
    console.log(`📥 Fetching context for user: ${userId}, type: ${contextType}`);

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Fetch user solutions
    const { data: solutions, error: solutionsError } = await supabase
      .from('solutions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (solutionsError) {
      console.error('Error fetching solutions:', solutionsError);
    }

    // Fetch content items for analytics
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('id, status, seo_score, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (contentError) {
      console.error('Error fetching content items:', contentError);
    }

    // Fetch AI conversations for context
    const { data: conversations, error: conversationsError } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .eq('archived', false)
      .order('updated_at', { ascending: false })
      .limit(10);

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
    }

    // Fetch workflow states
    const { data: workflowStates, error: workflowError } = await supabase
      .from('ai_workflow_states')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (workflowError) {
      console.error('Error fetching workflow states:', workflowError);
    }

    // Try to fetch content builder context (might not exist for all users)
    let builderContext = {};
    try {
      const { data: contextData } = await supabase
        .from('ai_context_state')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (contextData?.context_data) {
        builderContext = contextData.context_data;
      }
    } catch (error) {
      console.log('No content builder context found (this is normal):', error);
    }

    // Calculate analytics
    const analytics = {
      totalContent: contentItems?.length || 0,
      publishedContent: contentItems?.filter(item => item.status === 'published').length || 0,
      draftContent: contentItems?.filter(item => item.status === 'draft').length || 0,
      averageSeoScore: contentItems?.length ? 
        contentItems.reduce((sum, item) => sum + (item.seo_score || 0), 0) / contentItems.length : 0,
      totalSolutions: solutions?.length || 0,
      totalConversations: conversations?.length || 0
    };

    // Generate contextual suggestions
    const suggestions = generateContextualSuggestions({
      solutions: solutions || [],
      contentItems: contentItems || [],
      conversations: conversations || [],
      workflowStates: workflowStates || []
    });

    const context = {
      solutions: solutions || [],
      analytics,
      contentItems: contentItems || [],
      conversations: conversations || [],
      workflowStates: workflowStates || [],
      builderContext,
      suggestions,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Context compiled successfully', {
      solutionsCount: solutions?.length || 0,
      contentItemsCount: contentItems?.length || 0,
      conversationsCount: conversations?.length || 0,
      hasBuilderContext: Object.keys(builderContext).length > 0
    });

    return new Response(JSON.stringify(context), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('💥 AI Context Manager error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      context: {
        solutions: [],
        analytics: { totalContent: 0, publishedContent: 0, draftContent: 0, averageSeoScore: 0 },
        contentItems: [],
        conversations: [],
        workflowStates: [],
        builderContext: {},
        suggestions: [],
        lastUpdated: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateContextualSuggestions(context: any): any[] {
  const suggestions = [];
  
  if (context.solutions.length === 0) {
    suggestions.push({
      id: 'create-solution',
      title: 'Create Your First Solution',
      description: 'Define your products or services to get personalized content suggestions',
      action: 'navigate:/solutions',
      priority: 'high'
    });
  }
  
  if (context.contentItems.length === 0) {
    suggestions.push({
      id: 'create-content',
      title: 'Create Your First Content',
      description: 'Start building content with AI assistance',
      action: 'navigate:/content-builder',
      priority: 'high'
    });
  }
  
  if (context.contentItems.length > 0 && context.contentItems.filter((item: any) => item.status === 'published').length === 0) {
    suggestions.push({
      id: 'publish-content',
      title: 'Publish Your Content',
      description: 'You have draft content ready to publish',
      action: 'navigate:/content',
      priority: 'medium'
    });
  }
  
  return suggestions.slice(0, 4);
}