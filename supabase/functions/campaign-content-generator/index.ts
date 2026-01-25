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
  generateImages?: boolean; // Optional flag to skip image generation
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  provider: string;
  model: string;
  slot: string;
  createdAt: string;
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
      userId,
      generateImages = true // Default to generating images
    }: GenerateContentRequest = await req.json();

    console.log('[Campaign Content Generator] Starting generation for:', formatId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's active AI provider (for text generation)
    const { data: provider, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .neq('category', 'Image/Video Gen') // Exclude image providers
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

    // Save to content_items table (without images initially)
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

    // ========================================
    // PHASE 1: Generate images for this content
    // ========================================
    let generatedImages: GeneratedImage[] = [];
    
    if (generateImages) {
      try {
        generatedImages = await generateImagesForContent(
          supabase,
          userId,
          savedContent.id,
          brief,
          formatId,
          generatedContent,
          supabaseKey
        );
        
        if (generatedImages.length > 0) {
          console.log(`[Campaign Content Generator] Generated ${generatedImages.length} images`);
        }
      } catch (imageError) {
        // Log but don't fail the entire operation
        console.error('[Campaign Content Generator] Image generation failed (non-fatal):', imageError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: savedContent,
        wordCount: generatedContent.split(/\s+/).length,
        imagesGenerated: generatedImages.length,
        images: generatedImages
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
 * Generate images for the content piece
 */
async function generateImagesForContent(
  supabase: any,
  userId: string,
  contentId: string,
  brief: any,
  formatId: string,
  content: string,
  authToken: string
): Promise<GeneratedImage[]> {
  console.log('[Image Gen] Checking for image provider...');
  
  // Check if user has an image generation provider configured
  const { data: imageProvider, error: providerError } = await supabase
    .from('ai_service_providers')
    .select('*')
    .eq('user_id', userId)
    .eq('category', 'Image/Video Gen')
    .eq('status', 'active')
    .limit(1)
    .single();

  if (providerError || !imageProvider) {
    console.log('[Image Gen] No image provider configured, skipping image generation');
    return [];
  }

  console.log('[Image Gen] Using image provider:', imageProvider.provider);

  // Determine how many images to generate based on format
  const imageSlots = determineImageSlots(formatId, content);
  
  if (imageSlots.length === 0) {
    console.log('[Image Gen] No image slots needed for this format');
    return [];
  }

  const generatedImages: GeneratedImage[] = [];

  for (const slot of imageSlots) {
    try {
      // Build image prompt based on slot type and content context
      const imagePrompt = buildImagePrompt(slot, brief, formatId);
      
      console.log(`[Image Gen] Generating ${slot.type} image...`);
      
      // Call generate-image edge function
      const { data: imageResult, error: imageError } = await supabase.functions.invoke('generate-image', {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          provider: imageProvider.provider,
          prompt: imagePrompt,
          size: slot.size || '1024x1024',
          quality: 'standard'
        }
      });

      if (imageError) {
        console.error(`[Image Gen] Failed to generate ${slot.type} image:`, imageError);
        continue;
      }

      if (imageResult?.success) {
        const imageData: GeneratedImage = {
          id: crypto.randomUUID(),
          url: imageResult.imageUrl || imageResult.imageBase64,
          prompt: imagePrompt,
          provider: imageProvider.provider,
          model: imageResult.model_used || imageProvider.preferred_model,
          slot: slot.type,
          createdAt: new Date().toISOString()
        };
        
        generatedImages.push(imageData);
        console.log(`[Image Gen] Successfully generated ${slot.type} image`);
      }
    } catch (slotError) {
      console.error(`[Image Gen] Error generating ${slot.type} image:`, slotError);
      // Continue with next slot
    }
  }

  // Update content_items with generated images
  if (generatedImages.length > 0) {
    const { error: updateError } = await supabase
      .from('content_items')
      .update({
        generated_images: generatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('[Image Gen] Failed to save images to content:', updateError);
    } else {
      console.log(`[Image Gen] Saved ${generatedImages.length} images to content ${contentId}`);
    }
  }

  return generatedImages;
}

/**
 * Determine what images are needed based on content format
 */
function determineImageSlots(formatId: string, content: string): Array<{ type: string; size?: string }> {
  const contentLength = content.length;
  
  switch (formatId) {
    case 'blog':
      // Blog: hero image + 1-2 section images for longer content
      const slots: Array<{ type: string; size?: string }> = [
        { type: 'hero', size: '1792x1024' } // Wide hero
      ];
      if (contentLength > 2000) {
        slots.push({ type: 'section', size: '1024x1024' });
      }
      if (contentLength > 4000) {
        slots.push({ type: 'section', size: '1024x1024' });
      }
      return slots;
    
    case 'social-linkedin':
    case 'social-facebook':
      return [{ type: 'featured', size: '1200x628' }]; // Social share size
    
    case 'social-instagram':
    case 'carousel':
      return [{ type: 'square', size: '1024x1024' }];
    
    case 'social-twitter':
      return [{ type: 'twitter', size: '1024x576' }]; // 16:9 ratio
    
    case 'landing-page':
      return [
        { type: 'hero', size: '1792x1024' },
        { type: 'feature', size: '1024x1024' }
      ];
    
    case 'email':
      return [{ type: 'header', size: '1200x400' }];
    
    case 'script':
    case 'video':
      return [{ type: 'thumbnail', size: '1280x720' }];
    
    default:
      // Default: single featured image for most formats
      return [{ type: 'featured', size: '1024x1024' }];
  }
}

/**
 * Build optimized image prompt based on slot and content context
 */
function buildImagePrompt(
  slot: { type: string; size?: string },
  brief: any,
  formatId: string
): string {
  const keywords = brief.keywords?.slice(0, 3).join(', ') || '';
  const title = brief.title || '';
  
  // Base prompt structure
  let prompt = `Professional, high-quality ${slot.type} image for marketing content.`;
  
  // Add context based on slot type
  switch (slot.type) {
    case 'hero':
      prompt = `Striking hero banner image. Topic: ${title}. ${keywords ? `Related to: ${keywords}.` : ''} Professional, modern, visually impactful. Wide composition, suitable for website header.`;
      break;
    
    case 'featured':
    case 'square':
      prompt = `Eye-catching featured image for social media. Topic: ${title}. ${keywords ? `Keywords: ${keywords}.` : ''} Vibrant colors, professional quality, optimized for engagement.`;
      break;
    
    case 'section':
      prompt = `Illustrative image supporting article section. Topic: ${title}. ${keywords ? `Context: ${keywords}.` : ''} Clean, professional, complementary to written content.`;
      break;
    
    case 'thumbnail':
      prompt = `Compelling video thumbnail image. Topic: ${title}. ${keywords ? `Theme: ${keywords}.` : ''} Bold, attention-grabbing, with clear focal point.`;
      break;
    
    case 'header':
      prompt = `Professional email header banner. Topic: ${title}. Clean, modern design with subtle branding elements. Business appropriate.`;
      break;
    
    case 'twitter':
      prompt = `Engaging Twitter/X image. Topic: ${title}. ${keywords ? `Keywords: ${keywords}.` : ''} Eye-catching, shareable, optimized for timeline scrolling.`;
      break;
    
    case 'feature':
      prompt = `Feature showcase image for landing page. Topic: ${title}. Modern, professional, trust-building imagery suitable for conversion.`;
      break;
    
    default:
      prompt = `Professional marketing image. Topic: ${title}. ${keywords ? `Keywords: ${keywords}.` : ''} High quality, suitable for ${formatId} content.`;
  }
  
  // Add format-specific styling hints
  if (formatId.includes('social')) {
    prompt += ' Style: Bold, social media optimized, high contrast.';
  } else if (formatId === 'blog' || formatId === 'landing-page') {
    prompt += ' Style: Professional, clean, corporate aesthetic.';
  }
  
  // Universal quality directives
  prompt += ' No text overlays. No watermarks. Photorealistic quality.';
  
  return prompt;
}

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
