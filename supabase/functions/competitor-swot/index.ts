import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SWOTRequest {
  userId: string;
  competitorId: string;
  competitorName: string;
  competitorData: {
    description?: string;
    intelligenceData?: any;
    strengths: string[];
    weaknesses: string[];
    solutions?: any[];
  };
  userCompanyInfo?: {
    name?: string;
    industry?: string;
    mission?: string;
    description?: string;
  };
  userSolutions?: any[];
}

interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  competitiveScore: number;
  positioning: 'Leader' | 'Challenger' | 'Niche Player' | 'Emerging' | 'Disruptor';
  positioningRationale: string;
  recommendations: string[];
  marketContext: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const { 
      userId, 
      competitorId, 
      competitorName,
      competitorData,
      userCompanyInfo,
      userSolutions
    }: SWOTRequest = await req.json();

    if (!userId || !competitorId || !competitorName) {
      throw new Error("Missing required fields: userId, competitorId, competitorName");
    }

    console.log(`[competitor-swot] Analyzing SWOT for: ${competitorName}`);
    console.log(`[competitor-swot] User context:`, {
      hasCompanyInfo: !!userCompanyInfo,
      solutionsCount: userSolutions?.length || 0
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build comprehensive context for AI analysis
    let contextSection = '';
    if (userCompanyInfo || (userSolutions && userSolutions.length > 0)) {
      contextSection = '\n\n=== YOUR COMPANY CONTEXT ===\n';
      
      if (userCompanyInfo) {
        contextSection += `Company: ${userCompanyInfo.name || 'Unknown'}\n`;
        contextSection += `Industry: ${userCompanyInfo.industry || 'Unknown'}\n`;
        if (userCompanyInfo.mission) {
          contextSection += `Mission: ${userCompanyInfo.mission}\n`;
        }
        if (userCompanyInfo.description) {
          contextSection += `Description: ${userCompanyInfo.description}\n`;
        }
      }
      
      if (userSolutions && userSolutions.length > 0) {
        contextSection += '\nYOUR SOLUTIONS:\n';
        userSolutions.slice(0, 5).forEach((sol, i) => {
          contextSection += `${i + 1}. ${sol.name}\n`;
          if (sol.features?.length) {
            contextSection += `   Features: ${sol.features.slice(0, 5).map((f: any) => 
              typeof f === 'string' ? f : f.name || f.title
            ).join(', ')}\n`;
          }
          if (sol.target_audience?.length) {
            contextSection += `   Target: ${sol.target_audience.slice(0, 3).join(', ')}\n`;
          }
        });
      }
    }

    // Build competitor context
    let competitorContext = `\n\n=== COMPETITOR: ${competitorName} ===\n`;
    
    if (competitorData.description) {
      competitorContext += `Description: ${competitorData.description}\n`;
    }
    
    if (competitorData.strengths.length > 0) {
      competitorContext += `\nKnown Strengths:\n`;
      competitorData.strengths.forEach(s => competitorContext += `- ${s}\n`);
    }
    
    if (competitorData.weaknesses.length > 0) {
      competitorContext += `\nKnown Weaknesses:\n`;
      competitorData.weaknesses.forEach(w => competitorContext += `- ${w}\n`);
    }
    
    if (competitorData.intelligenceData) {
      const intel = competitorData.intelligenceData;
      competitorContext += '\nIntelligence Data:\n';
      
      if (intel.company_size) competitorContext += `- Company Size: ${intel.company_size}\n`;
      if (intel.funding_stage) competitorContext += `- Funding: ${intel.funding_stage}\n`;
      if (intel.pricing_model) competitorContext += `- Pricing Model: ${intel.pricing_model}\n`;
      if (intel.target_industries?.length) competitorContext += `- Target Industries: ${intel.target_industries.join(', ')}\n`;
      if (intel.key_features?.length) competitorContext += `- Key Features: ${intel.key_features.slice(0, 5).join(', ')}\n`;
      if (intel.unique_value_propositions?.length) competitorContext += `- UVPs: ${intel.unique_value_propositions.join('; ')}\n`;
    }
    
    if (competitorData.solutions && competitorData.solutions.length > 0) {
      competitorContext += `\nTheir Solutions (${competitorData.solutions.length}):\n`;
      competitorData.solutions.slice(0, 5).forEach((sol: any, i: number) => {
        competitorContext += `${i + 1}. ${sol.name}`;
        if (sol.category) competitorContext += ` (${sol.category})`;
        if (sol.shortDescription) competitorContext += ` - ${sol.shortDescription}`;
        competitorContext += '\n';
      });
    }

    const prompt = `You are an expert competitive strategy analyst conducting a comprehensive SWOT analysis.

${contextSection}
${competitorContext}

TASK: Generate a comprehensive, actionable SWOT analysis that helps the user compete effectively against this competitor.

ANALYSIS FRAMEWORK:

1. **STRENGTHS** (Enhanced Analysis)
   - Validate and expand on known strengths
   - Identify additional strengths from intelligence data
   - Rate strength magnitude (critical, significant, moderate)
   - Provide evidence/reasoning for each

2. **WEAKNESSES** (Enhanced Analysis)
   - Validate and expand on known weaknesses
   - Identify additional weaknesses and gaps
   - Rate exploitability (high, medium, low)
   - Provide tactical recommendations

3. **OPPORTUNITIES** (Strategic Advantages for User)
   - Where competitor is weak and user can win
   - Market gaps competitor isn't addressing
   - Areas where user's solutions are superior
   - Underserved customer segments
   - Partnership/collaboration opportunities

4. **THREATS** (Competitive Risks to User)
   - Where competitor poses genuine threat
   - Their competitive advantages
   - Market positioning risks
   - Feature/capability gaps user needs to address
   - Potential future moves by competitor

5. **COMPETITIVE POSITIONING**
   - Assess their market position: Leader/Challenger/Niche/Emerging/Disruptor
   - Calculate competitive strength score (0-100)
   - Provide positioning rationale

6. **STRATEGIC RECOMMENDATIONS**
   - Top 5-7 actionable recommendations
   - Prioritize quick wins vs long-term strategies
   - Specific tactics for each recommendation

Return ONLY valid JSON in this exact format:

{
  "strengths": [
    "Specific strength with evidence and magnitude rating. Example: [CRITICAL] Enterprise-grade security (SOC 2, ISO 27001) attracts large customers"
  ],
  "weaknesses": [
    "Specific weakness with exploitability. Example: [HIGH EXPLOITABILITY] No mobile app - user opportunity to capture mobile-first customers"
  ],
  "opportunities": [
    "Strategic opportunity with action path. Example: Target mid-market customers they ignore due to high pricing - our freemium model wins here"
  ],
  "threats": [
    "Genuine threat with mitigation strategy. Example: Strong enterprise foothold and brand recognition - we need aggressive SMB positioning and faster innovation"
  ],
  "competitiveScore": 75,
  "positioning": "Leader|Challenger|Niche Player|Emerging|Disruptor",
  "positioningRationale": "Why they fit this category based on data",
  "recommendations": [
    "1. [QUICK WIN] Specific actionable recommendation with expected outcome",
    "2. [STRATEGIC] Long-term recommendation with reasoning"
  ],
  "marketContext": "Brief market context and competitive landscape overview"
}

CRITICAL RULES:
1. Be SPECIFIC and ACTIONABLE - no generic statements
2. Ground insights in actual data provided
3. Think from USER's perspective - how to compete and win
4. Rate opportunities by potential impact
5. Rate threats by severity and likelihood
6. Make recommendations CONCRETE with clear next steps
7. Each insight should be 1-2 sentences with evidence
8. Focus on what user can DO about it
9. Prioritize insights (use [CRITICAL], [HIGH], [MEDIUM] tags)
10. Return only valid JSON, no markdown`;

    console.log('[competitor-swot] Calling AI for SWOT analysis');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are an expert competitive strategy analyst. Return only valid JSON with comprehensive, actionable strategic insights." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log('[competitor-swot] AI response received, parsing...');
    
    // Extract JSON from response
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const directMatch = content.match(/\{[\s\S]*\}/);
      if (directMatch) {
        jsonStr = directMatch[0];
      }
    }
    
    const analysis: SWOTAnalysis = JSON.parse(jsonStr);

    const processingTime = Date.now() - startTime;
    console.log(`[competitor-swot] ✅ Analysis complete in ${processingTime}ms`);
    console.log(`[competitor-swot] Results: ${analysis.opportunities.length} opportunities, ${analysis.threats.length} threats`);

    // Save SWOT analysis to database using Supabase client
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[competitor-swot] ⚠️ Missing Supabase credentials - cannot save to database');
        console.error('[competitor-swot] SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
        console.error('[competitor-swot] SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
      } else {
        console.log('[competitor-swot] 💾 Saving SWOT analysis to database for competitor:', competitorId);
        
        const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        const { data, error } = await supabaseClient
          .from('company_competitors')
          .update({
            swot_analysis: analysis,
            strengths: analysis.strengths,
            weaknesses: analysis.weaknesses,
            last_analyzed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', competitorId)
          .select();

        if (error) {
          console.error('[competitor-swot] ❌ Database save error:', error);
          console.error('[competitor-swot] Error details:', JSON.stringify(error, null, 2));
        } else {
          console.log('[competitor-swot] ✅ Successfully saved to database');
          console.log('[competitor-swot] Updated rows:', data?.length || 0);
        }
      }
    } catch (dbError: any) {
      console.error('[competitor-swot] 💥 Database save exception:', dbError);
      console.error('[competitor-swot] Exception details:', dbError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        diagnostics: {
          processing_time_ms: processingTime,
          ai_calls: 1,
          strengths_count: analysis.strengths.length,
          weaknesses_count: analysis.weaknesses.length,
          opportunities_count: analysis.opportunities.length,
          threats_count: analysis.threats.length,
          recommendations_count: analysis.recommendations.length,
          competitive_score: analysis.competitiveScore,
          positioning: analysis.positioning
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[competitor-swot] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate SWOT analysis"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
