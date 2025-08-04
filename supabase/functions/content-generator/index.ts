
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      contentType, 
      title, 
      outline, 
      keywords, 
      mainKeyword,
      solution,
      additionalInstructions,
      userId 
    } = await req.json();

    console.log('📝 Generating content for:', { contentType, title, mainKeyword });

    // Get OpenAI API key from user's API keys
    const { data: apiKeyData } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('user_id', userId)
      .eq('service', 'openai')
      .eq('is_active', true)
      .single();

    if (!apiKeyData?.encrypted_key) {
      throw new Error('OpenAI API key not found. Please add your API key in Settings.');
    }

    // Build comprehensive content generation prompt
    let prompt = `Generate a comprehensive ${contentType} with the following specifications:

TITLE: ${title}

MAIN KEYWORD: ${mainKeyword}
TARGET KEYWORDS: ${keywords?.join(', ') || 'None'}

OUTLINE:
${outline?.map((section: any, index: number) => `${index + 1}. ${typeof section === 'string' ? section : section.title}`).join('\n') || 'No specific outline provided'}`;

    if (solution) {
      prompt += `\n\nSOLUTION TO INTEGRATE:
- Name: ${solution.name}
- Features: ${solution.features?.join(', ') || 'None'}
- Pain Points Addressed: ${solution.painPoints?.join(', ') || 'None'}
- Target Audience: ${solution.targetAudience?.join(', ') || 'None'}

Please naturally integrate references to this solution throughout the content.`;
    }

    if (additionalInstructions) {
      prompt += `\n\nADDITIONAL INSTRUCTIONS:
${additionalInstructions}`;
    }

    prompt += `\n\nREQUIREMENTS:
- Write in a professional, engaging tone
- Include relevant headings and subheadings (use H2, H3 format)
- Naturally incorporate the main keyword and related keywords
- Ensure content is valuable and informative for readers
- Include a compelling introduction and conclusion
- Target length: 1500-2500 words
- Use markdown formatting for structure

Generate the complete content now:`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeyData.encrypted_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content writer specializing in SEO-optimized content. Generate high-quality, engaging content that naturally incorporates keywords and provides real value to readers.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Content generation failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from AI');
    }

    console.log('✅ Content generated successfully');

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        usage: data.usage,
        model: 'gpt-4o-mini'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Content generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
