import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔄 Starting proposal migration from ai_strategies to ai_strategy_proposals...');

    // Get all ai_strategies with non-empty proposals arrays
    const { data: strategies, error: fetchError } = await supabaseAdmin
      .from('ai_strategies')
      .select('*')
      .not('proposals', 'eq', '[]')
      .not('proposals', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching strategies:', fetchError);
      throw fetchError;
    }

    console.log(`📊 Found ${strategies?.length || 0} strategies with proposals to migrate`);

    if (!strategies || strategies.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No proposals to migrate',
          migrated: 0,
          skipped: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each strategy
    for (const strategy of strategies) {
      console.log(`\n🔍 Processing strategy: ${strategy.id}`);
      
      const proposals = Array.isArray(strategy.proposals) ? strategy.proposals : [];
      console.log(`  Found ${proposals.length} proposals in strategy`);

      for (const proposal of proposals) {
        try {
          // Check if this proposal already exists (idempotency check)
          const { data: existing, error: checkError } = await supabaseAdmin
            .from('ai_strategy_proposals')
            .select('id')
            .eq('user_id', strategy.user_id)
            .eq('title', proposal.title)
            .eq('primary_keyword', proposal.primary_keyword || proposal.mainKeyword || '')
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error('  ❌ Error checking existing proposal:', checkError);
            errors.push(`Check failed for "${proposal.title}": ${checkError.message}`);
            continue;
          }

          if (existing) {
            console.log(`  ⏭️  Skipping already migrated proposal: "${proposal.title}"`);
            skippedCount++;
            continue;
          }

          // Insert into ai_strategy_proposals
          const { error: insertError } = await supabaseAdmin
            .from('ai_strategy_proposals')
            .insert({
              user_id: strategy.user_id,
              strategy_session_id: strategy.id,
              title: proposal.title,
              description: proposal.description || null,
              primary_keyword: proposal.primary_keyword || proposal.mainKeyword || '',
              related_keywords: proposal.related_keywords || proposal.keywords || [],
              content_type: proposal.content_type || 'blog',
              priority_tag: proposal.priority_tag || 'evergreen',
              estimated_impressions: proposal.estimated_impressions || 0,
              content_suggestions: proposal.content_suggestions || proposal.suggested_outline || [],
              serp_data: proposal.serp_data || {},
              proposal_data: proposal,
              status: 'available',
              created_at: strategy.created_at,
              updated_at: strategy.updated_at
            });

          if (insertError) {
            console.error(`  ❌ Error inserting proposal "${proposal.title}":`, insertError);
            errors.push(`Insert failed for "${proposal.title}": ${insertError.message}`);
            continue;
          }

          console.log(`  ✅ Migrated proposal: "${proposal.title}"`);
          migratedCount++;
        } catch (proposalError) {
          console.error(`  ❌ Error processing proposal:`, proposalError);
          errors.push(`Error processing "${proposal.title}": ${proposalError.message}`);
        }
      }

      // Mark strategy as migrated by clearing proposals array
      try {
        await supabaseAdmin
          .from('ai_strategies')
          .update({ proposals: [] })
          .eq('id', strategy.id);
        console.log(`  ✅ Cleared proposals from strategy ${strategy.id}`);
      } catch (clearError) {
        console.error(`  ⚠️  Warning: Failed to clear proposals from strategy ${strategy.id}:`, clearError);
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`  Migrated: ${migratedCount} proposals`);
    console.log(`  Skipped (already exists): ${skippedCount} proposals`);
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.length}`);
      errors.forEach(err => console.log(`    - ${err}`));
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Migration complete: ${migratedCount} migrated, ${skippedCount} skipped`,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
