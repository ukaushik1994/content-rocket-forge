import { supabase } from '@/integrations/supabase/client';

export interface MediaProviderHealth {
  provider: string;
  type: 'image' | 'video';
  status: 'connected' | 'error' | 'not_configured' | 'quota_exceeded';
  lastTested: string | null;
  errorMessage?: string;
  testResult?: {
    latency: number;
    success: boolean;
  };
}

export interface MediaHealthSummary {
  imageProviders: MediaProviderHealth[];
  videoProviders: MediaProviderHealth[];
  hasAnyImageProvider: boolean;
  hasAnyVideoProvider: boolean;
  allHealthy: boolean;
}

const IMAGE_PROVIDERS = [
  { id: 'openai-image', name: 'OpenAI DALL-E', service: 'openai' },
  { id: 'gemini-image', name: 'Google Gemini', service: 'gemini' },
  { id: 'lmstudio-image', name: 'LM Studio', service: 'lmstudio' }
];

const VIDEO_PROVIDERS = [
  { id: 'runway', name: 'Runway ML', service: 'runway' },
  { id: 'kling', name: 'Kling AI', service: 'kling' },
  { id: 'replicate', name: 'Replicate', service: 'replicate' }
];

class MediaHealthService {
  /**
   * Check health status of all media providers
   */
  async checkAllProviders(userId: string): Promise<MediaHealthSummary> {
    const [imageResults, videoResults] = await Promise.all([
      this.checkImageProviders(userId),
      this.checkVideoProviders(userId)
    ]);

    const hasAnyImageProvider = imageResults.some(p => p.status === 'connected');
    const hasAnyVideoProvider = videoResults.some(p => p.status === 'connected');
    const allHealthy = [...imageResults, ...videoResults]
      .filter(p => p.status !== 'not_configured')
      .every(p => p.status === 'connected');

    return {
      imageProviders: imageResults,
      videoProviders: videoResults,
      hasAnyImageProvider,
      hasAnyVideoProvider,
      allHealthy
    };
  }

  /**
   * Check health of image generation providers
   */
  private async checkImageProviders(userId: string): Promise<MediaProviderHealth[]> {
    const results: MediaProviderHealth[] = [];

    for (const provider of IMAGE_PROVIDERS) {
      const health = await this.checkProviderHealth(userId, provider.service, 'image');
      results.push({
        provider: provider.name,
        type: 'image',
        ...health
      });
    }

    return results;
  }

  /**
   * Check health of video generation providers
   */
  private async checkVideoProviders(userId: string): Promise<MediaProviderHealth[]> {
    const results: MediaProviderHealth[] = [];

    for (const provider of VIDEO_PROVIDERS) {
      const health = await this.checkProviderHealth(userId, provider.service, 'video');
      results.push({
        provider: provider.name,
        type: 'video',
        ...health
      });
    }

    return results;
  }

  /**
   * Check if a specific provider is configured and healthy
   */
  private async checkProviderHealth(
    userId: string, 
    service: string, 
    type: 'image' | 'video'
  ): Promise<Omit<MediaProviderHealth, 'provider' | 'type'>> {
    try {
      // Check if API key exists
      const { data: keyData } = await supabase
        .from('api_keys_metadata')
        .select('service, is_active')
        .eq('user_id', userId)
        .eq('service', service)
        .eq('is_active', true)
        .maybeSingle();

      if (!keyData) {
        return {
          status: 'not_configured',
          lastTested: null
        };
      }

      // For now, if key exists and is active, assume connected
      // A full health check would require an actual API call
      return {
        status: 'connected',
        lastTested: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error checking ${service} health:`, error);
      return {
        status: 'error',
        lastTested: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test image generation with a specific provider
   */
  async testImageGeneration(userId: string, provider: string): Promise<{
    success: boolean;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: 'A simple test image of a blue circle on white background',
          userId,
          provider,
          width: 512,
          height: 512,
          isTest: true
        }
      });

      const latency = Date.now() - startTime;

      if (error) {
        return { success: false, latency, error: error.message };
      }

      if (!data?.success) {
        return { 
          success: false, 
          latency, 
          error: data?.error || 'Failed to generate test image' 
        };
      }

      return { success: true, latency };
    } catch (error) {
      return {
        success: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test video generation with a specific provider
   */
  async testVideoGeneration(userId: string, provider: string): Promise<{
    success: boolean;
    jobId?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          prompt: 'A simple animation test',
          userId,
          provider,
          duration: 2,
          isTest: true
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success && !data?.jobId) {
        return { 
          success: false, 
          error: data?.error || 'Failed to start test video generation' 
        };
      }

      return { 
        success: true, 
        jobId: data?.jobId 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get the best available image provider
   */
  async getBestImageProvider(userId: string): Promise<string | null> {
    const health = await this.checkAllProviders(userId);
    
    const connectedProvider = health.imageProviders.find(p => p.status === 'connected');
    return connectedProvider ? connectedProvider.provider : null;
  }

  /**
   * Get the best available video provider
   */
  async getBestVideoProvider(userId: string): Promise<string | null> {
    const health = await this.checkAllProviders(userId);
    
    const connectedProvider = health.videoProviders.find(p => p.status === 'connected');
    return connectedProvider ? connectedProvider.provider : null;
  }
}

export const mediaHealthService = new MediaHealthService();
