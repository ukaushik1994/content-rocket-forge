import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  brief: {
    title: string;
    description: string;
    keywords: string[];
    targetWordCount: number;
  };
  campaignId: string;
  solutionId?: string;
  formatId: string;
  campaignContext: {
    title: string;
    description: string;
    targetAudience?: string;
    goal?: string;
  };
  solutionData?: any;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      brief,
      campaignId,
      solutionId,
      formatId,
      campaignContext,
      solutionData,
      userId
    }: GenerateContentRequest = await req.json();

    console.log('[Campaign Content Generator] Starting generation for:', formatId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's active AI provider
    const { data: provider, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(1)
      .single();

    if (providerError || !provider) {
      console.error('[Campaign Content Generator] No active AI provider found');
      return new Response(
        JSON.stringify({ 
          error: 'No AI provider configured. Please configure an AI provider in Settings.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Campaign Content Generator] Using provider:', provider.provider);

    // Build generation prompt
    const systemPrompt = buildContentPrompt(
      brief,
      formatId,
      campaignContext,
      solutionData
    );

    // Call user's configured AI provider through enhanced-ai-chat
    const { data: aiResponse, error: aiError } = await supabase.functions.invoke('enhanced-ai-chat', {
      headers: {
        Authorization: `Bearer ${supabaseKey}`
      },
      body: {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate content for: ${brief.title}` }
        ],
        userId,
        model: provider.preferred_model || undefined
      }
    });

    if (aiError) {
      console.error('[Campaign Content Generator] AI generation failed:', aiError);
      throw aiError;
    }

    const generatedContent = typeof aiResponse.content === 'string' 
      ? aiResponse.content 
      : JSON.stringify(aiResponse.content);

    console.log('[Campaign Content Generator] Content generated, saving to database...');

    // Save to content_items table
    const { data: savedContent, error: saveError } = await supabase
      .from('content_items')
      .insert({
        user_id: userId,
        campaign_id: campaignId,
        solution_id: solutionId || null,
        title: brief.title,
        content: generatedContent,
        keywords: brief.keywords,
        meta_title: brief.title.substring(0, 60),
        meta_description: brief.description.substring(0, 160),
        metadata: {
          formatId,
          brief,
          campaignContext,
          generatedAt: new Date().toISOString(),
          provider: provider.provider,
          model: provider.preferred_model,
          wordCount: generatedContent.split(/\s+/).length
        },
        status: 'draft',
        word_count: generatedContent.split(/\s+/).length,
        content_type: formatId
      })
      .select()
      .single();

    if (saveError) {
      console.error('[Campaign Content Generator] Failed to save content:', saveError);
      throw saveError;
    }

    console.log('[Campaign Content Generator] Content saved successfully:', savedContent.id);

    return new Response(
      JSON.stringify({
        success: true,
        content: savedContent,
        wordCount: generatedContent.split(/\s+/).length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Campaign Content Generator] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate content',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Builds the content generation prompt
 */
function buildContentPrompt(
  brief: any,
  formatId: string,
  campaignContext: any,
  solutionData: any | null
): string {
  const formatGuidance = getFormatGuidance(formatId);
  
  let prompt = `You are an expert content creator specializing in ${formatId} content.

CAMPAIGN CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign: ${campaignContext.title}
Description: ${campaignContext.description}
Target Audience: ${campaignContext.targetAudience || 'Not specified'}
Goal: ${campaignContext.goal || 'Awareness'}
━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTENT BRIEF:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${brief.title}
Description: ${brief.description}
Keywords: ${brief.keywords.join(', ')}
Target Word Count: ${brief.targetWordCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━

${formatGuidance}

REQUIREMENTS:
1. Write engaging, valuable content for the target audience
2. Naturally incorporate the keywords
3. Match the target word count (±10%)
4. Use clear, compelling language
5. Include actionable insights`;

  if (solutionData) {
    prompt += `

SOLUTION TO FEATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${solutionData.name}
Description: ${solutionData.short_description || solutionData.description}
Benefits: ${Array.isArray(solutionData.benefits) ? solutionData.benefits.join(', ') : 'Not specified'}
━━━━━━━━━━━━━━━━━━━━━━━━━━

6. Naturally integrate the solution where relevant
7. Show how it solves real problems
8. Use specific examples and use cases`;
  }

  prompt += `

Generate the content now. Return ONLY the content itself, no meta-commentary.`;

  return prompt;
}

/**
 * Returns format-specific guidance
 */
function getFormatGuidance(formatId: string): string {
  const guidance: Record<string, string> = {
    'blog': 'Write a complete blog post with introduction, main body with subheadings, and conclusion. Make it educational and SEO-friendly.',
    'email': 'Write a compelling email with attention-grabbing subject line, personalized greeting, valuable content, and clear CTA.',
    'social-twitter': 'Write an engaging tweet (280 chars max) with a hook, value, and optional hashtags. Be conversational and actionable.',
    'social-linkedin': 'Write a professional LinkedIn post with a strong hook, valuable insights, and engagement question. Use line breaks for readability.',
    'social-facebook': 'Write an engaging Facebook post with storytelling, emotional connection, and community-building elements.',
    'social-instagram': 'Write an Instagram caption with visual description, value proposition, emojis, and relevant hashtags.',
    'script': 'Write a video script with hook, main content, and call-to-action. Include visual cues and timing suggestions.',
    'landing-page': 'Write landing page copy with headline, subheadline, benefits, features, social proof, and CTA sections.',
    'carousel': 'Write content for a carousel post. Each slide should have a clear point. Start with title slide.',
    'meme': 'Write meme text - short, punchy, relatable, and shareable. Top and bottom text format.',
    'google-ads': 'Write Google Ads copy with 3 headlines (30 chars each), 2 descriptions (90 chars each), and display URL path.'
  };

  return guidance[formatId] || 'Write high-quality, engaging content appropriate for this format.';
}
