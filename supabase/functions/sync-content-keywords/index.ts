import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../shared/cors.ts'
import { createErrorResponse, createSuccessResponse } from '../shared/errors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);

    if (!user) {
      return createErrorResponse('Unauthorized', 401, 'sync-content-keywords', 'auth');
    }

    console.log(`🔄 Starting content keyword sync for user ${user.id}`);

    // Fetch all content items for the user
    const { data: contentItems, error: fetchError } = await supabaseAdmin
      .from('content_items')
      .select('id, title, metadata, created_at')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('❌ Failed to fetch content items:', fetchError);
      return createErrorResponse(fetchError.message, 500, 'sync-content-keywords', 'fetch');
    }

    let keywordsSaved = 0;
    let usageLogged = 0;
    const errors: Array<{ keyword?: string; contentId?: string; error: string }> = [];

    console.log(`📊 Found ${contentItems?.length || 0} content items to process`);

    for (const content of contentItems || []) {
      const metadata = content.metadata as any;
      const mainKeyword = metadata?.mainKeyword;
      const secondaryKeywords = metadata?.secondaryKeywords || [];
      
      const allKeywords = [mainKeyword, ...secondaryKeywords].filter(Boolean);

      if (allKeywords.length === 0) continue;

      console.log(`📝 Processing content "${content.title}" with ${allKeywords.length} keywords`);

      for (const kw of allKeywords) {
        try {
          // Extract keyword string from various formats
          const keywordStr = typeof kw === 'string' ? kw : kw?.keyword || kw;
          
          if (!keywordStr || typeof keywordStr !== 'string') {
            console.warn(`⚠️ Invalid keyword format in content ${content.id}:`, kw);
            continue;
          }

          // Upsert keyword into unified_keywords
          const { data: savedKeyword, error: kwError } = await supabaseAdmin
            .from('unified_keywords')
            .upsert({
              user_id: user.id,
              keyword: keywordStr.trim(),
              source_type: 'content',
              source_id: content.id,
              search_volume: 0,
              difficulty: 0,
              competition_score: 0,
              intent: 'informational',
              is_tracked: true
            }, {
              onConflict: 'user_id,keyword',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (kwError) {
            console.error(`❌ Failed to save "${keywordStr}":`, kwError);
            errors.push({ 
              keyword: keywordStr, 
              contentId: content.id,
              error: kwError.message 
            });
            continue;
          }

          console.log(`✅ Saved: ${keywordStr}`);
          keywordsSaved++;

          // Track usage in keyword_usage_log
          const { error: logError } = await supabaseAdmin
            .from('keyword_usage_log')
            .upsert({
              unified_keyword_id: savedKeyword.id,
              content_id: content.id,
              content_type: 'content_item',
              usage_type: kw === mainKeyword ? 'primary' : 'secondary'
            }, {
              onConflict: 'unified_keyword_id,content_id',
              ignoreDuplicates: true
            });

          if (!logError) {
            usageLogged++;
          } else {
            console.warn(`⚠️ Failed to log usage for "${keywordStr}":`, logError);
          }

        } catch (err) {
          console.error(`❌ Error processing keyword in content ${content.id}:`, err);
          errors.push({ 
            contentId: content.id,
            error: err.message 
          });
        }
      }
    }

    // Update usage counts for all keywords
    console.log('🔄 Updating usage counts...');
    const { error: refreshError } = await supabaseAdmin.rpc('refresh_keyword_usage_counts');
    
    if (refreshError) {
      console.warn('⚠️ Failed to refresh usage counts:', refreshError);
    }

    console.log(`✅ Content keyword sync complete: ${keywordsSaved} saved, ${usageLogged} logged`);

    return createSuccessResponse({
      success: true,
      message: 'Content keywords synced successfully',
      stats: {
        content_items_processed: contentItems?.length || 0,
        keywords_saved: keywordsSaved,
        usage_logged: usageLogged,
        errors_count: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Sync content keywords error:', error);
    return createErrorResponse(
      error.message || 'Unknown error occurred',
      500,
      'sync-content-keywords',
      'main'
    );
  }
});
