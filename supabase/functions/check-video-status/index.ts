import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatusCheckRequest {
  taskId: string;
  provider: 'runway_video' | 'kling_video' | 'replicate_video';
}

interface StatusCheckResponse {
  success: boolean;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  progress?: number;
  error?: string;
}

// Check Runway task status
async function checkRunwayStatus(apiKey: string, taskId: string): Promise<StatusCheckResponse> {
  try {
    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runway status check error:', response.status, errorText);
      return {
        success: false,
        status: 'failed',
        error: `Failed to check status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('Runway status response:', data);

    // Map Runway status to our status
    const statusMap: Record<string, StatusCheckResponse['status']> = {
      'PENDING': 'pending',
      'RUNNING': 'generating',
      'SUCCEEDED': 'completed',
      'FAILED': 'failed',
    };

    const status = statusMap[data.status] || 'generating';

    return {
      success: true,
      status,
      videoUrl: data.output?.[0] || data.artifacts?.[0]?.url,
      thumbnailUrl: data.thumbnail,
      progress: data.progress ? Math.round(data.progress * 100) : undefined,
      error: data.failure || data.failureCode,
    };
  } catch (error: any) {
    console.error('Runway status check error:', error);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
}

// Check Replicate prediction status
async function checkReplicateStatus(apiKey: string, taskId: string): Promise<StatusCheckResponse> {
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate status check error:', response.status, errorText);
      return {
        success: false,
        status: 'failed',
        error: `Failed to check status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('Replicate status response:', data);

    // Map Replicate status to our status
    const statusMap: Record<string, StatusCheckResponse['status']> = {
      'starting': 'pending',
      'processing': 'generating',
      'succeeded': 'completed',
      'failed': 'failed',
      'canceled': 'failed',
    };

    const status = statusMap[data.status] || 'generating';

    // Replicate returns output as an array or single URL
    const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;

    return {
      success: true,
      status,
      videoUrl,
      error: data.error,
    };
  } catch (error: any) {
    console.error('Replicate status check error:', error);
    return {
      success: false,
      status: 'failed',
      error: error.message,
    };
  }
}

// Check Kling task status
async function checkKlingStatus(apiKey: string, taskId: string): Promise<StatusCheckResponse> {
  try {
    const response = await fetch(`https://api.klingai.com/v1/videos/generations/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kling status check error:', response.status, errorText);
      return {
        success: false,
        status: 'failed',
        error: `Failed to check status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('Kling status response:', data);

    // Map Kling status to our status
    const statusMap: Record<string, StatusCheckResponse['status']> = {
      'pending': 'pending',
      'processing': 'generating',
      'completed': 'completed',
      'success': 'completed',
      'failed': 'failed',
    };

    const status = statusMap[data.status?.toLowerCase()] || 'generating';

    return {
      success: true,
      status,
      videoUrl: data.video_url || data.output?.video_url,
      thumbnailUrl: data.thumbnail_url || data.output?.thumbnail_url,
      progress: data.progress,
      error: data.error_message,
    };
  } catch (error: any) {
    console.error('Kling status check error:', error);
    return {
      success: false,
      status: 'failed',
      error: error.message,
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
        JSON.stringify({ success: false, status: 'failed', error: 'Unauthorized' }),
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
        JSON.stringify({ success: false, status: 'failed', error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    const request: StatusCheckRequest = await req.json();

    console.log(`🔍 Video status check for task ${request.taskId} (${request.provider})`);

    // Get API key for the provider
    const { data: providerData, error: keyError } = await supabase
      .from('ai_service_providers')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', request.provider)
      .single();

    if (keyError || !providerData?.api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'failed',
          error: 'Provider not configured',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt API key
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
      return new Response(
        JSON.stringify({ success: false, status: 'failed', error: 'Failed to decrypt API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = decryptedData.key;

    // Route to appropriate provider status check
    let result: StatusCheckResponse;

    switch (request.provider) {
      case 'runway_video':
        result = await checkRunwayStatus(apiKey, request.taskId);
        break;
      case 'replicate_video':
        result = await checkReplicateStatus(apiKey, request.taskId);
        break;
      case 'kling_video':
        result = await checkKlingStatus(apiKey, request.taskId);
        break;
      default:
        return new Response(
          JSON.stringify({ success: false, status: 'failed', error: `Unknown provider: ${request.provider}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Video status check error:', error);
    return new Response(
      JSON.stringify({ success: false, status: 'failed', error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
