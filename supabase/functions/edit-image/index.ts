import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EditMode = 'variation' | 'inpaint' | 'expand' | 'upscale';

interface ImageEditRequest {
  provider: 'openai_image' | 'gemini_image';
  mode: EditMode;
  sourceImageUrl: string;      // Original image URL or base64
  prompt?: string;             // For inpaint/expand - describes what to add
  maskImageUrl?: string;       // For inpaint - areas to modify (white = edit)
  expandDirection?: 'up' | 'down' | 'left' | 'right' | 'all';
  size?: string;
  model?: string;
}

interface EditResult {
  imageUrl?: string;
  imageBase64?: string;
  model_used: string;
}

serve(async (req) => {
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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const request: ImageEditRequest = await req.json();
    console.log(`🖌️ Image edit request from user ${user.id}:`, {
      provider: request.provider,
      mode: request.mode,
      hasPrompt: !!request.prompt,
      hasMask: !!request.maskImageUrl
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
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `${request.provider} is not configured. Please add your API key in Settings.` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: EditResult;

    switch (request.provider) {
      case 'openai_image':
        result = await editWithOpenAI(
          providerData.api_key,
          request,
          providerData.preferred_model
        );
        break;
      
      case 'gemini_image':
        result = await editWithGemini(
          providerData.api_key,
          request,
          providerData.preferred_model
        );
        break;
      
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Unsupported provider for image editing' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`✅ Image edited successfully with ${request.provider} (${request.mode})`);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: result.imageUrl,
        imageBase64: result.imageBase64,
        provider_used: request.provider,
        model_used: result.model_used,
        edit_mode: request.mode
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image editing error:', error);
    
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Image editing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Convert URL or base64 to File-like blob for OpenAI
async function fetchImageAsBlob(imageSource: string): Promise<Blob> {
  if (imageSource.startsWith('data:')) {
    // Base64 data URL
    const base64Data = imageSource.split(',')[1];
    const mimeType = imageSource.split(';')[0].split(':')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  } else {
    // URL - fetch it
    const response = await fetch(imageSource);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    return await response.blob();
  }
}

async function editWithOpenAI(
  apiKey: string,
  request: ImageEditRequest,
  preferredModel?: string
): Promise<EditResult> {
  const model = request.model || preferredModel || 'gpt-image-1';
  
  console.log(`🔵 OpenAI ${request.mode} with ${model}...`);

  switch (request.mode) {
    case 'variation':
      return await createVariationOpenAI(apiKey, request, model);
    case 'inpaint':
      return await inpaintOpenAI(apiKey, request, model);
    case 'expand':
      return await expandOpenAI(apiKey, request, model);
    case 'upscale':
      // OpenAI doesn't have native upscale, generate at larger size
      return await upscaleOpenAI(apiKey, request, model);
    default:
      throw new Error(`Unsupported edit mode: ${request.mode}`);
  }
}

async function createVariationOpenAI(
  apiKey: string,
  request: ImageEditRequest,
  model: string
): Promise<EditResult> {
  // GPT-Image-1 uses edits endpoint with prompt for variations
  if (model === 'gpt-image-1') {
    const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
    
    const formData = new FormData();
    formData.append('model', model);
    formData.append('image', imageBlob, 'image.png');
    formData.append('prompt', request.prompt || 'Create a variation of this image with the same subject but different style');
    formData.append('n', '1');
    formData.append('size', request.size || '1024x1024');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI variation error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      imageUrl: data.data?.[0]?.url,
      imageBase64: data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : undefined,
      model_used: model
    };
  }

  // DALL-E 2 variations endpoint
  const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
  
  const formData = new FormData();
  formData.append('image', imageBlob, 'image.png');
  formData.append('n', '1');
  formData.append('size', request.size || '1024x1024');
  formData.append('response_format', 'url');

  const response = await fetch('https://api.openai.com/v1/images/variations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI variation error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    imageUrl: data.data?.[0]?.url,
    model_used: model
  };
}

async function inpaintOpenAI(
  apiKey: string,
  request: ImageEditRequest,
  model: string
): Promise<EditResult> {
  const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
  
  const formData = new FormData();
  formData.append('model', model);
  formData.append('image', imageBlob, 'image.png');
  formData.append('prompt', request.prompt || 'Edit this image');
  formData.append('n', '1');
  formData.append('size', request.size || '1024x1024');

  // Add mask if provided
  if (request.maskImageUrl) {
    const maskBlob = await fetchImageAsBlob(request.maskImageUrl);
    formData.append('mask', maskBlob, 'mask.png');
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI inpaint error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    imageUrl: data.data?.[0]?.url,
    imageBase64: data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : undefined,
    model_used: model
  };
}

async function expandOpenAI(
  apiKey: string,
  request: ImageEditRequest,
  model: string
): Promise<EditResult> {
  // For expansion, we create a mask around the edges and use inpaint
  // The prompt should describe what to add in the expanded area
  const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
  
  const expandPrompt = request.prompt || 
    `Expand this image ${request.expandDirection || 'in all directions'}, seamlessly extending the scene while maintaining the same style and content`;

  const formData = new FormData();
  formData.append('model', model);
  formData.append('image', imageBlob, 'image.png');
  formData.append('prompt', expandPrompt);
  formData.append('n', '1');
  
  // Use larger size for expansion
  const expandedSize = request.size || '1536x1024';
  formData.append('size', expandedSize);

  if (request.maskImageUrl) {
    const maskBlob = await fetchImageAsBlob(request.maskImageUrl);
    formData.append('mask', maskBlob, 'mask.png');
  }

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI expand error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    imageUrl: data.data?.[0]?.url,
    imageBase64: data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : undefined,
    model_used: model
  };
}

async function upscaleOpenAI(
  apiKey: string,
  request: ImageEditRequest,
  model: string
): Promise<EditResult> {
  // OpenAI doesn't have upscale, so we regenerate with the image as reference
  const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
  
  const formData = new FormData();
  formData.append('model', model);
  formData.append('image', imageBlob, 'image.png');
  formData.append('prompt', request.prompt || 'Recreate this image in higher resolution and detail, maintaining exact composition and style');
  formData.append('n', '1');
  formData.append('size', '1536x1024'); // Larger output

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI upscale error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return {
    imageUrl: data.data?.[0]?.url,
    imageBase64: data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : undefined,
    model_used: model
  };
}

async function editWithGemini(
  apiKey: string,
  request: ImageEditRequest,
  preferredModel?: string
): Promise<EditResult> {
  const model = request.model || preferredModel || 'gemini-2.5-flash-image-preview';
  
  console.log(`🟢 Gemini ${request.mode} with ${model}...`);

  // Gemini image editing via multimodal prompt
  // Fetch source image and encode as base64
  const imageBlob = await fetchImageAsBlob(request.sourceImageUrl);
  const imageBuffer = await imageBlob.arrayBuffer();
  const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
  const mimeType = imageBlob.type || 'image/png';

  let editPrompt: string;
  switch (request.mode) {
    case 'variation':
      editPrompt = request.prompt || 'Create an artistic variation of this image while keeping the same subject and composition';
      break;
    case 'inpaint':
      editPrompt = request.prompt || 'Edit this image as specified';
      break;
    case 'expand':
      editPrompt = `Expand this image ${request.expandDirection || 'outward'}: ${request.prompt || 'extend the scene naturally'}`;
      break;
    case 'upscale':
      editPrompt = 'Recreate this image with enhanced detail and higher quality';
      break;
    default:
      editPrompt = request.prompt || 'Modify this image';
  }

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
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            },
            {
              type: 'text',
              text: editPrompt
            }
          ]
        }
      ],
      modalities: ['image', 'text']
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini edit error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const images = data.choices?.[0]?.message?.images;

  if (!images || images.length === 0) {
    throw new Error('No edited image returned from Gemini');
  }

  return {
    imageBase64: images[0].image_url?.url,
    model_used: model
  };
}
