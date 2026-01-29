import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PerformanceData {
  ga4?: {
    bounceRate?: number;
    avgSessionDuration?: number;
    engagementRate?: number;
    pageViews?: number;
  };
  gsc?: {
    avgPosition?: number;
    ctr?: number;
    impressions?: number;
    clicks?: number;
  };
  psi?: {
    performance?: number;
    lcp?: number;
    cls?: number;
    opportunities?: any[];
  };
  heatmap?: {
    scrollDepth?: number;
    rageClicks?: any[];
    deadClicks?: any[];
    insights?: any[];
  };
}

interface OptimizationChange {
  type: string;
  section: string;
  original: string;
  improved: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface OptimizationResult {
  optimizedContent: string;
  changes: OptimizationChange[];
  predictedImpact: {
    bounceRate: string;
    ctr: string;
    engagement: string;
    performance: string;
  };
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      contentId, 
      currentContent, 
      performanceData,
      contentType = 'blog',
      targetKeywords = []
    } = await req.json();
    
    if (!currentContent) {
      return new Response(
        JSON.stringify({ error: 'Current content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build analysis prompt based on performance data
    const analysisPrompt = buildAnalysisPrompt(performanceData, contentType, targetKeywords);
    
    // Call AI to analyze and optimize content
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert content optimizer specializing in SEO, user experience, and conversion optimization. 
Your task is to analyze content performance data and suggest specific, actionable improvements.

Always respond with valid JSON in this exact format:
{
  "optimizedContent": "the full optimized content here",
  "changes": [
    {
      "type": "headline|cta|structure|readability|seo|performance",
      "section": "specific section name",
      "original": "original text",
      "improved": "improved text",
      "reason": "data-driven reason for change",
      "priority": "high|medium|low"
    }
  ],
  "predictedImpact": {
    "bounceRate": "-X%" or "+X%",
    "ctr": "-X%" or "+X%",
    "engagement": "-X%" or "+X%",
    "performance": "description of expected change"
  },
  "summary": "brief summary of key optimizations"
}`
          },
          {
            role: "user",
            content: `${analysisPrompt}

CURRENT CONTENT:
${currentContent}

Analyze the performance data and optimize the content. Focus on:
1. Improving areas where performance data shows issues
2. Maintaining brand voice and key messages
3. Making changes that will have measurable impact

Return the optimized content with a detailed list of changes.`
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let result: OptimizationResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      result = JSON.parse(jsonMatch[1] || content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse optimization results');
    }

    // Save optimization result to database
    if (contentId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('content_optimization_history')
        .insert({
          content_id: contentId,
          original_content: currentContent,
          optimized_content: result.optimizedContent,
          changes: result.changes,
          performance_data: performanceData,
          predicted_impact: result.predictedImpact,
          status: 'pending_review'
        });
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in content-optimizer function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildAnalysisPrompt(performanceData: PerformanceData, contentType: string, targetKeywords: string[]): string {
  const sections: string[] = [];

  sections.push(`CONTENT TYPE: ${contentType}`);
  
  if (targetKeywords.length > 0) {
    sections.push(`TARGET KEYWORDS: ${targetKeywords.join(', ')}`);
  }

  sections.push('\nPERFORMANCE DATA ANALYSIS:');

  // GA4 Analysis
  if (performanceData.ga4) {
    const ga4 = performanceData.ga4;
    sections.push('\n📊 Google Analytics (GA4):');
    
    if (ga4.bounceRate !== undefined) {
      const bounceAssessment = ga4.bounceRate > 0.6 ? '⚠️ HIGH' : ga4.bounceRate > 0.4 ? '⚡ MODERATE' : '✅ GOOD';
      sections.push(`- Bounce Rate: ${(ga4.bounceRate * 100).toFixed(1)}% ${bounceAssessment}`);
      if (ga4.bounceRate > 0.6) {
        sections.push('  → Users are leaving quickly. Consider: stronger headline, clearer value prop, faster load');
      }
    }
    
    if (ga4.avgSessionDuration !== undefined) {
      const durationAssessment = ga4.avgSessionDuration < 60 ? '⚠️ LOW' : ga4.avgSessionDuration < 120 ? '⚡ MODERATE' : '✅ GOOD';
      sections.push(`- Avg Session Duration: ${Math.round(ga4.avgSessionDuration)}s ${durationAssessment}`);
      if (ga4.avgSessionDuration < 60) {
        sections.push('  → Users aren\'t engaging. Consider: more compelling content, better structure, visual elements');
      }
    }

    if (ga4.engagementRate !== undefined) {
      sections.push(`- Engagement Rate: ${(ga4.engagementRate * 100).toFixed(1)}%`);
    }
  }

  // GSC Analysis
  if (performanceData.gsc) {
    const gsc = performanceData.gsc;
    sections.push('\n🔍 Search Console:');
    
    if (gsc.avgPosition !== undefined) {
      const posAssessment = gsc.avgPosition > 20 ? '⚠️ LOW' : gsc.avgPosition > 10 ? '⚡ PAGE 2' : '✅ PAGE 1';
      sections.push(`- Average Position: ${gsc.avgPosition.toFixed(1)} ${posAssessment}`);
      if (gsc.avgPosition > 10) {
        sections.push('  → Not ranking well. Consider: better keyword targeting, more comprehensive content, stronger backlink profile');
      }
    }
    
    if (gsc.ctr !== undefined) {
      const ctrAssessment = gsc.ctr < 0.02 ? '⚠️ LOW' : gsc.ctr < 0.05 ? '⚡ MODERATE' : '✅ GOOD';
      sections.push(`- CTR: ${(gsc.ctr * 100).toFixed(2)}% ${ctrAssessment}`);
      if (gsc.ctr < 0.03) {
        sections.push('  → Low click-through. Consider: more compelling meta title/description, rich snippets, clearer value prop');
      }
    }

    if (gsc.impressions !== undefined) {
      sections.push(`- Impressions: ${gsc.impressions.toLocaleString()}`);
    }
  }

  // PageSpeed Analysis
  if (performanceData.psi) {
    const psi = performanceData.psi;
    sections.push('\n⚡ PageSpeed Insights:');
    
    if (psi.performance !== undefined) {
      const perfAssessment = psi.performance < 50 ? '⚠️ POOR' : psi.performance < 90 ? '⚡ NEEDS WORK' : '✅ GOOD';
      sections.push(`- Performance Score: ${psi.performance}/100 ${perfAssessment}`);
    }
    
    if (psi.lcp !== undefined) {
      const lcpAssessment = psi.lcp > 4000 ? '⚠️ POOR' : psi.lcp > 2500 ? '⚡ NEEDS WORK' : '✅ GOOD';
      sections.push(`- LCP (Largest Contentful Paint): ${psi.lcp}ms ${lcpAssessment}`);
    }

    if (psi.opportunities && psi.opportunities.length > 0) {
      sections.push('- Top Opportunities:');
      psi.opportunities.slice(0, 3).forEach((opp: any) => {
        sections.push(`  • ${opp.title}: ${opp.savings}${opp.savingsUnit || 'ms'} potential savings`);
      });
    }
  }

  // Heatmap Analysis
  if (performanceData.heatmap) {
    const heatmap = performanceData.heatmap;
    sections.push('\n🔥 Heatmap Analysis:');
    
    if (heatmap.scrollDepth !== undefined) {
      const scrollAssessment = heatmap.scrollDepth < 0.3 ? '⚠️ POOR' : heatmap.scrollDepth < 0.6 ? '⚡ MODERATE' : '✅ GOOD';
      sections.push(`- Scroll Depth: ${(heatmap.scrollDepth * 100).toFixed(0)}% ${scrollAssessment}`);
      if (heatmap.scrollDepth < 0.5) {
        sections.push('  → Most users don\'t scroll far. Move key content and CTAs higher.');
      }
    }

    if (heatmap.rageClicks && heatmap.rageClicks.length > 0) {
      sections.push(`- Rage Clicks Detected: ${heatmap.rageClicks.length} frustration points`);
      sections.push('  → Users are frustrated with unresponsive elements. Fix interactive issues.');
    }

    if (heatmap.deadClicks && heatmap.deadClicks.length > 0) {
      sections.push(`- Dead Clicks: ${heatmap.deadClicks.length} elements users try to click`);
      sections.push('  → Users expect these elements to be clickable. Consider making them interactive.');
    }

    if (heatmap.insights && heatmap.insights.length > 0) {
      sections.push('- Key Insights:');
      heatmap.insights.slice(0, 3).forEach((insight: any) => {
        sections.push(`  • ${insight.message}`);
      });
    }
  }

  return sections.join('\n');
}
