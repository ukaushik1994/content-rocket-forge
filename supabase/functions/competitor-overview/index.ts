import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OverviewRequest {
  userId: string;
  competitorId: string;
  competitorName: string;
  competitorData: {
    description?: string;
    website?: string;
    intelligenceData?: any;
    strengths: string[];
    weaknesses: string[];
    solutions?: any[];
    swotAnalysis?: any;
  };
  userCompanyInfo?: {
    name?: string;
    industry?: string;
  };
}

interface CompetitorOverview {
  executiveSummary: string;
  keyMetrics: {
    marketPositionScore: number;
    innovationScore: number;
    threatLevel: number;
    pricingCompetitiveness: number;
  };
  competitivePositioning: string;
  topInsights: Array<{
    category: 'strength' | 'weakness' | 'opportunity' | 'threat' | 'insight';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recommendedActions: string[];
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
      userCompanyInfo
    }: OverviewRequest = await req.json();

    if (!userId || !competitorId || !competitorName) {
      throw new Error("Missing required fields");
    }

    console.log(`[competitor-overview] Generating overview for: ${competitorName}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build comprehensive data summary
    let dataContext = `=== COMPETITOR: ${competitorName} ===\n`;
    
    if (competitorData.website) {
      dataContext += `Website: ${competitorData.website}\n`;
    }
    
    if (competitorData.description) {
      dataContext += `\nDescription: ${competitorData.description}\n`;
    }

    // Intelligence data
    if (competitorData.intelligenceData) {
      const intel = competitorData.intelligenceData;
      dataContext += '\n=== INTELLIGENCE ===\n';
      
      if (intel.company_size) dataContext += `Company Size: ${intel.company_size}\n`;
      if (intel.founded_year) dataContext += `Founded: ${intel.founded_year}\n`;
      if (intel.headquarters) dataContext += `HQ: ${intel.headquarters}\n`;
      if (intel.funding_stage) dataContext += `Funding: ${intel.funding_stage}\n`;
      if (intel.employee_count) dataContext += `Employees: ${intel.employee_count}\n`;
      if (intel.customer_count) dataContext += `Customers: ${intel.customer_count}\n`;
      
      if (intel.pricing_model) dataContext += `\nPricing Model: ${intel.pricing_model}\n`;
      if (intel.has_free_trial) dataContext += `Has Free Trial: Yes\n`;
      if (intel.has_free_plan) dataContext += `Has Free Plan: Yes\n`;
      
      if (intel.target_industries?.length) {
        dataContext += `\nTarget Industries: ${intel.target_industries.join(', ')}\n`;
      }
      if (intel.target_company_size?.length) {
        dataContext += `Target Company Size: ${intel.target_company_size.join(', ')}\n`;
      }
      
      if (intel.key_features?.length) {
        dataContext += `\nKey Features:\n`;
        intel.key_features.slice(0, 8).forEach((f: string) => {
          dataContext += `- ${f}\n`;
        });
      }
      
      if (intel.unique_value_propositions?.length) {
        dataContext += `\nValue Propositions:\n`;
        intel.unique_value_propositions.forEach((uvp: string) => {
          dataContext += `- ${uvp}\n`;
        });
      }
      
      if (intel.notable_customers?.length) {
        dataContext += `\nNotable Customers: ${intel.notable_customers.slice(0, 5).join(', ')}\n`;
      }
    }

    // SWOT Summary
    if (competitorData.swotAnalysis) {
      const swot = competitorData.swotAnalysis;
      dataContext += '\n=== SWOT SUMMARY ===\n';
      dataContext += `Strengths: ${swot.strengths?.length || 0}\n`;
      dataContext += `Weaknesses: ${swot.weaknesses?.length || 0}\n`;
      dataContext += `Opportunities: ${swot.opportunities?.length || 0}\n`;
      dataContext += `Threats: ${swot.threats?.length || 0}\n`;
      if (swot.competitiveScore) {
        dataContext += `Competitive Score: ${swot.competitiveScore}/100\n`;
      }
      if (swot.positioning) {
        dataContext += `Positioning: ${swot.positioning}\n`;
      }
    } else {
      // Manual strengths/weaknesses
      if (competitorData.strengths.length > 0) {
        dataContext += '\n=== STRENGTHS ===\n';
        competitorData.strengths.forEach(s => dataContext += `- ${s}\n`);
      }
      if (competitorData.weaknesses.length > 0) {
        dataContext += '\n=== WEAKNESSES ===\n';
        competitorData.weaknesses.forEach(w => dataContext += `- ${w}\n`);
      }
    }

    // Solutions
    if (competitorData.solutions && competitorData.solutions.length > 0) {
      dataContext += `\n=== SOLUTIONS (${competitorData.solutions.length}) ===\n`;
      competitorData.solutions.slice(0, 5).forEach((sol: any) => {
        dataContext += `- ${sol.name}`;
        if (sol.category) dataContext += ` (${sol.category})`;
        if (sol.shortDescription) dataContext += `: ${sol.shortDescription}`;
        dataContext += '\n';
      });
    }

    // User context
    let userContext = '';
    if (userCompanyInfo) {
      userContext = `\n=== YOUR COMPANY ===\n`;
      userContext += `Name: ${userCompanyInfo.name || 'Unknown'}\n`;
      userContext += `Industry: ${userCompanyInfo.industry || 'Unknown'}\n`;
    }

    const prompt = `You are a strategic competitive intelligence analyst. Generate a comprehensive executive overview of this competitor.

${userContext}
${dataContext}

TASK: Create an actionable competitive overview that helps the user understand this competitor at a glance.

Generate a JSON with:

1. **executiveSummary** (3-4 paragraphs):
   - Paragraph 1: Who they are, what they do, market position
   - Paragraph 2: Core strengths and competitive advantages
   - Paragraph 3: Key weaknesses and vulnerabilities
   - Paragraph 4: Strategic implications for user

2. **keyMetrics** (0-100 scores):
   - marketPositionScore: Market leadership and dominance
   - innovationScore: Product innovation and differentiation
   - threatLevel: How much of a threat to user (higher = more threatening)
   - pricingCompetitiveness: Pricing strategy effectiveness

3. **competitivePositioning** (2-3 sentences):
   Clear statement of where they stand in the market and why

4. **topInsights** (5-7 insights):
   Most important things to know about this competitor
   Mix of strengths, weaknesses, opportunities, threats, and general insights
   Each with category, title, description, and priority

5. **recommendedActions** (5-7 actions):
   Specific, actionable steps user should take
   Prioritized by impact and urgency

6. **marketContext** (1-2 paragraphs):
   Industry landscape and where this competitor fits

Return ONLY valid JSON in this format:

{
  "executiveSummary": "Multi-paragraph executive summary...",
  "keyMetrics": {
    "marketPositionScore": 85,
    "innovationScore": 72,
    "threatLevel": 78,
    "pricingCompetitiveness": 65
  },
  "competitivePositioning": "Clear positioning statement...",
  "topInsights": [
    {
      "category": "strength",
      "title": "Enterprise Dominance",
      "description": "Controls 40% of enterprise market with strong brand recognition and comprehensive feature set",
      "priority": "high"
    },
    {
      "category": "weakness",
      "title": "Weak SMB Offering",
      "description": "High pricing and complex setup deter small businesses - opportunity for simpler alternative",
      "priority": "high"
    },
    {
      "category": "opportunity",
      "title": "Mobile Gap",
      "description": "No mobile app despite mobile-first market trend - first-mover advantage available",
      "priority": "medium"
    }
  ],
  "recommendedActions": [
    "Target mid-market segment they underserve with flexible pricing",
    "Emphasize ease-of-use in marketing vs their complexity"
  ],
  "marketContext": "Industry context and landscape..."
}

CRITICAL RULES:
1. Be SPECIFIC with data and evidence
2. Focus on ACTIONABLE insights
3. Prioritize HIGH-IMPACT information
4. Write for EXECUTIVE audience (clear, concise, strategic)
5. Ground all claims in provided data
6. Be honest about their strengths AND weaknesses
7. Provide strategic context, not just facts
8. Make recommendations CONCRETE and PRIORITIZED
9. Return only valid JSON, no markdown`;

    console.log('[competitor-overview] Calling AI for overview generation');

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
            content: "You are an expert competitive intelligence analyst. Return only valid JSON with comprehensive executive insights." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`AI generation failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    
    console.log('[competitor-overview] AI response received, parsing...');
    
    // Extract JSON
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
    
    const overview: CompetitorOverview = JSON.parse(jsonStr);

    const processingTime = Date.now() - startTime;
    console.log(`[competitor-overview] ✅ Overview generated in ${processingTime}ms`);

    // Save overview to database
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/company_competitors?id=eq.${competitorId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          overview: overview,
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      });

      if (updateResponse.ok) {
        console.log('[competitor-overview] ✅ Saved to database');
      } else {
        console.error('[competitor-overview] ⚠️ Failed to save to database:', await updateResponse.text());
      }
    } catch (dbError) {
      console.error('[competitor-overview] ⚠️ Database save error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        overview,
        diagnostics: {
          processing_time_ms: processingTime,
          ai_calls: 1,
          insights_count: overview.topInsights.length,
          actions_count: overview.recommendedActions.length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[competitor-overview] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to generate overview"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
