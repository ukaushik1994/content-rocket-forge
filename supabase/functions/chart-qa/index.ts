import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, charts, context, previousInsights, conversationHistory } = await req.json();
    
    console.log('📊 Chart Q&A Request:', {
      question,
      chartCount: charts?.length || 0,
      hasContext: !!context,
      hasInsights: !!previousInsights,
      historyLength: conversationHistory?.length || 0
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build enriched context for AI
    const chartSummary = charts?.map((c: any, idx: number) => {
      const dataCount = c.data?.length || 0;
      const sample = c.data?.slice(0, 3) || [];
      return `
Chart ${idx + 1}: "${c.title}" (${c.type} chart)
- Data points: ${dataCount}
- Sample data: ${JSON.stringify(sample)}`;
    }).join('\n') || 'No chart data available';

    const insightsSummary = previousInsights ? `
Previous AI Analysis:
- Predictions: ${previousInsights.predictions?.join('; ') || 'None'}
- Anomalies: ${previousInsights.anomalies?.map((a: any) => a.label).join('; ') || 'None'}
- Top recommendations: ${previousInsights.recommendations?.slice(0, 3).map((r: any) => r.title).join('; ') || 'None'}` : '';

    const systemPrompt = `You are a data analysis expert helping users understand their chart data through conversational Q&A.

CURRENT DATA CONTEXT:
${chartSummary}

${insightsSummary}

YOUR ROLE:
- Answer questions SPECIFICALLY about the data shown in the charts
- Reference chart names, data points, and specific values when relevant
- Explain trends, patterns, anomalies, and relationships
- Provide actionable insights and next steps
- Be conversational, helpful, and concise (2-4 sentences per response)
- If you don't have enough data to answer accurately, say so clearly

GUIDELINES:
- Always ground answers in the actual data provided
- Use specific numbers and percentages when available
- Compare across charts when relevant
- Suggest practical next steps when appropriate
- If the question is unclear, ask for clarification`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-8), // Last 8 messages for context
      { role: 'user', content: question }
    ];

    console.log('🤖 Calling Lovable AI with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.';

    console.log('✅ AI response generated successfully');

    return new Response(
      JSON.stringify({ answer }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ Error in chart-qa:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to answer question',
        answer: "I'm having trouble analyzing the data right now. Please try again in a moment."
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
