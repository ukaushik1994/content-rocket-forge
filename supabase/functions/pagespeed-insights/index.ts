import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface CoreWebVitals {
  LCP: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  FID: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  CLS: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  TTFB: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  FCP: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
  INP: { value: number; score: 'good' | 'needs-improvement' | 'poor' };
}

interface Opportunity {
  id: string;
  title: string;
  description: string;
  savings: number;
  savingsUnit: string;
}

interface PageSpeedResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  coreWebVitals: CoreWebVitals;
  opportunities: Opportunity[];
  diagnostics: any[];
  fetchedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, contentId, userId, strategy = 'mobile' } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API key from environment or user settings
    let apiKey = Deno.env.get('GOOGLE_PAGESPEED_API_KEY');
    
    if (!apiKey && userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', userId)
        .eq('service', 'google-pagespeed')
        .eq('is_active', true)
        .single();
      
      if (apiKeyData?.encrypted_key) {
        apiKey = apiKeyData.encrypted_key;
      }
    }

    // PageSpeed Insights API works without API key (with rate limits)
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('strategy', strategy);
    apiUrl.searchParams.set('category', 'PERFORMANCE');
    apiUrl.searchParams.append('category', 'ACCESSIBILITY');
    apiUrl.searchParams.append('category', 'BEST_PRACTICES');
    apiUrl.searchParams.append('category', 'SEO');
    
    if (apiKey) {
      apiUrl.searchParams.set('key', apiKey);
    }

    console.log(`Fetching PageSpeed Insights for: ${url}`);
    
    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    if (!response.ok) {
      console.error('PageSpeed API error:', data);
      throw new Error(data.error?.message || 'Failed to fetch PageSpeed data');
    }

    // Extract Lighthouse scores
    const categories = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};

    // Extract Core Web Vitals from field data (real user data) or lab data
    const fieldMetrics = data.loadingExperience?.metrics || {};
    const labMetrics = audits;

    const coreWebVitals: CoreWebVitals = {
      LCP: extractMetric(fieldMetrics, 'LARGEST_CONTENTFUL_PAINT_MS', labMetrics['largest-contentful-paint'], 2500, 4000),
      FID: extractMetric(fieldMetrics, 'FIRST_INPUT_DELAY_MS', labMetrics['max-potential-fid'], 100, 300),
      CLS: extractMetric(fieldMetrics, 'CUMULATIVE_LAYOUT_SHIFT_SCORE', labMetrics['cumulative-layout-shift'], 0.1, 0.25),
      TTFB: extractMetric(fieldMetrics, 'EXPERIMENTAL_TIME_TO_FIRST_BYTE', labMetrics['server-response-time'], 800, 1800),
      FCP: extractMetric(fieldMetrics, 'FIRST_CONTENTFUL_PAINT_MS', labMetrics['first-contentful-paint'], 1800, 3000),
      INP: extractMetric(fieldMetrics, 'INTERACTION_TO_NEXT_PAINT', labMetrics['interaction-to-next-paint'], 200, 500)
    };

    // Extract performance opportunities
    const opportunities: Opportunity[] = [];
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'uses-optimized-images',
      'uses-text-compression',
      'uses-responsive-images',
      'uses-rel-preconnect',
      'server-response-time',
      'redirects',
      'uses-rel-preload',
      'uses-http2',
      'uses-long-cache-ttl'
    ];

    opportunityAudits.forEach(auditId => {
      const audit = audits[auditId];
      if (audit && audit.score !== null && audit.score < 1) {
        const savings = audit.details?.overallSavingsMs || 
                       audit.details?.overallSavingsBytes || 
                       0;
        
        opportunities.push({
          id: auditId,
          title: audit.title || auditId,
          description: audit.description || '',
          savings: Math.round(savings),
          savingsUnit: audit.details?.overallSavingsMs ? 'ms' : 'bytes'
        });
      }
    });

    // Sort opportunities by savings
    opportunities.sort((a, b) => b.savings - a.savings);

    // Extract diagnostics (informational items)
    const diagnostics = [
      'dom-size',
      'font-display',
      'critical-request-chains',
      'largest-contentful-paint-element',
      'layout-shift-elements',
      'long-tasks'
    ].map(id => {
      const audit = audits[id];
      if (audit) {
        return {
          id,
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue
        };
      }
      return null;
    }).filter(Boolean);

    const result: PageSpeedResult = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
      coreWebVitals,
      opportunities: opportunities.slice(0, 10), // Top 10 opportunities
      diagnostics,
      fetchedAt: new Date().toISOString()
    };

    // Save to database if contentId provided
    if (contentId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error: insertError } = await supabase
        .from('page_performance_metrics')
        .insert({
          content_id: contentId,
          published_url: url,
          performance_score: result.performance,
          accessibility_score: result.accessibility,
          best_practices_score: result.bestPractices,
          seo_score: result.seo,
          core_web_vitals: result.coreWebVitals,
          opportunities: result.opportunities,
          diagnostics: result.diagnostics,
          strategy,
          measured_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error saving performance metrics:', insertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in pagespeed-insights function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractMetric(
  fieldMetrics: any, 
  fieldKey: string, 
  labAudit: any,
  goodThreshold: number,
  poorThreshold: number
): { value: number; score: 'good' | 'needs-improvement' | 'poor' } {
  // Prefer field data (real user data) over lab data
  const fieldMetric = fieldMetrics[fieldKey];
  let value = 0;
  
  if (fieldMetric?.percentile) {
    value = fieldMetric.percentile;
  } else if (labAudit?.numericValue !== undefined) {
    value = labAudit.numericValue;
  }

  // Determine score category
  let score: 'good' | 'needs-improvement' | 'poor';
  if (value <= goodThreshold) {
    score = 'good';
  } else if (value <= poorThreshold) {
    score = 'needs-improvement';
  } else {
    score = 'poor';
  }

  return { value: Math.round(value * 100) / 100, score };
}
