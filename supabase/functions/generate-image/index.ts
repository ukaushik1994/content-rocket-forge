import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  provider: 'openai_image' | 'gemini_image' | 'lmstudio_image';
  prompt: string;
  negativePrompt?: string;
  size?: string;
  quality?: string;
  style?: string;
  model?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: ImageGenerationRequest = await req.json();
    console.log(`🎨 Image generation request from user ${user.id}:`, {
      provider: request.provider,
      prompt: request.prompt.substring(0, 50) + '...',
      size: request.size
    });

    // Get API key for the provider
    const { data: providerData, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('api_key, preferred_model')
      .eq('user_id', user.id)
      .eq('provider', request.provider)
      .eq('status', 'active')
      .single();

    if (providerError || !providerData?.api_key) {
      console.error('Provider not configured:', providerError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `${request.provider} is not configured. Please add your API key in Settings.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: { imageUrl?: string; imageBase64?: string; model_used: string };

    switch (request.provider) {
      case 'openai_image':
        result = await generateWithOpenAI(
          providerData.api_key,
          request,
          providerData.preferred_model
        );
        break;
      
      case 'gemini_image':
        result = await generateWithGemini(
          providerData.api_key,
          request,
          providerData.preferred_model
        );
        break;
      
      case 'lmstudio_image':
        result = await generateWithLMStudio(
          providerData.api_key, // This is the base URL for LM Studio
          request
        );
        break;
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unsupported provider' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`✅ Image generated successfully with ${request.provider}`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: result.imageUrl,
        imageBase64: result.imageBase64,
        provider_used: request.provider,
        model_used: result.model_used
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Handle rate limits
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle payment required
    if (error.message?.includes('402') || error.message?.includes('payment')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payment required. Please check your API billing.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Image generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateWithOpenAI(
  apiKey: string,
  request: ImageGenerationRequest,
  preferredModel?: string
): Promise<{ imageUrl?: string; imageBase64?: string; model_used: string }> {
  const model = request.model || preferredModel || 'gpt-image-1';
  
  console.log(`🔵 Calling OpenAI ${model}...`);

  // Use different endpoints based on model
  const isGptImage = model === 'gpt-image-1';
  
  const body: any = {
    model,
    prompt: request.prompt,
    n: 1,
    size: request.size || '1024x1024',
  };

  // Add quality and style for DALL-E 3
  if (model === 'dall-e-3') {
    body.quality = request.quality || 'standard';
    body.style = request.style || 'vivid';
  }

  // GPT-Image-1 uses response_format differently
  if (isGptImage) {
    body.response_format = 'b64_json';
  } else {
    body.response_format = 'url';
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI error:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0];

  if (!imageData) {
    throw new Error('No image data returned from OpenAI');
  }

  return {
    imageUrl: imageData.url,
    imageBase64: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : undefined,
    model_used: model
  };
}

async function generateWithGemini(
  apiKey: string,
  request: ImageGenerationRequest,
  preferredModel?: string
): Promise<{ imageUrl?: string; imageBase64?: string; model_used: string }> {
  const model = request.model || preferredModel || 'gemini-2.5-flash-image-preview';
  
  console.log(`🟢 Calling Gemini ${model}...`);

  // Use OpenRouter to access Gemini image generation
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `google/${model}`,
      messages: [
        {
          role: 'user',
          content: request.prompt
        }
      ],
      modalities: ['image', 'text']
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini error:', errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const images = data.choices?.[0]?.message?.images;

  if (!images || images.length === 0) {
    throw new Error('No image returned from Gemini');
  }

  return {
    imageBase64: images[0].image_url?.url,
    model_used: model
  };
}

async function generateWithLMStudio(
  baseUrl: string,
  request: ImageGenerationRequest
): Promise<{ imageUrl?: string; imageBase64?: string; model_used: string }> {
  console.log(`🟣 Calling LM Studio at ${baseUrl}...`);

  // LM Studio with SD.cpp or similar
  // Attempt to use a standard image generation endpoint
  const url = `${baseUrl.replace(/\/$/, '')}/v1/images/generations`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: request.prompt,
      negative_prompt: request.negativePrompt || '',
      n: 1,
      size: request.size || '512x512',
      response_format: 'b64_json'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('LM Studio error:', errorText);
    throw new Error(`LM Studio error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const imageData = data.data?.[0];

  if (!imageData) {
    throw new Error('No image data returned from LM Studio');
  }

  return {
    imageBase64: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : undefined,
    model_used: 'stable-diffusion-local'
  };
}
