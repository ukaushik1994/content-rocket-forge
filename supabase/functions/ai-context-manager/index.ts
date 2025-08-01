
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, contextType } = await req.json();
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let contextData = {};

    // Fetch user's solutions
    if (contextType === 'all' || contextType === 'solutions') {
      const { data: solutions } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', userId);
      contextData = { ...contextData, solutions };
    }

    // Fetch user's content analytics
    if (contextType === 'all' || contextType === 'analytics') {
      const { data: contentItems } = await supabase
        .from('content_items')
        .select('id, title, status, created_at, seo_score')
        .eq('user_id', userId);
      
      const analytics = {
        totalContent: contentItems?.length || 0,
        published: contentItems?.filter(item => item.status === 'published').length || 0,
        inReview: contentItems?.filter(item => item.status === 'review').length || 0,
        drafts: contentItems?.filter(item => item.status === 'draft').length || 0,
        avgSeoScore: contentItems?.length > 0 
          ? Math.round(contentItems.reduce((acc, item) => acc + (item.seo_score || 0), 0) / contentItems.length)
          : 0,
        recentContent: contentItems?.slice(0, 5) || []
      };
      contextData = { ...contextData, analytics };
    }

    // Fetch workflow states
    if (contextType === 'all' || contextType === 'workflow') {
      const { data: workflowStates } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      contextData = { ...contextData, currentWorkflow: workflowStates?.[0] || null };
    }

    return new Response(JSON.stringify(contextData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-context-manager:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
