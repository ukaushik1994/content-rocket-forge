import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await req.json();
    const { action, terms, url, topic } = body;
    const userIdFromBody = body.userId ?? body.user_id;

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;
    if (userIdFromBody && userIdFromBody !== userId) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_definitions') {
      // Get user's AI providers
      const aiProvider = await getUserAIProvider(userId);

      
      if (!aiProvider) {
        // Fallback to basic definitions
        const basicTerms = terms.map((term: string) => ({
          term,
          shortDefinition: `${term} is a key concept in this domain.`,
          expandedExplanation: `${term} represents an important aspect that requires understanding and proper implementation.`,
          relatedTerms: ['concept', 'implementation', 'best practice'],
          paaQuestions: [
            { question: `What is ${term}?`, answer: `${term} is a fundamental concept.` },
            { question: `How to use ${term}?`, answer: `Implementation depends on your specific use case.` }
          ]
        }));

        return new Response(JSON.stringify({ terms: basicTerms }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

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

      try {
        const content = await callAIWithFallback(aiProvider, prompt);
        const result = JSON.parse(content);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('AI generation failed:', error);
        // Fallback to basic definitions
        const basicTerms = terms.map((term: string) => ({
          term,
          shortDefinition: `${term} is a key concept in this domain.`,
          expandedExplanation: `${term} represents an important aspect that requires understanding and proper implementation.`,
          relatedTerms: ['concept', 'implementation', 'best practice'],
          paaQuestions: [
            { question: `What is ${term}?`, answer: `${term} is a fundamental concept.` },
            { question: `How to use ${term}?`, answer: `Implementation depends on your specific use case.` }
          ]
        }));

        return new Response(JSON.stringify({ terms: basicTerms }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
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
      
      const topicTermsList = topicTerms[topic as keyof typeof topicTerms] || topicTerms.default;
      
      return new Response(JSON.stringify({ terms: topicTermsList }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in glossary-generator function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserAIProvider(userId: string) {
  if (!userId) return null;

  try {
    // Use ai_service_providers + encrypted api_keys
    const { getApiKey } = await import('../shared/apiKeyService.ts');
    
    const { data: activeProvider } = await supabase
      .from('ai_service_providers')
      .select('provider, preferred_model')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (!activeProvider) return null;

    const decryptedKey = await getApiKey(activeProvider.provider, userId);
    if (!decryptedKey) return null;

    return {
      provider: activeProvider.provider,
      api_key: decryptedKey,
      model: activeProvider.preferred_model || 'gpt-4o-mini'
    };
  } catch (error) {
    console.error('Error getting user AI provider:', error);
    return null;
  }
}

async function callAIWithFallback(provider: any, prompt: string) {
  if (!provider) {
    throw new Error('No AI provider configured');
  }

  const messages = [{ role: 'user', content: prompt }];

  try {
    switch (provider.provider) {
      case 'openrouter':
        return await callOpenRouter(provider.api_key, provider.model, messages);
      case 'anthropic':
        return await callAnthropic(provider.api_key, provider.model, messages);
      case 'gemini':
        return await callGemini(provider.api_key, provider.model, messages);
      case 'openai':
        return await callOpenAI(provider.api_key, provider.model, messages);
      default:
        throw new Error(`Unsupported provider: ${provider.provider}`);
    }
  } catch (error) {
    console.error(`${provider.provider} API error:`, error);
    throw error;
  }
}

async function callOpenRouter(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callAnthropic(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function callGemini(apiKey: string, model: string, messages: any[]) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: messages.map(m => ({ parts: [{ text: m.content }] }))
    }),
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callOpenAI(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}