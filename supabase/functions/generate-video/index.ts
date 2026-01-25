import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VideoGenerationRequest {
  provider?: string;
  prompt: string;
  mode?: 'text-to-video' | 'image-to-video';
  sourceImageUrl?: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  model?: string;
}

interface VideoGenerationResponse {
  success: boolean;
  taskId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  provider_used?: string;
  model_used?: string;
  estimatedTime?: number;
  error?: string;
}

// Runway ML Gen-3 Alpha API
async function generateWithRunway(
  apiKey: string,
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  const mode = request.mode || 'text-to-video';
  const duration = request.duration || 5;
  
  try {
    let endpoint: string;
    let body: Record<string, any>;

    if (mode === 'image-to-video' && request.sourceImageUrl) {
      endpoint = 'https://api.dev.runwayml.com/v1/image_to_video';
      body = {
        model: request.model || 'gen3a_turbo',
        promptImage: request.sourceImageUrl,
        promptText: request.prompt,
        duration: duration,
        ratio: request.aspectRatio === '9:16' ? '768:1280' : 
               request.aspectRatio === '1:1' ? '1024:1024' : '1280:768',
      };
    } else {
      endpoint = 'https://api.dev.runwayml.com/v1/text_to_video';
      body = {
        model: request.model || 'gen3a_turbo',
        promptText: request.prompt,
        duration: duration,
        ratio: request.aspectRatio === '9:16' ? '768:1280' : 
               request.aspectRatio === '1:1' ? '1024:1024' : '1280:768',
      };
    }

    console.log(`🎬 Runway ${mode} request:`, { endpoint, body: { ...body, promptImage: body.promptImage ? '[IMAGE]' : undefined } });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runway API error:', response.status, errorText);
      return {
        success: false,
        error: `Runway API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('Runway response:', data);

    return {
      success: true,
      taskId: data.id,
      status: 'generating',
      provider_used: 'runway_video',
      model_used: body.model,
      estimatedTime: duration * 10, // Rough estimate: 10 seconds per video second
    };
  } catch (error: any) {
    console.error('Runway generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video with Runway',
    };
  }
}

// Replicate API (Stable Video Diffusion, CogVideoX)
async function generateWithReplicate(
  apiKey: string,
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  try {
    // Use CogVideoX-5B for text-to-video (best open-source option)
    const modelVersion = request.mode === 'image-to-video' 
      ? 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438'
      : 'fofr/cogvideox-5b:265055973556c7e2b91149ba53b39c72e6b6bebe2e19a349247a8bf5f1c2a70a';

    const input = request.mode === 'image-to-video' && request.sourceImageUrl
      ? {
          input_image: request.sourceImageUrl,
          motion_bucket_id: 127,
          fps: 6,
        }
      : {
          prompt: request.prompt,
          num_frames: request.duration === 10 ? 49 : 25,
          guidance_scale: 7,
        };

    console.log(`🎬 Replicate request:`, { model: modelVersion, input });

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelVersion.split(':')[1],
        input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      return {
        success: false,
        error: `Replicate API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('Replicate response:', data);

    return {
      success: true,
      taskId: data.id,
      status: 'generating',
      provider_used: 'replicate_video',
      model_used: modelVersion.split('/')[1]?.split(':')[0] || 'cogvideox',
      estimatedTime: 60,
    };
  } catch (error: any) {
    console.error('Replicate generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video with Replicate',
    };
  }
}

// Kling API
async function generateWithKling(
  apiKey: string,
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  try {
    // Kling API endpoint (placeholder - actual endpoint may vary)
    const endpoint = 'https://api.klingai.com/v1/videos/generations';
    
    const body = {
      prompt: request.prompt,
      duration: request.duration || 5,
      aspect_ratio: request.aspectRatio || '16:9',
      model: request.model || 'kling-v1.5',
      ...(request.mode === 'image-to-video' && request.sourceImageUrl && {
        image_url: request.sourceImageUrl,
      }),
    };

    console.log(`🎬 Kling request:`, body);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kling API error:', response.status, errorText);
      return {
        success: false,
        error: `Kling API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('Kling response:', data);

    return {
      success: true,
      taskId: data.task_id || data.id,
      status: 'generating',
      provider_used: 'kling_video',
      model_used: body.model,
      estimatedTime: 90,
    };
  } catch (error: any) {
    console.error('Kling generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video with Kling',
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const request: VideoGenerationRequest = await req.json();

    console.log(`🎬 Video generation request from user ${userId}:`, {
      provider: request.provider,
      mode: request.mode,
      duration: request.duration,
      aspectRatio: request.aspectRatio,
    });

    // Get provider API key
    let providerToUse = request.provider;
    
    // Fetch active video provider if not specified
    if (!providerToUse) {
      const { data: providers, error: providerError } = await supabase
        .from('ai_service_providers')
        .select('provider, api_key, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .in('provider', ['runway_video', 'kling_video', 'replicate_video']);

      if (providerError || !providers || providers.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'No video generation provider configured. Please set up a provider in Settings.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      providerToUse = providers[0].provider;
    }

    // Get API key for the provider
    const { data: providerData, error: keyError } = await supabase
      .from('ai_service_providers')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', providerToUse)
      .eq('status', 'active')
      .single();

    if (keyError || !providerData?.api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `${providerToUse} is not configured. Please add your API key in Settings.`,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt API key via secure-api-key function
    const { data: decryptedData, error: decryptError } = await supabase.functions.invoke(
      'secure-api-key',
      {
        body: {
          action: 'decrypt',
          encryptedKey: providerData.api_key,
        },
      }
    );

    if (decryptError || !decryptedData?.key) {
      console.error('Failed to decrypt API key:', decryptError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to decrypt API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = decryptedData.key;

    // Route to appropriate provider
    let result: VideoGenerationResponse;

    switch (providerToUse) {
      case 'runway_video':
        result = await generateWithRunway(apiKey, request);
        break;
      case 'replicate_video':
        result = await generateWithReplicate(apiKey, request);
        break;
      case 'kling_video':
        result = await generateWithKling(apiKey, request);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, error: `Unknown provider: ${providerToUse}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
