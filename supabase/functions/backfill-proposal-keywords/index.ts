import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get auth token
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      throw new Error('Unauthorized');
    }

    console.log(`🔄 Starting keyword backfill for user ${user.id}`);

    // Fetch all proposals for this user
    const { data: proposals, error: fetchError } = await supabaseAdmin
      .from('ai_strategy_proposals')
      .select('id, title, proposal_data, serp_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📊 Found ${proposals?.length || 0} proposals`);

    let keywordsSaved = 0;
    let keywordsSkipped = 0;
    const errors: any[] = [];

    // Process each proposal
    for (const proposal of proposals || []) {
      const keywords = proposal.proposal_data?.keywords || [];
      
      for (const kwObj of keywords) {
        try {
          // Extract keyword string from object
          const keywordStr = typeof kwObj === 'string' ? kwObj : kwObj.keyword;
          
          if (!keywordStr) {
            console.warn(`⚠️ Skipping invalid keyword in proposal ${proposal.id}`);
            keywordsSkipped++;
            continue;
          }

          // Get SERP data for this keyword
          const serpData = proposal.serp_data?.[keywordStr];

          // Upsert keyword
          const { error: kwError } = await supabaseAdmin
            .from('unified_keywords')
            .upsert({
              user_id: user.id,
              keyword: keywordStr,
              search_volume: serpData?.search_volume || 0,
              difficulty: serpData?.keyword_difficulty || 0,
              competition: serpData?.competition_score || 0,
              cpc: serpData?.cpc || null,
              intent: kwObj.intent || 'informational',
              source_type: 'ai_strategy',
              source_id: proposal.id,
              serp_last_updated: serpData ? new Date().toISOString() : null
            }, {
              onConflict: 'user_id,keyword',
              ignoreDuplicates: false // Update if exists
            });

          if (kwError) {
            console.error(`❌ Failed to save "${keywordStr}":`, kwError);
            errors.push({ keyword: keywordStr, error: kwError.message });
          } else {
            console.log(`✅ Saved: ${keywordStr}`);
            keywordsSaved++;
          }
        } catch (err) {
          console.error(`❌ Error processing keyword:`, err);
          errors.push({ error: err.message });
        }
      }
    }

    console.log(`✅ Backfill complete: ${keywordsSaved} saved, ${keywordsSkipped} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Keyword backfill completed',
        stats: {
          proposals_processed: proposals?.length || 0,
          keywords_saved: keywordsSaved,
          keywords_skipped: keywordsSkipped,
          errors: errors.length
        },
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Backfill error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
