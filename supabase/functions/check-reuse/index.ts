// Supabase Edge Function: check-reuse
// Purpose: Compare current SERP selections with user's historical usage to detect potential reuse
// CORS is enabled for web usage

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckReuseRequest {
  primary_keyword: string;
  used_faqs?: string[];
  used_headings?: string[];
  used_titles?: string[];
}

interface CheckReuseResponse {
  reused: boolean;
  overlapPercent: number;
  matched: {
    faqs: string[];
    headings: string[];
    titles: string[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Supabase env not configured' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const body = (await req.json()) as CheckReuseRequest;
    const primaryKeyword = (body.primary_keyword || '').trim();
    const currentFaqs = Array.from(new Set(body.used_faqs || []));
    const currentHeadings = Array.from(new Set(body.used_headings || []));
    const currentTitles = Array.from(new Set(body.used_titles || []));

    // If nothing to compare, short-circuit
    const totalSelected = currentFaqs.length + currentHeadings.length + currentTitles.length;
    if (!primaryKeyword || totalSelected === 0) {
      const resp: CheckReuseResponse = { reused: false, overlapPercent: 0, matched: { faqs: [], headings: [], titles: [] } };
      return new Response(JSON.stringify(resp), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    // Fetch recent reuse history for this user and keyword
    const { data: history, error } = await supabase
      .from('content_reuse_history')
      .select('used_faqs, used_headings, used_titles, content_id, created_at, primary_keyword')
      .eq('user_id', auth.user.id)
      .eq('primary_keyword', primaryKeyword)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[check-reuse] Supabase query error:', error);
      return new Response(JSON.stringify({ error: 'Failed to read history' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const matchedFaqsSet = new Set<string>();
    const matchedHeadingsSet = new Set<string>();
    const matchedTitlesSet = new Set<string>();

    for (const row of history || []) {
      const prevFaqs = (row.used_faqs || []) as string[];
      const prevHeadings = (row.used_headings || []) as string[];
      const prevTitles = (row.used_titles || []) as string[];

      // Match on normalized strings (case-insensitive, trimmed)
      const norm = (s: string) => s.toLowerCase().trim();

      const currentFaqsNorm = new Set(currentFaqs.map(norm));
      const currentHeadingsNorm = new Set(currentHeadings.map(norm));
      const currentTitlesNorm = new Set(currentTitles.map(norm));

      for (const f of prevFaqs) {
        if (currentFaqsNorm.has(norm(f))) matchedFaqsSet.add(f);
      }
      for (const h of prevHeadings) {
        if (currentHeadingsNorm.has(norm(h))) matchedHeadingsSet.add(h);
      }
      for (const t of prevTitles) {
        if (currentTitlesNorm.has(norm(t))) matchedTitlesSet.add(t);
      }
    }

    const matchedCount = matchedFaqsSet.size + matchedHeadingsSet.size + matchedTitlesSet.size;
    const overlapPercent = totalSelected > 0 ? matchedCount / totalSelected : 0;

    const resp: CheckReuseResponse = {
      reused: overlapPercent >= 0.8,
      overlapPercent,
      matched: {
        faqs: Array.from(matchedFaqsSet),
        headings: Array.from(matchedHeadingsSet),
        titles: Array.from(matchedTitlesSet),
      },
    };

    return new Response(JSON.stringify(resp), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e) {
    console.error('[check-reuse] Unexpected error:', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
