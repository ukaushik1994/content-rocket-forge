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
    const { action, terms, url, topic } = await req.json();

    if (action === 'generate_definitions') {
      const prompt = `Generate comprehensive glossary definitions for these terms: ${terms.join(', ')}.
      
      For each term, provide:
      1. A short definition (40 words max)
      2. An expanded explanation (2-3 paragraphs)
      3. 2-3 related terms
      4. 2-3 relevant questions with answers
      
      Return as JSON array with structure:
      {
        "terms": [
          {
            "term": "string",
            "shortDefinition": "string",
            "expandedExplanation": "string", 
            "relatedTerms": ["string"],
            "paaQuestions": [{"question": "string", "answer": "string"}]
          }
        ]
      }`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyze_domain') {
      return new Response(JSON.stringify({ 
        terms: ['SEO', 'Content Marketing', 'SERP', 'Keyword Research', 'CTR'] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'suggest_topic_terms') {
      const topicTerms = {
        'Digital Marketing': ['SEO', 'PPC', 'Social Media Marketing', 'Content Marketing', 'Email Marketing'],
        'SEO & Content': ['SERP', 'Keyword Research', 'Backlinks', 'Meta Tags', 'Content Optimization'],
        default: ['Analytics', 'Conversion Rate', 'User Experience', 'A/B Testing', 'ROI']
      };
      
      const terms = topicTerms[topic] || topicTerms.default;
      
      return new Response(JSON.stringify({ terms }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in glossary-generator function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});