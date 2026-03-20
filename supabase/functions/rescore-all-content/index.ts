import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Same SEO scorer as content-action-tools.ts (with 2D penalties)
function calculateBasicSeoScore(content: string, keyword: string, metaTitle?: string, metaDescription?: string): number {
  if (!content) return 0;
  let score = 0;
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword?.toLowerCase() || '';
  const wordCount = content.split(/\s+/).length;

  if (wordCount >= 1000) score += 20;
  else if (wordCount >= 500) score += 16;
  else if (wordCount >= 300) score += 12;
  else if (wordCount >= 150) score += 8;
  else score += 4;

  let density = 0;
  if (lowerKeyword) {
    const escaped = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keywordCount = (lowerContent.match(new RegExp(escaped, 'gi')) || []).length;
    density = keywordCount / Math.max(wordCount, 1) * 100;
    if (keywordCount >= 1 && density <= 4) score += 15;
    else if (keywordCount >= 1) score += 10;
  }

  const hasH1 = /<h1/i.test(content) || /^#\s/m.test(content);
  const h2Count = (content.match(/<h2/gi) || []).length + (content.match(/^##\s/gm) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length + (content.match(/^###\s/gm) || []).length;
  if (hasH1) score += 4;
  if (h2Count >= 3) score += 7;
  else if (h2Count >= 1) score += 4;
  if (h3Count >= 1) score += 4;

  const hasFAQ = /faq|frequently asked|common questions/i.test(content);
  const hasKeyTakeaways = /key takeaway|takeaway|summary|in summary|tl;?dr/i.test(content);
  const listCount = (content.match(/<li/gi) || []).length + (content.match(/^[-*]\s/gm) || []).length + (content.match(/^\d+\.\s/gm) || []).length;
  if (hasFAQ) score += 8;
  if (hasKeyTakeaways) score += 6;
  if (listCount >= 3) score += 6;
  else if (listCount >= 1) score += 3;

  if (metaTitle && metaTitle.length >= 30 && metaTitle.length <= 65) score += 8;
  else if (metaTitle && metaTitle.length > 0) score += 5;
  if (metaDescription && metaDescription.length >= 100 && metaDescription.length <= 165) score += 7;
  else if (metaDescription && metaDescription.length > 0) score += 4;

  if (lowerKeyword) {
    if (metaTitle?.toLowerCase().includes(lowerKeyword)) score += 8;
    if (metaDescription?.toLowerCase().includes(lowerKeyword)) score += 7;
  }

  // 2D Penalties
  if (density > 3) score -= Math.min(10, Math.round((density - 3) * 3));
  const linkCount = (content.match(/<a\s/gi) || []).length + (content.match(/\[.*?\]\(.*?\)/g) || []).length;
  if (linkCount === 0 && wordCount > 300) score -= 5;
  const paragraphs = content.split(/(?:<\/p>\s*<p|<br\s*\/?>\s*<br|\n\n)/).filter((p: string) => p.replace(/<[^>]+>/g, '').trim().length > 20);
  if (paragraphs.length >= 4) {
    const pLengths = paragraphs.map((p: string) => p.replace(/<[^>]+>/g, '').trim().split(/\s+/).length);
    const avgLen = pLengths.reduce((a: number, b: number) => a + b, 0) / pLengths.length;
    const variance = pLengths.reduce((sum: number, l: number) => sum + Math.pow(l - avgLen, 2), 0) / pLengths.length;
    if (Math.sqrt(variance) / Math.max(avgLen, 1) < 0.15) score -= 5;
  }
  if (!/\?/.test(content) && wordCount > 500) score -= 3;

  return Math.max(0, Math.min(score, 100));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate the user
    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch all content items for this user
    const { data: items, error: fetchError } = await supabase.from('content_items')
      .select('id, content, main_keyword, meta_title, meta_description, seo_score')
      .eq('user_id', user.id)
      .neq('status', 'archived');

    if (fetchError) throw fetchError;

    let updated = 0;
    let skipped = 0;

    for (const item of (items || [])) {
      if (!item.content) { skipped++; continue; }

      const newScore = calculateBasicSeoScore(
        item.content,
        item.main_keyword || '',
        item.meta_title || undefined,
        item.meta_description || undefined
      );

      // Only update if score changed
      if (newScore !== item.seo_score) {
        await supabase.from('content_items')
          .update({ seo_score: newScore })
          .eq('id', item.id)
          .eq('user_id', user.id);
        updated++;
      } else {
        skipped++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total: (items || []).length,
      updated,
      skipped,
      message: `Rescored ${updated} content items (${skipped} unchanged).`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Rescore error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
