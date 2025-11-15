import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../shared/cors.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, campaignIdea, targetAudience, goal, timeline, useSerpData, companyInfo } = await req.json();

    if (!userId || !campaignIdea) {
      return new Response(
        JSON.stringify({ error: "userId and campaignIdea are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🎯 Generating campaign strategies for user:', userId);

    // Fetch SERP data if requested
    let serpEnrichment = ''
    if (useSerpData) {
      try {
        console.log('🔍 Fetching SERP data for campaign enrichment...');
        const serpResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/serp-analysis`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            keyword: campaignIdea.substring(0, 100),
            location: 'United States',
            language: 'en'
          }),
        });

        if (serpResponse.ok) {
          const serpData = await serpResponse.json();
          console.log('✅ SERP data fetched successfully');
          
          // Extract valuable SERP insights
          const keywords = serpData.topResults?.map((r: any) => r.title).slice(0, 5) || [];
          const relatedSearches = serpData.relatedSearches?.map((r: any) => r.query).slice(0, 5) || [];
          const paaQuestions = serpData.peopleAlsoAsk?.map((q: any) => q.question).slice(0, 5) || [];
          
          serpEnrichment = `

## Real-time SERP Intelligence
**Trending Topics from Search Results**: ${keywords.length > 0 ? keywords.join(', ') : 'No data'}
**Related Searches**: ${relatedSearches.length > 0 ? relatedSearches.join(', ') : 'No data'}
**People Also Ask Questions**: ${paaQuestions.length > 0 ? paaQuestions.join('; ') : 'No data'}
**Estimated Search Volume**: ${serpData.searchVolume || 'N/A'}
**Competition Level**: ${serpData.competitionScore ? (serpData.competitionScore * 100).toFixed(0) + '%' : 'N/A'}

💡 Use these insights to align your campaign strategies with what audiences are actively searching for and discussing online.`;
        } else {
          console.warn('⚠️ SERP API returned non-OK status:', serpResponse.status);
        }
      } catch (serpError) {
        console.error('❌ SERP enrichment failed:', serpError);
        // Continue without SERP data - don't fail the entire request
      }
    }

    // Build context for AI
    let contextPrompt = `Campaign Idea: ${campaignIdea}\n`;
    if (targetAudience) contextPrompt += `Target Audience: ${targetAudience}\n`;
    if (goal) contextPrompt += `Campaign Goal: ${goal}\n`;
    if (timeline) contextPrompt += `Timeline: ${timeline}\n`;
    if (companyInfo) {
      if (companyInfo.name) contextPrompt += `Company: ${companyInfo.name}\n`;
      if (companyInfo.description) contextPrompt += `Description: ${companyInfo.description}\n`;
      if (companyInfo.industry) contextPrompt += `Industry: ${companyInfo.industry}\n`;
    }
    if (serpEnrichment) {
      contextPrompt += serpEnrichment;
    }

    const systemPrompt = `You are an expert digital marketing strategist. Generate 4 diverse campaign strategies based on the user's idea.

Available Content Formats:
- blog (Blog Posts - long-form SEO)
- social-twitter (Twitter/X Posts - short viral)
- social-linkedin (LinkedIn Posts - professional)
- social-facebook (Facebook Posts - community engagement)
- social-instagram (Instagram Captions - visual storytelling)
- landing-page (Landing Pages - conversion-focused)
- script (Video Scripts - multimedia)
- email (Email Newsletters - direct communication)
- meme (Memes - humorous engagement)
- carousel (Carousel Posts - educational slides)

Requirements:
1. Each strategy MUST be DIFFERENT in approach (e.g., SEO-focused vs Social-first vs Video-heavy vs Email-driven)
2. Use 5-12 total content pieces per strategy
3. Mix 3-5 different formats per strategy
4. Include realistic posting frequencies
5. Make strategies creative and actionable
6. Consider the campaign goal and timeline provided
${useSerpData ? '7. **CRITICAL**: Leverage the Real-time SERP Intelligence provided - use trending topics as content themes, incorporate "People Also Ask" questions into content ideas, and align with search volume and competition data' : ''}

Return JSON with exactly 4 strategies in this structure:
{
  "strategies": [
    {
      "id": "strategy-1",
      "title": "Content Authority Builder",
      "description": "Establish thought leadership through comprehensive content",
      "contentMix": [
        {"formatId": "blog", "count": 6, "scheduleSuggestion": "2 per week"},
        {"formatId": "social-linkedin", "count": 12, "scheduleSuggestion": "3 per week"},
        {"formatId": "landing-page", "count": 2, "scheduleSuggestion": "Launch + Mid-campaign"},
        {"formatId": "email", "count": 4, "scheduleSuggestion": "Weekly"}
      ],
      "estimatedReach": "15K-30K impressions",
      "timeline": "4 weeks",
      "targetAudience": "B2B decision makers"
    }
  ]
}`;

    // Call Lovable AI Gateway with tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_campaign_strategies",
            description: "Generate 4 diverse campaign strategies",
            parameters: {
              type: "object",
              properties: {
                strategies: {
                  type: "array",
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      title: { type: "string" },
                      description: { type: "string" },
                      contentMix: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            formatId: { type: "string" },
                            count: { type: "number", minimum: 1 },
                            scheduleSuggestion: { type: "string" }
                          },
                          required: ["formatId", "count"]
                        }
                      },
                      estimatedReach: { type: "string" },
                      timeline: { type: "string" },
                      targetAudience: { type: "string" }
                    },
                    required: ["id", "title", "description", "contentMix"]
                  }
                }
              },
              required: ["strategies"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_campaign_strategies" } },
        temperature: 0.8, // Higher for creative strategy generation
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires payment. Please check your Lovable workspace credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('✅ AI response received');

    // Extract strategies from tool call response
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_campaign_strategies') {
      throw new Error('Invalid AI response format');
    }

    const strategiesData = JSON.parse(toolCall.function.arguments);
    
    if (!strategiesData.strategies || !Array.isArray(strategiesData.strategies)) {
      throw new Error('Invalid strategies data');
    }

    console.log(`✨ Generated ${strategiesData.strategies.length} strategies`);

    return new Response(
      JSON.stringify({
        success: true,
        strategies: strategiesData.strategies,
        usage: aiResponse.usage,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error('❌ Error generating strategies:', error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate strategies" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
