import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface SuggestionRequest {
  content: string;
  checkTitle: string;
  context: {
    mainKeyword?: string;
    selectedKeywords?: string[];
    contentLength: number;
    wordCount: number;
    contentType?: string;
    targetGoal?: string;
    strategicContext?: string;
    checkType?: string;
  };
}

// Model parameter configuration
const getModelParams = (model: string) => {
  // GPT-5 and newer models use max_completion_tokens and don't support temperature
  if (model.includes('gpt-5') || model.includes('o3') || model.includes('o4')) {
    return {
      max_completion_tokens: 2000,
      // No temperature parameter for newer models
    };
  }
  
  // Legacy models use max_tokens and support temperature
  return {
    max_tokens: 2000,
    temperature: 0.3,
  };
};

// Create system prompt for content suggestions
const createSystemPrompt = () => `You are an expert content optimization specialist. Analyze the given content and provide specific, actionable text replacement suggestions to improve content quality based on the identified issue.

Return your response as a JSON array of suggestions. Each suggestion should have this exact structure:
{
  "id": "unique-suggestion-id",
  "title": "Brief title describing the improvement",
  "impact": "high" | "medium" | "low",
  "category": "clarity" | "seo" | "readability" | "engagement" | "structure",
  "replacements": [
    {
      "before": "exact text to replace from the content",
      "after": "improved replacement text", 
      "reason": "explanation for this specific change",
      "location": {
        "startIndex": 0,
        "endIndex": 0
      }
    }
  ]
}

Focus on:
1. Finding exact text segments that can be improved
2. Providing clear, actionable replacements
3. Explaining why each change improves the content
4. Ensuring 'before' text exists exactly in the provided content

Return ONLY the JSON array, no other text.`;

// Create user prompt with content and context
const createUserPrompt = (content: string, context: any, checkTitle: string) => {
  const contextInfo = context.strategicContext ? `\n\nSTRATEGIC CONTEXT: ${context.strategicContext}` : '';
  const keywordInfo = context.mainKeyword ? `\n\nMAIN KEYWORD: ${context.mainKeyword}` : '';
  const additionalKeywords = context.selectedKeywords?.length ? `\nADDITIONAL KEYWORDS: ${context.selectedKeywords.join(', ')}` : '';
  
  return `Analyze this content and provide 3-7 specific optimization suggestions with exact text replacements for: "${checkTitle}"

CONTENT TO ANALYZE:
${content}${contextInfo}${keywordInfo}${additionalKeywords}

Focus on improvements related to: ${checkTitle}
Content Type: ${context.contentType || 'article'}
Word Count: ${context.wordCount}
Target Goal: ${context.targetGoal || 'optimization'}`;
};

// Try different AI providers with fallback
const callAIProvider = async (messages: any[], attempt: number = 1): Promise<any> => {
  const providers = [
    { name: 'OpenAI', key: 'OPENAI_API_KEY', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
    { name: 'OpenRouter', key: 'OPENROUTER_API_KEY', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini' }
  ];

  for (const provider of providers) {
    const apiKey = Deno.env.get(provider.key);
    if (!apiKey) {
      console.log(`⚠️ ${provider.name} API key not found, skipping...`);
      continue;
    }

    try {
      console.log(`🤖 Trying ${provider.name} with model: ${provider.model}`);
      
      const modelParams = getModelParams(provider.model);
      const requestBody = {
        model: provider.model,
        messages,
        ...modelParams
      };

      console.log(`📨 Request body for ${provider.name}:`, JSON.stringify(requestBody, null, 2));

      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(provider.name === 'OpenRouter' && {
            'HTTP-Referer': 'https://your-app.com',
            'X-Title': 'Content Suggestions'
          })
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`📊 ${provider.name} response status:`, response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ ${provider.name} API error (${response.status}):`, errorText);
        
        // If it's a quota/credit error, continue to next provider
        if (response.status === 402 || response.status === 429) {
          console.log(`💳 ${provider.name} quota/rate limit exceeded, trying next provider...`);
          continue;
        }
        throw new Error(`${provider.name} API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ ${provider.name} response received`);
      
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      
      throw new Error(`Invalid response format from ${provider.name}`);
      
    } catch (error) {
      console.error(`❌ ${provider.name} failed:`, error.message);
      // Continue to next provider
    }
  }

  throw new Error('All AI providers failed or unavailable');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Processing content suggestions request');
    
    const requestData: SuggestionRequest = await req.json();
    console.log('📨 Request data:', {
      checkTitle: requestData.checkTitle,
      contentLength: requestData.content?.length,
      context: requestData.context
    });

    if (!requestData.content || !requestData.checkTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: content and checkTitle' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create messages for AI
    const messages = [
      { role: 'system', content: createSystemPrompt() },
      { role: 'user', content: createUserPrompt(requestData.content, requestData.context, requestData.checkTitle) }
    ];

    console.log('🤖 Calling AI providers...');
    const aiResponse = await callAIProvider(messages);
    console.log('📝 AI response received:', aiResponse?.substring(0, 200) + '...');

    // Parse and validate response
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
      console.log('✅ Parsed AI response successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      
      // Try to extract JSON from markdown
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        try {
          suggestions = JSON.parse(jsonMatch[1]);
          console.log('✅ Extracted JSON from markdown');
        } catch (innerError) {
          throw new Error('Invalid JSON format in AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    }

    // Validate suggestions structure
    if (!Array.isArray(suggestions)) {
      throw new Error('AI response must be an array of suggestions');
    }

    // Return structured response format expected by frontend
    const response = {
      suggestions: suggestions.map((suggestion: any, index: number) => ({
        id: suggestion.id || `suggestion-${index + 1}`,
        title: suggestion.title || 'Content Improvement',
        impact: suggestion.impact || 'medium',
        category: suggestion.category || 'clarity',
        replacements: Array.isArray(suggestion.replacements) 
          ? suggestion.replacements.map((replacement: any) => ({
              before: replacement.before || replacement.originalText || '',
              after: replacement.after || replacement.replacementText || '',
              reason: replacement.reason || replacement.explanation || 'Content improvement',
              location: replacement.location || { startIndex: 0, endIndex: 0 }
            }))
          : []
      }))
    };

    console.log(`✅ Returning ${response.suggestions.length} validated suggestions`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in content-suggestions function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        suggestions: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});