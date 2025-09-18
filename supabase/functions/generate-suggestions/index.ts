import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkTitle, content, keyword, context } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert content optimization assistant. Generate 3 specific, actionable suggestions for improving content based on the failed check. Each suggestion should be:
            1. Specific and actionable
            2. Contextual to the provided content
            3. Focused on the specific issue mentioned in the check title
            
            Return a JSON array with objects containing: id, text, priority (high/medium/low), actionable (boolean).`
          },
          {
            role: 'user',
            content: `
            Failed Check: "${checkTitle}"
            Content: "${content.substring(0, 1500)}..."
            Primary Keyword: "${keyword}"
            Meta Title: "${context?.metaTitle || 'Not set'}"
            Meta Description: "${context?.metaDescription || 'Not set'}"
            
            Generate 3 specific suggestions to fix this issue.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let suggestions;
    try {
      suggestions = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      suggestions = [
        { id: '1', text: data.choices[0].message.content.split('\n')[0] || 'Review and optimize this content area', priority: 'high', actionable: true },
        { id: '2', text: 'Consider industry best practices for this optimization', priority: 'medium', actionable: true },
        { id: '3', text: 'Test and measure the impact of your changes', priority: 'low', actionable: true }
      ];
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-suggestions function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [
        { id: '1', text: 'Review the requirements for this content check', priority: 'high', actionable: true },
        { id: '2', text: 'Consult optimization guidelines for this area', priority: 'medium', actionable: true },
        { id: '3', text: 'Consider testing different approaches', priority: 'low', actionable: true }
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});